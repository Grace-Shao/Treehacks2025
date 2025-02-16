"use client";

import { useRef, useState } from "react";
import { detectEvents } from "./actions";

type Detection = {
    timestamp: number;
    description: string;
};

export default function TestAPIPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [detections, setDetections] = useState<Detection[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisStatus, setAnalysisStatus] = useState('');

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            setDetections([]);
            setError(null);
            setProgress(0);
            
            // Create object URL for the video
            if (videoRef.current) {
                const url = URL.createObjectURL(file);
                videoRef.current.src = url;
                
                // Wait for video to be loadeddata before enabling analysis
                videoRef.current.onloadeddata = () => {
                    console.log('Video data loaded successfully');
                };
                
                videoRef.current.onerror = (e) => {
                    console.error('Error loading video:', videoRef.current?.error);
                    setError('Error loading video: ' + videoRef.current?.error?.message);
                };
            }
        } else {
            console.log('Invalid file type:', file?.type);
            setError('Please upload a valid video file (MP4, MOV, etc)');
        }
    };

    const captureFrame = async (video: HTMLVideoElement, time: number): Promise<string | null> => {
        if (!canvasRef.current) return null;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            console.error('Failed to get canvas context');
            return null;
        }

        try {
            video.currentTime = time;
        } catch (error) {
            console.error('Error setting video time:', error);
            return null;
        }
        
        // Wait for video to seek to the specified time
        await new Promise((resolve) => {
            video.onseeked = resolve;
        });

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL('image/jpeg', 0.8);
    };



    const updateStatus = (status: string) => {
        setAnalysisStatus(status);
        console.log(status);
    };

    const analyzeVideo = async () => {
        if (!videoRef.current || !videoFile) return;

        const video = videoRef.current;
        setIsProcessing(true);
        setDetections([]);
        setError(null);

        try {
            updateStatus('Loading video metadata...');
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout waiting for video metadata'));
                }, 10000); // 10 second timeout

                if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                    clearTimeout(timeout);
                    resolve(true);
                } else {
                    video.onloadeddata = () => {
                        clearTimeout(timeout);
                        resolve(true);
                    };
                    video.onerror = () => {
                        clearTimeout(timeout);
                        reject(new Error('Failed to load video: ' + video.error?.message));
                    };
                }
            });

            const duration = video.duration;
            console.log('Video duration:', duration);
            
            if (!duration || duration === Infinity || isNaN(duration)) {
                throw new Error('Invalid video duration. Please try a different video file.');
            }
            const interval = 1; // Analyze one frame per second
            const totalFrames = Math.floor(duration);
            let processedFrames = 0;

            const newDetections: Detection[] = [];

            // Process frames at regular intervals
            for (let time = 0; time < duration; time += interval) {
                const currentSecond = Math.floor(time);
                const totalSeconds = Math.floor(duration);
                updateStatus(`Analyzing frame ${currentSecond + 1} of ${totalSeconds} (${Math.round((currentSecond/totalSeconds) * 100)}%)...`);
                const frame = await captureFrame(video, time);
                if (frame) {
                    try {
                        console.log('Processing frame at time:', time);
                        const result = await detectEvents(frame);
                        console.log('Frame processing result:', result);
                        const { events } = result;
                        if (events && events.length > 0) {
                            events.forEach(event => {
                                newDetections.push({
                                    timestamp: time,
                                    description: event.description
                                });
                            });
                        }
                    } catch (error) {
                        console.error('Error analyzing frame:', error);
                    }
                }
                
                processedFrames++;
                setProgress(Math.floor((processedFrames / totalFrames) * 100));
            }

            setDetections(newDetections);
            if (newDetections.length === 0) {
                setError('No significant events detected in the video');
            }
        } catch (error: any) {
            console.error('Error processing video:', error);
            setError(error.message);
        } finally {
            setIsProcessing(false);
        setAnalysisStatus('');
            setProgress(0);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-blue-50">
            <h1 className="text-2xl font-bold mb-4 text-blue-800">Video Event Analyzer</h1>
            <p className="text-gray-600 mb-8 text-center max-w-lg">
                Upload a video to analyze and detect key events. The system will identify significant moments and provide timestamps with descriptions.
            </p>
            
            {/* Video upload and controls */}
            <div className="mb-8 flex flex-col items-center gap-4">
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    onClick={analyzeVideo}
                    disabled={!videoFile || isProcessing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
                >
                    {isProcessing ? 'Analyzing...' : 'Analyze Video'}
                </button>
            </div>

            {/* Video preview */}
            <div className="relative w-[640px] h-[480px] border-4 border-blue-500 mb-4 bg-black">
                <video
                    ref={videoRef}
                    controls
                    className="w-full h-full"
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                />
                <canvas
                    ref={canvasRef}
                    className="hidden" // Hide the canvas as it's only used for processing
                />
                {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="mb-2">Analyzing video...</div>
                            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-600 transition-all duration-300" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Event detection results */}
            <div className="w-[640px] mt-4 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 text-blue-800">Key Events:</h2>
                {detections.length > 0 ? (
                    <div className="space-y-2">
                        {detections.map((detection, index) => (
                            <div key={index} className="p-2 bg-white rounded border hover:bg-blue-50 cursor-pointer"
                                 onClick={() => {
                                     if (videoRef.current) {
                                         videoRef.current.currentTime = detection.timestamp;
                                     }
                                 }}>
                                <div className="font-medium text-black">
                                    Timestamp: {Math.floor(detection.timestamp / 60)}:{(Math.floor(detection.timestamp) % 60).toString().padStart(2, '0')}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {detection.description}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-600">
                        {isProcessing ? (analysisStatus || 'Analyzing video...') : error || 'Upload and analyze a video to detect events'}
                    </div>
                )}
            </div>
        </div>
    );
}
