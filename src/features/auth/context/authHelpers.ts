import type { Session } from '@supabase/supabase-js';

type BackendAuthResult = {
  token: string;
};

type AuthSyncApi = {
  googleLogin: (data: { accessToken: string; username?: string }) => Promise<BackendAuthResult>;
  googleSync: (data: { email: string; supabaseId: string; username?: string }) => Promise<BackendAuthResult>;
};

type TokenStorage = Pick<Storage, 'setItem'>;

const GOOGLE_SYNC_FALLBACK_MESSAGES = [
  'google oauth backend is not configured',
  'google token audience mismatch',
  'invalid google access token',
  'unable to fetch google user info',
  'google account missing email',
  'google email is not verified',
];

const AUTH_ERROR_MESSAGES: Array<[string, string]> = [
  ['invalid login credentials', 'Email hoac mat khau khong dung.'],
  ['email not confirmed', 'Tai khoan chua xac nhan email. Vui long kiem tra hop thu.'],
  ['user already registered', 'Email nay da dang ky.'],
  ['password should be at least', 'Mat khau phai co it nhat 6 ky tu.'],
  ['google oauth backend is not configured', 'Backend chua cau hinh GOOGLE_CLIENT_ID.'],
  ['google token audience mismatch', 'Sai cau hinh Google OAuth client. Kiem tra lai Client ID.'],
  ['provider is not enabled', 'Provider chua duoc bat trong Supabase.'],
];

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function getSessionUsername(activeSession: Session): string | undefined {
  return activeSession.user.user_metadata?.full_name || activeSession.user.user_metadata?.user_name;
}

function canFallbackToGoogleSync(error: unknown): boolean {
  const message = extractErrorMessage(error).toLowerCase();

  return GOOGLE_SYNC_FALLBACK_MESSAGES.some((fallbackMessage) => message.includes(fallbackMessage));
}

export function mapAuthError(message: string): string {
  const normalizedMessage = message.toLowerCase();

  return (
    AUTH_ERROR_MESSAGES.find(([sourceMessage]) => normalizedMessage.includes(sourceMessage))?.[1] ??
    message
  );
}

export function buildAuthRedirectUrl(baseUrl: string | undefined, origin: string): string {
  return new URL(baseUrl || '/', origin).toString();
}

export async function syncBackendAuthSession(
  activeSession: Session,
  authApi: AuthSyncApi,
  storage: TokenStorage,
): Promise<'google-login' | 'google-sync'> {
  const username = getSessionUsername(activeSession);
  const email = activeSession.user.email;

  if (!email) {
    throw new Error('Tai khoan OAuth khong co email. Vui long cap quyen email trong provider.');
  }

  if (activeSession.user?.app_metadata?.provider === 'google' && activeSession.provider_token) {
    try {
      const loginResult = await authApi.googleLogin({
        accessToken: activeSession.provider_token,
        username,
      });
      storage.setItem('token', loginResult.token);
      return 'google-login';
    } catch (error) {
      if (!canFallbackToGoogleSync(error)) {
        throw error;
      }
    }
  }

  const syncResult = await authApi.googleSync({
    email,
    supabaseId: activeSession.user.id,
    username,
  });
  storage.setItem('token', syncResult.token);
  return 'google-sync';
}
