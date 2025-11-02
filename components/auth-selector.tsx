"use client"

import { useState } from "react"
import type { User } from "@/lib/types"
import { mockUsers, organizations } from "@/lib/mock-data"
import { StampifyLogo } from "./stampify-logo"
import { LogIn } from "lucide-react"

interface AuthSelectorProps {
  onSelectUser: (user: User, org: string) => void
}

export function AuthSelector({ onSelectUser }: AuthSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<string>("member-1")
  const [selectedOrg, setSelectedOrg] = useState<string>("tech-events")

  const handleLogin = () => {
    const user = mockUsers[selectedRole]
    onSelectUser(user, selectedOrg)
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
          <p className="text-muted-foreground">Digital Passport and Membership ID System</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-xl border border-border p-8 shadow-lg space-y-6">
          {/* Organization Selector */}
          <div>
            <label className="block text-sm font-semibold mb-3">Select Organization</label>
            <div className="space-y-2">
              {Object.entries(organizations).map(([key, org]) => (
                <button
                  key={key}
                  onClick={() => setSelectedOrg(key)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedOrg === key ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                  }`}
                >
                  <p className="font-medium">{org.name}</p>
                  <p className="text-xs text-muted-foreground">{org.logo} Multi-tenant demo</p>
                </button>
              ))}
            </div>
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-sm font-semibold mb-3">Select Role</label>
            <div className="space-y-2">
              {Object.entries(mockUsers).map(([key, user]) => (
                <button
                  key={key}
                  onClick={() => setSelectedRole(key)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    selectedRole === key ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role} • {user.email}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Enter Dashboard
          </button>

          {/* Demo Info */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground text-center">
              This is a demo interface. Choose any user to explore their role-specific dashboard.
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
