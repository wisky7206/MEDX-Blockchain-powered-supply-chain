"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "./ui/button"
import { XCircle } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let animationFrameId: number

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
          setIsScanning(true)
          scanQRCode()
        }
      } catch (err) {
        setError("Could not access camera. Please ensure you've given permission.")
        console.error("Camera error:", err)
      }
    }

    const scanQRCode = () => {
      if (!videoRef.current || !canvasRef.current) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameId = requestAnimationFrame(scanQRCode)
        return
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data for QR detection
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      // In a real implementation, we would use a QR code detection library here
      // For this demo, we'll simulate finding a QR code after 3 seconds
      setTimeout(() => {
        if (isScanning) {
          const simulatedQRData = "PRD-105"
          onScan(simulatedQRData)
        }
      }, 3000)

      // Continue scanning
      animationFrameId = requestAnimationFrame(scanQRCode)
    }

    startScanner()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-card border border-border shadow-lg">
        <div className="absolute right-2 top-2 z-10">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 bg-background/50">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
          <p className="text-sm text-muted-foreground mb-4">Position the QR code within the scanner frame</p>
        </div>

        <div className="relative aspect-square w-full overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted p-4 text-center text-sm text-muted-foreground">
              {error}
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full hidden" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="qr-scanner-overlay">
                  <div className="qr-scanner-frame"></div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">{isScanning ? "Scanning..." : "Initializing camera..."}</p>
        </div>
      </div>
    </div>
  )
}
