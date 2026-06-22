import { chromium } from "playwright";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const chromePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const page = await browser.newPage();

try {
  await page.goto(`${baseUrl}/demo`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await page.getByText("Synthetic demo companies reset; user companies were preserved.").waitFor();

  await page.getByRole("button", { name: "Seed all companies" }).click();
  await page.getByText("All five demo companies are ready.").waitFor();
  await page.getByText("GreenLedger").waitFor();

  await page.goto(`${baseUrl}/companies`, { waitUntil: "networkidle" });
  await page.getByText("AtlasAI", { exact: true }).first().waitFor();
  await page.getByText("FinPilot", { exact: true }).first().waitFor();
  await page.getByText("53.4", { exact: true }).waitFor();
  await page.getByText("81.2", { exact: true }).waitFor();

  console.log("Demo smoke passed: reset, seed-all, portfolio, and distinct scores are working.");
} finally {
  await browser.close();
}
