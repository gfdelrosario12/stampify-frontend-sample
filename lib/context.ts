"use client"

import { createContext, useContext } from "react"
import type { User } from "./types"

interface StampifyContextType {
  user: User | null
  organization: string
  setUser: (user: User) => void
  setOrganization: (org: string) => void
}

export const StampifyContext = createContext<StampifyContextType | null>(null)

export function useStampify() {
  const context = useContext(StampifyContext)
  if (!context) {
    throw new Error("useStampify must be used within StampifyProvider")
  }
  return context
}
