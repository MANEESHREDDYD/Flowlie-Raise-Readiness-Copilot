import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const screenshotDirectory = path.resolve(scriptDirectory, "../../../docs/screenshots");
const baseUrl = process.env.SCREENSHOT_BASE_URL || "http://127.0.0.1:3000";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const chromePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const companies = await fetch(`${apiUrl}/companies/summary`).then(response => response.json());
const atlas = companies.find(company => company.name === "AtlasAI");

if (!atlas) {
  throw new Error("Seed AtlasAI before capturing screenshots.");
}

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});

async function capture(name, route, options = {}) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
  if (options.clickButton) {
    await page.locator("button", { hasText: options.clickButton }).click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({
    path: path.join(screenshotDirectory, name),
    fullPage: options.fullPage ?? false,
  });
}

await capture("company-portfolio.png", "/companies", { fullPage: true });
await capture("dashboard.png", `/companies/${atlas.id}/dashboard`);
await capture("risks.png", `/companies/${atlas.id}/risks`);
await capture("investor-qa.png", `/companies/${atlas.id}/investor-qa`);
await capture("confidence-audit.png", `/companies/${atlas.id}/confidence-audit`, { fullPage: true });
await capture("edit-data.png", `/companies/${atlas.id}/edit-data`, {
  clickButton: "Cap table",
  fullPage: true,
});

await browser.close();
