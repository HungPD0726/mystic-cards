import { useSyncExternalStore } from 'react';
import { publicAsset } from '@/lib/publicAsset';

type SfxType = 'shuffle' | 'draw' | 'flip';

interface AudioSettings {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
}

interface AudioSnapshot extends AudioSettings {
  isReady: boolean;
}

interface AudioStore extends AudioSnapshot {
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void;
  toggleMute: () => void;
  setVolume: (value: number) => void;
  playSfx: (type: SfxType) => void;
}

const STORAGE_KEY = 'mystic_music';
const BACKGROUND_TRACK = publicAsset('audio/mfcc-mystery-mystic-mystical-music-279834.mp3');
const SFX_TRACKS: Record<SfxType, string> = {
  shuffle: publicAsset('audio/chia_bai.mp3'),
  draw: publicAsset('audio/chon-the.mp3'),
  flip: publicAsset('audio/lat_bai.mp3'),
};

const listeners = new Set<() => void>();
const DEFAULT_VOLUME = 0.45;

const audioState: AudioSnapshot = {
  isPlaying: false,
  isMuted: false,
  volume: DEFAULT_VOLUME,
  isReady: false,
};
let currentSnapshot: AudioSnapshot = { ...audioState };
let hasHydratedSettings = false;

let backgroundAudio: HTMLAudioElement | null = null;
const sfxCache: Partial<Record<SfxType, HTMLAudioElement>> = {};
let fadeFrame: number | null = null;

function clampVolume(value: number) {
  return Math.max(0, Math.min(1, value));
}

function emit() {
  listeners.forEach((listener) => listener());
}

function snapshotsEqual(first: AudioSnapshot, second: AudioSnapshot) {
  return (
    first.isPlaying === second.isPlaying &&
    first.isMuted === second.isMuted &&
    first.volume === second.volume &&
    first.isReady === second.isReady
  );
}

function syncSnapshot() {
  const nextSnapshot: AudioSnapshot = {
    isPlaying: audioState.isPlaying,
    isMuted: audioState.isMuted,
    volume: audioState.volume,
    isReady: audioState.isReady,
  };

  if (snapshotsEqual(currentSnapshot, nextSnapshot)) {
    return false;
  }

  currentSnapshot = nextSnapshot;
  return true;
}

function updateAudioState(updater: (state: AudioSnapshot) => void, options?: { persist?: boolean; emit?: boolean }) {
  updater(audioState);

  const changed = syncSnapshot();
  if (options?.persist) {
    persistSettings();
  }

  if (changed && options?.emit !== false) {
    emit();
  }

  return changed;
}

function persistSettings() {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: AudioSettings = {
    isPlaying: currentSnapshot.isPlaying,
    isMuted: currentSnapshot.isMuted,
    volume: currentSnapshot.volume,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures so audio controls still work in restricted contexts.
  }
}

function hydrateSettingsOnce() {
  if (typeof window === 'undefined' || hasHydratedSettings) {
    return;
  }

  hasHydratedSettings = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      audioState.isReady = true;
      syncSnapshot();
      return;
    }

    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    audioState.isMuted = parsed.isMuted === true;
    audioState.volume = typeof parsed.volume === 'number' ? clampVolume(parsed.volume) : DEFAULT_VOLUME;
    audioState.isPlaying = parsed.isPlaying === true;
  } catch {
    audioState.isMuted = false;
    audioState.volume = DEFAULT_VOLUME;
    audioState.isPlaying = false;
  } finally {
    audioState.isReady = true;
    syncSnapshot();
  }
}

function ensureBackgroundAudio() {
  if (typeof window === 'undefined') {
    return null;
  }

  hydrateSettingsOnce();

  if (backgroundAudio) {
    return backgroundAudio;
  }

  backgroundAudio = new Audio(BACKGROUND_TRACK);
  backgroundAudio.loop = true;
  backgroundAudio.preload = 'auto';
  backgroundAudio.volume = currentSnapshot.isMuted ? 0 : currentSnapshot.volume;
  backgroundAudio.addEventListener('ended', () => {
    updateAudioState((state) => {
      state.isPlaying = false;
    }, { persist: true });
  });
  return backgroundAudio;
}

