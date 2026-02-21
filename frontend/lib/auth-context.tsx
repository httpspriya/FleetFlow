'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authApi } from './api';

type AuthContextType = {
  isAuthenticated: boolean;
  user: { id: string; email: string; role: string } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setUser: (u: { id: string; email: string; role: string } | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_DISPLAY: Record<string, string> = {
  MANAGER: 'Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  ANALYST: 'Financial Analyst',
  ADMIN: 'Admin',
  VIEWER: 'Viewer',
  DRIVER: 'Driver',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const register = useCallback(async (email: string, password: string, role: string) => {
    const roleMap: Record<string, string> = {
      Manager: 'MANAGER',
      Dispatcher: 'DISPATCHER',
      'Safety Officer': 'SAFETY_OFFICER',
      'Financial Analyst': 'ANALYST',
      Admin: 'ADMIN',
      Viewer: 'VIEWER',
      Driver: 'DRIVER',
    };
    const backendRole = roleMap[role] || role.toUpperCase().replace(/\s+/g, '_');
    const res = await authApi.register({ email, password, role: backendRole });
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    const me = await authApi.me();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    login,
    register,
    logout,
    setUser,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#8B5E52' }}>
        Loading…
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function roleDisplay(role: string): string {
  return ROLE_DISPLAY[role] || role;
}
