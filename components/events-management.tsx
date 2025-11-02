"use client"

import { useState } from "react"
import type { Event, OrgType } from "@/lib/types"
import { Trash2, Edit2, Plus, Calendar } from "lucide-react"
import { AddEventModal } from "./event-add-modal"

interface EventsManagementProps {
  events: Event[]
  onAddEvent?: (event: Event) => void
  onEditEvent?: (event: Event) => void
  onDeleteEvent?: (eventId: string) => void
}

export function EventsManagement({ events, onAddEvent, onEditEvent, onDeleteEvent }: EventsManagementProps) {
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("all")
  const [showAddModal, setShowAddModal] = useState(false)

  const now = new Date()

  const filteredEvents = events.filter((e) => {
    const eventDate = new Date(e.date)
    if (filterStatus === "upcoming") return eventDate >= now
    if (filterStatus === "past") return eventDate < now
    return true
  })

  const handleAddEvent = (data: { name: string; date: string; location: string; description: string }) => {
    if (!onAddEvent) return
    const newEvent: Event = {
      id: crypto.randomUUID(),
      name: data.name,
      date: data.date,
      location: data.location,
      organizationId: "org-1" as unknown as OrgType,
      description: data.description,
    }
    onAddEvent(newEvent)
  }

  return (
    <>
      {/* ✅ Add Event Modal */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddEvent}
      />

      <div className="bg-slate-800/50 rounded-xl border border-purple-500/20 backdrop-blur-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-white">Events Management</h3>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {(["all", "upcoming", "past"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-purple-500/10 text-purple-200 hover:bg-purple-500/20"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        <div className="divide-y divide-purple-500/10">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-purple-300">No events found</div>
          ) : (
            filteredEvents.map((event) => {
              const eventDate = new Date(event.date)
              const isUpcoming = eventDate >= new Date()

              return (
                <div
                  key={event.id}
                  className="p-4 flex items-center justify-between bg-slate-900/40 hover:bg-purple-500/10 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{event.name}</p>

                    <div className="flex items-center gap-4 mt-1 text-sm text-purple-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-400" />
                        {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <span className="opacity-80">{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isUpcoming ? "bg-purple-600/20 text-purple-300" : "bg-pink-600/20 text-pink-300"
                      }`}
                    >
                      {isUpcoming ? "Upcoming" : "Past"}
                    </span>

                    <button
                      onClick={() => onEditEvent?.(event)}
                      className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteEvent?.(event.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
