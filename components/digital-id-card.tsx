"use client"

import { QRCodeDisplay } from "./qr-code-display"
import type { User, Passport } from "@/lib/types"

interface DigitalIDCardProps {
  user: User
  passport: Passport
  flipped?: boolean
}

export function DigitalIDCard({ user, passport, flipped = false }: DigitalIDCardProps) {
  return (
    <div className="perspective">
      <div
        className={`relative w-full max-w-sm mx-auto aspect-video rounded-xl overflow-hidden shadow-lg transition-transform duration-300 ${
          flipped ? "scale-x-[-1]" : ""
        }`}
        style={{
          background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)`,
        }}
      >
        {!flipped ? (
          // Front of card
          <div className="h-full p-6 text-primary-foreground flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold opacity-90">DIGITAL PASSPORT</p>
              <h2 className="text-2xl font-bold mt-4 text-balance">{user.name}</h2>
              <p className="text-sm opacity-75 mt-1">{user.email}</p>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-75">Member Since</p>
                <p className="font-semibold">2024</p>
              </div>
              <span className="text-2xl">{user.avatar || "👤"}</span>
            </div>
          </div>
        ) : (
          // Back of card
          <div className="h-full p-6 text-primary-foreground flex flex-col items-center justify-center">
            <div className="mb-4">
              <p className="text-xs font-semibold opacity-90 text-center mb-3">QR Code</p>
              <QRCodeDisplay value={`member-${user.id}`} size={120} />
            </div>
            <div className="w-full mt-4">
              <p className="text-xs opacity-75 text-center">Stamps Collected</p>
              <p className="text-3xl font-bold text-center">{passport.stamps.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
