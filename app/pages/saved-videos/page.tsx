"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SavedVideo {
  id: string
  name: string
  url: string
  thumbnailUrl: string
  timestamps: { timestamp: string; description: string }[]
}

export default function SavedVideosPage() {
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredVideos, setFilteredVideos] = useState<SavedVideo[]>([])

  useEffect(() => {
    const videos = JSON.parse(localStorage.getItem("savedVideos") || "[]")
    setSavedVideos(videos)
    setFilteredVideos(videos)
  }, [])

  useEffect(() => {
    const filtered = savedVideos.filter(
      (video) =>
        video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.timestamps.some((timestamp) => timestamp.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredVideos(filtered)
  }, [searchTerm, savedVideos])

  const handleDelete = (id: string) => {
    const updatedVideos = savedVideos.filter((video) => video.id !== id)
    setSavedVideos(updatedVideos)
    localStorage.setItem("savedVideos", JSON.stringify(updatedVideos))
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
          Saved Videos
        </h1>
        <div className="mb-6 relative">
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 pl-10 pr-4 py-2 rounded-full focus:ring-2 focus:ring-white focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="group bg-zinc-900 rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:bg-zinc-800 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/20"
            >
              <div className="group">
                <div className="aspect-video">
                  <video
                    src={video.url}
                    className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2 tracking-wide">{video.name}</h2>
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/pages/video/${video.id}`}
                      className="text-white hover:text-gray-300 text-sm font-medium tracking-wider uppercase transition-colors duration-200"
                    >
                      View Analysis
                    </Link>
                    <Button
                      onClick={() => handleDelete(video.id)}
                      variant="destructive"
                      size="icon"
                      className="rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredVideos.length === 0 && (
          <p className="text-center text-zinc-400 mt-8 text-lg font-light">
            {searchTerm ? "No videos match your search." : "No saved videos yet."}
          </p>
        )}
        <div className="mt-12 text-center">
          <Link
            href="/pages/upload"
            className="text-white hover:text-gray-300 text-lg font-medium tracking-wide transition-colors duration-200"
          >
            Back to Analyzer
          </Link>
        </div>
      </div>
    </div>
  )
}
