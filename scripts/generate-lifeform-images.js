"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const zlib = require("node:zlib");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "assets", "lifeforms");
const ZIP_HEADER = "(zip)";
const ZIP2_HEADER = "(zip2)";
const ZIP_START = 192;

function clamp(value, low = 0, high = 1) {
  return Math.max(low, Math.min(high, value));
}

function fromZip(char) {
  if (char === "0") return 0;
  if (char === "1") return 100;
  return char.charCodeAt(0) - (ZIP_START - 1);
}

function isZipRepeat(value) {
  return value.length > 0 && value.charCodeAt(0) >= ZIP_START;
}

function fromRepeat(value) {
  if (value === "") return 1;
  if (!isZipRepeat(value)) return Number.parseInt(value, 10) || 0;
  if (value.length === 1) return fromZip(value);
  return fromZip(value[0]) * 100 + fromZip(value[1]);
}

function rleCellValue(token) {
  if (token === "." || token === "b") return 0;
  if (token === "o") return 1;
  if (token.length === 1) return clamp((token.charCodeAt(0) - "A".charCodeAt(0) + 1) / 255);
  return clamp(((token.charCodeAt(0) - "p".charCodeAt(0)) * 24 + (token.charCodeAt(1) - "A".charCodeAt(0) + 25)) / 255);
}

function parseRleCellArray(cellText) {
  const rows = [];
  let row = [];
  let countText = "";
  let prefix = "";
  const source = String(cellText || "").replace(/\s+/g, "").replace(/!$/, "") + "$";

  function repeatCount() {
    const count = Number.parseInt(countText || "1", 10);
    countText = "";
    return Number.isFinite(count) && count > 0 ? count : 1;
  }

  for (const char of source) {
    if (/\d/.test(char)) {
      countText += char;
      continue;
    }
    if ("pqrstuvwxy@".includes(char)) {
      prefix = char;
      continue;
    }
    const token = `${prefix}${char}`;
    prefix = "";
    if (token === "$") {
      const count = repeatCount();
      rows.push(row);
      for (let i = 1; i < count; i += 1) rows.push([]);
      row = [];
      continue;
    }
    const value = rleCellValue(token);
    const count = repeatCount();
    for (let i = 0; i < count; i += 1) row.push(value);
  }

  return {
    rows,
    width: rows.reduce((max, nextRow) => Math.max(max, nextRow.length), 0),
    height: rows.length,
  };
}

function parseCellArray(cellText) {
  let source = cellText || "";
  const isZip1 = source.startsWith(ZIP_HEADER);
  const isZip2 = source.startsWith(ZIP2_HEADER);
  const isZip = isZip1 || isZip2;
  if (!isZip && /[$!]|\bo\b|\bb\b/.test(source)) return parseRleCellArray(source);
  if (isZip1) source = source.slice(ZIP_HEADER.length);
  if (isZip2) source = source.slice(ZIP2_HEADER.length);

  let rows = source.split("/").map((rowText) => {
    let row = rowText.trim();
    if (isZip) {
      row = row
        .split("-")
        .map((part) => {
          const bits = part.split(".");
          return bits.length === 1 ? part : "0".repeat(fromRepeat(bits[0])) + bits[1];
        })
        .join("");
      return [...row].map((char) => clamp(fromZip(char) / 100));
    }
    return row === "" ? [] : row.split(",").map((value) => clamp(Number.parseFloat(value) || 0));
  });

  if (isZip2) {
    const doubled = [];
    for (const row of rows) {
      const wide = row.flatMap((value) => [value, value]);
      doubled.push([...wide], [...wide]);
    }
    rows = doubled;
  }

  return {
    rows,
    width: rows.reduce((max, row) => Math.max(max, row.length), 0),
    height: rows.length,
  };
}

function hexToRgb(hex) {
  const clean = String(hex || "#000000").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((part) => part + part).join("") : clean;
  const value = Number.parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function colorRamp(value, palette) {
  const scaled = clamp(value) * (palette.length - 1);
  const base = Math.floor(scaled);
  const amount = scaled - base;
  const from = palette[base];
  const to = palette[Math.min(base + 1, palette.length - 1)];
  return from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount));
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, rgba) {
  const header = Buffer.from("\x89PNG\r\n\x1a\n", "binary");
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const offset = y * (width * 4 + 1);
    raw[offset] = 0;
    rgba.copy(raw, offset + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    header,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function renderLifeform(form, palette, style) {
  const { size, padding } = style;
  const data = parseCellArray(form.cells);
  const rgba = Buffer.alloc(size * size * 4);
  const scale = Math.max(1, Math.floor((size - padding * 2) / Math.max(data.width || 1, data.height || 1)));
  const offsetX = Math.floor((size - data.width * scale) / 2);
  const offsetY = Math.floor((size - data.height * scale) / 2);

  for (let sourceY = 0; sourceY < data.height; sourceY += 1) {
    for (let sourceX = 0; sourceX < data.width; sourceX += 1) {
      const value = data.rows[sourceY]?.[sourceX] || 0;
      if (value <= 0) continue;
      const [red, green, blue] = colorRamp(value, palette);
      const alpha = Math.round(90 + value * 165);
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const x = offsetX + sourceX * scale + dx;
          const y = offsetY + sourceY * scale + dy;
          const pixel = (y * size + x) * 4;
          rgba[pixel] = red;
          rgba[pixel + 1] = green;
          rgba[pixel + 2] = blue;
          rgba[pixel + 3] = alpha;
        }
      }
    }
  }
  return encodePng(size, size, rgba);
}

function loadContext() {
  const context = vm.createContext({});
  context.window = context;
  for (const file of ["lenia-themes.js", "lenia-lifeforms.js", "lenia-repository-lifeforms.js", "lenia-catalog.js"]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, "src", file), "utf8"), context, { filename: file });
  }
  return context;
}

function main() {
  const context = loadContext();
  const sources = [
    { id: "bundled-lenia", title: "Bundled Lenia", entries: context.animalArr, assetPrefix: "" },
    { id: "lenia-repository", title: "Lenia repository", entries: context.leniaRepositoryAnimalArr, assetPrefix: "lenia" },
  ];
  const registry = context.LeniaCatalog.createRegistry(sources);
  const themeName = context.LENIA_THUMBNAIL_THEME;
  const palette = context.LENIA_THEMES[themeName].map(hexToRgb);
  const style = context.LENIA_THUMBNAIL_STYLE;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (/^lifeform-.*\.png$/i.test(name)) fs.unlinkSync(path.join(OUT_DIR, name));
  }
  for (const form of registry.forms) {
    fs.writeFileSync(path.join(OUT_DIR, `${form.assetSlug}.png`), renderLifeform(form, palette, style));
  }
  console.log(`Generated ${registry.forms.length} ${themeName} lifeform PNGs in ${path.relative(ROOT, OUT_DIR)}`);
}

main();
