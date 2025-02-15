import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    console.log('Received image file:', {
      type: imageFile.type,
      size: imageFile.size,
      name: imageFile.name
    });

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const imageBytes = await imageFile.arrayBuffer();
    console.log('Image bytes length:', imageBytes.byteLength);

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imagePart = {
      inlineData: {
        data: Buffer.from(imageBytes).toString('base64'),
        mimeType: imageFile.type
      }
    };

    console.log('Sending to Gemini with mimeType:', imageFile.type);

    const result = await model.generateContent([
      "What do you see in this image? Please describe it in detail.",
      imagePart
    ]);
    
    console.log('Received response from Gemini');
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { error: `Failed to process image: ${error.message}` },
      { status: 500 }
    );
  }
}
