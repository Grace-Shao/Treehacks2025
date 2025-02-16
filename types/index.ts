export interface Camera {
  id: string
  name: string
  location: string
  address: string
  thumbnail: string
  videoUrl?: string
}

export interface Location {
  id: string
  name: string
  cameras: Camera[]
}

export interface Event {
  id: string
  camera: Camera
  type: string
  timestamp: Date
  thumbnail?: string
  description?: string
}

export interface BoundingBoxData {
  video_info: {
    name: string
    width: number
    height: number
    fps: number
    total_frames: number
    frame_interval: number
  }
  frames: {
    [frameNumber: string]: {
      boxes: [number, number, number, number][]
      confidences: number[]
      is_keyframe: boolean
    }
  }
}
