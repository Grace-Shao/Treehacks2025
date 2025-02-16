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
  ExternalLink,
  X,
  Shield
} from "lucide-react"
import { SecurityAlertModal } from "@/components/security-alert-modal"
import { cn } from "@/lib/utils"

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
  const [selectedEventForAlert, setSelectedEventForAlert] = useState<string | null>(null)

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

  const handleDismiss = (eventId: string) => {
    setVisibleEvents(prev => prev.filter(e => e.id !== eventId))
  }

  return (
    <div className="relative flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">Recent Incidents</h2>
      <AnimatePresence>
        {visibleEvents.map((event) => {
          const { icon: Icon, color, bg } = getIncidentIcon(event.type)
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="relative rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-full", bg)}>
                    <Icon className={cn("h-4 w-4", color)} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">{event.camera.name}</p>
                    <p className={cn("text-sm", color)}>{event.type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(event.addedAt, currentTime)}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>{event.camera.address}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(event.id);
                    }}
                    className={cn(
                      "relative z-20 flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
                      "hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100",
                      "transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                      "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-gray-600"
                    )}
                  >
                    <X className="h-4 w-4" />
                    Dismiss
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEventForAlert(event.id);
                    }}
                    className={cn(
                      "relative z-20 flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                      "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                      "hover:bg-red-200 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-300",
                      "transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                      "focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-red-800"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    Alert Security
                  </button>
                </div>
              </div>
              <button
                className="absolute inset-0 z-10 cursor-pointer"
                onMouseEnter={() => onEventHover(event.camera.id)}
                onMouseLeave={() => onEventHover(null)}
                onClick={() => onEventClick(event.camera.id, event.timestamp.getTime() / 1000)}
              >
                <span className="sr-only">View camera feed</span>
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <SecurityAlertModal
        open={selectedEventForAlert !== null}
        onOpenChange={(open: boolean) => !open && setSelectedEventForAlert(null)}
        onAlertComplete={() => {
          if (selectedEventForAlert) {
            handleDismiss(selectedEventForAlert)
          }
        }}
      />
    </div>
  )
}
