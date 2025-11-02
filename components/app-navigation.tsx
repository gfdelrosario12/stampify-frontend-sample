"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface AppNavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function AppNavigation({ currentPage, onNavigate }: AppNavigationProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) {
    return null
  }

  const navItems = {
    member: [{ id: "member", label: "Passport" }],
    scanner: [{ id: "scanner", label: "Check-in" }],
    admin: [
      { id: "admin", label: "Dashboard" },
      { id: "members", label: "Members" },
    ],
  }

  const items = navItems[user.role as keyof typeof navItems] || []

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-primary">
            STAMP<span className="text-accent">i</span>FY
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex gap-2 border-t border-border pt-3">
          {items.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </header>
  )
}
