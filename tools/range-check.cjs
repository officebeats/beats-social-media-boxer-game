const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const output = path.resolve(process.argv[3] || "output/range");
fs.mkdirSync(output, { recursive: true });

async function tap(page, key, hold = 50) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
}

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function scenario(browser, name, targetGap) {
  const page = await browser.newPage({ viewport: { width: 960, height: 760 } });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => typeof window.render_game_to_text === "function");
  await page.evaluate(() => window.set_locked_in_ring_test_mode({ fast: true }));
  await page.locator("#p8_start_button").click();
  const canvas = page.locator("canvas").first();
  await canvas.waitFor({ state: "visible" });
  await canvas.click();
  while ((await state(page)).mode !== "fight") {
    await tap(page, "z");
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => { window.pico8_gpio[118] = 1; });
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.opponentWindup === 0 && s.opponentRecovery === 0;
  });
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction((gap) => {
    const s = JSON.parse(window.render_game_to_text());
    return s.opponentX - s.playerX <= gap;
  }, targetGap);
  await page.keyboard.up("ArrowRight");
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.playerMovement === 0 && s.opponentWindup === 0 && s.opponentRecovery === 0;
  });

  const before = await state(page);
  await tap(page, "z");
  await page.waitForFunction((hp) => JSON.parse(window.render_game_to_text()).opponentHp < hp,
    before.opponentHp, { timeout: 3000 });
  const after = await state(page);
  await canvas.screenshot({ path: path.join(output, `${name}.png`) });
  await page.close();
  if (errors.length) throw new Error(errors.join(" | "));
  return {
    requestedGap: targetGap,
    impactGap: after.opponentX - after.playerX,
    damage: before.opponentHp - after.opponentHp
  };
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  try {
    const optimal = await scenario(browser, "01-optimal-jab", 35);
    const crowded = await scenario(browser, "02-crowded-jab", 28);
    if (optimal.damage <= crowded.damage) {
      throw new Error(`optimal-range jab was not stronger: ${JSON.stringify({ optimal, crowded })}`);
    }
    const result = { optimal, crowded };
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ output, result }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exit(1); });
