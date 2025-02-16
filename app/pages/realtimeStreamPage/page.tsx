"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Camera, StopCircle, PlayCircle, Save } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TimestampList from "@/components/timestamp-list"
import type { Timestamp } from "@/app/types"
import { detectEvents, type VideoEvent } from "./actions"

interface SavedVideo {
  id: string
  name: string
  url: string
  thumbnailUrl: string
  timestamps: Timestamp[]
}

export default function Page() {
  // State
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [timestamps, setTimestamps] = useState<Timestamp[]>([])
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [videoName, setVideoName] = useState('')
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false) // Track if we're on client-side
  const startTimeRef = useRef<Date | null>(null)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isRecordingRef = useRef(false) // Use ref to track recording state
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Functions
  // Initialize speech recognition
  const initSpeechRecognition = () => {
    // Only run on client side
    if (typeof window === 'undefined') return

    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript)
        }
      }
      //  commenting out as errors from no audio
      // recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      //   console.error('Speech recognition error:', error)
      //   setError('Speech recognition error: ' + error)
      // }

      recognitionRef.current = recognition
    } else {
      console.warn('Speech recognition not supported')
    }
  }

  const startWebcam = async () => {
    // Only run on client side
    if (typeof window === 'undefined') return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        mediaStreamRef.current = stream
      }
    } catch (error) {
      console.error('Error accessing webcam:', error)
      setError('Failed to access webcam. Please make sure you have granted camera permissions.')
    }
  }

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl)
      setRecordedVideoUrl(null)
    }
  }

  const captureFrame = async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) {
      console.error('Failed to get canvas context')
      return null
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg', 0.8)
  }

  const getElapsedTime = () => {
    if (!startTimeRef.current) return '00:00'
    const elapsed = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const analyzeFrame = async () => {
    const currentTranscript = transcript.trim()
    console.log('Analyzing frame...')
    // Store recording state at the start of analysis
    const wasRecording = isRecordingRef.current
    if (!wasRecording) {
      console.log('Not recording, skipping analysis')
      return
    }

    try {
      const frame = await captureFrame()
      if (frame) {
        console.log('Frame captured, sending to API...')
        // Include transcript in the analysis
        const result = await detectEvents(frame, currentTranscript)
        console.log('API response:', result)

        // Check if we're still recording after API call
        if (!isRecordingRef.current) {
          console.log('Recording stopped during analysis, discarding results')
          return
        }

        if (result.events && result.events.length > 0) {
          console.log('Events detected:', result.events)
          result.events.forEach(async (event: VideoEvent) => {
            const newTimestamp = {
              timestamp: getElapsedTime(),
              description: event.description,
              isDangerous: event.isDangerous
            }
            console.log('Adding new timestamp:', newTimestamp)
            
            // Send email notification for dangerous events
            if (event.isDangerous) {
              try {
                console.log('Dangerous event detected, preparing to send email...')
                const emailPayload = {
                  title: 'Dangerous Activity Detected',
                  description: `At ${newTimestamp.timestamp}, the following dangerous activity was detected: ${event.description}`
                }
                console.log('Email payload:', emailPayload)
                
                const response = await fetch('/api/send-email', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify(emailPayload)
                })
                console.log('Fetch response status:', response.status)
                
                const result = await response.json()
                
                if (!response.ok) {
                  console.error('Failed to send email notification:', result.error)
                  if (response.status === 401) {
                    setError('Please sign in to receive email notifications for dangerous events.')
                  } else if (response.status === 500) {
                    setError('Email service not properly configured. Please contact support.')
                  } else {
                    setError(`Failed to send email notification: ${result.error?.message || 'Unknown error'}`)
                  }
                } else {
                  console.log('Email notification sent successfully')
                }
              } catch (error) {
                console.error('Error sending email notification:', error)
              }
            }
            
            setTimestamps(prev => {
              const updated = [...prev, newTimestamp]
              console.log('Updated timestamps:', updated)
              return updated
            })
          })
        } else {
          console.log('No events detected in this frame')
        }
      } else {
        console.log('Failed to capture frame')
      }
    } catch (error) {
      console.error('Error analyzing frame:', error)
      setError('Error analyzing frame. Please try again.')
      if (isRecordingRef.current) {
        stopRecording()
      }
    }
  }

  const startRecording = () => {
    if (typeof window === 'undefined' || !mediaStreamRef.current) return

    // Set start time for elapsed time tracking
    startTimeRef.current = new Date()
    
    // Start speech recognition
    if (recognitionRef.current) {
      setTranscript('')
      setIsTranscribing(true)
      recognitionRef.current.start()
    }

    // Start video recording
    recordedChunksRef.current = []
    const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
      mimeType: 'video/webm'
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecordedVideoUrl(url)
      setVideoName('stream.mp4') // Set default name when recording stops
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()

    console.log('Starting recording...')
    // Clear any existing interval
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
    }

    // Reset state
    setTimestamps([])
    setError(null)
    setAnalysisProgress(0)
    setRecordedVideoUrl(null) // Clear any previous video URL
    
    // Set both the ref and state
    isRecordingRef.current = true
    setIsRecording(true)

    // Start a new interval and immediately run first analysis
    console.log('Setting up analysis interval...')
    analyzeFrame() // Run first analysis immediately
    analysisIntervalRef.current = setInterval(analyzeFrame, 3000)
    console.log('Recording started')
  }

  const stopRecording = () => {
    // Reset start time
    startTimeRef.current = null
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsTranscribing(false)
    }

    // Stop video recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    console.log('Stopping recording...')
    // Update both ref and state
    isRecordingRef.current = false
    setIsRecording(false)
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
      analysisIntervalRef.current = null
    }
    console.log('Recording stopped')
  }

  // Effects
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    let mounted = true

    const init = async () => {
      if (!mounted) return

      // Initialize speech recognition
      initSpeechRecognition()

      // Initialize webcam
      await startWebcam()
      if (mounted) {
        canvasRef.current = document.createElement('canvas')
      }
    }

    init()

    return () => {
      mounted = false
      stopWebcam()
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current)
      }
    }
  }, [])

  const handleSaveVideo = () => {
    if (typeof window === 'undefined' || !recordedVideoUrl || !videoName) return

    try {
      const savedVideos: SavedVideo[] = JSON.parse(localStorage.getItem("savedVideos") || "[]")
      const newVideo: SavedVideo = {
        id: Date.now().toString(),
        name: videoName,
        url: recordedVideoUrl,
        thumbnailUrl: recordedVideoUrl,
        timestamps: timestamps,
      }
      savedVideos.push(newVideo)
      localStorage.setItem("savedVideos", JSON.stringify(savedVideos))
      alert("Video saved successfully!")
    } catch (error) {
      console.error('Error saving video:', error)
      alert("Failed to save video. Please try again.")
    }
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
                Real-time Stream Analyzer
              </h1>
              <p className="text-zinc-400">Analyze your live stream in real-time and detect key moments</p>
            </div>

            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900">
                {isClient && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {isClient && error && (
                <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Start Analysis
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <StopCircle className="w-5 h-5" />
                    Stop Analysis
                  </button>
                )}
              </div>

              {/* Save section - only shown after recording is stopped */}
              {isClient && !isRecording && recordedVideoUrl && (
                <div className="mt-8 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <h2 className="text-xl font-semibold mb-4 text-white">Save Recording</h2>
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      placeholder="Enter video name"
                      value={videoName}
                      onChange={(e) => setVideoName(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <Button
                      onClick={handleSaveVideo}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                      disabled={!videoName}
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {isClient && isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm text-zinc-400">Recording and analyzing...</span>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2">
                {timestamps.length > 0 ? (
                  <TimestampList 
                    timestamps={timestamps} 
                    onTimestampClick={() => {}} // No action needed for realtime stream
                  />
                ) : (
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-white">Key Moments</h2>
                    <p className="text-zinc-400 text-sm">
                      {isRecording ? 'Waiting for events...' : 'Start analysis to detect events'}
                    </p>
                  </div>
                )}
              </div>

              {/* Transcript Section */}
              <div className="mt-8 space-y-2">
                <h2 className="text-xl font-semibold text-white">Audio Transcript</h2>
                <div className="p-4 bg-zinc-900/50 rounded-lg">
                  {isTranscribing && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-zinc-400">Transcribing audio...</span>
                    </div>
                  )}
                  {transcript ? (
                    <p className="text-zinc-300 whitespace-pre-wrap">{transcript}</p>
                  ) : (
                    <p className="text-zinc-500 italic">
                      {isRecording ? 'Waiting for speech...' : 'Start recording to capture audio'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
