"use strict";

const assert = require("node:assert/strict");
const mapFormat = require("../src/lenia-map-format.js");

assert.equal(mapFormat.TYPE, "leniency-map");
assert.equal(mapFormat.VERSION, 2);

const source = new Float32Array([0, 0.125, 0.5, 0.875, 1, Math.PI / 10]);
const encoded = mapFormat.encodeField("channel-0", source);
assert.equal(encoded.encoding, "float32-base64");
assert.equal(encoded.littleEndian, true);
assert.equal(encoded.length, source.length);

const decoded = mapFormat.decodeField(encoded, source.length);
assert.deepEqual([...decoded], [...source], "map fields survive an encode/decode round trip");
assert.throws(() => mapFormat.decodeField(encoded, source.length + 1), /does not match/, "dimension mismatches are rejected");

console.log("Map format checks passed.");
