"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { Plus, Edit, Trash2, Calendar, X, Upload, Image as ImageIcon, Award, MapPin, Tag } from "lucide-react"
import type { Event } from "@/lib/types"

interface EventsManagementProps {
  events: Event[]
  org: { id: number; name: string }
  onAddEvent: (event: Event) => Promise<void>
  onEditEvent: (event: Event) => Promise<void>
  onDeleteEvent: (eventId: number) => Promise<void>
}

// Generic file upload function
async function uploadFile(file: File, endpoint: string): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Upload error response:', errorText)
      throw new Error(`Upload failed: ${response.status} - ${errorText || response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export function EventsManagement({ events, org, onAddEvent, onEditEvent, onDeleteEvent }: EventsManagementProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventName, setEventName] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [eventType, setEventType] = useState("")
  const [venueName, setVenueName] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  
  // File upload states
  const [badgeFile, setBadgeFile] = useState<File | null>(null)
  const [badgePreview, setBadgePreview] = useState<string>("")
  const [venueFile, setVenueFile] = useState<File | null>(null)
  const [venuePreview, setVenuePreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  // Event type options
  const eventTypeOptions = [
    "Conference",
    "Workshop",
    "Seminar",
    "Meetup",
    "Webinar",
    "Training",
    "Social Event",
    "Competition",
    "Other"
  ]

  const handleOpenAdd = () => {
    setEditingEvent(null)
    setEventName("")
    setEventDescription("")
    setEventType("")
    setVenueName("")
    setScheduledAt("")
    setBadgeFile(null)
    setBadgePreview("")
    setVenueFile(null)
    setVenuePreview("")
    setShowModal(true)
  }

  const handleOpenEdit = (event: Event) => {
    setEditingEvent(event)
    setEventName(event.eventName)
    setEventDescription(event.eventDescription || "")
    setEventType(event.eventType || "")
    setVenueName(event.venueName || "")
    setScheduledAt(event.scheduledAt || "")
    setBadgePreview(event.eventBadge || "")
    setVenuePreview(event.venueImageUrl || "")
    setBadgeFile(null)
    setVenueFile(null)
    setShowModal(true)
  }

  const handleBadgeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBadgeFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBadgePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVenueFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVenueFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setVenuePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!eventName.trim()) {
      alert("Event name is required")
      return
    }

    setUploading(true)
    
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
      
      // Upload files to S3 if new files are selected
      let eventBadgeUrl = editingEvent?.eventBadge || ""
      let venueImageUrl = editingEvent?.venueImageUrl || ""

      // Upload event badge first if selected
      if (badgeFile) {
        const badgeData = await uploadFile(badgeFile, `${API_BASE}/upload/event-badge`)
        eventBadgeUrl = badgeData.eventBadgeUrl
      }

      // Upload venue image if selected
      if (venueFile) {
        const venueData = await uploadFile(venueFile, `${API_BASE}/upload/venue-image`)
        venueImageUrl = venueData.venueImageUrl
      }

      const eventData: Event = {
        id: editingEvent?.id || 0,
        organization: org,
        eventName: eventName.trim(),
        eventDescription: eventDescription.trim(),
        eventType: eventType.trim(),
        eventBadge: eventBadgeUrl,
        venueName: venueName.trim(),
        venueImageUrl: venueImageUrl,
        scheduledAt: scheduledAt || undefined,
      }

      if (editingEvent) {
        await onEditEvent(eventData)
      } else {
        await onAddEvent(eventData)
      }

      setShowModal(false)
    } catch (error) {
      console.error('Error submitting event:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Events Management</h2>
          <p className="text-purple-300 text-sm">Manage your organization events</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg flex items-center gap-2 text-white transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="bg-slate-700/50 rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all">
            {/* Event Image */}
            {event.venueImageUrl && (
              <div className="h-40 bg-slate-800 relative overflow-hidden">
                <img 
                  src={event.venueImageUrl} 
                  alt={event.eventName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4 space-y-3">
              {/* Event Name & Badge */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-white flex-1">{event.eventName}</h3>
                {event.eventBadge && (
                  <img 
                    src={event.eventBadge} 
                    alt="Badge" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
              </div>

              {/* Event Type */}
              {event.eventType && (
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <Tag className="w-4 h-4" />
                  <span>{event.eventType}</span>
                </div>
              )}

              {/* Venue */}
              {event.venueName && (
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <MapPin className="w-4 h-4" />
                  <span>{event.venueName}</span>
                </div>
              )}

              {/* Schedule */}
              {event.scheduledAt && (
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.scheduledAt).toLocaleString()}</span>
                </div>
              )}

              {/* Description */}
              {event.eventDescription && (
                <p className="text-sm text-gray-400 line-clamp-2">{event.eventDescription}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-purple-500/20">
                <button
                  onClick={() => handleOpenEdit(event)}
                  className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete event "${event.eventName}"?`)) {
                      onDeleteEvent(event.id)
                    }
                  }}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-purple-300">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No events yet. Create your first event!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-[100] overflow-y-auto">
          <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="bg-slate-800 rounded-xl w-full max-w-3xl my-8 border border-purple-500/30 shadow-2xl">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-purple-500/20 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-xl">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {editingEvent ? "Edit Event" : "Add New Event"}
                </h3>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {/* Event Name */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Event Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Enter event name"
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  />
                </div>

                {/* Event Type - Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  >
                    <option value="">Select event type</option>
                    {eventTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Description</label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Enter event description"
                    rows={3}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm sm:text-base"
                  />
                </div>

                {/* Two Column Layout for Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Venue Name */}
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">Venue Name</label>
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="Enter venue name"
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    />
                  </div>

                  {/* Scheduled Date/Time */}
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">Scheduled Date & Time</label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Image Uploads - Two Column on Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Badge Upload */}
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Event Badge
                    </label>
                    <div className="space-y-2">
                      {badgePreview && (
                        <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-purple-500/20">
                          <img src={badgePreview} alt="Badge preview" className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border-2 border-purple-500" />
                          <button
                            type="button"
                            onClick={() => {
                              setBadgeFile(null)
                              setBadgePreview("")
                            }}
                            className="text-red-400 hover:text-red-300 text-sm transition-colors flex-1 text-left"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <label className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white hover:bg-slate-600 cursor-pointer flex items-center justify-center gap-2 transition-colors text-sm sm:text-base">
                        <Upload className="w-4 h-4" />
                        {badgePreview ? "Change Badge" : "Upload Badge"}
                        <input type="file" accept="image/*" onChange={handleBadgeFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Venue Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Venue Image
                    </label>
                    <div className="space-y-2">
                      {venuePreview && (
                        <div className="space-y-2 p-3 bg-slate-700/50 rounded-lg border border-purple-500/20">
                          <img src={venuePreview} alt="Venue preview" className="w-full h-32 sm:h-40 rounded-lg object-cover border-2 border-purple-500" />
                          <button
                            type="button"
                            onClick={() => {
                              setVenueFile(null)
                              setVenuePreview("")
                            }}
                            className="text-red-400 hover:text-red-300 text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <label className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-700 border border-purple-500/30 rounded-lg text-white hover:bg-slate-600 cursor-pointer flex items-center justify-center gap-2 transition-colors text-sm sm:text-base">
                        <Upload className="w-4 h-4" />
                        {venuePreview ? "Change Venue" : "Upload Venue"}
                        <input type="file" accept="image/*" onChange={handleVenueFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-purple-500/20 flex flex-col sm:flex-row gap-3 bg-slate-900 rounded-b-xl">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={uploading}
                  className="w-full sm:flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full sm:flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Uploading...
                    </>
                  ) : (
                    editingEvent ? "Update Event" : "Create Event"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
