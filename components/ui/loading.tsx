"use client"

import { createPortal } from "react-dom"

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
  if (typeof window === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[150]">
      <div className="bg-slate-800 rounded-xl p-8 border border-purple-500/30 shadow-2xl flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Message */}
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>,
    document.body
  )
}

// Simple inline spinner for buttons
export function Spinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  }

  return (
    <div className={`${sizes[size]} border-white border-t-transparent rounded-full animate-spin`}></div>
  )
}