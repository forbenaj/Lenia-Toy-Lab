"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");
const context = {};
context.window = context;
vm.createContext(context);
for (const file of ["lenia-themes.js", "lenia-lifeforms.js", "lenia-repository-lifeforms.js", "lenia-catalog.js", "lifeform-collections.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, "src", file), "utf8"), context, { filename: file });
}

const registry = context.LeniaCatalog.createRegistry([
  { id: "bundled-lenia", title: "Bundled Lenia", entries: context.animalArr, assetPrefix: "" },
  { id: "lenia-repository", title: "Lenia repository", entries: context.leniaRepositoryAnimalArr, assetPrefix: "lenia" },
]);
const collections = context.LeniaCatalog.resolveCollections(context.LENIA_COLLECTIONS, registry);

assert.equal(registry.forms.length, 878, "the canonical registry contains every unique bundled and repository form");
assert.equal(registry.forms.filter((form) => form.sourceId === "bundled-lenia").length, 330, "all bundled forms are canonical");
assert.equal(registry.forms.filter((form) => form.sourceId === "lenia-repository").length, 548, "all repository forms are canonical");
assert.equal(registry.byReference.size, 878, "every source record has one canonical reference");
assert.equal(collections.length, 1, "only data-backed catalog collections are declared statically");
assert.equal(collections[0].id, "strict");
assert.deepEqual(Array.from(collections[0].groups, (group) => group.forms.length), [16, 7, 3, 3, 3, 3, 2]);
assert.equal(collections[0].forms.length, 37, "the strict collection resolves 37 references");
assert.equal(new Set(collections[0].forms).size, 37, "collections reference canonical objects without cloning them");

const collectionSource = fs.readFileSync(path.join(root, "src", "lifeform-collections.js"), "utf8");
assert.doesNotMatch(collectionSource, /;cells=|\(zip\)|\bcells\s*:/, "collection manifests contain references, not cell payloads");
for (const removed of ["compatible-extra-lifeforms.js", "strictly-compatible-groups.js"]) {
  assert.ok(!fs.existsSync(path.join(root, "src", removed)), `${removed} stays removed`);
}

function readPngPixels(file) {
  const png = fs.readFileSync(file);
  let offset = 8;
  let width = 0;
  let height = 0;
  const idat = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      assert.equal(data[9], 6, `${path.basename(file)} uses RGBA pixels`);
    } else if (type === "IDAT") idat.push(data);
    offset += length + 12;
  }
  return { width, height, raw: zlib.inflateSync(Buffer.concat(idat)) };
}

const assetDir = path.join(root, "assets", "lifeforms");
const actualAssets = fs.readdirSync(assetDir).filter((name) => /^lifeform-.*\.png$/i.test(name)).sort();
const expectedAssets = Array.from(registry.forms, (form) => `${form.assetSlug}.png`).sort();
assert.deepEqual(actualAssets, expectedAssets, "there is exactly one generated thumbnail per canonical lifeform");

for (const name of actualAssets) {
  const { width, height, raw } = readPngPixels(path.join(assetDir, name));
  assert.equal(width, 128, `${name} has the expected width`);
  assert.equal(height, 128, `${name} has the expected height`);
  const stride = width * 4 + 1;
  for (let y = 0; y < height; y += 1) {
    assert.equal(raw[y * stride], 0, `${name} uses the generator's deterministic PNG filter`);
    for (let x = 0; x < width; x += 1) {
      const pixel = y * stride + 1 + x * 4;
      if (raw[pixel + 3] === 0) continue;
      assert.equal(raw[pixel], raw[pixel + 1], `${name} has monochrome red/green channels`);
      assert.equal(raw[pixel + 1], raw[pixel + 2], `${name} has monochrome green/blue channels`);
    }
  }
}

console.log(`Catalog checks passed (${registry.forms.length} canonical forms, ${actualAssets.length} monochrome thumbnails).`);
