<h1 align="center">🤖 LLM-Assisted QA Automation Pipeline</h1>
<p align="center"><b>AI-assisted Playwright generation, execution, failure analysis, and GitHub issue creation — orchestrated with GitHub Actions.</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude-API-8A2BE2?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Playwright-Automation-2ea44f?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GitHub-Actions-2088FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GitHub-Issues-24292F?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-Workflow-339933?style=for-the-badge" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Working-success?style=flat-square" />
  <img src="https://img.shields.io/badge/CI-GitHub_Actions-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Demo_App-Intentional_Login_Bug-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/Test_Strategy-Smoke_%2B_Regression-informational?style=flat-square" />
</p>

---

## ✨ Overview

This repository demonstrates an **AI-assisted QA automation pipeline** built around a demo login application with an intentional bug.

It combines:

- **Claude API** for generating and analyzing test logic
- **Playwright** for browser automation and test execution
- **GitHub Actions** for CI/CD orchestration
- **GitHub REST API** for automated issue creation

> [!IMPORTANT]
> This is not just a test generator. It demonstrates an end-to-end QA flow: **story → inspection → generation → execution → analysis → issue creation → CI/CD validation**.

---

## 🏗️ Pipeline Architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         LLM-ASSISTED QA FLOW                        │
├──────────────────────────────────────────────────────────────────────┤
│ Story File                                                           │
│   └─ External text story or story inside stories/                    │
│                                                                      │
│ scripts/run-agent.js                                                 │
│   ├─ reads story                                                     │
│   ├─ triggers UI inspection                                          │
│   ├─ requests Playwright test generation from Claude                 │
│   └─ runs generated test with Playwright                             │
│                                                                      │
│ reports/                                                             │
│   ├─ selector-map.json                                               │
│   ├─ execution-result.json                                           │
│   └─ bug-summary.json                                                │
│                                                                      │
│ scripts/analyze-and-create-issue.js                                  │
│   ├─ analyzes failure with Claude                                    │
│   ├─ checks duplicate signals                                        │
│   └─ creates GitHub issue when workflow policy allows                │
└──────────────────────────────────────────────────────────────────────┘

                ┌──────────────────────────────────┐
                │      GitHub Actions / CI-CD      │
                ├──────────────────────────────────┤
                │ Feature push   → smoke run       │
                │ Pull request   → validation only │
                │ Push to main   → regression run  │
                └──────────────────────────────────┘
```

---

## 🎯 What This Project Demonstrates

- AI-assisted Playwright test generation from text stories
- UI inspection and selector discovery
- automated browser test execution
- AI-assisted failure analysis
- automated GitHub issue creation for confirmed bugs
- GitHub Actions-based CI/CD workflow design
- duplicate-issue control across push, PR, and main runs

---

## ⚡ GitHub Actions Workflow

This project uses **GitHub Actions** as its CI/CD pipeline.

**Workflow file**
- `.github/workflows/agent-ci.yml`

**GitHub Actions handles:**
- installing dependencies
- starting the demo app
- running smoke or regression stories
- saving reports and artifacts
- allowing or blocking GitHub issue creation based on event type

### Trigger behavior

| Event | Pipeline | Issue creation | Purpose |
|---|---|---:|---|
| Feature branch `push` | Smoke | ✅ Allowed | Early feedback during development |
| `pull_request` | Validation | ❌ Blocked | Prevent duplicate issue creation |
| `push` to `main` | Full regression | ✅ Allowed | Final regression check after merge |

<details>
<summary><b>See the flow in plain words</b></summary>

```text
feature branch push → smoke run → issue creation allowed
pull request        → validation run → no issue creation
main push           → regression run → issue creation allowed
```

</details>

---

## 🧠 Duplicate-Issue Control

The project includes duplicate protection so the same bug is less likely to be reported multiple times.

It uses multiple signals such as:
- hidden fingerprint markers in issue bodies
- stable failure markers
- normalized title matching
- normalized expected/actual behavior matching

This matters because the same underlying bug can appear:
- on a feature branch push
- again in a PR validation run
- again after merge to `main`

---

## 🐞 Intentional Demo Bug

The demo login app is intentionally incorrect.

- **Current bug:** login succeeds when **either** the email **or** the password is correct
- **Correct behavior:** login should succeed only when **both** email and password are correct

This intentional defect is used to demonstrate:
- story-driven test generation
- bug detection through execution
- AI-assisted failure analysis
- automated GitHub issue creation through CI/CD

---

## 🧪 Story Strategy

The project uses a cleaner split between smoke and regression coverage.

- **Smoke story**: one canonical login flow for fast feedback
- **Regression story**: a different validation path, such as incomplete credentials

This keeps the suite cleaner and reduces noisy duplicate bug reports.

---

## 🗂️ Project Map

<details>
<summary><b>Key files and folders</b></summary>

| File / Folder | Purpose |
|---|---|
| `scripts/run-agent.js` | Main orchestration flow: reads the story, generates test code, runs Playwright, and hands off for analysis |
| `scripts/inspect-ui.js` | Inspects the running app and builds selector context |
| `scripts/analyze-and-create-issue.js` | Analyzes execution results and creates GitHub issues when allowed |
| `.github/workflows/agent-ci.yml` | GitHub Actions CI/CD workflow for smoke and regression runs |
| `stories/smoke/` | Smoke stories used on feature branch pushes |
| `stories/regression/` | Regression stories used in the main regression workflow |
| `reports/` | Execution results, analysis outputs, selector maps, and runtime artifacts |
| `app/` | Demo login app with an intentional bug |

</details>

<details>
<summary><b>Folder structure</b></summary>

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

</details>

---

## ⚙️ Local Setup

<details>
<summary><b>Install and run locally</b></summary>

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

</details>

---

## 📥 Story Input

<details>
<summary><b>How story input works</b></summary>

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

</details>

---

## 🚀 Useful Commands

<details>
<summary><b>Open command reference</b></summary>

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

</details>

---

## 🔁 Development Flow

<details>
<summary><b>Typical Git + GitHub Actions flow</b></summary>

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

### Typical commands

```bash
git checkout -b feature/hybrid-issue-dedupe-fix
git add .
git commit -m "Fix CI issue dedupe and clean login stories"
git push -u origin feature/hybrid-issue-dedupe-fix
```

</details>

---

## 📌 Notes

- runtime artifacts in `reports/` should usually stay out of version control except intentional placeholders
- feature branch push and main runs may both detect the same real bug, so duplicate control matters
- PR runs are intentionally validation-only to reduce noise
- GitHub Actions is a core part of this project, not an optional add-on
