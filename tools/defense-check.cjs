const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const output = path.resolve(process.argv[3] || "output/defense");
fs.mkdirSync(output, { recursive: true });

async function tap(page, key, hold = 50) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
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

async function waitIdle(page) {
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.mode === "fight" && s.playerWindup === 0 && s.playerRecovery === 0 &&
      s.playerBlockStun === 0 && s.playerStun === 0 &&
      s.opponentWindup === 0 && s.opponentRecovery === 0;
  }, null, { timeout: 10000 });
}

async function forceAttack(page, attack) {
  const injected = await page.evaluate((value) => {
    window.pico8_gpio[117] = value;
    return window.pico8_gpio[117];
  }, attack);
  try {
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).opponentWindup > 0,
      null, { timeout: 3000 });
  } catch (error) {
    const pending = await page.evaluate(() => window.pico8_gpio[117]);
    throw new Error(`forced attack did not start: ${JSON.stringify({ injected, pending, state: await state(page) })}`);
  }
}

async function closeRange(page) {
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.opponentX - s.playerX <= 31;
  });
  await page.keyboard.up("ArrowRight");
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerMovement === 0);
}

async function waitBlock(page, type) {
  await page.waitForFunction((expected) => {
    const s = JSON.parse(window.render_game_to_text());
    return s.playerBlockImpact > 0 && s.playerBlockType === expected;
  }, type, { timeout: 3000 });
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
    await page.evaluate(() => { window.pico8_gpio[118] = 1; });

    await closeRange(page);

    const beforeNormal = await state(page);
    await page.keyboard.down("ArrowUp");
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.playerGuard === 1 && s.playerGuardFrames >= 6;
    });
    await forceAttack(page, 2);
    const normal = await waitBlock(page, 1);
    await canvas.screenshot({ path: path.join(output, "01-normal-block.png") });
    await page.keyboard.up("ArrowUp");
    await waitIdle(page);

    const beforeLean = await state(page);
    await page.keyboard.down("ArrowLeft");
    await page.keyboard.down("ArrowUp");
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.playerGuard === 1 && s.playerBlockLean === 1 && s.playerGuardFrames >= 6;
    });
    await forceAttack(page, 2);
    const lean = await waitBlock(page, 2);
    await canvas.screenshot({ path: path.join(output, "02-lean-block.png") });
    await page.keyboard.up("ArrowUp");
    await page.keyboard.up("ArrowLeft");
    await waitIdle(page);
    await closeRange(page);

    const beforeBodyLean = await state(page);
    await page.keyboard.down("ArrowLeft");
    await page.keyboard.down("ArrowDown");
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.playerGuard === 2 && s.playerBlockLean === 1 && s.playerGuardFrames >= 6;
    });
    await forceAttack(page, 4);
    const bodyLean = await waitBlock(page, 2);
    await canvas.screenshot({ path: path.join(output, "02b-body-lean-block.png") });
    await page.keyboard.up("ArrowDown");
    await page.keyboard.up("ArrowLeft");
    await waitIdle(page);
    await closeRange(page);

    const beforePerfect = await state(page);
    await forceAttack(page, 2);
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.opponentWindup > 0 && s.opponentWindup <= 2;
    });
    await page.keyboard.down("ArrowUp");
    const perfect = await waitBlock(page, 3);
    await canvas.screenshot({ path: path.join(output, "03-perfect-block.png") });
    await page.keyboard.up("ArrowUp");

    if (normal.playerHp >= beforeNormal.playerHp) throw new Error("normal block did not apply chip damage");
    if (lean.playerGuardMeter >= beforeLean.playerGuardMeter) {
      throw new Error(`lean block state invalid: ${JSON.stringify({ beforeLean, lean })}`);
    }
    const normalHpLoss = beforeNormal.playerHp - normal.playerHp;
    const leanHpLoss = beforeLean.playerHp - lean.playerHp;
    const normalGuardLoss = beforeNormal.playerGuardMeter - normal.playerGuardMeter;
    const leanGuardLoss = beforeLean.playerGuardMeter - lean.playerGuardMeter;
    if (leanGuardLoss >= normalGuardLoss || leanHpLoss >= normalHpLoss) {
      throw new Error(`lean block did not improve protection: ${JSON.stringify({ normalHpLoss, leanHpLoss, normalGuardLoss, leanGuardLoss })}`);
    }
    if (perfect.playerHp !== beforePerfect.playerHp || perfect.playerCounterTier !== 3 ||
        perfect.playerCounterWindow <= 0 || perfect.opponentCounterSlow < 28) {
      throw new Error(`perfect block state invalid: ${JSON.stringify({ beforePerfect, perfect })}`);
    }
    if (!(normal.opponentCounterSlow < lean.opponentCounterSlow &&
        lean.opponentCounterSlow < perfect.opponentCounterSlow)) {
      throw new Error(`counter slowdown hierarchy invalid: ${JSON.stringify({
        normal: normal.opponentCounterSlow,
        lean: lean.opponentCounterSlow,
        perfect: perfect.opponentCounterSlow
      })}`);
    }

    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerBlockStun === 0);
    const targetHp = perfect.opponentHp;
    await tap(page, "x");
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.playerCounterPunch === 3 && s.playerWindup > 0;
    }, null, { timeout: 3000 });
    await canvas.screenshot({ path: path.join(output, "04-committed-counter.png") });
    try {
      await page.waitForFunction((hp) => JSON.parse(window.render_game_to_text()).opponentHp < hp,
        targetHp, { timeout: 3000 });
    } catch (error) {
      throw new Error(`counter did not land: ${JSON.stringify(await state(page))}`);
    }
    const counterHit = await state(page);
    await canvas.screenshot({ path: path.join(output, "05-counter-impact.png") });

    if (errors.length) throw new Error(errors.join(" | "));
    const result = {
      normal: {
        hpLoss: normalHpLoss,
        guardLoss: normalGuardLoss,
        opponentSlowFrames: normal.opponentCounterSlow
      },
      lean: {
        hpLoss: leanHpLoss,
        guardLoss: leanGuardLoss,
        opponentSlowFrames: lean.opponentCounterSlow
      },
      bodyLean: {
        hpLoss: beforeBodyLean.playerHp - bodyLean.playerHp,
        guardLoss: beforeBodyLean.playerGuardMeter - bodyLean.playerGuardMeter
      },
      perfect: {
        hpLoss: beforePerfect.playerHp - perfect.playerHp,
        counterTier: perfect.playerCounterTier,
        counterWindow: perfect.playerCounterWindow,
        opponentSlowFrames: perfect.opponentCounterSlow
      },
      counter: {
        opponentHpLoss: targetHp - counterHit.opponentHp
      },
      errors
    };
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ output, result }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
