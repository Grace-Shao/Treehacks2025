"use client"

import { Button } from "@/components/ui/button"
import { Clock, AlertTriangle, Shield, ShieldAlert } from "lucide-react"
import type { Timestamp } from "@/app/types"

interface TimestampListProps {
  timestamps: Timestamp[]
  onTimestampClick: (timestamp: string) => void
}

export default function TimestampList({ timestamps, onTimestampClick }: TimestampListProps) {
  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-white">Key Moments</h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-zinc-400">Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <span className="text-zinc-400">Dangerous</span>
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        {timestamps.map((item, index) => (
          <Button
            key={index}
            variant="outline"
            className={`group w-full justify-start gap-2 h-auto py-4 transition-all duration-200 ${
              item.isDangerous 
                ? 'bg-red-950/20 border-red-900/50 hover:bg-red-950/30 hover:border-red-700/70' 
                : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600'
            } text-left relative overflow-hidden`}
            onClick={() => onTimestampClick(item.timestamp)}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 ${
              item.isDangerous
                ? 'bg-red-500 group-hover:bg-red-400'
                : 'bg-green-500 group-hover:bg-green-400'
            }`} />
            {item.isDangerous ? (
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
            ) : (
              <Shield className="h-4 w-4 shrink-0 text-green-400" />
            )}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="font-mono text-white">{item.timestamp}</span>
                {item.isDangerous && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    Dangerous
                  </span>
                )}
              </div>
              <span className={`text-sm mt-0.5 ${
                item.isDangerous ? 'text-red-200/80' : 'text-zinc-400'
              }`}>
                {item.description}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
