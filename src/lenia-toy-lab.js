"use strict";

const { plural: tp, t } = window.LeniaI18n;
const canvas = document.querySelector("#fieldCanvas");
const glCanvas = document.querySelector("#glFieldCanvas");
const ctx = canvas.getContext("2d", { alpha: true });

const ui = {
  speedSlider: document.querySelector("#speedSlider"),
  speedValue: document.querySelector("#speedValue"),
  fieldWidthInput: document.querySelector("#fieldWidthInput"),
  fieldHeightInput: document.querySelector("#fieldHeightInput"),
  backendSelect: document.querySelector("#backendSelect"),
  backendBadge: document.querySelector("#backendBadge"),
  repeatFieldToggle: document.querySelector("#repeatFieldToggle"),
  showFieldBoundaryToggle: document.querySelector("#showFieldBoundaryToggle"),
  saveMapBtn: document.querySelector("#saveMapBtn"),
  loadMapBtn: document.querySelector("#loadMapBtn"),
  loadMapInput: document.querySelector("#loadMapInput"),
  saveImageBtn: document.querySelector("#saveImageBtn"),
  loadImageBtn: document.querySelector("#loadImageBtn"),
  loadImageInput: document.querySelector("#loadImageInput"),
  radiusSlider: document.querySelector("#radiusSlider"),
  radiusValue: document.querySelector("#radiusValue"),
  alphaSlider: document.querySelector("#alphaSlider"),
  alphaValue: document.querySelector("#alphaValue"),
  muSlider: document.querySelector("#muSlider"),
  muValue: document.querySelector("#muValue"),
  sigmaSlider: document.querySelector("#sigmaSlider"),
  sigmaValue: document.querySelector("#sigmaValue"),
  dtSlider: document.querySelector("#dtSlider"),
  dtValue: document.querySelector("#dtValue"),
  resetFieldConfigBtn: document.querySelector("#resetFieldConfigBtn"),
  paletteSelect: document.querySelector("#paletteSelect"),
  paletteNameInput: document.querySelector("#paletteNameInput"),
  savePaletteBtn: document.querySelector("#savePaletteBtn"),
  deletePaletteBtn: document.querySelector("#deletePaletteBtn"),
  colorInputs: [0, 1, 2, 3, 4].map((index) => document.querySelector(`#color${index}`)),
  uiColorInputs: {
    background: document.querySelector("#uiColorBackground"),
    panel: document.querySelector("#uiColorPanel"),
    control: document.querySelector("#uiColorControl"),
    text: document.querySelector("#uiColorText"),
    muted: document.querySelector("#uiColorMuted"),
    border: document.querySelector("#uiColorBorder"),
    accent: document.querySelector("#uiColorAccent"),
  },
  uiFontSelect: document.querySelector("#uiFontSelect"),
  stateLabel: document.querySelector("#stateLabel"),
  timeLabel: document.querySelector("#timeLabel"),
  runBtn: document.querySelector("#runBtn"),
  runIcon: document.querySelector("#runIcon"),
  stepBtn: document.querySelector("#stepBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  randomBtn: document.querySelector("#randomBtn"),
  brushToolBtn: document.querySelector("#brushToolBtn"),
  eraseToolBtn: document.querySelector("#eraseToolBtn"),
  formToolBtn: document.querySelector("#formToolBtn"),
  brushControls: document.querySelector("#brushControls"),
  toolFormSelection: document.querySelector("#toolFormSelection"),
  toolFormThumb: document.querySelector("#toolFormThumb"),
  toolFormCode: document.querySelector("#toolFormCode"),
  toolFormName: document.querySelector("#toolFormName"),
  toolFormRuleWarning: document.querySelector("#toolFormRuleWarning"),
  brushSizeSlider: document.querySelector("#brushSizeSlider"),
  brushSizeValue: document.querySelector("#brushSizeValue"),
  brushPowerSlider: document.querySelector("#brushPowerSlider"),
  brushPowerValue: document.querySelector("#brushPowerValue"),
  libraryPanel: document.querySelector("#libraryPanel"),
  expandLibraryBtn: document.querySelector("#expandLibraryBtn"),
  formSearch: document.querySelector("#formSearch"),
  collectionSelect: document.querySelector("#collectionSelect"),
  groupSelect: document.querySelector("#groupSelect"),
  ruleFilterSelect: document.querySelector("#ruleFilterSelect"),
  libraryCount: document.querySelector("#libraryCount"),
  selectedForm: document.querySelector("#selectedForm"),
  formList: document.querySelector("#formList"),
  placementPanel: document.querySelector("#placementPanel"),
  placementCount: document.querySelector("#placementCount"),
  placementSummaryLabel: document.querySelector("#placementSummaryLabel"),
  cancelPlacementsBtn: document.querySelector("#cancelPlacementsBtn"),
  placeAllBtn: document.querySelector("#placeAllBtn"),
  activePlacementControls: document.querySelector("#activePlacementControls"),
  loadPreparedRulesBtn: document.querySelector("#loadPreparedRulesBtn"),
  placePreparedBtn: document.querySelector("#placePreparedBtn"),
  removePreparedBtn: document.querySelector("#removePreparedBtn"),
  placementWarnings: document.querySelector("#placementWarnings"),
  ruleChangeDialog: document.querySelector("#ruleChangeDialog"),
  ruleChangeMessage: document.querySelector("#ruleChangeMessage"),
  skipRuleChangeAlert: document.querySelector("#skipRuleChangeAlert"),
  cancelRuleChangeBtn: document.querySelector("#cancelRuleChangeBtn"),
  confirmRuleChangeBtn: document.querySelector("#confirmRuleChangeBtn"),
  toast: document.querySelector("#toast"),
  fileProtocolNotice: document.querySelector("#fileProtocolNotice"),
  mobilePanelButtons: [...document.querySelectorAll("[data-mobile-panel-target]")],
  mobilePanelCloseButtons: [...document.querySelectorAll(".mobile-panel-close")],
  mobilePanels: [...document.querySelectorAll(".mobile-control-panel")],
};

const ZIP_HEADER = "(zip)";
const ZIP2_HEADER = "(zip2)";
const ZIP_START = 192;
const LIFEFORM_ASSET_BASE = "assets/lifeforms/";
const THUMBNAIL_STYLE = window.LENIA_THUMBNAIL_STYLE;
const CUSTOM_PALETTES_KEY = "leniaToyLab.customPalettes.v2";
const LEGACY_CUSTOM_PALETTES_KEY = "leniaToyLab.customPalettes.v1";
const DISPLAY_SETTINGS_KEY = "leniaToyLab.displaySettings.v1";
const FAVORITES_KEY = "leniaToyLab.favorites.v1";
const SKIP_RULE_CHANGE_ALERT_KEY = "leniaToyLab.skipRuleChangeAlert.v1";
const DEFAULT_MAP_PATH = "assets/maps/default_0.map";
const DEFAULT_FORM_NAME = "Orbium unicaudatus";
const DEFAULT_WORLD = { width: 196, height: 128 };
const PHONE_LAYOUT_MEDIA = window.matchMedia("(max-width: 719px)");
const DEFAULT_VERTICAL_MARGIN = 24;
const MIN_CAMERA_SCALE = 0.1;
const MAX_CAMERA_SCALE = 24;
const CAMERA_PAN_LIMIT_FIELDS = 4;
const PREPARED_HANDLE_HIT_RADIUS = 18;
const DEFAULT_RUNNING = true;
const WORLD_LIMITS = { min: 32, max: 1024 };
const CHANNEL_ID = "channel-0";
const LIFEFORM_DRAG_TYPE = "application/x-lenia-lifeform-id";
const RULE_WARNING_TEXT_KEY = "rules.mismatch";
const RULE_NUMBER_KEYS = Object.freeze(["radius", "alpha", "mu", "sigma", "dt", "gain", "decay", "layer", "weight"]);
const RULE_VALUE_KEYS = Object.freeze(["limitValue", "deltaName", "coreName", "positiveOnly"]);

const BUILT_IN_PALETTES = window.LENIA_THEMES;
const DEFAULT_THEME_NAME = "Ambar";

const UI_COLOR_KEYS = Object.freeze(["background", "panel", "control", "text", "muted", "border", "accent"]);
const THEME_FONTS = Object.freeze({
  arial: "Arial, Helvetica, sans-serif",
  system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  verdana: "Verdana, Geneva, sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  monospace: "'Courier New', Courier, monospace",
});

const DEFAULT_RULE = Object.freeze({
  id: "rule-0",
  sourceChannelId: CHANNEL_ID,
  destinationChannelId: CHANNEL_ID,
  radius: 13,
  alpha: 4,
  mu: 0.15,
  sigma: 0.017,
  dt: 0.1,
  gain: 1,
  decay: 0,
  limitValue: true,
  deltaName: "gaus",
  coreName: "bump4",
  layer: 0,
  beta: [1, 0, 0, 0],
  eta: [0, 0, 0, 0],
  weight: 1,
  positiveOnly: false,
});

let worldWidth = PHONE_LAYOUT_MEDIA.matches ? DEFAULT_WORLD.height : DEFAULT_WORLD.width;
let worldHeight = PHONE_LAYOUT_MEDIA.matches ? DEFAULT_WORLD.width : DEFAULT_WORLD.height;
let fieldBuffer = document.createElement("canvas");
let fieldBufferCtx = fieldBuffer.getContext("2d", { alpha: false });
let cssWidth = 1;
let cssHeight = 1;
let dpr = 1;
let camera = { x: worldWidth / 2, y: worldHeight / 2, scale: 4 };
let viewDirty = true;

let currentRule = cloneRule(DEFAULT_RULE);
let palette = [...BUILT_IN_PALETTES[DEFAULT_THEME_NAME]];
let uiPalette = deriveUiPalette(palette);
let uiPaletteFollowsSimulation = true;
let customPalettes = loadCustomPalettes();
let selectedPaletteRef = `builtin:${DEFAULT_THEME_NAME}`;
let favorites = loadFavorites();

let catalogForms = [];
let strictForms = [];
let catalogCollections = new Map();
let collectionMetadata = new Map();
let selectedForm = null;
let preparedPlacements = [];
let activePlacementIndex = -1;
let currentTool = "form";
let pointerState = null;
const activeTouchPointers = new Map();
let pinchState = null;
let pinchGestureActive = false;
let pointerHover = null;
let fieldHasMass = false;
let pendingRuleChange = null;
const displaySettings = loadDisplaySettings();
let repeatField = displaySettings.repeatField;
let showFieldBoundary = displaySettings.showFieldBoundary;

let backendPreference = "auto";
let activeBackend = "cpu";
let webglSim = null;
let simWorker = null;
let workerReady = false;
let workerBusy = false;
let backendGeneration = 0;
let backendTransitioning = false;
let queuedSnapshot = null;
let lastKnownSnapshot = null;
let checkpointTimer = 0;
let lastCheckpointAt = 0;
let checkpointInFlight = false;
let snapshotRequestId = 0;
const snapshotRequests = new Map();

let isRunning = false;
let simTime = 0;
let accumulator = 0;
let pendingStepCount = 0;
let lastFrameAt = 0;
let hasSeededInitialForm = false;
let initialSeedPending = true;
let startupStatus = null;
let modelUpdateTimer = 0;
let toastTimer = 0;

function clamp(value, low = 0, high = 1) {
  return Math.max(low, Math.min(high, value));
}

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function cloneRule(rule) {
  return {
    ...rule,
    beta: [...(rule.beta || DEFAULT_RULE.beta)],
    eta: [...(rule.eta || DEFAULT_RULE.eta)],
  };
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^[~*]+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function validHex(color) {
  return /^#[0-9a-f]{6}$/i.test(String(color || ""));
}

function hexToRgb(hex) {
  const value = Number.parseInt(String(hex || "#000000").replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function normalizePalette(colors) {
  const fallback = BUILT_IN_PALETTES[DEFAULT_THEME_NAME];
  return Array.from({ length: 5 }, (_, index) => (validHex(colors?.[index]) ? colors[index].toLowerCase() : fallback[index]));
}

function rgbToHex([red, green, blue]) {
  return `#${[red, green, blue].map((value) => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0")).join("")}`;
}

function mixHex(from, to, amount) {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  return rgbToHex(start.map((channel, index) => channel + (end[index] - channel) * clamp(amount)));
}

function colorLuminance(color) {
  const [red, green, blue] = hexToRgb(color).map((value) => value / 255);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function deriveUiPalette(simulationColors) {
  const colors = normalizePalette(simulationColors);
  const darkest = [...colors].sort((a, b) => colorLuminance(a) - colorLuminance(b))[0];
  const lightest = [...colors].sort((a, b) => colorLuminance(b) - colorLuminance(a))[0];
  const background = mixHex(darkest, "#000000", 0.74);
  const panel = mixHex(darkest, "#000000", 0.58);
  const control = mixHex(darkest, "#ffffff", 0.1);
  const text = mixHex(lightest, "#ffffff", 0.72);
  return {
    background,
    panel,
    control,
    text,
    muted: mixHex(text, panel, 0.52),
    border: mixHex(panel, text, 0.28),
    accent: colors[colors.length - 1],
    font: "arial",
  };
}

function normalizeUiPalette(colors, simulationColors = palette) {
  const fallback = deriveUiPalette(simulationColors);
  const normalized = Object.fromEntries(UI_COLOR_KEYS.map((key) => [key, validHex(colors?.[key]) ? colors[key].toLowerCase() : fallback[key]]));
  normalized.font = Object.hasOwn(THEME_FONTS, colors?.font) ? colors.font : fallback.font;
  return normalized;
}

function safeLocalStorageRead(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function loadCustomPalettes() {
  const stored = safeLocalStorageRead(CUSTOM_PALETTES_KEY, safeLocalStorageRead(LEGACY_CUSTOM_PALETTES_KEY, []));
  if (!Array.isArray(stored)) return [];
  return stored
    .filter((item) => item && typeof item.name === "string" && Array.isArray(item.colors))
    .map((item) => {
      const colors = normalizePalette(item.colors);
      return { name: item.name.trim().slice(0, 32), colors, ui: normalizeUiPalette(item.ui, colors) };
    })
    .filter((item) => item.name && !Object.hasOwn(BUILT_IN_PALETTES, item.name));
}

function loadDisplaySettings() {
  const stored = safeLocalStorageRead(DISPLAY_SETTINGS_KEY, {});
  return {
    repeatField: stored.repeatField !== false,
    showFieldBoundary: Boolean(stored.showFieldBoundary),
  };
}

function saveDisplaySettings() {
  try {
    localStorage.setItem(DISPLAY_SETTINGS_KEY, JSON.stringify({ repeatField, showFieldBoundary }));
  } catch {
    // Display preferences remain available for the current session.
  }
}

function loadFavorites() {
  const stored = safeLocalStorageRead(FAVORITES_KEY, []);
  return new Set(Array.isArray(stored) ? stored.map(String) : []);
}

function saveCustomPalettes() {
  localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify(customPalettes));
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  ui.toast.textContent = message;
  ui.toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    ui.toast.hidden = true;
  }, 2600);
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
    flat: null,
  };
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
  const source = `${String(cellText || "").replace(/\s+/g, "").replace(/!$/, "")}$`;

  function takeCount() {
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
      const count = takeCount();
      rows.push(row);
      for (let i = 1; i < count; i += 1) rows.push([]);
      row = [];
      continue;
    }
    const value = rleCellValue(token);
    const count = takeCount();
    for (let i = 0; i < count; i += 1) row.push(value);
  }

  return {
    rows,
    width: rows.reduce((max, nextRow) => Math.max(max, nextRow.length), 0),
    height: rows.length,
    flat: null,
  };
}

function parseFraction(value) {
  if (value == null || value === "") return 0;
  const text = String(value).trim();
  if (text.includes("/")) {
    const [top, bottom] = text.split("/").map(Number);
    return bottom ? top / bottom : 0;
  }
  return Number.parseFloat(text) || 0;
}

function parseRule(ruleText) {
  const rule = cloneRule(DEFAULT_RULE);
  const radius = Number.parseInt(ruleText.match(/(?:^|;)R=(\d+)/)?.[1] || "", 10);
  if (Number.isFinite(radius)) rule.radius = radius;

  const delta = ruleText.match(/d=([a-z0-9/]+)\(([-\d.]+),([-\d.]+)\)\*([-\d.]+)(\+?)/i);
  if (delta) {
    rule.deltaName = delta[1];
    rule.mu = Number.parseFloat(delta[2]);
    rule.sigma = Number.parseFloat(delta[3]);
    const multiplier = Math.abs(Number.parseFloat(delta[4]));
    rule.dt = multiplier || DEFAULT_RULE.dt;
    rule.limitValue = delta[5] !== "+";
  }

  const kernel = ruleText.match(/k=([^;]+)/i);
  if (kernel) {
    const text = kernel[1];
    const name = text.split("(")[0];
    const legacyName = name === "bimo4" ? "quad4" : name === "bist4" ? "stpz1/4" : name === "trmo4" ? "quad4" : name;
    const args = [...text.matchAll(/\(([^)]*)\)/g)].map((match) =>
      match[1] === "" ? [] : match[1].split(",").map(parseFraction),
    );
    rule.coreName = legacyName.replace(/\d+$/, "") === "bump" ? "bump4" : legacyName;
    if (!["bump4", "quad4", "trap1/5", "stpz1/4", "life"].includes(rule.coreName)) {
      rule.coreName = legacyName.startsWith("quad") ? "quad4" : legacyName.startsWith("bump") ? "bump4" : legacyName;
    }
    const beta = args[0] || [];
    const eta = args[1] || [];
    rule.layer = Math.max(beta.length - 1, 0);
    if (name === "trmo4") rule.layer = 2;
    for (let i = 0; i < 4; i += 1) {
      rule.beta[i] = beta[i] || 0;
      rule.eta[i] = eta[i] || 0;
    }
    if (rule.layer <= 1 && rule.beta[0] === 0) rule.beta[0] = 1;
  }
  return rule;
}

