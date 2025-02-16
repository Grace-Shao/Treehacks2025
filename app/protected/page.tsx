"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"
import { CameraFeed } from "@/components/camera-feed"
import { CameraModal } from "@/components/camera-modal"
import { EventFeed } from "@/components/event-feed"
import { StatsOverview } from "@/components/stats-overview"
import { locations, events } from "@/lib/data"

export default function ProtectedPage() {
  const supabase = createClient()
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [videoTimes, setVideoTimes] = useState<Record<string, number>>({})
  const [hoveredCamera, setHoveredCamera] = useState<string | null>(null)

  const handleAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return redirect("/sign-in")
    }
  }

  // Check auth on mount
  useState(() => {
    handleAuth()
  })

  const handleTimeUpdate = (cameraId: string, time: number) => {
    setVideoTimes(prev => ({
      ...prev,
      [cameraId]: time
    }))
  }

  const handleEventClick = (cameraId: string, timestamp: number) => {
    setSelectedCamera(cameraId)
    // Update the video time for this camera to jump to the incident
    setVideoTimes(prev => ({
      ...prev,
      [cameraId]: timestamp
    }))
  }

  return (
    <div className="flex-1 w-full flex">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.flatMap((location) =>
              location.cameras.map((camera) => (
                <button
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera.id)}
                  onMouseEnter={() => setHoveredCamera(camera.id)}
                  onMouseLeave={() => setHoveredCamera(null)}
                  className={`relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity duration-300 ${
                    hoveredCamera && hoveredCamera !== camera.id ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  <CameraFeed
                    camera={camera}
                    onTimeUpdate={(time) => handleTimeUpdate(camera.id, time)}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/75 to-transparent">
                    <div className="text-white font-medium">{camera.name}</div>
                    <div className="text-white/75 text-sm">{camera.address}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-96 border-l border-gray-200 dark:border-gray-800 overflow-auto p-6">
        <StatsOverview />
        <div className="mt-6">
          <EventFeed 
            events={events} 
            videoTimes={videoTimes}
            onEventHover={setHoveredCamera}
            onEventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Camera Modal */}
      {selectedCamera && (
        <CameraModal
          open={true}
          onOpenChange={(open) => !open && setSelectedCamera(null)}
          cameraId={selectedCamera}
          currentTime={videoTimes[selectedCamera]}
          date={new Date()}
        />
      )}
    </div>
  )
}
