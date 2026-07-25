import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const TARGET_URL = process.env.TARGET_URL || "http://127.0.0.1:4173/";
const OUT_DIR = path.resolve("C:/Users/admin-beats/beats-social-media-boxer-game/docs/screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function shot(page, name) {
  const canvas = page.locator("canvas").first();
  await canvas.waitFor({ state: "visible", timeout: 15000 });
  const file = path.join(OUT_DIR, name);
  await canvas.screenshot({ path: file });
  console.log("saved", file);
  return file;
}

async function press(page, key, times = 1, delay = 120) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(delay);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 900, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  // Click canvas to focus / start audio shell
  const canvas = page.locator("canvas").first();
  await canvas.click({ force: true });
  await page.waitForTimeout(800);

  // Title screen
  await shot(page, "01-title.png");

  // Advance to character select (Z = O button)
  await press(page, "z");
  await page.waitForTimeout(600);
  await shot(page, "02-select.png");

  // Lock in fighter -> fight
  await press(page, "z");
  await page.waitForTimeout(900);
  await shot(page, "03-fight-start.png");

  // Play a bit so wells fill and fighters animate
  for (let i = 0; i < 25; i++) {
    await press(page, "ArrowLeft", 1, 40);
    await press(page, "ArrowRight", 1, 40);
    await press(page, "z", 1, 50); // rotate
    if (i % 3 === 0) await press(page, "x", 1, 80); // hard drop
    else await press(page, "ArrowDown", 4, 30);
    await page.waitForTimeout(100);
  }
  await shot(page, "04-fight-mid.png");

  // More drops for denser board
  for (let i = 0; i < 30; i++) {
    await press(page, "x", 1, 90);
    await page.waitForTimeout(80);
  }
  await shot(page, "05-fight-dense.png");

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