function catalogSources() {
  return [
    {
      id: "bundled-lenia",
      title: "Bundled Lenia",
      entries: Array.isArray(window.animalArr) ? window.animalArr : [],
      assetPrefix: "",
    },
    {
      id: "lenia-repository",
      title: "Lenia repository",
      entries: Array.isArray(window.leniaRepositoryAnimalArr) ? window.leniaRepositoryAnimalArr : [],
      indexOffset: 0,
      assetPrefix: "lenia",
    },
  ];
}

function parseFieldMap(ruleText) {
  const fields = {};
  for (const part of String(ruleText || "").split(";")) {
    const [key, ...valueParts] = part.split("=");
    if (!key || !valueParts.length) continue;
    fields[key.trim().toLowerCase()] = valueParts.join("=").trim();
  }
  return fields;
}

function parseCollectionRule(ruleText) {
  const fields = parseFieldMap(ruleText);
  const rule = cloneRule(DEFAULT_RULE);
  const radius = Number.parseInt(fields.r || "", 10);
  const timeScale = Number.parseFloat(fields.t || "");
  const beta = (fields.b || "1").split(",").map(parseFraction).filter(Number.isFinite);
  if (Number.isFinite(radius)) rule.radius = radius;
  if (Number.isFinite(timeScale) && timeScale > 0) rule.dt = 1 / timeScale;
  if (fields.m != null) rule.mu = Number.parseFloat(fields.m) || rule.mu;
  if (fields.s != null) rule.sigma = Number.parseFloat(fields.s) || rule.sigma;
  for (let i = 0; i < 4; i += 1) {
    rule.beta[i] = beta[i] || 0;
    rule.eta[i] = 0;
  }
  rule.layer = Math.max(beta.length - 1, 0);
  if (rule.layer <= 1 && rule.beta[0] === 0) rule.beta[0] = 1;
  if (rule.radius === 2 || fields.kn === "4") rule.coreName = "life";
  else if (rule.layer > 0 || fields.kn === "2") rule.coreName = "quad4";
  else rule.coreName = "bump4";
  if (rule.coreName === "life" || fields.gn === "3") rule.deltaName = "stpz";
  else if (fields.gn === "2") rule.deltaName = "quad4";
  else rule.deltaName = "gaus";
  return { rule, perForm: fields["per-form"] === "1" || fields.perform === "1" };
}

function resolveCatalogCollections(registry) {
  const collections = window.LeniaCatalog.resolveCollections(window.LENIA_COLLECTIONS, registry);
  collectionMetadata = new Map();
  for (const collection of collections) {
    const metadata = new Map();
    for (const group of collection.groups) {
      const parsed = parseCollectionRule(group.rule);
      group.ruleInfo = parsed.rule;
      group.perForm = group.perForm ?? parsed.perForm;
      for (const form of group.forms) {
        metadata.set(form.id, {
          group: group.label,
          ruleInfo: cloneRule(group.perForm ? form.ruleInfo : group.ruleInfo),
        });
      }
    }
    collectionMetadata.set(collection.id, metadata);
  }
  return new Map(collections.map((collection) => [collection.id, collection]));
}

function currentModel() {
  return {
    selectedChannelId: CHANNEL_ID,
    metricScope: "selected",
    wrapAround: true,
    channels: [{ id: CHANNEL_ID, name: "Field", palette: [...palette], visible: true }],
    rules: [cloneRule(currentRule)],
  };
}

function ruleFromControls() {
  return cloneRule({
    ...currentRule,
    radius: Number(ui.radiusSlider.value),
    alpha: Number(ui.alphaSlider.value),
    mu: Number(ui.muSlider.value),
    sigma: Number(ui.sigmaSlider.value),
    dt: Number(ui.dtSlider.value),
  });
}

function setSliderValue(slider, value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return;
  if (numeric < Number(slider.min)) slider.min = String(numeric);
  if (numeric > Number(slider.max)) slider.max = String(Math.ceil(numeric));
  slider.value = String(numeric);
}

function syncRuleControls() {
  setSliderValue(ui.radiusSlider, currentRule.radius);
  setSliderValue(ui.alphaSlider, currentRule.alpha);
  setSliderValue(ui.muSlider, currentRule.mu);
  setSliderValue(ui.sigmaSlider, currentRule.sigma);
  setSliderValue(ui.dtSlider, currentRule.dt);
  syncLabels();
  syncRuleMismatchIndicators();
}

function syncLabels() {
  ui.speedValue.value = ui.speedSlider.value;
  ui.radiusValue.value = String(Math.round(Number(ui.radiusSlider.value)));
  ui.alphaValue.value = Number(ui.alphaSlider.value).toFixed(1);
  ui.muValue.value = Number(ui.muSlider.value).toFixed(3);
  ui.sigmaValue.value = Number(ui.sigmaSlider.value).toFixed(3);
  ui.dtValue.value = Number(ui.dtSlider.value).toFixed(3);
  ui.brushSizeValue.value = ui.brushSizeSlider.value;
  ui.brushPowerValue.value = Number(ui.brushPowerSlider.value).toFixed(2);
}

function configureBackend() {
  const model = currentModel();
  if (usingWebgl()) webglSim.setModel(model);
  else if (simWorker) simWorker.postMessage({ type: "model", model });
  requestRender();
}

function scheduleModelUpdate() {
  window.clearTimeout(modelUpdateTimer);
  modelUpdateTimer = window.setTimeout(configureBackend, 70);
}

function requestRuleControlChange() {
  const nextRule = ruleFromControls();
  syncRuleControls();
  if (rulesMatch(currentRule, nextRule)) return;
  requestRuleChange({
    rule: nextRule,
    messageKey: "rules.changeWarning",
    commit: () => {
      currentRule = nextRule;
      syncRuleControls();
      scheduleModelUpdate();
    },
  });
}

function updateFieldMassFromMetrics(metrics) {
  const mass = Number(metrics?.aggregate?.mass ?? metrics?.mass ?? 0);
  fieldHasMass = Number.isFinite(mass) && mass > 0;
}

function valuesHaveMass(values) {
  if (!values) return false;
  for (let index = 0; index < values.length; index += 1) {
    if (Number(values[index]) > 0) return true;
  }
  return false;
}

function usingWebgl() {
  return activeBackend === "webgl" && Boolean(webglSim);
}

function backendOperational() {
  return usingWebgl() || workerReady;
}

function backendReady() {
  return !backendTransitioning && backendOperational();
}

function syncBackendStatus() {
  const actual = usingWebgl() ? "WebGL" : "CPU";
  ui.backendBadge.textContent = backendPreference === "auto" ? `${actual} · ${t("playground.auto")}` : actual;
  ui.backendBadge.title = t(backendPreference === "auto" ? "backend.autoSelected" : "backend.using", { backend: actual });
}

function syncRunState() {
  ui.stateLabel.textContent = t(backendReady() ? (isRunning ? "state.running" : "state.paused") : "state.loading");
  ui.runIcon.src = isRunning ? "assets/ui/pause.png" : "assets/ui/play.png";
  const runLabel = t(isRunning ? "transport.pause" : "transport.play");
  ui.runBtn.setAttribute("aria-label", runLabel);
  ui.runBtn.title = runLabel;
}

function postWorker(type, payload = {}, transfer = []) {
  if (simWorker) simWorker.postMessage({ type, ...payload }, transfer);
}

