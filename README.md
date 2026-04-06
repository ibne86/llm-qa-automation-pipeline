<h1 align="center">🤖 LLM-Assisted QA Automation Pipeline</h1>
<p align="center"><b>An AI-assisted QA workflow that turns text stories into Playwright tests, runs them, analyzes failures, and uses GitHub Actions to validate changes and open GitHub issues for real bugs.</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude-API-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Playwright-CLI-2ea44f?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GitHub-Actions-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GitHub-REST_API-24292f?style=for-the-badge" />
</p>

---

## 📌 Overview

This repository demonstrates an **AI-assisted QA automation pipeline** built around a demo login application with an intentional bug.

The project combines:

- **Claude API** for test generation
- **Playwright** for browser automation and execution
- **GitHub Actions** for CI/CD orchestration
- **GitHub REST API** for automated issue creation

---

## 🏗️ End-to-End Architecture

```text
Story file
   ↓
scripts/run-agent.js reads the story
   ↓
UI inspection builds selector context
   ↓
Claude API generates Playwright test code
   ↓
Generated test is written locally
   ↓
Playwright executes the test
   ↓
Execution result is saved to reports/
   ↓
scripts/analyze-and-create-issue.js analyzes the result
   ↓
Claude decides whether it is a real bug
   ↓
GitHub issue is created when workflow policy allows it
   ↓
GitHub Actions controls when each of these steps runs in CI/CD
```

---

## 🎯 What This Project Demonstrates

- AI-assisted Playwright test generation from text stories
- UI inspection and selector discovery
- automated browser test execution
- AI-assisted failure analysis
- GitHub issue creation for confirmed bugs
- **GitHub Actions based CI/CD workflow design**
- duplicate-issue control across push, PR, and main runs

---

## ⚙️ GitHub Actions / CI-CD Workflow

This project uses **GitHub Actions** as its CI/CD pipeline.

Workflow file:

- `.github/workflows/agent-ci.yml`

GitHub Actions is responsible for:

- installing dependencies
- starting the demo app
- running smoke or regression stories
- saving reports and artifacts
- allowing or blocking GitHub issue creation depending on the event type

### Trigger behavior

#### 1. Push to feature branch
- GitHub Actions runs the **smoke pipeline**
- this run **can create a GitHub issue** for a real new bug
- useful for early feedback during development

#### 2. Pull request
- GitHub Actions runs validation again
- this run **does not create GitHub issues**
- this prevents duplicate issue creation from both `push` and `pull_request`

#### 3. Push to `main`
- GitHub Actions runs the **full regression pipeline**
- this run **can create GitHub issues**
- this acts as the final CI regression check after merge

### In simple terms

```text
feature branch push → smoke run → issue creation allowed
pull request        → validation run → no issue creation
main push           → regression run → issue creation allowed
```

---

## 🧠 Duplicate-Issue Control

The project includes duplicate protection so the same bug is less likely to be reported multiple times.

It uses multiple signals such as:

- hidden fingerprint markers in issue bodies
- stable failure markers
- normalized title matching
- normalized expected/actual behavior matching

This is important because the same underlying bug can appear:

- on a feature branch push
- again in a PR validation run
- again after merge to `main`

The CI/CD policy and dedupe logic work together to reduce that noise.

---

## 🗂️ Key Files

| File / Folder | Purpose |
|---|---|
| `scripts/run-agent.js` | Main orchestration flow: reads the story, generates test code, runs Playwright, and hands off for analysis |
| `scripts/inspect-ui.js` | Inspects the running app and builds selector context |
| `scripts/analyze-and-create-issue.js` | Analyzes execution results and creates GitHub issues when allowed |
| `.github/workflows/agent-ci.yml` | **GitHub Actions CI/CD workflow** for smoke and regression runs |
| `stories/smoke/` | Smoke stories used on feature branch pushes |
| `stories/regression/` | Regression stories used in the main regression workflow |
| `reports/` | Execution results, analysis outputs, selector maps, and runtime artifacts |
| `app/` | Demo login app with an intentional bug |

---

## 🐞 Intentional Bug in the Demo App

