const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const outputRoot = path.resolve(process.argv[3] || "output/mobile");

fs.mkdirSync(outputRoot, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readState(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function controlPoint(page, control) {
  return page.evaluate((name) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const r = Math.min(40, Math.min(w, h) / 12);
    const points = {
      left: { x: 1.2 * r, y: h - 3 * r },
      right: { x: 4.8 * r, y: h - 3 * r },
      up: { x: 3 * r, y: h - 4.8 * r },
      down: { x: 3 * r, y: h - 1.2 * r },
      o: { x: w - 4 * r, y: h - 5.5 * r },
      x: { x: w - 4 * r, y: h - 2 * r }
    };
    return points[name];
  }, control);
}

async function pressTouch(page, control, holdMs = 55) {
  const point = await controlPoint(page, control);
  await page.__mobileCdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ ...point, radiusX: 8, radiusY: 8, force: 1, id: 99 }]
  });
  await page.waitForTimeout(Math.min(25, holdMs));
  const held = await page.evaluate(() => ({
    buttons: window.pico8_buttons?.[0],
    frame: window.pico8_state?.frame_number,
    running: window.p8_is_running
  }));
  await page.waitForTimeout(Math.max(0, holdMs - 25));
  await page.__mobileCdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: []
  });
  await page.waitForTimeout(50);
  return { control, point, held };
}

async function pressTouchChord(page, controls, holdMs = 55) {
  const points = await Promise.all(controls.map((control) => controlPoint(page, control)));
  await page.__mobileCdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: points.map((point, index) => ({ ...point, radiusX: 8, radiusY: 8, force: 1, id: 90 + index }))
  });
  await page.waitForTimeout(holdMs);
  await page.__mobileCdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await page.waitForTimeout(50);
}

async function inspectLayout(page, label) {
  const layout = await page.evaluate(() => {
    const box = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
        display: getComputedStyle(element).display
      };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      canvas: {
        ...box(document.querySelector("canvas")),
        backingWidth: document.querySelector("canvas")?.width,
        backingHeight: document.querySelector("canvas")?.height
      },
      left: box(document.querySelector("#controls_left_panel")),
      right: box(document.querySelector("#controls_right_panel")),
      touchLayer: box(document.querySelector("#touch_controls_gfx")),
      bodyOverflow: getComputedStyle(document.body).overflow,
      touchAction: getComputedStyle(document.body).touchAction
    };
  });

  const { viewport, canvas, left, right, touchLayer } = layout;
  assert(canvas && canvas.width >= 256, `${label}: canvas is too small`);
  assert(Math.abs(canvas.width - canvas.height) < 1, `${label}: canvas is not square`);
  assert(canvas.x >= -1 && canvas.y >= -1, `${label}: canvas begins outside viewport`);
  assert(canvas.right <= viewport.width + 1, `${label}: canvas exceeds viewport width`);
  assert(canvas.bottom <= viewport.height + 1, `${label}: canvas exceeds viewport height`);
  assert(left && left.display !== "none" && left.width >= 100, `${label}: D-pad is not visible`);
  assert(right && right.display !== "none" && right.width >= 100, `${label}: O/X panel is not visible`);
  assert(touchLayer && touchLayer.display !== "none", `${label}: touch layer is not visible`);
  assert(left.x >= -1 && left.bottom <= viewport.height + 1, `${label}: D-pad is offscreen`);
  assert(right.right <= viewport.width + 1 && right.bottom <= viewport.height + 1, `${label}: O/X panel is offscreen`);
  assert(layout.bodyOverflow === "hidden", `${label}: body can scroll during play`);
  assert(layout.touchAction === "none", `${label}: browser gestures are not disabled`);
  return layout;
}

async function bootMobile(browser, name, viewport) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  page.__mobileCdp = await context.newCDPSession(page);
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${String(error)}`));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => typeof window.render_game_to_text === "function");
  await page.waitForFunction(() => window.pico8_gpio && window.pico8_gpio.length >= 128);
  await page.evaluate(() => window.set_locked_in_ring_test_mode({ fast: true }));
  await page.locator("#p8_start_button").tap();
  await page.locator("canvas").waitFor({ state: "visible" });
  await page.waitForFunction(() =>
    window.pico8_state?.frame_number > 5 &&
    JSON.parse(window.render_game_to_text()).selectedFighter > 0,
    null,
    { timeout: 20000 }
  );
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "title");
  await page.waitForTimeout(150);
  const layout = await inspectLayout(page, name);
  await page.screenshot({ path: path.join(outputRoot, `${name}-title.png`) });
  return { context, page, errors, layout };
}

async function runPortrait(browser) {
  const session = await bootMobile(browser, "portrait", { width: 390, height: 844 });
  const { context, page, errors } = session;
  const captured = new Set();
  const history = [];

  try {
    const firstTouch = await pressTouch(page, "o", 120);
    fs.writeFileSync(path.join(outputRoot, "portrait-touch-debug.json"), JSON.stringify({
      firstTouch,
      state: await readState(page),
      layout: session.layout
    }, null, 2));
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "select");
    await pressTouch(page, "o");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "fight");

    const deadline = Date.now() + 90000;
    let tick = 0;
    let finalState;
    while (Date.now() < deadline) {
      const state = await readState(page);
      history.push({ tick, ...state });
      if (!captured.has(state.mode) && ["fight", "result"].includes(state.mode)) {
        captured.add(state.mode);
        await inspectLayout(page, `portrait-${state.mode}`);
        await page.screenshot({ path: path.join(outputRoot, `portrait-${state.mode}.png`) });
      }
      if (state.mode === "result") {
        finalState = state;
        break;
      }
      if (state.mode === "fight") {
        const controls = ["right", "right", "o", "x", "down", "left", ["up", "o"]];
        const control = controls[tick % controls.length];
        if (Array.isArray(control)) await pressTouchChord(page, control, 35);
        else await pressTouch(page, control, 35);
      } else if (state.mode === "corner") {
        await page.waitForTimeout(80);
      }
      tick += 1;
    }

    assert(finalState, "portrait: result state was not reached");
    assert([1, 2, 3].includes(finalState.result), `portrait: invalid result ${finalState.result}`);
    await pressTouch(page, "x");
    await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "title");
    assert(errors.length === 0, `portrait: browser errors: ${errors.join(" | ")}`);
    fs.writeFileSync(path.join(outputRoot, "portrait-history.json"), JSON.stringify(history, null, 2));
    return { finalState, modes: [...captured], layout: session.layout };
  } finally {
    await context.close();
  }
}

async function runLandscape(browser) {
  const session = await bootMobile(browser, "landscape", { width: 844, height: 390 });
  try {
    assert(session.errors.length === 0, `landscape: browser errors: ${session.errors.join(" | ")}`);
    await pressTouch(session.page, "o");
    await session.page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "select");
    return { state: await readState(session.page), layout: session.layout };
  } finally {
    await session.context.close();
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });
  try {
    const summary = {
      portrait: await runPortrait(browser),
      landscape: await runLandscape(browser)
    };
    fs.writeFileSync(path.join(outputRoot, "summary.json"), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
