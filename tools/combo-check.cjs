const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const output = path.resolve(process.argv[3] || "output/combo");
fs.mkdirSync(output, { recursive: true });

async function tap(page, key, hold = 50) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
}

async function chord(page, keys, hold = 50) {
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  for (const key of [...keys].reverse()) await page.keyboard.up(key);
}

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function link(page, canvas, keys, attack, chain, name) {
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.playerRecovery > 0 && s.playerRecovery <= 5;
  }, null, { timeout: 5000 });
  await chord(page, keys);
  await page.waitForFunction((expected) => {
    const s = JSON.parse(window.render_game_to_text());
    return s.playerAttack === expected && s.playerWindup > 0 && s.playerCombo === 1;
  }, attack, { timeout: 5000 });
  await canvas.screenshot({ path: path.join(output, `${name}-windup.png`) });
  await page.waitForFunction((expected) => JSON.parse(window.render_game_to_text()).playerChain >= expected, chain, { timeout: 5000 });
  await canvas.screenshot({ path: path.join(output, `${name}-contact.png`) });
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
    await page.waitForFunction(() => window.pico8_gpio?.length >= 128);
    await page.evaluate(() => window.set_locked_in_ring_test_mode({ fast: true }));
    await page.locator("#p8_start_button").click();
    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });
    await canvas.click();
    while ((await state(page)).mode !== "fight") {
      await tap(page, "z");
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(180);
    await canvas.screenshot({ path: path.join(output, "00-neutral.png") });
    await page.evaluate(() => { window.pico8_gpio[118] = 1; });
    await page.keyboard.down("ArrowRight");
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.opponentX - s.playerX <= 29;
    }, null, { timeout: 5000 });
    await page.keyboard.up("ArrowRight");

    const before = await state(page);
    await tap(page, "z");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerChain === 1, null, { timeout: 5000 });
    await canvas.screenshot({ path: path.join(output, "01-jab-contact.png") });
    await link(page, canvas, ["x"], 2, 2, "02-straight");
    await link(page, canvas, ["ArrowDown", "x"], 4, 3, "03-body-hook");
    await link(page, canvas, ["ArrowUp", "x"], 5, 4, "04-uppercut");
    const after = await state(page);
    if (after.opponentHp >= before.opponentHp || after.playerChain < 4) {
      throw new Error(`combo did not resolve: ${JSON.stringify({ before, after })}`);
    }
    if (errors.length) throw new Error(errors.join(" | "));
    fs.writeFileSync(path.join(output, "state.json"), JSON.stringify({ before, after }, null, 2));
    console.log(JSON.stringify({ route: "jab > straight > body hook > uppercut", before, after, errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exit(1); });
