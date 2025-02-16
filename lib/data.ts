import type { Event, Location } from "@/types"

export const locations: Location[] = [
  {
    id: "shopping-mall",
    name: "Shopping Mall",
    cameras: [
      {
        id: "mall-cam-1",
        name: "Shoplifting0",
        location: "Shopping Mall",
        address: "Westfield Mall, Level 2, Sydney NSW 2000, Australia",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Shoplifting0.mp4",
      },
      {
        id: "mall-cam-2",
        name: "Shoplifting1",
        address: "Dubai Mall, Fashion Avenue, Dubai, UAE",
        location: "Shopping Mall",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Shoplifting1.mp4",
      },
      {
        id: "mall-cam-3",
        name: "Shoplifting2",
        address: "Siam Paragon, Ground Floor, Bangkok, Thailand",
        location: "Shopping Mall",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Shoplifting2.mp4",
      },
    ],
  },
  {
    id: "nightclub-district",
    name: "Nightclub District",
    cameras: [
      {
        id: "club-cam-1",
        name: "Fighting0",
        address: "Lan Kwai Fong, Central District, Hong Kong",
        location: "Nightclub District",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Fighting0.mp4",
      },
      {
        id: "club-cam-2",
        name: "Fighting1",
        address: "Shibuya Crossing, Tokyo, Japan",
        location: "Nightclub District",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Fighting1.mp4",
      },
      {
        id: "club-cam-3",
        name: "Fighting2",
        address: "Temple Bar, Dublin 2, Ireland",
        location: "Nightclub District",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Fighting2.mp4",
      },
      {
        id: "club-cam-4",
        name: "Fighting3",
        address: "Ibiza Old Town, Balearic Islands, Spain",
        location: "Nightclub District",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Fighting3.mp4",
      },
    ],
  },
  {
    id: "convenience-store",
    name: "Convenience Store",
    cameras: [
      {
        id: "store-cam-2",
        name: "Robbery1",
        address: "Circle K, 42nd Street, Manhattan, NY, USA",
        location: "Convenience Store",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Robbery1.mp4",
      },
      {
        id: "store-cam-3",
        name: "Robbery2",
        address: "FamilyMart Sukhumvit 22, Bangkok, Thailand",
        location: "Convenience Store",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Robbery2.mp4",
      },
      {
        id: "store-cam-4",
        name: "Robbery3",
        address: "QuikTrip, South Beach, Miami, FL, USA",
        location: "Convenience Store",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Robbery3.mp4",
      },
    ],
  },
  {
    id: "parking-garage",
    name: "Parking Garage",
    cameras: [
      {
        id: "parking-cam-2",
        name: "Stealing1",
        address: "Marina Bay Sands B2, Singapore",
        location: "Parking Garage",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Stealing1.mp4",
      },
    ],
  },
  {
    id: "subway-station",
    name: "Subway Station",
    cameras: [
      {
        id: "subway-cam-4",
        name: "Vandalism3",
        address: "Shinjuku Station South Exit, Tokyo, Japan",
        location: "Subway Station",
        thumbnail: "/placeholder.svg?height=480&width=640",
        videoUrl: "/videos/Vandalism3.mp4",
      },
    ],
  },
]

export const events: Event[] = [
  {
    id: "1",
    camera: {
      id: "front-2",
      name: "Front Door 2",
      location: "Front Door",
      address: "123 Security Ave, New York, NY, USA",
      thumbnail: "/placeholder.svg?height=120&width=160",
    },
    type: "PIR Alarm",
    timestamp: new Date("2024-05-15T12:19:49"),
    thumbnail: "/placeholder.svg?height=120&width=160",
  },
  {
    id: "2",
    camera: {
      id: "front-2",
      name: "Front Door 2",
      location: "Front Door",
      address: "123 Security Ave, New York, NY, USA",
      thumbnail: "/placeholder.svg?height=120&width=160",
    },
    type: "PIR Alarm",
    timestamp: new Date("2024-05-15T12:01:03"),
    thumbnail: "/placeholder.svg?height=120&width=160",
  },
  {
    id: "3",
    camera: {
      id: "front-2",
      name: "Front Door 2",
      location: "Front Door",
      address: "123 Security Ave, New York, NY, USA",
      thumbnail: "/placeholder.svg?height=120&width=160",
    },
    type: "PIR Alarm",
    timestamp: new Date("2024-05-15T11:52:12"),
    thumbnail: "/placeholder.svg?height=120&width=160",
  },
]

function generateMockEvent(): Event {
  const cameras = locations.flatMap((location) => location.cameras)
  const types = ["Motion Detected", "PIR Alarm", "Object Removed", "Person Detected"]
  
  return {
    id: Math.random().toString(36).substring(7),
    camera: cameras[Math.floor(Math.random() * cameras.length)],
    type: types[Math.floor(Math.random() * types.length)],
    timestamp: new Date(),
    thumbnail: "/placeholder.svg?height=120&width=160",
  }
}

export const initialEvents: Event[] = Array.from({ length: 10 }, (_, i) => ({
  id: i.toString(),
  camera: {
    id: "front-2",
    name: "Front Door 2",
    location: "Front Door",
    address: "123 Security Ave, New York, NY, USA",
    thumbnail: "/placeholder.svg?height=120&width=160",
  },
  type: "PIR Alarm",
  timestamp: new Date(Date.now() - i * 60000),
  thumbnail: "/placeholder.svg?height=120&width=160",
}))
