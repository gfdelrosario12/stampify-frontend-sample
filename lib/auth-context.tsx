"use client"

import { createContext, useContext, useState, useEffect } from "react"

type User = {
  organization: any
  name: any
  id: any
  email: string
  role: "member" | "scanner" | "admin"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string): Promise<boolean> => {
    const lower = email.toLowerCase()

    // ✅ MOCK LOGIN WITH DEMO CREDENTIALS
    if (
      password === "password123" &&
      (lower === "member@stampify.com" ||
        lower === "scanner@stampify.com" ||
        lower === "admin@stampify.com")
    ) {
      let role: User["role"] = "member"

      if (lower === "scanner@stampify.com") role = "scanner"
      if (lower === "admin@stampify.com") role = "admin"

      const newUser: User = { email: lower, role, organization: null, name: null, id: null }
      setUser(newUser)

      // ✅ store in localStorage to persist login
      localStorage.setItem("stampify-user", JSON.stringify(newUser))

      return true
    }

    throw new Error("Invalid credentials")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("stampify-user")
  }

  // ✅ Load user on refresh
  useEffect(() => {
    const stored = localStorage.getItem("stampify-user")
    if (stored) setUser(JSON.parse(stored))
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
