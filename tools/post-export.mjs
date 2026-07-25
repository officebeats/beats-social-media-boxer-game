import fs from "node:fs";
import path from "node:path";

const htmlPath = process.argv[2];
if (!htmlPath) throw new Error("Usage: node post-export.mjs <exported-index.html>");

const resolvedPath = path.resolve(htmlPath);
let html = fs.readFileSync(resolvedPath, "utf8");

html = html.replace(
  /<title>[^<]*<\/title>/i,
  "<title>Ring Rush Puzzle Fighters</title>"
);

html = html.replace(
  /<meta name="viewport"[^>]*>/i,
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">'
);

const marker = "ring-rush-web-shell";
if (html.includes(marker)) {
  console.log(`Shell already present: ${resolvedPath}`);
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
      background: #0a0a12;
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

  // Fullscreen helper: press F
  window.addEventListener("keydown", (e) => {
    if (e.key === "f" || e.key === "F") {
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        el.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  });
})();
</script>
`;

if (html.includes("</body>")) {
  html = html.replace("</body>", `${bridge}</body>`);
} else {
  html += bridge;
}

fs.writeFileSync(resolvedPath, html, "utf8");
console.log(`Post-export shell applied: ${resolvedPath}`);
