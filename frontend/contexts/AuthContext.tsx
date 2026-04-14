"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setGlobalAccessToken } from '@/lib/api/axios';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  leetcodeUsername: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLoginCode: (code: string, codeVerifier: string, redirectUri: string) => Promise<void>;
  logout: () => Promise<void>;
  updateLeetcodeUsername: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Attach token to requests
  // Response interceptor for token refresh
  useEffect(() => {

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        const isAuthRoute = prevRequest?.url?.includes('/auth/');
        if (error?.response?.status === 401 && !prevRequest?.sent && !isAuthRoute) {
          prevRequest.sent = true;
          try {
            const { data } = await api.post('/auth/refresh');
            const newAccessToken = data.accessToken;
            setAccessToken(newAccessToken);
            setGlobalAccessToken(newAccessToken);
            if (data.user) setUser(data.user);
            prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(prevRequest);
          } catch (refreshError) {
            setUser(null);
            setAccessToken(null);
            setGlobalAccessToken(null);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initial load: Attempt to silent-refresh relying on HTTP-only cookie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        setGlobalAccessToken(data.accessToken);
        if (data.user) setUser(data.user);
      } catch (error) {
        console.log("No active session found.");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setGlobalAccessToken(data.accessToken);
    setUser(data.user);
    router.push('/');
  };

  const signup = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    setAccessToken(data.accessToken);
    setGlobalAccessToken(data.accessToken);
    setUser(data.user);
    router.push('/');
  };

  const googleLoginCode = async (code: string, codeVerifier: string, redirectUri: string) => {
    const { data } = await api.post('/auth/google', { code, codeVerifier, redirectUri });
    setAccessToken(data.accessToken);
    setGlobalAccessToken(data.accessToken);
    setUser(data.user);
    router.push('/');
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
    setGlobalAccessToken(null);
    setUser(null);
    router.push('/auth');
  };

  // Called after successful LeetCode verification to update local state
  const updateLeetcodeUsername = (username: string) => {
    setUser(prev => prev ? { ...prev, leetcodeUsername: username } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleLoginCode, logout, updateLeetcodeUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
