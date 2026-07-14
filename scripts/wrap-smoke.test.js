"use strict";

const assert = require("node:assert/strict");

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function brushAt(field, width, height, x, y, radius, power) {
  for (let yy = Math.floor(y - radius); yy < Math.ceil(y + radius + 1); yy += 1) {
    for (let xx = Math.floor(x - radius); xx < Math.ceil(x + radius + 1); xx += 1) {
      const distance = Math.hypot(xx - x, yy - y);
      if (distance > radius) continue;
      const falloff = radius <= 0 ? 1 : 1 - distance / radius;
      const wx = modulo(xx, width);
      const wy = modulo(yy, height);
      const index = wy * width + wx;
      field[index] = Math.max(0, Math.min(1, field[index] + falloff * power));
    }
  }
}

const width = 196;
const height = 128;
const field = new Float32Array(width * height);
brushAt(field, width, height, 1, 1, 4, 1);

assert.ok(field[1 * width + 1] > 0.99, "the brush paints its center");
assert.ok(field[1 * width + (width - 1)] > 0, "the brush wraps across the x edge");
assert.ok(field[(height - 1) * width + 1] > 0, "the brush wraps across the y edge");

const repeatedTileField = new Float32Array(width * height);
brushAt(repeatedTileField, width, height, width + 1, 1 - height, 0, 1);
assert.ok(repeatedTileField[1 * width + 1] > 0.99, "painting on a repeated tile updates the canonical field");

console.log("Wrapping smoke checks passed.");
