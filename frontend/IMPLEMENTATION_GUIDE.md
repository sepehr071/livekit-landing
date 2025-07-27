# React Implementation Guide

This guide covers the implementation of OpenRouter chat and LiveKit voice functionality in the React application.

## 📋 Prerequisites

Before running the React application, ensure you have:

1. **Node.js** (v16 or higher)
2. **Flask Backend Running** (on port 5050)
3. **Environment Variables** properly configured in the root `.env` file:
   ```env
   LIVEKIT_API_KEY=your_actual_livekit_api_key
   LIVEKIT_API_SECRET=your_actual_livekit_api_secret
   LIVEKIT_URL=wss://your-project.livekit.cloud
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
cd project
npm install
```

The following packages will be installed:
- `livekit-client`: LiveKit client SDK for React
- `@livekit/components-react`: Official LiveKit React components
- `@rive-app/canvas`: Rive animation engine for interactive avatars

### 2. Start Development Server
```bash
npm run dev
```

The React app will be available at `http://localhost:5173`

### 3. Start Flask Backend
In a separate terminal:
```bash
# From root directory
python app.py
```

The Flask API will run on `http://localhost:5050`

## 🏗️ Architecture Overview

### Custom Hooks
- **`useChat.js`**: Handles OpenRouter API integration with streaming responses
- **`useLiveKit.js`**: Manages LiveKit connection, audio controls, and transcription
- **`useRive.js`**: Controls Rive animations for avatar states

### Components
- **`ChatAvatar.jsx`**: Interactive avatar with Rive animations and speech bubbles
- **`ChatPage1.jsx`**: Text chat interface with OpenRouter integration
- **`ChatPage2.jsx`**: Voice chat interface with LiveKit integration

### Context
- **`LiveKitContext.jsx`**: Provides LiveKit room context for voice functionality

## 🧪 Testing Instructions

### 1. Test Chat Functionality (ChatPage1)
1. Click the support button on the main page
2. Type a message in the input field
3. Click send or press Enter
4. Verify:
   - ✅ Loading animation appears
   - ✅ Streaming response displays in real-time
   - ✅ Avatar animations respond to chat state
   - ✅ Error handling works for failed requests

### 2. Test Voice Functionality (ChatPage2)
1. Navigate to voice mode from chat page
2. Allow microphone permission when prompted
3. Verify:
   - ✅ Connection status updates correctly
   - ✅ LiveKit room connection established
   - ✅ Microphone toggle works
   - ✅ Audio levels detected
   - ✅ Transcription appears (if available)
   - ✅ Avatar responds to voice states

### 3. Test Rive Animations
1. Verify avatar loads correctly on both pages
2. Check animation states:
   - ✅ `isSpeaking` state during agent responses
   - ✅ `IsListening` state during user interaction
   - ✅ Smooth transitions between states

## 🔧 API Endpoints Used

The React app connects to these Flask endpoints:

- **`POST /chat`**: OpenRouter streaming chat
- **`GET /get-token`**: LiveKit authentication token
- **`GET /conversation`**: Chat history (optional)
- **`POST /clear-conversation`**: Clear chat history (optional)

## 🐛 Troubleshooting

### Common Issues

#### 1. "Failed to get LiveKit token"
- Ensure Flask backend is running on port 5050
- Check LiveKit credentials in `.env` file
- Verify network connectivity

#### 2. "Rive animation failed to load"
- Ensure `danak.riv` file is in `/static/` directory
- Check console for specific Rive errors
- Verify file path in `useRive` hook

#### 3. "Microphone permission denied"
- Grant microphone access in browser
- Check browser security settings
- Use HTTPS in production

#### 4. Chat streaming not working
- Verify OpenRouter API key in `.env`
- Check Flask backend logs
- Ensure proxy configuration in `vite.config.js`

### Debug Mode

The application includes debug information in development mode:
- Animation state indicators in `ChatAvatar`
- Console logs for connection status
- Error messages with detailed information

## 📁 File Structure

```
project/src/
├── components/
│   ├── ChatAvatar.jsx          # Interactive avatar component
│   └── SupportButton.jsx       # Main page support button
├── contexts/
│   └── LiveKitContext.jsx      # LiveKit room provider
├── hooks/
│   ├── useChat.js             # OpenRouter chat integration
│   ├── useLiveKit.js          # LiveKit voice functionality
│   └── useRive.js             # Rive animation controls
├── pages/
│   ├── ChatPage1.jsx          # Text chat interface
│   ├── ChatPage2.jsx          # Voice chat interface
│   └── MainPage.jsx           # Landing page
├── App.jsx                    # Main app component
└── main.jsx                   # React app entry point
```

## 🚀 Production Deployment

For production deployment:

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Update proxy settings** to point to production Flask server

3. **Ensure HTTPS** for microphone access in voice mode

4. **Configure environment variables** for production LiveKit and OpenRouter endpoints

## 📝 Development Notes

- The implementation follows React best practices with functional components and hooks
- Error boundaries are implemented for robust error handling
- The application is responsive and works on mobile devices
- LiveKit integration uses official React components for better performance
- Rive animations provide smooth avatar interactions synchronized with chat and voice states

## 🔄 Next Steps

Potential enhancements:
- Add conversation history persistence
- Implement user authentication
- Add more animation states
- Enhance error recovery mechanisms
- Add accessibility features