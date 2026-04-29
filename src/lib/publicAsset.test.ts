import { afterEach, describe, expect, it } from 'vitest';
import { publicAsset } from './publicAsset';

const originalBaseUrl = import.meta.env.BASE_URL;

function setBaseUrl(value: string) {
  Object.defineProperty(import.meta.env, 'BASE_URL', {
    configurable: true,
    value,
  });
}

afterEach(() => {
  setBaseUrl(originalBaseUrl);
});

describe('publicAsset', () => {
  it('joins BASE_URL without trailing slash with asset path', () => {
    setBaseUrl('/mystic');

    expect(publicAsset('/audio/chon-the.mp3')).toBe('/mystic/audio/chon-the.mp3');
  });

  it('keeps root paths stable when BASE_URL already has trailing slash', () => {
    setBaseUrl('/');

    expect(publicAsset('favicon.ico')).toBe('/favicon.ico');
  });

  it('returns BASE_URL itself when asset path is empty', () => {
    setBaseUrl('/mystic');

    expect(publicAsset('')).toBe('/mystic/');
  });
});
