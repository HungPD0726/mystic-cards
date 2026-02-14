import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { user: userData } = await api.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token invalid, clear it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    localStorage.setItem('token', response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const response = await api.register(email, username, password);
    localStorage.setItem('token', response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
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
