"use client"

import { useState, useEffect, useRef } from "react"
import { Camera, QrCode, AlertCircle, CheckCircle, CameraOff, Upload, RefreshCw } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"

interface QRScannerInterfaceProps {
  onScan: (data: { memberId: string; memberName: string }) => void
  currentEvent: { id: string; name: string }
}

export function QRScannerInterface({ onScan, currentEvent }: QRScannerInterfaceProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [cameras, setCameras] = useState<any[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrCodeRegionId = "qr-reader"

  // Get available cameras
  useEffect(() => {
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices)
        setSelectedCameraId(devices[0].id)
      }
    }).catch(err => {
      console.error("Error getting cameras:", err)
    })
  }, [])

  // Start camera scanning
  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Initialize scanner if not already done
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(qrCodeRegionId)
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }

      const cameraId = selectedCameraId || { facingMode: "environment" }

      await scannerRef.current.start(
        cameraId,
        config,
        onScanSuccess,
        onScanFailure
      )
    } catch (err: any) {
      console.error("Error starting scanner:", err)
      setError("Failed to access camera. Please check permissions.")
      setIsScanning(false)
    }
  }

  // Stop camera scanning
  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
      } catch (err) {
        console.error("Error stopping scanner:", err)
      }
    }
  }

  // Change camera
  const changeCamera = async () => {
    if (!cameras.length) return
    
    // Find next camera
    const currentIndex = cameras.findIndex(cam => cam.id === selectedCameraId)
    const nextIndex = (currentIndex + 1) % cameras.length
    const nextCamera = cameras[nextIndex]
    
    setSelectedCameraId(nextCamera.id)
    
    // Restart scanning with new camera
    if (isScanning) {
      await stopScanning()
      // Wait a bit before restarting
      setTimeout(() => {
        setSelectedCameraId(nextCamera.id)
        startScanning()
      }, 500)
    }
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(qrCodeRegionId)
      }

      const result = await scannerRef.current.scanFile(file, true)
      console.log("File scan result:", result)
      
      if (result) {
        onScanSuccess(result, null)
      }
    } catch (err: any) {
      console.error("Error scanning file:", err)
      setError("Failed to scan QR code from image. Please try another image.")
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle successful QR code scan
  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    console.log("QR Code scanned:", decodedText)
    
    // Prevent duplicate scans
    if (decodedText === lastScan) {
      return
    }
    
    setLastScan(decodedText)
    
    try {
      // Parse the QR code data
      // Expected formats: "MEMBER_ID:3", "3", or just the member ID
      let memberId = decodedText.trim()
      
      // Extract member ID if it has a prefix
      if (memberId.includes('MEMBER_ID:')) {
        memberId = memberId.split('MEMBER_ID:')[1].trim()
      } else if (memberId.includes(':')) {
        // Handle any other colon-separated format
        memberId = memberId.split(':').pop()?.trim() || ''
      }
      
      if (!memberId || isNaN(Number(memberId))) {
        setError("Invalid QR code format. Expected member ID number.")
        setTimeout(() => setError(null), 3000)
        return
      }

      // Show success message temporarily
      setSuccess(`Scanned member ID: ${memberId}`)
      
      // Call the onScan callback with member data - this triggers the stamp creation
      await onScan({
        memberId,
        memberName: `Member ${memberId}` // Backend will resolve actual name
      })

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccess(null)
        setLastScan(null)
      }, 2000)

    } catch (err: any) {
      console.error("Error processing scan:", err)
      setError(err.message || "Failed to process scan")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle scan failure (called frequently, so we don't log)
  const onScanFailure = (error: string) => {
    // Ignore - this is called continuously when no QR code is detected
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [isScanning])

  return (
    <div className="space-y-4">
      {/* Scanner Display */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <div id={qrCodeRegionId} className="w-full min-h-[300px]"></div>
        
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
            <div className="text-center p-6">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <p className="text-white text-sm mb-4">Ready to scan QR codes</p>
              <p className="text-purple-300 text-xs">Camera access required</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-y-2">
        {!isScanning ? (
          <>
            <button
              onClick={startScanning}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Start Camera
            </button>
            
            {/* File Upload Alternative */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="qr-file-upload"
              />
              <label
                htmlFor="qr-file-upload"
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                Upload QR Code Image
              </label>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={stopScanning}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <CameraOff className="w-5 h-5" />
              Stop Camera
            </button>
            
            {cameras.length > 1 && (
              <button
                onClick={changeCamera}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Switch Camera
              </button>
            )}
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-purple-300">
            Current Event: <span className="font-semibold text-white">{currentEvent.name}</span>
          </p>
          {cameras.length > 1 && (
            <p className="text-xs text-purple-400 mt-1">
              {cameras.length} cameras available
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
