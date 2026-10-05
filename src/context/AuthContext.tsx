import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types/index.js';
import { api } from '../services/api.js';
import { supabase } from '../lib/supabase.js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<{ needsEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        setToken(session.access_token);
        try {
          const { user: u } = await api.getMe();
          if (!mounted) return;
          setUser(u);
          if (u.profile) setProfile(u.profile);
          else {
            const p = await api.getProfile().catch(() => null);
            if (mounted && p) setProfile(p);
          }
        } catch {
          await supabase.auth.signOut();
          if (mounted) {
            setUser(null);
            setProfile(null);
            setToken(null);
          }
        }
      }
      if (mounted) setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setToken(null);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setToken(session.access_token);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          try {
            const { user: u } = await api.getMe();
            if (!mounted) return;
            setUser(u);
            if (u.profile) setProfile(u.profile);
          } catch {
            // ignore transient errors
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.login(email, pass);
      setToken(response.token);
      setUser(response.user);
      if (response.user.profile) {
        setProfile(response.user.profile);
      } else {
        const p = await api.getProfile().catch(() => null);
        if (p) setProfile(p);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await api.register(data);
      if (response.needsEmailConfirmation) {
        return { needsEmailConfirmation: true };
      }
      setToken(response.token);
      setUser(response.user);
      if (response.user.profile) setProfile(response.user.profile);
      return {};
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const p = await api.getProfile();
      setProfile(p);
      if (user) setUser({ ...user, profile: p });
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const updated = await api.updateProfile(updates);
    setProfile(updated);
    if (user) setUser({ ...user, name: updated.name, profile: updated });
    return updated;
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    profile,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN',
    isLoading,
    error,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
