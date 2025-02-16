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
    const { messages, events } = await request.json()

    const contextMessage = events.length > 0
      ? `Here are the recent events that have occurred during the video stream:\n${events.map((event: any) => 
          `- At ${event.timestamp}: ${event.description}${event.isDangerous ? ' (⚠️ Dangerous)' : ''}`
        ).join('\n')}\n\nPlease help the user with any questions about these events or provide general assistance.`
      : 'No events have been detected yet. I can still help you with any questions about the video stream or general assistance.'

    console.log('Sending request to OpenAI...')
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant monitoring a real-time video stream. You have access to detected events and can provide guidance, especially during dangerous situations. Be concise but informative, and show appropriate concern for dangerous events while remaining calm and helpful."
        },
        {
          role: "system",
          content: contextMessage
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 150 // Keep responses concise
    })

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI')
    }

    console.log('Successfully received response from OpenAI')
    return NextResponse.json({ 
      content: response.choices[0].message.content,
      role: 'assistant'
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: `Failed to get chat response: ${errorMessage}` },
      { status: 500 }
    )
  }
}
