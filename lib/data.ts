import type { Event, Location, BoundingBoxData } from "@/types";

export const locations: Location[] = [
	{
		id: "shopping-mall",
		name: "Shopping Mall",
		cameras: [
			{
				id: "mall-cam-1",
				name: "Shoplifting0",
				location: "Shopping Mall",
				address: "Rajesh Jewellers, 45 MG Road, Mumbai, India",
				thumbnail: "/placeholder.svg?height=480&width=640",
				videoUrl: "/videos/Shoplifting0.mp4",
			},
			{
				id: "mall-cam-2",
				name: "Shoplifting1",
				address: "Speed Zone Motorsports, 2234 Race Ave, Charlotte, NC, USA",
				location: "Shopping Mall",
				thumbnail: "/placeholder.svg?height=480&width=640",
				videoUrl: "/videos/Shoplifting1.mp4",
			},
			{
				id: "mall-cam-3",
				name: "Shoplifting2",
				address: "Golden Dreams Jewellery, 78 Linking Road, Delhi, India",
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
				address:
					"The Red Bull Lounge, 567 Bourbon Street, New Orleans, LA, USA",
				location: "Nightclub District",
				thumbnail: "/placeholder.svg?height=480&width=640",
				videoUrl: "/videos/Fighting0.mp4",
			},
			{
				id: "club-cam-2",
				name: "Fighting1",
				address: "Union Square Station Platform 4, New York, NY, USA",
				location: "Nightclub District",
				thumbnail: "/placeholder.svg?height=480&width=640",
				videoUrl: "/videos/Fighting1.mp4",
			},
			{
				id: "club-cam-3",
				name: "Fighting2",
				address: "Crystal Hall, 45 Tverskaya Street, Moscow, Russia",
				location: "Nightclub District",
				thumbnail: "/placeholder.svg?height=480&width=640",
				videoUrl: "/videos/Fighting2.mp4",
			},
			{
				id: "club-cam-4",
				name: "Fighting3",
				address: "Grand Plaza Hotel, 789 Convention Dr, Las Vegas, NV, USA",
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
				address: "QuickStop Market, 1234 Main Street, Phoenix, AZ, USA",
				location: "Convenience Store",
				thumbnail: "/placeholder.svg?height=480&width=640",
				videoUrl: "/videos/Robbery1.mp4",
			},
			{
				id: "store-cam-3",
				name: "Robbery2",
				address: "Smoke & Go, 567 Oak Avenue, Houston, TX, USA",
				location: "Convenience Store",
				thumbnail: "/placeholder.svg?height=480&width=640",
				videoUrl: "/videos/Robbery2.mp4",
			},
			{
				id: "store-cam-4",
				name: "Robbery3",
				address: "Corner Express, 890 Pine Street, Rapid City, SD, USA",
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
				address: "Evergreen Apartments, 123 Patel Road, Bangalore, India",
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
				address: "St. James Park, 45 Victoria Road, Dublin, Ireland",
				location: "Subway Station",
				thumbnail: "/placeholder.svg?height=480&width=640",
				videoUrl: "/videos/Vandalism3.mp4",
			},
		],
	},
];

