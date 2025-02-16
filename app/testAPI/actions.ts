"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    throw new Error('GOOGLE_API_KEY environment variable is not set');
}
const genAI = new GoogleGenerativeAI(API_KEY);

// Rate limiting variables
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 1000; // 1 second between calls
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 5;
let backoffTime = MIN_CALL_INTERVAL;

export type Event = {
    timestamp: number;
    description: string;
};

export async function detectEvents(base64Image: string): Promise<{ events: Event[], rawResponse: string }> {
    console.log('Starting object detection...');
    try {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;
        if (consecutiveErrors > 0 && timeSinceLastCall < backoffTime) {
            throw new Error(`Rate limit exceeded. Please wait ${Math.ceil((backoffTime - timeSinceLastCall) / 1000)} seconds.`);
        }

        if (!base64Image) {
            throw new Error("No image data provided");
        }

        const base64Data = base64Image.split(',')[1];
        if (!base64Data) {
            throw new Error("Invalid image data format");
        }

        // Validate base64 data
        if (base64Data.length === 0) {
            throw new Error("Empty image data");
        }

        if (!process.env.GOOGLE_API_KEY) {
            console.error('GOOGLE_API_KEY is not set in environment variables');
            throw new Error('API key not configured');
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('Initialized Gemini model');

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg'
            },
        };

        // Update last call time
        lastCallTime = now;

        console.log('Sending image to API...', { imageSize: base64Data.length });
        const prompt = `Please analyze this frame and describe any significant events or actions occurring. Return a JSON object in this exact format:

{
    "events": [
        {
            "timestamp": "mm:ss",
            "description": "Brief description of what's happening in this frame"
        }
    ]
}

If nothing significant is happening, return {"events": []}.
Be concise but descriptive.
DO NOT include any text outside the JSON.`;

        try {
            const result = await model.generateContent([
                prompt,
                imagePart,
            ]);

            const response = await result.response;
            const text = response.text();
            console.log('Raw API Response:', text);

            consecutiveErrors = 0;
            backoffTime = MIN_CALL_INTERVAL;

            // Try to extract JSON from the response, handling potential code blocks
            let jsonStr = text;
            
            // First try to extract content from code blocks if present
            const codeBlockMatch = text.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
            if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
                console.log('Extracted JSON from code block:', jsonStr);
            } else {
                // If no code block, try to find raw JSON
                const jsonMatch = text.match(/\{[^]*\}/);  
                if (jsonMatch) {
                    jsonStr = jsonMatch[0];
                    console.log('Extracted raw JSON:', jsonStr);
                }
            }

            try {
                const cleanJsonStr = jsonStr.replace(/[\s\S]*?({[\s\S]*})[\s\S]*/m, '$1');
                console.log('Cleaned JSON string:', cleanJsonStr);
                
                const parsed = JSON.parse(cleanJsonStr);
                console.log('Parsed JSON:', parsed);

                if (!parsed.objects || !Array.isArray(parsed.objects)) {
                    console.error('Invalid response structure - missing objects array');
                    return { objects: [] };
                }

                // Validate and normalize objects
                const validObjects = parsed.objects.filter(obj => {
                    try {
                        // Basic structure check
                        if (!obj.label || typeof obj.confidence !== 'number' || !Array.isArray(obj.bbox)) {
                            console.error('Invalid object structure:', obj);
                            return false;
                        }

                        // Validate bbox
                        if (obj.bbox.length !== 4) {
                            console.error('Invalid bbox length:', obj.bbox);
                            return false;
                        }

                        // Convert any string numbers to actual numbers
                        obj.bbox = obj.bbox.map(coord => {
                            const num = typeof coord === 'string' ? parseFloat(coord) : coord;
                            return typeof num === 'number' && !isNaN(num) ? num : null;
                        });

                        // Validate all coordinates are valid numbers between 0 and 1
                        const validCoords = obj.bbox.every(coord => 
                            coord !== null && coord >= 0 && coord <= 1
                        );

                        if (!validCoords) {
                            console.error('Invalid bbox coordinates:', obj.bbox);
                            return false;
                        }

                        return true;
                    } catch (error) {
                        console.error('Error validating object:', error);
                        return false;
                    }
                });

                console.log('Valid objects found:', validObjects);
                return { objects: validObjects, rawResponse: text };
            } catch (parseError) {
                console.error('JSON parsing error:', parseError);
                console.error('Failed to parse text:', jsonStr);
                return { objects: [] };
            }
        } catch (apiError) {
            console.error('API call error:', apiError);
            throw apiError;
        }
    } catch (error: any) {
        // Handle rate limit errors with exponential backoff
        if (error.message.includes('429') || error.message.includes('quota')) {
            consecutiveErrors++;
            if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                backoffTime *= 2; 
            }
            console.error(`Rate limit error. Backing off for ${backoffTime/1000} seconds`);
        }

        console.error("Error detecting objects:", error);
        throw new Error(error.message.includes('429') ? 
            `Rate limit exceeded. Please wait ${Math.ceil(backoffTime/1000)} seconds before trying again.` : 
            `Failed to detect objects: ${error.message}`);
    }
}
