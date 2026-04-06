import dotenv from "dotenv";
dotenv.config({ override: true });

import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

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

function clampSentences(text, maxSentences) {
  const normalized = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";

  const sentences = normalized.match(/[^.!?]+[.!?]?/g) || [normalized];
  return sentences.slice(0, maxSentences).join(" ").trim();
}

function normalizeBugSummary(analysis, screenshotPath) {
  const summarySource =
    analysis.summary ||
    analysis.title ||
    analysis.description ||
    "Application behavior does not match the expected result.";

  return {
    ...analysis,
    summary: clampSentences(summarySource, 1),
    severity: analysis.severity || "Medium",
    steps_to_reproduce: Array.isArray(analysis.steps_to_reproduce)
      ? analysis.steps_to_reproduce
      : [],
    expected_result: analysis.expected_result || "",
    actual_result: analysis.actual_result || "",
    screenshot_path: screenshotPath || "",
  };
}

function slugify(text) {
  return String(text || "issue")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function getDefaultBranch(headers, owner, repo) {
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const response = await fetch(repoUrl, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Unable to determine default branch: ${response.status}`);
  }

  const data = await response.json();
  return data.default_branch || "main";
}

async function uploadFileToRepo({
  owner,
  repo,
  token,
  repoPath,
  absoluteFilePath,
  commitMessage,
  branch,
}) {
  const contentBuffer = await fs.readFile(absoluteFilePath);
  const contentBase64 = contentBuffer.toString("base64");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "llm-qa-automation-pipeline",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: commitMessage,
      content: contentBase64,
      branch,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Screenshot upload failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    apiResponse: data,
    githubBlobUrl: data.content?.html_url || "",
    rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${repoPath}`,
    repoPath,
  };
}

async function uploadScreenshotToRepo(summary, screenshotAbsolutePath) {
  const token = (process.env.GITHUB_TOKEN || "").trim();
  const owner = (process.env.GITHUB_OWNER || "").trim();
  const repo = (process.env.GITHUB_REPO || "").trim();

  if (!token || !owner || !repo || !screenshotAbsolutePath) {
    return null;
  }

  const headers = {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "user-agent": "llm-qa-automation-pipeline",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const branch =
    (process.env.GITHUB_UPLOAD_BRANCH || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || "").trim() ||
    await getDefaultBranch(headers, owner, repo);
  const ext = path.extname(screenshotAbsolutePath) || ".png";
  const fileName = `${Date.now()}-${slugify(summary.title)}${ext}`;
  const repoPath = `artifacts/screenshots/${fileName}`;

  return uploadFileToRepo({
    owner,
    repo,
    token,
    repoPath,
    absoluteFilePath: screenshotAbsolutePath,
    commitMessage: `Add failure screenshot for issue: ${summary.title}`,
    branch,
  });
}

function normalizeFingerprintPart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildBugFingerprint(summary) {
  const rawFingerprint = [
    normalizeFingerprintPart(summary.title),
    normalizeFingerprintPart(summary.summary),
    normalizeFingerprintPart(summary.expected_result),
    normalizeFingerprintPart(summary.actual_result),
  ].join(" | ");

  return createHash("sha256").update(rawFingerprint).digest("hex").slice(0, 24);
}

function getSourceContext() {
  const branch =
    process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || "local";
  const sha = process.env.GITHUB_SHA || "local";
  const repository = process.env.GITHUB_REPOSITORY || "local";
  const runId = process.env.GITHUB_RUN_ID || "";
  const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
  const runUrl = runId && repository
    ? `${serverUrl}/${repository}/actions/runs/${runId}`
    : "";

  return {
    branch,
    sha,
    repository,
    runUrl,
  };
}

function buildFingerprintMarker(fingerprint) {
  return `<!-- bug-fingerprint:${fingerprint} -->`;
}

function toMarkdown(summary) {
  const steps = (summary.steps_to_reproduce || [])
    .map((step, i) => `${i + 1}. ${step}`)
    .join("\n");

  const attachmentSection = summary.screenshot_url
    ? `## Attachment\n![Failure screenshot](${summary.screenshot_url})\n\n[Open screenshot](${summary.screenshot_url})`
    : summary.screenshot_path
      ? `## Attachment\n- Screenshot path: \`${summary.screenshot_path}\``
      : `## Attachment\n- Screenshot: not available`;

  return `# ${summary.title}\n\n## Summary\n${summary.summary}\n\n## Description\n${summary.description}\n\n## Severity\n${summary.severity}\n\n## Steps to reproduce\n${steps}\n\n## Expected result\n${summary.expected_result}\n\n## Actual result\n${summary.actual_result}\n\n${attachmentSection}\n`;
}

function buildGitHubIssueBody(summary, fingerprint) {
  const steps = (summary.steps_to_reproduce || [])
    .map((step, i) => `${i + 1}. ${step}`)
    .join("\n");

  const attachmentSection = summary.screenshot_url
    ? `## Attachment\n![Failure screenshot](${summary.screenshot_url})\n\n[Open screenshot](${summary.screenshot_url})`
    : summary.screenshot_path
      ? `## Attachment\n- Screenshot path: \`${summary.screenshot_path}\``
      : `## Attachment\n- Screenshot: not available`;

  const source = getSourceContext();
  const runSection = source.runUrl
    ? `- Workflow run: ${source.runUrl}`
    : "- Workflow run: not available";

  return `## Summary\n${summary.summary}\n\n## Description\n${summary.description}\n\n## Severity\n${summary.severity}\n\n## Steps to reproduce\n${steps}\n\n## Expected result\n${summary.expected_result}\n\n## Actual result\n${summary.actual_result}\n\n## CI Context\n- Branch: ${source.branch}\n- Commit: ${source.sha}\n${runSection}\n\n${attachmentSection}\n\n${buildFingerprintMarker(fingerprint)}\n`;
}

async function findExistingOpenIssueByFingerprint({ owner, repo, token, fingerprint }) {
  const query = encodeURIComponent(
    `repo:${owner}/${repo} is:issue is:open in:body "bug-fingerprint:${fingerprint}"`
  );
  const url = `https://api.github.com/search/issues?q=${query}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "user-agent": "llm-qa-automation-pipeline",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub issue search failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const existing = Array.isArray(data.items) ? data.items[0] : null;

  if (!existing) {
    return null;
  }

  return {
    issueNumber: existing.number,
    issueUrl: existing.html_url,
    title: existing.title,
  };
}

async function createGitHubIssue(summary) {
  const token = (process.env.GITHUB_TOKEN || "").trim();
  const owner = (process.env.GITHUB_OWNER || "").trim();
  const repo = (process.env.GITHUB_REPO || "").trim();
  const fingerprint = buildBugFingerprint(summary);

  if (!token || !owner || !repo) {
    return {
      created: false,
      fingerprint,
      reason: "Missing GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO",
    };
  }

  try {
    const existingIssue = await findExistingOpenIssueByFingerprint({
      owner,
      repo,
      token,
      fingerprint,
    });

    if (existingIssue) {
      return {
        created: false,
        fingerprint,
        duplicate: true,
        issueNumber: existingIssue.issueNumber,
        issueUrl: existingIssue.issueUrl,
        reason: `Matching open issue already exists: #${existingIssue.issueNumber}`,
      };
    }
  } catch (error) {
    return {
      created: false,
      fingerprint,
      reason: error.message,
    };
  }

  const issueUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "user-agent": "llm-qa-automation-pipeline",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const response = await fetch(issueUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: summary.title,
      body: buildGitHubIssueBody(summary, fingerprint),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      created: false,
      fingerprint,
      reason: `GitHub issue creation failed: ${response.status} ${errorText}`,
    };
  }

  const data = await response.json();

  return {
    created: true,
    fingerprint,
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
  const issuePromptPath = path.resolve(projectRoot, "prompts", "create-github-issue.md");
  const issuePromptTemplate = await fs.readFile(issuePromptPath, "utf8");

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
You are analyzing an automated test failure and preparing a GitHub issue when it is a real product bug.

Decide whether the failure is a real product bug or not.

Classify as a real bug when:
- the tests executed successfully at the framework level
- the failure is due to the application not meeting expected behavior
- the failure is an assertion failure against expected business behavior

Do NOT classify as a real bug when the failure is due to:
- import errors
- missing files
- invalid generated code
- locator problems caused by wrong selectors
- Playwright runner or environment issues
- setup or process errors

Use the following issue-writing instructions exactly:

${issuePromptTemplate}

Return JSON only with this exact shape:
{
  "is_real_bug": true,
  "title": "",
  "summary": "",
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

  if (!analysis.summary) {
    analysis.summary = analysis.title || analysis.description || "";
  }

  const reportsDir = path.resolve(projectRoot, "reports");
  await fs.mkdir(reportsDir, { recursive: true });

  const bugSummary = normalizeBugSummary(
    analysis,
    screenshotAbsolutePath || ""
  );

  if (bugSummary.is_real_bug && screenshotAbsolutePath) {
    try {
      const uploadedScreenshot = await uploadScreenshotToRepo(
        bugSummary,
        screenshotAbsolutePath
      );

      if (uploadedScreenshot?.rawUrl) {
        bugSummary.screenshot_url = uploadedScreenshot.rawUrl;
        bugSummary.screenshot_repo_path = uploadedScreenshot.repoPath;
      }
    } catch (error) {
      console.error(`Screenshot upload skipped: ${error.message}`);
    }
  }

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
    fingerprint: buildBugFingerprint(bugSummary),
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
      screenshotUrl: bugSummary.screenshot_url || "",
      screenshotRepoPath: bugSummary.screenshot_repo_path || "",
      issueNumber: issueResult.issueNumber || null,
      issueUrl: issueResult.issueUrl || "",
      issueCreated: issueResult.created || false,
      issueReason: issueResult.reason || "",
      duplicateIssue: issueResult.duplicate || false,
      bugFingerprint: issueResult.fingerprint || buildBugFingerprint(bugSummary),
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

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
