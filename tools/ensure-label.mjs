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

function line(x0, y0, x1, y1, color) {
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  while (true) {
    pixel(x0, y0, color);
    if (x0 === x1 && y0 === y1) break;
    const twice = error * 2;
    if (twice >= dy) {
      error += dy;
      x0 += sx;
    }
    if (twice <= dx) {
      error += dx;
      y0 += sy;
    }
  }
}

const font = {
  A: ["010", "101", "111", "101", "101"],
  C: ["011", "100", "100", "100", "011"],
  D: ["110", "101", "101", "101", "110"],
  E: ["111", "100", "110", "100", "111"],
  F: ["111", "100", "110", "100", "100"],
  G: ["011", "100", "101", "101", "011"],
  I: ["111", "010", "010", "010", "111"],
  K: ["101", "101", "110", "101", "101"],
  L: ["100", "100", "100", "100", "111"],
  N: ["101", "111", "111", "111", "101"],
  O: ["010", "101", "101", "101", "010"],
  R: ["110", "101", "110", "101", "101"],
  S: ["011", "100", "010", "001", "110"],
  T: ["111", "010", "010", "010", "010"],
  V: ["101", "101", "101", "101", "010"],
  " ": ["000", "000", "000", "000", "000"]
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
          rect(x + gx * scale, y + gy * scale, x + (gx + 1) * scale - 1, y + (gy + 1) * scale - 1, color);
        }
      }
    }
    x += 4 * scale;
  }
}

rect(0, 0, 127, 127, 1);
rect(4, 4, 123, 123, 0);
rect(7, 7, 120, 120, 5);
rect(9, 9, 118, 118, 1);
drawText("LOCKED IN", 12, 10, 2);
drawText("RING", 25, 7, 2);

for (let x = 10; x <= 117; x += 12) {
  rect(x, 43, x + 5, 46, 0);
  rect(x + 2, 40, x + 3, 42, 6);
}
rect(9, 47, 118, 48, 8);
rect(9, 58, 118, 59, 7);
rect(9, 69, 118, 70, 12);
line(9, 92, 118, 92, 6);
line(18, 113, 109, 113, 5);
line(18, 113, 9, 92, 5);
line(109, 113, 118, 92, 5);

rect(25, 60, 38, 83, 2);
rect(26, 51, 36, 61, 4);
rect(28, 49, 35, 52, 0);
rect(24, 64, 29, 75, 15);
rect(37, 63, 45, 69, 13);
rect(42, 61, 48, 67, 13);
rect(26, 83, 31, 104, 2);
rect(34, 83, 39, 104, 2);
line(30, 104, 24, 111, 13);
line(38, 104, 43, 111, 13);

rect(89, 60, 102, 83, 3);
rect(91, 50, 101, 61, 4);
rect(89, 48, 91, 55, 0);
rect(93, 46, 95, 53, 0);
rect(97, 47, 99, 54, 0);
rect(97, 63, 104, 75, 15);
rect(81, 62, 90, 68, 11);
rect(76, 60, 83, 66, 11);
rect(89, 83, 94, 104, 3);
rect(97, 83, 102, 104, 3);
line(91, 104, 86, 111, 11);
line(100, 104, 106, 111, 11);

rect(51, 77, 76, 80, 0);
rect(54, 74, 73, 83, 1);
drawText("GO", 75, 10, 1);
drawText("CRAFT OVER NOISE", 116, 6, 1);

const label = pixels.map((row) => row.map((value) => value.toString(16)).join("")).join("\n");
cart = `${cart.trimEnd()}\n__label__\n${label}\n`;
fs.writeFileSync(resolvedPath, cart, "utf8");
console.log(`Generated cartridge label: ${resolvedPath}`);
