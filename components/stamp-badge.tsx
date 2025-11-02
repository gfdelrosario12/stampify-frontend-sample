"use client"

import type { Stamp } from "@/lib/types"

interface StampBadgeProps {
  stamp: Stamp
}

export function StampBadge({ stamp }: StampBadgeProps) {
  const date = new Date(stamp.eventDate)
  const month = date.toLocaleDateString("en-US", { month: "short" })
  const day = date.getDate()

  return (
    <div className="relative group">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 cursor-pointer">
        <div className="text-center">
          <p className="text-xs font-bold text-white">{month}</p>
          <p className="text-xl font-bold text-white">{day}</p>
        </div>
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
        {stamp.eventName}
      </div>
    </div>
  )
}
