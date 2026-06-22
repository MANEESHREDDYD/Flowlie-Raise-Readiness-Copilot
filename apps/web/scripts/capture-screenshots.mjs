import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const screenshotDirectory = path.resolve(scriptDirectory, "../../../docs/screenshots");
const baseUrl = process.env.SCREENSHOT_BASE_URL || "http://127.0.0.1:3000";
const apiUrl = process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";
const chromePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

const companies = await fetch(`${apiUrl}/companies/summary`).then(response => {
  if (!response.ok) throw new Error(`Unable to load company summary (${response.status}).`);
  return response.json();
});
const atlas = companies.find(company => company.name === "AtlasAI");
if (!atlas) throw new Error("Seed AtlasAI before capturing screenshots.");

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});

async function capture(name, route, options = {}) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  if (options.waitForText) {
    await page.getByText(options.waitForText, { exact: false }).first().waitFor({ state: "visible" });
  }
  if (options.clickButton) {
    await page.locator("button", { hasText: options.clickButton }).click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({
    path: path.join(screenshotDirectory, name),
    fullPage: options.fullPage ?? false,
  });
}

await capture("company-portfolio.png", "/companies", { fullPage: true, waitForText: "GreenLedger" });
await capture("dashboard.png", `/companies/${atlas.id}/dashboard`, { waitForText: "Strict Raise Readiness Score" });
await capture("risks.png", `/companies/${atlas.id}/risks`, { waitForText: "Why this matters to investors" });
await capture("investor-qa.png", `/companies/${atlas.id}/investor-qa`, { waitForText: "Suggested founder answer" });
await capture("confidence-audit.png", `/companies/${atlas.id}/confidence-audit`, { fullPage: true, waitForText: "Meeting Follow-up" });
await capture("edit-data.png", `/companies/${atlas.id}/edit-data`, {
  waitForText: "Company profile",
  clickButton: "Cap table",
  fullPage: true,
});

await browser.close();
