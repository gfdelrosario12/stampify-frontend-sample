"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Zap, QrCode, Award, Check, Calendar, Star, TrendingUp, LogOut, RefreshCw } from "lucide-react"
import type { User, Stamp as StampType } from "@/lib/types"

/* ------------------------- API BASE ------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

/* ------------------------- TYPES ------------------------- */

interface StampDTO {
  id: number
  passportId: number
  eventId: number
  scannerId: number
  stampedAt: string
  scanStatus: string
  valid: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

interface EventData {
  id: number
  eventName: string
  eventDescription?: string
  eventType?: string
  eventBadge?: string
  venueName?: string
  venueImageUrl?: string
  scheduledAt?: string
}

interface DigitalIDCardProps {
  user: User
  stamps: StampDTO[]
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

          <div className="mb-6">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-1">{user.firstName} {user.lastName}</h3>
              <p className="text-purple-100 text-sm">{user.email}</p>
              <p className="text-purple-200 text-xs mt-2 font-mono bg-white/10 px-2 py-1 rounded inline-block">ID: {user.id}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 flex items-center justify-center shadow-inner">
            {(user as any).qrCodeUrl ? (
              <img 
                src={(user as any).qrCodeUrl} 
                alt="Member QR Code" 
                className="w-40 h-40 object-contain"
              />
            ) : (
              <QrCode className="w-40 h-40 text-purple-600" />
            )}
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
              const stamp = stamps.find(s => s.eventId === event.id)
              return (
                <div
                  key={event.id}
                  className={`group relative p-3 rounded-lg transition-all ${
                    stamp
                      ? "bg-green-500/30 border-2 border-green-400 shadow-lg shadow-green-500/20"
                      : "bg-white/10 border-2 border-white/20 backdrop-blur-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Event Badge */}
                    {event.eventBadge ? (
                      <div className="relative">
                        <img 
                          src={event.eventBadge} 
                          alt={event.eventName}
                          className={`w-12 h-12 object-contain rounded-lg ${stamp ? 'opacity-100' : 'opacity-50 grayscale'}`}
                        />
                        {stamp && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        stamp ? 'bg-green-500/30' : 'bg-white/10'
                      }`}>
                        <Award className={`w-6 h-6 ${stamp ? 'text-green-400' : 'text-white/50'}`} />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{event.eventName}</p>
                      <p className="text-xs text-purple-100 truncate">
                        {event.scheduledAt ? new Date(event.scheduledAt).toLocaleDateString() : 'TBA'}
                      </p>
                      {stamp && (
                        <p className="text-xs text-green-300 mt-1">
                          ✓ {stamp.scanStatus}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-900 border border-purple-500/30 rounded-lg p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="flex items-start gap-3">
                      {event.eventBadge && (
                        <img 
                          src={event.eventBadge} 
                          alt={event.eventName}
                          className="w-16 h-16 object-contain rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm mb-1">{event.eventName}</p>
                        {event.eventDescription && (
                          <p className="text-xs text-purple-200 mb-2 line-clamp-2">{event.eventDescription}</p>
                        )}
                        {event.venueName && (
                          <p className="text-xs text-purple-300">📍 {event.venueName}</p>
                        )}
                        {event.eventType && (
                          <p className="text-xs text-purple-300 mt-1">
                            <span className="bg-purple-500/30 px-2 py-0.5 rounded">{event.eventType}</span>
                          </p>
                        )}
                        {stamp && (
                          <p className="text-xs text-green-400 mt-2 font-medium">
                            Stamped: {new Date(stamp.stampedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-900"></div>
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
  const [stamps, setStamps] = useState<StampDTO[]>([])
  const [events, setEvents] = useState<EventData[]>([])
  const [flipped, setFlipped] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // ------------------------- DATA FETCH FUNCTION -------------------------
  const fetchData = async (showLoader = false) => {
    if (!authUser) return
    
    if (showLoader) {
      setRefreshing(true)
    }

    try {
      // Fetch user info from /me endpoint
      console.log('🔄 Fetching /me endpoint...')
      const userRes = await fetch(`${API_BASE}/users/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!userRes.ok) {
        console.error("❌ Failed to fetch user data:", userRes.status, userRes.statusText)
        return
      }
      
      const userData: User = await userRes.json()
      console.log('✅ User data loaded')
      setUser(userData)

      // Fetch stamps for this member using their ID from session
      console.log(`🔄 Fetching passport for member ${userData.id}...`)
      try {
        const passportRes = await fetch(`${API_BASE}/passports/member/${userData.id}`, {
          credentials: 'include'
        })
        
        if (passportRes.ok) {
          const passportData = await passportRes.json()
          const passports = Array.isArray(passportData) ? passportData : [passportData]
          
          // Get stamps for each passport
          const allStamps: StampDTO[] = []
          for (const passport of passports) {
            if (passport?.id) {
              const stampsRes = await fetch(`${API_BASE}/stamps/passport/${passport.id}`, {
                credentials: 'include'
              })
              
              if (stampsRes.ok) {
                const stampsData: StampDTO[] = await stampsRes.json()
                allStamps.push(...stampsData)
              }
            }
          }
          
          console.log('✅ Total stamps collected:', allStamps.length)
          setStamps(allStamps)
        } else if (passportRes.status === 404) {
          console.warn("⚠️ No passport found for member")
          setStamps([])
        } else {
          console.error("❌ Failed to fetch passport:", passportRes.status)
          setStamps([])
        }
      } catch (err) {
        console.error("❌ Error fetching stamps:", err)
        setStamps([])
      }

      // Fetch events for the user's organization
      if (userData.organization?.id) {
        console.log(`🔄 Fetching events for organization ${userData.organization.id}...`)
        const eventsRes = await fetch(`${API_BASE}/events/organization/${userData.organization.id}`, {
          credentials: 'include'
        })
        
        if (eventsRes.ok) {
          const eventsData: EventData[] = await eventsRes.json()
          console.log('✅ Events loaded:', eventsData.length)
          setEvents(eventsData)
        } else {
          console.error("❌ Failed to fetch events:", eventsRes.status)
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
    } finally {
      if (showLoader) {
        setRefreshing(false)
      }
    }
  }

  // ------------------------- INITIAL DATA FETCH -------------------------
  useEffect(() => {
    fetchData()
  }, [authUser])

  // ------------------------- AUTO REFRESH (every 30 seconds) -------------------------
  useEffect(() => {
    if (!autoRefresh || !authUser) return

    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing member data...')
      fetchData(false)
    }, 30000) // 30 seconds

    return () => clearInterval(intervalId)
  }, [autoRefresh, authUser])

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchData(true)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const completionRate = events.length > 0 ? Math.round((stamps.length / events.length) * 100) : 0

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/users/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/")
    }
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
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                autoRefresh 
                  ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                  : "bg-slate-700 text-slate-300 border border-slate-600"
              }`}
              title={autoRefresh ? "Auto-refresh enabled (every 30s)" : "Auto-refresh disabled"}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-green-400 animate-pulse" : "bg-slate-400"}`} />
              Auto
            </button>

            {/* Manual refresh button */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-white disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
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
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{user.firstName}</span>!
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

        {/* Badge Collection */}
        <div className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <Award className="w-5 h-5 text-purple-400" />
            Your Badge Collection
          </h3>

          {stamps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-purple-200 mb-2">No badges collected yet</p>
              <p className="text-purple-300 text-sm">Attend events to earn badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {events.map(event => {
                const stamp = stamps.find(s => s.eventId === event.id)
                return (
                  <div
                    key={event.id}
                    className={`group relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                      stamp 
                        ? 'ring-2 ring-green-400 shadow-lg shadow-green-500/20 hover:scale-105' 
                        : 'opacity-40 grayscale hover:opacity-60'
                    }`}
                  >
                    {/* Badge Image */}
                    {event.eventBadge ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center p-4">
                        <img 
                          src={event.eventBadge} 
                          alt={event.eventName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Award className="w-12 h-12 text-white" />
                      </div>
                    )}

                    {/* Stamp Check Mark */}
                    {stamp && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Hover Overlay with Details */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <p className="text-white font-bold text-sm mb-1 line-clamp-2">{event.eventName}</p>
                      {stamp ? (
                        <div className="space-y-0.5">
                          <p className="text-green-300 text-xs font-medium">✓ Collected</p>
                          <p className="text-purple-200 text-xs">
                            {new Date(stamp.stampedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-purple-300 text-xs">Not collected yet</p>
                      )}
                    </div>

                    {/* Lock Icon for Uncollected */}
                    {!stamp && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="w-10 h-10 bg-slate-800/80 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white/60 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Collection Progress */}
          <div className="mt-6 bg-purple-500/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-200 text-sm font-medium">Collection Progress</span>
              <span className="text-white font-bold">{stamps.length}/{events.length}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${events.length > 0 ? (stamps.length / events.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
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
                const event = events.find(e => e.id === stamp.eventId)
                return (
                  <div key={stamp.id} className="bg-purple-500/10 border-l-4 border-purple-500 rounded-r-lg pl-4 pr-4 py-3 hover:bg-purple-500/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{event?.eventName || `Event ${stamp.eventId}`}</p>
                        <p className="text-sm text-purple-300">
                          {stamp.stampedAt ? new Date(stamp.stampedAt).toLocaleString() : "Unknown date"}
                        </p>
                        <p className="text-xs text-purple-400 mt-1">
                          Status: {stamp.scanStatus} • Valid: {stamp.valid ? "✓" : "✗"}
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
