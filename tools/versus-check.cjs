const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const testUrl = `${url}${url.includes("?") ? "&" : "?"}test_bridge=1`;
const output = path.resolve(process.argv[3] || "output/versus");
fs.mkdirSync(output, { recursive: true });

async function state(page) {
  return JSON.parse(await page.evaluate(() => window.render_game_to_text()));
}

async function button(page, key, hold = 90) {
  await page.keyboard.down(key);
  await page.waitForTimeout(hold);
  await page.keyboard.up(key);
  await page.waitForTimeout(70);
}

async function boot(browser, cpuIdle) {
  const page = await browser.newPage({ viewport: { width: 960, height: 760 } });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(testUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.pico8_gpio?.length >= 128 &&
    typeof window.render_game_to_text === "function");
  await page.evaluate((idle) => window.set_locked_in_ring_test_mode({ freeze: true, cpuIdle: idle }), cpuIdle);
  await page.locator("#p8_start_button").click();
  const canvas = page.locator("canvas").first();
  await canvas.waitFor({ state: "visible" });
  await canvas.click();
  await page.waitForFunction(() => window.pico8_state?.frame_number > 5 &&
    JSON.parse(window.render_game_to_text()).mode === "title");
  return { page, canvas, errors };
}

async function startVersus(session) {
  await button(session.page, "x");
  await session.page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "fighter-select");
  await button(session.page, "z");
  await session.page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
  const current = await state(session.page);
  if (current.gameMode !== "versus" || current.route !== "versus" || current.playerHp !== 100 || current.bagHp !== 100) {
    throw new Error(`versus did not initialize: ${JSON.stringify(current)}`);
  }
  return current;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader"] });
  try {
    const live = await boot(browser, false);
    await live.canvas.screenshot({ path: path.join(output, "01-title.png") });
    await button(live.page, "x");
    await live.page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "fighter-select");
    await live.canvas.screenshot({ path: path.join(output, "02-versus-select.png") });
    await button(live.page, "z");
    await live.page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
    await live.canvas.screenshot({ path: path.join(output, "03-versus-neutral.png") });
    await live.page.waitForFunction(() => JSON.parse(window.render_game_to_text()).playerHp < 100, null, { timeout: 12000 });
    const cpuContact = await state(live.page);
    await live.canvas.screenshot({ path: path.join(output, "04-cpu-contact.png") });
    if (cpuContact.opponentAttack < 1 || live.errors.length) {
      throw new Error(`CPU contact failed: ${JSON.stringify({ cpuContact, errors: live.errors })}`);
    }
    await live.page.close();

    const win = await boot(browser, true);
    await startVersus(win);
    await win.page.keyboard.down("ArrowRight");
    await win.page.waitForFunction(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.opponentX - s.playerX <= 34;
    });
    await win.page.keyboard.up("ArrowRight");

    let contact = false;
    for (let attempt = 0; attempt < 20 && (await state(win.page)).mode === "challenge"; attempt += 1) {
      if ((await state(win.page)).opponentX - (await state(win.page)).playerX > 34) {
        await win.page.keyboard.down("ArrowRight");
        await win.page.waitForFunction(() => {
          const s = JSON.parse(window.render_game_to_text());
          return s.mode !== "challenge" || s.opponentX - s.playerX <= 34;
        });
        await win.page.keyboard.up("ArrowRight");
      }
      await win.page.waitForFunction(() => {
        const s = JSON.parse(window.render_game_to_text());
        return s.mode !== "challenge" || (s.playerWindup === 0 && s.playerRecovery === 0 &&
          s.playerStun === 0 && s.playerStamina >= 6);
      });
      const before = await state(win.page);
      await button(win.page, "x");
      await win.page.waitForFunction((hp) => {
        const s = JSON.parse(window.render_game_to_text());
        return s.mode !== "challenge" || s.bagHp < hp ||
          (s.playerWindup === 0 && s.playerRecovery === 0);
      }, before.bagHp, { timeout: 2500 });
      const after = await state(win.page);
      if (!contact && after.bagHp < before.bagHp) {
        contact = true;
        await win.canvas.screenshot({ path: path.join(output, "05-player-contact.png") });
      }
    }
    const finalState = await state(win.page);
    if (finalState.mode !== "result") throw new Error(`versus did not finish: ${JSON.stringify(finalState)}`);
    const result = await state(win.page);
    await win.canvas.screenshot({ path: path.join(output, "06-versus-result.png") });
    if (!contact || result.result !== 1 || result.playerHp !== 100 || result.bagHp !== 0 || win.errors.length) {
      throw new Error(`player win failed: ${JSON.stringify({ result, errors: win.errors })}`);
    }
    await button(win.page, "z");
    await win.page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
    const replay = await state(win.page);
    if (replay.playerHp !== 100 || replay.bagHp !== 100 || replay.gameMode !== "versus") {
      throw new Error(`versus replay failed: ${JSON.stringify(replay)}`);
    }
    const summary = { cpuContact, result, replay, errors: [] };
    fs.writeFileSync(path.join(output, "summary.json"), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
    await win.page.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
