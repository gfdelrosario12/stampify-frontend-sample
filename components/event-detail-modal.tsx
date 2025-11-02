"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Stamp } from "@/lib/types"
import { Calendar, MapPin, Clock } from "lucide-react"

interface EventDetailModalProps {
  stamp: Stamp | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetailModal({ stamp, open, onOpenChange }: EventDetailModalProps) {
  if (!stamp) return null

  const eventDate = new Date(stamp.eventDate)
  const scannedDate = new Date(stamp.scannedAt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{stamp.eventName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Event Date</p>
              <p className="font-semibold">
                {eventDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold">{stamp.location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Scanned</p>
              <p className="font-semibold">
                {scannedDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Stamp ID</p>
            <p className="font-mono text-sm bg-muted p-2 rounded">{stamp.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
