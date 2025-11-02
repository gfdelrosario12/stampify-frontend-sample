"use client"

import { useState } from "react"
import { X, Mail, User, Shield } from "lucide-react"

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (memberData: {
    name: string
    email: string
    role: string
  }) => void
}

export function AddMemberModal({ isOpen, onClose, onSubmit }: AddMemberModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return

    onSubmit({ name, email, role })

    setName("")
    setEmail("")
    setRole("member")

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200]">
      <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-6 w-full max-w-lg shadow-xl animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Add New Member</h3>
          <button onClick={onClose} className="text-purple-300 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          
          {/* Name */}
          <div>
            <label className="text-sm text-purple-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={name}
                placeholder="Ex: Juan Dela Cruz"
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/70 border border-purple-500/20 text-white placeholder-purple-400/40 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-purple-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="email"
                value={email}
                placeholder="example@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/70 border border-purple-500/20 text-white placeholder-purple-400/40 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-sm text-purple-300">Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/70 border border-purple-500/20 text-purple-200 focus:ring-2 focus:ring-purple-500"
              >
                <option value="member">Member</option>
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 text-purple-200 hover:bg-slate-600 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition shadow-lg"
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  )
}
