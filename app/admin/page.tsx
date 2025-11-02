"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { MembersManagement } from "@/components/members-management"
import { EventsManagement } from "@/components/events-management"
import { mockUsers, mockEvents } from "@/lib/mock-data"
import { BarChart3, Users, Calendar, TrendingUp, LogOut, Zap } from "lucide-react"
import type { Event as LibEvent, User as LibUser, Role } from "@/lib/types"

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}
type AdminEvent = LibEvent

export default function AdminPage() {
  const { user: authUser, logout } = useAuth()
  const router = useRouter()

  const user = authUser
    ? {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role,
        organization: authUser.organization,
      }
    : null

  const [members, setMembers] = useState<AdminUser[]>([
    mockUsers["member-1"] as unknown as AdminUser,
    mockUsers["scanner-1"] as unknown as AdminUser,
    { id: "user-4", name: "Taylor Brown", email: "taylor@example.com", role: "member" },
    { id: "user-5", name: "Morgan Davis", email: "morgan@example.com", role: "member" },
    { id: "user-6", name: "Casey Wilson", email: "casey@example.com", role: "scanner" },
  ])

  const [events, setEvents] = useState<AdminEvent[]>(
    mockEvents.map(e => ({
      id: e.id,
      name: e.name,
      date: e.date,
      location: e.location,
      organizationId: e.organizationId,
      description: e.description,
    }))
  )

  const [activeTab, setActiveTab] = useState<"overview" | "members" | "events">("overview")

  const membersForComponent: LibUser[] = members.map(m => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role as Role,
    organization: (mockUsers["member-1"] as any).organization,
  }))

  const handleDeleteMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId))
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId))
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ✅ NAVBAR (Matches ScannerPage) */}
      <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            {/* Logo + Brand */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                STAMP<span className="text-pink-400">i</span>FY
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-purple-300 capitalize">{user.role}</p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors text-white"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ✅ Navigation Tabs (Styled Like ScannerPage Buttons) */}
          <div className="flex gap-2 border-t border-purple-500/20 pt-3 mt-3">
            {[
              { label: "Overview", value: "overview" },
              { label: "Members", value: "members" },
              { label: "Events", value: "events" },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.value
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-purple-500/10 text-purple-200 hover:bg-purple-500/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ✅ MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ---------------- OVERVIEW TAB ---------------- */}
        {activeTab === "overview" && (
          <>
            {/* Header */}
            <section>
              <h1 className="text-4xl font-bold mb-2 text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-400" />
                Admin Dashboard
              </h1>
              <p className="text-purple-200">Manage users, events, and organization settings</p>
            </section>

            {/* Stats (Now Matches ScannerPage StatCards) */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <p className="text-sm opacity-90 mb-1">Total Members</p>
                <p className="text-3xl font-bold">
                  {members.filter(m => m.role === "member").length}
                </p>
                <Users className="w-10 h-10 opacity-20 absolute bottom-4 right-4" />
              </div>

              <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl p-6 text-white shadow-lg relative">
                <p className="text-sm opacity-90 mb-1">Active Scanners</p>
                <p className="text-3xl font-bold">
                  {members.filter(m => m.role === "scanner").length}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-700 to-pink-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-1">Total Scans</p>
                <p className="text-3xl font-bold">142</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold">{events.length}</p>
              </div>
            </section>
          </>
        )}

        {/* ---------------- MEMBERS TAB ---------------- */}
        {activeTab === "members" && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <MembersManagement
              members={membersForComponent}
              onAddMember={() => {}}
              onEditMember={() => {}}
              onDeleteMember={handleDeleteMember}
            />
          </section>
        )}

        {/* ---------------- EVENTS TAB ---------------- */}
        {activeTab === "events" && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <EventsManagement
              events={events}
              onAddEvent={() => {}}
              onEditEvent={() => {}}
              onDeleteEvent={handleDeleteEvent}
            />
          </section>
        )}
      </main>
    </div>
  )
}
