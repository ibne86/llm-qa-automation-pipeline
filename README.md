<h1 align="center">🤖 LLM-Assisted QA Automation Pipeline</h1>
<p align="center"><b>An AI-assisted pipeline that generates Playwright tests from user stories, executes them, analyzes failures, and creates GitHub issues for valid bugs.</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/Claude-API-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Playwright-CLI-2ea44f?style=for-the-badge" />
  <img src="https://img.shields.io/badge/GitHub-REST_API-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Architecture-Claude_%2B_Playwright_%2B_GitHub-blue?style=for-the-badge" />
</p>

---

## 📌 Overview

This repository is an **AI-driven QA automation workflow**.

It uses:

- **Claude API** to generate Playwright test code
- **Playwright CLI** to execute the generated test
- **Claude API** to analyze failures
- **GitHub REST API** to create issues for real bugs

---

## 🏗️ Architecture at a Glance

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

- Reading a user story from an **external file**
- Inspecting the UI and building selector context
- Generating a Playwright test with AI
- Running the test locally with Playwright CLI
- Analyzing failures with AI
- Creating a GitHub issue for confirmed bugs
- Saving outputs into `reports/`

---

## ✅ Current Implementation Status

| Capability | Status |
|---|---|
| External story input | ✅ Yes |
| Claude API for test generation | ✅ Yes |
| Playwright CLI execution | ✅ Yes |
| Claude API for failure analysis | ✅ Yes |
| GitHub issue creation via REST API | ✅ Yes |

---

## 🗂️ Key Files

| File / Folder | Purpose |
|---|---|
| `scripts/run-agent.js` | Orchestrates story reading, selector discovery, test generation, Playwright execution, and post-run analysis |
| `scripts/inspect-ui.js` | Inspects the running UI and builds `reports/selector-map.json` |
| `scripts/analyze-and-create-issue.js` | Sends execution results to Claude and creates a GitHub issue through REST API |
| `playwright.config.js` | Playwright runner configuration |
| `app/` | Demo application with an intentional login bug |
| `prompts/` | Reference prompt files for the agent flow |
| `reports/` | Execution and bug-analysis artifacts |

---

## 🐞 Intentional Bug in the Demo App

The login app is purposely incorrect.

### Current bug
- Login succeeds when **either** the email **or** the password is correct

### Correct behavior
- Login should succeed only when **both** email and password are correct

---

## 📁 Folder Structure

```text
llm-qa-automation-pipeline/
├─ app/
├─ generated-tests/
├─ pages/
├─ prompts/
├─ reports/
├─ scripts/
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

---

## 📥 External Story Input

The story file can live **outside the repository**.

`run-agent.js` accepts either:

- `--story "path-to-file"`
- or `STORY_FILE`

<details>
<summary><b>📄 Example story content</b></summary>

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

## 🧹 Cleanup Note

This repository generates runtime artifacts during execution. Those outputs should generally stay out of version control except for placeholders such as `reports/.gitkeep`.

---

## 🧹 Testing

another push with the same bug still does not create a new issue