export const analyzedEvents = [
  {
    videoId: "Fighting0",
    timeline: [
      {
        time: "00:02",
        event: "Individual becomes aggressive and throws items behind bar",
      },
      { 
        time: "00:25", 
        event: "Individual escalates destructive behavior" 
      },
      { 
        time: "00:46", 
        event: "Continued vandalism of property" 
      },
    ],
    crimeType: ["Vandalism", "Disorderly Conduct"],
    location: "United States, Bar/Restaurant",
  },
  {
    videoId: "Fighting1",
    timeline: [
      { 
        time: "00:39", 
        event: "Physical altercation breaks out between multiple individuals" 
      },
      { 
        time: "00:57", 
        event: "Fight escalates with multiple participants involved" 
      },
    ],
    crimeType: ["Assault", "Battery", "Disorderly Conduct"],
    location: "United States, Subway Station",
  },
  {
    videoId: "Fighting2",
    timeline: [
      { 
        time: "00:33", 
        event: "Sudden assault causes victim to fall" 
      },
      { 
        time: "00:34", 
        event: "Bystanders respond to assist victim" 
      },
    ],
    crimeType: ["Assault", "Battery"],
    location: "Eastern Europe (Russia/Ukraine)",
  },
  {
    videoId: "Shoplifting0",
    timeline: [
      {
        time: "00:15",
        event: "Suspect conceals merchandise under clothing",
      },
      {
        time: "00:45",
        event: "Suspect attempts to leave premises with concealed items",
      },
    ],
    crimeType: ["Theft", "Shoplifting"],
    location: "United States, Retail Store",
  },
  {
    videoId: "Shoplifting1",
    timeline: [
      {
        time: "00:10",
        event: "Individual examines high-value items suspiciously",
      },
      {
        time: "00:30",
        event: "Theft in progress - merchandise being concealed",
      },
      {
        time: "00:50",
        event: "Suspect exits store with stolen merchandise",
      },
    ],
    crimeType: ["Theft", "Grand Larceny"],
    location: "United States, Motorsports Store",
  },
  {
    videoId: "Shoplifting2",
    timeline: [
      {
        time: "00:20",
        event: "Coordinated theft begins with multiple suspects",
      },
      {
        time: "00:40",
        event: "Suspects actively stealing valuable jewelry",
      },
      {
        time: "01:00",
        event: "Suspects flee scene with stolen items",
      },
    ],
    crimeType: ["Armed Robbery", "Theft"],
    location: "India, Jewelry Store",
  }
];

function parseTimeToSeconds(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number)
  return minutes * 60 + seconds
}

function convertAnalyzedEventsToEvents(): Event[] {
  return analyzedEvents.flatMap((analyzed, analysisIndex) => {
    const camera = locations
      .flatMap(loc => loc.cameras)
      .find(cam => cam.name === analyzed.videoId)

    if (!camera) return []

    return analyzed.timeline.map((item, index) => ({
      id: `${analyzed.videoId}-${index}`,
      type: analyzed.crimeType[0],
      description: item.event,
      timestamp: new Date(parseTimeToSeconds(item.time) * 1000), // Convert to milliseconds
      camera: camera,
      thumbnail: camera.thumbnail,
    }))
  })
}

export const events = convertAnalyzedEventsToEvents()

export interface Stats {
  totalCameras: number;
  onlineCameras: number;
}

export function getSystemStats(): Stats {
  return {
    totalCameras: 12,
    onlineCameras: 15
  };
}

function generateMockEvent(): Event {
	const cameras = locations.flatMap((location) => location.cameras);
	const types = [
		"Motion Detected",
		"PIR Alarm",
		"Object Removed",
		"Person Detected",
	];

	return {
		id: Math.random().toString(36).substring(7),
		camera: cameras[Math.floor(Math.random() * cameras.length)],
		type: types[Math.floor(Math.random() * types.length)],
		timestamp: new Date(),
		thumbnail: "/placeholder.svg?height=120&width=160",
	};
}

export const initialEvents: Event[] = Array.from({ length: 15 }, (_, i) => ({
	id: i.toString(),
	camera: {
		id: "front-2",
		name: "Front Entrance 2",
		location: "Main Building",
		address: "123 Main St",
		thumbnail: "/placeholder.svg",
	},
	type: ["Theft", "Robbery", "Shoplifting", "Assault", "Battery", "Vandalism", "Disorderly"][
		Math.floor(Math.random() * 7)
	],
	timestamp: new Date(Date.now() - Math.random() * 10 * 60 * 1000), // Random time in last 10 minutes
	description: "Suspicious activity detected",
}));

export async function getBoundingBoxData(videoName: string): Promise<BoundingBoxData | null> {
  try {
    const response = await fetch(`/bounding_boxes/${videoName}_boxes.json`)
    if (!response.ok) {
      console.error(`Failed to load bounding box data for ${videoName}`)
      return null
    }
    return await response.json()
  } catch (error) {
    console.error(`Error loading bounding box data for ${videoName}:`, error)
    return null
  }
}
