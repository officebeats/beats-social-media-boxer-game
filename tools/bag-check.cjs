const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const testUrl = `${url}${url.includes("?") ? "&" : "?"}test_bridge=1`;
const output = path.resolve(process.argv[3] || "output/bag-check");
fs.mkdirSync(output, { recursive: true });

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function tap(page, key, hold = 50) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
}

async function chord(page, keys, hold = 100) {
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  for (const key of [...keys].reverse()) await page.keyboard.up(key);
}

async function approach(page, targetGap = 34) {
  for (let step = 0; step < 24; step += 1) {
    const current = await state(page);
    if (current.mode !== "challenge" || current.bagX - current.playerX <= targetGap) break;
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(120);
    await page.keyboard.up("ArrowRight");
    await page.waitForTimeout(40);
  }
  const current = await state(page);
  if (current.mode === "challenge" && current.bagX - current.playerX > targetGap) {
    throw new Error(`could not approach target: ${JSON.stringify(current)}`);
  }
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerMovement === 0);
}

async function punch(page, keys, canvas, impactPath, targetGap = 34) {
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.mode !== "challenge" ||
      (s.playerWindup === 0 && s.playerRecovery === 0 && s.playerStun === 0 &&
        s.playerSlowdown === 0 && s.playerStamina >= 8);
  });
  await approach(page, targetGap);
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.mode !== "challenge" || (s.playerWindup === 0 && s.playerRecovery === 0 &&
      s.playerStun === 0 && s.playerSlowdown === 0 && s.playerStamina >= 8);
  });
  const before = await state(page);
  await chord(page, keys);
  try {
    await page.waitForFunction((shots) => {
      const s = JSON.parse(window.render_game_to_text());
      return s.mode !== "challenge" || s.shots > shots || s.playerStun > 0;
    }, before.shots, { timeout: 3000 });
  } catch (error) {
    throw new Error(`attack input was not accepted: ${JSON.stringify({ keys, before, after: await state(page) })}`);
  }
  if (impactPath) {
    await page.waitForFunction((hp) => {
      const s = JSON.parse(window.render_game_to_text());
      return s.bagHp < hp && s.hitStop > 0;
    }, before.bagHp, { timeout: 3000 });
    await canvas.screenshot({ path: impactPath });
  }
  await page.waitForFunction(() => {
    const s = JSON.parse(window.render_game_to_text());
    return s.mode !== "challenge" || s.destructionFrames > 0 ||
      (s.playerWindup === 0 && s.playerRecovery === 0 && s.hitStop === 0);
  }, null, { timeout: 4000 });
  return { before, after: await state(page) };
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  const page = await browser.newPage({ viewport: { width: 960, height: 760 } });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));

  try {
    await page.goto(testUrl, { waitUntil: "networkidle" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.evaluate(() => window.set_locked_in_ring_test_mode({ freeze: true }));
    await page.locator("#p8_start_button").click();
    const canvas = page.locator("canvas").first();
    await canvas.waitFor({ state: "visible" });
    await canvas.click();

    await page.waitForFunction(() =>
      window.pico8_state?.frame_number > 5 &&
      JSON.parse(window.render_game_to_text()).mode === "title"
    );
    await tap(page, "ArrowDown");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "fighter-select");
    await canvas.screenshot({ path: path.join(output, "01-fighter-select.png") });
    await tap(page, "z");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "bag-select");
    await tap(page, "ArrowLeft");
    await canvas.screenshot({ path: path.join(output, "02-speed-select.png") });

    await tap(page, "ArrowRight");
    await canvas.screenshot({ path: path.join(output, "03-heavy-select.png") });
    await tap(page, "ArrowRight");
    await canvas.screenshot({ path: path.join(output, "04-wreck-select.png") });
    await tap(page, "ArrowRight");
    if ((await state(page)).bagType !== 1) throw new Error("bag selection did not wrap to speed bag");

    await tap(page, "z");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
    await canvas.screenshot({ path: path.join(output, "05-intact.png") });

    const low = await punch(page, ["ArrowDown", "z"]);
    if (low.after.bagHp !== low.before.bagHp || low.after.hits !== low.before.hits) {
      throw new Error(`speed bag accepted a low punch: ${JSON.stringify(low)}`);
    }
    const clean = await punch(page, ["z"], canvas, path.join(output, "06-contact.png"));
    if (clean.after.bagHp >= clean.before.bagHp || clean.after.hits <= clean.before.hits) {
      throw new Error(`valid head punch did not damage speed bag: ${JSON.stringify(clean)}`);
    }
    let safety = 0;
    while ((await state(page)).mode === "challenge" && safety < 30) {
      await punch(page, [safety % 2 ? "x" : "z"], canvas);
      const current = await state(page);
      if (current.destructionFrames > 0) {
        await canvas.screenshot({ path: path.join(output, "07-destruction.png") });
        break;
      }
      safety += 1;
    }
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "result",
      null, { timeout: 5000 });
    const result = await state(page);
    await canvas.screenshot({ path: path.join(output, "08-result.png") });
    if (result.result !== 1 || result.score <= 0) throw new Error(`clear result invalid: ${JSON.stringify(result)}`);

    await tap(page, "x");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "bag-select");

    await tap(page, "ArrowRight");
    await tap(page, "z");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
    const body = await punch(page, ["ArrowDown", "x"], canvas, null, 30);
    const bodyDamage = body.before.bagHp - body.after.bagHp;
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerStun > 0,
      null, { timeout: 5000 });
    await canvas.screenshot({ path: path.join(output, "09-heavy-return.png") });
    const head = await punch(page, ["x"], canvas, null, 30);
    const headDamage = head.before.bagHp - head.after.bagHp;
    if (bodyDamage <= headDamage) {
      throw new Error(`heavy bag did not reward body power: ${JSON.stringify({ bodyDamage, headDamage })}`);
    }

    safety = 0;
    while ((await state(page)).mode === "challenge" && (await state(page)).destructionFrames === 0 && safety < 70) {
      await punch(page, ["ArrowDown", "x"], canvas, null, 26);
      safety += 1;
    }
    const heavyEnd = await state(page);
    if (heavyEnd.mode === "challenge" && heavyEnd.destructionFrames === 0) {
      throw new Error(`heavy bag did not clear: ${JSON.stringify({ safety, heavyEnd })}`);
    }
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "result",
      null, { timeout: 5000 });
    await tap(page, "x");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "bag-select");

    await tap(page, "ArrowRight");
    await tap(page, "z");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
    const firstZone = (await state(page)).weakZone;
    await page.waitForFunction((zone) => JSON.parse(window.render_game_to_text()).weakZone !== zone,
      firstZone, { timeout: 4000 });
    const secondZone = (await state(page)).weakZone;
    await canvas.screenshot({ path: path.join(output, "10-wreck-switch.png") });
    if (firstZone === secondZone) throw new Error("wreck bag weak zone did not switch");
    if (errors.length) throw new Error(errors.join(" | "));

    const summary = { low, clean, result, bodyDamage, headDamage, firstZone, secondZone, errors };
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify({ output, result, errors }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error.stack || String(error)); process.exit(1); });
