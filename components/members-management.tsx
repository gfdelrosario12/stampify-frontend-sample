"use client"

import { useState } from "react"
import type { User, Role } from "@/lib/types"
import { Trash2, Edit2, Plus, Search } from "lucide-react"
import { AddMemberModal } from "./member-add-modal"

interface MembersManagementProps {
  members: User[]
  onAddMember?: (member: User) => void
  onEditMember?: (member: User) => void
  onDeleteMember?: (memberId: string) => void
}

export function MembersManagement({ members, onAddMember, onEditMember, onDeleteMember }: MembersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "joined">("name")
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredMembers = members
    .filter((m) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return b.id.localeCompare(a.id)
    })

  const handleAddMember = (data: { name: string; email: string; role: string }) => {
    if (!onAddMember) return

    const newMember: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      role: data.role as Role,
      organization: "acme-corp"
    }

    onAddMember(newMember)
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
                    onClick={() => onEditMember?.(member)}
                    className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteMember?.(member.id)}
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
    </>
  )
}
