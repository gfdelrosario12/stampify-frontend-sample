"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth, Role as AuthRole, User as AuthUser, Org } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { MembersManagement } from "@/components/members-management"
import { EventsManagement } from "@/components/events-management"
import { BarChart3, Users, Calendar, TrendingUp, LogOut, Zap, Loader2, CheckCircle, XCircle } from "lucide-react"
import type { Event, AuditLog, User } from "@/lib/types"
import { LoadingOverlay } from "@/components/ui/loading"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

/* ------------------------- API BASE ------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

// Helper function to convert AuthUser to User type for components
function convertAuthUserToUser(authUser: AuthUser, org: Org): User {
  return {
    id: authUser.id,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    name: `${authUser.firstName} ${authUser.lastName}`,
    email: authUser.email,
    role: authUser.role.toLowerCase() as "member" | "scanner" | "admin",
    organization: org,
    createdAt: authUser.createdAt,
    updatedAt: authUser.updatedAt,
  }
}

// Helper function to convert User to AuthUser after API response
function convertUserToAuthUser(user: User, defaultOrgId: number): AuthUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.toUpperCase() as AuthRole,
    organizationId: user.organization?.id || defaultOrgId,
    isActive: true,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  }
}

export default function AdminPage() {
  const { user: authUser, logout } = useAuth()
  const router = useRouter()

  // ------------------------- HOOKS -------------------------
  const [users, setUsers] = useState<AuthUser[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "scanners" | "admins" | "events">("overview")
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: "user" | "event"; id: number; name: string } | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Show notification helper
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Get organizationId safely
  const organizationId = authUser?.organizationId

  // ------------------------- DATA FETCH -------------------------
  useEffect(() => {
    if (!authUser || !organizationId) return
    const fetchData = async () => {
      try {
        const [usersRes, eventsRes, logsRes] = await Promise.all([
          fetch(`${API_BASE}/admins/users`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/events/organization/${organizationId}`, {
            credentials: "include",
          }),
          fetch(`${API_BASE}/admins/audit/logs`, {
            credentials: "include",
          })
        ])

        if (!usersRes.ok || !eventsRes.ok || !logsRes.ok) {
          throw new Error("Failed to fetch admin data: " + [usersRes.status, eventsRes.status, logsRes.status].join(", "))
        }

        const usersData: AuthUser[] = await usersRes.json()
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
  }, [authUser, organizationId])

  // ------------------------- HANDLERS -------------------------
  const handleDeleteUser = async (userId: number) => {
    if (!authUser) {
      showNotification("You must be logged in to perform this action", "error")
      return
    }
    
    setPageLoading(true)
    try {
      const res = await fetch(`${API_BASE}/admins/users/${userId}?actorId=${authUser.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to delete user: ${errorText}`)
      }
      
      setUsers(users.filter(u => u.id !== userId))
      
      // Refresh audit logs
      const logsRes = await fetch(`${API_BASE}/admins/audit/logs`, {
        credentials: "include",
      })
      const logsData: AuditLog[] = await logsRes.json()
      setAuditLogs(logsData)
      
      showNotification("User deleted successfully!", "success")
    } catch (error) {
      console.error("Error deleting user:", error)
      showNotification(error instanceof Error ? error.message : "Failed to delete user", "error")
    } finally {
      setPageLoading(false)
      setDeleteConfirm(null)
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!authUser) {
      showNotification("You must be logged in to perform this action", "error")
      return
    }
    
    setPageLoading(true)
    try {
      console.log('Deleting event ID:', eventId)
      
      // DELETE /api/events/{id} (no actorId - backend doesn't use it for delete)
      const res = await fetch(`${API_BASE}/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      })
      
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to delete event: ${errorText}`)
      }
      
      setEvents(events.filter(e => e.id !== eventId))
      
      // Refresh audit logs
      const logsRes = await fetch(`${API_BASE}/admins/audit/logs`, {
        credentials: "include",
      })
      const logsData: AuditLog[] = await logsRes.json()
      setAuditLogs(logsData)
      
      showNotification("Event deleted successfully!", "success")
    } catch (error) {
      console.error("Error deleting event:", error)
      showNotification(error instanceof Error ? error.message : "Failed to delete event", "error")
    } finally {
      setPageLoading(false)
      setDeleteConfirm(null)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/")
    }
  }

  // Temporary Org object
  const tempOrg: Org = {
    id: authUser?.organizationId ?? 0,
    name: "Organization",
  }

  // Filter users by role
  const members = useMemo(() => users.filter(u => u.role === "MEMBER").map(u => convertAuthUserToUser(u, tempOrg)), [users, tempOrg])
  const scanners = useMemo(() => users.filter(u => u.role === "SCANNER").map(u => convertAuthUserToUser(u, tempOrg)), [users, tempOrg])
  const admins = useMemo(() => users.filter(u => u.role === "ADMIN").map(u => convertAuthUserToUser(u, tempOrg)), [users, tempOrg])

  // ------------------------- EARLY RETURN -------------------------
  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // ------------------------- RENDER -------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Loading Overlay */}
      {pageLoading && <LoadingOverlay message="Processing..." />}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[200] animate-in slide-in-from-top">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-sm border-2 min-w-[300px] ${
              notification.type === "success"
                ? "bg-green-500/90 border-green-400 text-white"
                : "bg-red-500/90 border-red-400 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <p className="flex-1 font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => {
            if (deleteConfirm.type === "user") {
              handleDeleteUser(deleteConfirm.id)
            } else {
              handleDeleteEvent(deleteConfirm.id)
            }
          }}
          title={`Delete ${deleteConfirm.type === "user" ? "User" : "Event"}`}
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          confirmText="Delete"
          isDestructive={true}
          isLoading={pageLoading}
        />
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

        {/* MEMBERS / SCANNERS / ADMINS / EVENTS */}
        {["members", "scanners", "admins"].includes(activeTab) && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <MembersManagement
              members={
                activeTab === "members"
                  ? members
                  : activeTab === "scanners"
                  ? scanners
                  : admins
              }
              org={tempOrg}
              onAddMember={async (m: User) => {
                if (!authUser) {
                  showNotification("You must be logged in to perform this action", "error")
                  return
                }
                
                setPageLoading(true)
                try {
                  // Map User to RegisterUserRequest format expected by backend
                  const requestPayload = {
                    email: m.email,
                    password: "TempPassword123!", // Should be changed by user
                    firstName: m.firstName,
                    lastName: m.lastName,
                    role: m.role.toUpperCase(),
                    organizationId: authUser.organizationId,
                  }
                  
                  console.log('Creating user with actorId:', authUser.id)
                  console.log('Request payload:', requestPayload)
                  
                  const res = await fetch(`${API_BASE}/admins/users?actorId=${authUser.id}`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestPayload),
                  })
                  
                  if (!res.ok) {
                    const errorText = await res.text()
                    throw new Error(`Failed to create user: ${errorText}`)
                  }
                  
                  const newUser: User = await res.json()
                  setUsers(prev => [...prev, convertUserToAuthUser(newUser, authUser.organizationId)])
                  
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/admins/audit/logs`, {
                    credentials: "include",
                  })
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                  
                  showNotification("User created successfully!", "success")
                } catch (error) {
                  console.error("Error adding user:", error)
                  showNotification(error instanceof Error ? error.message : "Failed to create user", "error")
                } finally {
                  setPageLoading(false)
                }
              }}
              onEditMember={async (updated: User) => {
                if (!authUser) {
                  showNotification("You must be logged in to perform this action", "error")
                  return
                }
                
                setPageLoading(true)
                try {
                  // Map User to RegisterUserRequest format expected by backend
                  const requestPayload = {
                    email: updated.email,
                    firstName: updated.firstName,
                    lastName: updated.lastName,
                    role: updated.role.toUpperCase(),
                    organizationId: updated.organization?.id || authUser.organizationId,
                  }
                  
                  console.log('Updating user with actorId:', authUser.id)
                  console.log('User ID to update:', updated.id)
                  console.log('Request payload:', requestPayload)
                  
                  const res = await fetch(`${API_BASE}/admins/users/${updated.id}?actorId=${authUser.id}`, {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestPayload),
                  })
                  
                  if (!res.ok) {
                    const errorText = await res.text()
                    throw new Error(`Failed to update user: ${errorText}`)
                  }
                  
                  const updatedUser: User = await res.json()
                  setUsers(prev => prev.map(u => (u.id === updated.id ? convertUserToAuthUser(updatedUser, authUser.organizationId) : u)))
                  
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/admins/audit/logs`, {
                    credentials: "include",
                  })
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                  
                  showNotification("User updated successfully!", "success")
                } catch (error) {
                  console.error("Error updating user:", error)
                  showNotification(error instanceof Error ? error.message : "Failed to update user", "error")
                } finally {
                  setPageLoading(false)
                }
              }}
              onDeleteMember={async (userId) => {
                const userToDelete = users.find(u => u.id === userId)
                if (userToDelete) {
                  setDeleteConfirm({
                    isOpen: true,
                    type: "user",
                    id: userId,
                    name: `${userToDelete.firstName} ${userToDelete.lastName}`
                  })
                }
              }}
            />
          </section>
        )}

        {activeTab === "events" && (
          <section className="bg-slate-800/50 rounded-xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <EventsManagement
              events={events}
              org={tempOrg}
              onAddEvent={async (e: Event) => {
                if (!authUser) {
                  showNotification("You must be logged in to perform this action", "error")
                  return
                }
                
                setPageLoading(true)
                try {
                  // Ensure organization is included in the event payload
                  const eventPayload = {
                    ...e,
                    organization: {
                      id: authUser.organizationId,
                    },
                  }
                  
                  console.log('Creating event')
                  console.log('Event payload:', eventPayload)
                  
                  // POST /api/events (no actorId - backend doesn't use it for create)
                  const res = await fetch(`${API_BASE}/events`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(eventPayload),
                  })
                  
                  if (!res.ok) {
                    const errorText = await res.text()
                    throw new Error(`Failed to create event: ${errorText}`)
                  }
                  
                  const newEvent: Event = await res.json()
                  setEvents(prev => [...prev, newEvent])
                  
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/admins/audit/logs`, {
                    credentials: "include",
                  })
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                  
                  showNotification("Event created successfully!", "success")
                } catch (error) {
                  console.error("Error adding event:", error)
                  showNotification(error instanceof Error ? error.message : "Failed to create event", "error")
                } finally {
                  setPageLoading(false)
                }
              }}
              onEditEvent={async (updated: Event) => {
                if (!authUser) {
                  showNotification("You must be logged in to perform this action", "error")
                  return
                }
                
                setPageLoading(true)
                try {
                  // Map Event to EventRequest format expected by backend
                  const requestPayload = {
                    title: updated.eventName,
                    description: updated.eventDescription || "",
                    eventType: updated.eventType || "",
                    venue: updated.venueName || "",
                    eventDate: updated.scheduledAt || null,
                    organizationId: updated.organization?.id || authUser.organizationId,
                  }
                  
                  console.log('Updating event with actorId:', authUser.id)
                  console.log('Event ID to update:', updated.id)
                  console.log('Request payload:', requestPayload)
                  
                  // PUT /api/events/{id}?actorId={actorId}
                  const res = await fetch(`${API_BASE}/events/${updated.id}?actorId=${authUser.id}`, {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestPayload),
                  })
                  
                  if (!res.ok) {
                    const errorText = await res.text()
                    throw new Error(`Failed to update event: ${errorText}`)
                  }
                  
                  const updatedEventData: Event = await res.json()
                  setEvents(prev => prev.map(ev => (ev.id === updated.id ? updatedEventData : ev)))
                  
                  // Refresh audit logs
                  const logsRes = await fetch(`${API_BASE}/admins/audit/logs`, {
                    credentials: "include",
                  })
                  const logsData: AuditLog[] = await logsRes.json()
                  setAuditLogs(logsData)
                  
                  showNotification("Event updated successfully!", "success")
                } catch (error) {
                  console.error("Error updating event:", error)
                  showNotification(error instanceof Error ? error.message : "Failed to update event", "error")
                } finally {
                  setPageLoading(false)
                }
              }}
              onDeleteEvent={async (eventId) => {
                const eventToDelete = events.find(e => e.id === eventId)
                if (eventToDelete) {
                  setDeleteConfirm({
                    isOpen: true,
                    type: "event",
                    id: eventId,
                    name: eventToDelete.eventName
                  })
                }
              }}
            />
          </section>
        )}
      </main>
    </div>
  )
}
