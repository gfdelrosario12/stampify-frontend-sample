"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

type User = {
  id: number;
  email: string;
  role: "member" | "scanner" | "admin";
  name: string | null;
  organization: any;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // LOGIN
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(
        `${API_BASE}/users/login`,
        { email, password },
        { withCredentials: true } // Send cookies
      );
      const userData: User = res.data;
      setUser(userData);
      return true;
    } catch (err: any) {
      console.error("Login failed", err);
      return false;
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/users/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.warn("Logout failed", err);
    } finally {
      setUser(null);
    }
  };

  // REFRESH USER INFO (calls /users/me)
  const refreshUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/me`, { withCredentials: true });
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };

  // LOAD USER ON REFRESH
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
