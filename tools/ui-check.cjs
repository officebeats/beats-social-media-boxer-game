const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const output = path.resolve(process.argv[3] || "output/ui");
fs.mkdirSync(output, { recursive: true });

async function tap(page, key, hold = 50) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
}

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function pressUntil(page, key, predicate) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (predicate(await state(page))) return;
    await tap(page, key);
    await page.waitForTimeout(50);
  }
  throw new Error(`state transition failed after ${key}: ${JSON.stringify(await state(page))}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 960, height: 760 } });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));
  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.waitForFunction(() => window.pico8_gpio && window.pico8_gpio.length >= 128);
    await page.evaluate(() => window.set_locked_in_ring_test_mode({ fast: true }));
    await page.locator("#p8_start_button").click();
    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });
    await canvas.click();
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "title");

    await pressUntil(page, "z", (current) => current.mode === "select");
    await canvas.screenshot({ path: path.join(output, "01-select.png") });
    for (let fighter = 2; fighter <= 6; fighter += 1) {
      await tap(page, "ArrowRight");
      await page.waitForTimeout(90);
      const selected = await state(page);
      if (selected.selectedFighter !== fighter) throw new Error(`roster cycle failed: ${JSON.stringify(selected)}`);
    }
    await canvas.screenshot({ path: path.join(output, "01-guest-select.png") });
    await pressUntil(page, "z", (current) => current.mode === "fight");
    const guestFight = await state(page);
    if (guestFight.playerFighter !== 6 || guestFight.opponentFighter !== 1) {
      throw new Error(`guest pairing failed: ${JSON.stringify(guestFight)}`);
    }
    await canvas.screenshot({ path: path.join(output, "02-fight.png") });
    if (errors.length) throw new Error(errors.join(" | "));
    const titlePage = await browser.newPage({ viewport: { width: 960, height: 760 } });
    await titlePage.goto(url, { waitUntil: "networkidle" });
    await titlePage.waitForFunction(() => window.pico8_gpio?.length >= 128);
    await titlePage.locator("#p8_start_button").click();
    const titleCanvas = titlePage.locator("canvas").first();
    await titleCanvas.waitFor({ state: "visible" });
    await titlePage.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "title");
    await titleCanvas.screenshot({ path: path.join(output, "00-title.png") });
    await titlePage.close();
    console.log(JSON.stringify({ output, finalState: await state(page), errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exit(1); });
