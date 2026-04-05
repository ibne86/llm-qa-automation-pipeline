import dotenv from "dotenv";
dotenv.config({ override: true });

import fs from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

const APP_URL = "http://127.0.0.1:4173";
const SELECTOR_MAP_OUTPUT = path.resolve("reports", "selector-map.json");

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

function stripOuterCodeFence(text) {
  return text
    .replace(/^```(?:javascript|js|txt)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseExpectedCredentialsFromStory(story) {
  const emailMatch = story.match(/valid email:\s*(.+)/i);
  const passwordMatch = story.match(/valid password:\s*(.+)/i);

  if (!emailMatch || !passwordMatch) {
    throw new Error(
      "Could not find 'valid email:' and 'valid password:' in the story file."
    );
  }

  return {
    email: emailMatch[1].trim(),
    password: passwordMatch[1].trim(),
  };
}

function parseExpectedMessagesFromStory(story) {
  const successMatch = story.match(/Success is indicated by the message:\s*"([^"]+)"/i);
  const failureMatch = story.match(/Failure is indicated by the message:\s*"([^"]+)"/i);

  return {
    successMessage: successMatch?.[1]?.trim() || "Login successful. Welcome back.",
    failureMessage: failureMatch?.[1]?.trim() || "Invalid email or password.",
  };
}

async function runUiInspection(projectRoot, appUrl, outputPath) {
  await execFile(
    process.execPath,
    ["scripts/inspect-ui.js", "--url", appUrl, "--out", outputPath],
    { cwd: projectRoot }
  );
}

function buildLocatorExpression(selector) {
  if (!selector) {
    throw new Error("Missing selector information while building page object.");
  }

  if (selector.testId) {
    return `page.getByTestId(${JSON.stringify(selector.testId)})`;
  }

  if (selector.label) {
    return `page.getByLabel(${JSON.stringify(selector.label)})`;
  }

  if (selector.text) {
    return `page.getByRole('button', { name: ${JSON.stringify(selector.text)} })`;
  }

  if (selector.type === "submit") {
    return `page.locator('button[type="submit"], input[type="submit"]')`;
  }

  throw new Error("Could not build a reliable locator expression.");
}

function buildPageObjectCode(selectorMap, messages) {
  const emailInputExpr = buildLocatorExpression(selectorMap.emailInput);
  const passwordInputExpr = buildLocatorExpression(selectorMap.passwordInput);
  const submitButtonExpr = buildLocatorExpression(selectorMap.submitButton);

  return `import { expect } from "@playwright/test";

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = ${emailInputExpr};
    this.passwordInput = ${passwordInputExpr};
    this.submitButton = ${submitButtonExpr};
    this.successMessage = page.getByText(${JSON.stringify(messages.successMessage)}, { exact: true });
    this.errorMessage = page.getByText(${JSON.stringify(messages.failureMessage)}, { exact: true });
  }

  async navigate() {
    await this.page.goto(${JSON.stringify(APP_URL)});
  }

  async enterEmail(email) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(email, password) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.submit();
  }

  async assertLoginSuccess() {
    await expect(this.successMessage).toBeVisible();
    await expect(this.errorMessage).not.toBeVisible();
  }

  async assertLoginFailure() {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.successMessage).not.toBeVisible();
  }
}
`;
}

function validateGeneratedSpec(specText, story) {
  const normalized = specText.replace(/\r\n/g, "\n").trim();
  const { email, password } = parseExpectedCredentialsFromStory(story);

  if (!normalized) {
    throw new Error("Generated spec validation failed: spec file is empty.");
  }

  if (/^FILE:\s*/m.test(normalized)) {
    throw new Error(
      "Generated spec validation failed: FILE header was not stripped from the spec output."
    );
  }

  const hasPlaywrightImport =
    /import\s+\{[^}]*\btest\b[^}]*\}\s+from\s+['"]@playwright\/test['"]\s*;?/m.test(normalized);

  if (!hasPlaywrightImport) {
    throw new Error(
      "Generated spec validation failed: missing 'test' import from @playwright/test."
    );
  }

  const hasLoginPageImport =
    /import\s+\{\s*LoginPage\s*\}\s+from\s+['"]\.\.\/pages\/LoginPage\.js['"]\s*;?/m.test(normalized);

  if (!hasLoginPageImport) {
    throw new Error(
      "Generated spec validation failed: missing named LoginPage import from ../pages/LoginPage.js."
    );
  }

  const testCount = (normalized.match(/\btest\s*\(/g) || []).length;
  if (testCount !== 2) {
    throw new Error(
      `Generated spec validation failed: expected exactly 2 tests, but found ${testCount}.`
    );
  }

  if (!/new\s+LoginPage\s*\(/.test(normalized)) {
    throw new Error(
      "Generated spec validation failed: spec does not create a LoginPage instance."
    );
  }

  if (!/loginPage\.navigate\s*\(/.test(normalized)) {
    throw new Error(
      "Generated spec validation failed: spec does not navigate using LoginPage.navigate()."
    );
  }

  if (!/loginPage\.login\s*\(/.test(normalized)) {
    throw new Error(
      "Generated spec validation failed: spec does not call LoginPage.login()."
    );
  }

  if (!/loginPage\.assertLoginSuccess\s*\(/.test(normalized)) {
    throw new Error(
      "Generated spec validation failed: spec does not call LoginPage.assertLoginSuccess()."
    );
  }

  if (!/loginPage\.assertLoginFailure\s*\(/.test(normalized)) {
    throw new Error(
      "Generated spec validation failed: spec does not call LoginPage.assertLoginFailure()."
    );
  }

  if (/getByRole|getByLabel|getByTestId|locator\s*\(/.test(normalized)) {
    throw new Error(
      "Generated spec validation failed: locators should not be defined in the spec file."
    );
  }

  if (!normalized.includes(email) || !normalized.includes(password)) {
    throw new Error(
      "Generated spec validation failed: story credentials were not used."
    );
  }

  const forbiddenPatterns = [
    /user@example\.com/i,
    /validPassword123/i,
    /example@example\.com/i,
    /demo@example\.com/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(normalized)) {
      throw new Error(
        `Generated spec validation failed: placeholder credential matching ${pattern} was found.`
      );
    }
  }
}

async function runPlaywrightTest(projectRoot, specPath) {
  const playwrightCmd = ".\\node_modules\\.bin\\playwright.cmd";

  try {
    const { stdout, stderr } = await execFile(
      "cmd.exe",
      ["/c", playwrightCmd, "test", "--config=playwright.config.js", specPath],
      { cwd: projectRoot }
    );

    return {
      success: true,
      exitCode: 0,
      stdout,
      stderr,
    };
  } catch (error) {
    return {
      success: false,
      exitCode: typeof error.code === "number" ? error.code : 1,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? error.message ?? "",
    };
  }
}

async function main() {
  const storyPathInput = getArg("--story") || process.env.STORY_FILE;
  if (!storyPathInput) {
    throw new Error('Provide a story file with --story "path-to-file" or STORY_FILE');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in this terminal session.");
  }

  const projectRoot = process.cwd();
  const storyPath = path.resolve(storyPathInput);
  const story = await fs.readFile(storyPath, "utf8");

  await fs.mkdir(path.resolve(projectRoot, "reports"), { recursive: true });
  await fs.mkdir(path.resolve(projectRoot, "pages"), { recursive: true });
  await fs.mkdir(path.resolve(projectRoot, "generated-tests"), { recursive: true });

  await runUiInspection(projectRoot, APP_URL, SELECTOR_MAP_OUTPUT);

  const selectorMapRaw = await fs.readFile(SELECTOR_MAP_OUTPUT, "utf8");
  const selectorMap = JSON.parse(selectorMapRaw);

  const messages = parseExpectedMessagesFromStory(story);
  const pageObjectCode = buildPageObjectCode(selectorMap, messages);

  const pageObjectPath = path.resolve(projectRoot, "pages", "LoginPage.js");
  await fs.writeFile(pageObjectPath, pageObjectCode, "utf8");

  const { email, password } = parseExpectedCredentialsFromStory(story);

  const systemPrompt = `
