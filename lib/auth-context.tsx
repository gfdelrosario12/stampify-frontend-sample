"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ---------------- TYPES ----------------
export type Role = "member" | "scanner" | "admin";

export interface Org {
  id: number;
  name: string;
  logo?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  name: string; // convenience full name
  email: string;
  role: Role;
  organization: Org;
  avatar?: string;
}

// ---------------- CONTEXT ----------------
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const AuthContext = createContext<AuthContextType | null>(null);

// ---------------- PROVIDER ----------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // LOGIN
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(
        `${API_BASE}/users/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser(res.data);
      return true;
    } catch (err) {
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

  // REFRESH
  const refreshUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/me`, { withCredentials: true });
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------- HOOK ----------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
