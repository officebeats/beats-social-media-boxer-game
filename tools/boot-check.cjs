const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const testUrl = `${url}${url.includes("?") ? "&" : "?"}test_bridge=1`;
const screenshot = path.resolve(process.argv[3] || "output/boot-check.png");

(async () => {
  fs.mkdirSync(path.dirname(screenshot), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const publicPage = await browser.newPage();
  await publicPage.goto(url, { waitUntil: "networkidle" });
  const publicHooks = await publicPage.evaluate(() => ({
    render: typeof window.render_game_to_text,
    control: typeof window.set_locked_in_ring_test_mode
  }));
  await publicPage.close();
  if (publicHooks.render !== "undefined" || publicHooks.control !== "undefined") {
    throw new Error(`public export exposes test hooks: ${JSON.stringify(publicHooks)}`);
  }
  const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));

  try {
    await page.goto(testUrl, { waitUntil: "networkidle" });
    await page.locator("#p8_start_button").click();
    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });
    try {
      await page.waitForFunction(() =>
        window.pico8_state?.frame_number > 5 &&
        JSON.parse(window.render_game_to_text()).selectedFighter > 0,
        null,
        { timeout: 20000 }
      );
    } catch (error) {
      await canvas.screenshot({ path: screenshot });
      throw error;
    }
    await canvas.screenshot({ path: screenshot });
    await canvas.click();
    await page.keyboard.down("z");
    await page.waitForTimeout(50);
    await page.keyboard.up("z");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "fighter-select");
    if (errors.length) throw new Error(errors.join(" | "));
    console.log(JSON.stringify({ screenshot, state: JSON.parse(await page.evaluate(() => window.render_game_to_text())) }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
