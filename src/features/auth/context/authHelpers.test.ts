import { describe, expect, it, vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import { buildAuthRedirectUrl, mapAuthError, syncBackendAuthSession } from './authHelpers';

function createSession(overrides?: Partial<Session>): Session {
  return {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
    expires_at: 9999999999,
    token_type: 'bearer',
    provider_token: 'google-provider-token',
    user: {
      id: 'supabase-user-id',
      app_metadata: { provider: 'google' },
      user_metadata: { full_name: 'Mystic User' },
      aud: 'authenticated',
      created_at: '2026-03-26T00:00:00.000Z',
      email: 'mystic@example.com',
    },
    ...overrides,
  } as Session;
}

describe('authHelpers', () => {
  it('builds an auth redirect URL from the current origin and base path', () => {
    expect(buildAuthRedirectUrl('/mystic-cards/', 'https://hungpd0726.github.io')).toBe(
      'https://hungpd0726.github.io/mystic-cards/',
    );
  });

  it('maps provider configuration errors to friendly auth messages', () => {
    expect(mapAuthError('Provider is not enabled')).toBe('Provider chua duoc bat trong Supabase.');
  });

  it('falls back to googleSync when backend googleLogin verification fails', async () => {
    const storage = {
      setItem: vi.fn(),
    };

    const authApi = {
      googleLogin: vi.fn().mockRejectedValue(new Error('Google token audience mismatch')),
      googleSync: vi.fn().mockResolvedValue({
        token: 'backend-token',
        user: {},
      }),
    };

    const result = await syncBackendAuthSession(createSession(), authApi, storage);

    expect(authApi.googleLogin).toHaveBeenCalledWith({
      accessToken: 'google-provider-token',
      username: 'Mystic User',
    });
    expect(authApi.googleSync).toHaveBeenCalledWith({
      email: 'mystic@example.com',
      supabaseId: 'supabase-user-id',
      username: 'Mystic User',
    });
    expect(storage.setItem).toHaveBeenCalledWith('token', 'backend-token');
    expect(result).toBe('google-sync');
  });
});
