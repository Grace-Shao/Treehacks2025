"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"
import { CameraFeed } from "@/components/camera-feed"
import { CameraModal } from "@/components/camera-modal"
import { DatePicker } from "@/components/date-picker"
import { EventFeed } from "@/components/event-feed"
import { StatsOverview } from "@/components/stats-overview"
import { locations, events as mockEvents } from "@/lib/data"

export default function ProtectedPage() {
  const supabase = createClient()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [events] = useState(mockEvents)
  const [videoTimes, setVideoTimes] = useState<Record<string, number>>({})

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
                  className="w-full text-left"
                >
                  <CameraFeed 
                    camera={camera} 
                    date={selectedDate} 
                    onTimeUpdate={(time) => handleTimeUpdate(camera.id, time)}
                  />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-96 border-l border-gray-200 dark:border-gray-800 overflow-auto">
        <StatsOverview />
        <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <EventFeed events={events} />
      </div>

      {/* Camera Modal */}
      {selectedCamera && (
        <CameraModal
          open={!!selectedCamera}
          onOpenChange={(open) => !open && setSelectedCamera(null)}
          cameraId={selectedCamera}
          date={selectedDate}
          currentTime={videoTimes[selectedCamera]}
        />
      )}
    </div>
  )
}
