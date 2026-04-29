#!/usr/bin/env -S deno run --allow-read

type Stage = "plan" | "implementation" | "pr";
type Severity = "fail" | "warn";

type Issue = {
  severity: Severity;
  rule: string;
  message: string;
};

type Dependency = {
  repo: string;
  ref: string;
  reason: string;
};

type Repo = {
  name: string;
  path: string;
  visibility: string;
  branch: string;
  role: string;
  gitPreflight: Record<string, string>;
  dependsOn: Dependency[];
  localRules: string[];
  testCommands: string[];
};

const args = Deno.args;
const changeId = args.find((arg) => !arg.startsWith("--"));
const stageArg = args.find((arg) => arg.startsWith("--stage="));
const stage = (stageArg?.split("=")[1] ?? "plan") as Stage;
const checkGit = args.includes("--check-git");

if (!changeId || !["plan", "implementation", "pr"].includes(stage)) {
  console.error("Usage: deno run --allow-read .sdd/tools/validate-change.ts <change-id> [--stage=plan|implementation|pr] [--check-git]");
  Deno.exit(2);
}

const changeRoot = `.sdd/changes/${changeId}`;
const issues: Issue[] = [];
const passes: string[] = [];

function fail(rule: string, message: string) {
  issues.push({ severity: "fail", rule, message });
}

function warn(rule: string, message: string) {
  issues.push({ severity: "warn", rule, message });
}

function pass(rule: string) {
  if (!passes.includes(rule)) passes.push(rule);
}

async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
}

async function read(path: string): Promise<string> {
  try {
    return await Deno.readTextFile(path);
  } catch {
    fail("required-files", `missing or unreadable file: ${path}`);
    return "";
  }
}

