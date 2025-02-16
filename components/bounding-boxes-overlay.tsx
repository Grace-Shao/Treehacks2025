'use client'

import { useEffect, useState } from 'react'
import type { BoundingBoxData } from '@/types'
import { getBoundingBoxData } from '@/lib/data'

interface BoundingBoxesOverlayProps {
  videoName: string
  currentTime: number
  fps?: number
  width: number
  height: number
}

export function BoundingBoxesOverlay({
  videoName,
  currentTime,
  fps = 30,
  width,
  height,
}: BoundingBoxesOverlayProps) {
  const [boxesData, setBoxesData] = useState<BoundingBoxData | null>(null)
  const [currentBoxes, setCurrentBoxes] = useState<[number, number, number, number][]>([])

  // Load bounding box data
  useEffect(() => {
    getBoundingBoxData(videoName).then(setBoxesData)
  }, [videoName])

  // Update boxes based on current time
  useEffect(() => {
    if (!boxesData) return

    const frameNumber = Math.floor(currentTime * fps).toString()
    const frameData = boxesData.frames[frameNumber]
    
    if (frameData) {
      setCurrentBoxes(frameData.boxes)
    }
  }, [boxesData, currentTime, fps])

  if (!boxesData || currentBoxes.length === 0) return null

  // Scale boxes to match video display size
  const scaleX = width / boxesData.video_info.width
  const scaleY = height / boxesData.video_info.height

  return (
    <div className="absolute inset-0 pointer-events-none">
      {currentBoxes.map((box, index) => {
        const [x1, y1, x2, y2] = box
        const scaledStyle = {
          left: `${x1 * scaleX}px`,
          top: `${y1 * scaleY}px`,
          width: `${(x2 - x1) * scaleX}px`,
          height: `${(y2 - y1) * scaleY}px`,
        }

        return (
          <div
            key={index}
            className="absolute border-2 border-green-400 bg-green-400/20"
            style={scaledStyle}
          />
        )
      })}
    </div>
  )
}
