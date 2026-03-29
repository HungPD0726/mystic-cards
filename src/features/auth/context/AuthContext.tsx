import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api';
import type { User, Session } from '@supabase/supabase-js';
import { buildAuthRedirectUrl, mapAuthError, syncBackendAuthSession } from './authHelpers';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ emailConfirmationRequired: boolean }>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastSyncedAccessTokenRef = useRef<string | null>(null);

  const isAuthenticated = !!user && !!session;

  const syncBackendAuth = useCallback(async (activeSession: Session) => {
    await syncBackendAuthSession(activeSession, api, localStorage);
  }, []);

  const getRedirectTo = useCallback(
    () => buildAuthRedirectUrl(import.meta.env.BASE_URL, window.location.origin),
    [],
  );

  useEffect(() => {
    let isActive = true;

    const applySession = async (nextSession: Session | null, syncErrorLabel: string) => {
      if (!isActive) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      const nextAccessToken = nextSession?.access_token ?? null;

      if (!nextSession?.user) {
        lastSyncedAccessTokenRef.current = null;
        localStorage.removeItem('token');
        setIsLoading(false);
        return;
      }

      if (lastSyncedAccessTokenRef.current === nextAccessToken) {
        setIsLoading(false);
        return;
      }

      try {
        await syncBackendAuth(nextSession);
        lastSyncedAccessTokenRef.current = nextAccessToken;
      } catch (error) {
        console.error(syncErrorLabel, error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession, 'Failed to sync with backend:');
    });

    void supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      return applySession(initialSession, 'Initial backend sync failed:');
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [syncBackendAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(mapAuthError(error.message));
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: getRedirectTo() },
    });
    if (error) throw new Error(mapAuthError(error.message));

    return { emailConfirmationRequired: !data.session };
  }, [getRedirectTo]);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectTo(),
        scopes: 'email profile openid',
      },
    });
    if (error) throw new Error(mapAuthError(error.message));
  }, [getRedirectTo]);

  const loginWithGithub = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: getRedirectTo(),
        scopes: 'read:user user:email',
      },
    });
    if (error) throw new Error(mapAuthError(error.message));
  }, [getRedirectTo]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, isAuthenticated, login, register, loginWithGoogle, loginWithGithub, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
