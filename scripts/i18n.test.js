"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const source = fs.readFileSync(path.join(root, "src", "i18n.js"), "utf8");
const context = {
  Intl,
  navigator: { language: "en-US", languages: ["en-US"] },
  localStorage: { getItem: () => null, setItem: () => {} },
  document: {
    documentElement: { lang: "en" },
    querySelector: () => null,
    querySelectorAll: () => [],
  },
  dispatchEvent: () => {},
};
context.window = context;
vm.createContext(context);
vm.runInContext(source, context, { filename: "i18n.js" });

const i18n = context.LeniaI18n;
assert.ok(i18n, "the i18n API is exposed");

const englishBlock = source.match(/en: Object\.freeze\(\{([\s\S]*?)\n    \}\),\n    es:/)?.[1] || "";
const spanishBlock = source.match(/es: Object\.freeze\(\{([\s\S]*?)\n    \}\),\n  \}\);/)?.[1] || "";
const translationKeys = (block) => new Set([...block.matchAll(/^\s+"([^"]+)":/gm)].map((match) => match[1]));
const englishKeys = translationKeys(englishBlock);
const spanishKeys = translationKeys(spanishBlock);
assert.deepEqual([...spanishKeys].sort(), [...englishKeys].sort(), "English and Spanish translation catalogs have identical keys");

const staticKeys = new Set(
  [...html.matchAll(/data-i18n(?:-aria-label|-title|-placeholder|-content)?="([^"]+)"/g)].map((match) => match[1]),
);
const runtimeSource = ["lenia-toy-lab.js", "music-player.js"]
  .map((file) => fs.readFileSync(path.join(root, "src", file), "utf8"))
  .join("\n");
const runtimeKeys = new Set([...runtimeSource.matchAll(/\bt\("([^"]+)"/g)].map((match) => match[1]));
const runtimePluralKeys = new Set([...runtimeSource.matchAll(/\btp\("([^"]+)"/g)].map((match) => match[1]));
for (const language of ["en", "es"]) {
  i18n.setLanguage(language, { persist: false, emit: false });
  assert.equal(context.document.documentElement.lang, language, `the document language changes to ${language}`);
  for (const key of staticKeys) assert.notEqual(i18n.t(key), key, `${language} includes ${key}`);
  for (const key of runtimeKeys) assert.notEqual(i18n.t(key), key, `${language} includes runtime key ${key}`);
  for (const key of runtimePluralKeys) assert.notEqual(i18n.plural(key, 2), `${key}.other`, `${language} includes plural key ${key}`);
}

i18n.setLanguage("es", { persist: false, emit: false });
assert.equal(i18n.t("playground.saveMap"), "Guardar mapa");
assert.equal(i18n.plural("library.count", 1), "1 forma de vida");
assert.equal(i18n.plural("library.count", 2), "2 formas de vida");
i18n.setLanguage("en", { persist: false, emit: false });
assert.equal(i18n.t("playground.saveMap"), "Save Map");

console.log(`i18n checks passed (${staticKeys.size} static translation keys).`);
