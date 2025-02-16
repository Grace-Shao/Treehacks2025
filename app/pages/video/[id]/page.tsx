"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import VideoPlayer from "@/components/video-player"
import TimestampList from "@/components/timestamp-list"
import type { Timestamp } from "@/app/types"

interface SavedVideo {
  id: string
  name: string
  url: string
  thumbnailUrl: string
  timestamps: Timestamp[]
}

export default function VideoPage() {
  const [video, setVideo] = useState<SavedVideo | null>(null)
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const savedVideos: SavedVideo[] = JSON.parse(localStorage.getItem("savedVideos") || "[]")
    const foundVideo = savedVideos.find((v) => v.id === params.id)
    if (foundVideo) {
      setVideo(foundVideo)
    } else {
      router.push("/saved-videos")
    }
  }, [params.id, router])

  const handleTimestampClick = (timestamp: string) => {
    if (!videoRef.current) return

    const [minutes, seconds] = timestamp.split(":").map(Number)
    const timeInSeconds = minutes * 60 + seconds
    videoRef.current.currentTime = timeInSeconds
    videoRef.current.play()
  }

  if (!video) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
          {video.name}
        </h1>
        <div className="space-y-4">
          <VideoPlayer url={video.url} timestamps={video.timestamps} ref={videoRef} />
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                const a = document.createElement('a')
                a.href = video.url
                // Remove .mp4 extension if it exists in the name
                const filename = video.name.toLowerCase().endsWith('.mp4') 
                  ? video.name 
                  : `${video.name}.mp4`
                a.download = filename
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
              }}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 backdrop-blur-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download MP4
            </Button>
          </div>
          <TimestampList timestamps={video.timestamps} onTimestampClick={handleTimestampClick} />
        </div>
        <div className="mt-8 text-center">
          <Link href="/pages/saved-videos" className="text-purple-400 hover:text-purple-300">
            Back to Saved Videos
          </Link>
        </div>
      </div>
    </div>
  )
}
