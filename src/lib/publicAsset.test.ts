import { describe, expect, it } from 'vitest';
import { publicAsset } from './publicAsset';

describe('publicAsset', () => {
  it('joins BASE_URL without trailing slash with asset path', () => {
    const previousBaseUrl = import.meta.env.BASE_URL;
    Object.defineProperty(import.meta.env, 'BASE_URL', {
      configurable: true,
      value: '/mystic',
    });

    expect(publicAsset('/audio/chon-the.mp3')).toBe('/mystic/audio/chon-the.mp3');

    Object.defineProperty(import.meta.env, 'BASE_URL', {
      configurable: true,
      value: previousBaseUrl,
    });
  });

  it('keeps root paths stable when BASE_URL already has trailing slash', () => {
    const previousBaseUrl = import.meta.env.BASE_URL;
    Object.defineProperty(import.meta.env, 'BASE_URL', {
      configurable: true,
      value: '/',
    });

    expect(publicAsset('favicon.ico')).toBe('/favicon.ico');

    Object.defineProperty(import.meta.env, 'BASE_URL', {
      configurable: true,
      value: previousBaseUrl,
    });
  });
});