function requestCpuSnapshot() {
  if (!simWorker || !workerReady) return Promise.resolve(null);
  const requestId = ++snapshotRequestId;
  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      snapshotRequests.delete(requestId);
      resolve(null);
    }, 1800);
    snapshotRequests.set(requestId, { resolve, timeoutId });
    postWorker("snapshot", { requestId });
  });
}

function cloneSnapshot(snapshot) {
  if (!snapshot) return null;
  const channels = (snapshot.channels || []).map((channel) => ({
    ...channel,
    palette: channel.palette ? [...channel.palette] : undefined,
    values: new Float32Array(channel.values || 0),
  }));
  return {
    ...snapshot,
    model: snapshot.model
      ? {
          ...snapshot.model,
          channels: snapshot.model.channels?.map((channel) => ({ ...channel, palette: [...(channel.palette || [])] })),
          rules: snapshot.model.rules?.map(cloneRule),
        }
      : currentModel(),
    channels,
    values: channels[0]?.values || new Float32Array(snapshot.values || 0),
  };
}

function rememberSnapshot(snapshot) {
  if (!snapshot) return null;
  lastKnownSnapshot = cloneSnapshot(snapshot);
  lastCheckpointAt = performance.now();
  return snapshot;
}

async function captureSnapshot({ allowCached = true } = {}) {
  if (!backendOperational()) return allowCached ? cloneSnapshot(lastKnownSnapshot) : null;
  try {
    const snapshot = usingWebgl()
      ? { ...webglSim.snapshot(), model: currentModel(), simTime }
      : await requestCpuSnapshot().then((value) => (value ? { ...value, model: currentModel(), simTime: value.simTime ?? simTime } : null));
    if (snapshot) return rememberSnapshot(snapshot);
  } catch (error) {
    console.warn("Could not capture backend state:", error);
  }
  return allowCached ? cloneSnapshot(lastKnownSnapshot) : null;
}

function scheduleCheckpoint(delay = 140) {
  window.clearTimeout(checkpointTimer);
  checkpointTimer = window.setTimeout(() => void checkpointState(), delay);
}

async function checkpointState({ force = false } = {}) {
  if (backendTransitioning || !backendOperational() || checkpointInFlight) return;
  if (!force && performance.now() - lastCheckpointAt < 900) return;
  checkpointInFlight = true;
  try {
    await captureSnapshot({ allowCached: false });
  } finally {
    checkpointInFlight = false;
  }
}

function stopWorker() {
  if (simWorker) simWorker.terminate();
  simWorker = null;
  workerReady = false;
  workerBusy = false;
}

function startCpuBackend(snapshot) {
  stopWorker();
  activeBackend = "cpu";
  glCanvas.hidden = true;
  queuedSnapshot = cloneSnapshot(snapshot);
  simWorker = new Worker("src/range-sim-worker.js");
  simWorker.addEventListener("message", handleWorkerMessage);
  simWorker.addEventListener("error", (event) => {
    workerReady = false;
    workerBusy = false;
    syncRunState();
    void handleBackendFailure("cpu", event.error || new Error(event.message || "CPU worker stopped"), { useCachedOnly: true });
  });
  postWorker("init", { width: worldWidth, height: worldHeight, model: currentModel() });
}

async function startBackend({ preserve = false, forceBackend = null, snapshotOverride = null } = {}) {
  const generation = ++backendGeneration;
  backendTransitioning = true;
  syncRunState();
  const snapshot = snapshotOverride ? cloneSnapshot(snapshotOverride) : preserve ? await captureSnapshot() : null;
  if (generation !== backendGeneration) return;

  const wantsWebgl = forceBackend === "webgl" || (!forceBackend && (backendPreference === "auto" || backendPreference === "webgl"));
  if (wantsWebgl && window.WebGLLeniaSim) {
    try {
      stopWorker();
      if (!webglSim) webglSim = new window.WebGLLeniaSim(glCanvas);
      activeBackend = "webgl";
      glCanvas.hidden = false;
      webglSim.init(worldWidth, worldHeight, currentModel());
      if (snapshot) {
        webglSim.loadSnapshot({ ...snapshot, model: currentModel() });
        simTime = Number(snapshot.simTime || 0);
      }
      backendTransitioning = false;
      syncBackendStatus();
      syncRunState();
      resetRenderBuffer();
      seedInitialFormIfReady();
      scheduleCheckpoint(0);
      requestRender();
      return;
    } catch (error) {
      if (backendPreference === "webgl") showToast(t("backend.webglFallback"));
      console.warn("WebGL backend unavailable:", error);
      webglSim = null;
    }
  }

  startCpuBackend(snapshot);
  syncBackendStatus();
  syncRunState();
}

async function handleBackendFailure(failedBackend, error, { useCachedOnly = false } = {}) {
  if (backendTransitioning || activeBackend !== failedBackend) return;
  backendTransitioning = true;
  console.error(`${failedBackend.toUpperCase()} backend failed:`, error);
  showToast(t("backend.failed", { backend: failedBackend === "webgl" ? "WebGL" : "CPU" }));
  const snapshot = useCachedOnly ? cloneSnapshot(lastKnownSnapshot) : await captureSnapshot();
  backendTransitioning = false;
  await startBackend({ preserve: false, forceBackend: failedBackend === "webgl" ? "cpu" : "webgl", snapshotOverride: snapshot });
}

function sendBackend(type, payload = {}, transfer = []) {
  if (backendTransitioning) return;
  const changesField = ["resize", "clear", "randomize", "place", "brush"].includes(type);
  if (!usingWebgl()) {
    postWorker(type, payload, transfer);
    if (changesField) scheduleCheckpoint();
    return;
  }
  if (type === "model") webglSim.setModel(payload.model);
  else if (type === "palette") webglSim.setPalette(payload.colors);
  else if (type === "resize") webglSim.resize(payload.width, payload.height);
  else if (type === "clear") webglSim.clear();
  else if (type === "randomize") webglSim.randomize(payload.rect, payload.channelId);
  else if (type === "place") webglSim.place(payload.placement);
  else if (type === "brush") webglSim.brush(payload);
  if (changesField) scheduleCheckpoint();
  requestRender();
}

function handleWorkerMessage(event) {
  if (activeBackend !== "cpu") return;
  const message = event.data;
  if (message.type === "ready") {
    workerReady = true;
    if (queuedSnapshot) {
      postWorker("loadSnapshot", { snapshot: { ...queuedSnapshot, model: currentModel() } });
      simTime = Number(queuedSnapshot.simTime || 0);
      queuedSnapshot = null;
    }
    backendTransitioning = false;
    syncBackendStatus();
    syncRunState();
    seedInitialFormIfReady();
    scheduleCheckpoint(0);
    return;
  }
  if (message.type === "frame") {
    updateFieldBuffer(message.patches || [], Boolean(message.reset));
    updateFieldMassFromMetrics(message.metrics);
    if (message.simTime != null) simTime = message.simTime;
    if (message.stepped) {
      workerBusy = false;
      drainStepQueue();
    }
    ui.timeLabel.textContent = `t ${simTime.toFixed(1)}`;
    if (performance.now() - lastCheckpointAt >= 900) void checkpointState();
    requestRender();
    return;
  }
  if (message.type === "snapshot") {
    const pending = snapshotRequests.get(message.requestId);
    if (!pending) return;
    window.clearTimeout(pending.timeoutId);
    snapshotRequests.delete(message.requestId);
    const channels = (message.channels || []).map((channel) => ({ ...channel, values: new Float32Array(channel.values) }));
    pending.resolve({
      width: message.width,
      height: message.height,
      channels,
      values: channels[0]?.values || new Float32Array(message.values || 0),
      simTime: message.simTime,
    });
    return;
  }
  if (message.type === "error") {
    workerBusy = false;
    void handleBackendFailure("cpu", new Error(message.message || "CPU simulator error"));
  }
}

function clearField() {
  simTime = 0;
  fieldHasMass = false;
  preparedPlacements = [];
  activePlacementIndex = -1;
  updatePlacementPanel();
  sendBackend("clear");
  ui.timeLabel.textContent = "t 0.0";
}

function randomizeField() {
  fieldHasMass = true;
  sendBackend("randomize", {
    rect: { left: 0, top: 0, right: worldWidth, bottom: worldHeight },
    channelId: CHANNEL_ID,
  });
}

function setRunning(value) {
  isRunning = Boolean(value);
  accumulator = 0;
  syncRunState();
}

function queueSteps(count) {
  if (!backendReady() || count <= 0) return;
  pendingStepCount = Math.min(8, pendingStepCount + count);
  drainStepQueue();
}

function drainStepQueue() {
  if (!backendReady() || pendingStepCount <= 0) return;
  if (usingWebgl()) {
    try {
      const count = Math.min(4, pendingStepCount);
      pendingStepCount -= count;
      const profile = webglSim.step(count);
      simTime += currentRule.dt * profile.steps;
      ui.timeLabel.textContent = `t ${simTime.toFixed(1)}`;
      if (performance.now() - lastCheckpointAt >= 900) void checkpointState();
      requestRender();
      if (pendingStepCount > 0) drainStepQueue();
    } catch (error) {
      void handleBackendFailure("webgl", error, { useCachedOnly: true });
    }
    return;
  }
  if (workerBusy) return;
  const count = Math.min(4, pendingStepCount);
  pendingStepCount -= count;
  workerBusy = true;
  postWorker("step", {
    count,
    safeRect: { left: 0, top: 0, right: worldWidth, bottom: worldHeight },
  });
}

function resetRenderBuffer() {
  fieldBufferCtx.fillStyle = palette[0];
  fieldBufferCtx.fillRect(0, 0, worldWidth, worldHeight);
  requestRender();
}

function makeBuffers() {
  fieldBuffer.width = worldWidth;
  fieldBuffer.height = worldHeight;
  fieldBufferCtx = fieldBuffer.getContext("2d", { alpha: false });
  fieldBufferCtx.imageSmoothingEnabled = false;
  resetRenderBuffer();
}

function updateFieldBuffer(patches, reset) {
  if (reset) resetRenderBuffer();
  for (const patch of patches) {
    if (!patch.pixels || patch.width <= 0 || patch.height <= 0) continue;
    fieldBufferCtx.putImageData(new ImageData(patch.pixels, patch.width, patch.height), patch.x, patch.y);
  }
}

function normalizeWorldSize(value, fallback) {
  const parsed = Math.round(Number(value));
  return Number.isFinite(parsed) ? clamp(parsed, WORLD_LIMITS.min, WORLD_LIMITS.max) : fallback;
}

function resizeWorldFromInputs() {
  const width = normalizeWorldSize(ui.fieldWidthInput.value, worldWidth);
  const height = normalizeWorldSize(ui.fieldHeightInput.value, worldHeight);
  ui.fieldWidthInput.value = String(width);
  ui.fieldHeightInput.value = String(height);
  if (width === worldWidth && height === worldHeight) return;
  worldWidth = width;
  worldHeight = height;
  makeBuffers();
  preparedPlacements = [];
  activePlacementIndex = -1;
  updatePlacementPanel();
  camera.x = worldWidth / 2;
  camera.y = worldHeight / 2;
  fitCamera();
  sendBackend("resize", { width: worldWidth, height: worldHeight });
}

function fileSafeName(value) {
  return (
    String(value || "field")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "field"
  );
}

function fileTimestamp(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z").replace(/[:.]/g, "-").replace("T", "_");
}

