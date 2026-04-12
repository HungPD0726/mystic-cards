import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function loadAudioManagerModule() {
  vi.resetModules();
  return import('./useAudioManager');
}

describe('useAudioManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('does not log the cached snapshot warning on mount', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { useAudioManager } = await loadAudioManagerModule();

    renderHook(() => useAudioManager());

    const errorOutput = errorSpy.mock.calls.flat().map(String).join(' ');
    expect(errorOutput).not.toContain('The result of getSnapshot should be cached');
  });

  it('swallows blocked playback errors and keeps playback stopped', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(new DOMException('Blocked', 'NotAllowedError'));
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});

    const { useAudioManager } = await loadAudioManagerModule();
    const { result } = renderHook(() => useAudioManager());

    await act(async () => {
      await expect(result.current.play()).resolves.toBeUndefined();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith('Background audio playback was blocked.', expect.any(DOMException));
  });
});
