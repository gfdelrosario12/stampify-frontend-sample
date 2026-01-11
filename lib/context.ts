"use client";

import { createContext, useContext } from "react";
import type { User, Org } from "./types";

interface StampifyContextType {
  user: User | null;
  organization: Org | null;
  setUser: (user: User | null) => void;
  setOrganization: (org: Org | null) => void;
}

export const StampifyContext = createContext<StampifyContextType | null>(null);

export function useStampify() {
  const context = useContext(StampifyContext);
  if (!context) {
    throw new Error("useStampify must be used within a StampifyProvider");
  }
  return context;
}
