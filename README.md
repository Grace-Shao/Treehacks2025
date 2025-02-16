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
* Offers an OpenAI powered assistant that provides contextual support. The bot is fed real-time information about the ongoing event and can respond to user queries, such as "What should I do in this situation" if someone has passed out, helping with quick context-aware advice
* Offers both real-time streaming and uploaded video analysis
* Statistics page which offers an AI summary, chart analysis, and the option to export to CSV.

## How we built it
Our tech stack combines modern tools for a robust, scalable solution:
* **Frontend**: The UI is built with Next.js 13+ and TypeScript, paired with Tailwind CSS for a sleek, responsive design. This ensures a seamless experience for users across different devices.
* **Backend**: We use Supabase for secure user authentication and database management, allowing for easy access control and efficient data handling.
* **AI Processing**: HawkWatch uses Google's Gemini Visual Language Model (VLM) for real-time video analysis and TensorFlow.js for processing video streams on the client side. These models enable accurate event detection, ranging from criminal activity to health-related emergencies.
* **Email/Phone Service**: Resend API powers our email and phone notification system, ensuring that alerts are sent in real-time with minimal delays.
* **Real-time Updates**: We leverage the Canvas API for live updates, ensuring that HawkWatch’s real-time analysis is fast and accurate, even as it processes multiple video streams.
* **Contextual Assistance**: OpenAI’s language models are integrated to power our assistant bot, which helps security teams with situational guidance. The bot uses context from the most recent events to offer real-time advice, improving the decision-making process during critical moments.

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
* Real-time data handling with WebSocket connections to handle real-time updates effectively
* AI model optimization for edge cases
* Complex state management in React applications, especially when dealing with large datasets
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