function cancelFadeFrame() {
  if (fadeFrame !== null && typeof window !== 'undefined') {
    window.cancelAnimationFrame(fadeFrame);
    fadeFrame = null;
  }
}

function fadeTo(targetVolume: number, duration: number, onComplete?: () => void) {
  const audio = ensureBackgroundAudio();
  if (!audio || typeof window === 'undefined') {
    onComplete?.();
    return;
  }

  cancelFadeFrame();
  const startVolume = audio.volume;
  const startTime = window.performance.now();

  const step = (time: number) => {
    const progress = Math.min((time - startTime) / duration, 1);
    audio.volume = startVolume + (targetVolume - startVolume) * progress;

    if (progress >= 1) {
      fadeFrame = null;
      onComplete?.();
      return;
    }

    fadeFrame = window.requestAnimationFrame(step);
  };

  fadeFrame = window.requestAnimationFrame(step);
}

async function play() {
  const audio = ensureBackgroundAudio();
  if (!audio) {
    return;
  }

  cancelFadeFrame();
  audio.volume = 0;

  try {
    await audio.play();
    updateAudioState((state) => {
      state.isPlaying = true;
    }, { persist: true });
    fadeTo(currentSnapshot.isMuted ? 0 : currentSnapshot.volume, 1200);
  } catch (error) {
    audio.volume = currentSnapshot.isMuted ? 0 : currentSnapshot.volume;
    updateAudioState((state) => {
      state.isPlaying = false;
    }, { persist: true });
    console.warn('Background audio playback was blocked.', error);
  }
}

function pause() {
  const audio = ensureBackgroundAudio();
  if (!audio || !currentSnapshot.isPlaying) {
    return;
  }

  fadeTo(0, 800, () => {
    audio.pause();
    audio.volume = currentSnapshot.isMuted ? 0 : currentSnapshot.volume;
    updateAudioState((state) => {
      state.isPlaying = false;
    }, { persist: true });
  });
}

function toggle() {
  if (currentSnapshot.isPlaying) {
    pause();
    return;
  }

  void play();
}

function toggleMute() {
  const audio = ensureBackgroundAudio();
  const nextMuted = !currentSnapshot.isMuted;

  if (audio) {
    audio.volume = nextMuted ? 0 : currentSnapshot.volume;
  }

  updateAudioState((state) => {
    state.isMuted = nextMuted;
  }, { persist: true });
}

function setVolume(value: number) {
  const nextVolume = clampVolume(value);
  const audio = ensureBackgroundAudio();

  if (audio && !currentSnapshot.isMuted) {
    audio.volume = nextVolume;
  }

  updateAudioState((state) => {
    state.volume = nextVolume;
  }, { persist: true });
}

function ensureSfx(type: SfxType) {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!sfxCache[type]) {
    const audio = new Audio(SFX_TRACKS[type]);
    audio.preload = 'auto';
    sfxCache[type] = audio;
  }

  return sfxCache[type] ?? null;
}

function playSfx(type: SfxType) {
  if (currentSnapshot.isMuted) {
    return;
  }

  const audio = ensureSfx(type);
  if (!audio) {
    return;
  }

  audio.currentTime = 0;
  audio.volume = Math.min(1, currentSnapshot.volume * 0.95 + 0.05);
  void audio.play().catch(() => undefined);
}

function subscribe(listener: () => void) {
  hydrateSettingsOnce();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentSnapshot;
}

const store: AudioStore = {
  get isPlaying() {
    return currentSnapshot.isPlaying;
  },
  get isMuted() {
    return currentSnapshot.isMuted;
  },
  get volume() {
    return currentSnapshot.volume;
  },
  get isReady() {
    return currentSnapshot.isReady;
  },
  play,
  pause,
  toggle,
  toggleMute,
  setVolume,
  playSfx,
};

hydrateSettingsOnce();

export function useAudioManager(): AudioStore {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...store,
    ...state,
  };
}
