"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { Zap, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginModal({
  isOpen,
  onClose,
  isRegister,
  onToggleMode
}: {
  isOpen: boolean
  onClose: () => void
  isRegister: boolean
  onToggleMode: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (isRegister) {
        router.push("/register")
        return
      }

      const success = await login(email, password)
      if (!success) {
        setError("Invalid credentials")
        return
      }

      const lower = email.toLowerCase()

      if (lower === "member@stampify.com") router.push("/member")
      else if (lower === "scanner@stampify.com") router.push("/scanner")
      else if (lower === "admin@stampify.com") router.push("/admin")
      else router.push("/dashboard")

    } catch (e) {
      setError("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-md w-full p-8 relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">
            STAMP<span className="text-pink-400">i</span>FY
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div className="space-y-2">
              <label className="text-sm">Full Name</label>
              <Input
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-800 border border-purple-500/30"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800 border border-purple-500/30"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800 border border-purple-500/30"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {!isRegister && (
          <div className="mt-6 text-xs text-gray-400 border-t border-purple-500/20 pt-4">
            <p>👤 Member: member@stampify.com</p>
            <p>📱 Scanner: scanner@stampify.com</p>
            <p>⚙️ Admin: admin@stampify.com</p>
            <p>Password: password123</p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            onClick={onToggleMode}
            className="text-purple-400 font-semibold"
          >
            {isRegister ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}
