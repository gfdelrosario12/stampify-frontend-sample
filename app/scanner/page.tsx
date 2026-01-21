"use client"

import { useState, useEffect } from "react"
import { QRScannerInterface } from "@/components/qr-scanner-interface"
import { ScanHistoryTable } from "@/components/scan-history-table"
import { BarChart3, Clock, Users, TrendingUp, LogOut, Zap, QrCode, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type { User, Event } from "@/lib/types"

/* ------------------------- API BASE ------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

/* ------------------------- TYPES ------------------------- */
interface ScanRecord {
  id: string
  memberName: string
  memberId: string
  timestamp: Date
  eventId: string
  eventName: string
  status: "success" | "pending"
}

/* ------------------------- STAT CARD ------------------------- */
const StatCard = ({ icon, label, value, gradient }: { icon: React.ReactNode; label: string; value: string | number; gradient: string }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90 mb-1">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
        {icon}
      </div>
    </div>
  </div>
)

/* ------------------------- SCANNER PAGE ------------------------- */
export default function ScannerPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [showEventSelector, setShowEventSelector] = useState(false)

  /* Fetch all events for the scanner */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/events`)
        const data: Event[] = await res.json()
        setEvents(data)
        if (data.length > 0) setSelectedEventId(data[0].id)
      } catch (err) {
        console.error("Error fetching events:", err)
      }
    }
    fetchEvents()
  }, [])

  /* Fetch scan history whenever selected event changes */
  useEffect(() => {
    if (!selectedEventId) return

    const fetchScans = async () => {
      try {
        const res = await fetch(`${API_BASE}/scans?eventId=${selectedEventId}`)
        const data: ScanRecord[] = await res.json()
        setScans(data)
      } catch (err) {
        console.error("Error fetching scan history:", err)
      }
    }

    fetchScans()
  }, [selectedEventId])

  const currentEvent = events.find((e) => e.id === selectedEventId)

  /* Handle new scan from QR scanner */
  const handleScan = async (scanData: { memberId: string; memberName: string }) => {
    if (!currentEvent) return

    try {
      const payload = {
        ...scanData,
        eventId: currentEvent.id.toString(),
        eventName: currentEvent.eventName,
        timestamp: new Date(),
        status: "success",
      }

      const res = await fetch(`${API_BASE}/scans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const savedScan: ScanRecord = await res.json()
      setScans([savedScan, ...scans])
    } catch (err) {
      console.error("Error saving scan:", err)
    }
  }

  /* Logout */
  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/")
    }
  }

  /* Stats calculations */
  const todayScans = scans.filter((s) => new Date(s.timestamp).toDateString() === new Date().toDateString()).length
  const uniqueMembers = new Set(scans.map((s) => s.memberId)).size
  const scanRate = scans.length > 0 ? (scans.length / 5).toFixed(1) : "0" // placeholder
  const attendanceRate = Math.round((uniqueMembers / 50) * 100) // assuming 50 members per event

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* NAVBAR */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">
              STAMP<span className="text-pink-400">i</span>FY
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">Scanner</p>
              <p className="text-xs text-purple-300">Event Staff</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-white" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white flex items-center gap-3">
                <QrCode className="w-10 h-10 text-purple-400" />
                Event Check-in
              </h1>
              <p className="text-purple-200">Scan member QR codes to record attendance</p>
            </div>

            <div className="mt-4 md:mt-0">
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-2 backdrop-blur-sm">
                <p className="text-xs text-purple-300 mb-1">Current Event</p>
                <p className="text-sm font-semibold text-white">{currentEvent?.eventName || "Loading..."}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<BarChart3 className="w-6 h-6" />} label="Total Scans" value={scans.length} gradient="from-purple-600 to-purple-700" />
          <StatCard icon={<Clock className="w-6 h-6" />} label="Today's Scans" value={todayScans} gradient="from-pink-600 to-pink-700" />
          <StatCard icon={<Users className="w-6 h-6" />} label="Unique Members" value={uniqueMembers} gradient="from-purple-700 to-pink-600" />
          <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Scan Rate" value={`${scanRate}/min`} gradient="from-pink-700 to-purple-600" />
        </section>

        {/* Scanner + History */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 space-y-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-purple-400" />
                <h2 className="font-semibold text-white text-lg">QR Scanner</h2>
              </div>

              {/* QR Scanner Interface */}
              {currentEvent ? (
                <QRScannerInterface onScan={handleScan} currentEvent={{ id: currentEvent.id.toString(), name: currentEvent.eventName }} />
              ) : (
                <div className="text-center py-8 text-purple-300">
                  <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an event to start scanning</p>
                </div>
              )}

              {/* Event Selector */}
              <div className="pt-4 border-t border-purple-500/20">
                <button onClick={() => setShowEventSelector(!showEventSelector)} className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-white">
                  <span className="text-sm font-medium">Change Event</span>
                  <Calendar className="w-4 h-4" />
                </button>

                {showEventSelector && (
                  <div className="mt-2 p-2 bg-slate-900/50 rounded-lg border border-purple-500/20 space-y-1 max-h-64 overflow-y-auto">
                    {events.map(event => (
                      <button
                        key={event.id}
                        onClick={() => {
                          setSelectedEventId(event.id)
                          setShowEventSelector(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded transition-colors ${
                          selectedEventId === event.id ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : "hover:bg-purple-500/20 text-purple-200"
                        }`}
                      >
                        <p className="font-medium text-sm">{event.eventName}</p>
                        <p className="text-xs opacity-75">{event.scheduledAt}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scan History */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <h2 className="font-semibold text-white text-lg">Scan History</h2>
                </div>
                <span className="text-xs text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                  {scans.length} scans
                </span>
              </div>

              <ScanHistoryTable scans={scans} />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
