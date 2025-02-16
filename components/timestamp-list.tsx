"use client"

import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import type { Timestamp } from "@/app/types"

interface TimestampListProps {
  timestamps: Timestamp[]
  onTimestampClick: (timestamp: string) => void
}

export default function TimestampList({ timestamps, onTimestampClick }: TimestampListProps) {
  return (
    <div className="grid gap-2">
      <h2 className="text-xl font-semibold mb-2 text-white">Key Moments</h2>
      <div className="grid gap-2">
        {timestamps.map((item, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start gap-2 h-auto py-4 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-left"
            onClick={() => onTimestampClick(item.timestamp)}
          >
            <Clock className="h-4 w-4 shrink-0 text-purple-400" />
            <div className="flex flex-col items-start">
              <span className="font-mono text-white">{item.timestamp}</span>
              <span className="text-sm text-zinc-400">{item.description}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
