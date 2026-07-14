"use strict";

(() => {
  const { t } = window.LeniaI18n;
  const ALBUM_DIRECTORY = "assets/music/speaces/el-orbe-unicolado/";
  const ALBUM_MANIFEST = `${ALBUM_DIRECTORY}tracks.json`;
  const PLAY_ICON = "assets/ui/play.png";
  const PAUSE_ICON = "assets/ui/pause.png";
  const MUSIC_PREFERENCES_KEY = "leniaToyLab.musicPlayer.v1";
  const DEFAULT_MUSIC_PREFERENCES = Object.freeze({ playing: true, volume: 0.5 });

  const audio = document.querySelector("#albumAudio");
  const panel = document.querySelector(".music-panel");
  const marquee = document.querySelector("#musicTrackMarquee");
  const trackName = document.querySelector("#musicTrackName");
  const previousButton = document.querySelector("#musicPreviousBtn");
  const playButton = document.querySelector("#musicPlayBtn");
  const playIcon = document.querySelector("#musicPlayIcon");
  const nextButton = document.querySelector("#musicNextBtn");
  const volumeControl = document.querySelector(".music-volume");
  const volumeButton = document.querySelector("#musicVolumeBtn");
  const volumePopover = document.querySelector("#musicVolumePopover");
  const volumeSlider = document.querySelector("#musicVolumeSlider");

  if (
    !audio ||
    !panel ||
    !marquee ||
    !trackName ||
    !previousButton ||
    !playButton ||
    !playIcon ||
    !nextButton ||
    !volumeControl ||
    !volumeButton ||
    !volumePopover ||
    !volumeSlider
  ) return;

  let tracks = [];
  let currentTrackIndex = 0;
  let autoplayWasBlocked = false;
  let localizedTrackLabelKey = "music.loading";
  let musicPreferences = loadMusicPreferences();

  volumeSlider.value = String(Math.round(musicPreferences.volume * 100));
  audio.volume = musicPreferences.volume;

  function loadMusicPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(MUSIC_PREFERENCES_KEY));
      return {
        playing: typeof saved?.playing === "boolean" ? saved.playing : DEFAULT_MUSIC_PREFERENCES.playing,
        volume: Number.isFinite(saved?.volume)
          ? Math.max(0, Math.min(1, saved.volume))
          : DEFAULT_MUSIC_PREFERENCES.volume,
      };
    } catch {
      return { ...DEFAULT_MUSIC_PREFERENCES };
    }
  }

  function saveMusicPreferences() {
    try {
      localStorage.setItem(
        MUSIC_PREFERENCES_KEY,
        JSON.stringify({ playing: musicPreferences.playing, volume: musicPreferences.volume }),
      );
    } catch {
      // Playback still works when storage is unavailable.
    }
  }

  function filenameFromUrl(url) {
    const encodedName = new URL(url, document.baseURI).pathname.split("/").pop() || t("music.unknownTrack");
    try {
      return decodeURIComponent(encodedName);
    } catch {
      return encodedName;
    }
  }

  function normalizeTrackUrl(value, base = ALBUM_DIRECTORY) {
    const file = typeof value === "string" ? value : value?.file;
    if (!file || !/\.mp3(?:$|[?#])/i.test(file)) return null;
    return new URL(file, new URL(base, document.baseURI)).href;
  }

  function uniqueTracks(urls) {
    return [...new Set(urls.filter(Boolean))];
  }

  function uniqueSortedTracks(urls) {
    return uniqueTracks(urls).sort((left, right) =>
      filenameFromUrl(left).localeCompare(filenameFromUrl(right), undefined, { numeric: true, sensitivity: "base" }),
    );
  }

  async function tracksFromManifest() {
    const response = await fetch(ALBUM_MANIFEST, { cache: "no-store" });
    if (!response.ok) return [];
    const manifest = await response.json();
    const entries = Array.isArray(manifest) ? manifest : manifest?.tracks;
    if (!Array.isArray(entries)) return [];
    return uniqueTracks(entries.map((entry) => normalizeTrackUrl(entry)));
  }

  async function tracksFromDirectoryListing() {
    const response = await fetch(ALBUM_DIRECTORY, { cache: "no-store" });
    if (!response.ok) return [];
    const listing = new DOMParser().parseFromString(await response.text(), "text/html");
    return uniqueSortedTracks(
      [...listing.querySelectorAll("a[href]")].map((link) => normalizeTrackUrl(link.getAttribute("href"), response.url)),
    );
  }

  async function discoverTracks() {
    try {
      const manifestTracks = await tracksFromManifest();
      if (manifestTracks.length) return manifestTracks;
    } catch {
      // A manifest is optional; local directory discovery is the fallback.
    }

    try {
      return await tracksFromDirectoryListing();
    } catch {
      return [];
    }
  }

  function updateMarquee() {
    marquee.classList.remove("scrolling");
    requestAnimationFrame(() => {
      const startDistance = marquee.clientWidth;
      const endDistance = trackName.scrollWidth;
      const durationSeconds = Math.max(8, (startDistance + endDistance) / 22);
      marquee.style.setProperty("--marquee-start", `${startDistance}px`);
      marquee.style.setProperty("--marquee-end", `${endDistance}px`);
      marquee.style.setProperty("--marquee-duration", `${durationSeconds}s`);
      marquee.classList.add("scrolling");
    });
  }

  function setTrackLabel(label, translationKey = null) {
    localizedTrackLabelKey = translationKey;
    trackName.textContent = label;
    marquee.title = label;
    updateMarquee();
  }

  function syncPlayButton() {
    const playing = !audio.paused && !audio.ended;
    playIcon.src = playing ? PAUSE_ICON : PLAY_ICON;
    const label = t(playing ? "music.pause" : "music.play");
    playButton.setAttribute("aria-label", label);
    playButton.title = label;
  }

  function loadTrack(index) {
    if (!tracks.length) return;
    currentTrackIndex = (index + tracks.length) % tracks.length;
    const url = tracks[currentTrackIndex];
    audio.src = url;
    setTrackLabel(filenameFromUrl(url));
  }

  async function playCurrentTrack() {
    if (!tracks.length) return false;
    try {
      await audio.play();
      autoplayWasBlocked = false;
      return true;
    } catch (error) {
      if (error?.name === "NotAllowedError") autoplayWasBlocked = true;
      syncPlayButton();
      return false;
    }
  }

  async function changeTrack(offset) {
    const shouldKeepPlaying = musicPreferences.playing;
    loadTrack(currentTrackIndex + offset);
    if (shouldKeepPlaying) await playCurrentTrack();
  }

  function enableControls() {
    previousButton.disabled = false;
    playButton.disabled = false;
    nextButton.disabled = false;
  }

  previousButton.addEventListener("click", () => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    void changeTrack(-1);
  });

  playButton.addEventListener("click", () => {
    if (audio.paused) {
      musicPreferences.playing = true;
      saveMusicPreferences();
      void playCurrentTrack();
    } else {
      musicPreferences.playing = false;
      autoplayWasBlocked = false;
      saveMusicPreferences();
      audio.pause();
    }
  });

  nextButton.addEventListener("click", () => void changeTrack(1));
  volumeButton.addEventListener("click", () => {
    const willOpen = volumePopover.hidden;
    volumePopover.hidden = !willOpen;
    volumeButton.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) volumeSlider.focus();
  });
  volumeSlider.addEventListener("input", () => {
    audio.volume = Number(volumeSlider.value) / 100;
    musicPreferences.volume = audio.volume;
    saveMusicPreferences();
  });
  document.addEventListener("pointerdown", (event) => {
    if (volumePopover.hidden || event.target instanceof Node && volumeControl.contains(event.target)) return;
    volumePopover.hidden = true;
    volumeButton.setAttribute("aria-expanded", "false");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || volumePopover.hidden) return;
    volumePopover.hidden = true;
    volumeButton.setAttribute("aria-expanded", "false");
    volumeButton.focus();
  });
  audio.addEventListener("play", syncPlayButton);
  audio.addEventListener("pause", syncPlayButton);
  audio.addEventListener("ended", () => void changeTrack(1));
  window.addEventListener("resize", updateMarquee);
  window.addEventListener("lenia:languagechange", () => {
    if (localizedTrackLabelKey) setTrackLabel(t(localizedTrackLabelKey), localizedTrackLabelKey);
    syncPlayButton();
  });

  // Browsers may reject audible autoplay. In that case, the first interaction
  // elsewhere on the page is used to start the already-selected random track.
  function resumeAfterInteraction(event) {
    if (!autoplayWasBlocked || event.target instanceof Element && event.target.closest(".music-panel")) return;
    void playCurrentTrack();
  }
  document.addEventListener("pointerdown", resumeAfterInteraction, { capture: true });
  document.addEventListener("keydown", resumeAfterInteraction, { capture: true });

  void discoverTracks().then(async (discoveredTracks) => {
    tracks = discoveredTracks;
    if (!tracks.length) {
      setTrackLabel(t("music.loadError"), "music.loadError");
      return;
    }
    enableControls();
    loadTrack(Math.floor(Math.random() * tracks.length));
    if (musicPreferences.playing) await playCurrentTrack();
  });
})();
