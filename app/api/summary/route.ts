import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not found in environment variables')
  }
  return new OpenAI({ apiKey })
}

export async function POST(request: Request) {
  let openai
  try {
    openai = getOpenAIClient()
  } catch (error) {
    console.error('OpenAI client initialization error:', error)
    return NextResponse.json(
      { error: 'OpenAI API key not properly configured' },
      { status: 500 }
    )
  }

  try {
    const { keyMoments } = await request.json()

    // Format the key moments into a readable string
    const momentsText = keyMoments.map((moment: any) => 
      `Video: ${moment.videoName}\nTimestamp: ${moment.timestamp}\nDescription: ${moment.description}\nDangerous: ${moment.isDangerous ? 'Yes' : 'No'}\n`
    ).join('\n')

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing video safety data. Provide concise, insightful summaries of video analysis data, focusing on safety patterns and potential concerns."
        },
        {
          role: "user",
          content: `Here are the key moments from video analysis sessions. Please provide a concise summary of the important events and any safety concerns:\n\n${momentsText}\n\nPlease format your response in this way:\n1. Overall Summary (2-3 sentences)\n2. Key Safety Concerns (if any)\n3. Notable Patterns (if any)`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return NextResponse.json({ 
      summary: response.choices[0]?.message?.content || 'Unable to generate summary.' 
    })
  } catch (error: any) {
    console.error('Error generating summary:', error)
    const errorMessage = error.message || 'Failed to generate summary'
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
