import { createServer } from "vite";
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const outputDir = "C:\\Users\\admin-beats\\.gemini\\antigravity\\brain\\0fa7c95d-d6b5-40d4-82d6-c451cc06228f\\screenshots";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  const server = await createServer({
    configFile: path.resolve(process.cwd(), "vite.config.ts"),
    server: { port: 5174 },
  });
  await server.listen();
  console.log("Vite server running at http://localhost:5174");

  const browser = await chromium.launch({ headless: true });

  // 1. Mobile Viewport (390 x 844)
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const pageMobile = await contextMobile.newPage();

  // Title Screen
  await pageMobile.goto("http://localhost:5174");
  await pageMobile.waitForSelector(".title-screen");
  await pageMobile.screenshot({ path: path.join(outputDir, "01_title_screen_mobile.png") });

  // Select Screen
  await pageMobile.click('[data-action="fight"]');
  await pageMobile.waitForSelector(".select-screen");
  await pageMobile.screenshot({ path: path.join(outputDir, "02_select_screen_mobile.png") });

  // Match Screen (Intro)
  await pageMobile.click('[data-action="confirm"]');
  await pageMobile.waitForSelector(".match-screen");
  await pageMobile.screenshot({ path: path.join(outputDir, "03_match_intro_mobile.png") });

  // Active Match (Play)
  await pageMobile.evaluate(() => window.advanceTime(1500));
  await pageMobile.evaluate(() => window.__ringRush.showcaseGems());
  await pageMobile.screenshot({ path: path.join(outputDir, "04_match_showcase_mobile.png") });

  // Pause Screen
  await pageMobile.click('[data-action="pause"]');
  await pageMobile.waitForSelector(".pause-panel");
  await pageMobile.screenshot({ path: path.join(outputDir, "05_pause_modal_mobile.png") });
  await pageMobile.click('[data-action="resume"]');

  // Results Screen
  await pageMobile.evaluate(() => window.__ringRush.finish("broner"));
  await pageMobile.waitForSelector(".results-screen");
  await pageMobile.screenshot({ path: path.join(outputDir, "06_results_screen_mobile.png") });

  await contextMobile.close();

  // 2. Desktop Viewport (1280 x 720)
  const contextDesktop = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  });
  const pageDesktop = await contextDesktop.newPage();
  await pageDesktop.goto("http://localhost:5174?play=1");
  await pageDesktop.waitForSelector(".match-screen");
  await pageDesktop.evaluate(() => window.advanceTime(1500));
  await pageDesktop.evaluate(() => window.__ringRush.showcaseGems());
  await pageDesktop.screenshot({ path: path.join(outputDir, "07_match_desktop.png") });
  await contextDesktop.close();

  await browser.close();
  await server.close();
  console.log("Screenshots captured successfully!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
