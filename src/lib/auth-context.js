'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '@/services/api';
import { oneFrom } from '@/lib/api-data';

const AuthContext = createContext({});

function getTokenFrom(response) {
  return response?.token ?? response?.accessToken ?? response?.jwt ?? response?.data?.token;
}

function getUserFrom(response) {
  const user = response?.user ?? response?.data?.user ?? response?.profile ?? response?.data?.profile;
  if (!user && response?.email) return response;
  return user ?? null;
}

function normalizeProfile(user) {
  if (!user) return null;
  const id = user.id ?? user._id;
  return {
    ...user,
    id,
    full_name: user.full_name ?? user.fullName ?? user.name ?? '',
    is_admin: Boolean(user.is_admin ?? user.isAdmin ?? user.role === 'admin'),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const response = await authAPI.getMe();
      const currentUser = normalizeProfile(getUserFrom(oneFrom(response, ['user', 'profile'])));
      setUser(currentUser);
      setProfile(currentUser);
    } catch (_error) {
      setUser(null);
      setProfile(null);
      if (typeof window !== 'undefined') localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      const response = await authAPI.register({ email, password, name: fullName, fullName });
      const token = getTokenFrom(response);
      if (token && typeof window !== 'undefined') localStorage.setItem('token', token);
      const currentUser = normalizeProfile(getUserFrom(response));
      setUser(currentUser);
      setProfile(currentUser);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const token = getTokenFrom(response);
      if (token && typeof window !== 'undefined') localStorage.setItem('token', token);
      const currentUser = normalizeProfile(getUserFrom(response));
      setUser(currentUser);
      setProfile(currentUser);
      return { data: response, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data || error };
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (_error) {
      // Local logout still clears app state if the server session is already gone.
    }
    if (typeof window !== 'undefined') localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
