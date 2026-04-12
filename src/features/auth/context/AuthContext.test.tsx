import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const {
  getSessionMock,
  onAuthStateChangeMock,
  unsubscribeMock,
  signInWithPasswordMock,
  signUpMock,
  signInWithOAuthMock,
  signOutMock,
  buildAuthRedirectUrlMock,
  mapAuthErrorMock,
  syncBackendAuthSessionMock,
} = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  onAuthStateChangeMock: vi.fn(),
  unsubscribeMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  signUpMock: vi.fn(),
  signInWithOAuthMock: vi.fn(),
  signOutMock: vi.fn(),
  buildAuthRedirectUrlMock: vi.fn(),
  mapAuthErrorMock: vi.fn(),
  syncBackendAuthSessionMock: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: onAuthStateChangeMock,
      signInWithPassword: signInWithPasswordMock,
      signUp: signUpMock,
      signInWithOAuth: signInWithOAuthMock,
      signOut: signOutMock,
    },
  },
}));

vi.mock('@/features/auth/context/authHelpers', () => ({
  buildAuthRedirectUrl: buildAuthRedirectUrlMock,
  mapAuthError: mapAuthErrorMock,
  syncBackendAuthSession: syncBackendAuthSessionMock,
}));

function AuthProbe() {
  const { isLoading } = useAuth();
  return <div>{isLoading ? 'loading' : 'ready'}</div>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: unsubscribeMock,
        },
      },
    });
    signInWithPasswordMock.mockResolvedValue({ error: null });
    signUpMock.mockResolvedValue({ data: { session: null }, error: null });
    signInWithOAuthMock.mockResolvedValue({ error: null });
    signOutMock.mockResolvedValue(undefined);
    buildAuthRedirectUrlMock.mockReturnValue('http://localhost:8080/');
    mapAuthErrorMock.mockImplementation((message: string) => message);
    syncBackendAuthSessionMock.mockResolvedValue('google-sync');
  });

  it('renders children and finishes loading when restoring the Supabase session fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getSessionMock.mockRejectedValue(new Error('offline'));

    const { unmount } = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ready')).toBeInTheDocument();
    });

    expect(warnSpy).toHaveBeenCalledWith('Failed to restore Supabase session:', expect.any(Error));

    unmount();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});
