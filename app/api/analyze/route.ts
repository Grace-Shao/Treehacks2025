import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json()

    // mocking right now
    const mockTimestamps = [
      {
        timestamp: "00:03",
        description: "Introduction begins with main topic overview",
      },
      {
        timestamp: "01:30",
        description: "First key point discussion starts",
      },
      {
        timestamp: "02:45",
        description: "Demonstration of main concept",
      },
      {
        timestamp: "04:20",
        description: "Summary of key takeaways",
      },
    ]

    await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json(mockTimestamps)
  } catch (error) {
    return NextResponse.json({ error: "Error analyzing video" }, { status: 500 })
  }
}

