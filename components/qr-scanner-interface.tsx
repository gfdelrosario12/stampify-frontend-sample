"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, X, Scan, AlertCircle, Upload, Image as ImageIcon } from "lucide-react"
import jsQR from "jsqr"

interface QRScannerInterfaceProps {
  onScan: (data: { memberId: string; memberName: string }) => void
  currentEvent: { id: string; name: string }
}

export function QRScannerInterface({ onScan, currentEvent }: QRScannerInterfaceProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>("")
  const [showCameraSelector, setShowCameraSelector] = useState(false)
  const [scanMode, setScanMode] = useState<"auto" | "manual">("auto")
  const [qrDetected, setQrDetected] = useState(false)
  const [qrCorners, setQrCorners] = useState<{x: number, y: number}[] | null>(null)
  const [scanHelperMessage, setScanHelperMessage] = useState<string>("Position QR code within frame")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processingUpload, setProcessingUpload] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Enumerate available cameras
  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      console.log('📷 Available cameras:', videoDevices)
      setCameras(videoDevices)
      
      // Auto-select back camera on mobile if available
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )
      
      if (backCamera) {
        setSelectedCameraId(backCamera.deviceId)
      } else if (videoDevices.length > 0) {
        setSelectedCameraId(videoDevices[0].deviceId)
      }
    } catch (err) {
      console.error('Failed to enumerate cameras:', err)
    }
  }

  // Initialize camera list on mount
  useEffect(() => {
    enumerateCameras()
  }, [])

  // Cleanup function to stop camera
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  // QR Code scanning function
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode)
      return
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data and scan for QR code
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    })

    if (code && code.data) {
      console.log('🔍 QR Code detected:', code.data)
      
      // Show QR code corners for visual feedback
      setQrCorners([
        code.location.topLeftCorner,
        code.location.topRightCorner,
        code.location.bottomRightCorner,
        code.location.bottomLeftCorner
      ])
      setQrDetected(true)
      setScanHelperMessage("✓ QR Code Detected!")
      
      // In auto mode, scan immediately
      if (scanMode === "auto") {
        // Prevent duplicate scans
        if (code.data === lastScannedCode) {
          animationFrameRef.current = requestAnimationFrame(scanQRCode)
          return
        }

        processQRCode(code.data)
        return
      }
    } else {
      // No QR code detected - provide helpful guidance
      setQrDetected(false)
      setQrCorners(null)
      
      // Calculate brightness to give feedback
      const brightness = calculateBrightness(imageData)
      
      if (brightness < 50) {
        setScanHelperMessage("⚠ Too dark - Add more light")
      } else if (brightness > 200) {
        setScanHelperMessage("⚠ Too bright - Reduce light")
      } else {
        setScanHelperMessage("Position QR code within frame")
      }
    }

    // Continue scanning
    animationFrameRef.current = requestAnimationFrame(scanQRCode)
  }

  // Calculate average brightness of image
  const calculateBrightness = (imageData: ImageData): number => {
    let sum = 0
    const data = imageData.data
    const sampleSize = 1000 // Sample every 1000 pixels for performance
    
    for (let i = 0; i < data.length; i += 4 * sampleSize) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      sum += (r + g + b) / 3
    }
    
    return sum / (data.length / (4 * sampleSize))
  }

  // Process QR code data
  const processQRCode = (qrData: string) => {
    setLastScannedCode(qrData)
    
    // Parse QR code data
    let memberId: string
    let memberName: string

    try {
      // Try parsing as JSON first
      const jsonData = JSON.parse(qrData)
      memberId = jsonData.id || jsonData.memberId || jsonData.userId || String(jsonData)
      memberName = jsonData.name || jsonData.memberName || `Member ${memberId}`
    } catch {
      // If not JSON, try simple formats
      if (qrData.includes(':')) {
        const parts = qrData.split(':')
        memberId = parts[1] || parts[0]
        memberName = `Member ${memberId}`
      } else {
        // Assume it's just the ID
        memberId = qrData
        memberName = `Member ${memberId}`
      }
    }

    console.log('✅ Parsed Member ID:', memberId)
    console.log('✅ Member Name:', memberName)

    // Stop scanning and call parent handler
    setIsScanning(false)
    stopCamera()
    onScan({ memberId, memberName })

    // Reset last scanned code after 3 seconds
    setTimeout(() => setLastScannedCode(null), 3000)
  }

  // Manual snap function
  const handleManualSnap = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      setScanHelperMessage("⚠ Camera not ready")
      return
    }

    // Force a single scan
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth", // Try harder in manual mode
    })

    if (code && code.data) {
      console.log('📸 Manual snap successful:', code.data)
      processQRCode(code.data)
    } else {
      setScanHelperMessage("❌ No QR code found - Try again")
      // Visual feedback
      setTimeout(() => {
        setScanHelperMessage("Position QR code and tap Snap")
      }, 2000)
    }
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Please upload an image file (JPG, PNG, etc.)')
      return
    }

    console.log('📁 File uploaded:', file.name, file.type, file.size)
    setProcessingUpload(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      console.log('✅ File loaded, processing image...')
      setUploadedImage(imageDataUrl)
      
      // Process the uploaded image
      processUploadedImage(imageDataUrl)
    }
    reader.onerror = () => {
      console.error('❌ Failed to read file')
      alert('Failed to read file. Please try again.')
      setProcessingUpload(false)
    }
    reader.readAsDataURL(file)

    // Reset file input for re-upload
    event.target.value = ''
  }

  // Process uploaded image for QR code
  const processUploadedImage = (imageDataUrl: string) => {
    console.log('🔍 Processing uploaded image for QR code...')
    
    const img = new Image()
    img.onload = () => {
      // Create a temporary canvas for this operation
      const tempCanvas = document.createElement('canvas')
      const ctx = tempCanvas.getContext('2d')
      
      if (!ctx) {
        console.error('❌ Canvas context not available')
        alert('Browser error: Canvas not supported')
        setProcessingUpload(false)
        setUploadedImage(null)
        return
      }

      // Set canvas size to image size
      tempCanvas.width = img.width
      tempCanvas.height = img.height

      console.log(`📐 Canvas size: ${tempCanvas.width}x${tempCanvas.height}`)

      // Draw image to canvas
      ctx.drawImage(img, 0, 0)

      // Scan for QR code
      const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      console.log('🔍 Scanning image data...')
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      })

      setProcessingUpload(false)

      if (code && code.data) {
        console.log('✅ QR code found in uploaded image:', code.data)
        console.log('📍 QR location:', code.location)
        
        // Clear uploaded image preview
        setTimeout(() => setUploadedImage(null), 500)
        
        // Process the QR code
        processQRCode(code.data)
      } else {
        console.log('❌ No QR code found in uploaded image')
        alert('❌ No QR code detected in the uploaded image.\n\nPlease ensure:\n• The image contains a visible QR code\n• The QR code is clear and not blurry\n• Try another image or use the camera')
        setUploadedImage(null)
      }
    }

    img.onerror = () => {
      console.error('❌ Failed to load image')
      alert('Failed to load image. Please try again with a different file.')
      setUploadedImage(null)
      setProcessingUpload(false)
    }

    img.src = imageDataUrl
  }

  // Trigger file input
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Start camera
  const startCamera = async () => {
    try {
      setError(null)
      setIsScanning(true)

      // Build constraints based on selected camera
      const constraints: MediaStreamConstraints = {
        video: selectedCameraId 
          ? { 
              deviceId: { exact: selectedCameraId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          : { 
              facingMode: "environment", // Use back camera on mobile
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
      }

      console.log('📷 Starting camera with constraints:', constraints)

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        
        // Start scanning
        scanQRCode()
      }

      // Refresh camera list after permission granted
      await enumerateCameras()
    } catch (err) {
      console.error('Camera access error:', err)
      setError(err instanceof Error ? err.message : 'Failed to access camera')
      setIsScanning(false)
    }
  }

  // Handle stop scanning
  const handleStopScanning = () => {
    setIsScanning(false)
    stopCamera()
  }

  // Handle camera change
  const handleCameraChange = async (cameraId: string) => {
    setSelectedCameraId(cameraId)
    setShowCameraSelector(false)
    
    // If already scanning, restart with new camera
    if (isScanning) {
      stopCamera()
      // Wait a bit for cleanup
      setTimeout(() => {
        startCamera()
      }, 300)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <div className="space-y-4">
          {/* Scan Mode Toggle */}
          <div className="flex gap-2 bg-slate-700 p-1 rounded-lg">
            <button
              onClick={() => setScanMode("auto")}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                scanMode === "auto"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              Auto Scan
            </button>
            <button
              onClick={() => setScanMode("manual")}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                scanMode === "manual"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              Manual Snap
            </button>
          </div>          <button
            onClick={startCamera}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-medium shadow-lg"
          >
            <Camera className="w-5 h-5" />
            Start Scanning
          </button>

          {/* OR Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-800 px-2 text-purple-300">or</span>
            </div>
          </div>

          {/* File Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={handleUploadClick}
              disabled={processingUpload}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
            >
              {processingUpload ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Processing Image...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload QR Image
                </>
              )}
            </button>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Scan className="w-5 h-5 text-purple-400 mt-0.5" />
              <div className="text-sm text-purple-200">
                <p className="font-medium mb-1">Ready to scan</p>
                <p className="text-xs opacity-75">
                  {scanMode === "auto" 
                    ? "Camera will automatically detect and scan QR codes" 
                    : "Position QR code and tap the Snap button to capture"}
                </p>
                <p className="text-xs opacity-75 mt-2 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  You can also upload an image containing a QR code
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div className="text-sm text-red-200">
                  <p className="font-medium mb-1">Camera Error</p>
                  <p className="text-xs opacity-75">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Camera Selector - Before Starting */}
          {cameras.length > 1 && !isScanning && (
            <div className="space-y-2">
              <label className="block text-xs text-purple-300 font-medium">Select Camera:</label>
              <div className="bg-slate-700 rounded-lg p-2 space-y-1">
                {cameras.map((camera, index) => (
                  <button
                    key={camera.deviceId}
                    onClick={() => setSelectedCameraId(camera.deviceId)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                      selectedCameraId === camera.deviceId
                        ? "bg-purple-600 text-white"
                        : "hover:bg-slate-600 text-purple-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>{camera.label || `Camera ${index + 1}`}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-center text-xs text-purple-300">
            <p>Current Event: <span className="font-semibold text-white">{currentEvent.name}</span></p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Camera Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* QR Code Tracking Overlay */}
            {qrDetected && qrCorners && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.8 }} />
                  </linearGradient>
                </defs>
                <polygon
                  points={qrCorners.map(corner => 
                    `${(corner.x / (canvasRef.current?.width || 1)) * (videoRef.current?.offsetWidth || 1)},${(corner.y / (canvasRef.current?.height || 1)) * (videoRef.current?.offsetHeight || 1)}`
                  ).join(' ')}
                  fill="url(#qrGradient)"
                  stroke="#22c55e"
                  strokeWidth="3"
                  opacity="0.4"
                />
                {qrCorners.map((corner, i) => (
                  <circle
                    key={i}
                    cx={(corner.x / (canvasRef.current?.width || 1)) * (videoRef.current?.offsetWidth || 1)}
                    cy={(corner.y / (canvasRef.current?.height || 1)) * (videoRef.current?.offsetHeight || 1)}
                    r="8"
                    fill="#22c55e"
                    stroke="white"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            )}
            
            {/* Scanning Frame Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`border-4 rounded-lg w-64 h-64 relative transition-all duration-300 ${
                qrDetected ? 'border-green-400 scale-105' : 'border-white/50 animate-pulse'
              }`}>
                <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 transition-colors ${
                  qrDetected ? 'border-green-400' : 'border-white'
                }`}></div>
                <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 transition-colors ${
                  qrDetected ? 'border-green-400' : 'border-white'
                }`}></div>
                <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 transition-colors ${
                  qrDetected ? 'border-green-400' : 'border-white'
                }`}></div>
                <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 transition-colors ${
                  qrDetected ? 'border-green-400' : 'border-white'
                }`}></div>
              </div>
            </div>

            {/* Helper Message */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full max-w-[90%]">
              <p className={`text-sm font-medium flex items-center gap-2 transition-colors ${
                qrDetected ? 'text-green-400' : 'text-white'
              }`}>
                <Scan className={`w-4 h-4 ${scanMode === 'auto' && !qrDetected ? 'animate-pulse' : ''}`} />
                {scanHelperMessage}
              </p>
            </div>
          </div>

          {/* Manual Snap Button (Manual Mode Only) */}
          {scanMode === "manual" && (
            <button
              onClick={handleManualSnap}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-4 rounded-lg flex items-center justify-center gap-2 transition-all font-bold text-lg shadow-lg active:scale-95"
            >
              <Camera className="w-6 h-6" />
              Snap QR Code
            </button>
          )}

          {/* Stop Button */}
          <button
            onClick={handleStopScanning}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
          >
            <X className="w-5 h-5" />
            Stop Scanning
          </button>

          {/* Camera Selector - While Scanning */}
          {cameras.length > 1 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowCameraSelector(!showCameraSelector)}
                className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
              >
                <span>Switch Camera</span>
                <Camera className="w-4 h-4" />
              </button>

              {showCameraSelector && (
                <div className="bg-slate-700 rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                  {cameras.map((camera, index) => (
                    <button
                      key={camera.deviceId}
                      onClick={() => handleCameraChange(camera.deviceId)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                        selectedCameraId === camera.deviceId
                          ? "bg-purple-600 text-white"
                          : "hover:bg-slate-600 text-purple-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        <span className="truncate">{camera.label || `Camera ${index + 1}`}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Uploaded Image Preview (if file uploaded while scanning) */}
          {uploadedImage && (
            <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <ImageIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1 text-sm text-blue-200">
                  <p className="font-medium mb-2 flex items-center gap-2">
                    {processingUpload ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                        Analyzing image for QR code...
                      </>
                    ) : (
                      'Image uploaded'
                    )}
                  </p>
                  <div className="w-full h-40 bg-slate-900 rounded overflow-hidden border border-blue-500/20">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded QR" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-green-400 mt-0.5 animate-pulse" />
              <div className="text-sm text-green-200">
                <p className="font-medium mb-1">Camera Active</p>
                <p className="text-xs opacity-75">Hold the QR code steady in front of the camera</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
