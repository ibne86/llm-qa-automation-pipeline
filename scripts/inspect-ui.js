import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

function getArg(flag) {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function clean(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

async function main() {
  const url = getArg("--url");
  const out = getArg("--out");

  if (!url) {
    throw new Error('Provide a URL with --url "http://127.0.0.1:4173"');
  }

  if (!out) {
    throw new Error('Provide an output path with --out ".\\\\reports\\\\selector-map.json"');
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });

  const selectorMap = await page.evaluate(() => {
    function clean(text) {
      return (text || "").replace(/\s+/g, " ").trim();
    }

    function isVisible(el) {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    }

    function getLabelText(el) {
      const id = el.getAttribute("id");
      if (id) {
        const explicit = document.querySelector(`label[for="${id}"]`);
        if (explicit) return clean(explicit.textContent);
      }

      const parentLabel = el.closest("label");
      if (parentLabel) {
        const clone = parentLabel.cloneNode(true);
        clone.querySelectorAll("input, textarea, select").forEach((node) => node.remove());
        return clean(clone.textContent);
      }

      return "";
    }

    const inputs = [...document.querySelectorAll("input, textarea, select")]
      .filter(isVisible)
      .map((el) => ({
        type: el.getAttribute("type") || "",
        label: getLabelText(el),
        placeholder: el.getAttribute("placeholder") || "",
        testId: el.getAttribute("data-testid") || "",
      }));

    const buttons = [...document.querySelectorAll("button, input[type='submit'], input[type='button']")]
      .filter(isVisible)
      .map((el) => ({
        type: el.getAttribute("type") || "",
        text: clean(el.textContent || el.getAttribute("value") || ""),
        testId: el.getAttribute("data-testid") || "",
      }));

    const visibleTexts = [...document.querySelectorAll("body *")]
      .filter(isVisible)
      .map((el) => clean(el.textContent))
      .filter(Boolean)
      .filter((text, index, arr) => arr.indexOf(text) === index);

    const emailInput = inputs.find((i) => i.label.toLowerCase() === "email");
    const passwordInput = inputs.find((i) => i.label.toLowerCase() === "password");
    const submitButton =
      buttons.find((b) => b.testId) ||
      buttons.find((b) => b.type === "submit") ||
      buttons[0];

    const successMessage =
      visibleTexts.find((t) => /login successful/i.test(t)) || "";

    const failureMessage =
      visibleTexts.find((t) => /invalid email or password/i.test(t)) || "Invalid email or password.";

    return {
      url: window.location.href,
      emailInput: emailInput || null,
      passwordInput: passwordInput || null,
      submitButton: submitButton || null,
      successMessage,
      failureMessage,
    };
  });

  await browser.close();

  const outputPath = path.resolve(out);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(selectorMap, null, 2), "utf8");

  console.log(`Selector map written to: ${outputPath}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});