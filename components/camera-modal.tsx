import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { Battery, Signal, AlertTriangle } from "lucide-react"
import { locations } from "@/lib/data"
import { useEffect, useRef, useState } from "react"
import { BoundingBoxesOverlay } from "./bounding-boxes-overlay"

interface CameraModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cameraId: string
  incident?: string
  date: Date
  currentTime?: number
}

export function CameraModal({ 
  open, 
  onOpenChange, 
  cameraId, 
  incident, 
  date,
  currentTime = 0 
}: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 })
  const [videoTime, setVideoTime] = useState(currentTime)
  
  // Find the camera data
  const camera = locations
    .flatMap((location) => location.cameras)
    .find((cam) => cam.id === cameraId)

  // Update video dimensions when it loads or window resizes
  useEffect(() => {
    if (!videoRef.current) return

    const updateDimensions = () => {
      if (videoRef.current) {
        setVideoDimensions({
          width: videoRef.current.offsetWidth,
          height: videoRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Sync time when modal opens
  useEffect(() => {
    if (open && videoRef.current && currentTime > 0) {
      videoRef.current.currentTime = currentTime
      setVideoTime(currentTime)
    }
  }, [open, currentTime])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setVideoTime(videoRef.current.currentTime)
    }
  }

  if (!camera) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-black p-0">
        <VisuallyHidden>
          <DialogTitle>Camera Feed: {camera.name}</DialogTitle>
        </VisuallyHidden>
        <div className="relative aspect-[4/3]">
          {/* Camera Feed */}
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ 
              transform: `scale(${
                ['Shoplifting2', 'Shoplifting3', 'Fighting0', 'Fighting3', 'Stealing0', 'Stealing3', 'Vandalism0', 'Vandalism1'].includes(camera.name) 
                ? '1.25' 
                : '1.1'
              })`
            }}
            autoPlay
            muted
            loop
            playsInline
            onTimeUpdate={handleTimeUpdate}
          >
            <source src={camera.videoUrl || camera.thumbnail} type="video/mp4" />
          </video>

          {/* Bounding Boxes */}
          {videoDimensions.width > 0 && (
            <BoundingBoxesOverlay
              videoName={camera.name}
              currentTime={videoTime}
              width={videoDimensions.width}
              height={videoDimensions.height}
            />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top bar */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4 text-green-400" />
              <Battery className="h-4 w-4 text-green-400" />
            </div>
            {incident && (
              <div className="flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-sm text-red-500 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{incident}</span>
              </div>
            )}
          </div>

          {/* Camera info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">{camera.location}</div>
                <div className="text-xs text-white/60">{camera.address}</div>
              </div>
              <div className="text-sm text-white/60">
                {date.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