You are a senior QA automation engineer.

Generate exactly one Playwright spec file in plain JavaScript.
Do not generate a page object.
Do not generate locators.
The page object already exists and must be used as-is.

Return code only.
No markdown.
No explanation.

Strict rules:
- Use ES module syntax only
- Use import/export, never require/module.exports
- Use @playwright/test
- Generate exactly one file:
  FILE: generated-tests/login.generated.spec.js
- Import test from "@playwright/test"
- Import LoginPage exactly like this:
  import { LoginPage } from "../pages/LoginPage.js";
- Do not define locators in the spec
- Do not use getByRole, getByLabel, getByTestId, or locator directly in the spec
- Generate exactly 2 tests:
  1. valid email + valid password should succeed
  2. valid email + wrong password should fail
- Do not generate additional scenarios
- Use the exact credentials from the story
- The spec must instantiate LoginPage and use only these methods:
  - navigate()
  - login(email, password)
  - assertLoginSuccess()
  - assertLoginFailure()
- Output must be valid JavaScript

Output format:
FILE: generated-tests/login.generated.spec.js
<code>
`;

  const userPrompt = `
User story:
${story}

Selector map discovered automatically:
${selectorMapRaw}

Task:
Generate only the Playwright spec file.

Requirements:
- Generate only: generated-tests/login.generated.spec.js
- Use LoginPage from ../pages/LoginPage.js
- Do not create locators in the spec
- Do not recreate page object logic
- Instantiate LoginPage in the spec
- Use LoginPage.navigate()
- Use LoginPage.login(email, password)
- Use LoginPage.assertLoginSuccess()
- Use LoginPage.assertLoginFailure()
- Generate exactly these 2 scenarios only:
  1. valid email + valid password should succeed
  2. valid email + wrong password should fail
