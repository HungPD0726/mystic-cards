import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { api } from '@/lib/api';
import type { User, Session } from '@supabase/supabase-js';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!session;

  const mapAuthError = (message: string) => {
    const msg = message.toLowerCase();

    if (msg.includes('invalid login credentials')) {
      return 'Email hoac mat khau khong dung.';
    }

    if (msg.includes('email not confirmed')) {
      return 'Tai khoan chua xac nhan email. Vui long kiem tra hop thu.';
    }

    if (msg.includes('user already registered')) {
      return 'Email nay da dang ky.';
    }

    if (msg.includes('password should be at least')) {
      return 'Mat khau phai co it nhat 6 ky tu.';
    }

    if (msg.includes('google oauth backend is not configured')) {
      return 'Backend chua cau hinh GOOGLE_CLIENT_ID.';
    }

    if (msg.includes('google token audience mismatch')) {
      return 'Sai cau hinh Google OAuth client. Kiem tra lai Client ID.';
    }

    if (msg.includes('provider is not enabled')) {
      return 'Provider chua duoc bat trong Supabase.';
    }

    return message;
  };

  const syncBackendAuth = useCallback(async (activeSession: Session) => {
    const provider = activeSession.user?.app_metadata?.provider;
    const username =
      activeSession.user.user_metadata?.full_name || activeSession.user.user_metadata?.user_name;

    if (provider === 'google' && activeSession.provider_token) {
      const loginResult = await api.googleLogin({
        accessToken: activeSession.provider_token,
        username,
      });
      localStorage.setItem('token', loginResult.token);
      return;
    }

    if (!activeSession.user.email) {
      throw new Error('Tai khoan OAuth khong co email. Vui long cap quyen email trong provider.');
    }

    // Backward-compatible sync for non-Google sessions or missing provider token.
    const syncResult = await api.googleSync({
      email: activeSession.user.email!,
      supabaseId: activeSession.user.id,
      username,
    });
    localStorage.setItem('token', syncResult.token);
  }, []);

  useEffect(() => {
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          await syncBackendAuth(session);
        } catch (err) {
          console.error('Failed to sync with backend:', err);
        }
      } else {
        localStorage.removeItem('token');
      }

      setIsLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          await syncBackendAuth(session);
        } catch (err) {
          console.error('Initial backend sync failed:', err);
        }
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [syncBackendAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(mapAuthError(error.message));
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const redirectTo = new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw new Error(mapAuthError(error.message));

    return { emailConfirmationRequired: !data.session };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const redirectTo = new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) throw new Error(mapAuthError(error.message));
  }, []);

  const loginWithGithub = useCallback(async () => {
    const redirectTo = new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo,
        scopes: 'read:user user:email',
      },
    });
    if (error) throw new Error(mapAuthError(error.message));
  }, []);

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
