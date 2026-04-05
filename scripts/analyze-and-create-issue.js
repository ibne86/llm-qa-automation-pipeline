import dotenv from "dotenv";
dotenv.config({ override: true });

import fs from "node:fs/promises";
import path from "node:path";

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function extractText(content) {
  if (!Array.isArray(content)) return "";
  return content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

function stripCodeFence(text) {
  return text
    .replace(/^```(?:json|markdown|md|txt)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractJson(text) {
  const cleaned = stripCodeFence(text);
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("Claude analysis did not return a JSON object.");
  }
  return JSON.parse(cleaned.slice(first, last + 1));
}

function extractAttachmentPath(stdout, kind, extension) {
  const pattern = new RegExp(
    `attachment\\s+#\\d+:\\s+${kind}[\\s\\S]*?\\n\\s*([^\\n\\r]+\\${extension})`,
    "i"
  );
  const match = stdout.match(pattern);
  return match ? match[1].trim() : "";
}

function toMarkdown(summary) {
  const steps = (summary.steps_to_reproduce || [])
    .map((step, i) => `${i + 1}. ${step}`)
    .join("\n");

  return `# ${summary.title}

## Description
${summary.description}

## Severity
${summary.severity}

## Steps to reproduce
${steps}

## Expected result
${summary.expected_result}

## Actual result
${summary.actual_result}

## Attachment
${summary.screenshot_path ? `- Screenshot: \`${summary.screenshot_path}\`` : "- Screenshot: not available"}
`;
}

function buildGitHubIssueBody(summary) {
  const steps = (summary.steps_to_reproduce || [])
    .map((step, i) => `${i + 1}. ${step}`)
    .join("\n");

  return `## Description
${summary.description}

## Severity
${summary.severity}

## Steps to reproduce
${steps}

## Expected result
${summary.expected_result}

## Actual result
${summary.actual_result}

## Attachment
${summary.screenshot_path ? `- Screenshot path: \`${summary.screenshot_path}\`` : "- Screenshot: not available"}
`;
}

async function createGitHubIssue(summary) {
  const token = (process.env.GITHUB_TOKEN || "").trim();
  const owner = (process.env.GITHUB_OWNER || "").trim();
  const repo = (process.env.GITHUB_REPO || "").trim();

  if (!token || !owner || !repo) {
    return {
      created: false,
      reason: "Missing GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO",
    };
  }

  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const issueUrl = `${repoUrl}/issues`;

  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "user-agent": "ai-test-agent",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Preflight repo access check
  const repoCheck = await fetch(repoUrl, {
    method: "GET",
    headers,
  });

  if (!repoCheck.ok) {
    const repoErrorText = await repoCheck.text();
    return {
      created: false,
      reason: `GitHub repo access check failed: ${repoCheck.status} ${repoErrorText}`,
    };
  }

  const response = await fetch(issueUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: summary.title,
      body: buildGitHubIssueBody(summary),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      created: false,
      reason: `GitHub issue creation failed: ${response.status} ${errorText}`,
    };
  }

  const data = await response.json();

  return {
    created: true,
    issueNumber: data.number,
    issueUrl: data.html_url,
  };
}

async function main() {
  const storyPathInput = getArg("--story");
  const reportPathInput = getArg("--report");

  if (!storyPathInput) {
    throw new Error('Provide --story "path-to-story-file"');
  }

  if (!reportPathInput) {
    throw new Error('Provide --report "path-to-execution-result.json"');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in this terminal session.");
  }

  const storyPath = path.resolve(storyPathInput);
  const reportPath = path.resolve(reportPathInput);
  const projectRoot = process.cwd();

  const story = await fs.readFile(storyPath, "utf8");
  const report = JSON.parse(await fs.readFile(reportPath, "utf8"));

  const screenshotRelativePath = extractAttachmentPath(report.stdout || "", "screenshot", ".png");
  const screenshotAbsolutePath = screenshotRelativePath
    ? path.resolve(projectRoot, screenshotRelativePath)
    : "";

  const videoRelativePath = extractAttachmentPath(report.stdout || "", "video", ".webm");
  const videoAbsolutePath = videoRelativePath
    ? path.resolve(projectRoot, videoRelativePath)
    : "";

  const traceRelativePath = extractAttachmentPath(report.stdout || "", "trace", ".zip");
  const traceAbsolutePath = traceRelativePath
    ? path.resolve(projectRoot, traceRelativePath)
    : "";

  const systemPrompt = `
You are a senior QA bug triage assistant.

Decide whether the failure is a real product bug or not.

Classify as a real bug when:
- the generated tests executed successfully at the framework level
- the failure is due to the application not meeting expected behavior
- the failure is an assertion failure against expected business behavior

Do NOT classify as a real bug when the failure is due to:
- import errors
- missing files
- invalid generated code
- locator not found because of guessed selectors
- Playwright runner or environment issues
- process spawn or setup errors

Return JSON only with this exact shape:
{
  "is_real_bug": true,
  "title": "",
  "description": "",
  "severity": "Low|Medium|High|Critical",
  "steps_to_reproduce": ["", "", "", ""],
  "expected_result": "",
  "actual_result": ""
}
`;

  const userPrompt = `
User story:
${story}

Execution result JSON:
${JSON.stringify(report, null, 2)}

Known local artifacts:
- Screenshot path: ${screenshotAbsolutePath || "not available"}
- Video path: ${videoAbsolutePath || "not available"}
- Trace path: ${traceAbsolutePath || "not available"}

Task:
1. Decide whether this is a real product bug
2. If it is a real bug, produce the bug summary in the required JSON format
3. Use the screenshot path in your reasoning, but do not include fields outside the required JSON
`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1800,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const analysisText = extractText(data.content);
  const analysis = extractJson(analysisText);

  const reportsDir = path.resolve(projectRoot, "reports");
  await fs.mkdir(reportsDir, { recursive: true });

  const bugSummary = {
    ...analysis,
    screenshot_path: screenshotAbsolutePath || "",
  };

  const bugSummaryJsonPath = path.resolve(reportsDir, "bug-summary.json");
  const bugSummaryMdPath = path.resolve(reportsDir, "bug-summary.md");

  await fs.writeFile(
    bugSummaryJsonPath,
    JSON.stringify(bugSummary, null, 2),
    "utf8"
  );

  await fs.writeFile(
    bugSummaryMdPath,
    toMarkdown(bugSummary),
    "utf8"
  );

  let issueResult = {
    created: false,
    reason: "No issue created",
  };

  if (bugSummary.is_real_bug) {
    issueResult = await createGitHubIssue(bugSummary);
  }

  const updatedReport = {
    ...report,
    analysis: {
      isRealBug: bugSummary.is_real_bug,
      bugSummaryJsonPath,
      bugSummaryMdPath,
      screenshotPath: screenshotAbsolutePath || "",
      issueNumber: issueResult.issueNumber || null,
      issueUrl: issueResult.issueUrl || "",
      issueCreated: issueResult.created || false,
      issueReason: issueResult.reason || "",
    },
  };

  await fs.writeFile(
    reportPath,
    JSON.stringify(updatedReport, null, 2),
    "utf8"
  );

  console.log(`Bug summary JSON saved to: ${bugSummaryJsonPath}`);
  console.log(`Bug summary Markdown saved to: ${bugSummaryMdPath}`);

  if (issueResult.created) {
    console.log(`GitHub issue created: ${issueResult.issueUrl}`);
  } else {
    console.log(`GitHub issue not created: ${issueResult.reason}`);
  }

  console.log(`Execution report updated: ${reportPath}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});