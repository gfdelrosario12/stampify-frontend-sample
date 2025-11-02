"use client"

import { useState } from "react"
import { QrCode } from "lucide-react"

interface QRScannerInterfaceProps {
  onScan: (memberData: any) => void
  currentEvent: { id: string; name: string }
}

export function QRScannerInterface({ onScan, currentEvent }: QRScannerInterfaceProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<any>(null)
  const [scanMessage, setScanMessage] = useState("")

  const handleSimulateScan = () => {
    setIsScanning(true)
    setScanMessage("Scanning...")

    // Simulate scanning delay
    setTimeout(() => {
      const memberNames = ["Alex Johnson", "Sam Chen", "Jordan Smith", "Casey Lee", "Morgan Taylor"]
      const randomMember = memberNames[Math.floor(Math.random() * memberNames.length)]
      const memberId = `MEM-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(5, "0")}`

      const scanData = {
        id: `scan-${Date.now()}`,
        memberName: randomMember,
        memberId,
        timestamp: new Date(),
        eventName: currentEvent.name,
        status: "success",
      }

      setLastScanResult(scanData)
      setScanMessage(`✓ ${randomMember} checked in`)
      onScan(scanData)
      setIsScanning(false)

      // Clear message after 3 seconds
      setTimeout(() => setScanMessage(""), 3000)
    }, 1000)
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Scanner Area */}
      <div className="relative w-full max-w-sm aspect-square rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

        {isScanning ? (
          <div className="relative flex flex-col items-center justify-center space-y-4">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-lg border-2 border-transparent border-t-primary border-r-primary animate-spin" />
              <QrCode className="w-24 h-24 text-primary/50 absolute inset-0" />
            </div>
            <p className="text-sm font-medium text-primary animate-pulse">Scanning...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <QrCode className="w-20 h-20 text-primary/60" />
            <p className="text-sm font-medium text-foreground">Ready to scan</p>
            <p className="text-xs text-muted-foreground">Position QR code in frame</p>
          </div>
        )}

        {/* Animated scan lines */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
          </div>
        )}
      </div>

      {/* Scan Button */}
      <button
        onClick={handleSimulateScan}
        disabled={isScanning}
        className={`px-8 py-3 rounded-lg font-semibold transition-all ${
          isScanning
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:opacity-90"
        }`}
      >
        {isScanning ? "Scanning..." : "Simulate Scan"}
      </button>

      {/* Status Message */}
      {scanMessage && (
        <div
          className={`w-full max-w-sm p-4 rounded-lg text-center font-medium transition-all animate-in fade-in ${
            scanMessage.includes("✓")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
          }`}
        >
          {scanMessage}
        </div>
      )}

      {/* Event Info */}
      <div className="w-full max-w-sm p-4 bg-card border border-border rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Current Event</p>
        <p className="font-semibold">{currentEvent.name}</p>
      </div>
    </div>
  )
}
