const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";

async function tap(page, key, hold = 50) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
}

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function reachFight(page) {
  while ((await state(page)).mode !== "fight") {
    await tap(page, "z");
    await page.waitForTimeout(80);
  }
}

async function forceAttack(page, attack) {
  await page.evaluate((value) => { window.pico8_gpio[117] = value; }, attack);
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).opponentWindup > 0);
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
    await page.evaluate(() => window.set_locked_in_ring_test_mode({ fast: true }));
    await page.locator("#p8_start_button").click();
    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });
    await canvas.click();
    await reachFight(page);
    await page.evaluate(() => { window.pico8_gpio[118] = 1; });

    await page.keyboard.down("ArrowRight");
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.opponentX - s.playerX <= 30;
    });
    await page.keyboard.up("ArrowRight");

    const beforeBlock = await state(page);
    await page.keyboard.down("ArrowLeft");
    await forceAttack(page, 2);
    try {
      await page.waitForFunction(() => {
        const s = JSON.parse(window.render_game_to_text());
        return s.playerBlockImpact > 0 && s.playerBlockType > 0;
      }, null, { timeout: 3000 });
    } catch (error) {
      throw new Error(`back block did not resolve: ${JSON.stringify(await state(page))}`);
    }
    const backBlock = await state(page);
    await page.keyboard.up("ArrowLeft");

    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.playerBlockImpact === 0 && s.playerBlockStun === 0 && s.opponentRecovery === 0;
    });
    await page.keyboard.down("ArrowRight");
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.opponentX - s.playerX <= 30;
    });
    await page.keyboard.up("ArrowRight");

    const beforeCounter = await state(page);
    await forceAttack(page, 2);
    await tap(page, "z");
    await page.waitForFunction((hp) => {
      const s = JSON.parse(window.render_game_to_text());
      return s.opponentHp < hp && s.opponentWindup === 0;
    }, beforeCounter.opponentHp);
    const counterHit = await state(page);

    if (backBlock.playerHp >= beforeBlock.playerHp || backBlock.playerHp < beforeBlock.playerHp - 2) {
      throw new Error(`back block did not reduce damage: ${JSON.stringify({ beforeBlock, backBlock })}`);
    }
    if (counterHit.playerHp !== beforeCounter.playerHp || counterHit.opponentHp >= beforeCounter.opponentHp) {
      throw new Error(`counter hit traded or missed: ${JSON.stringify({ beforeCounter, counterHit })}`);
    }
    if (errors.length) throw new Error(errors.join(" | "));
    console.log(JSON.stringify({ backBlock, counterHit, errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exit(1); });
