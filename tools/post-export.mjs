import fs from "node:fs";
import path from "node:path";

const htmlPath = process.argv[2];
if (!htmlPath) throw new Error("Usage: node post-export.mjs <exported-index.html>");

const resolvedPath = path.resolve(htmlPath);
let html = fs.readFileSync(resolvedPath, "utf8");

html = html.replace(
  /<meta name="viewport"[^>]*>/i,
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">'
);

const marker = "locked-in-ring-test-bridge";
if (html.includes(marker)) {
  console.log(`Bridge already present: ${resolvedPath}`);
  process.exit(0);
}

const bridge = `
<script id="${marker}">
(() => {
  const mobileStyle = document.createElement("style");
  mobileStyle.textContent = \`
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      overscroll-behavior: none;
      touch-action: none;
      background: #0d0d12;
    }
    #p8_frame_0 {
      max-width: 100vw !important;
      max-height: 100dvh !important;
    }
    canvas {
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  \`;
  document.head.appendChild(mobileStyle);

  const stateNames = ["title", "select", "fight", "corner", "result"];
  const pin = (index) => {
    const value = window.pico8_gpio && window.pico8_gpio[index];
    return Number.isFinite(value) ? value : 0;
  };

  window.render_game_to_text = () => JSON.stringify({
    coordinateSystem: "PICO-8 canvas: origin top-left, x right, y down, 128x128",
    mode: stateNames[pin(0)] || "unknown",
    round: pin(1),
    playerHp: pin(2),
    opponentHp: pin(3),
    result: pin(4),
    selectedFighter: pin(5),
    playerAttack: pin(6),
    playerWindup: pin(7),
    playerRecovery: pin(8),
    playerDodge: pin(9),
    playerFeint: pin(10),
    opponentAttack: pin(11),
    opponentWindup: pin(12),
    playerMovement: pin(13) - 1,
    opponentMovement: pin(14) - 1,
    playerX: pin(15),
    opponentX: pin(16),
    playerGuard: pin(17),
    playerGuardFrames: pin(18),
    playerBlockLean: pin(19),
    playerBlockImpact: pin(20),
    playerBlockType: pin(21),
    playerCounterWindow: pin(22),
    playerCounterTier: pin(23),
    playerCounterPunch: pin(24),
    playerGuardMeter: pin(25),
    playerBlockStun: pin(26),
    opponentRecovery: pin(27),
    playerStun: pin(28),
    hitStop: pin(29),
    playerQuickStep: pin(30),
    playerCombo: pin(31),
    playerChain: pin(32),
    playerFighter: pin(33),
    opponentFighter: pin(34),
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      touch: Boolean(window.p8_touch_detected)
    }
  });

  window.advanceTime = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, Math.max(0, milliseconds));
  });

  window.set_locked_in_ring_test_mode = ({ fast = false } = {}) => {
    if (!window.pico8_gpio) throw new Error("PICO-8 GPIO is not ready");
    window.pico8_gpio[127] = fast ? 1 : 0;
  };

  const remap = new Map([
    ["KeyA", 4],
    ["KeyB", 5]
  ]);

  const forward = (event) => {
    const bit = remap.get(event.code);
    if (bit === undefined || !window.pico8_buttons) return;
    if (event.type === "keydown") window.pico8_buttons[0] |= 1 << bit;
    else window.pico8_buttons[0] &= ~(1 << bit);
    event.preventDefault();
  };

  window.addEventListener("keydown", (event) => {
    if (event.code === "KeyF" && !event.repeat) {
      const canvas = document.querySelector("canvas");
      if (document.fullscreenElement) document.exitFullscreen();
      else if (canvas) canvas.requestFullscreen();
      event.preventDefault();
      return;
    }
    forward(event);
  }, true);
  window.addEventListener("keyup", forward, true);
})();
</script>`;

if (!html.includes("</body>")) throw new Error(`No </body> tag found in ${resolvedPath}`);
html = html.replace("</body>", `${bridge}\n</body>`);
html = html.replace(/<title>.*?<\/title>/i, "<title>Locked-In Ring</title>");
fs.writeFileSync(resolvedPath, html, "utf8");
console.log(`Injected test/fullscreen bridge: ${resolvedPath}`);
