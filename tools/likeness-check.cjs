const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const output = path.resolve(process.argv[3] || "output/likeness-check");
fs.mkdirSync(output, { recursive: true });

async function state(page) {
  return JSON.parse(await page.evaluate(() => window.render_game_to_text()));
}

async function button(page, key, hold = 100) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
  await page.waitForTimeout(80);
}

async function boot(browser) {
  const page = await browser.newPage({ viewport: { width: 960, height: 760 } });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.pico8_gpio?.length >= 128 &&
    typeof window.render_game_to_text === "function");
  await page.evaluate(() => window.set_locked_in_ring_test_mode({ freeze: true }));
  await page.locator("#p8_start_button").click();
  const canvas = page.locator("canvas").first();
  await canvas.waitFor({ state: "visible" });
  await canvas.click();
  await page.waitForFunction(() => window.pico8_state?.frame_number > 5 &&
    JSON.parse(window.render_game_to_text()).mode === "title");
  return { page, canvas, errors };
}

async function enterSelect(session) {
  await button(session.page, "z");
  await session.page.waitForFunction(() =>
    JSON.parse(window.render_game_to_text()).mode === "fighter-select");
}

async function captureFight(browser, fighter, slug) {
  const session = await boot(browser);
  const { page, canvas, errors } = session;
  await enterSelect(session);
  if (fighter === 2) await button(page, "ArrowRight");
  if ((await state(page)).selectedFighter !== fighter) throw new Error(`${slug} selection failed`);
  await button(page, "z");
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "bag-select");
  await button(page, "z");
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.bagX - s.playerX <= 34;
  });
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(180);
  await canvas.screenshot({ path: path.join(output, `${slug}-neutral.png`) });

  const before = await state(page);
  await button(page, "z", 80);
  await page.waitForFunction((hp) => JSON.parse(window.render_game_to_text()).bagHp < hp, before.bagHp);
  await canvas.screenshot({ path: path.join(output, `${slug}-contact.png`) });
  const after = await state(page);
  if (after.selectedFighter !== fighter || after.hits < 1 || errors.length) {
    throw new Error(`${slug} capture failed: ${JSON.stringify({ after, errors })}`);
  }
  await page.close();
  return after;
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"],
  });
  try {
    const select = await boot(browser);
    await enterSelect(select);
    await select.canvas.screenshot({ path: path.join(output, "select-ab.png") });
    await button(select.page, "ArrowRight");
    await select.canvas.screenshot({ path: path.join(output, "select-dg.png") });
    if (select.errors.length) throw new Error(`select errors: ${select.errors.join(" | ")}`);
    await select.page.close();

    const broner = await captureFight(browser, 1, "ab");
    const deen = await captureFight(browser, 2, "dg");
    const summary = { broner, deen, errors: [] };
    fs.writeFileSync(path.join(output, "summary.json"), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
