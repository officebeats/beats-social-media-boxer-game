const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const url = process.argv[2] || "http://127.0.0.1:4173";
const outputRoot = path.resolve(process.argv[3] || "output/playthrough");
const normalOnly = process.argv.includes("--normal");
const singleOnly = process.argv.includes("--single");

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

async function tap(page, key, holdMs = 45) {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
}

async function chord(page, keys, holdMs = 45) {
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  for (const key of [...keys].reverse()) await page.keyboard.up(key);
}

async function readState(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function driveActiveMode(page, state, tick, scenario) {
  if (state.mode === "title") {
    await tap(page, "z");
    return;
  }

  if (state.mode === "select") {
    if (state.selectedFighter !== scenario.fighter) await tap(page, "ArrowRight");
    else await tap(page, "z");
    return;
  }

  if (state.mode === "fight") {
    const patterns = [
      ["ArrowRight"],
      ["ArrowRight"],
      ["ArrowRight", "z"],
      ["z"],
      ["x"],
      ["ArrowDown", "z"],
      ["ArrowUp"],
      ["ArrowLeft"]
    ];
    await chord(page, patterns[tick % patterns.length], 35);
    return;
  }

  if (state.mode === "corner") await tap(page, "z");
}

async function runScenario(browser, scenario) {
  const directory = path.join(outputRoot, scenario.name);
  ensureDirectory(directory);
  const page = await browser.newPage({ viewport: { width: 960, height: 760 } });
  const errors = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${String(error)}`));

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => typeof window.render_game_to_text === "function");
  await page.waitForFunction(() => window.pico8_gpio && window.pico8_gpio.length >= 128);
  await page.evaluate((flags) => window.set_locked_in_ring_test_mode(flags), scenario.flags);

  const startButton = page.locator("#p8_start_button");
  await startButton.click();
  const canvas = page.locator("canvas").first();
  await canvas.waitFor({ state: "visible" });
  await canvas.click();
  await page.waitForFunction(() => JSON.parse(window.render_game_to_text()).mode === "title");
  await page.waitForTimeout(250);
  await canvas.screenshot({ path: path.join(directory, "00-title.png") });

  const history = [];
  const capturedModes = new Set();
  const deadline = Date.now() + scenario.timeoutMs;
  let tick = 0;
  let finalState = null;
  let previousFightState = null;
  let impactCaptured = false;

  while (Date.now() < deadline) {
    const state = await readState(page);
    history.push({ tick, ...state });

    if (state.mode === "fight") {
      const hpChanged = previousFightState && (
        state.playerHp < previousFightState.playerHp ||
        state.opponentHp < previousFightState.opponentHp
      );
      if (hpChanged && !impactCaptured) {
        impactCaptured = true;
        await canvas.screenshot({ path: path.join(directory, "05-impact.png") });
      }
      previousFightState = state;
    }

    if (!capturedModes.has(state.mode) && ["fight", "result"].includes(state.mode)) {
      capturedModes.add(state.mode);
      await canvas.screenshot({ path: path.join(directory, `${String(capturedModes.size).padStart(2, "0")}-${state.mode}.png`) });
    }

    if (state.mode === "result") {
      finalState = state;
      break;
    }

    await driveActiveMode(page, state, tick, scenario);
    await page.waitForTimeout(55);
    tick += 1;
  }

  fs.writeFileSync(path.join(directory, "history.json"), JSON.stringify(history, null, 2));
  fs.writeFileSync(path.join(directory, "errors.json"), JSON.stringify(errors, null, 2));

  if (!finalState) throw new Error(`${scenario.name}: result state not reached`);
  if (!impactCaptured) throw new Error(`${scenario.name}: no visible impact frame was captured`);
  if (![1, 2, 3].includes(finalState.result)) throw new Error(`${scenario.name}: invalid result ${finalState.result}`);
  if (errors.length) throw new Error(`${scenario.name}: browser errors: ${errors.join(" | ")}`);
  if (finalState.selectedFighter !== scenario.fighter) {
    throw new Error(`${scenario.name}: expected fighter ${scenario.fighter}, received ${finalState.selectedFighter}`);
  }

  await tap(page, scenario.restartKey);
  await page.waitForTimeout(150);
  const restartState = await readState(page);
  if (restartState.mode !== scenario.restartMode) {
    throw new Error(`${scenario.name}: expected ${scenario.restartMode} after restart, received ${restartState.mode}`);
  }

  await page.close();
  return { scenario: scenario.name, finalState, restartState, ticks: tick };
}

(async () => {
  ensureDirectory(outputRoot);
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"]
  });

  try {
    const results = [];
    if (normalOnly) {
      results.push(await runScenario(browser, {
        name: "normal-fight",
        fighter: 1,
        flags: { fast: false },
        restartKey: "x",
        restartMode: "title",
        timeoutMs: 300000
      }));
    } else {
      results.push(await runScenario(browser, {
        name: "ab-fight",
        fighter: 1,
        flags: { fast: true },
        restartKey: "z",
        restartMode: "fight",
        timeoutMs: 90000
      }));
      if (!singleOnly) {
        results.push(await runScenario(browser, {
          name: "dg-fight",
          fighter: 2,
          flags: { fast: true },
          restartKey: "x",
          restartMode: "title",
          timeoutMs: 90000
        }));
      }
    }
    fs.writeFileSync(path.join(outputRoot, "summary.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
