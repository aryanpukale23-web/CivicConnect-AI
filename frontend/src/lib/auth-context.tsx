"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, getAuthToken, removeAuthToken, setAuthToken } from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "citizen" | "admin";
  area: string;
  preferred_language: "en" | "hi" | "mr";
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch<User>("/auth/me")
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        removeAuthToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (token: string, userData: User) => {
    setAuthToken(token);
    setUser(userData);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    window.location.href = "/";
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
