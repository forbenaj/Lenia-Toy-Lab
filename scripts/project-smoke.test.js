"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "src", "lenia-toy-lab.js"), "utf8");
const musicPlayer = fs.readFileSync(path.join(root, "src", "music-player.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "src", "lenia-toy-lab.css"), "utf8");
const themes = fs.readFileSync(path.join(root, "src", "lenia-themes.js"), "utf8");
const collections = fs.readFileSync(path.join(root, "src", "lifeform-collections.js"), "utf8");
const albumDirectory = path.join(root, "assets", "music", "speaces", "el-orbe-unicolado");
const albumManifest = JSON.parse(fs.readFileSync(path.join(albumDirectory, "tracks.json"), "utf8"));
const defaultMapPath = path.join(root, "assets", "maps", "default_0.map");

for (const id of [
  "speedSlider",
  "fieldWidthInput",
  "fieldHeightInput",
  "backendSelect",
  "repeatFieldToggle",
  "showFieldBoundaryToggle",
  "saveMapBtn",
  "loadMapBtn",
  "loadMapInput",
  "saveImageBtn",
  "loadImageBtn",
  "loadImageInput",
  "radiusSlider",
  "alphaSlider",
  "muSlider",
  "sigmaSlider",
  "dtSlider",
  "paletteSelect",
  "brushToolBtn",
  "eraseToolBtn",
  "formToolBtn",
  "libraryPanel",
  "placementPanel",
  "placeAllBtn",
  "activePlacementControls",
  "loadPreparedRulesBtn",
  "placePreparedBtn",
  "removePreparedBtn",
  "uiPaletteColors",
  "uiFontSelect",
  "toolFormSelection",
  "toolFormThumb",
  "toolFormRuleWarning",
  "placementWarnings",
  "ruleChangeDialog",
  "ruleChangeMessage",
  "skipRuleChangeAlert",
  "cancelRuleChangeBtn",
  "confirmRuleChangeBtn",
  "fileProtocolNotice",
  "albumAudio",
  "musicPreviousBtn",
  "musicPlayBtn",
  "musicNextBtn",
  "musicVolumeBtn",
  "musicVolumeSlider",
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `index.html includes #${id}`);
}

assert.match(html, /value="196"/, "field width defaults to 196");
assert.match(html, /value="128"/, "field height defaults to 128");
assert.match(html, /<option value="auto"[^>]*selected[^>]*>Auto<\/option>/, "backend defaults to Auto");
assert.match(html, /id="repeatFieldToggle"[^>]*checked/, "field repetition defaults to on");
assert.match(html, /id="showFieldBoundaryToggle"[^>]*checked/, "field boundary defaults to on");
assert.doesNotMatch(html, /Game mode|Clamp values|Wrap edges|Layers|role="tablist"/i, "removed controls stay out of the UI");

for (const palette of ["Ambar", "Neon Green", "Neon Blue", "LCD Green", "LCD Green 2", "Heatmap", "Monochrome"]) {
  assert.ok(themes.includes(`${JSON.stringify(palette)}:`) || themes.includes(`${palette}:`), `includes ${palette}`);
}
assert.match(script, /DEFAULT_THEME_NAME\s*=\s*"Ambar"/, "Ambar is the default theme");
assert.match(script, /function hexToRgb\(/, "theme derivation includes its RGB conversion helper");
assert.match(themes, /LENIA_THUMBNAIL_THEME\s*=\s*"Monochrome"/, "generated thumbnails use the Monochrome theme");
assert.match(themes, /LENIA_THUMBNAIL_STYLE/, "thumbnail generation and placement share one layout definition");

assert.match(script, /wrapAround:\s*true/, "the simulation wraps by default");
assert.match(script, /addEventListener\("dblclick"/, "lifeforms support double-click configuration loading");
assert.match(script, /preparedPlacements\.push/, "multiple prepared forms are supported");
assert.match(script, /kind:\s*"move"/, "prepared forms can be moved");
assert.match(script, /canvas\.style\.cursor = "move"/, "moving uses a move cursor");
assert.match(script, /hit\?\.kind === "rotate"\) canvas\.style\.cursor = "crosshair"/, "rotation handles use a rotation-appropriate fallback cursor");
assert.match(script, /setTool\("form"\)/, "selecting a lifeform activates the Form tool");
assert.match(script, /function placePreparedAt/, "a prepared form can be placed individually");
assert.match(script, /function removePreparedAt/, "a prepared form can be removed individually");
assert.match(script, /function loadPreparedRulesetAt/, "a prepared form can load its ruleset individually");
assert.match(
  script,
  /loadPreparedRulesBtn\.hidden = placementMatchesCurrentRule\(placement\)/,
  "the prepared-form ruleset button is only shown for a rules mismatch",
);
assert.match(
  script,
  /function syncRuleMismatchIndicators\(\)[\s\S]*?loadPreparedRulesBtn\.hidden[\s\S]*?syncLoadedConfigurationStatus\(\)/,
  "every ruleset change synchronizes placement and catalog indicators together",
);
assert.match(html, /id="loadPreparedRulesBtn"[\s\S]*?assets\/ui\/load\.png/, "the prepared-form ruleset button uses the load icon");
assert.match(script, /canvas\.addEventListener\("dblclick", handleDoubleClick\)/, "double-clicking places a prepared form immediately");
assert.match(
  script,
  /function handleDoubleClick[\s\S]*?applyLifeformConfiguration\(placement\.form, placement\.ruleInfo, \{[\s\S]*?onApplied: \(\) => placePreparedAt\(hit\.index\)/,
  "double-clicking a prepared form waits for rule confirmation before placing it",
);
assert.doesNotMatch(script, /Prepared form placed\./, "placing a form does not show a toast");
assert.doesNotMatch(html, /id=["']libraryHint["']/, "the redundant library hint stays out of the UI");
assert.match(script, /loadButton\.textContent = t\("rules\.loadField"\)/, "the selected form can load its localized field settings");
assert.match(html, /Doesn't match the field rules\./, "the selected lifeform warns when its rules differ from the field");
assert.match(script, /RULE_WARNING_TEXT_KEY\s*=\s*"rules\.mismatch"/, "prepared lifeforms use the localized rule mismatch explanation");
assert.match(script, /function rulesMatch\(/, "field and lifeform rules have an explicit compatibility check");
assert.match(script, /ctx\.strokeStyle = rulesMismatch \? "#ff4d4d"/, "mismatched prepared lifeforms get a red boundary");
assert.match(styles, /\.placement-rule-warning/, "mismatched prepared lifeforms show an alert icon");
assert.match(html, /role="alertdialog"/, "changing rules over existing mass uses an accessible alert dialog");
assert.match(html, /Change Rules/, "the rule change dialog requires explicit confirmation");
assert.doesNotMatch(html, /Prepare Anyway/, "preparing a mismatched lifeform no longer opens a confirmation dialog");
assert.match(script, /function requestRuleChange\([\s\S]*?fieldHasMass/, "rule changes are gated when the field has mass");
assert.match(script, /SKIP_RULE_CHANGE_ALERT_KEY/, "the rule change alert supports Don't show again");
assert.match(script, /slider\.addEventListener\("change", requestRuleControlChange\)/, "slider rules wait for confirmation before changing");
assert.match(styles, /\.modal-backdrop/, "the rule change alert uses a modal backdrop");
assert.match(script, /function formMatchesCurrentRule\(form\)/, "lifeform compatibility is derived from its effective ruleset");
assert.match(
  script,
  /if \(formMatchesCurrentRule\(form\)\) \{[\s\S]*?createLoadedSettingsIndicator\(\)/,
  "selected lifeforms show loaded settings whenever their effective rules match",
);
assert.match(
  script,
  /loadedIndicator\.hidden = !formMatchesCurrentRule\(form\)/,
  "every matching lifeform card shows the loaded-settings indicator",
);
assert.doesNotMatch(script, /loadedConfigurationFormId/, "loaded-settings indicators do not depend on a single lifeform identity");
assert.match(
  script,
  /const configurationAlreadyLoaded = rulesMatch\(currentRule, nextRule\);[\s\S]*?if \(!configurationAlreadyLoaded\) showToast/,
  "applying rules already active on the field does not show a loaded-settings toast",
);
assert.match(
  script,
  /function configureBackend\(\)\s*\{\s*const model = currentModel\(\)/,
  "backend updates preserve the exact committed ruleset instead of rebuilding it from quantized sliders",
);
assert.doesNotMatch(script, /readRuleControls/, "saving and backend updates never replace exact rules with slider values");
assert.match(styles, /\.form-card > \.field-settings-indicator/, "loaded form cards show a settings indicator beside the favorite button");
assert.match(script, /repeatField/, "field repetition is configurable");
assert.match(script, /showFieldBoundary/, "the primary field boundary is configurable");
assert.doesNotMatch(script, /pointInsideWorld/, "brushes and lifeforms are usable on every repeated field tile");
assert.match(
  script,
  /placement\.x = world\.x - pointerState\.offsetX;[\s\S]*?placement\.y = world\.y - pointerState\.offsetY;/,
  "prepared lifeforms can be moved anywhere on the repeated canvas",
);
assert.match(
  script,
  /function paintAt\(world\)[\s\S]*?x: modulo\(Math\.floor\(world\.x\), worldWidth\)[\s\S]*?y: modulo\(Math\.floor\(world\.y\), worldHeight\)/,
  "brush input on repeated tiles maps back into the wrapped field",
);
assert.match(script, /DEFAULT_FIT_ZOOM\s*=\s*1\.25/, "the field starts zoomed in");
assert.match(script, /DEFAULT_RUNNING\s*=\s*true/, "the simulation starts playing");
assert.match(script, /async function boot\([\s\S]*?setRunning\(DEFAULT_RUNNING\)/, "boot applies the playing default");
for (const [key, action] of [
  ["b", 'setTool\\("brush"\\)'],
  ["e", 'setTool\\("erase"\\)'],
  ["l", 'setTool\\("form"\\)'],
  ["s", "queueSteps\\(1\\)"],
  ["c", "clearField\\(\\)"],
  ["r", "randomizeField\\(\\)"],
]) {
  assert.match(script, new RegExp(`event\\.key\\.toLowerCase\\(\\) === "${key}"\\) ${action}`), `${key.toUpperCase()} has its keyboard shortcut`);
}
assert.match(script, /event\.code === "Space"[\s\S]*?setRunning\(!isRunning\)/, "Spacebar toggles play and pause");
assert.doesNotMatch(script, /spacePressed/, "Spacebar is no longer reserved for panning");
assert.match(script, /if \(event\.repeat\) return/, "held shortcuts only fire once per key press");
for (const shortcut of ["Spacebar", "(S)", "(C)", "(R)", "Brush (B)", "Erase (E)", "Lifeform (L)"]) {
  assert.ok(html.includes(shortcut), `the UI advertises ${shortcut}`);
}
assert.match(script, /function saveMapFile/, "maps can be saved");
assert.match(script, /function loadMapFile/, "maps can be loaded");
assert.match(script, /DEFAULT_MAP_PATH\s*=\s*"assets\/maps\/default_0\.map"/, "default_0.map is the startup map");
assert.match(script, /async function boot\([\s\S]*?await loadDefaultMap\(\)/, "boot loads the default map");
assert.ok(fs.existsSync(defaultMapPath), "the startup map exists");
assert.match(script, /function saveImageFile/, "field images can be saved");
assert.match(script, /function loadImageFile/, "images can be loaded into the field");
assert.match(html, /src="src\/lenia-map-format\.js"/, "the shared map codec loads in the browser");
assert.match(script, /lastKnownSnapshot/, "backend fallback retains a durable field snapshot");
assert.match(script, /card\.draggable = true/, "lifeform cards are draggable");
assert.match(script, /event\.dataTransfer\.setData\(LIFEFORM_DRAG_TYPE, form\.id\)/, "dragged lifeforms carry their catalog identity");
assert.match(script, /canvas\.addEventListener\("dragover", handleLibraryDragOver\)/, "the field accepts dragged lifeforms");
assert.match(script, /canvas\.addEventListener\("drop", handleLibraryDrop\)/, "dropping a lifeform prepares it on the field");
assert.match(styles, /\.form-card[\s\S]*?cursor:\s*grab/, "lifeform cards use a grab cursor");
assert.match(html, /<h2 id="paletteHeading"[^>]*>Theme<\/h2>/, "palette settings are presented as a theme");
assert.match(script, /THEME_FONTS/, "themes support a persisted font family");
assert.match(styles, /scrollbar-color:\s*var\(--border\) var\(--control\)/, "scrollbars use the selected interface theme");
assert.match(styles, /input\[type="range"\]::(?:-webkit-slider-thumb|-moz-range-thumb)[\s\S]*?background:\s*var\(--accent\)/, "slider thumbs use the selected theme accent");
assert.match(styles, /accent-color:\s*var\(--accent\)/, "native controls use the selected theme accent");
assert.match(script, /style\.colorScheme\s*=\s*colorLuminance\(uiPalette\.background\)/, "native control contrast follows light and dark custom themes");
for (const icon of ["pause", "step", "clear", "random", "brush", "erase", "form", "place"]) {
  assert.match(html, new RegExp(`assets/ui/${icon}\\.png`), `uses the ${icon} UI icon`);
}
for (const icon of ["previous", "next", "volume", "go"]) {
  assert.match(html, new RegExp(`assets/ui/${icon}\\.png`), `uses the ${icon} music player icon`);
}
assert.match(html, /assets\/favicon\.png/, "uses the Orbium favicon");
assert.match(html, /id="musicVolumeSlider"[^>]*value="50"/, "album volume defaults to 50 percent");
assert.match(html, /href="https:\/\/speaces\.bandcamp\.com\/album\/el-orbe-unicolado"/, "music player links to the album");
assert.match(html, /target="_blank"/, "album link opens in a new tab");
assert.match(musicPlayer, /audio\.addEventListener\("ended"/, "the album advances when a song ends");
assert.match(musicPlayer, /await audio\.play\(\)/, "the album attempts to autoplay");
assert.match(musicPlayer, /tracks\.json/, "the album supports a static playlist manifest");
assert.ok(Array.isArray(albumManifest.tracks) && albumManifest.tracks.length > 0, "the album manifest lists tracks");
for (const track of albumManifest.tracks) {
  assert.match(track, /\.mp3$/i, `album manifest entry is an MP3: ${track}`);
  assert.ok(fs.existsSync(path.join(albumDirectory, track)), `album manifest track exists: ${track}`);
}
assert.match(musicPlayer, /loadTrack\(Math\.floor\(Math\.random\(\) \* tracks\.length\)\)/, "the album starts on a random song");
assert.match(musicPlayer, /MUSIC_PREFERENCES_KEY/, "music playback preferences are persisted");
assert.match(styles, /animation: music-marquee[^;]*linear infinite/, "song names continuously marquee from right to left");
assert.match(
  musicPlayer,
  /JSON\.stringify\(\{ playing: musicPreferences\.playing, volume: musicPreferences\.volume \}\)/,
  "only play state and volume are saved",
);
assert.match(script, /ui\.brushControls\.hidden = !brushActive/, "brush controls are hidden outside the brush tools");
assert.match(script, /ui\.toolFormSelection\.hidden = tool !== "form"/, "Form shows the selected lifeform details");
assert.match(
  script,
  /function drawPreparedPlacements\(\) \{\s*if \(currentTool !== "form"\)/,
  "prepared lifeforms are hidden on the canvas outside the Lifeform tool",
);
assert.match(
  script,
  /ui\.placementPanel\.hidden = !placementsVisible \|\| preparedPlacements\.length === 0/,
  "prepared lifeform UI is hidden outside the Lifeform tool",
);
assert.match(script, /new Option\(t\("library\.all"\), "all"\)/, "the catalog includes a localized All option");
assert.match(collections, /label:\s*"Strictly compatible"/, "the catalog declares Strictly compatible by reference");
assert.match(script, /new Option\(t\("library\.favorites"/, "the catalog includes localized Favorites");
assert.doesNotMatch(script, /new Option\("Legacy"/, "the Legacy collection was removed");
assert.match(script, /collection\.groups\.map\(\(group\) => group\.label\)/, "collection groups populate the Group filter");
assert.doesNotMatch(script, /buildPreviewCanvas|toDataURL/, "the browser never generates thumbnail images at runtime");
assert.match(script, /function fieldImageBlob[\s\S]*?createImageData/, "Save Image renders the field without reusing thumbnail generation");
assert.match(script, /function thumbnailCrop\(/, "placement previews crop generated thumbnail padding");
assert.match(script, /window\.location\.protocol === "file:"/, "file URLs show local-server guidance instead of starting a worker");

for (const property of ["border-radius", "box-shadow", "linear-gradient", "radial-gradient", "backdrop-filter", "transition:"]) {
  assert.ok(!styles.includes(property), `simple styling omits ${property}`);
}

assert.equal((collections.match(/label:\s*"Set \d+/g) || []).length, 7, "all seven strict compatibility sets are available");
assert.match(html, /src="src\/lenia-catalog\.js"/, "the shared catalog registry loads in the browser");
assert.match(html, /src="src\/lifeform-collections\.js"/, "reference-only collections load in the browser");
assert.match(html, /id="languageToggleBtn"/, "the header includes a language selector");
assert.match(html, /src="src\/i18n\.js"/, "the translation catalog loads before the app");

console.log("Project smoke checks passed.");
