const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const output = path.resolve(process.argv[3] || "output/mobile");
fs.mkdirSync(output, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function point(page, control) {
  return page.evaluate((name) => {
    const w = innerWidth;
    const h = innerHeight;
    const r = Math.min(40, Math.min(w, h) / 12);
    return {
      left: { x: 1.2 * r, y: h - 3 * r },
      right: { x: 4.8 * r, y: h - 3 * r },
      up: { x: 3 * r, y: h - 4.8 * r },
      down: { x: 3 * r, y: h - 1.2 * r },
      o: { x: w - 4 * r, y: h - 5.5 * r },
      x: { x: w - 4 * r, y: h - 2 * r }
    }[name];
  }, control);
}

async function touch(page, controls, hold = 100) {
  const names = Array.isArray(controls) ? controls : [controls];
  const points = await Promise.all(names.map((name) => point(page, name)));
  await page.__cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: points.map((p, id) => ({ ...p, id: 90 + id, radiusX: 8, radiusY: 8, force: 1 }))
  });
  await page.waitForTimeout(hold);
  await page.__cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(70);
}

async function layout(page, label) {
  const value = await page.evaluate(() => {
    const box = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom, display: getComputedStyle(element).display };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      canvas: box("canvas"),
      left: box("#controls_left_panel"),
      right: box("#controls_right_panel"),
      layer: box("#touch_controls_gfx"),
      overflow: getComputedStyle(document.body).overflow,
      touchAction: getComputedStyle(document.body).touchAction
    };
  });
  const { viewport, canvas, left, right, layer } = value;
  assert(canvas && Math.abs(canvas.width - canvas.height) < 1, `${label}: canvas is not square`);
  assert(canvas.x >= -1 && canvas.y >= -1 && canvas.right <= viewport.width + 1 && canvas.bottom <= viewport.height + 1,
    `${label}: canvas leaves the viewport`);
  assert(left?.display !== "none" && left.width >= 100, `${label}: d-pad is not visible`);
  assert(right?.display !== "none" && right.width >= 100, `${label}: action buttons are not visible`);
  assert(layer?.display !== "none", `${label}: touch overlay is not visible`);
  assert(left.bottom <= viewport.height + 1 && right.right <= viewport.width + 1 && right.bottom <= viewport.height + 1,
    `${label}: controls leave the viewport`);
  assert(value.overflow === "hidden" && value.touchAction === "none", `${label}: browser gestures are not suppressed`);
  return value;
}

async function boot(browser, name, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.__cdp = await context.newCDPSession(page);
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.pico8_gpio?.length >= 128 && typeof window.render_game_to_text === "function");
  await page.evaluate(() => window.set_locked_in_ring_test_mode({ freeze: true }));
  await page.locator("#p8_start_button").tap();
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(() => window.pico8_state?.frame_number > 5 &&
    JSON.parse(window.render_game_to_text()).mode === "title");
  await layout(page, `${name}-title`);
  await page.screenshot({ path: path.join(output, `${name}-title.png`) });
  return { context, page, errors };
}

async function openChallenge(page) {
  await touch(page, "o", 130);
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "fighter-select");
  await touch(page, "o", 130);
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "bag-select");
  await touch(page, "o", 130);
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
}

async function runPortrait(browser) {
  const session = await boot(browser, "portrait", { width: 390, height: 844 });
  const { context, page, errors } = session;
  try {
    await touch(page, "o", 130);
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "fighter-select");
    await touch(page, "o", 130);
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "bag-select");
    await layout(page, "portrait-bag-select");
    await page.screenshot({ path: path.join(output, "portrait-bag-select.png") });
    await touch(page, "o", 130);
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "challenge");
    await layout(page, "portrait-challenge");
    await touch(page, "right", 700);

    const initial = await state(page);
    let contactCaptured = false;
    for (let attempt = 0; attempt < 24 && (await state(page)).mode === "challenge"; attempt += 1) {
      const before = await state(page);
      if (before.destructionFrames > 0) break;
      await page.waitForFunction(() => {
        const s = JSON.parse(window.render_game_to_text());
        return s.mode !== "challenge" || (s.playerWindup === 0 && s.playerRecovery === 0 && s.playerStun === 0 && s.playerStamina >= 3);
      });
      await touch(page, "o", 110);
      const after = await state(page);
      if (!contactCaptured && after.bagHp < before.bagHp) {
        contactCaptured = true;
        await page.screenshot({ path: path.join(output, "portrait-contact.png") });
      }
    }
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "result", null, { timeout: 8000 });
    const result = await state(page);
    await layout(page, "portrait-result");
    await page.screenshot({ path: path.join(output, "portrait-result.png") });
    assert(contactCaptured && result.result === 1 && result.hits > 0, `portrait: invalid clear ${JSON.stringify({ initial, result })}`);
    await touch(page, "x", 130);
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "bag-select");
    assert(errors.length === 0, `portrait: browser errors: ${errors.join(" | ")}`);
    return { initial, result, errors };
  } finally {
    await context.close();
  }
}

async function runLandscape(browser) {
  const session = await boot(browser, "landscape", { width: 844, height: 390 });
  const { context, page, errors } = session;
  try {
    await openChallenge(page);
    const current = await state(page);
    await layout(page, "landscape-challenge");
    await page.screenshot({ path: path.join(output, "landscape-challenge.png") });
    assert(current.mode === "challenge" && current.bagType === 1, `landscape: challenge did not start ${JSON.stringify(current)}`);
    assert(errors.length === 0, `landscape: browser errors: ${errors.join(" | ")}`);
    return { current, errors };
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--use-gl=angle", "--use-angle=swiftshader"] });
  try {
    const summary = { portrait: await runPortrait(browser), landscape: await runLandscape(browser) };
    fs.writeFileSync(path.join(output, "summary.json"), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error.stack || String(error)); process.exit(1); });
