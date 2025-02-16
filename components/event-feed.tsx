import type { Event } from "@/types"

interface EventFeedProps {
  events: Event[]
}

export function EventFeed({ events }: EventFeedProps) {
  return (
    <div className="relative flex">
      {/* Timeline dots */}
      <div className="w-4 mr-1 relative">
        <div className="absolute left-1/2 top-4 bottom-4 border-l-[3px] border-dotted border-gray-300 dark:border-gray-600" />
      </div>

      <div className="flex-1 space-y-6 p-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-4">
            <img
              src={event.thumbnail || "/placeholder.svg"}
              alt=""
              className="h-[60px] w-[80px] rounded-lg object-cover"
            />
            <div className="flex-1 space-y-1">
              <div className="text-sm font-medium">{event.camera.name}</div>
              <div className="text-xs text-gray-400">{event.type}</div>
              <div className="text-xs text-gray-400">
                {event.timestamp.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
