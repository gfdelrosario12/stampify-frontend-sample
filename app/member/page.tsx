"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Zap, QrCode, Award, Check, Calendar, Star, TrendingUp, LogOut } from "lucide-react"
import type { User, Stamp as StampType } from "@/lib/types"

/* ------------------------- API BASE ------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000" // <-- set in .env

/* ------------------------- TYPES ------------------------- */

interface EventData {
  id: number
  eventName: string
  scheduledAt?: string
}

interface DigitalIDCardProps {
  user: User
  stamps: StampType[]
  events: EventData[]
  flipped: boolean
  onFlip: () => void
}

/* ------------------------- DIGITAL ID CARD ------------------------- */

const DigitalIDCard: React.FC<DigitalIDCardProps> = ({ user, stamps, events, flipped, onFlip }) => {
  return (
    <div className="perspective-1000 w-full max-w-md mx-auto">
      <div
        className={`relative transition-all duration-500 transform-style-3d cursor-pointer ${flipped ? "rotate-y-180" : ""}`}
        onClick={onFlip}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div className={`bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-2xl shadow-2xl p-8 ${flipped ? "hidden" : "block"}`}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-white font-bold text-lg">STAMP<span className="text-pink-200">i</span>FY</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-xs font-semibold">{user.role.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-lg ring-4 ring-white/30">
              {user.avatar || user.name.charAt(0)}
            </div>
            <div className="text-white flex-1">
              <h3 className="text-2xl font-bold mb-1">{user.name}</h3>
              <p className="text-purple-100 text-sm">{user.email}</p>
              <p className="text-purple-200 text-xs mt-2 font-mono bg-white/10 px-2 py-1 rounded inline-block">{user.id}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 flex items-center justify-center shadow-inner">
            <QrCode className="w-32 h-32 text-purple-600" />
          </div>

          <p className="text-center mt-4 text-purple-100 text-sm font-medium">Tap to view your stamps →</p>
        </div>

        {/* BACK */}
        <div 
          className={`bg-gradient-to-br from-purple-700 via-pink-600 to-purple-800 rounded-2xl shadow-2xl p-8 ${flipped ? "block" : "hidden"}`}
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-xl font-bold flex items-center gap-2">
              <Award className="w-5 h-5" />
              Event Stamps
            </h3>
            <span className="bg-white text-purple-700 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {stamps.length}/{events.length}
            </span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {events.map(event => {
              const stamp = stamps.find(s => s.event.id === event.id)
              return (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg transition-all ${
                    stamp
                      ? "bg-green-500/30 border-2 border-green-400 shadow-lg shadow-green-500/20"
                      : "bg-white/10 border-2 border-white/20 backdrop-blur-sm"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="text-white">
                      <p className="font-semibold text-sm">{event.eventName}</p>
                      <p className="text-xs text-purple-100">{event.scheduledAt}</p>
                    </div>
                    {stamp ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-white/40" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-center mt-4 text-purple-100 text-sm font-medium">← Tap to return</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------- STATS CARD ------------------------- */

const StatsCard: React.FC<{
  icon: React.ReactNode
  title: string
  value: string | number
  subtitle?: string
  gradient: string
}> = ({ icon, title, value, subtitle, gradient }) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg`}>
      <div className="flex items-start justify-between mb-4">{icon}</div>
      <h3 className="text-3xl font-bold mb-1">{value}</h3>
      <p className="text-sm opacity-90">{title}</p>
      {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
    </div>
  )
}

/* ------------------------- MEMBER DASHBOARD ------------------------- */

export default function MemberDashboard() {
  const router = useRouter()
  const { user: authUser, logout } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [stamps, setStamps] = useState<StampType[]>([])
  const [events, setEvents] = useState<EventData[]>([])
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (!authUser) return

    const fetchData = async () => {
      try {
        // Fetch user info
        const userRes = await fetch(`${API_BASE}/users/${authUser.id}`)
        const userData: User = await userRes.json()
        setUser(userData)

        // Fetch stamps
        const stampsRes = await fetch(`${API_BASE}/stamps?userId=${authUser.id}`)
        const stampsData: StampType[] = await stampsRes.json()
        setStamps(stampsData)

        // Fetch events
        const eventsRes = await fetch(`${API_BASE}/events?organizationId=${userData.organization.id}`)
        const eventsData: EventData[] = await eventsRes.json()
        setEvents(eventsData)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      }
    }

    fetchData()
  }, [authUser])

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>

  const completionRate = Math.round((stamps.length / events.length) * 100)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

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
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-purple-300">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-white" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2 text-white">
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{user.name.split(" ")[0]}</span>!
          </h2>
          <p className="text-purple-200">Your digital membership passport</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatsCard
            icon={<Award className="w-6 h-6" />}
            title="Total Stamps"
            value={stamps.length}
            subtitle={`out of ${events.length} events`}
            gradient="from-purple-600 to-purple-700"
          />
          <StatsCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Completion Rate"
            value={`${completionRate}%`}
            subtitle="Keep collecting!"
            gradient="from-pink-600 to-pink-700"
          />
          <StatsCard
            icon={<Star className="w-6 h-6" />}
            title="Member Status"
            value="Active"
            subtitle="Member since 2024"
            gradient="from-purple-700 to-pink-600"
          />
        </div>

        {/* Digital ID Card */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-center text-white">Your Digital ID</h3>
          <DigitalIDCard user={user} stamps={stamps} events={events} flipped={flipped} onFlip={() => setFlipped(!flipped)} />
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-purple-400" />
            Recent Activity
          </h3>

          {stamps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-purple-200 mb-2">No stamps yet</p>
              <p className="text-purple-300 text-sm">Attend events to start collecting stamps!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stamps.slice(0, 5).map(stamp => {
                const event = events.find(e => e.id === stamp.event.id)
                return (
                  <div key={stamp.id} className="bg-purple-500/10 border-l-4 border-purple-500 rounded-r-lg pl-4 pr-4 py-3 hover:bg-purple-500/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{event?.eventName}</p>
                        <p className="text-sm text-purple-300">
                          {stamp.stampedAt ? new Date(stamp.stampedAt).toLocaleString() : "Unknown date"}
                        </p>
                      </div>
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  )
}