- Use these exact credentials from the story:
  - valid email: ${email}
  - valid password: ${password}
- For the wrong-password scenario, use a clearly invalid password value
- Return code only in the required FILE format
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
      max_tokens: 2500,
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
  const generatedText = extractText(data.content);
  const cleanedSpec = stripOuterCodeFence(generatedText)
  .replace(/^FILE:\s*generated-tests\/login\.generated\.spec\.js\s*/i, "")
  .trim();

  validateGeneratedSpec(cleanedSpec, story);

  const specPath = path.resolve(projectRoot, "generated-tests", "login.generated.spec.js");
  await fs.writeFile(specPath, cleanedSpec + "\n", "utf8");

  console.log("Generated files:");
  console.log("- pages/LoginPage.js");
  console.log("- generated-tests/login.generated.spec.js");

  const execution = await runPlaywrightTest(
    projectRoot,
    "generated-tests/login.generated.spec.js"
  );

  const executionReport = {
    storyPath,
    selectorMapPath: SELECTOR_MAP_OUTPUT,
    generatedAt: new Date().toISOString(),
    generatedFiles: [
      {
        relativePath: "pages/LoginPage.js",
        absolutePath: pageObjectPath,
      },
      {
        relativePath: "generated-tests/login.generated.spec.js",
        absolutePath: specPath,
      },
    ],
    success: execution.success,
    exitCode: execution.exitCode,
    stdout: execution.stdout,
    stderr: execution.stderr,
  };

  const reportPath = path.resolve(projectRoot, "reports", "execution-result.json");
  await fs.writeFile(reportPath, JSON.stringify(executionReport, null, 2), "utf8");

  console.log(`Execution report saved to: ${reportPath}`);

  if (execution.success) {
    console.log("Generated Playwright test executed successfully.");
  } else {
    console.log("Generated Playwright test failed.");
    console.log("Check reports/execution-result.json for details.");
  }

  await execFile(
    process.execPath,
    [
      "scripts/analyze-and-create-issue.js",
      "--story",
      storyPath,
      "--report",
      reportPath,
    ],
    { cwd: projectRoot, env: process.env }
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});