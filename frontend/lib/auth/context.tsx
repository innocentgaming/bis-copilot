"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, PreferredLanguage } from "@/types/auth";
import { authApi } from "@/lib/api/auth";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isAuditor: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    preferredLanguage: PreferredLanguage
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem("bis_copilot_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const user = await authApi.getMe();
        setCurrentUser(user);
        localStorage.setItem("bis_copilot_user", JSON.stringify(user));
      } catch {
        // Token expired or invalid
        localStorage.removeItem("bis_copilot_token");
        localStorage.removeItem("bis_copilot_refresh_token");
        localStorage.removeItem("bis_copilot_user");
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const tokens = await authApi.login(email, password);
      localStorage.setItem("bis_copilot_token", tokens.access_token);
      localStorage.setItem("bis_copilot_refresh_token", tokens.refresh_token);

      const user = await authApi.getMe();
      setCurrentUser(user);
      localStorage.setItem("bis_copilot_user", JSON.stringify(user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    preferredLanguage: PreferredLanguage
  ) => {
    setIsLoading(true);
    try {
      await authApi.register({
        name,
        email,
        password,
        preferred_language: preferredLanguage,
      });
      // Auto-login after registration
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("bis_copilot_token");
    localStorage.removeItem("bis_copilot_refresh_token");
    localStorage.removeItem("bis_copilot_user");
    setCurrentUser(null);
  };

  const refreshUser = async () => {
    try {
      const user = await authApi.getMe();
      setCurrentUser(user);
      localStorage.setItem("bis_copilot_user", JSON.stringify(user));
    } catch {
      logout();
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    isAdmin: currentUser?.role === "admin",
    isAuditor: currentUser?.role === "auditor" || currentUser?.role === "admin",
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
