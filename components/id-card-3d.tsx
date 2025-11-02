"use client"

import type React from "react"

import { useState } from "react"
import { StampBadge } from "./stamp-badge"
import type { User, Passport } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface IDCard3DProps {
  user: User
  passport: Passport
  onStampClick: (stampIndex: number) => void
}

export function IDCard3D({ user, passport, onStampClick }: IDCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientY - rect.top - rect.height / 2) / 20
    const y = (rect.width / 2 - (e.clientX - rect.left)) / 20
    setRotation({ x, y })
  }

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 })
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="relative w-full aspect-video perspective transition-all duration-300 ease-out"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {/* Front Side */}
        <div
          className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${
            isFlipped ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            className="w-full h-full p-8 text-white flex flex-col justify-between relative"
            style={{
              background: `linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(99, 102, 241) 50%, rgb(139, 92, 246) 100%)`,
            }}
          >
            {/* Top section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold opacity-90 tracking-widest">STAMPIFY DIGITAL ID</p>
                  <p className="text-xs opacity-75 mt-1">Member Passport</p>
                </div>
                <div className="text-4xl">{user.avatar || "👤"}</div>
              </div>
            </div>

            {/* Middle section */}
            <div className="space-y-3">
              <div>
                <p className="text-xs opacity-75 font-semibold tracking-wider">FULL NAME</p>
                <h2 className="text-3xl font-bold">{user.name}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs opacity-75 font-semibold tracking-wider">MEMBER ID</p>
                  <p className="font-mono text-sm font-semibold">{user.id.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75 font-semibold tracking-wider">STAMPS</p>
                  <p className="font-semibold text-2xl">{passport.stamps.length}</p>
                </div>
              </div>
            </div>

            {/* Bottom section */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs opacity-75">MEMBER SINCE</p>
                <p className="text-lg font-semibold">JAN 2024</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75 text-right">VALID UNTIL</p>
                <p className="text-lg font-semibold">DEC 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Side - Passport with Stamps */}
        <div
          className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${
            !isFlipped ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-card to-background border-2 border-primary/20 p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground">EVENT STAMPS</h3>
              <p className="text-xs text-muted-foreground">Click stamps to view details</p>
            </div>

            {/* Stamps Grid */}
            <div className="flex-1 grid grid-cols-3 gap-3 overflow-y-auto">
              {passport.stamps.length > 0 ? (
                passport.stamps.map((stamp, index) => (
                  <button
                    key={stamp.id}
                    onClick={() => onStampClick(index)}
                    className="group cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  >
                    <StampBadge stamp={stamp} />
                  </button>
                ))
              ) : (
                <div className="col-span-3 flex items-center justify-center text-muted-foreground text-sm">
                  No stamps yet. Attend events to earn stamps!
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground text-center">
              <p>Total Stamps: {passport.stamps.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Flip Controls */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setIsFlipped(false)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            !isFlipped ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Front
        </button>

        <div className="flex-1 h-px bg-border mx-4" />

        <button
          onClick={() => setIsFlipped(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isFlipped ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Stamps
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hint */}
      <div className="text-center mt-4 text-xs text-muted-foreground">
        💡 Move your mouse over the card for a 3D effect
      </div>
    </div>
  )
}
