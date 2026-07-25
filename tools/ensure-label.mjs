import fs from "node:fs";
import path from "node:path";

const cartPath = process.argv[2];
if (!cartPath) throw new Error("Usage: node ensure-label.mjs <cartridge.p8>");

const resolvedPath = path.resolve(cartPath);
let cart = fs.readFileSync(resolvedPath, "utf8");
if (/^__label__$/m.test(cart)) {
  console.log(`Cartridge label already present: ${resolvedPath}`);
  process.exit(0);
}

const width = 128;
const height = 128;
const pixels = Array.from({ length: height }, () => Array(width).fill(1));

function pixel(x, y, color) {
  if (x >= 0 && x < width && y >= 0 && y < height) pixels[y][x] = color;
}

function rect(x0, y0, x1, y1, color) {
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) pixel(x, y, color);
  }
}

const font = {
  A: ["010", "101", "111", "101", "101"],
  C: ["011", "100", "100", "100", "011"],
  E: ["111", "100", "110", "100", "111"],
  G: ["011", "100", "101", "101", "011"],
  H: ["101", "101", "111", "101", "101"],
  I: ["111", "010", "010", "010", "111"],
  L: ["100", "100", "100", "100", "111"],
  M: ["101", "111", "111", "101", "101"],
  N: ["101", "111", "111", "111", "101"],
  O: ["010", "101", "101", "101", "010"],
  P: ["110", "101", "110", "100", "100"],
  R: ["110", "101", "110", "101", "101"],
  S: ["011", "100", "010", "001", "110"],
  T: ["111", "010", "010", "010", "010"],
  U: ["101", "101", "101", "101", "011"],
  Z: ["111", "001", "010", "100", "111"],
  " ": ["000", "000", "000", "000", "000"],
};

function textWidth(text, scale) {
  return text.length * 4 * scale - scale;
}

function drawText(text, y, color, scale) {
  let x = Math.floor((width - textWidth(text, scale)) / 2);
  for (const character of text) {
    const glyph = font[character] || font[" "];
    for (let gy = 0; gy < glyph.length; gy += 1) {
      for (let gx = 0; gx < glyph[gy].length; gx += 1) {
        if (glyph[gy][gx] === "1") {
          rect(
            x + gx * scale,
            y + gy * scale,
            x + (gx + 1) * scale - 1,
            y + (gy + 1) * scale - 1,
            color
          );
        }
      }
    }
    x += 4 * scale;
  }
}

// Background — deep navy + gem strip
rect(0, 0, 127, 127, 1);
rect(4, 4, 123, 123, 0);
// gem colors strip
const gems = [8, 11, 12, 10];
for (let i = 0; i < 8; i += 1) {
  const c = gems[i % 4];
  rect(12 + i * 13, 40, 22 + i * 13, 50, c);
  pixel(14 + i * 13, 42, 7);
}
// crash star on one gem
pixel(18, 45, 7);
pixel(17, 45, 7);
pixel(19, 45, 7);
pixel(18, 44, 7);
pixel(18, 46, 7);

drawText("RING RUSH", 14, 10, 2);
drawText("PUZZLE", 58, 14, 2);
drawText("FIGHTERS", 78, 7, 2);

// mini chibi silhouettes
rect(30, 95, 42, 110, 14);
rect(32, 88, 40, 96, 15);
rect(86, 95, 98, 110, 8);
rect(88, 88, 96, 96, 4);

drawText("VS", 100, 10, 1);

const label = pixels.map((row) => row.map((value) => value.toString(16)).join("")).join("\n");
cart = `${cart.trimEnd()}\n__label__\n${label}\n`;
fs.writeFileSync(resolvedPath, cart, "utf8");
console.log(`Generated cartridge label: ${resolvedPath}`);