function scalar(value: string): string {
  const withoutComment = value.replace(/\s+#.*$/, "").trim();
  if (
    (withoutComment.startsWith('"') && withoutComment.endsWith('"')) ||
    (withoutComment.startsWith("'") && withoutComment.endsWith("'"))
  ) {
    return withoutComment.slice(1, -1);
  }
  return withoutComment;
}

function parseReposYaml(text: string): Repo[] {
  const repos: Repo[] = [];
  let current: Repo | undefined;
  let section = "";
  let currentDep: Dependency | undefined;

  for (const line of text.split(/\r?\n/)) {
    const repoStart = line.match(/^  - name:\s*(.+)$/);
    if (repoStart) {
      current = {
        name: scalar(repoStart[1]),
        path: "",
        visibility: "",
        branch: "",
        role: "",
        gitPreflight: {},
        dependsOn: [],
        localRules: [],
        testCommands: [],
      };
      repos.push(current);
      section = "";
      currentDep = undefined;
      continue;
    }
    if (!current) continue;

    const sectionStart = line.match(/^    ([a-zA-Z_]+):\s*(.*)$/);
    if (sectionStart) {
      const key = sectionStart[1];
      const value = scalar(sectionStart[2]);
      if (key === "git_preflight" || key === "depends_on" || key === "local_rules" || key === "test_commands" || key === "pr") {
        section = key;
        currentDep = undefined;
        continue;
      }
      if (key === "path") current.path = value;
      if (key === "visibility") current.visibility = value;
      if (key === "branch") current.branch = value;
      if (key === "role") current.role = value;
      continue;
    }

    if (section === "git_preflight") {
      const field = line.match(/^      ([a-zA-Z_]+):\s*(.*)$/);
      if (field) current.gitPreflight[field[1]] = scalar(field[2]);
      continue;
    }

    if (section === "depends_on") {
      const depStart = line.match(/^      - repo:\s*(.*)$/);
      if (depStart) {
        currentDep = { repo: scalar(depStart[1]), ref: "", reason: "" };
        current.dependsOn.push(currentDep);
        continue;
      }
      const depField = line.match(/^        (ref|reason):\s*(.*)$/);
      if (depField && currentDep) {
        currentDep[depField[1] as "ref" | "reason"] = scalar(depField[2]);
      }
      continue;
    }

    if (section === "local_rules") {
      const item = line.match(/^      -\s*(.*)$/);
      if (item) current.localRules.push(scalar(item[1]));
      continue;
    }

    if (section === "test_commands") {
      const item = line.match(/^      -\s*(.*)$/);
      if (item) current.testCommands.push(scalar(item[1]));
    }
  }

  return repos;
}

function isPlaceholder(value: string): boolean {
  return !value ||
    value.includes("<") ||
    value.includes(">") ||
    /\b(TBD|TODO|pending|fixme)\b/i.test(value);
}

function findPrIds(text: string): Set<string> {
  return new Set([...text.matchAll(/\bPR-[0-9]+[a-z]?\b/g)].map((match) => match[0]));
}

async function validateGitState(repos: Repo[]) {
  if (!checkGit) return;

  for (const repo of repos) {
    try {
      const command = new Deno.Command("git", {
        args: ["-C", repo.path, "status", "-sb"],
        stdout: "piped",
        stderr: "piped",
      });
      const output = await command.output();
      if (!output.success) {
        warn("git-state", `${repo.name}: unable to run git status`);
        continue;
      }
      const status = new TextDecoder().decode(output.stdout).trim();
      const branch = status.match(/^##\s+([^\s.]+)/)?.[1] ?? "";
      const dirty = status.split(/\r?\n/).length > 1;
      const recordedBranch = repo.gitPreflight.current_branch;
      const recordedStatus = repo.gitPreflight.status;

      if (recordedBranch && branch && recordedBranch !== branch) {
        warn("git-state", `${repo.name}: recorded branch ${recordedBranch} differs from actual ${branch}`);
      }
      if (recordedStatus && ["clean", "dirty"].includes(recordedStatus)) {
        const actualStatus = dirty ? "dirty" : "clean";
        if (recordedStatus !== actualStatus) {
          warn("git-state", `${repo.name}: recorded status ${recordedStatus} differs from actual ${actualStatus}`);
        }
      }
    } catch {
      warn("git-state", `${repo.name}: --check-git requires --allow-run permission`);
      return;
    }
  }
}

const requiredFiles = ["proposal.md", "discovery.md", "design.md", "plan.md", "repos.yaml", "tasks.md"];
const missingRequired = [];
for (const file of requiredFiles) {
  if (!(await exists(`${changeRoot}/${file}`))) missingRequired.push(file);
}
if (missingRequired.length > 0) {
  fail("required-files", `missing: ${missingRequired.join(", ")}`);
} else {
  pass("required-files");
}

const proposal = await read(`${changeRoot}/proposal.md`);
const discovery = await read(`${changeRoot}/discovery.md`);
const design = await read(`${changeRoot}/design.md`);
const plan = await read(`${changeRoot}/plan.md`);
const reposYaml = await read(`${changeRoot}/repos.yaml`);
const tasks = await read(`${changeRoot}/tasks.md`);
const repos = parseReposYaml(reposYaml);

if (repos.length === 0) {
  fail("repos-yaml", "repos.yaml has no repos entries");
} else {
  pass("repos-yaml");
}

for (const repo of repos) {
  for (const field of ["name", "path", "visibility", "branch", "role"] as const) {
    if (!repo[field]) fail("repo-fields", `${repo.name || "<unknown>"} missing ${field}`);
  }
  if (repo.visibility === "unknown") {
    fail("repo-visibility", `${repo.name}: visibility is unknown`);
  }
  if (repo.path && !(await exists(repo.path))) {
    fail("repo-paths", `${repo.name}: path does not exist: ${repo.path}`);
  }
}
if (!issues.some((issue) => issue.rule === "repo-fields")) pass("repo-fields");
if (!issues.some((issue) => issue.rule === "repo-visibility")) pass("repo-visibility");
if (!issues.some((issue) => issue.rule === "repo-paths")) pass("repo-paths");

for (const repo of repos) {
  const agentPacket = `${changeRoot}/agents/${repo.name}.md`;
  if (!(await exists(agentPacket))) fail("agent-packets", `${repo.name}: missing ${agentPacket}`);
  const report = `${changeRoot}/reports/${repo.name}.md`;
  if ((stage === "implementation" || stage === "pr") && !(await exists(report))) {
    fail("repo-reports", `${repo.name}: missing ${report}`);
  }
}
if (!issues.some((issue) => issue.rule === "agent-packets")) pass("agent-packets");
if (stage === "plan" || !issues.some((issue) => issue.rule === "repo-reports")) pass("repo-reports");

const preflightFields = [
  "current_branch",
  "base_or_target_branch",
  "status",
  "existing_changes",
  "untracked",
  "preservation_plan",
];
for (const repo of repos) {
  for (const field of preflightFields) {
    if (!(field in repo.gitPreflight) || repo.gitPreflight[field] === "") {
      fail("git-preflight", `${repo.name}: missing git_preflight.${field}`);
    }
  }
  if (repo.gitPreflight.status && !["clean", "dirty", "unknown"].includes(repo.gitPreflight.status)) {
    fail("git-preflight", `${repo.name}: invalid git_preflight.status=${repo.gitPreflight.status}`);
  }
  if (repo.gitPreflight.status === "dirty" && !repo.gitPreflight.preservation_plan) {
    fail("git-preflight", `${repo.name}: dirty status requires preservation_plan`);
  }
}
if (!issues.some((issue) => issue.rule === "git-preflight")) pass("git-preflight");

for (const repo of repos) {
  if (repo.localRules.length === 0) {
    warn("local-rules", `${repo.name}: no repo-local AGENTS.md/CLAUDE.md listed`);
  }
  for (const rulePath of repo.localRules) {
    if (!(await exists(rulePath))) {
      fail("local-rules", `${repo.name}: listed local rule does not exist: ${rulePath}`);
    }
  }
}
if (!issues.some((issue) => issue.rule === "local-rules" && issue.severity === "fail")) pass("local-rules");

for (const repo of repos) {
  for (const dep of repo.dependsOn) {
    if (!dep.repo || !dep.reason) {
      fail("depends-on", `${repo.name}: dependency must include repo and reason`);
    }
    if (isPlaceholder(dep.ref)) {
      const message = `${repo.name}: dependency ${dep.repo} has placeholder ref (${dep.ref || "empty"})`;
      if (stage === "plan") warn("depends-on", `${message}; must be fixed before downstream implementation`);
      else fail("depends-on", message);
    }
  }
}
if (!issues.some((issue) => issue.rule === "depends-on" && issue.severity === "fail")) pass("depends-on");

const repoPrCount = repos.length;
if (/PR\s*1개|1개\s*PR/i.test(proposal) && repoPrCount > 1) {
  fail("pr-consistency", `proposal describes a single PR, but repos.yaml defines ${repoPrCount} repo PRs`);
}
const planPrIds = findPrIds(plan);
const completion = plan.split(/## 완료 기준/)[1] ?? "";
for (const prId of planPrIds) {
  if (!completion.includes(prId) && /PR 계획/.test(plan)) {
    fail("completion-criteria", `plan completion criteria does not mention ${prId}`);
  }
}
if (!issues.some((issue) => issue.rule === "pr-consistency")) pass("pr-consistency");
if (!issues.some((issue) => issue.rule === "completion-criteria")) pass("completion-criteria");

if (/Flyway migration 불필요|migration 불필요|마이그레이션 불필요/.test(design)) {
  for (const [file, text] of [["plan.md", plan], ["tasks.md", tasks]] as const) {
    const staleMigrationLines = text
      .split(/\r?\n/)
      .filter((line) => /Flyway migration|마이그레이션/.test(line))
      .filter((line) => !/불필요|없으면|unnecessary|not required/i.test(line));
    if (staleMigrationLines.length > 0) {
      fail("migration-consistency", `${file}: has stale migration task: ${staleMigrationLines[0].trim()}`);
    }
  }
}
if (!issues.some((issue) => issue.rule === "migration-consistency")) pass("migration-consistency");

const plannedPaths = repos.map((repo) => repo.path);
for (const [file, text] of [["proposal.md", proposal], ["design.md", design], ["plan.md", plan], ["tasks.md", tasks]] as const) {
  for (const match of text.matchAll(/`(apps\/[^`]+|services\/[^`]+)`/g)) {
    const path = match[1];
    const isPlanned = plannedPaths.some((plannedPath) => path === plannedPath || path.startsWith(`${plannedPath}/`));
    const isExplicitlyExcluded = /Non-goal|제외|no \|/.test(text.slice(Math.max(0, match.index - 200), match.index + 200));
    if (!isPlanned && !isExplicitlyExcluded) {
      warn("unplanned-repo-reference", `${file}: references unplanned repo path ${path}`);
    }
  }
}
pass("unplanned-repo-reference");

if (stage === "implementation" || stage === "pr") {
  if (!/상태:\s*(approved|in-progress|verified|completed)/.test(plan)) {
    fail("plan-status", "implementation/pr stages require plan status approved, in-progress, verified, or completed");
  }
} else {
  pass("plan-status");
}

if (stage === "pr") {
  if (/pending/.test(plan) || /pending/.test(tasks)) {
    fail("quality-gates", "pr stage cannot contain pending quality gates/tasks");
  }
} else {
  pass("quality-gates");
}

await validateGitState(repos);

const failures = issues.filter((issue) => issue.severity === "fail");
const warnings = issues.filter((issue) => issue.severity === "warn");

console.log(`Validating ${changeRoot} at stage=${stage}`);
console.log("");
for (const rule of passes.sort()) {
  console.log(`PASS ${rule}`);
}
for (const issue of warnings) {
  console.log(`WARN ${issue.rule}`);
  console.log(`  ${issue.message}`);
}
for (const issue of failures) {
  console.log(`FAIL ${issue.rule}`);
  console.log(`  ${issue.message}`);
}
console.log("");

if (failures.length > 0) {
  console.log(`RESULT failed: ${failures.length} blocking issue(s), ${warnings.length} warning(s)`);
  Deno.exit(1);
}

console.log(`RESULT passed: ${warnings.length} warning(s)`);
