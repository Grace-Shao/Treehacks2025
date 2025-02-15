"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Rate limiting variables
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 1000; // 1 second between calls
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 5;
let backoffTime = MIN_CALL_INTERVAL;

export async function detectObjects(base64Image: string) {
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

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg'
            },
        };

        // Update last call time
        lastCallTime = now;

        console.log('Sending image to API...', { imageSize: base64Data.length });
        const prompt = `You are a precise object detection system focused on water bottles. Analyze the image and return ONLY a JSON object in this exact format, with no additional text:

{
    "objects": [
        {
            "label": "water bottle",
            "confidence": 0.95,
            "bbox": [0.1, 0.2, 0.3, 0.4]
        }
    ]
}

The bbox array MUST contain exactly 4 numbers between 0 and 1, representing [left, top, right, bottom] coordinates.
If no water bottles are found, return {"objects": []}.
Include bottles only if confidence > 0.7.
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

            // Try to extract JSON from the response
            let jsonStr = text;
            const jsonMatch = text.match(/\{[^]*\}/);  
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
                console.log('Extracted JSON string:', jsonStr);
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

                const validObjects = parsed.objects.filter(obj => {
                    const isValid = (
                        obj.label && 
                        typeof obj.confidence === 'number' && 
                        Array.isArray(obj.bbox) && 
                        obj.bbox.length === 4 &&
                        obj.bbox.every(coord => typeof coord === 'number' && coord >= 0 && coord <= 1)
                    );

                    if (!isValid) {
                        console.error('Invalid object structure:', obj);
                        console.error('Validation details:', {
                            hasLabel: !!obj.label,
                            confidenceType: typeof obj.confidence,
                            bboxIsArray: Array.isArray(obj.bbox),
                            bboxLength: obj.bbox?.length,
                            bboxValid: obj.bbox?.every(coord => typeof coord === 'number' && coord >= 0 && coord <= 1)
                        });
                    }
                    return isValid;
                });

                console.log('Valid objects found:', validObjects);
                return { objects: validObjects };
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
