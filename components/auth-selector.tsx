"use client"

import { useState, useEffect } from "react"
import type { User, Org } from "@/lib/types"
import { StampifyLogo } from "./stampify-logo"
import { LogIn, Loader2 } from "lucide-react"

interface AuthSelectorProps {
  onSelectUser: (user: User, org: Org) => void
}

export function AuthSelector({ onSelectUser }: AuthSelectorProps) {
  const [users, setUsers] = useState<User[]>([])
  const [organizations, setOrganizations] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, orgsRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/organizations"),
        ])

        const usersData: User[] = await usersRes.json()
        const orgsData: Org[] = await orgsRes.json()

        setUsers(usersData)
        setOrganizations(orgsData)

        // Set defaults
        if (usersData.length > 0) setSelectedRole(usersData[0].id.toString())
        if (orgsData.length > 0) setSelectedOrg(orgsData[0].id)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogin = () => {
    const user = users.find((u) => u.id.toString() === selectedRole)
    const org = organizations.find((o) => o.id === selectedOrg)
    if (user && org) {
      onSelectUser(user, org)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <StampifyLogo className="text-4xl justify-center mb-4" />
          <h1 className="text-3xl font-bold mb-2">
            Welcome to <span className="text-accent">STAMPiFY</span>
          </h1>
          <p className="text-muted-foreground">
            Digital Passport and Membership ID System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-xl border border-border p-8 shadow-lg space-y-6">
          {/* Organization Selector */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Select Organization
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => setSelectedOrg(org.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      selectedOrg === org.id
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <p className="font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {org.logo || "Organization"} • Multi-tenant demo
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-sm font-semibold mb-3">Select User</label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedRole(user.id.toString())}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      selectedRole === user.id.toString()
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role} • {user.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading || !selectedRole || !selectedOrg}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? "Loading..." : "Enter Dashboard"}
          </button>

          {/* Demo Info */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              This is a demo interface. Choose any user to explore their
              role-specific dashboard.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>Multi-tenant demo • Member • Scanner • Admin roles included</p>
        </div>
      </div>
    </div>
  )
}
