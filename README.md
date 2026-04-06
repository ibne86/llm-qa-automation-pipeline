<h1 align="center">🤖 LLM-Assisted QA Automation Pipeline</h1>
<p align="center"><b>An AI-assisted QA pipeline that turns text stories into Playwright tests, runs them, analyzes failures, and creates GitHub issues for confirmed bugs.</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude-API-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Playwright-CLI-2ea44f?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GitHub-Actions-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GitHub-REST_API-24292f?style=for-the-badge" />
</p>

---

## 📌 Overview

This repository demonstrates an AI-assisted QA workflow that:

- generates Playwright tests from text stories
- inspects the UI and builds selector context
- runs browser tests automatically
- analyzes failures with AI
- creates GitHub issues for confirmed bugs
- uses GitHub Actions for CI/CD
- includes duplicate-issue control across push, PR, and main runs

---

## 🏗️ Architecture

```text
External user story file
        ↓
scripts/run-agent.js reads the story
        ↓
Claude API generates Playwright test code
        ↓
Generated files are written locally
        ↓
Playwright CLI executes the test
        ↓
Execution report is saved to reports/
        ↓
scripts/analyze-and-create-issue.js sends the result to Claude API
        ↓
Claude decides whether it is a real bug
        ↓
GitHub REST API creates the issue
        ↓
reports/ gets updated
```

---

## 🎯 What This Project Demonstrates

- AI-assisted Playwright test generation from text stories
- UI inspection and selector discovery
- Automated browser test execution
- AI-assisted failure analysis
- Automated GitHub issue creation for confirmed bugs
- GitHub Actions-based CI/CD workflow design
- Duplicate-issue control across push, PR, and main runs

---

## ✅ Current Implementation Status

| Capability | Status |
|---|---|
| External story input | ✅ Yes |
| Claude API for test generation | ✅ Yes |
| Playwright CLI execution | ✅ Yes |
| Claude API for failure analysis | ✅ Yes |
| GitHub issue creation via REST API | ✅ Yes |
| GitHub Actions CI/CD workflow | ✅ Yes |
| Duplicate-issue protection | ✅ Yes |

---

## ⚡ GitHub Actions Workflow

This project uses **GitHub Actions** as its CI/CD pipeline.

### Workflow file

- `.github/workflows/agent-ci.yml`

### GitHub Actions handles:

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

## 🛡️ Duplicate-Issue Quality Control

This project does not only automate testing. It also tries to prevent the **same bug** from being reported repeatedly across feature-branch pushes, PR validation runs, and post-merge regression runs.

<details open>
<summary><b>Summary</b></summary>

This is an important quality signal in the project.

Instead of blindly creating a new issue every time a failing test appears, the pipeline checks whether the bug is likely already known. That makes the system more realistic, less noisy, and closer to how a practical engineering workflow should behave.

Why this matters:

- reduces duplicate bug reports
- makes CI results cleaner
- shows thoughtfulness in automation design
- demonstrates quality-focused engineering, not just test execution

</details>

<details>
<summary><b>Details</b></summary>

The duplicate-issue control uses multiple signals such as:

- hidden fingerprint markers in issue bodies
- stable failure markers
- normalized title matching
- normalized expected/actual behavior matching

This matters because the same underlying bug can appear:

- on a feature branch push
- again in a PR validation run
- again after merge to `main`

So the pipeline is designed to reduce repeated reporting of the same issue unnecessarily.

</details>

---

## 🐞 Intentional Demo Bug

The demo login app is intentionally incorrect.

### Current bug

- Login succeeds when either the email or the password is correct

### Correct behavior

- Login should succeed only when both email and password are correct

This intentional flaw makes it easy to demonstrate:

- AI-generated test creation
- automated failure detection
- bug analysis
- GitHub issue creation
- duplicate-issue control

---

## 🧪 Story Strategy

This project uses a **smoke + regression** strategy.

- **Smoke stories** provide fast feedback during development
- **Regression stories** act as deeper checks after merge to `main`

This keeps the workflow more realistic than a single one-size-fits-all test pass.

---

## 🗂️ Key Files

| File / Folder | Purpose |
|---|---|
| `scripts/run-agent.js` | Main orchestration flow: story reading, selector discovery, test generation, execution, and post-run analysis |
| `scripts/inspect-ui.js` | Inspects the running UI and builds selector context |
| `scripts/analyze-and-create-issue.js` | Sends execution results to Claude and creates GitHub issues through the REST API |
| `.github/workflows/agent-ci.yml` | GitHub Actions workflow for smoke, validation, and regression runs |
| `playwright.config.js` | Playwright runner configuration |
| `app/` | Demo application with the intentional login bug |
| `prompts/` | Prompt files used in the agent flow |
| `reports/` | Execution and bug-analysis artifacts |

---

<details>
<summary><b>📁 Project map</b></summary>

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

<details>
<summary><b>⚙️ Local setup</b></summary>

### 1. Install dependencies

```bash
npm install
npm run install:browsers
```

### 2. Run the demo app

```bash
npm run dev
```

### 3. Run the main agent flow

```bash
npm run agent:run -- --story "C:\path\to\your\story.txt"
```

</details>

---

<details>
<summary><b>📥 External story input</b></summary>

The story file can live outside the repository.

`run-agent.js` accepts either:

- `--story "path-to-file"`
- or `STORY_FILE`

### Example story content

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

<details>
<summary><b>🚀 Useful commands</b></summary>

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

</details>

---

<details>
<summary><b>🔄 Git + GitHub Actions development flow</b></summary>

### Typical development flow

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

<details>
<summary><b>📊 Example CI/CD flow</b></summary>

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

</details>

---

<details>
<summary><b>🧹 Notes</b></summary>

- The repository generates runtime artifacts during execution.
- Most generated outputs should stay out of version control.
- Placeholder files such as `reports/.gitkeep` can remain tracked where useful.

</details>
