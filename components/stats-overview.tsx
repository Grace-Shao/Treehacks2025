import { Camera, Shield, AlertTriangle, Users } from "lucide-react"

export function StatsOverview() {
  return (
    <div className="grid grid-cols-2 gap-4 border-b border-gray-200 p-4 dark:border-gray-800">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Camera className="h-4 w-4" />
          <span>Cameras</span>
        </div>
        <p className="text-2xl font-bold">
          24 <span className="text-sm text-gray-400">/ 21 online</span>
        </p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <AlertTriangle className="h-4 w-4" />
          <span>Incidents</span>
        </div>
        <p className="text-2xl font-bold">8</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Shield className="h-4 w-4" />
          <span>Security Level</span>
        </div>
        <p className="text-2xl font-bold">High</p>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Users className="h-4 w-4" />
          <span>Active Users</span>
        </div>
        <p className="text-2xl font-bold">3</p>
      </div>
    </div>
  )
}
