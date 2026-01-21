"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ---------------- TYPES ----------------
export type Role = "ADMIN" | "MEMBER" | "SCANNER";

export interface Org {
  id: number;
  name: string;
  logo?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  organizationId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------- CONTEXT ----------------
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const AuthContext = createContext<AuthContextType | null>(null);

// ---------------- PROVIDER ----------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // LOGIN
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        credentials: "include", // Important: sends and receives cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        return { success: false, error: "Invalid credentials" };
      }

      const userData: User = await res.json();
      setUser(userData);

      // Route based on role
      const roleRoutes: Record<Role, string> = {
        ADMIN: "/admin",
        MEMBER: "/member",
        SCANNER: "/scanner",
      };

      const route = roleRoutes[userData.role] || "/";
      router.push(route);

      return { success: true, user: userData };
    } catch (err) {
      console.error("Login failed", err);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      // Call backend logout endpoint to clear HTTP-only cookie
      const res = await fetch(`${API_BASE}/users/logout`, {
        method: "POST",
        credentials: "include", // Important: sends cookie to be cleared
      });

      if (!res.ok) {
        console.warn("Logout endpoint failed, but clearing local state");
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      // Always clear local state and redirect, even if backend call fails
      setUser(null);
      
      // Clear any local storage (if applicable)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        sessionStorage.clear();
      }
      
      router.push("/");
    }
  };

  // REFRESH USER (from cookie)
  const refreshUser = async () => {
    try {
      // Log cookies for debugging
      console.log("🍪 All cookies:", document.cookie);
      
      const res = await fetch(`${API_BASE}/users/me`, {
        credentials: "include", // Sends cookie
      });

      if (res.ok) {
        const userData: User = await res.json();
        console.log("✅ User authenticated from cookie:", userData);
        setUser(userData);
        
        // Route to appropriate page based on role
        const currentPath = window.location.pathname;
        const roleRoutes: Record<Role, string> = {
          ADMIN: "/admin",
          MEMBER: "/member",
          SCANNER: "/scanner",
        };
        
        const targetRoute = roleRoutes[userData.role];
        
        // Only redirect if we're on the home page or login page
        if (currentPath === "/" && targetRoute) {
          console.log(`🔀 Redirecting ${userData.role} to ${targetRoute}`);
          router.push(targetRoute);
        }
      } else {
        console.log("❌ No valid session cookie found");
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to refresh user", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
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