"use client"

import { useState, useEffect } from "react"
import { QRScannerInterface } from "@/components/qr-scanner-interface"
import { ScanHistoryTable } from "@/components/scan-history-table"
import { BarChart3, Clock, Users, TrendingUp, LogOut, Zap, QrCode, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type { User, Event } from "@/lib/types"

/* ------------------------- API BASE ------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

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
  const [pendingScan, setPendingScan] = useState<{ memberId: string; memberName: string; memberData?: any } | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  /* Fetch all events for the scanner */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Get current user to fetch their organization events
        const userRes = await fetch(`${API_BASE}/users/me`, {
          credentials: 'include'
        })
        
        if (!userRes.ok) {
          console.error("Failed to fetch user data")
          return
        }
        
        const userData = await userRes.json()
        console.log("Scanner user data:", userData)
        
        // Fetch events for the scanner's organization
        if (userData.organization?.id) {
          const eventsRes = await fetch(`${API_BASE}/events/organization/${userData.organization.id}`, {
            credentials: 'include'
          })
          
          if (eventsRes.ok) {
            const data: Event[] = await eventsRes.json()
            console.log("Events loaded:", data)
            setEvents(data)
            if (data.length > 0) setSelectedEventId(data[0].id)
          } else {
            console.error("Failed to fetch events:", eventsRes.status)
          }
        }
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
        // Get current user (scanner) ID
        const userRes = await fetch(`${API_BASE}/users/me`, {
          credentials: 'include'
        })
        
        if (userRes.ok) {
          const userData = await userRes.json()
          
          // Fetch stamps created by this scanner
          const stampsRes = await fetch(`${API_BASE}/stamps/scanner/${userData.id}`, {
            credentials: 'include'
          })
          
          if (stampsRes.ok) {
            const stampsData = await stampsRes.json()
            
            // Filter stamps for the selected event and convert to ScanRecord format
            const eventStamps = stampsData
              .filter((stamp: any) => stamp.event?.id === selectedEventId)
              .map((stamp: any) => ({
                id: stamp.id?.toString() || '',
                memberName: `${stamp.passport?.member?.firstName || ''} ${stamp.passport?.member?.lastName || ''}`.trim() || 'Unknown',
                memberId: stamp.passport?.member?.id?.toString() || '',
                timestamp: new Date(stamp.stampedAt || stamp.createdAt),
                eventId: stamp.event?.id?.toString() || '',
                eventName: stamp.event?.eventName || '',
                status: "success" as const
              }))
            
            console.log("Scan history loaded:", eventStamps)
            setScans(eventStamps)
          }
        }
      } catch (err) {
        console.error("Error fetching scan history:", err)
      }
    }

    fetchScans()
  }, [selectedEventId])

  const currentEvent = events.find((e) => e.id === selectedEventId)

  /* Handle new scan from QR scanner */
  const handleScan = async (scanData: { memberId: string; memberName: string }) => {
    if (!currentEvent) {
      console.error("No event selected")
      alert("Please select an event first")
      return
    }

    console.log('🔍 QR Code Scanned - Member ID:', scanData.memberId)
    
    try {
      // Step 1: Fetch member details using member ID
      console.log(`🔄 Fetching member details for ID ${scanData.memberId}...`)
      const memberRes = await fetch(`${API_BASE}/users/${scanData.memberId}`, {
        credentials: 'include'
      })

      let memberName = scanData.memberName
      let memberData = null

      if (memberRes.ok) {
        memberData = await memberRes.json()
        memberName = `${memberData.firstName} ${memberData.lastName}`
        console.log('✅ Member details:', memberData)
      }

      // Show confirmation dialog with member info
      setPendingScan({
        memberId: scanData.memberId,
        memberName,
        memberData
      })
      setShowConfirmDialog(true)

    } catch (err) {
      console.error("❌ Error fetching member details:", err)
      alert('Error fetching member details. Please try again.')
    }
  }

  /* Confirm and create stamp */
  const confirmStamp = async () => {
    if (!pendingScan || !currentEvent) return

    setShowConfirmDialog(false)

    try {
      // Step 2: Get passport(s) for this member ID
      console.log(`🔄 Fetching passport for member ${pendingScan.memberId}...`)
      const passportRes = await fetch(`${API_BASE}/passports/member/${pendingScan.memberId}`, {
        credentials: 'include'
      })

      if (!passportRes.ok) {
        console.error('❌ Failed to fetch passport:', passportRes.status)
        alert(`Failed to find passport for ${pendingScan.memberName}`)
        setPendingScan(null)
        return
      }

      const passportsData = await passportRes.json()
      console.log('✅ Passport Data:', passportsData)
      
      // Handle both single passport and array
      const passports = Array.isArray(passportsData) ? passportsData : [passportsData]
      
      if (passports.length === 0) {
        console.error('❌ No passport found for member')
        alert(`No passport found for ${pendingScan.memberName}`)
        setPendingScan(null)
        return
      }

      const passport = passports[0] // Use first passport
      console.log('📋 Using passport ID:', passport.id)

      // Step 3: Check if stamp already exists for this passport + event
      console.log(`🔄 Checking for existing stamp (passport: ${passport.id}, event: ${currentEvent.id})...`)
      const existingStampRes = await fetch(
        `${API_BASE}/stamps/passport/${passport.id}/event/${currentEvent.id}`,
        { credentials: 'include' }
      )

      if (existingStampRes.ok) {
        console.warn('⚠️ Stamp already exists for this event')
        alert(`${pendingScan.memberName} is already checked in for this event!`)
        setPendingScan(null)
        return
      }

      // Step 4: Create stamp with passport ID and event ID
      console.log('🔄 Creating stamp...')
      const stampPayload = {
        passport: { id: passport.id },
        event: { id: currentEvent.id }
      }
      
      console.log('📤 Stamp payload:', stampPayload)

      const createStampRes = await fetch(`${API_BASE}/stamps`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stampPayload)
      })

      if (!createStampRes.ok) {
        const errorText = await createStampRes.text()
        console.error('❌ Failed to create stamp:', createStampRes.status, errorText)
        alert('Failed to create stamp. Please try again.')
        setPendingScan(null)
        return
      }

      const createdStamp = await createStampRes.json()
      console.log('✅ Stamp created successfully:', createdStamp)

      // Step 5: Add to local scan history
      const newScan: ScanRecord = {
        id: createdStamp.id?.toString() || Date.now().toString(),
        memberName: pendingScan.memberName,
        memberId: pendingScan.memberId,
        timestamp: new Date(),
        eventId: currentEvent.id.toString(),
        eventName: currentEvent.eventName,
        status: "success"
      }

      setScans([newScan, ...scans])
      
      // Show success notification
      alert(`✅ Check-in successful!\n\nMember: ${pendingScan.memberName}\nEvent: ${currentEvent.eventName}`)
      
      setPendingScan(null)
      
    } catch (err) {
      console.error("❌ Error processing scan:", err)
      alert('Error processing scan. Please try again.')
      setPendingScan(null)
    }
  }

  /* Cancel stamp creation */
  const cancelStamp = () => {
    setShowConfirmDialog(false)
    setPendingScan(null)
  }

  /* Logout */
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

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingScan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-purple-500/30 p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Confirm Check-In</h3>
              <p className="text-purple-300 text-sm">Review the details before creating stamp</p>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-300 text-sm">Member Name:</span>
                <span className="text-white font-semibold">{pendingScan.memberName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300 text-sm">Member ID:</span>
                <span className="text-white font-mono text-sm">{pendingScan.memberId}</span>
              </div>
              {pendingScan.memberData?.email && (
                <div className="flex justify-between items-center">
                  <span className="text-purple-300 text-sm">Email:</span>
                  <span className="text-white text-sm">{pendingScan.memberData.email}</span>
                </div>
              )}
              <div className="border-t border-purple-500/20 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300 text-sm">Event:</span>
                  <span className="text-white font-semibold">{currentEvent?.eventName}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={cancelStamp}
                className="px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStamp}
                className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all shadow-lg"
              >
                Confirm Check-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
