<h1 align="center">🤖 LLM-Assisted QA Automation Pipeline</h1>
<p align="center"><b>An AI-assisted QA workflow that turns text stories into Playwright tests, runs them, analyzes failures, and opens GitHub issues for real bugs.</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude-API-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Playwright-CLI-2ea44f?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GitHub-REST_API-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/CI-Hybrid_Issue_Policy-blue?style=for-the-badge" />
</p>

---

## 📌 Overview

This repository demonstrates an **AI-assisted QA automation pipeline** built around a simple demo login application.

The pipeline:

- reads a story from a text file
- inspects the UI to build selector context
- uses **Claude API** to generate a Playwright test
- runs the generated test with **Playwright CLI**
- analyzes failures with **Claude API**
- creates a **GitHub issue via REST API** for valid bugs

---

## 🏗️ Architecture at a Glance

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
Playwright CLI executes the test
   ↓
Execution report is saved to reports/
   ↓
scripts/analyze-and-create-issue.js analyzes the result
   ↓
Claude decides whether it is a real bug
   ↓
GitHub REST API creates an issue when allowed
   ↓
reports/ gets updated
```

---

## 🎯 What This Project Demonstrates

- AI-assisted Playwright test generation from text stories
- UI inspection and selector discovery
- automated test execution with Playwright
- AI-assisted failure analysis
- GitHub issue creation for confirmed bugs
- a practical CI workflow with separate smoke and regression behavior
- duplicate-issue control across push, PR, and main runs

---

## ✅ Current Workflow Behavior

This project now follows a **hybrid issue creation policy**:

### Feature branch push
- smoke workflow runs
- **can create a GitHub issue**
- useful for catching new bugs early

### Pull request run
- workflow runs for validation
- **does not create GitHub issues**
- prevents push + PR duplicate issue creation

### Push to `main`
- full regression workflow runs
- **can create GitHub issues**
- used as the final automated regression gate

In simple terms:

```text
feature push  → test + issue creation allowed
pull request  → test only
main push      → regression + issue creation allowed
```

---

## 🧠 Duplicate Issue Strategy

The project is designed to reduce duplicate bug reports by using multiple signals during issue creation, including:

- hidden fingerprint markers
- stable failure markers
- normalized title matching
- normalized expected/actual behavior comparison

This helps the pipeline avoid reopening the same bug when it appears again in later runs.

---

## 🗂️ Key Files

| File / Folder | Purpose |
|---|---|
| `scripts/run-agent.js` | Main orchestration flow: reads the story, generates test code, runs Playwright, and hands off for analysis |
| `scripts/inspect-ui.js` | Inspects the running app and builds selector context |
| `scripts/analyze-and-create-issue.js` | Analyzes execution results and creates GitHub issues when allowed |
| `.github/workflows/agent-ci.yml` | GitHub Actions workflow for smoke and regression runs |
| `stories/smoke/` | Smoke stories used on feature branch pushes and validation runs |
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
- automated GitHub issue creation

---

## 📁 Story Design

The project uses a cleaner story split:

### Smoke story
A single canonical login smoke scenario covers the core login flow.

### Regression story
The regression story is used for a different validation path, such as incomplete credentials, instead of duplicating the same wrong-password case.

This keeps the suite cleaner and reduces duplicate bug reporting from overlapping stories.

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

## ⚙️ Setup

### 1. Install dependencies

```bash
npm install
npm run install:browsers
```

### 2. Run the demo app

```bash
npm run dev
```

### 3. Make sure environment variables are configured

You will need the required secrets or environment variables for the flows you want to use, such as:

- `ANTHROPIC_API_KEY`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`

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

### Run the main agent flow

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

## 🔁 Git Workflow for This Project

A practical flow for working with this repo:

```text
make changes locally
↓
create a feature branch
↓
push branch to GitHub
↓
smoke workflow runs
↓
open pull request
↓
PR workflow validates changes without creating issues
↓
merge to main
↓
main regression workflow runs
```

Typical commands:

```bash
git checkout -b feature/hybrid-issue-dedupe-fix
git add .
git commit -m "Fix CI issue dedupe and clean login stories"
git push -u origin feature/hybrid-issue-dedupe-fix
```

---

## 📊 Example End-to-End Flow

```text
Story file
↓
AI generates Playwright test
↓
Playwright runs test
↓
Failure is captured in reports/
↓
AI analyzes whether it is a real bug
↓
If allowed by workflow policy, GitHub issue is created
```

---

## 🧹 Notes

- runtime artifacts in `reports/` should usually stay out of version control except intentional placeholders
- feature branch push and main runs may both detect the same real bug, so duplicate control matters
- PR runs are intentionally validation-only to reduce noise

---

## 📌 Summary

This project is not just a test generator.

It is a compact demo of how AI can assist QA automation across the full loop:

- story input
- UI understanding
- test generation
- execution
- failure analysis
- issue creation
- CI workflow design
