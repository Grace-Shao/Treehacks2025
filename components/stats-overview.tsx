import { Camera } from "lucide-react"
import { getSystemStats } from "@/lib/data"

export function StatsOverview() {
  const stats = getSystemStats();
  
  return (
    <div className="border-b border-gray-200 p-4 dark:border-gray-800">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Camera className="h-4 w-4" />
          <span>Cameras</span>
        </div>
        <p className="text-2xl font-bold">
          {stats.totalCameras}{" "}
          <span className="text-sm text-gray-400">/ {stats.onlineCameras} online</span>
        </p>
      </div>
    </div>
  )
}
