"use client"

import type { Stamp } from "@/lib/types"
import { Calendar, MapPin } from "lucide-react"

interface PassportHistoryProps {
  stamps: Stamp[]
}

export function PassportHistory({ stamps }: PassportHistoryProps) {
  return (
    <div className="space-y-3">
      {stamps.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No stamps collected yet</p>
          <p className="text-xs mt-1">Attend events to start collecting</p>
        </div>
      ) : (
        stamps.map((stamp, index) => (
          <div
            key={stamp.id}
            className="relative border border-border rounded-lg p-4 hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* Timeline indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />

            <div className="ml-4 flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{stamp.eventName}</h4>
                <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(stamp.eventDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    {stamp.location}
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="inline-flex items-center justify-center w-8 h-8 bg-accent/20 rounded-full">
                  <span className="text-accent font-bold">✓</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(stamp.scannedAt).toLocaleDateString("en-US", { month: "short" })}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
