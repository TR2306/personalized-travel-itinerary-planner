import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('roamai_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      // 1. If Supabase is configured, check active session
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setToken(session.access_token);
            localStorage.setItem('roamai_token', session.access_token);
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
              travel_preferences: session.user.user_metadata?.travel_preferences || {},
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase session check error:', err);
        }
      }

      // 2. Fallback to API /me token check
      const savedToken = localStorage.getItem('roamai_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
        } catch (err) {
          console.warn('Token validation failed, clearing session:', err);
          localStorage.removeItem('roamai_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    // Supabase auth first if active
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          const access_token = data.session.access_token;
          localStorage.setItem('roamai_token', access_token);
          setToken(access_token);
          const userData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
            travel_preferences: data.user.user_metadata?.travel_preferences || {},
          };
          setUser(userData);
          return userData;
        }
      } catch (sbErr) {
        console.warn('Supabase login error, falling back to API:', sbErr);
      }
    }

    // Backend login
    const res = await authApi.login({ email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('roamai_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
      } catch (sbErr) {
        console.warn('Supabase sign-up notice:', sbErr);
      }
    }

    const res = await authApi.register({ name, email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('roamai_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const quickDemoLogin = async () => {
    try {
      const res = await authApi.login({
        email: 'wanderer@roamai.com',
        password: 'password123',
      });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('roamai_token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch {
      // If demo user does not exist yet, register it
      const res = await authApi.register({
        name: 'Alex Mercer',
        email: 'wanderer@roamai.com',
        password: 'password123',
      });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('roamai_token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    localStorage.removeItem('roamai_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const res = await authApi.updateProfile(updates);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        quickDemoLogin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
