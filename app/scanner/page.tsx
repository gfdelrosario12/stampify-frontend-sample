"use client"

import { useState, useEffect } from "react"
import { QRScannerInterface } from "@/components/qr-scanner-interface"
import { ScanHistoryTable } from "@/components/scan-history-table"
import { BarChart3, Clock, Users, TrendingUp, LogOut, Zap, QrCode, Calendar, RefreshCw, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import type { User, Event } from "@/lib/types"

/* ------------------------- API BASE ------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

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
  const [scannerId, setScannerId] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [processingStamp, setProcessingStamp] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingScans, setLoadingScans] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  // Show notification helper
  const showNotification = (type: 'success' | 'error' | 'info', message: string, duration = 4000) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), duration)
  }

  /* ------------------------- DATA FETCH FUNCTION ------------------------- */
  const fetchScanHistory = async (showLoader = false) => {
    if (!selectedEventId || !scannerId) return

    if (showLoader) {
      setRefreshing(true)
    } else {
      setLoadingScans(true)
    }

    try {
      console.log(`🔄 Fetching stamps by scanner ${scannerId}...`)
      
      const stampsRes = await fetch(`${API_BASE}/stamps/scanner/${scannerId}`, {
        credentials: 'include'
      })
      
      if (stampsRes.ok) {
        const stampDTOs: StampDTO[] = await stampsRes.json()
        console.log('✅ StampDTOs received:', stampDTOs.length)
        
        const eventStampDTOs = stampDTOs.filter((stamp) => stamp.eventId === selectedEventId)
        console.log(`✅ Filtered ${eventStampDTOs.length} stamps for event ${selectedEventId}`)
        
        const currentEventName = events.find(e => e.id === selectedEventId)?.eventName || `Event ${selectedEventId}`
        
        const eventScans: ScanRecord[] = eventStampDTOs.map((stamp) => ({
          id: stamp.id.toString(),
          memberName: `Passport ${stamp.passportId}`,
          memberId: stamp.passportId.toString(),
          timestamp: new Date(stamp.stampedAt),
          eventId: stamp.eventId.toString(),
          eventName: currentEventName,
          status: stamp.scanStatus === "SUCCESS" ? "success" as const : "pending" as const
        }))
        
        setScans(eventScans)
      } else {
        showNotification('error', 'Failed to load scan history')
      }
    } catch (err) {
      console.error("❌ Error fetching scan history:", err)
      showNotification('error', 'Error loading scan history')
    } finally {
      if (showLoader) {
        setRefreshing(false)
      } else {
        setLoadingScans(false)
      }
    }
  }

  /* Fetch all events for the scanner */
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true)
      try {
        // Get current user to fetch their organization events
        const userRes = await fetch(`${API_BASE}/users/me`, {
          credentials: 'include'
        })
        
        if (!userRes.ok) {
          console.error("Failed to fetch user data")
          showNotification('error', 'Failed to load user data')
          setLoadingEvents(false)
          return
        }
        
        const userData = await userRes.json()
        console.log("Scanner user data:", userData)
        
        // Store scanner ID for stamp creation
        setScannerId(userData.id)
        
        // Fetch events for the scanner's organization
        if (userData.organization?.id) {
          const eventsRes = await fetch(`${API_BASE}/events/organization/${userData.organization.id}`, {
            credentials: 'include'
          })
          
          if (eventsRes.ok) {
            const data: Event[] = await eventsRes.json()
            console.log("Events loaded:", data)
            setEvents(data)
            if (data.length > 0) {
              setSelectedEventId(data[0].id)
              showNotification('success', `Loaded ${data.length} event(s)`)
            } else {
              showNotification('info', 'No events available')
            }
          } else {
            console.error("Failed to fetch events:", eventsRes.status)
            showNotification('error', 'Failed to load events')
          }
        } else {
          showNotification('error', 'No organization found')
        }
      } catch (err) {
        console.error("Error fetching events:", err)
        showNotification('error', 'Error loading events')
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchEvents()
  }, [])

  /* Fetch scan history whenever selected event changes */
  useEffect(() => {
    if (!selectedEventId || !scannerId) return

    const fetchScans = async () => {
      setLoadingScans(true)
      try {
        console.log(`🔄 Fetching stamps by scanner ${scannerId}...`)
        
        // Fetch StampDTOs created by this scanner
        const stampsRes = await fetch(`${API_BASE}/stamps/scanner/${scannerId}`, {
          credentials: 'include'
        })
        
        if (stampsRes.ok) {
          const stampDTOs: StampDTO[] = await stampsRes.json()
          console.log('✅ StampDTOs received:', stampDTOs)
          
          // Filter stamps for the selected event
          const eventStampDTOs = stampDTOs.filter((stamp) => stamp.eventId === selectedEventId)
          console.log(`✅ Filtered ${eventStampDTOs.length} stamps for event ${selectedEventId}`)
          
          // Get current event name for display
          const currentEventName = events.find(e => e.id === selectedEventId)?.eventName || `Event ${selectedEventId}`
          
          // Convert StampDTOs to ScanRecords for UI display
          const eventScans: ScanRecord[] = eventStampDTOs.map((stamp) => ({
            id: stamp.id.toString(),
            memberName: `Passport ${stamp.passportId}`,
            memberId: stamp.passportId.toString(),
            timestamp: new Date(stamp.stampedAt),
            eventId: stamp.eventId.toString(),
            eventName: currentEventName,
            status: stamp.scanStatus === "SUCCESS" ? "success" as const : "pending" as const
          }))
          
          console.log('✅ Scan history loaded:', eventScans)
          setScans(eventScans)
        } else {
          console.error('❌ Failed to fetch stamps:', stampsRes.status)
          showNotification('error', 'Failed to load scan history')
        }
      } catch (err) {
        console.error("❌ Error fetching scan history:", err)
        showNotification('error', 'Error loading scan history')
      } finally {
        setLoadingScans(false)
      }
    }

    fetchScans()
  }, [selectedEventId, scannerId, events])

  /* ------------------------- AUTO REFRESH (every 10 seconds for scanner) ------------------------- */
  useEffect(() => {
    if (!autoRefresh || !selectedEventId || !scannerId) return

    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing scan history...')
      fetchScanHistory(false)
    }, 10000) // 10 seconds (faster for scanners to see real-time updates)

    return () => clearInterval(intervalId)
  }, [autoRefresh, selectedEventId, scannerId, events])

  // Manual refresh handler
  const handleManualRefresh = () => {
    showNotification('info', 'Refreshing scan history...')
    fetchScanHistory(true)
  }

  const currentEvent = events.find((e) => e.id === selectedEventId)

  /* Handle new scan from QR scanner */
  const handleScan = async (scanData: { memberId: string; memberName: string }) => {
    if (!currentEvent) {
      console.error("No event selected")
      alert("Please select an event first")
      return
    }

    console.log('🔍 QR Code Scanned - Member ID:', scanData.memberId)
    
    // Show confirmation dialog directly without fetching member details
    // Scanner doesn't need full member info, backend will handle validation
    setPendingScan({
      memberId: scanData.memberId,
      memberName: `Member ${scanData.memberId}`,
      memberData: null
    })
    setShowConfirmDialog(true)
  }

  /* Confirm and create stamp */
  const confirmStamp = async () => {
    if (!pendingScan || !currentEvent || !scannerId) {
      console.error("Missing required data for stamp creation")
      return
    }

    setShowConfirmDialog(false)
    setProcessingStamp(true)

    try {
      // Step 1: Fetch passport ID using member ID
      setProcessingMessage("Looking up member passport...")
      console.log(`🔄 Step 1: Fetching passport for member ${pendingScan.memberId}...`)
      const passportRes = await fetch(`${API_BASE}/passports/member/${pendingScan.memberId}`, {
        credentials: 'include'
      })

      if (!passportRes.ok) {
        console.error('❌ Failed to fetch passport:', passportRes.status)
        setProcessingStamp(false)
        alert(`❌ Passport Not Found\n\nMember ID: ${pendingScan.memberId}\n\nThis member does not have a valid passport.`)
        setPendingScan(null)
        return
      }

      const passports = await passportRes.json()
      console.log('✅ Passport Data:', passports)
      
      if (!Array.isArray(passports) || passports.length === 0) {
        console.error('❌ No passport found for member')
        setProcessingStamp(false)
        alert(`❌ Passport Not Found\n\nMember ID: ${pendingScan.memberId}\n\nThis member does not have a valid passport.`)
        setPendingScan(null)
        return
      }

      const passportId = passports[0].id
      console.log('📋 Using Passport ID:', passportId)

      // Step 2: Create stamp directly - backend will handle duplicate check
      setProcessingMessage("Creating stamp & checking for duplicates...")
      console.log('🔄 Step 2: Creating stamp...')
      const payload = {
        passportId,
        eventId: currentEvent.id,
        scannerId,
        scanStatus: "SUCCESS"
      }
      
      console.log('📤 Stamp Payload:', JSON.stringify(payload, null, 2))

      const createRes = await fetch(`${API_BASE}/stamps?userId=${scannerId}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!createRes.ok) {
        const errorText = await createRes.text()
        console.error('❌ Failed to create stamp:', createRes.status, errorText)
        
        setProcessingStamp(false)
        
        // Check if it's a duplicate error
        if (createRes.status === 400 || createRes.status === 409 || 
            errorText.toLowerCase().includes('duplicate') || 
            errorText.toLowerCase().includes('already') ||
            errorText.toLowerCase().includes('exists')) {
          console.warn('⚠️ Duplicate stamp detected')
          alert(`⚠️ Already Checked In!\n\nMember ID: ${pendingScan.memberId}\nPassport ID: ${passportId}\n\nThis member is already checked in for:\n"${currentEvent.eventName}"`)
        } else {
          alert(`❌ Failed to Create Stamp\n\n${errorText || 'Unknown error occurred'}`)
        }
        
        setPendingScan(null)
        return
      }

      const createdStamp = await createRes.json()
      console.log('✅ Stamp created successfully!', createdStamp)

      // Step 3: Update UI with StampDTO response
      setProcessingMessage("Updating records...")
      const stampDTO: StampDTO = createdStamp
      const newScan: ScanRecord = {
        id: stampDTO.id.toString(),
        memberName: pendingScan.memberName,
        memberId: pendingScan.memberId,
        timestamp: new Date(stampDTO.stampedAt),
        eventId: stampDTO.eventId.toString(),
        eventName: currentEvent.eventName,
        status: stampDTO.scanStatus === "SUCCESS" ? "success" : "pending"
      }

      setScans([newScan, ...scans])
      
      // Refresh scan history to get latest data
      await fetchScanHistory(false)
      
      setProcessingStamp(false)
      setPendingScan(null)
      
      showNotification('success', `✅ Check-in successful for Member ${pendingScan.memberId}!`)

    } catch (err) {
      console.error("❌ Error processing scan:", err)
      setProcessingStamp(false)
      showNotification('error', 'Error processing scan. Please try again.')
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

  // Show loading screen during initial load
  if (loadingEvents) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Zap className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Scanner...</h2>
          <p className="text-purple-300">Setting up your event check-in system</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[70] animate-in slide-in-from-top-2 duration-300">
          <div className={`rounded-lg shadow-2xl p-4 min-w-[300px] border-2 ${
            notification.type === 'success' 
              ? 'bg-green-500/90 border-green-400 text-white' 
              : notification.type === 'error'
              ? 'bg-red-500/90 border-red-400 text-white'
              : 'bg-blue-500/90 border-blue-400 text-white'
          } backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                {notification.type === 'error' && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </div>
                )}
                {notification.type === 'info' && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                )}
              </div>
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

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
              title={autoRefresh ? "Auto-refresh enabled (every 10s)" : "Auto-refresh disabled"}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-green-400 animate-pulse" : "bg-slate-400"}`} />
              Auto
            </button>

            {/* Manual refresh button */}
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-white disabled:opacity-50"
              title="Refresh scan history"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

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
                  {loadingScans ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    `${scans.length} scans`
                  )}
                </span>
              </div>

              {loadingScans ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-purple-300 text-sm">Loading scan history...</p>
                  </div>
                </div>
              ) : (
                <ScanHistoryTable scans={scans} />
              )}
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

      {/* Processing/Loading Modal */}
      {processingStamp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-2xl border-2 border-purple-500/50 p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              {/* Animated Spinner */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>

              {/* Processing Message */}
              <h3 className="text-xl font-bold text-white mb-2">Processing Check-In</h3>
              <p className="text-purple-300 text-sm mb-4">{processingMessage}</p>

              {/* Progress Indicator */}
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>

              {/* Info Text */}
              <p className="text-xs text-purple-400 mt-4">
                Please wait while we verify and create your stamp...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
