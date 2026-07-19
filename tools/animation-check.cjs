const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const output = path.resolve(process.argv[3] || "output/animation");
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
  for (let tick = 0; tick < 900; tick += 1) {
    const current = await state(page);
    if (current.mode === "fight") return;
    if (current.mode === "title") await tap(page, "z");
    else if (current.mode === "select") await tap(page, "z");
    else if (current.mode === "corner") await tap(page, "z");
    await page.waitForTimeout(45);
  }
  throw new Error("fight state was not reached");
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

    const quickStepStart = await state(page);
    await tap(page, "ArrowRight", 30);
    await page.waitForTimeout(70);
    await tap(page, "ArrowRight", 30);
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerQuickStep > 0);
    await canvas.screenshot({ path: path.join(output, "00-quick-step.png") });
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerQuickStep === 0);
    const quickStepDistance = (await state(page)).playerX - quickStepStart.playerX;
    if (quickStepDistance < 4) throw new Error(`quick-step traveled only ${quickStepDistance} pixels`);

    const walkFiles = [];
    await page.keyboard.down("ArrowRight");
    for (let frame = 1; frame <= 4; frame += 1) {
      await page.waitForTimeout(70);
      const file = path.join(output, `00-walk-${frame}.png`);
      await canvas.screenshot({ path: file });
      walkFiles.push(file);
    }
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.opponentX - s.playerX <= 31;
    });
    await page.keyboard.up("ArrowRight");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerMovement === 0);

    const hashes = walkFiles.map((file) => crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex"));
    if (new Set(hashes).size < 3) throw new Error(`walk cycle produced too few distinct frames: ${hashes}`);

    const targetHp = (await state(page)).opponentHp;
    await page.evaluate(() => {
      const trace = window.__lockedInRingAnimationTrace = { samples: [], injected: false, done: false };
      const read = () => {
        const sample = JSON.parse(window.render_game_to_text());
        return { hitStop: sample.hitStop, playerRecovery: sample.playerRecovery };
      };
      const observe = () => {
        const sample = read();
        trace.samples.push(sample);
        if (sample.hitStop > 0 && !trace.injected) {
          window.pico8_buttons[0] |= 1 << 4;
          trace.injected = true;
        } else if (trace.injected && sample.hitStop === 0) {
          window.pico8_buttons[0] &= ~(1 << 4);
          trace.done = true;
        }
        if (!trace.done && trace.samples.length < 600) requestAnimationFrame(observe);
      };
      requestAnimationFrame(observe);
    });
    await tap(page, "x");
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.playerRecovery > 0 && s.hitStop > 0;
    }, null, { timeout: 3000 });
    const impact = await state(page);
    await canvas.screenshot({ path: path.join(output, "01-impact-hold.png") });

    await page.waitForFunction(() => window.__lockedInRingAnimationTrace?.done, null, { timeout: 3000 });
    const freezeSamples = await page.evaluate(() => window.__lockedInRingAnimationTrace.samples);
    const heldSamples = freezeSamples.filter((sample) => sample.hitStop > 0);
    if (!heldSamples.length) throw new Error(`hit-stop ended before a frozen frame was observed: ${JSON.stringify(freezeSamples)}`);
    const advanced = heldSamples.find((sample) => sample.playerRecovery !== impact.playerRecovery);
    if (advanced) {
      throw new Error(`recovery advanced during hit-stop: ${impact.playerRecovery} -> ${JSON.stringify(freezeSamples)}`);
    }
    const frozen = heldSamples.at(-1);
    await canvas.screenshot({ path: path.join(output, "02-impact-freeze.png") });

    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.playerRecovery > 0 && s.playerRecovery <= 6;
    });
    await canvas.screenshot({ path: path.join(output, "03-smooth-recovery.png") });
    await page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.playerAttack === 1 && s.playerWindup > 0;
    }, null, { timeout: 5000 });
    await canvas.screenshot({ path: path.join(output, "04-buffered-jab.png") });

    const final = await state(page);
    if (final.opponentHp >= targetHp) throw new Error("the impact sequence did not damage the opponent");
    if (errors.length) throw new Error(errors.join(" | "));
    const result = {
      distinctWalkFrames: new Set(hashes).size,
      quickStepDistance,
      impactHitStop: impact.hitStop,
      frozenRecovery: frozen.playerRecovery,
      bufferedAttack: final.playerAttack,
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
