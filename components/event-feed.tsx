import type { Event } from "@/types"
import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Siren, 
  Bomb,
  ShieldAlert,
  Sword,
  HandMetal,
  Store,
  ExternalLink
} from "lucide-react"

interface EventFeedProps {
  events: Event[]
  videoTimes: Record<string, number>
  onEventHover: (cameraId: string | null) => void
  onEventClick: (cameraId: string, timestamp: number) => void
}

interface VisibleEvent extends Event {
  addedAt: number
}

const INCIDENT_TYPES = {
  theft: { icon: HandMetal, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  robbery: { icon: Siren, color: "text-red-500", bg: "bg-red-500/10" },
  shoplifting: { icon: Store, color: "text-blue-500", bg: "bg-blue-500/10" },
  assault: { icon: Sword, color: "text-orange-500", bg: "bg-orange-500/10" },
  battery: { icon: Sword, color: "text-orange-500", bg: "bg-orange-500/10" },
  vandalism: { icon: Bomb, color: "text-purple-500", bg: "bg-purple-500/10" },
  disorderly: { icon: ShieldAlert, color: "text-indigo-500", bg: "bg-indigo-500/10" },
} as const

const getIncidentIcon = (type: string) => {
  const normalizedType = type.toLowerCase()
  for (const [key, value] of Object.entries(INCIDENT_TYPES)) {
    if (normalizedType.includes(key)) {
      return value
    }
  }
  return { icon: AlertTriangle, color: "text-gray-500", bg: "bg-gray-500/10" }
}

const formatTimeAgo = (addedAt: number, currentTime: number) => {
  const secondsAgo = Math.floor((currentTime - addedAt) / 1000)
  if (secondsAgo < 60) {
    return `${secondsAgo}s ago`
  }
  const minutesAgo = Math.floor(secondsAgo / 60)
  return `${minutesAgo}m ago`
}

export function EventFeed({ events, videoTimes, onEventHover, onEventClick }: EventFeedProps) {
  const [visibleEvents, setVisibleEvents] = useState<VisibleEvent[]>([])
  const [lastEventTime, setLastEventTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const processNewEvents = useCallback((newEvents: Event[]) => {
    const now = Date.now()
    if (newEvents.length === 0 || now - lastEventTime < 10000) {
      return
    }

    const randomEvent = newEvents[Math.floor(Math.random() * newEvents.length)]
    const eventWithTimestamp = { ...randomEvent, addedAt: now }
    
    setVisibleEvents(prev => {
      const combined = [eventWithTimestamp, ...prev]
      const unique = Array.from(new Map(combined.map(e => [e.id, e])).values())
      return unique.slice(0, 10)
    })
    setLastEventTime(now)
  }, [lastEventTime])

  useEffect(() => {
    const newEvents = events.filter(event => {
      const videoTime = videoTimes[event.camera.id] || 0
      const eventTimeInSeconds = event.timestamp.getTime() / 1000
      return Math.abs(videoTime - eventTimeInSeconds) < 1
    })

    processNewEvents(newEvents)
  }, [events, videoTimes, processNewEvents])

  return (
    <div className="relative flex flex-col space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Recent Incidents</h2>
      <AnimatePresence>
        {visibleEvents.map((event) => {
          const { icon: Icon, color, bg } = getIncidentIcon(event.type)
          const eventTimeInSeconds = Math.floor(event.timestamp.getTime() / 1000)
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50 cursor-pointer"
              onMouseEnter={() => onEventHover(event.camera.id)}
              onMouseLeave={() => onEventHover(null)}
              onClick={() => onEventClick(event.camera.id, eventTimeInSeconds)}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-full p-2 ${bg} ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{event.camera.name}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatTimeAgo(event.addedAt, currentTime)}
                    </div>
                  </div>
                  <p className={`text-xs font-medium ${color}`}>
                    {event.type}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <MapPin className="mr-1 h-3 w-3" />
                    {event.camera.address}
                  </div>
                </div>
              </div>
              {/* <div className="absolute inset-x-0 bottom-0 mt-4">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center justify-center py-2 text-xs text-blue-500">
                    <ExternalLink className="mt-4 mr-1 h-3 w-3" />
                    <span className="hover:underline">Click to open video feed</span>
                  </div>
                </div>
              </div> */}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
