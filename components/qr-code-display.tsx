"use client"

import { useEffect, useRef } from "react"

interface QRCodeDisplayProps {
  value: string
  size?: number
  className?: string
}

export function QRCodeDisplay({ value, size = 200, className = "" }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Simple QR code placeholder using canvas pattern
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = "#000000"

    // Create a simple hash-based pattern for the QR code
    const hash = value.split("").reduce((h, c) => h + c.charCodeAt(0), 0)
    const random = ((hash * 9301 + 49297) % 233280) / 233280

    const moduleCount = 21
    const moduleSize = size / moduleCount

    for (let i = 0; i < moduleCount; i++) {
      for (let j = 0; j < moduleCount; j++) {
        const rnd = Math.sin(i * j * random) > 0
        if (rnd) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }, [value, size])

  return (
    <canvas ref={canvasRef} width={size} height={size} className={`border border-border rounded-lg ${className}`} />
  )
}