The login app is intentionally incorrect.

### Current bug
Login succeeds when **either** the email **or** the password is correct.

### Correct behavior
Login should succeed only when **both** email and password are correct.

This intentional defect is used to demonstrate:

- story-driven test generation
- bug detection through execution
- AI-assisted failure analysis
- automated GitHub issue creation through CI/CD

---

## 📁 Story Design

The project uses a cleaner story split:

### Smoke story
A single canonical login smoke scenario covers the core login flow.

### Regression story
The regression story covers a different validation path, such as incomplete credentials, instead of duplicating the same wrong-password scenario.

This keeps the test suite cleaner and reduces noisy duplicate bug reports.

---

## 📁 Folder Structure

```text
llm-qa-automation-pipeline/
├─ .github/
│  └─ workflows/
│     └─ agent-ci.yml
├─ app/
├─ generated-tests/
├─ pages/
├─ prompts/
├─ reports/
├─ scripts/
├─ stories/
│  ├─ smoke/
│  └─ regression/
├─ .gitignore
├─ package.json
├─ package-lock.json
├─ playwright.config.js
└─ README.md
```

---

## ⚙️ Local Setup

### 1. Install dependencies

```bash
npm install
npm run install:browsers
```

### 2. Run the demo app

```bash
npm run dev
```

### 3. Configure required environment variables

For local runs and GitHub issue creation, configure:

- `ANTHROPIC_API_KEY`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`

For GitHub Actions, secrets are configured in the GitHub repository.

---

## 📥 Story Input

The main agent flow accepts a story file path.

You can pass it by argument or environment variable:

- `--story "path-to-file"`
- or `STORY_FILE`

### Example story

```text
As a valid user, I want to log in with correct email and password so that I can access my account.

Valid email: user@example.com
Valid password: Password123

Acceptance criteria:
- valid email + valid password -> login succeeds
- valid email + wrong password -> login fails
- wrong email + valid password -> login fails
- wrong email + wrong password -> login fails

Success is indicated by the message: "Login successful. Welcome back."
Failure is indicated by the message: "Invalid email or password."
```

---

## 🚀 Useful Commands

### Run the main agent flow locally

```bash
npm run agent:run -- --story "C:\path\to\your\story.txt"
```

### Run UI inspection only

```bash
npm run agent:inspect -- --url "http://127.0.0.1:4173" --out ".\reports\selector-map.json"
```

### Run analysis and issue creation only

```bash
npm run agent:analyze -- --story "C:\path\to\your\story.txt" --report ".\reports\execution-result.json"
```

---

## 🔁 Git + GitHub Actions Workflow

Typical development flow:

```text
make changes locally
↓
create feature branch
↓
push branch to GitHub
↓
GitHub Actions smoke run starts
↓
open pull request
↓
GitHub Actions PR validation run starts
↓
merge to main
↓
GitHub Actions full regression run starts
```

Typical commands:

```bash
git checkout -b feature/hybrid-issue-dedupe-fix
git add .
git commit -m "Fix CI issue dedupe and clean login stories"
git push -u origin feature/hybrid-issue-dedupe-fix
```

---

## 📊 Example CI/CD Flow

```text
Push to feature branch
↓
GitHub Actions smoke run
↓
Bug found
↓
Claude analyzes the failure
↓
If it is a real bug, GitHub issue can be created
↓
Open PR
↓
GitHub Actions validates again without creating issue
↓
Merge to main
↓
GitHub Actions full regression run checks again without reopening the same bug unnecessarily
```

---

## 🧹 Notes

- runtime artifacts in `reports/` should usually stay out of version control except intentional placeholders
- feature branch push and main runs may both detect the same real bug, so duplicate control matters
- PR runs are intentionally validation-only to reduce noise
- GitHub Actions is a core part of this project, not an optional add-on

---

## 📌 Summary

This project is not just a test generator.

It is a compact demonstration of how AI can assist QA automation across the full loop:

- story input
- UI understanding
- test generation
- execution
- failure analysis
- issue creation
- **GitHub Actions based CI/CD orchestration**