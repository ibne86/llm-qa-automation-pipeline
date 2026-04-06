import fs from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function slugify(value) {
  return String(value || "story")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "story";
}

async function safeReadJson(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function safeCopy(sourcePath, destinationPath) {
  try {
    await fs.copyFile(sourcePath, destinationPath);
    return true;
  } catch {
    return false;
  }
}

async function safeDelete(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore missing files so each story run starts cleanly.
  }
}

async function listStoryFiles(storiesDir) {
  const entries = await fs.readdir(storiesDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /\.(txt|md)$/i.test(entry.name))
    .map((entry) => path.join(storiesDir, entry.name))
    .sort();
}

async function runStory(projectRoot, storyPath, runDir) {
  const storyName = path.basename(storyPath);
  const storySlug = slugify(storyName);
  const storyRunDir = path.join(runDir, storySlug);

  await fs.mkdir(storyRunDir, { recursive: true });

  let commandResult;
  let commandFailed = false;

  const executionReportPath = path.join(projectRoot, "reports", "execution-result.json");
  const bugSummaryJsonPath = path.join(projectRoot, "reports", "bug-summary.json");
  const bugSummaryMdPath = path.join(projectRoot, "reports", "bug-summary.md");

  await Promise.all([
    safeDelete(executionReportPath),
    safeDelete(bugSummaryJsonPath),
    safeDelete(bugSummaryMdPath),
  ]);

  try {
    commandResult = await execFile(
      process.execPath,
      ["scripts/run-agent.js", "--story", storyPath],
      { cwd: projectRoot, env: process.env, maxBuffer: 20 * 1024 * 1024 }
    );
  } catch (error) {
    commandFailed = true;
    commandResult = {
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? error.message ?? "",
      exitCode: typeof error.code === "number" ? error.code : 1,
    };
  }

  const executionReport = await safeReadJson(executionReportPath);
  const bugSummary = await safeReadJson(bugSummaryJsonPath);

  await fs.writeFile(
    path.join(storyRunDir, "command-output.log"),
    [
      `Story: ${storyName}`,
      `Command exit code: ${commandResult.exitCode ?? 0}`,
      "",
      "--- stdout ---",
      commandResult.stdout || "",
      "",
      "--- stderr ---",
      commandResult.stderr || "",
      "",
    ].join("\n"),
    "utf8"
  );

  await safeCopy(executionReportPath, path.join(storyRunDir, "execution-result.json"));
  await safeCopy(bugSummaryJsonPath, path.join(storyRunDir, "bug-summary.json"));
  await safeCopy(bugSummaryMdPath, path.join(storyRunDir, "bug-summary.md"));

  return {
    storyName,
    storySlug,
    storyPath: path.relative(projectRoot, storyPath),
    commandExitCode: commandResult.exitCode ?? 0,
    commandFailed,
    executionSuccess: executionReport?.success ?? false,
    realBug: executionReport?.analysis?.isRealBug ?? bugSummary?.is_real_bug ?? false,
    issueCreated: executionReport?.analysis?.issueCreated ?? false,
    issueUrl: executionReport?.analysis?.issueUrl ?? "",
    reportDir: path.relative(projectRoot, storyRunDir),
  };
}

async function main() {
  const projectRoot = process.cwd();
  const storiesDir = path.resolve(getArg("--storiesDir") || "stories/regression");
  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = path.join(projectRoot, "reports", "history", runId);
  const latestDir = path.join(projectRoot, "reports", "history", "latest");

  const storyFiles = await listStoryFiles(storiesDir);
  if (storyFiles.length === 0) {
    throw new Error(`No sample stories found in ${storiesDir}`);
  }

  await fs.mkdir(runDir, { recursive: true });
  await fs.mkdir(latestDir, { recursive: true });

  const results = [];
  for (const storyPath of storyFiles) {
    console.log(`Running agent for sample story: ${path.basename(storyPath)}`);
    const result = await runStory(projectRoot, storyPath, runDir);
    results.push(result);
  }

  const summary = {
    runId,
    generatedAt: new Date().toISOString(),
    storiesDirectory: path.relative(projectRoot, storiesDir),
    totalStories: results.length,
    executionPassed: results.filter((item) => item.executionSuccess).length,
    executionFailed: results.filter((item) => !item.executionSuccess).length,
    realBugsFound: results.filter((item) => item.realBug).length,
    issuesCreated: results.filter((item) => item.issueCreated).length,
    infrastructureFailures: results.filter((item) => item.commandFailed).length,
    stories: results,
  };

  const runSummaryPath = path.join(runDir, "run-summary.json");
  const latestSummaryPath = path.join(latestDir, "run-summary.json");

  await fs.writeFile(runSummaryPath, JSON.stringify(summary, null, 2), "utf8");
  await fs.writeFile(latestSummaryPath, JSON.stringify(summary, null, 2), "utf8");

  console.log(`Sample story summary saved to: ${path.relative(projectRoot, runSummaryPath)}`);

  if (summary.infrastructureFailures > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
