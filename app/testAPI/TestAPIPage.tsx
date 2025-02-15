"use client";

import { useEffect, useRef, useState } from "react";
import { detectObjects } from "./actions";

type DetectedObject = {
    label: string;
    confidence: number;
    bbox: [number, number, number, number];
};

export default function TestAPIPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>();

    const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isWebcamReady, setIsWebcamReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Function to capture current video frame
    const captureFrame = async (): Promise<string | null> => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return null;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL('image/jpeg', 0.8);
    };

    /*
    * Function to draw bounding boxes on the canvas
    NOT WORKING RN
    */
    const drawBoundingBoxes = (context: CanvasRenderingContext2D, objects: DetectedObject[]) => {
        if (!objects.length) return;
        
        console.log('Drawing boxes for:', objects);
        
        objects.forEach(obj => {
            const [x1, y1, x2, y2] = obj.bbox;
            
            // Convert normalized coordinates to pixel values
            const x = Math.floor(x1 * context.canvas.width);
            const y = Math.floor(y1 * context.canvas.height);
            const width = Math.floor((x2 - x1) * context.canvas.width);
            const height = Math.floor((y2 - y1) * context.canvas.height);
            
            console.log('Drawing box:', { x, y, width, height });

            // Draw box outline with double stroke for visibility
            // Outer stroke (black)
            context.strokeStyle = '#000000';
            context.lineWidth = 5;
            context.strokeRect(x, y, width, height);
            
            // Inner stroke (red)
            context.strokeStyle = '#FF0000';
            context.lineWidth = 2;
            context.strokeRect(x, y, width, height);
            
            // Add label with background
            const label = 'Water Bottle';
            context.font = 'bold 16px Arial';
            const textWidth = context.measureText(label).width;
            
            // Draw label background
            context.fillStyle = '#000000';
            context.fillRect(x, y - 25, textWidth + 10, 20);
            
            // Draw label text
            context.fillStyle = '#FF0000';
            context.fillText(label, x + 5, y - 10);
        });
    };

    // Function to update canvas
    const updateCanvas = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

        // Only update canvas dimensions if they don't match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            console.log('Updated canvas dimensions:', { width: canvas.width, height: canvas.height });
        }

        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the video frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw bounding boxes if objects are detected
        if (detectedObjects && detectedObjects.length > 0) {
            console.log('Drawing bounding boxes for', detectedObjects.length, 'objects');
            drawBoundingBoxes(context, detectedObjects);
        }

        // Request next frame
        animationFrameRef.current = requestAnimationFrame(updateCanvas);
    };

    useEffect(() => {
        let mounted = true;

        async function setupWebcam() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    } 
                });

                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setIsWebcamReady(true);
                    setError(null);
                }
            } catch (error: any) {
                console.error("Error accessing webcam:", error);
                if (mounted) {
                    setError("Could not access webcam. Please ensure you have granted camera permissions.");
                }
            }
        }

        setupWebcam();

        return () => {
            mounted = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, []);

    useEffect(() => {
        if (isWebcamReady) {
            updateCanvas();
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isWebcamReady]);

    useEffect(() => {
        if (!isWebcamReady || error) return;

        let processInterval: NodeJS.Timeout;
        let isCurrentlyProcessing = false;

        const processFrame = async () => {
            if (isCurrentlyProcessing) return;
            
            isCurrentlyProcessing = true;
            try {
                const base64Image = await captureFrame();
                if (base64Image) {
                    const result = await detectObjects(base64Image);
                    console.log('API Response:', result);
                    if (result && result.objects && result.objects.length > 0) {
                        console.log('Setting detected objects:', result.objects);
                        setDetectedObjects(result.objects);
                        setError(null);
                    } else {
                        console.log('No objects detected');
                        setDetectedObjects([]);
                    }
                }
            } catch (error: any) {
                console.error('Error processing frame:', error);
                if (!error.message.includes('Rate limit')) {
                    setError(error.message);
                }
            } finally {
                isCurrentlyProcessing = false;
            }
        };

        // Process frames every 2 seconds, we can change this
        processInterval = setInterval(processFrame, 2000);
        
        processFrame();

        return () => {
            clearInterval(processInterval);
        };
    }, [isWebcamReady, error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-blue-50">
            <h1 className="text-2xl font-bold mb-4 text-blue-800">Water Bottle Detector</h1>
            <p className="text-gray-600 mb-8 text-center max-w-lg">
                Point your camera at water bottles to detect them in real-time. Works with plastic bottles, reusable bottles, and drink containers.
            </p>
            <div className="relative w-[640px] h-[480px] border-4 border-blue-500">
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ zIndex: 1 }}
                />
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => {
                        console.log('Video loaded, dimensions:', {
                            width: videoRef.current?.videoWidth,
                            height: videoRef.current?.videoHeight
                        });
                        setIsWebcamReady(true);
                    }}
                    className="hidden"
                />
                {error && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-100 text-red-800 p-4 z-10">
                        {error}
                    </div>
                )}
                <div className="absolute top-0 left-0 bg-black/50 text-white p-2 z-10">
                    {detectedObjects.length > 0 ? 'Water bottle detected!' : 'No water bottle detected'}
                </div>
            </div>
        </div>
    );
}
