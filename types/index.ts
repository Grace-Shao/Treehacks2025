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
