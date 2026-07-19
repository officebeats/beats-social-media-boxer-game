const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const outputPath = path.resolve(process.argv[3] || "output/balance-summary.json");

(async () => {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${String(error)}`));

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.locator("#p8_start_button").click();
    await page.waitForFunction(() => window.pico8_state?.frame_number > 5, null, { timeout: 20000 });
    await page.evaluate(() => {
      window.pico8_gpio[127] = 1;
      window.pico8_gpio[123] = 0;
      window.pico8_gpio[124] = 1;
    });
    await page.waitForFunction(() => window.pico8_gpio[123] === 1, null, { timeout: 120000 });
    const result = await page.evaluate(() => ({
      abWins: window.pico8_gpio[120],
      dgWins: window.pico8_gpio[121],
      matches: window.pico8_gpio[122],
      done: window.pico8_gpio[123],
      browserErrors: []
    }));
    result.browserErrors = errors;
    result.abWinRate = result.abWins / result.matches;
    result.dgWinRate = result.dgWins / result.matches;
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

    if (result.matches !== 100 || result.abWins + result.dgWins !== 100) {
      throw new Error(`invalid balance batch: ${JSON.stringify(result)}`);
    }
    if (result.abWins < 40 || result.abWins > 60 || result.dgWins < 40 || result.dgWins > 60) {
      throw new Error(`matchup outside 40-60 gate: ${JSON.stringify(result)}`);
    }
    if (errors.length) throw new Error(`browser errors: ${errors.join(" | ")}`);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    const failurePath = outputPath.replace(/\.json$/i, "-failure.png");
    await page.screenshot({ path: failurePath, fullPage: true });
    const state = await page.evaluate(() => ({
      frame: window.pico8_state?.frame_number,
      gpio: window.pico8_gpio ? Array.from(window.pico8_gpio.slice(0, 13)) : null
    }));
    console.error(JSON.stringify({ state, errors, failurePath }, null, 2));
    throw error;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
