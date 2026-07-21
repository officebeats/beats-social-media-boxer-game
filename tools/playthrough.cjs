const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const testUrl = `${url}${url.includes("?") ? "&" : "?"}test_bridge=1`;
const output = path.resolve(process.argv[3] || "output/playthrough");
fs.mkdirSync(output, { recursive: true });

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function button(page, key, hold = 100) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
  await page.waitForTimeout(60);
}

async function ready(page) {
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.mode !== "challenge" || (s.playerWindup === 0 && s.playerRecovery === 0 &&
      s.playerStun === 0 && s.playerSlowdown === 0 && s.playerStamina >= 3);
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 960, height: 760 } });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));

  try {
    await page.goto(testUrl, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.pico8_gpio?.length >= 128 && typeof window.render_game_to_text === "function");
    await page.evaluate(() => window.set_locked_in_ring_test_mode({ freeze: true }));
    await page.locator("#p8_start_button").click();
    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });
    await canvas.click();
    await page.waitForFunction(() => window.pico8_state?.frame_number > 5 &&
      JSON.parse(window.render_game_to_text()).mode === "title");
    await button(page, "z");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "fighter-select");
    await button(page, "ArrowRight");
    await button(page, "z");
    if ((await state(page)).selectedFighter !== 2) throw new Error("fighter selection did not persist");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
    if ((await state(page)).bagType !== 2 || (await state(page)).route !== "heavy") {
      throw new Error("default route did not start the heavy bag");
    }

    await page.keyboard.down("ArrowRight");
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.bagX - s.playerX <= 34;
    });
    await page.keyboard.up("ArrowRight");

    let contactCaptured = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const before = await state(page);
      if (before.mode !== "challenge" || before.destructionFrames > 0) break;
      await ready(page);
      await button(page, "z");
      const after = await state(page);
      if (!contactCaptured && after.bagHp < before.bagHp) {
        contactCaptured = true;
        await canvas.screenshot({ path: path.join(output, "02-contact.png") });
      }
    }
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "result", null, { timeout: 8000 });
    const result = await state(page);
    await canvas.screenshot({ path: path.join(output, "03-result.png") });
    if (!contactCaptured || result.result !== 1 || result.hits < 1 || result.selectedFighter !== 2) {
      throw new Error(`invalid end-to-end result: ${JSON.stringify(result)}`);
    }

    await button(page, "z");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
    const replay = await state(page);
    if (replay.bagHp !== replay.bagMaxHp || replay.score !== 0) throw new Error(`rematch did not reset: ${JSON.stringify(replay)}`);
    if (errors.length) throw new Error(`browser errors: ${errors.join(" | ")}`);

    const summary = { result, replay, errors };
    fs.writeFileSync(path.join(output, "summary.json"), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error.stack || String(error)); process.exit(1); });
