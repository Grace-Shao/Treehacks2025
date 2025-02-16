import { Battery, MoreHorizontal, Wifi } from "lucide-react"
import type { Camera } from "@/types"
import { useRef } from "react"

interface CameraFeedProps {
  camera: Camera
  date?: Date
  onTimeUpdate?: (time: number) => void
}

export function CameraFeed({ camera, date = new Date(), onTimeUpdate }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime)
    }
  }

  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-black">
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

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Top bar */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-green-400">
          <Wifi className="h-4 w-4" />
          <Battery className="h-4 w-4" />
        </div>
        <div className="rounded-full bg-white/20 p-1.5 backdrop-blur-sm">
          <MoreHorizontal className="h-4 w-4 text-green-400" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="space-y-1 text-white">
          <div className="text-sm font-medium">{camera.name}</div>
          <div className="text-xs opacity-80">
            {camera.address}
          </div>
        </div>
      </div>
    </div>
  )
}
