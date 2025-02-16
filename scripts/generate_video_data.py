import os
import time
import json
import google.generativeai as genai
from pathlib import Path

def load_env():
    """Load environment variables from .env.local"""
    env_path = Path(__file__).parent.parent / '.env.local'
    if not env_path.exists():
        raise FileNotFoundError(f"Environment file not found: {env_path}")
        
    with env_path.open() as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip().strip('"').strip("'")

# Load environment variables and configure Gemini
load_env()
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

def upload_to_gemini(path, mime_type=None):
    """Uploads the given file to Gemini."""
    file = genai.upload_file(path, mime_type=mime_type)
    print(f"Processing: {path}")
    return file

def wait_for_files_active(files):
    """Waits for the given files to be active."""
    print("Waiting for file processing...")
    for name in (file.name for file in files):
        file = genai.get_file(name)
        while file.state.name == "PROCESSING":
            print(".", end="", flush=True)
            time.sleep(10)
            file = genai.get_file(name)
        if file.state.name != "ACTIVE":
            raise Exception(f"File {file.name} failed to process")
    print("...file ready")
    print()

def process_video(video_path, model):
    """Process a single video and return its analysis"""
    try:
        # Upload and process video
        video_file = upload_to_gemini(str(video_path), mime_type="video/mp4")
        wait_for_files_active([video_file])

        # Start chat and send single prompt
        chat = model.start_chat()
        prompt = """
        Please analyze this video and provide:
        1. A realistic location where this could have been filmed (based on visual elements) (country/region)
        2. A timeline of key events with timestamps (mm:ss format)
        3. Whether a crime occurred and what type
        
        Be specific and detailed in your analysis.
        """
        
        response = chat.send_message([video_file, prompt])
        return response.text
    except Exception as e:
        return f"ERROR processing {video_path.name}: {str(e)}"

def main():
    # Create the model
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
    }

    model = genai.GenerativeModel(
        # model_name="gemini-2.0-pro-exp-02-05",
        model_name="gemini-2.0-flash",
        generation_config=generation_config,
    )

    # Get all MP4 files
    videos_dir = Path("public/videos")
    video_files = sorted(videos_dir.glob("*.mp4"))
    
    # Process each video and append results
    output_path = Path("lib/video_analysis_raw.txt")
    for video_path in video_files:
        print(f"\nProcessing video: {video_path.name}")
        
        response = process_video(video_path, model)
        
        # Append response with clear separator
        with output_path.open("a") as f:
            f.write(f"\n\n{'='*80}\n")
            f.write(f"# Analysis for: {video_path.name}\n")
            f.write(f"# Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"{'='*80}\n\n")
            f.write(response)
        
        print(f"Response appended to {output_path}")
        
        # Small delay between videos to avoid rate limiting
        time.sleep(2)

if __name__ == "__main__":
    main()
