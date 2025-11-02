"use client"

import { useState } from "react"
import { QRScannerInterface } from "@/components/qr-scanner-interface"
import { ScanHistoryTable } from "@/components/scan-history-table"
import { mockEvents } from "@/lib/mock-data"
import { BarChart3, Clock, Users, TrendingUp, LogOut, Zap, QrCode, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface ScanRecord {
  id: string
  memberName: string
  memberId: string
  timestamp: Date
  eventName: string
  status: "success" | "pending"
}

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

export default function ScannerPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [selectedEventId, setSelectedEventId] = useState(mockEvents[0].id)
  const [showEventSelector, setShowEventSelector] = useState(false)

  const currentEvent = mockEvents.find((e) => e.id === selectedEventId) || mockEvents[0]

  const handleScan = (scanData: ScanRecord) => {
    setScans([scanData, ...scans])
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const todayScans = scans.filter((s) => s.timestamp.toDateString() === new Date().toDateString()).length
  const uniqueMembers = new Set(scans.map((s) => s.memberId)).size
  const scanRate = scans.length > 0 ? (scans.length / 5).toFixed(1) : "0"
  const attendanceRate = Math.round((uniqueMembers / 50) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* NAVBAR */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-white"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
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
              <p className="text-purple-200">
                Scan member QR codes to record attendance
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-4 py-2 backdrop-blur-sm">
                <p className="text-xs text-purple-300 mb-1">Current Event</p>
                <p className="text-sm font-semibold text-white">{currentEvent.name}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Total Scans"
            value={scans.length}
            gradient="from-purple-600 to-purple-700"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Today's Scans"
            value={todayScans}
            gradient="from-pink-600 to-pink-700"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Unique Members"
            value={uniqueMembers}
            gradient="from-purple-700 to-pink-600"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Scan Rate"
            value={`${scanRate}/min`}
            gradient="from-pink-700 to-purple-600"
          />
        </section>

        {/* Scanner + History */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scanner Interface */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 space-y-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-purple-400" />
                <h2 className="font-semibold text-white text-lg">QR Scanner</h2>
              </div>
              <QRScannerInterface onScan={handleScan} currentEvent={currentEvent} />
              
              {/* Event Selector */}
              <div className="pt-4 border-t border-purple-500/20">
                <button
                  onClick={() => setShowEventSelector(!showEventSelector)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-white"
                >
                  <span className="text-sm font-medium">Change Event</span>
                  <Calendar className="w-4 h-4" />
                </button>

                {showEventSelector && (
                  <div className="mt-2 p-2 bg-slate-900/50 rounded-lg border border-purple-500/20 space-y-1">
                    {mockEvents.map(event => (
                      <button
                        key={event.id}
                        onClick={() => {
                          setSelectedEventId(event.id)
                          setShowEventSelector(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded transition-colors ${
                          selectedEventId === event.id
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "hover:bg-purple-500/20 text-purple-200"
                        }`}
                      >
                        <p className="font-medium text-sm">{event.name}</p>
                        <p className="text-xs opacity-75">{event.date}</p>
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

        {/* Activity Summary */}
        {scans.length > 0 && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <h2 className="font-semibold mb-6 text-white text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Activity Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Scan Rate */}
              <div className="flex items-center gap-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-300">Average Scan Rate</p>
                  <p className="text-2xl font-bold text-white">{scanRate} <span className="text-sm text-purple-300">scans/min</span></p>
                </div>
              </div>

              {/* Attendance Rate */}
              <div className="flex items-center gap-4 p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                <div className="p-3 bg-gradient-to-br from-pink-600 to-pink-700 rounded-lg shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-300">Attendance Rate</p>
                  <p className="text-2xl font-bold text-white">{attendanceRate}<span className="text-sm text-purple-300">%</span></p>
                </div>
              </div>

              {/* Success Rate */}
              <div className="flex items-center gap-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="p-3 bg-gradient-to-br from-purple-700 to-pink-600 rounded-lg shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-300">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {scans.length > 0 ? Math.round((scans.filter(s => s.status === 'success').length / scans.length) * 100) : 0}
                    <span className="text-sm text-purple-300">%</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {scans.length === 0 && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-12 backdrop-blur-sm text-center">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Scan</h3>
            <p className="text-purple-300">Start scanning QR codes to record member attendance</p>
          </section>
        )}
      </main>
    </div>
  )
}