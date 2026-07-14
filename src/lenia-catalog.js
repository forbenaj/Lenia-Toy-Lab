"use strict";

(function createLeniaCatalog(global) {
  function splitPayload(payload) {
    const parts = String(payload || "").split(";cells=");
    return { rule: parts[0] || "", cells: parts[1] || payload };
  }

  function displayCode(rawCode) {
    return String(rawCode || "").replace(/^[~*]/, "");
  }

  function cleanGroupName(value) {
    return String(value || "")
      .replace(/^(class|order|family|subfamily|subphylum):\s*/i, "")
      .trim();
  }

  function assetSlug(index, code, prefix = "") {
    const cleanCode = String(code || "form")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const cleanPrefix = String(prefix || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `lifeform-${cleanPrefix ? `${cleanPrefix}-` : ""}${index}-${cleanCode || "form"}`;
  }

  function createRegistry(sources, { assetBase = "assets/lifeforms/" } = {}) {
    const forms = [];
    const byId = new Map();
    const byReference = new Map();
    const byFingerprint = new Map();

    for (const source of sources || []) {
      const groupStack = [];
      const entries = Array.isArray(source.entries) ? source.entries : [];
      for (let sourceIndex = 0; sourceIndex < entries.length; sourceIndex += 1) {
        const item = entries[sourceIndex];
        if (!Array.isArray(item)) continue;
        if (item.length === 3 && item[1]) {
          const level = Number.parseInt(String(item[0]).replace(/^\D+/, ""), 10) || 1;
          groupStack[level - 1] = item[1];
          groupStack.length = level;
          continue;
        }
        if (item.length < 4 || !item[3]) continue;

        const index = Number(source.indexOffset || 0) + sourceIndex;
        const code = displayCode(item[0]);
        const id = `${source.id}-${index}-${code || sourceIndex}`;
        const reference = `${source.id}:${sourceIndex}`;
        const fingerprint = JSON.stringify([item[0] || "", item[1] || "", item[2] || "", item[3]]);
        const existing = byFingerprint.get(fingerprint);
        if (existing) {
          existing.aliases.push(reference);
          byId.set(id, existing);
          byReference.set(reference, existing);
          continue;
        }

        const { rule, cells } = splitPayload(item[3]);
        const groups = groupStack.filter(Boolean);
        const slug = assetSlug(index, code, source.assetPrefix);
        const form = {
          id,
          reference,
          aliases: [],
          sourceId: source.id,
          sourceTitle: source.title,
          sourceIndex,
          index,
          code,
          rawCode: item[0] || "",
          name: item[1] || code,
          translatedName: item[2] || "",
          section: cleanGroupName(groups[groups.length - 1]) || source.title,
          groups,
          rule,
          cells,
          assetSlug: slug,
          assetPath: `${assetBase}${slug}.png`,
        };
        forms.push(form);
        byFingerprint.set(fingerprint, form);
        byId.set(id, form);
        byReference.set(reference, form);
      }
    }

    return { forms, byId, byReference };
  }

  function resolveCollections(definitions, registry) {
    return (definitions || []).map((definition) => {
      const seen = new Set();
      const groups = (definition.groups || []).map((group) => {
        const forms = (group.members || []).map((reference) => {
          const form = registry.byReference.get(reference);
          if (!form) throw new Error(`Collection ${definition.id} references missing lifeform ${reference}`);
          if (seen.has(form.id)) throw new Error(`Collection ${definition.id} repeats lifeform ${reference}`);
          seen.add(form.id);
          return form;
        });
        return { ...group, forms };
      });
      return { ...definition, groups, forms: groups.flatMap((group) => group.forms) };
    });
  }

  global.LeniaCatalog = Object.freeze({ assetSlug, createRegistry, resolveCollections, splitPayload });
})(window);