function downloadBlob(blob, extension) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const formName = selectedForm ? `-${fileSafeName(selectedForm.name)}` : "";
  link.href = url;
  link.download = `lenia-toy-lab${formName}-${fileTimestamp()}.${extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildMapConfiguration(snapshot) {
  return {
    speed: Number(ui.speedSlider.value),
    backendPreference,
    activeBackend,
    rule: cloneRule(currentRule),
    layers: currentModel(),
    advanced: { colors: [...palette] },
    state: { simTime: snapshot.simTime ?? simTime, isRunning },
    camera: { ...camera },
    display: { repeatField, showFieldBoundary },
  };
}

async function saveMapFile() {
  ui.saveMapBtn.disabled = true;
  ui.saveMapBtn.setAttribute("aria-busy", "true");
  try {
    const snapshot = await captureSnapshot();
    if (!snapshot) throw new Error(t("map.notReady"));
    const fields = (snapshot.channels || []).map((channel) => window.LeniaMapFormat.encodeField(channel.id, channel.values));
    const primaryValues = snapshot.values || snapshot.channels?.[0]?.values || new Float32Array();
    const savedAt = new Date();
    const map = {
      type: window.LeniaMapFormat.TYPE,
      name: t("map.name"),
      version: window.LeniaMapFormat.VERSION,
      savedAt: savedAt.toISOString(),
      world: { width: snapshot.width, height: snapshot.height },
      configuration: buildMapConfiguration(snapshot),
      fields,
      field: window.LeniaMapFormat.encodeField(CHANNEL_ID, primaryValues),
    };
    downloadBlob(new Blob([JSON.stringify(map, null, 2)], { type: "application/json" }), "map");
    showToast(t("map.saved"));
  } catch (error) {
    console.error("Could not save map:", error);
    showToast(t("map.saveError"));
  } finally {
    ui.saveMapBtn.disabled = false;
    ui.saveMapBtn.removeAttribute("aria-busy");
  }
}

function validateMapDimensions(map) {
  const width = Number(map.world?.width);
  const height = Number(map.world?.height ?? width);
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < WORLD_LIMITS.min ||
    height < WORLD_LIMITS.min ||
    width > WORLD_LIMITS.max ||
    height > WORLD_LIMITS.max
  ) {
    throw new Error(t("map.dimensions", { min: WORLD_LIMITS.min, max: WORLD_LIMITS.max }));
  }
  return { width, height };
}

function primaryMapLayer(map) {
  const layers = map.configuration?.layers;
  const channels = Array.isArray(layers?.channels) ? layers.channels : [];
  const preferredId = layers?.selectedChannelId || channels[0]?.id || CHANNEL_ID;
  const fields = Array.isArray(map.fields) ? map.fields : [];
  const field = fields.find((item) => (item.channelId || item.id) === preferredId) || fields[0] || map.field;
  if (!field?.data) throw new Error(t("map.noData"));
  const sourceId = field.channelId || field.id || preferredId;
  const channel = channels.find((item) => item.id === sourceId) || channels.find((item) => item.id === preferredId) || channels[0];
  const rules = Array.isArray(layers?.rules) ? layers.rules : [];
  const rule =
    rules.find((item) => (item.destinationChannelId || item.dst) === sourceId && (item.sourceChannelId || item.src) === sourceId) ||
    rules.find((item) => (item.destinationChannelId || item.dst) === sourceId) ||
    rules[0] ||
    map.configuration?.rule ||
    DEFAULT_RULE;
  const colors = channel?.palette || map.configuration?.advanced?.colors || palette;
  return { field, rule, colors };
}

function resetLoadedWorld(width, height, values, loadedTime = 0) {
  setRunning(false);
  fieldHasMass = valuesHaveMass(values);
  initialSeedPending = false;
  hasSeededInitialForm = true;
  worldWidth = width;
  worldHeight = height;
  ui.fieldWidthInput.value = String(width);
  ui.fieldHeightInput.value = String(height);
  preparedPlacements = [];
  activePlacementIndex = -1;
  updatePlacementPanel();
  makeBuffers();
  camera.x = width / 2;
  camera.y = height / 2;
  fitCamera();
  simTime = Number.isFinite(Number(loadedTime)) ? Number(loadedTime) : 0;
  ui.timeLabel.textContent = `t ${simTime.toFixed(1)}`;
  const snapshot = {
    width,
    height,
    model: currentModel(),
    channels: [{ id: CHANNEL_ID, name: "Field", visible: true, palette: [...palette], values }],
    values,
    simTime,
  };
  rememberSnapshot(snapshot);
  return snapshot;
}

function rotateFieldClockwise(values, width, height) {
  const rotated = new Float32Array(values.length);
  const rotatedWidth = height;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const rotatedX = height - 1 - y;
      const rotatedY = x;
      rotated[rotatedY * rotatedWidth + rotatedX] = values[y * width + x];
    }
  }
  return rotated;
}

async function loadMapSource(source, { announce = true, orientForViewport = false } = {}) {
  if (!source) return false;
  try {
    const map = JSON.parse(await source.text());
    if (map.type && map.type !== window.LeniaMapFormat.TYPE) throw new Error(t("map.invalid"));
    if (Number(map.version || 1) > window.LeniaMapFormat.VERSION) throw new Error(t("map.newerVersion"));
    let { width, height } = validateMapDimensions(map);
    const layer = primaryMapLayer(map);
    let values = window.LeniaMapFormat.decodeField(layer.field, width * height);
    if (orientForViewport && PHONE_LAYOUT_MEDIA.matches && width > height) {
      values = rotateFieldClockwise(values, width, height);
      [width, height] = [height, width];
    }

    currentRule = cloneRule({
      ...DEFAULT_RULE,
      ...layer.rule,
      id: DEFAULT_RULE.id,
      sourceChannelId: CHANNEL_ID,
      destinationChannelId: CHANNEL_ID,
    });
    syncRuleControls();
    applyPaletteColors(layer.colors);
    if (map.configuration?.speed != null) setSliderValue(ui.speedSlider, map.configuration.speed);
    if (map.configuration?.display) {
      repeatField = Boolean(map.configuration.display.repeatField);
      showFieldBoundary = map.configuration.display.showFieldBoundary !== false;
      ui.repeatFieldToggle.checked = repeatField;
      ui.showFieldBoundaryToggle.checked = showFieldBoundary;
      saveDisplaySettings();
    }
    syncLabels();

    const snapshot = resetLoadedWorld(width, height, values, map.configuration?.state?.simTime);
    await startBackend({ preserve: false, snapshotOverride: snapshot });
    if (announce) showToast(t("map.loaded", { name: source.name, width, height }));
    return true;
  } catch (error) {
    console.error("Could not load map:", error);
    if (announce) showToast(error instanceof Error ? error.message : t("map.loadError"));
    return false;
  }
}

async function loadMapFile(file) {
  return loadMapSource(file);
}

async function loadDefaultMap() {
  try {
    const response = await fetch(DEFAULT_MAP_PATH);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return loadMapSource(
      { name: DEFAULT_MAP_PATH, text: () => response.text() },
      { announce: false, orientForViewport: true },
    );
  } catch (error) {
    console.error(`Could not fetch default map ${DEFAULT_MAP_PATH}:`, error);
    return false;
  }
}

function fieldImageBlob(values, width, height) {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outputCtx = outputCanvas.getContext("2d");
  const imageData = outputCtx.createImageData(width, height);
  const colors = palette.map(hexToRgb);
  for (let index = 0; index < values.length; index += 1) {
    const scaled = clamp(values[index]) * (colors.length - 1);
    const base = Math.floor(scaled);
    const amount = scaled - base;
    const start = colors[base];
    const end = colors[Math.min(base + 1, colors.length - 1)];
    const pixel = index * 4;
    imageData.data[pixel] = Math.round(start[0] + (end[0] - start[0]) * amount);
    imageData.data[pixel + 1] = Math.round(start[1] + (end[1] - start[1]) * amount);
    imageData.data[pixel + 2] = Math.round(start[2] + (end[2] - start[2]) * amount);
    imageData.data[pixel + 3] = 255;
  }
  outputCtx.putImageData(imageData, 0, 0);
  return new Promise((resolve, reject) => {
    outputCanvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the field image."))), "image/png");
  });
}

async function saveImageFile() {
  ui.saveImageBtn.disabled = true;
  ui.saveImageBtn.setAttribute("aria-busy", "true");
  try {
    const snapshot = await captureSnapshot();
    if (!snapshot) throw new Error(t("map.notReady"));
    const values = snapshot.values || snapshot.channels?.[0]?.values;
    if (!values) throw new Error(t("image.noData"));
    downloadBlob(await fieldImageBlob(values, snapshot.width, snapshot.height), "png");
    showToast(t("image.saved"));
  } catch (error) {
    console.error("Could not save image:", error);
    showToast(t("image.saveError"));
  } finally {
    ui.saveImageBtn.disabled = false;
    ui.saveImageBtn.removeAttribute("aria-busy");
  }
}

async function loadImageFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast(t("image.choose"));
    return;
  }

  let image;
  try {
    image = await createImageBitmap(file);
    if (
      image.width < WORLD_LIMITS.min ||
      image.height < WORLD_LIMITS.min ||
      image.width > WORLD_LIMITS.max ||
      image.height > WORLD_LIMITS.max
    ) {
      showToast(t("image.dimensions", { min: WORLD_LIMITS.min, max: WORLD_LIMITS.max }));
      return;
    }

    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = image.width;
    sourceCanvas.height = image.height;
    const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    sourceCtx.drawImage(image, 0, 0);
    const pixels = sourceCtx.getImageData(0, 0, image.width, image.height).data;
    const values = new Float32Array(image.width * image.height);
    for (let pixel = 0, value = 0; pixel < pixels.length; pixel += 4, value += 1) {
      const luminance = (pixels[pixel] * 0.2126 + pixels[pixel + 1] * 0.7152 + pixels[pixel + 2] * 0.0722) / 255;
      values[value] = luminance * (pixels[pixel + 3] / 255);
    }

    const snapshot = resetLoadedWorld(image.width, image.height, values);
    await startBackend({ preserve: false, snapshotOverride: snapshot });
    showToast(t("image.loaded", { name: file.name, width: worldWidth, height: worldHeight }));
  } catch (error) {
    console.error("Could not load image:", error);
    showToast(t("image.loadError"));
  } finally {
    image?.close();
  }
}

function screenToWorld(screenX, screenY) {
  return {
    x: (screenX - cssWidth / 2) / camera.scale + camera.x,
    y: (screenY - cssHeight / 2) / camera.scale + camera.y,
  };
}

function worldToScreen(worldX, worldY) {
  return {
    x: (worldX - camera.x) * camera.scale + cssWidth / 2,
    y: (worldY - camera.y) * camera.scale + cssHeight / 2,
  };
}

function eventPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function clampCamera() {
  const halfW = cssWidth / (2 * camera.scale);
  const halfH = cssHeight / (2 * camera.scale);
  const horizontalLimit = worldWidth * CAMERA_PAN_LIMIT_FIELDS;
  const verticalLimit = worldHeight * CAMERA_PAN_LIMIT_FIELDS;
  camera.x = clamp(camera.x, -horizontalLimit - halfW, worldWidth + horizontalLimit + halfW);
  camera.y = clamp(camera.y, -verticalLimit - halfH, worldHeight + verticalLimit + halfH);
}

function fitCamera() {
  const availableHeight = Math.max(1, cssHeight - DEFAULT_VERTICAL_MARGIN);
  camera.scale = clamp(availableHeight / worldHeight, 0.1, 12);
  camera.x = worldWidth / 2;
  camera.y = worldHeight / 2;
  clampCamera();
  requestRender();
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const firstSize = cssWidth <= 1 || cssHeight <= 1;
  cssWidth = Math.max(1, rect.width);
  cssHeight = Math.max(1, rect.height);
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  if (firstSize) fitCamera();
  else clampCamera();
  requestRender();
}

function requestRender() {
  viewDirty = true;
}

function thumbnailImage(form) {
  if (form.thumbnailImage) return form.thumbnailImage;
  const image = new Image();
  image.decoding = "async";
  image.src = form.assetPath;
  image.addEventListener("load", requestRender, { once: true });
  image.addEventListener("error", () => console.error(`Missing generated thumbnail: ${form.assetPath}`), { once: true });
  form.thumbnailImage = image;
  return image;
}

function thumbnailCrop(cellData) {
  const longestSide = Math.max(cellData.width || 1, cellData.height || 1);
  const scale = Math.max(1, Math.floor((THUMBNAIL_STYLE.size - THUMBNAIL_STYLE.padding * 2) / longestSide));
  const width = Math.max(1, cellData.width * scale);
  const height = Math.max(1, cellData.height * scale);
  return {
    x: Math.floor((THUMBNAIL_STYLE.size - width) / 2),
    y: Math.floor((THUMBNAIL_STYLE.size - height) / 2),
    width,
    height,
  };
}

function placementCorners(placement) {
  const preview = thumbnailImage(placement.form);
  const width = Math.max(1, placement.cellData.width);
  const height = Math.max(1, placement.cellData.height);
  const center = worldToScreen(placement.x, placement.y);
  const halfW = (width * placement.scale * camera.scale) / 2;
  const halfH = (height * placement.scale * camera.scale) / 2;
  const cosine = Math.cos(placement.angle);
  const sine = Math.sin(placement.angle);
  const signs = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  const corners = signs.map(([sx, sy]) => {
    const x = sx * halfW;
    const y = sy * halfH;
    return { x: center.x + x * cosine - y * sine, y: center.y + x * sine + y * cosine, sx, sy };
  });
  return { preview, width, height, center, halfW, halfH, corners };
}

function drawPreparedPlacements() {
  if (currentTool !== "form") {
    updatePlacementWarnings();
    return;
  }
  preparedPlacements.forEach((placement, index) => {
    const geometry = placementCorners(placement);
    const crop = thumbnailCrop(placement.cellData);
    const scale = placement.scale * camera.scale;
    const rulesMismatch = !placementMatchesCurrentRule(placement);
    ctx.save();
    ctx.translate(geometry.center.x, geometry.center.y);
    ctx.rotate(placement.angle);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.76;
    ctx.imageSmoothingEnabled = false;
    if (geometry.preview.complete && geometry.preview.naturalWidth > 0) {
      ctx.drawImage(
        geometry.preview,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        -geometry.width / 2,
        -geometry.height / 2,
        geometry.width,
        geometry.height,
      );
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1 / Math.max(scale, 0.01);
    ctx.strokeStyle = rulesMismatch ? "#ff4d4d" : index === activePlacementIndex ? "#d7ffc2" : "rgba(214,255,194,.72)";
    ctx.strokeRect(-geometry.width / 2, -geometry.height / 2, geometry.width, geometry.height);
    ctx.restore();

    const handleSize = index === activePlacementIndex ? 8 : 7;
    for (const corner of geometry.corners) {
      ctx.fillStyle = index === activePlacementIndex ? "#b9ff92" : "#e8f7e1";
      ctx.strokeStyle = "#122011";
      ctx.lineWidth = 1;
      ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
    }
  });
  updatePlacementWarnings();
}

function updatePlacementWarnings() {
  if (currentTool !== "form") {
    ui.placementWarnings.replaceChildren();
    return;
  }
  const mismatched = new Set();
  preparedPlacements.forEach((placement, index) => {
    if (placementMatchesCurrentRule(placement)) return;
    mismatched.add(String(index));
    let warning = ui.placementWarnings.querySelector(`[data-placement-index="${index}"]`);
    if (!warning) {
      warning = document.createElement("span");
      warning.className = "placement-rule-warning";
      warning.dataset.placementIndex = String(index);
      warning.textContent = "\u26a0";
      warning.title = t(RULE_WARNING_TEXT_KEY);
      warning.setAttribute("role", "img");
      warning.setAttribute("aria-label", t(RULE_WARNING_TEXT_KEY));
      ui.placementWarnings.append(warning);
    }
    const geometry = placementCorners(placement);
    const offset = 13;
    warning.style.left = `${geometry.center.x - Math.cos(placement.angle) * (geometry.halfW + offset)}px`;
    warning.style.top = `${geometry.center.y - Math.sin(placement.angle) * (geometry.halfW + offset)}px`;
  });
  for (const warning of [...ui.placementWarnings.children]) {
    if (!mismatched.has(warning.dataset.placementIndex)) warning.remove();
  }
}

function updateActivePlacementControls() {
  const placement = preparedPlacements[activePlacementIndex];
  if (!placement || currentTool !== "form") {
    ui.activePlacementControls.hidden = true;
    return;
  }
  ui.loadPreparedRulesBtn.hidden = placementMatchesCurrentRule(placement);
  ui.activePlacementControls.hidden = false;
  const { corners } = placementCorners(placement);
  const maxX = Math.max(...corners.map((corner) => corner.x));
  const minY = Math.min(...corners.map((corner) => corner.y));
  const controlsWidth = ui.activePlacementControls.offsetWidth;
  const controlsHeight = ui.activePlacementControls.offsetHeight;
  const left = clamp(maxX + 8, 6, cssWidth - controlsWidth - 6);
  const top = clamp(minY, 6, cssHeight - controlsHeight - 6);
  ui.activePlacementControls.style.left = `${left}px`;
  ui.activePlacementControls.style.top = `${top}px`;
}

function drawBrushCursor() {
  if (!pointerHover || !["brush", "erase"].includes(currentTool)) return;
  const radius = Math.max(0.5, Number(ui.brushSizeSlider.value) - 1) * camera.scale;
  ctx.save();
  ctx.beginPath();
  ctx.arc(pointerHover.x, pointerHover.y, radius, 0, Math.PI * 2);
  ctx.setLineDash([4, 3]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,.68)";
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = currentTool === "erase" ? "#ffb0a4" : "#ecffe2";
  ctx.stroke();
  ctx.restore();
}

function drawCpuField(origin, fieldW, fieldH) {
  ctx.fillStyle = uiPalette.background;
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  ctx.imageSmoothingEnabled = false;
  if (!repeatField) {
    ctx.drawImage(fieldBuffer, origin.x, origin.y, fieldW, fieldH);
    return;
  }
  const startX = origin.x + Math.floor(-origin.x / fieldW) * fieldW;
  const startY = origin.y + Math.floor(-origin.y / fieldH) * fieldH;
  for (let y = startY; y < cssHeight; y += fieldH) {
    for (let x = startX; x < cssWidth; x += fieldW) ctx.drawImage(fieldBuffer, x, y, fieldW, fieldH);
  }
}

function render() {
  let webglRendered = false;
  if (usingWebgl()) {
    try {
      webglSim.render({ cssWidth, cssHeight, dpr, camera, background: uiPalette.background, repeatField });
      webglRendered = true;
    } catch (error) {
      glCanvas.hidden = true;
      void handleBackendFailure("webgl", error, { useCachedOnly: true });
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const origin = worldToScreen(0, 0);
  const fieldW = worldWidth * camera.scale;
  const fieldH = worldHeight * camera.scale;
  if (!usingWebgl()) drawCpuField(origin, fieldW, fieldH);
  else if (!webglRendered) {
    ctx.fillStyle = uiPalette.background;
    ctx.fillRect(0, 0, cssWidth, cssHeight);
  }

  if (showFieldBoundary) {
    ctx.strokeStyle = uiPalette.border;
    ctx.globalAlpha = 0.78;
    ctx.lineWidth = 1;
    ctx.strokeRect(origin.x + 0.5, origin.y + 0.5, fieldW - 1, fieldH - 1);
    ctx.globalAlpha = 1;
  }
  drawPreparedPlacements();
  drawBrushCursor();
  updateActivePlacementControls();
  viewDirty = false;
}

function flattenCellData(cellData) {
  if (cellData.flat) return cellData.flat;
  const flat = new Float32Array(cellData.width * cellData.height);
  for (let y = 0; y < cellData.height; y += 1) {
    for (let x = 0; x < cellData.width; x += 1) flat[y * cellData.width + x] = cellData.rows[y]?.[x] || 0;
  }
  cellData.flat = flat;
  return flat;
}

function sendCellPlacement(placement) {
  const baseCells = flattenCellData(placement.cellData);
  const cells = new Float32Array(baseCells);
  if (currentRule.coreName === "life") {
    for (let i = 0; i < cells.length; i += 1) cells[i] = cells[i] >= 0.5 ? 1 : 0;
  }
  if (valuesHaveMass(cells)) fieldHasMass = true;
  sendBackend(
    "place",
    {
      placement: {
        channelId: CHANNEL_ID,
        x: placement.x,
        y: placement.y,
        scale: placement.scale,
        angle: placement.angle,
        width: placement.cellData.width,
        height: placement.cellData.height,
        cells,
      },
    },
    [cells.buffer],
  );
}

function addPreparedPlacement(world) {
  if (!selectedForm) {
    showToast(t("library.selectFirst"));
    return -1;
  }
  return prepareFormAt(selectedForm, world);
}

function prepareFormAt(form, world) {
  if (!form) return -1;
  return commitPreparedPlacement({
    form,
    ruleInfo: cloneRule(ruleForCatalogForm(form)),
    x: world.x,
    y: world.y,
  });
}

function commitPreparedPlacement(placement) {
  if (!placement.form.cellData) placement.form.cellData = parseCellArray(placement.form.cells);
  preparedPlacements.push({
    ...placement,
    cellData: placement.form.cellData,
    scale: 1,
    angle: 0,
  });
  activePlacementIndex = preparedPlacements.length - 1;
  updatePlacementPanel();
  requestRender();
  return activePlacementIndex;
}

function ruleChangeAlertDisabled() {
  try {
    return localStorage.getItem(SKIP_RULE_CHANGE_ALERT_KEY) === "1";
  } catch {
    return false;
  }
}

function setRuleChangeAlertDisabled(value) {
  if (!value) return;
  try {
    localStorage.setItem(SKIP_RULE_CHANGE_ALERT_KEY, "1");
  } catch {
    // Ignore storage failures; the dialog still works for this session.
  }
}

function requestRuleChange(change) {
  if (rulesMatch(currentRule, change.rule) || !fieldHasMass || ruleChangeAlertDisabled()) {
    change.commit();
    return;
  }
  pendingRuleChange = change;
  ui.ruleChangeMessage.textContent = t(change.messageKey || "rules.changeWarning", change.messageVariables);
  ui.ruleChangeDialog.hidden = false;
  ui.confirmRuleChangeBtn.focus();
}

function hideRuleChangeDialog() {
  pendingRuleChange = null;
  ui.skipRuleChangeAlert.checked = false;
  ui.ruleChangeDialog.hidden = true;
}

function confirmRuleChange() {
  const change = pendingRuleChange;
  if (!change) return;
  setRuleChangeAlertDisabled(ui.skipRuleChangeAlert.checked);
  hideRuleChangeDialog();
  change.commit();
}

function placePreparedAt(index) {
  const placement = preparedPlacements[index];
  if (!placement) return;
  sendCellPlacement(placement);
  preparedPlacements.splice(index, 1);
  activePlacementIndex = preparedPlacements.length ? Math.min(index, preparedPlacements.length - 1) : -1;
  updatePlacementPanel();
  requestRender();
}

function removePreparedAt(index) {
  if (!preparedPlacements[index]) return;
  preparedPlacements.splice(index, 1);
  activePlacementIndex = preparedPlacements.length ? Math.min(index, preparedPlacements.length - 1) : -1;
  updatePlacementPanel();
  requestRender();
  showToast(t("placements.removed"));
}

function loadPreparedRulesetAt(index) {
  const placement = preparedPlacements[index];
  if (!placement || placementMatchesCurrentRule(placement)) return;
  applyLifeformConfiguration(placement.form, placement.ruleInfo);
}

function placeAllPrepared() {
  if (!preparedPlacements.length) return;
  for (const placement of preparedPlacements) sendCellPlacement(placement);
  const count = preparedPlacements.length;
  preparedPlacements = [];
  activePlacementIndex = -1;
  updatePlacementPanel();
  showToast(tp("placements.spawned", count));
}

function clearPreparedPlacements() {
  preparedPlacements = [];
  activePlacementIndex = -1;
  updatePlacementPanel();
  requestRender();
}

function updatePlacementPanel() {
  const placementsVisible = currentTool === "form";
  ui.placementPanel.hidden = !placementsVisible || preparedPlacements.length === 0;
  ui.placementCount.textContent = String(preparedPlacements.length);
  ui.placementSummaryLabel.textContent = tp("placements.summary", preparedPlacements.length);
  if (!placementsVisible || !preparedPlacements.length) ui.activePlacementControls.hidden = true;
  updatePlacementWarnings();
}

function hitTestPlacement(point) {
  for (let index = preparedPlacements.length - 1; index >= 0; index -= 1) {
    const placement = preparedPlacements[index];
    const geometry = placementCorners(placement);
    for (let cornerIndex = 0; cornerIndex < geometry.corners.length; cornerIndex += 1) {
      const corner = geometry.corners[cornerIndex];
      if (Math.hypot(point.x - corner.x, point.y - corner.y) <= PREPARED_HANDLE_HIT_RADIUS) {
        const baseAngle = Math.atan2(corner.sy * geometry.halfH, corner.sx * geometry.halfW);
        return { kind: "rotate", index, baseAngle };
      }
    }
    const dx = point.x - geometry.center.x;
    const dy = point.y - geometry.center.y;
    const cosine = Math.cos(-placement.angle);
    const sine = Math.sin(-placement.angle);
    const localX = dx * cosine - dy * sine;
    const localY = dx * sine + dy * cosine;
    if (Math.abs(localX) <= geometry.halfW && Math.abs(localY) <= geometry.halfH) return { kind: "move", index };
  }
  return null;
}

function updatePlacementCursor(point = pointerHover) {
  if (currentTool !== "form") return;
  if (!point) {
    canvas.style.cursor = "crosshair";
    return;
  }
  const hit = hitTestPlacement(point);
  if (hit?.kind === "rotate") canvas.style.cursor = "crosshair";
  else if (hit?.kind === "move") canvas.style.cursor = "move";
  else canvas.style.cursor = "crosshair";
}

function paintAt(world) {
  if (currentTool === "brush") fieldHasMass = true;
  sendBackend("brush", {
    channelId: CHANNEL_ID,
    x: modulo(Math.floor(world.x), worldWidth),
    y: modulo(Math.floor(world.y), worldHeight),
    radius: Math.max(0, Number(ui.brushSizeSlider.value) - 1),
    power: Number(ui.brushPowerSlider.value),
    mode: currentTool === "erase" ? "erase" : "paint",
  });
}

function setTool(tool) {
  currentTool = tool;
  const buttons = {
    brush: ui.brushToolBtn,
    erase: ui.eraseToolBtn,
    form: ui.formToolBtn,
  };
  Object.entries(buttons).forEach(([name, button]) => {
    const active = name === tool;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const brushActive = tool === "brush" || tool === "erase";
  ui.brushControls.hidden = !brushActive;
  ui.toolFormSelection.hidden = tool !== "form";
  ui.brushSizeSlider.disabled = !brushActive;
  ui.brushPowerSlider.disabled = !brushActive;
  updatePlacementPanel();
  if (brushActive) canvas.style.cursor = "none";
  else updatePlacementCursor();
  requestRender();
}

function currentPinchMetrics() {
  const points = [...activeTouchPointers.values()];
  if (points.length < 2) return null;
  const [first, second] = points;
  return {
    center: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
    distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
  };
}

function beginPinchGesture() {
  const metrics = currentPinchMetrics();
  if (!metrics) return;
  if (pointerState?.createdPlacement) {
    preparedPlacements.splice(pointerState.index, 1);
    activePlacementIndex = Math.min(activePlacementIndex, preparedPlacements.length - 1);
    updatePlacementPanel();
  }
  pointerState = null;
  pinchGestureActive = true;
  pinchState = {
    startDistance: metrics.distance,
    startScale: camera.scale,
    anchorWorld: screenToWorld(metrics.center.x, metrics.center.y),
  };
  canvas.style.cursor = "grabbing";
  requestRender();
}

function updatePinchGesture() {
  const metrics = currentPinchMetrics();
  if (!metrics || !pinchState) return;
  camera.scale = clamp(
    pinchState.startScale * (metrics.distance / pinchState.startDistance),
    MIN_CAMERA_SCALE,
    MAX_CAMERA_SCALE,
  );
  camera.x = pinchState.anchorWorld.x - (metrics.center.x - cssWidth / 2) / camera.scale;
  camera.y = pinchState.anchorWorld.y - (metrics.center.y - cssHeight / 2) / camera.scale;
  clampCamera();
  requestRender();
}

function handlePointerDown(event) {
  const point = eventPoint(event);
  const world = screenToWorld(point.x, point.y);
  const wantsPan = event.button === 1 || event.button === 2 || event.shiftKey;
  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  if (event.pointerType === "touch") {
    activeTouchPointers.set(event.pointerId, point);
    if (activeTouchPointers.size >= 2) {
      beginPinchGesture();
      return;
    }
  }
  if (wantsPan) {
    pointerState = { kind: "pan", id: event.pointerId, x: point.x, y: point.y };
    canvas.style.cursor = "grabbing";
    return;
  }
  if (currentTool === "form") {
    const hit = hitTestPlacement(point);
    if (hit?.kind === "rotate") {
      activePlacementIndex = hit.index;
      pointerState = { kind: "rotate", id: event.pointerId, index: hit.index, baseAngle: hit.baseAngle };
      canvas.style.cursor = "crosshair";
    } else if (hit?.kind === "move") {
      activePlacementIndex = hit.index;
      const placement = preparedPlacements[hit.index];
      pointerState = {
        kind: "move",
        id: event.pointerId,
        index: hit.index,
        offsetX: world.x - placement.x,
        offsetY: world.y - placement.y,
      };
      canvas.style.cursor = "move";
    } else {
      const index = addPreparedPlacement(world);
      pointerState = index < 0
        ? { kind: "select", id: event.pointerId }
        : { kind: "move", id: event.pointerId, index, offsetX: 0, offsetY: 0, createdPlacement: true };
      if (index >= 0) canvas.style.cursor = "move";
    }
    requestRender();
    return;
  }
  pointerState = { kind: "paint", id: event.pointerId, hasPainted: event.pointerType !== "touch" };
  if (event.pointerType !== "touch") paintAt(world);
}

function handlePointerMove(event) {
  const point = eventPoint(event);
  pointerHover = point;
  if (event.pointerType === "touch" && activeTouchPointers.has(event.pointerId)) {
    activeTouchPointers.set(event.pointerId, point);
    if (pinchGestureActive) {
      updatePinchGesture();
      return;
    }
  }
  const world = screenToWorld(point.x, point.y);
  if (!pointerState || pointerState.id !== event.pointerId) {
    updatePlacementCursor(point);
    requestRender();
    return;
  }
  if (pointerState.kind === "pan") {
    camera.x -= (point.x - pointerState.x) / camera.scale;
    camera.y -= (point.y - pointerState.y) / camera.scale;
    pointerState.x = point.x;
    pointerState.y = point.y;
    clampCamera();
    requestRender();
  } else if (pointerState.kind === "rotate") {
    const placement = preparedPlacements[pointerState.index];
    if (!placement) return;
    placement.angle = Math.atan2(world.y - placement.y, world.x - placement.x) - pointerState.baseAngle;
    canvas.style.cursor = "crosshair";
    requestRender();
  } else if (pointerState.kind === "move") {
    const placement = preparedPlacements[pointerState.index];
    if (!placement) return;
    placement.x = world.x - pointerState.offsetX;
    placement.y = world.y - pointerState.offsetY;
    canvas.style.cursor = "move";
    requestRender();
  } else if (pointerState.kind === "paint") {
    paintAt(world);
    pointerState.hasPainted = true;
  }
}

function handlePointerUp(event) {
  if (event.pointerType === "touch") {
    const wasPinching = pinchGestureActive;
    activeTouchPointers.delete(event.pointerId);
    if (wasPinching) {
      if (activeTouchPointers.size < 2) pinchState = null;
      if (activeTouchPointers.size === 0) pinchGestureActive = false;
      pointerState = null;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      setTool(currentTool);
      return;
    }
  }
  if (pointerState?.id !== event.pointerId) return;
  if (pointerState.kind === "paint" && !pointerState.hasPainted && event.type === "pointerup") {
    const point = eventPoint(event);
    paintAt(screenToWorld(point.x, point.y));
  }
  pointerState = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  setTool(currentTool);
  updatePlacementCursor(pointerHover);
}

function handleDoubleClick(event) {
  if (currentTool !== "form" || event.button !== 0 || event.shiftKey) return;
  const hit = hitTestPlacement(eventPoint(event));
  if (!hit) return;
  const placement = preparedPlacements[hit.index];
  if (!placement) return;
  event.preventDefault();
  applyLifeformConfiguration(placement.form, placement.ruleInfo, {
    onApplied: () => placePreparedAt(hit.index),
  });
}

function handleWheel(event) {
  event.preventDefault();
  const point = eventPoint(event);
  const before = screenToWorld(point.x, point.y);
  camera.scale = clamp(camera.scale * Math.exp(-event.deltaY * 0.001), MIN_CAMERA_SCALE, MAX_CAMERA_SCALE);
  const after = screenToWorld(point.x, point.y);
  camera.x += before.x - after.x;
  camera.y += before.y - after.y;
  clampCamera();
  requestRender();
}

function handleLibraryDragOver(event) {
  if (!event.dataTransfer?.types.includes(LIFEFORM_DRAG_TYPE)) {
    canvas.classList.remove("lifeform-drop-target");
    return;
  }
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
  canvas.classList.add("lifeform-drop-target");
}

function handleLibraryDragLeave(event) {
  if (event.relatedTarget !== canvas) canvas.classList.remove("lifeform-drop-target");
}

function handleLibraryDrop(event) {
  canvas.classList.remove("lifeform-drop-target");
  const formId = event.dataTransfer?.getData(LIFEFORM_DRAG_TYPE);
  const form = catalogForms.find((candidate) => candidate.id === formId);
  if (!form) return;
  const point = eventPoint(event);
  const world = screenToWorld(point.x, point.y);
  event.preventDefault();
  selectForm(form);
  setTool("form");
  prepareFormAt(form, world);
}

function renderPaletteOptions() {
  const previous = selectedPaletteRef;
  ui.paletteSelect.replaceChildren();
  const builtInGroup = document.createElement("optgroup");
  builtInGroup.label = t("theme.builtIn");
  for (const name of Object.keys(BUILT_IN_PALETTES)) {
    const option = new Option(t(`theme.${name}`), `builtin:${name}`);
    builtInGroup.append(option);
  }
  ui.paletteSelect.append(builtInGroup);
  if (customPalettes.length) {
    const customGroup = document.createElement("optgroup");
    customGroup.label = t("theme.myThemes");
    for (const item of customPalettes) customGroup.append(new Option(item.name, `custom:${item.name}`));
    ui.paletteSelect.append(customGroup);
  }
  const hasPrevious = [...ui.paletteSelect.options].some((option) => option.value === previous);
  selectedPaletteRef = hasPrevious ? previous : `builtin:${DEFAULT_THEME_NAME}`;
  ui.paletteSelect.value = selectedPaletteRef;
  syncPaletteDeleteButton();
}

function syncPaletteDeleteButton() {
  const isCustom = selectedPaletteRef.startsWith("custom:");
  ui.deletePaletteBtn.hidden = !isCustom;
}

function paletteBundleForReference(reference) {
  if (reference.startsWith("builtin:")) {
    const colors = BUILT_IN_PALETTES[reference.slice(8)];
    return colors ? { colors, ui: deriveUiPalette(colors), followsSimulation: true } : null;
  }
  if (reference.startsWith("custom:")) {
    const item = customPalettes.find((entry) => entry.name === reference.slice(7));
    return item ? { colors: item.colors, ui: item.ui, followsSimulation: false } : null;
  }
  return null;
}

function applyUiPalette(colors, { updateInputs = true } = {}) {
  uiPalette = normalizeUiPalette(colors, palette);
  for (const key of UI_COLOR_KEYS) {
    const value = uiPalette[key];
    document.documentElement.style.setProperty(`--${key}`, value);
    if (updateInputs) ui.uiColorInputs[key].value = value;
  }
  document.documentElement.style.setProperty("--font-family", THEME_FONTS[uiPalette.font]);
  document.documentElement.style.colorScheme = colorLuminance(uiPalette.background) > 0.55 ? "light" : "dark";
  if (updateInputs) ui.uiFontSelect.value = uiPalette.font;
  requestRender();
}

function applyPaletteColors(colors, { updateInputs = true, deriveUi = false } = {}) {
  palette = normalizePalette(colors);
  if (updateInputs) ui.colorInputs.forEach((input, index) => (input.value = palette[index]));
  if (deriveUi) applyUiPalette(deriveUiPalette(palette));
  resetRenderBuffer();
  sendBackend("palette", { colors: [...palette] });
}

function selectPalette(reference) {
  const bundle = paletteBundleForReference(reference);
  if (!bundle) return;
  selectedPaletteRef = reference;
  ui.paletteSelect.value = reference;
  uiPaletteFollowsSimulation = bundle.followsSimulation;
  applyPaletteColors(bundle.colors);
  applyUiPalette(bundle.ui);
  syncPaletteDeleteButton();
}

function saveCustomPalette() {
  const name = ui.paletteNameInput.value.trim();
  if (!name) {
    showToast(t("theme.nameRequired"));
    ui.paletteNameInput.focus();
    return;
  }
  if (Object.keys(BUILT_IN_PALETTES).some((builtIn) => builtIn.toLowerCase() === name.toLowerCase())) {
    showToast(t("theme.builtInName"));
    return;
  }
  const existing = customPalettes.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.name = name;
    existing.colors = [...palette];
    existing.ui = { ...uiPalette };
  } else {
    customPalettes.push({ name, colors: [...palette], ui: { ...uiPalette } });
  }
  customPalettes.sort((a, b) => a.name.localeCompare(b.name));
  saveCustomPalettes();
  selectedPaletteRef = `custom:${name}`;
  uiPaletteFollowsSimulation = false;
  renderPaletteOptions();
  ui.paletteSelect.value = selectedPaletteRef;
  ui.paletteNameInput.value = "";
  showToast(t("theme.saved", { name }));
}

function deleteSelectedPalette() {
  if (!selectedPaletteRef.startsWith("custom:")) return;
  const name = selectedPaletteRef.slice(7);
  customPalettes = customPalettes.filter((item) => item.name !== name);
  saveCustomPalettes();
  selectedPaletteRef = `builtin:${DEFAULT_THEME_NAME}`;
  renderPaletteOptions();
  selectPalette(selectedPaletteRef);
  showToast(t("theme.deleted", { name }));
}

function localizedCollectionLabel(collection) {
  return collection.id === "strict" ? t("library.strict") : collection.label;
}

function localizedGroupLabel(group) {
  return String(group).replace(/^Set (\d+)/, (_, number) => t("library.set", { number }));
}

function collectionForms(collection = ui.collectionSelect.value) {
  if (collection === "favorites") return catalogForms.filter((form) => favorites.has(form.id));
  if (collection === "all") return catalogForms;
  return catalogCollections.get(collection)?.forms || [];
}

function groupForForm(form, collection = ui.collectionSelect.value) {
  const collectionGroup = collectionMetadata.get(collection)?.get(form.id)?.group;
  if (collectionGroup) return collectionGroup;
  if (form.section) return form.section;
  if (form.sourceId === "bundled-lenia") return t("library.sourceBundled");
  if (form.sourceId === "lenia-repository") return t("library.sourceRepository");
  return form.sourceTitle || t("library.unclassified");
}

function ruleForCatalogForm(form) {
  return collectionMetadata.get(ui.collectionSelect.value)?.get(form.id)?.ruleInfo || form.ruleInfo;
}

function ruleNumbersMatch(left, right) {
  return Math.abs(Number(left) - Number(right)) <= 1e-9;
}

function rulesMatch(left, right) {
  if (!left || !right) return false;
  if (RULE_NUMBER_KEYS.some((key) => !ruleNumbersMatch(left[key], right[key]))) return false;
  if (RULE_VALUE_KEYS.some((key) => left[key] !== right[key])) return false;
  for (const key of ["beta", "eta"]) {
    for (let index = 0; index < 4; index += 1) {
      if (!ruleNumbersMatch(left[key]?.[index] || 0, right[key]?.[index] || 0)) return false;
    }
  }
  return true;
}

function formMatchesCurrentRule(form) {
  return Boolean(form) && rulesMatch(currentRule, ruleForCatalogForm(form));
}

function placementMatchesCurrentRule(placement) {
  return rulesMatch(currentRule, placement.ruleInfo || placement.form?.ruleInfo);
}

function syncRuleMismatchIndicators() {
  const matches = selectedForm ? formMatchesCurrentRule(selectedForm) : true;
  ui.toolFormRuleWarning.hidden = matches;
  const activePlacement = preparedPlacements[activePlacementIndex];
  ui.loadPreparedRulesBtn.hidden = !activePlacement || placementMatchesCurrentRule(activePlacement);
  updatePlacementWarnings();
  syncLoadedConfigurationStatus();
  requestRender();
}

function renderCollectionOptions() {
  const previous = ui.collectionSelect.value || "all";
  ui.collectionSelect.replaceChildren(
    new Option(t("library.all"), "all"),
    ...[...catalogCollections.values()].map((collection) => new Option(localizedCollectionLabel(collection), collection.id)),
    new Option(t("library.favorites", { count: favorites.size }), "favorites"),
  );
  ui.collectionSelect.value = [...ui.collectionSelect.options].some((option) => option.value === previous) ? previous : "all";
}

function renderGroupOptions({ preserve = true } = {}) {
  const previous = preserve ? ui.groupSelect.value : "all";
  const collection = catalogCollections.get(ui.collectionSelect.value);
  const groups = collection
    ? collection.groups.map((group) => group.label)
    : [...new Set(collectionForms().map((form) => groupForForm(form)).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  ui.groupSelect.replaceChildren(
    new Option(t("library.allGroups"), "all"),
    ...groups.map((group) => new Option(localizedGroupLabel(group), group)),
  );
  ui.groupSelect.value = groups.includes(previous) ? previous : "all";
}

function filteredForms() {
  const query = normalizeText(ui.formSearch.value);
  const group = ui.groupSelect.value;
  const ruleFilter = ui.ruleFilterSelect.value;
  return collectionForms().filter((form) => {
    if (group !== "all" && groupForForm(form) !== group) return false;
    if (ruleFilter === "discrete" && form.ruleInfo.coreName !== "life") return false;
    if (ruleFilter === "continuous" && form.ruleInfo.coreName === "life") return false;
    if (!query) return true;
    return normalizeText(`${form.code} ${form.name} ${form.section} ${form.sourceTitle}`).includes(query);
  });
}

function syncToolFormSelection(form) {
  if (!form) {
    ui.toolFormCode.textContent = t("tools.lifeform");
    ui.toolFormName.textContent = t("library.noSelection");
    ui.toolFormThumb.src = "assets/ui/form.png";
    ui.toolFormThumb.title = "";
    ui.toolFormRuleWarning.hidden = true;
    return;
  }
  ui.toolFormCode.textContent = form.code || t("tools.lifeformUpper");
  ui.toolFormName.textContent = form.name;
  ui.toolFormName.title = form.name;
  ui.toolFormThumb.title = form.name;
  ui.toolFormThumb.onerror = () => console.error(`Missing generated thumbnail: ${form.assetPath}`);
  ui.toolFormThumb.src = form.assetPath;
  syncRuleMismatchIndicators();
}

function createLoadedSettingsIndicator() {
  const indicator = document.createElement("span");
  indicator.className = "field-settings-indicator";
  indicator.textContent = "●";
  indicator.role = "img";
  indicator.setAttribute("aria-label", t("rules.settingsLoaded"));
  indicator.title = t("rules.settingsLoaded");
  return indicator;
}

function renderSelectedFormDetails() {
  const form = selectedForm;
  ui.selectedForm.replaceChildren();
  if (!form) {
    ui.selectedForm.textContent = t("library.noneSelected");
    return;
  }
  const ruleInfo = ruleForCatalogForm(form);
  const copy = document.createElement("div");
  copy.className = "selected-form-copy";
  const title = document.createElement("strong");
  title.textContent = `${form.code || t("tools.lifeform")} · ${form.name}`;
  const detail = document.createElement("span");
  detail.textContent = ` R ${ruleInfo.radius} · μ ${ruleInfo.mu.toFixed(3)} · σ ${ruleInfo.sigma.toFixed(3)}`;
  copy.append(title, detail);
  if (formMatchesCurrentRule(form)) {
    ui.selectedForm.append(copy, createLoadedSettingsIndicator());
  } else {
    const loadButton = document.createElement("button");
    loadButton.className = "load-field-button";
    loadButton.type = "button";
    loadButton.textContent = t("rules.loadField");
    loadButton.addEventListener("click", () => applyLifeformConfiguration(form));
    ui.selectedForm.append(copy, loadButton);
  }
}

function syncLoadedConfigurationStatus() {
  renderSelectedFormDetails();
  ui.formList.querySelectorAll(".form-card").forEach((card) => {
    const indicator = card.querySelector(".field-settings-indicator");
    const form = catalogForms.find((candidate) => candidate.id === card.dataset.formId);
    if (indicator) indicator.hidden = !formMatchesCurrentRule(form);
  });
}

function selectForm(form) {
  selectedForm = form;
  syncToolFormSelection(form);
  renderSelectedFormDetails();
  ui.formList.querySelectorAll(".form-card").forEach((card) => {
    const active = card.dataset.formId === form.id;
    card.classList.toggle("selected", active);
    card.setAttribute("aria-selected", String(active));
  });
}

function applyLifeformConfiguration(form, ruleOverride = null, { onApplied = null } = {}) {
  const ruleInfo = ruleOverride || ruleForCatalogForm(form);
  const nextRule = cloneRule({
    ...ruleInfo,
    id: DEFAULT_RULE.id,
    sourceChannelId: CHANNEL_ID,
    destinationChannelId: CHANNEL_ID,
  });
  const configurationAlreadyLoaded = rulesMatch(currentRule, nextRule);
  requestRuleChange({
    rule: nextRule,
    messageKey: "rules.loadingWarning",
    messageVariables: { name: form.code || form.name },
    commit: () => {
      currentRule = nextRule;
      syncRuleControls();
      configureBackend();
      if (!configurationAlreadyLoaded) showToast(t("rules.loaded", { name: form.code || form.name }));
      onApplied?.();
    },
  });
}

function toggleFavorite(form) {
  if (favorites.has(form.id)) favorites.delete(form.id);
  else favorites.add(form.id);
  saveFavorites();
  const collection = ui.collectionSelect.value;
  const value = collection;
  renderCollectionOptions();
  ui.collectionSelect.value = value;
  if (collection === "favorites") renderGroupOptions();
  renderFormList();
}

function buildFormCard(form) {
  const ruleInfo = ruleForCatalogForm(form);
  const card = document.createElement("div");
  card.className = "form-card";
  card.dataset.formId = form.id;
  card.role = "option";
  card.tabIndex = 0;
  card.draggable = true;
  card.setAttribute("aria-selected", String(selectedForm?.id === form.id));
  if (selectedForm?.id === form.id) card.classList.add("selected");

  const image = document.createElement("img");
  image.className = "form-thumb";
  image.src = form.assetPath;
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => console.error(`Missing generated thumbnail: ${form.assetPath}`), { once: true });

  const copy = document.createElement("div");
  copy.className = "form-copy";
  const code = document.createElement("span");
  code.className = "form-code";
  code.textContent = form.code || t("tools.lifeformUpper");
  const name = document.createElement("span");
  name.className = "form-name";
  name.textContent = form.name;
  name.title = form.name;
  const meta = document.createElement("span");
  meta.className = "form-meta";
  meta.textContent = `R ${ruleInfo.radius} · μ ${ruleInfo.mu.toFixed(3)}`;
  copy.append(code, name, meta);

  const favoriteButton = document.createElement("button");
  favoriteButton.className = `favorite-button${favorites.has(form.id) ? " active" : ""}`;
  favoriteButton.type = "button";
  favoriteButton.textContent = favorites.has(form.id) ? "★" : "☆";
  const favoriteLabel = t(favorites.has(form.id) ? "library.removeFavorite" : "library.addFavorite", { name: form.name });
  favoriteButton.setAttribute("aria-label", favoriteLabel);
  favoriteButton.title = favoriteLabel;
  favoriteButton.setAttribute("aria-pressed", String(favorites.has(form.id)));
  favoriteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFavorite(form);
  });

  const loadedIndicator = createLoadedSettingsIndicator();
  loadedIndicator.hidden = !formMatchesCurrentRule(form);

  const choose = () => {
    selectForm(form);
    setTool("form");
  };
  card.addEventListener("click", choose);
  card.addEventListener("dblclick", () => {
    selectForm(form);
    applyLifeformConfiguration(form);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    choose();
    if (event.ctrlKey || event.metaKey) applyLifeformConfiguration(form);
  });
  card.addEventListener("dragstart", (event) => {
    if (!event.dataTransfer) return;
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(LIFEFORM_DRAG_TYPE, form.id);
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    canvas.classList.remove("lifeform-drop-target");
  });
  card.append(image, copy, loadedIndicator, favoriteButton);
  return card;
}

function renderFormList() {
  const forms = filteredForms();
  ui.libraryCount.textContent = tp("library.count", forms.length);
  const fragment = document.createDocumentFragment();
  if (!forms.length) {
    const empty = document.createElement("div");
    empty.className = "empty-library";
    empty.textContent = t(ui.collectionSelect.value === "favorites" ? "library.emptyFavorites" : "library.emptyFilters");
    fragment.append(empty);
  } else {
    for (const form of forms) fragment.append(buildFormCard(form));
  }
  ui.formList.replaceChildren(fragment);
}

function seedInitialFormIfReady() {
  if (!initialSeedPending || hasSeededInitialForm || !selectedForm || !backendReady()) return;
  if (!selectedForm.cellData) selectedForm.cellData = parseCellArray(selectedForm.cells);
  sendCellPlacement({
    form: selectedForm,
    cellData: selectedForm.cellData,
    x: worldWidth / 2,
    y: worldHeight / 2,
    scale: 1,
    angle: 0,
  });
  initialSeedPending = false;
  hasSeededInitialForm = true;
}

function resetFieldConfiguration() {
  const nextRule = cloneRule(DEFAULT_RULE);
  requestRuleChange({
    rule: nextRule,
    messageKey: "rules.resetWarning",
    commit: () => {
      currentRule = nextRule;
      ui.radiusSlider.min = "1";
      ui.radiusSlider.max = "128";
      ui.alphaSlider.min = "1";
      ui.alphaSlider.max = "12";
      ui.muSlider.min = "0.010";
      ui.muSlider.max = "0.550";
      ui.sigmaSlider.min = "0.001";
      ui.sigmaSlider.max = "0.150";
      ui.dtSlider.min = "0.001";
      ui.dtSlider.max = "1.000";
      syncRuleControls();
      configureBackend();
      showToast(t("rules.fieldReset"));
    },
  });
}

function refreshLocalizedUi() {
  syncBackendStatus();
  if (startupStatus) ui.stateLabel.textContent = t(`state.${startupStatus}`);
  else syncRunState();
  renderPaletteOptions();
  renderCollectionOptions();
  renderGroupOptions();
  renderFormList();
  syncToolFormSelection(selectedForm);
  renderSelectedFormDetails();
  updatePlacementPanel();
  ui.expandLibraryBtn.textContent = t(ui.libraryPanel.classList.contains("expanded") ? "library.collapse" : "library.expand");
  if (pendingRuleChange) {
    ui.ruleChangeMessage.textContent = t(pendingRuleChange.messageKey || "rules.changeWarning", pendingRuleChange.messageVariables);
  }
}

window.addEventListener("lenia:languagechange", refreshLocalizedUi);

function mobilePanelById(panelId) {
  return ui.mobilePanels.find((panel) => panel.id === panelId) || null;
}

function activeMobilePanel() {
  return ui.mobilePanels.find((panel) => !panel.classList.contains("mobile-collapsed")) || null;
}

function applyMobilePanelState(activePanel) {
  for (const panel of ui.mobilePanels) panel.classList.toggle("mobile-collapsed", panel !== activePanel);
  for (const button of ui.mobilePanelButtons) {
    button.setAttribute("aria-expanded", String(button.dataset.mobilePanelTarget === activePanel?.id));
  }
  document.body.classList.toggle("mobile-panel-open", Boolean(activePanel));
  if (activePanel) window.scrollTo({ top: 0, behavior: "auto" });
}

function openMobilePanel(panel) {
  if (!PHONE_LAYOUT_MEDIA.matches || !panel) return;
  if (activeMobilePanel() === panel) {
    closeMobilePanel();
    return;
  }
  applyMobilePanelState(panel);
  const previousState = history.state && typeof history.state === "object" ? history.state : {};
  const nextState = { ...previousState, leniaMobilePanel: panel.id };
  if (previousState.leniaMobilePanel) history.replaceState(nextState, "");
  else history.pushState(nextState, "");
}

function closeMobilePanel() {
  if (!document.body.classList.contains("mobile-panel-open")) return;
  applyMobilePanelState(null);
  if (history.state?.leniaMobilePanel) history.back();
}

function bindEvents() {
  for (const button of ui.mobilePanelButtons) {
    button.addEventListener("click", () => openMobilePanel(mobilePanelById(button.dataset.mobilePanelTarget)));
  }
  for (const button of ui.mobilePanelCloseButtons) button.addEventListener("click", closeMobilePanel);
  window.addEventListener("popstate", (event) => {
    if (!PHONE_LAYOUT_MEDIA.matches) return;
    applyMobilePanelState(mobilePanelById(event.state?.leniaMobilePanel));
  });
  if (PHONE_LAYOUT_MEDIA.matches) {
    const initialState = history.state && typeof history.state === "object" ? { ...history.state } : {};
    delete initialState.leniaMobilePanel;
    history.replaceState(initialState, "");
    applyMobilePanelState(null);
  }

  ui.runBtn.addEventListener("click", () => setRunning(!isRunning));
  ui.stepBtn.addEventListener("click", () => queueSteps(1));
  ui.clearBtn.addEventListener("click", clearField);
  ui.randomBtn.addEventListener("click", randomizeField);
  ui.speedSlider.addEventListener("input", syncLabels);

  ui.fieldWidthInput.addEventListener("change", resizeWorldFromInputs);
  ui.fieldHeightInput.addEventListener("change", resizeWorldFromInputs);
  ui.backendSelect.addEventListener("change", async () => {
    backendPreference = ui.backendSelect.value;
    await startBackend({ preserve: true });
  });
  ui.repeatFieldToggle.addEventListener("change", () => {
    repeatField = ui.repeatFieldToggle.checked;
    saveDisplaySettings();
    requestRender();
  });
  ui.showFieldBoundaryToggle.addEventListener("change", () => {
    showFieldBoundary = ui.showFieldBoundaryToggle.checked;
    saveDisplaySettings();
    requestRender();
  });
  ui.saveMapBtn.addEventListener("click", () => void saveMapFile());
  ui.loadMapBtn.addEventListener("click", () => {
    ui.loadMapInput.value = "";
    ui.loadMapInput.click();
  });
  ui.loadMapInput.addEventListener("change", () => void loadMapFile(ui.loadMapInput.files?.[0]));
  ui.saveImageBtn.addEventListener("click", () => void saveImageFile());
  ui.loadImageBtn.addEventListener("click", () => {
    ui.loadImageInput.value = "";
    ui.loadImageInput.click();
  });
  ui.loadImageInput.addEventListener("change", () => void loadImageFile(ui.loadImageInput.files?.[0]));

  for (const slider of [ui.radiusSlider, ui.alphaSlider, ui.muSlider, ui.sigmaSlider, ui.dtSlider]) {
    slider.addEventListener("input", syncLabels);
    slider.addEventListener("change", requestRuleControlChange);
  }
  ui.resetFieldConfigBtn.addEventListener("click", resetFieldConfiguration);

  ui.paletteSelect.addEventListener("change", () => selectPalette(ui.paletteSelect.value));
  for (const input of ui.colorInputs) {
    input.addEventListener("input", () =>
      applyPaletteColors(ui.colorInputs.map((item) => item.value), {
        updateInputs: false,
        deriveUi: uiPaletteFollowsSimulation,
      }),
    );
  }
  for (const input of Object.values(ui.uiColorInputs)) {
    input.addEventListener("input", () => {
      uiPaletteFollowsSimulation = false;
      applyUiPalette(
        {
          ...uiPalette,
          ...Object.fromEntries(Object.entries(ui.uiColorInputs).map(([key, colorInput]) => [key, colorInput.value])),
        },
        { updateInputs: false },
      );
    });
  }
  ui.uiFontSelect.addEventListener("change", () => {
    uiPaletteFollowsSimulation = false;
    applyUiPalette({ ...uiPalette, font: ui.uiFontSelect.value });
  });
  ui.savePaletteBtn.addEventListener("click", saveCustomPalette);
  ui.paletteNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveCustomPalette();
  });
  ui.deletePaletteBtn.addEventListener("click", deleteSelectedPalette);

  ui.brushToolBtn.addEventListener("click", () => setTool("brush"));
  ui.eraseToolBtn.addEventListener("click", () => setTool("erase"));
  ui.formToolBtn.addEventListener("click", () => setTool("form"));
  ui.brushSizeSlider.addEventListener("input", () => {
    syncLabels();
    requestRender();
  });
  ui.brushPowerSlider.addEventListener("input", syncLabels);

  ui.expandLibraryBtn.addEventListener("click", () => {
    const expanded = ui.libraryPanel.classList.toggle("expanded");
    ui.expandLibraryBtn.textContent = t(expanded ? "library.collapse" : "library.expand");
    ui.expandLibraryBtn.setAttribute("aria-expanded", String(expanded));
  });
  ui.formSearch.addEventListener("input", renderFormList);
  ui.collectionSelect.addEventListener("change", () => {
    renderGroupOptions({ preserve: false });
    renderFormList();
    if (selectedForm) selectForm(selectedForm);
  });
  ui.groupSelect.addEventListener("change", renderFormList);
  ui.ruleFilterSelect.addEventListener("change", renderFormList);

  ui.cancelPlacementsBtn.addEventListener("click", clearPreparedPlacements);
  ui.placeAllBtn.addEventListener("click", placeAllPrepared);
  ui.loadPreparedRulesBtn.addEventListener("click", () => loadPreparedRulesetAt(activePlacementIndex));
  ui.placePreparedBtn.addEventListener("click", () => placePreparedAt(activePlacementIndex));
  ui.removePreparedBtn.addEventListener("click", () => removePreparedAt(activePlacementIndex));
  ui.cancelRuleChangeBtn.addEventListener("click", hideRuleChangeDialog);
  ui.confirmRuleChangeBtn.addEventListener("click", confirmRuleChange);
  ui.ruleChangeDialog.addEventListener("click", (event) => {
    if (event.target === ui.ruleChangeDialog) hideRuleChangeDialog();
  });

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);
  canvas.addEventListener("dblclick", handleDoubleClick);
  canvas.addEventListener("pointerleave", () => {
    if (!pointerState) {
      pointerHover = null;
      updatePlacementCursor(null);
      requestRender();
    }
  });
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  canvas.addEventListener("wheel", handleWheel, { passive: false });
  canvas.addEventListener("dragover", handleLibraryDragOver);
  canvas.addEventListener("dragleave", handleLibraryDragLeave);
  canvas.addEventListener("drop", handleLibraryDrop);
  glCanvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    if (activeBackend === "webgl") void handleBackendFailure("webgl", new Error("WebGL context lost"), { useCachedOnly: true });
  });
  glCanvas.addEventListener("webglcontextrestored", () => {
    webglSim = null;
  });
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("blur", () => {
    pointerState = null;
    activeTouchPointers.clear();
    pinchState = null;
    pinchGestureActive = false;
  });
  window.addEventListener("keydown", (event) => {
    if (!ui.ruleChangeDialog.hidden) {
      if (event.key === "Escape") hideRuleChangeDialog();
      return;
    }
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLSelectElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLElement && event.target.isContentEditable ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) return;
    if (event.repeat) return;
    if (event.code === "Space") {
      if (event.target instanceof HTMLButtonElement) return;
      event.preventDefault();
      setRunning(!isRunning);
    } else if (event.key.toLowerCase() === "b") setTool("brush");
    else if (event.key.toLowerCase() === "e") setTool("erase");
    else if (event.key.toLowerCase() === "l") setTool("form");
    else if (event.key.toLowerCase() === "s") queueSteps(1);
    else if (event.key.toLowerCase() === "c") clearField();
    else if (event.key.toLowerCase() === "r") randomizeField();
    else if (event.key === "Escape" && preparedPlacements.length) clearPreparedPlacements();
  });
}

function tick(now) {
  if (!lastFrameAt) lastFrameAt = now;
  const elapsed = Math.min(250, now - lastFrameAt);
  lastFrameAt = now;
  if (usingWebgl()) {
    const metrics = webglSim.readMetrics(now);
    if (metrics) updateFieldMassFromMetrics(metrics);
  }
  if (isRunning && backendReady()) {
    accumulator += elapsed;
    const stepMs = 1000 / Math.max(1, Number(ui.speedSlider.value));
    let dueSteps = 0;
    while (accumulator >= stepMs && dueSteps < 8) {
      accumulator -= stepMs;
      dueSteps += 1;
    }
    if (dueSteps >= 8) accumulator = 0;
    queueSteps(dueSteps);
  }
  if (viewDirty || preparedPlacements.length || pointerHover) render();
  requestAnimationFrame(tick);
}

async function loadCatalog() {
  const registry = window.LeniaCatalog.createRegistry(catalogSources(), { assetBase: LIFEFORM_ASSET_BASE });
  catalogForms = registry.forms;
  for (const form of catalogForms) {
    form.ruleInfo = parseRule(form.rule);
    form.cellData = null;
    form.thumbnailImage = null;
  }
  catalogCollections = resolveCatalogCollections(registry);
  const strictCollection = catalogCollections.get("strict");
  strictForms = strictCollection?.forms || [];

  const catalogIds = new Set(catalogForms.map((form) => form.id));
  const cleanedFavorites = new Set([...favorites].filter((id) => catalogIds.has(id)));
  if (cleanedFavorites.size !== favorites.size) {
    favorites = cleanedFavorites;
    saveFavorites();
  }

  selectedForm =
    strictForms.find((form) => normalizeText(form.name) === normalizeText(DEFAULT_FORM_NAME)) ||
    catalogForms.find((form) => normalizeText(form.name) === normalizeText(DEFAULT_FORM_NAME)) ||
    strictForms[0] ||
    catalogForms[0] ||
    null;
  renderCollectionOptions();
  renderGroupOptions({ preserve: false });
  renderFormList();
  if (selectedForm) selectForm(selectedForm);
  else ui.selectedForm.textContent = t("library.noneFound");
}

async function boot() {
  ui.fieldWidthInput.value = String(worldWidth);
  ui.fieldHeightInput.value = String(worldHeight);
  makeBuffers();
  resizeCanvas();
  bindEvents();
  ui.repeatFieldToggle.checked = repeatField;
  ui.showFieldBoundaryToggle.checked = showFieldBoundary;
  renderPaletteOptions();
  selectPalette(`builtin:${DEFAULT_THEME_NAME}`);
  syncRuleControls();
  syncLabels();
  setTool("form");
  await loadCatalog();
  const loadedDefaultMap = await loadDefaultMap();
  if (!loadedDefaultMap) await startBackend({ preserve: false });
  setRunning(DEFAULT_RUNNING);
  requestAnimationFrame(tick);
}

if (window.location.protocol === "file:") {
  startupStatus = "serverRequired";
  ui.fileProtocolNotice.hidden = false;
  ui.stateLabel.textContent = t("state.serverRequired");
} else {
  boot().catch((error) => {
    console.error(error);
    startupStatus = "couldNotStart";
    ui.stateLabel.textContent = t("state.couldNotStart");
    showToast(t("app.startError"));
  });
}
