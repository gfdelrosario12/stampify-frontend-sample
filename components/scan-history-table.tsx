"use client"

import { Clock, CheckCircle } from "lucide-react"

interface ScanRecord {
  id: string
  memberName: string
  memberId: string
  timestamp: Date
  eventName: string
  status: "success" | "pending"
}

interface ScanHistoryTableProps {
  scans: ScanRecord[]
}

export function ScanHistoryTable({ scans }: ScanHistoryTableProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Member</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Event</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {scans.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No scans yet
                </td>
              </tr>
            ) : (
              scans.map((scan) => (
                <tr key={scan.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-sm">{scan.memberName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{scan.memberId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{scan.eventName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {scan.timestamp.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Scanned</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
