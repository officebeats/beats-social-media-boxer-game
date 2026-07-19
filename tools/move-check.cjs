const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const output = path.resolve(process.argv[3] || "output/moves");
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

async function reachFight(page) {
  let tick = 0;
  while (tick < 900) {
    const current = await state(page);
    if (current.mode === "fight") return current;
    if (current.mode === "title") await tap(page, "z");
    else if (current.mode === "select") await tap(page, "z");
    else if (current.mode === "corner") await tap(page, "z");
    await page.waitForTimeout(45);
    tick += 1;
  }
  throw new Error("fight state was not reached");
}

async function waitReady(page) {
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.mode === "fight" && s.playerWindup === 0 && s.playerRecovery === 0
      && s.playerStun === 0 && s.playerDodge === 0;
  }, null, { timeout: 10000 });
}

async function captureMove(page, canvas, name, keys, attack) {
  await waitReady(page);
  await chord(page, keys);
  await page.waitForFunction((expected) => {
    const s = JSON.parse(window.render_game_to_text());
    return s.mode === "fight" && s.playerAttack === expected && s.playerWindup > 0;
  }, attack, { timeout: 3000 });
  await canvas.screenshot({ path: path.join(output, `${name}-windup.png`) });

  if (attack === 6) {
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerFeint > 0, null, { timeout: 3000 });
  } else {
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerRecovery > 0, null, { timeout: 3000 });
  }
  await canvas.screenshot({ path: path.join(output, `${name}-active.png`) });
  if (attack !== 6) {
    const halfway = Math.ceil(({ 1: 8, 2: 13, 3: 10, 4: 13, 5: 12 })[attack] / 2);
    await page.waitForFunction((limit) => {
      const s = JSON.parse(window.render_game_to_text());
      return s.playerRecovery > 0 && s.playerRecovery <= limit;
    }, halfway, { timeout: 3000 });
    await canvas.screenshot({ path: path.join(output, `${name}-retract.png`) });
  }
  return state(page);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const page = await browser.newPage({ viewport: { width: 960, height: 760 } });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${String(error)}`));

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
    await reachFight(page);

    const beforeStep = await state(page);
    await page.keyboard.down("ArrowRight");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerMovement === 1);
    await canvas.screenshot({ path: path.join(output, "00-footwork-step.png") });
    await page.waitForTimeout(220);
    const duringStep = await state(page);
    await page.keyboard.up("ArrowRight");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerMovement === 0);
    const afterStep = await state(page);
    if (duringStep.playerX <= beforeStep.playerX || afterStep.opponentX - afterStep.playerX < 28) {
      throw new Error(`invalid footwork ${JSON.stringify({ beforeStep, duringStep, afterStep })}`);
    }
    await canvas.screenshot({ path: path.join(output, "00-neutral.png") });

    await waitReady(page);
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.mode === "fight" && s.opponentWindup > 0;
    }, null, { timeout: 10000 });
    await tap(page, "ArrowLeft");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerDodge > 0, null, { timeout: 2000 });
    await canvas.screenshot({ path: path.join(output, "01-dodge.png") });
    await page.waitForTimeout(600);
    await page.evaluate(() => { window.pico8_gpio[118] = 1; });

    const results = {};
    results.feint = await captureMove(page, canvas, "02-feint", ["ArrowUp", "z"], 6);
    results.straight = await captureMove(page, canvas, "03-straight", ["x"], 2);
    results.bodyJab = await captureMove(page, canvas, "04-body-jab", ["ArrowDown", "z"], 3);
    results.bodyHook = await captureMove(page, canvas, "05-body-hook", ["ArrowDown", "x"], 4);
    results.uppercut = await captureMove(page, canvas, "06-uppercut", ["ArrowUp", "x"], 5);

    if (errors.length) throw new Error(errors.join(" | "));
    fs.writeFileSync(path.join(output, "states.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify({ output, moves: Object.keys(results), errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
