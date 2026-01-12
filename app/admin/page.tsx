"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { MembersManagement } from "@/components/members-management"
import { EventsManagement } from "@/components/events-management"
import { BarChart3, Users, Calendar, TrendingUp, LogOut, Zap, Loader2 } from "lucide-react"
import type { Event, User, Role, AuditLog } from "@/lib/types"

/* ------------------------- API BASE ------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export default function AdminPage() {
  const { user: authUser, logout } = useAuth()
  const router = useRouter()

  if (!authUser) return null

  const organizationId = authUser.organization.id

  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "scanners" | "admins" | "events">("overview")

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, eventsRes, logsRes] = await Promise.all([
          fetch(`${API_BASE}/api/users?organizationId=${organizationId}`),
          fetch(`${API_BASE}/api/events?organizationId=${organizationId}`),
          fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
        ])

        const usersData: User[] = await usersRes.json()
        const eventsData: Event[] = await eventsRes.json()
        const logsData: AuditLog[] = await logsRes.json()

        setUsers(usersData)
        setEvents(eventsData)
        setAuditLogs(logsData)
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [organizationId])

  // Handlers
  const handleDeleteUser = async (userId: number) => {
    try {
      await fetch(`${API_BASE}/api/users/${userId}`, { method: "DELETE" })
      setUsers(users.filter(u => u.id !== userId))
      // Refresh audit logs
      const logsRes = await fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
      const logsData: AuditLog[] = await logsRes.json()
      setAuditLogs(logsData)
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await fetch(`${API_BASE}/api/events/${eventId}`, { method: "DELETE" })
      setEvents(events.filter(e => e.id !== eventId))
      // Refresh audit logs
      const logsRes = await fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
      const logsData: AuditLog[] = await logsRes.json()
      setAuditLogs(logsData)
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Filter users by role
  const members = useMemo(() => users.filter(u => u.role === "member"), [users])
  const scanners = useMemo(() => users.filter(u => u.role === "scanner"), [users])
  const admins = useMemo(() => users.filter(u => u.role === "admin"), [users])

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
              <p className="text-sm font-medium text-white">{authUser.firstName} {authUser.lastName}</p>
              <p className="text-xs text-purple-300 capitalize">{authUser.role}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-white"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-2 border-t border-purple-500/20 pt-3 mt-3">
          {["overview", "members", "scanners", "admins", "events"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-purple-500/10 text-purple-200 hover:bg-purple-500/20"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <section>
              <h1 className="text-4xl font-bold mb-2 text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                Admin Dashboard
              </h1>
              <p className="text-purple-200">Manage users, events, and view logs</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <p className="text-sm opacity-90 mb-1">Total Members</p>
                <p className="text-3xl font-bold">{members.length}</p>
                <Users className="w-10 h-10 opacity-20 absolute bottom-4 right-4" />
              </div>
              <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-6 text-white shadow-lg relative">
                <p className="text-sm opacity-90 mb-1">Active Scanners</p>
                <p className="text-3xl font-bold">{scanners.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-700 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-1">Admins</p>
                <p className="text-3xl font-bold">{admins.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold">{events.length}</p>
              </div>
            </section>

            <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm mt-6">
              <h2 className="text-xl text-white font-semibold mb-3">Activity Logs</h2>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ul className="text-purple-200 text-sm space-y-1 max-h-48 overflow-y-auto">
                  {auditLogs.length === 0 ? (
                    <li>No logs yet</li>
                  ) : (
                    auditLogs.slice(0, 10).map((log) => (
                      <li key={log.id}>
                        • {log.actionCategory} - {log.actionName} on {log.entityName}
                        {log.actorUser && ` by ${log.actorUser.firstName} ${log.actorUser.lastName}`}
                        <span className="text-xs text-purple-300 ml-2">
                          {new Date(log.occurredAt).toLocaleString()}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </section>
          </>
        )}

        {/* MEMBERS */}
        {activeTab === "members" && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <MembersManagement
              members={members}
              org={authUser.organization}
              onAddMember={async (m: User) => {
                try {
                  const res = await fetch(`${API_BASE}/api/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(m),
                  })
                  const newUser: User = await res.json()
                  setUsers(prev => [...prev, newUser])
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                } catch (error) {
                  console.error("Error adding member:", error)
                }
              }}
              onEditMember={async (updated: User) => {
                try {
                  await fetch(`${API_BASE}/api/users/${updated.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updated),
                  })
                  setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                } catch (error) {
                  console.error("Error updating member:", error)
                }
              }}
              onDeleteMember={handleDeleteUser}
            />
          </section>
        )}

        {/* SCANNERS */}
        {activeTab === "scanners" && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <MembersManagement
              members={scanners}
              org={authUser.organization}
              onAddMember={async (m: User) => {
                try {
                  const res = await fetch(`${API_BASE}/api/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(m),
                  })
                  const newUser: User = await res.json()
                  setUsers(prev => [...prev, newUser])
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                } catch (error) {
                  console.error("Error adding scanner:", error)
                }
              }}
              onEditMember={async (updated: User) => {
                try {
                  await fetch(`${API_BASE}/api/users/${updated.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updated),
                  })
                  setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                } catch (error) {
                  console.error("Error updating scanner:", error)
                }
              }}
              onDeleteMember={handleDeleteUser}
            />
          </section>
        )}

        {/* ADMINS */}
        {activeTab === "admins" && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <MembersManagement
              members={admins}
              org={authUser.organization}
              onAddMember={async (m: User) => {
                try {
                  const res = await fetch(`${API_BASE}/api/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(m),
                  })
                  const newUser: User = await res.json()
                  setUsers(prev => [...prev, newUser])
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                } catch (error) {
                  console.error("Error adding admin:", error)
                }
              }}
              onEditMember={async (updated: User) => {
                try {
                  await fetch(`${API_BASE}/api/users/${updated.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updated),
                  })
                  setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                } catch (error) {
                  console.error("Error updating admin:", error)
                }
              }}
              onDeleteMember={handleDeleteUser}
            />
          </section>
        )}

        {/* EVENTS */}
        {activeTab === "events" && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <EventsManagement
              events={events}
              org={authUser.organization}
              onAddEvent={async (e: Event) => {
                try {
                  const res = await fetch(`${API_BASE}/api/events`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(e),
                  })
                  const newEvent: Event = await res.json()
                  setEvents(prev => [...prev, newEvent])
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                } catch (error) {
                  console.error("Error adding event:", error)
                }
              }}
              onEditEvent={async (updated: Event) => {
                try {
                  await fetch(`${API_BASE}/api/events/${updated.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updated),
                  })
                  setEvents(prev => prev.map(ev => (ev.id === updated.id ? updated : ev)))
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/api/audit-logs?organizationId=${organizationId}`)
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                } catch (error) {
                  console.error("Error updating event:", error)
                }
              }}
              onDeleteEvent={handleDeleteEvent}
            />
          </section>
        )}
      </main>
    </div>
  )
}
