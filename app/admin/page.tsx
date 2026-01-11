"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { MembersManagement } from "@/components/members-management"
import { EventsManagement } from "@/components/events-management"
import { BarChart3, Users, Calendar, TrendingUp, LogOut, Zap } from "lucide-react"
import type { Event, User, Role } from "@/lib/types"
import { mockUsers, mockEvents } from "@/lib/mock-data"

export default function AdminPage() {
  const { user: authUser, logout } = useAuth()
  const router = useRouter()

  if (!authUser) return null

  const organizationId = authUser.organization.id

  const [users, setUsers] = useState<User[]>(
    Object.values(mockUsers).filter(u => u.organization.id === organizationId)
  )

  const [events, setEvents] = useState<Event[]>(
    mockEvents.filter(e => e.organization.id === organizationId)
  )

  const [activeTab, setActiveTab] = useState<"overview" | "members" | "scanners" | "admins" | "events">("overview")
  const [logs, setLogs] = useState<string[]>([])

  // Handlers
  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find(u => u.id === userId)
    if (!userToDelete) return
    setUsers(users.filter(u => u.id !== userId))
    setLogs(prev => [`Deleted ${userToDelete.role} ${userToDelete.firstName} ${userToDelete.lastName}`, ...prev])
  }

  const handleDeleteEvent = (eventId: number) => {
    const eventToDelete = events.find(e => e.id === eventId)
    if (!eventToDelete) return
    setEvents(events.filter(e => e.id !== eventId))
    setLogs(prev => [`Deleted event ${eventToDelete.eventName}`, ...prev])
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
              <ul className="text-purple-200 text-sm space-y-1 max-h-48 overflow-y-auto">
                {logs.length === 0 ? <li>No logs yet</li> : logs.map((log, idx) => <li key={idx}>• {log}</li>)}
              </ul>
            </section>
          </>
        )}

        {/* MEMBERS */}
        {activeTab === "members" && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <MembersManagement
              members={members}
              org={authUser.organization}
              onAddMember={(m: User) => {
                setUsers(prev => [...prev, m])
                setLogs(prev => [`Added member ${m.firstName} ${m.lastName}`, ...prev])
              }}
              onEditMember={(updated: User) => {
                setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
                setLogs(prev => [`Edited member ${updated.firstName} ${updated.lastName}`, ...prev])
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
              onAddMember={(m: User) => {
                setUsers(prev => [...prev, m])
                setLogs(prev => [`Added scanner ${m.firstName} ${m.lastName}`, ...prev])
              }}
              onEditMember={(updated: User) => {
                setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
                setLogs(prev => [`Edited scanner ${updated.firstName} ${updated.lastName}`, ...prev])
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
              onAddMember={(m: User) => {
                setUsers(prev => [...prev, m])
                setLogs(prev => [`Added admin ${m.firstName} ${m.lastName}`, ...prev])
              }}
              onEditMember={(updated: User) => {
                setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
                setLogs(prev => [`Edited admin ${updated.firstName} ${updated.lastName}`, ...prev])
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
              onAddEvent={(e: Event) => {
                setEvents(prev => [...prev, e])
                setLogs(prev => [`Added event ${e.eventName}`, ...prev])
              }}
              onEditEvent={(updated: Event) => {
                setEvents(prev => prev.map(ev => (ev.id === updated.id ? updated : ev)))
                setLogs(prev => [`Edited event ${updated.eventName}`, ...prev])
              }}
              onDeleteEvent={handleDeleteEvent}
            />
          </section>
        )}
      </main>
    </div>
  )
}
