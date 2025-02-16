# HawkWatch - AI-Powered Security Surveillance

![Gif 1](public/gifs/landing.gif)
![Gif 2](public/gifs/gallary.gif)
## Inspiration
In an era where security cameras are everywhere but meaningful surveillance is scarce, we saw an opportunity to transform passive recording systems into intelligent security guardians. Our inspiration came from real-world incidents where crucial moments were missed despite having camera coverage, and the overwhelming challenge security personnel face in monitoring multiple video feeds simultaneously. We wanted to create a solution that doesn't just record but understands, analyzes, and acts, whether it's for local businesses like grocery markets to bigger organizations like hospitals and shopping malls.

## What it does
HawkWatch is an intelligent video surveillance platform that detects crime, suspicious activities and life threatening events such as fainting and choking and sends phone alerts to alert security of the issue. Our intelligent model generates time-stamped incident reports with video evidence. It has 3 main features:
1. Real-time analysis of video streams using Google's Gemini Visual Language Model
2. An upload feature that uploads an existing mp4 file for crime analysis
3. A library of saved livestream footage and mp4 uploads, with detailed security analysis complete with timeline and information which is saved with each entry

### Additional features
* Sends instant alerts to security through email/phone notifications
* Provides an intuitive dashboard for monitoring multiple cameras
* Offers both real-time streaming and uploaded video analysis
* Statistics page which offers an AI summary, chart analysis, and the option to export to CSV.

## How we built it
Our tech stack combines modern tools for a robust, scalable solution:
* **Frontend**: Next.js 13+ with TypeScript and Tailwind CSS for a responsive UI
* **Backend**: Supabase for authentication and database management
* **AI Processing**: TensorFlow.js GlazeFace model for real-time video analysis
* **Email/Phone Service**: Resend API for reliable phone notification alerts
* **Real-time Updates**: Canvas API

## Challenges we ran into
1. **Performance Optimization**: Balancing real-time video processing with browser performance and Gemini rate limits
2. **AI Model Accuracy**: Fine-tuning detection algorithms to minimize false positives
3. **Video Stream Handling**: Managing multiple video streams without overwhelming the system

## Accomplishments that we're proud of
* Created a fully functional AI surveillance system in 36 hours
* Achieved real-time processing with minimal latency
* Implemented a beautiful, intuitive user interface
* Built a scalable architecture that can handle multiple cameras
* Developed a system that's accessible through any modern browser

## What we learned
* Advanced video processing techniques in the browser
* Real-time data handling with WebSocket connections
* AI model optimization for edge cases
* Complex state management in React applications
* Integration of multiple third-party services
* The importance of user experience in security applications

## What's next for HawkWatch
Future enhancements we're planning:

### 1. Advanced AI Features
* Person identification and recognition
* Object tracking across multiple cameras
* Behavioral pattern analysis

### 2. Enhanced Security
* End-to-end encryption
* GDPR compliance tools
* Advanced access control

### 3. Smart Home Integration
* Integration with popular smart home platforms
* Automated response actions
* Voice assistant compatibility

Our vision is to make HawkWatch the go-to platform for intelligent video surveillance, making security monitoring more efficient and effective for everyone.