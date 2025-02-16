"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import VideoPlayer from "@/components/video-player"
import TimestampList from "@/components/timestamp-list"
import type { Timestamp } from "@/app/types"

export default function Page() {
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [timestamps, setTimestamps] = useState<Timestamp[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // upload progress mock
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // local url for file 
      const localUrl = URL.createObjectURL(file)
      setVideoUrl(localUrl)

      // mock processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsUploading(false)
      setUploadProgress(100)
      clearInterval(interval)

      // mock wait
      setIsAnalyzing(true)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock timestamp data
      const mockTimestamps: Timestamp[] = [
        { timestamp: "00:05", description: "Intro" },
        { timestamp: "00:15", description: "Some more details" },
        { timestamp: "00:30", description: "Second detail" },
        { timestamp: "00:45", description: "Climax" },
        { timestamp: "01:00", description: "Resolution" },
      ]
      setTimestamps(mockTimestamps)
      setIsAnalyzing(false)
    } catch (error) {
      console.error("Error uploading/analyzing video:", error)
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  const handleTimestampClick = (timestamp: string) => {
    if (!videoRef.current) return

    const [minutes, seconds] = timestamp.split(":").map(Number)
    const timeInSeconds = minutes * 60 + seconds
    videoRef.current.currentTime = timeInSeconds
    videoRef.current.play()
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl relative">
        {/* Small purple hue */}
        <div className="absolute inset-0 bg-purple-900/5 blur-3xl rounded-full"></div>

        <div className="relative z-10 p-8">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
                Video Timestamp Analyzer
              </h1>
              <p className="text-zinc-400">Upload a video to analyze key moments and generate timestamps</p>
            </div>

            {!videoUrl && (
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <label
                    htmlFor="video-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 mb-2 text-zinc-400" />
                      <p className="mb-2 text-sm text-zinc-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                    </div>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading || isAnalyzing}
                    />
                  </label>
                </div>
              </div>
            )}

            {(isUploading || isAnalyzing) && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-center text-sm text-zinc-400">
                  {isUploading ? "Uploading video..." : "Analyzing video content..."}
                </p>
              </div>
            )}

            {videoUrl && (
              <div className="space-y-4">
                <VideoPlayer url={videoUrl} timestamps={timestamps} ref={videoRef} />
                <TimestampList timestamps={timestamps} onTimestampClick={handleTimestampClick} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
