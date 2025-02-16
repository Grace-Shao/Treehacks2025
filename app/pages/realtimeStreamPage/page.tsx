"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Camera, StopCircle, PlayCircle, Save, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import TimestampList from "@/components/timestamp-list"
import ChatInterface from "@/components/chat-interface"
import { Timeline } from "../../components/Timeline"
import type { Timestamp } from "@/app/types"
import { detectEvents, type VideoEvent } from "./actions"

// Dynamically import TensorFlow.js and models
import type * as blazeface from '@tensorflow-models/blazeface'
import type * as posedetection from '@tensorflow-models/pose-detection'
import type * as tf from '@tensorflow/tfjs'

let tfjs: typeof tf
let blazefaceModel: typeof blazeface
let poseDetection: typeof posedetection

interface SavedVideo {
  id: string
  name: string
  url: string
  thumbnailUrl: string
  timestamps: Timestamp[]
}

interface Keypoint {
  x: number
  y: number
  score?: number
  name?: string
}

interface FacePrediction {
  topLeft: [number, number] | tf.Tensor1D
  bottomRight: [number, number] | tf.Tensor1D
  landmarks?: Array<[number, number]> | tf.Tensor2D
  probability: number | tf.Tensor1D
}

export default function Page() {
  // States
  const [isRecording, setIsRecording] = useState(false)
  const [timestamps, setTimestamps] = useState<Timestamp[]>([])
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [initializationProgress, setInitializationProgress] = useState<string>('')
  const [transcript, setTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [videoName, setVideoName] = useState('')
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [mlModelsReady, setMlModelsReady] = useState(false)
  const [lastPoseKeypoints, setLastPoseKeypoints] = useState<Keypoint[]>([])
  const [isClient, setIsClient] = useState(false)

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const detectionFrameRef = useRef<number | null>(null)
  const lastDetectionTime = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(performance.now())
  const startTimeRef = useRef<Date | null>(null)
  const faceModelRef = useRef<blazeface.BlazeFaceModel | null>(null)
  const poseModelRef = useRef<posedetection.PoseDetector | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const isRecordingRef = useRef<boolean>(false)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // -----------------------------
  // 1) Initialize ML Models
  // -----------------------------
  const initMLModels = async () => {
    try {
      setIsInitializing(true)
      setMlModelsReady(false)
      setError(null)

      // Start loading TensorFlow.js in parallel with other initialization
      setInitializationProgress('Loading TensorFlow.js...')
      const tfPromise = import('@tensorflow/tfjs').then(async (tf) => {
        tfjs = tf
        // Configure TF.js for better performance
        await tf.ready()
        await tf.setBackend('webgl')
        await tf.env().set('WEBGL_FORCE_F16_TEXTURES', true) // Use F16 textures for better performance
        await tf.env().set('WEBGL_PACK', true) // Enable texture packing
        await tf.env().set('WEBGL_CHECK_NUMERICAL_PROBLEMS', false) // Disable numerical checks in production
      })

      // Load models in parallel
      setInitializationProgress('Loading face and pose detection models...')
      const [blazefaceModule, poseDetectionModule] = await Promise.all([
        import('@tensorflow-models/blazeface'),
        import('@tensorflow-models/pose-detection')
      ])

      blazefaceModel = blazefaceModule
      poseDetection = poseDetectionModule

      // Wait for TF.js to be ready
      await tfPromise

      // Load models in parallel
      setInitializationProgress('Initializing models...')
      const [faceModel, poseModel] = await Promise.all([
        blazefaceModel.load({
          maxFaces: 1, // Limit to 1 face for better performance
          scoreThreshold: 0.5 // Increase threshold for better performance
        }),
        poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
            minPoseScore: 0.3
          }
        )
      ])

      faceModelRef.current = faceModel
      poseModelRef.current = poseModel

      setMlModelsReady(true)
      setIsInitializing(false)
      console.log('All ML models loaded successfully')
    } catch (err) {
      console.error('Error loading ML models:', err)
      setError('Failed to load ML models: ' + (err as Error).message)
      setMlModelsReady(false)
      setIsInitializing(false)
    }
  }

  // Helper to set canvas dimensions
  const updateCanvasSize = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = 640 // fixed width
    canvas.height = 360 // fixed height (16:9)
  }

  // -----------------------------
  // 2) Set up the webcam
  // -----------------------------
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 640 },
          height: { ideal: 360, max: 360 },
          frameRate: { ideal: 30 },
          facingMode: "user"
        },
        audio: true
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        mediaStreamRef.current = stream

        // Wait for video metadata so we can set the canvas size
        await new Promise<void>((resolve) => {
          videoRef.current!.onloadedmetadata = () => {
            updateCanvasSize()
            resolve()
          }
        })
      }
    } catch (error) {
      console.error("Error accessing webcam:", error)
      setError(
        "Failed to access webcam. Please make sure you have granted camera permissions."
      )
    }
  }

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
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

  // -----------------------------
  // 3) Speech Recognition
  // -----------------------------
  const initSpeechRecognition = () => {
    if (typeof window === "undefined") return
    if ("webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ""
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript((prev) => prev + " " + finalTranscript)
        }
      }

      recognitionRef.current = recognition
    } else {
      console.warn("Speech recognition not supported in this browser.")
    }
  }

  // -----------------------------
  // 4) TensorFlow detection loop
  // -----------------------------
  const runDetection = async () => {
    if (!isRecordingRef.current) return

    // Throttle detection to ~10 FPS (every 100ms)
    const now = performance.now()
    if (now - lastDetectionTime.current < 100) {
      detectionFrameRef.current = requestAnimationFrame(runDetection)
      return
    }
    lastDetectionTime.current = now

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) {
      detectionFrameRef.current = requestAnimationFrame(runDetection)
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      detectionFrameRef.current = requestAnimationFrame(runDetection)
      return
    }

    // Clear canvas and draw current video frame
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawVideoToCanvas(video, canvas, ctx)

    // Scale for drawing predictions
    const scaleX = canvas.width / video.videoWidth
    const scaleY = canvas.height / video.videoHeight

    // Face detection
    if (faceModelRef.current) {
      try {
        const predictions = await faceModelRef.current.estimateFaces(video, false)
        predictions.forEach((prediction: blazeface.NormalizedFace) => {
          const start = prediction.topLeft as [number, number]
          const end = prediction.bottomRight as [number, number]
          const size = [end[0] - start[0], end[1] - start[1]]

          const scaledStart = [start[0] * scaleX, start[1] * scaleY]
          const scaledSize = [size[0] * scaleX, size[1] * scaleX]

          // Draw bounding box
          ctx.strokeStyle = "rgba(0, 255, 0, 0.8)"
          ctx.lineWidth = 2
          ctx.strokeRect(
            scaledStart[0],
            scaledStart[1],
            scaledSize[0],
            scaledSize[1]
          )

          // Draw confidence
          const confidence = Math.round((prediction.probability as number) * 100)
          ctx.fillStyle = "white"
          ctx.font = "16px Arial"
          ctx.fillText(`${confidence}%`, scaledStart[0], scaledStart[1] - 5)
        })
      } catch (err) {
        console.error("Face detection error:", err)
      }
    }

    // Pose detection
    if (poseModelRef.current) {
      try {
        const poses = await poseModelRef.current.estimatePoses(video)
        if (poses.length > 0) {
          const keypoints = poses[0].keypoints
          // Convert TF keypoints to our Keypoint type
          const convertedKeypoints: Keypoint[] = keypoints.map(kp => ({
            x: kp.x,
            y: kp.y,
            score: kp.score ?? 0, // Use 0 as default if score is undefined
            name: kp.name
          }))
          setLastPoseKeypoints(convertedKeypoints)

          keypoints.forEach((keypoint) => {
            // Use nullish coalescing to provide a default value of 0
            if ((keypoint.score ?? 0) > 0.3) {
              const x = keypoint.x * scaleX
              const y = keypoint.y * scaleY

              // Draw keypoint
              ctx.beginPath()
              ctx.arc(x, y, 4, 0, 2 * Math.PI)
              ctx.fillStyle = "rgba(255, 0, 0, 0.8)"
              ctx.fill()

              // Outer circle
              ctx.beginPath()
              ctx.arc(x, y, 6, 0, 2 * Math.PI)
              ctx.strokeStyle = "white"
              ctx.lineWidth = 1.5
              ctx.stroke()

              // Label (if available)
              // Use nullish coalescing to provide a default value of 0
              if ((keypoint.score ?? 0) > 0.5 && keypoint.name) {
                ctx.fillStyle = "white"
                ctx.font = "12px Arial"
                ctx.fillText(`${keypoint.name}`, x + 8, y)
              }
            }
          })
        }
      } catch (err) {
        console.error("Pose detection error:", err)
      }
    }

    // (Optional) Compute FPS
    lastFrameTimeRef.current = performance.now()

    detectionFrameRef.current = requestAnimationFrame(runDetection)
  }

  // Helper: Draw video to canvas (maintaining aspect ratio)
  const drawVideoToCanvas = (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    const videoAspect = video.videoWidth / video.videoHeight
    const canvasAspect = canvas.width / canvas.height

    let drawWidth = canvas.width
    let drawHeight = canvas.height
    let offsetX = 0
    let offsetY = 0

    if (videoAspect > canvasAspect) {
      drawHeight = canvas.width / videoAspect
      offsetY = (canvas.height - drawHeight) / 2
    } else {
      drawWidth = canvas.height * videoAspect
      offsetX = (canvas.width - drawWidth) / 2
    }

    ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight)
  }

  // -----------------------------
  // 5) Analyze frame via API (and send email if dangerous)
  // -----------------------------
  const analyzeFrame = async () => {
    if (!isRecordingRef.current) return

    const currentTranscript = transcript.trim()
    const currentPoseKeypoints = [...lastPoseKeypoints]

    try {
      const frame = await captureFrame()
      if (!frame) return

      if (!frame.startsWith("data:image/jpeg")) {
        console.error("Invalid frame format")
        return
      }

      const result = await detectEvents(frame, currentTranscript)
      if (!isRecordingRef.current) return

      if (result.events && result.events.length > 0) {
        result.events.forEach(async (event: VideoEvent) => {
          const newTimestamp = {
            timestamp: getElapsedTime(),
            description: event.description,
            isDangerous: event.isDangerous
          }
          setTimestamps((prev) => [...prev, newTimestamp])

          // For dangerous events, send an email notification
          if (event.isDangerous) {
            try {
              const emailPayload = {
                title: "Dangerous Activity Detected",
                description: `At ${newTimestamp.timestamp}, the following dangerous activity was detected: ${event.description}`
              }
              const response = await fetch("/api/send-email", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json"
                },
                body: JSON.stringify(emailPayload)
              })
              
              // Check if response is ok before trying to parse JSON
              if (!response.ok) {
                if (response.status === 401) {
                  setError(
                    "Please sign in to receive email notifications for dangerous events."
                  )
                } else if (response.status === 500) {
                  setError(
                    "Email service not properly configured. Please contact support."
                  )
                } else {
                  const errorText = await response.text()
                  console.error("Failed to send email notification:", errorText)
                  setError(
                    `Failed to send email notification. Please try again later.`
                  )
                }
                return
              }
              
              // Only try to parse JSON for successful responses
              const resData = await response.json()
              console.log("Email notification sent successfully:", resData)
            } catch (error) {
              console.error("Error sending email notification:", error)
            }
          }
        })
      }
    } catch (error) {
      console.error("Error analyzing frame:", error)
      setError("Error analyzing frame. Please try again.")
      if (isRecordingRef.current) {
        stopRecording()
      }
    }
  }

  // -----------------------------
  // 6) Capture current video frame (for analysis)
  // -----------------------------
  const captureFrame = async (): Promise<string | null> => {
    if (!videoRef.current) return null

    const video = videoRef.current
    const tempCanvas = document.createElement("canvas")
    const width = 640
    const height = 360
    tempCanvas.width = width
    tempCanvas.height = height

    const context = tempCanvas.getContext("2d")
    if (!context) return null

    try {
      context.drawImage(video, 0, 0, width, height)
      const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.8)
      return dataUrl
    } catch (error) {
      console.error("Error capturing frame:", error)
      return null
    }
  }

  // -----------------------------
  // 7) Get elapsed time string
  // -----------------------------
  const getElapsedTime = () => {
    if (!startTimeRef.current) return "00:00"
    const elapsed = Math.floor(
      (Date.now() - startTimeRef.current.getTime()) / 1000
    )
    // Update current time for timeline
    setCurrentTime(elapsed)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  // -----------------------------
  // 8) Recording control (start/stop)
  // -----------------------------
  const startRecording = () => {
    setCurrentTime(0)
    setVideoDuration(0)
    if (!mlModelsReady) {
      setError("ML models not ready. Please wait for initialization.")
      return
    }
    if (!mediaStreamRef.current) return

    setError(null)
    setTimestamps([])
    setAnalysisProgress(0)

    startTimeRef.current = new Date()
    isRecordingRef.current = true
    setIsRecording(true)
    // Start tracking video duration
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }
    durationIntervalRef.current = setInterval(() => {
      if (isRecordingRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!.getTime()) / 1000)
        setVideoDuration(elapsed)
      }
    }, 1000)

    // Start speech recognition
    if (recognitionRef.current) {
      setTranscript("")
      setIsTranscribing(true)
      recognitionRef.current.start()
    }

    // Start video recording using MediaRecorder with MP4 container
    recordedChunksRef.current = []
    const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
      mimeType: "video/mp4"
    })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/mp4" })
      const url = URL.createObjectURL(blob)
      setRecordedVideoUrl(url)
      setVideoName("stream.mp4")
    }

    // Set up data handling before starting
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/mp4" })
      const url = URL.createObjectURL(blob)
      setRecordedVideoUrl(url)
      setVideoName("stream.mp4")
    }

    mediaRecorderRef.current = mediaRecorder
    // Start recording with a timeslice of 1000ms (1 second)
    mediaRecorder.start(1000)

    // Start the TensorFlow detection loop
    if (detectionFrameRef.current) {
      cancelAnimationFrame(detectionFrameRef.current)
    }
    lastDetectionTime.current = 0
    detectionFrameRef.current = requestAnimationFrame(runDetection)

    // Set up repeated frame analysis every 3 seconds
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
    }
    analyzeFrame() // first immediate call
    analysisIntervalRef.current = setInterval(analyzeFrame, 3000)
  }

  const stopRecording = () => {
    startTimeRef.current = null
    isRecordingRef.current = false
    setIsRecording(false)

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsTranscribing(false)
    }

    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    // Stop detection loop and analysis interval
    if (detectionFrameRef.current) {
      cancelAnimationFrame(detectionFrameRef.current)
      detectionFrameRef.current = null
    }
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
      analysisIntervalRef.current = null
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
  }

  // -----------------------------
  // 9) Save video functionality
  // -----------------------------
  const handleSaveVideo = () => {
    if (!recordedVideoUrl || !videoName) return

    try {
      const savedVideos: SavedVideo[] = JSON.parse(
        localStorage.getItem("savedVideos") || "[]"
      )
      const newVideo: SavedVideo = {
        id: Date.now().toString(),
        name: videoName,
        url: recordedVideoUrl,
        thumbnailUrl: recordedVideoUrl,
        timestamps: timestamps
      }
      savedVideos.push(newVideo)
      localStorage.setItem("savedVideos", JSON.stringify(savedVideos))
      alert("Video saved successfully!")
    } catch (error) {
      console.error("Error saving video:", error)
      alert("Failed to save video. Please try again.")
    }
  }

  // -----------------------------
  // 10) useEffect hooks
  // -----------------------------
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update current time and duration
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration || 60)
      // Reset playback position to start
      video.currentTime = 0
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    // Reset playback position when video source changes
    video.currentTime = 0

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [recordedVideoUrl])

  useEffect(() => {
    initSpeechRecognition()
    const init = async () => {
      await startWebcam()
      await initMLModels()
    }
    init()

    return () => {
      stopWebcam()
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current)
      if (detectionFrameRef.current) cancelAnimationFrame(detectionFrameRef.current)
    }
  }, [])

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl relative">
        <div className="absolute inset-0 bg-purple-900/5 blur-3xl rounded-full"></div>
        <div className="relative z-10 p-8">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">
                Real-time Stream Analyzer
              </h1>
              <p className="text-zinc-400">
                Analyze your live stream in real-time and detect key moments
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900">
                {isInitializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 z-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                    <p className="text-zinc-300">{initializationProgress}</p>
                  </div>
                )}
                <div className="relative w-full h-full" style={{ aspectRatio: "16/9" }}>
                  {isClient && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      width={640}
                      height={360}
                      className="absolute inset-0 w-full h-full object-cover opacity-0"
                    />
                  )}
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={360}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>

              {error && !isInitializing && (
                <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              <div className="flex justify-center gap-4">
                {isInitializing ? (
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-600 rounded-lg transition-colors cursor-not-allowed"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initializing...
                  </button>
                ) : !isRecording ? (
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

              {isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm text-zinc-400">
                      Recording and analyzing...
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">
                    Key Moments Timeline
                  </h2>
                  {timestamps.length > 0 ? (
                    <Timeline
                      events={timestamps.map(ts => {
                        // Parse the MM:SS format into seconds
                        const [minutes, seconds] = ts.timestamp.split(':').map(Number);
                        const timeInSeconds = minutes * 60 + seconds;
                        return {
                          startTime: timeInSeconds,
                          endTime: timeInSeconds + 3, // Assuming each event lasts 3 seconds
                          type: ts.isDangerous ? 'warning' : 'normal',
                          label: ts.description
                        };
                      })}
                      totalDuration={videoDuration || 60} // Default to 60 seconds if not set
                      currentTime={currentTime}
                    />
                  ) : (
                    <p className="text-zinc-400 text-sm">
                      {isRecording
                        ? "Waiting for events..."
                        : "Start analysis to detect events"}
                    </p>
                  )}
                </div>
                <TimestampList
                  timestamps={timestamps}
                  onTimestampClick={() => {}}
                />
              </div>

              {/* Transcript Section */}
              <div className="mt-8 space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  Audio Transcript
                </h2>
                <div className="p-4 bg-zinc-900/50 rounded-lg">
                  {isTranscribing && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm text-zinc-400">
                        Transcribing audio...
                      </span>
                    </div>
                  )}
                  {transcript ? (
                    <p className="text-zinc-300 whitespace-pre-wrap">
                      {transcript}
                    </p>
                  ) : (
                    <p className="text-zinc-500 italic">
                      {isRecording
                        ? "Waiting for speech..."
                        : "Start recording to capture audio"}
                    </p>
                  )}
                </div>
              </div>

              {/* Save section – shown only after recording stops */}
              {isClient && !isRecording && recordedVideoUrl && (
                <div className="mt-8 p-6 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <h2 className="text-xl font-semibold mb-4 text-white">
                    Save Recording
                  </h2>
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
            </div>
          </div>
        </div>
        <ChatInterface timestamps={timestamps} />
      </div>
    </div>
  )
}
