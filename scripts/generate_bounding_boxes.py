import cv2
import numpy as np
from ultralytics import YOLO
from pathlib import Path
import torch
import json

def process_video(video_path, output_path, json_path, frame_interval=15):
    """
    Process video to detect people and save bounding boxes data.
    Args:
        video_path: Path to input video
        output_path: Path to save output video (commented out)
        json_path: Path to save bounding boxes data
        frame_interval: Process every Nth frame
    """
    # Load the YOLOv8 model - using small model for better accuracy
    model = YOLO("yolov8s.pt")  # Using small model instead of nano for better accuracy

    # Open the video
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise ValueError(f"Error opening video file: {video_path}")

    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Initialize video writer (commented out)
    # fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    # out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))

    frame_count = 0
    last_boxes = None
    boxes_data = {
        "video_info": {
            "name": video_path.name,
            "width": width,
            "height": height,
            "fps": fps,
            "total_frames": total_frames,
            "frame_interval": frame_interval
        },
        "frames": {}
    }

    print(f"Processing video: {video_path.name}")
    print(f"Total frames: {total_frames}")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            # Configure model for higher sensitivity
            results = model.predict(
                frame,
                classes=[0],  # class 0 is person in COCO dataset
                conf=0.2,     # Lower confidence threshold for more detections
                iou=0.2,      # Lower IoU threshold for more overlapping detections
                verbose=False
            )
            
            boxes = []
            confidences = []
            
            # Extract person detections
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    # Convert to integers and ensure within frame bounds
                    x1, y1 = max(0, int(x1)), max(0, int(y1))
                    x2, y2 = min(width, int(x2)), min(height, int(y2))
                    boxes.append([x1, y1, x2, y2])
                    confidences.append(float(box.conf))
            
            last_boxes = boxes
            last_confidences = confidences
        
        # Store bounding boxes for every frame (including interpolated ones)
        if last_boxes:
            boxes_data["frames"][str(frame_count)] = {
                "boxes": last_boxes,
                "confidences": last_confidences,
                "is_keyframe": frame_count % frame_interval == 0
            }
        else:
            boxes_data["frames"][str(frame_count)] = {
                "boxes": [],
                "confidences": [],
                "is_keyframe": frame_count % frame_interval == 0
            }

        # If we have detections, draw them (commented out)
        # if last_boxes:
        #     for box in last_boxes:
        #         x1, y1, x2, y2 = box
        #         # Draw semi-transparent rectangle
        #         overlay = frame.copy()
        #         cv2.rectangle(overlay, (x1, y1), (x2, y2), (0, 255, 0), 2)
        #         # Add some transparency
        #         cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)

        # Write the frame (commented out)
        # out.write(frame)
        
        frame_count += 1
        if frame_count % 100 == 0:
            print(f"Processed {frame_count}/{total_frames} frames")

    # Release everything
    cap.release()
    # out.release()

    # Save JSON data
    with open(json_path, 'w') as f:
        json.dump(boxes_data, f, indent=2)
    print(f"Bounding boxes data saved to: {json_path}")

def main():
    # Process all videos
    videos_dir = Path("public/videos")
    json_dir = Path("public")  # Changed from earlier
    json_dir.mkdir(exist_ok=True)
    
    video_files = sorted(videos_dir.glob("*.mp4"))
    
    if not video_files:
        print("No video files found")
        return
        
    for video_path in video_files:
        # Skip videos that already have boxes
        if video_path.stem.endswith('_boxes'):
            continue
            
        print(f"\nProcessing video: {video_path.name}")
        output_path = videos_dir / f"{video_path.stem}_boxes.mp4"  # Not used but kept for reference
        json_path = json_dir / f"{video_path.stem}_boxes.json"
        process_video(video_path, output_path, json_path)

if __name__ == "__main__":
    main()
