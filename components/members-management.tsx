"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import type { User, Role, Org } from "@/lib/types"
import { Trash2, Edit2, Plus, Search, X } from "lucide-react"
import { AddMemberModal } from "./member-add-modal"

interface MembersManagementProps {
  members: User[]
  org: { id: number; name: string }
  onAddMember: (member: User) => Promise<void>
  onEditMember: (member: User) => Promise<void>
  onDeleteMember: (memberId: number) => Promise<void>
}

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

export function MembersManagement({ members, org, onAddMember, onEditMember, onDeleteMember }: MembersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "joined">("name")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<User | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"member" | "scanner" | "admin">("member")
  const [loading, setLoading] = useState(false)

  const filteredMembers = members
    .filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return b.id - a.id
    })

  const handleAddMember = (data: { name: string; email: string; role: string }) => {
    if (!onAddMember) return

    const newMember: User = {
      id: Date.now(),
      firstName: data.name.split(' ')[0] || '',
      lastName: data.name.split(' ').slice(1).join(' ') || '',
      name: data.name,
      email: data.email,
      role: data.role as Role,
      organization: org,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onAddMember(newMember)
  }

  const handleOpenAdd = () => {
    setEditingMember(null)
    setFirstName("")
    setLastName("")
    setEmail("")
    setRole("member")
    setShowModal(true)
  }

  const handleOpenEdit = async (userId: number) => {
    setLoading(true)
    try {
      // Fetch user data from the dedicated edit endpoint
      const res = await fetch(`${API_BASE}/admins/users/${userId}/edit`, {
        credentials: "include",
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Failed to fetch user for edit: ${errorText}`)
      }

      const userDTO = await res.json()

      // Map UserDTO to User format and set editing state
      const userForEdit: User = {
        id: userDTO.id,
        firstName: userDTO.firstName,
        lastName: userDTO.lastName,
        name: `${userDTO.firstName} ${userDTO.lastName}`,
        email: userDTO.email,
        role: userDTO.role.toLowerCase() as "member" | "scanner" | "admin",
        organization: org,
      }

      setEditingMember(userForEdit)
      setFirstName(userDTO.firstName)
      setLastName(userDTO.lastName)
      setEmail(userDTO.email)
      setRole(userDTO.role.toLowerCase() as "member" | "scanner" | "admin")
      setShowModal(true)
    } catch (error) {
      console.error("Error fetching user for edit:", error)
      alert(`Failed to load user data: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("Please fill in all required fields")
      return
    }

    // For add mode, validate email and role
    if (!editingMember && (!email.trim() || !role)) {
      alert("Please fill in all required fields")
      return
    }

    const memberData: User = {
      id: editingMember?.id || 0,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: editingMember?.email || email.trim(), // Use existing email for edit
      role: editingMember?.role || role, // Use existing role for edit
      organization: org,
    }

    try {
      if (editingMember) {
        await onEditMember(memberData)
      } else {
        await onAddMember(memberData)
      }
      setShowModal(false)
    } catch (error) {
      console.error("Error submitting member:", error)
    }
  }

  return (
    <>
      {/* ✅ Add Member Modal */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddMember}
      />

      <div className="bg-slate-800/50 rounded-xl border border-purple-500/20 backdrop-blur-md shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-white flex items-center gap-2">
              Members Management
            </h3>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>

          {/* Search + Sort */}
          <div className="flex gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900/60 border border-purple-500/20 text-white placeholder-purple-300/50 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "joined")}
              className="px-4 py-2 rounded-lg bg-slate-900/60 border border-purple-500/20 text-purple-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value="name">Sort by Name</option>
              <option value="joined">Sort by Joined</option>
            </select>
          </div>
        </div>

        {/* Members List */}
        <div className="divide-y divide-purple-500/10">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-purple-300">
              <p>No members found</p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 flex items-center justify-between bg-slate-900/40 hover:bg-purple-500/10 transition-all"
              >
                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{member.name}</p>
                  <p className="text-sm text-purple-300">{member.email}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-600/20 text-purple-300 capitalize">
                    {member.role}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(member.id)}
                    disabled={loading}
                    className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-300 border-t-transparent"></div>
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteMember?.(Number(member.id))}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-md border border-purple-500/30 shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {editingMember ? "Edit Member" : "Add Member"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
        
              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Email - Disabled in edit mode */}
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  disabled={!!editingMember}
                  className={`w-full px-4 py-2.5 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    editingMember ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
                {editingMember && (
                  <p className="text-xs text-purple-300 mt-1">Email cannot be changed</p>
                )}
              </div>

              {/* Role - Disabled in edit mode */}
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  Role <span className="text-red-400">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "member" | "scanner" | "admin")}
                  disabled={!!editingMember}
                  className={`w-full px-4 py-2.5 bg-slate-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 capitalize ${
                    editingMember ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="member">Member</option>
                  <option value="scanner">Scanner</option>
                  <option value="admin">Admin</option>
                </select>
                {editingMember && (
                  <p className="text-xs text-purple-300 mt-1">Role cannot be changed</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-purple-500/20 flex gap-3 bg-slate-900 rounded-b-xl">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Loading...
                  </>
                ) : (
                  editingMember ? "Update Member" : "Add Member"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
