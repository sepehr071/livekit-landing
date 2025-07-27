# LiveKit Voice Agent Frontend

A web-based frontend for LiveKit Cloud Python voice agents with Flask backend and real-time voice interaction capabilities.

## Features

- **Auto-Connection**: Automatically connects to a unique room on page load
- **Real-time Voice Interaction**: Seamless communication with AI voice agents
- **Visual Feedback**: Speaking indicators and connection status
- **Audio Controls**: Mute/unmute for both user microphone and agent audio
- **Transcription Display**: Real-time text display with fade effects
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Graceful error recovery and reconnection

## Prerequisites

- Python 3.8 or higher
- LiveKit Cloud account with API credentials
- Modern web browser with WebRTC support

## Quick Setup

1. **Clone or download the project files**

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   
   Edit the `.env` file and replace the placeholder values with your actual LiveKit Cloud credentials:
   ```env
   LIVEKIT_API_KEY=your_actual_livekit_api_key
   LIVEKIT_API_SECRET=your_actual_livekit_api_secret
   LIVEKIT_URL=wss://your-project.livekit.cloud
   ```

4. **Run the Flask application:**
   ```bash
   python app.py
   ```

5. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

## Getting LiveKit Cloud Credentials

1. Go to [LiveKit Cloud](https://cloud.livekit.io/)
2. Sign up or log in to your account
3. Create a new project or select an existing one
4. Go to your project settings
5. Copy your API Key and API Secret
6. Your WebSocket URL will be in the format: `wss://your-project.livekit.cloud`

## Project Structure

```
livekit-voice-agent-frontend/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (configure this!)
├── static/
│   ├── index.html         # Main HTML interface
│   ├── style.css          # CSS styling and animations
│   └── script.js          # JavaScript client logic
├── README.md             # This file
└── .gitignore            # Git ignore file
```

## How It Works

### Backend (Flask)
- **Token Generation**: Creates JWT tokens for LiveKit room access
- **Room Management**: Generates unique room names for each session
- **Static File Serving**: Serves the frontend files
- **API Endpoints**: Provides `/get-token` endpoint for authentication

### Frontend (JavaScript)
- **Auto-Connection**: Fetches token and connects to LiveKit room on page load
- **LiveKit Integration**: Uses LiveKit Client SDK for WebRTC communication
- **Audio Management**: Handles microphone and speaker controls
- **Visual Feedback**: Real-time connection and speaking status indicators
- **Error Handling**: Automatic reconnection and user-friendly error messages

### Connection Flow
1. Page loads and immediately requests a token from Flask backend
2. Flask generates unique room name and JWT token
3. Frontend connects to LiveKit Cloud WebSocket
4. Microphone is automatically enabled (with user permission)
5. Real-time voice communication begins with the AI agent

## Usage

### Basic Controls
- **Microphone Toggle**: Click the microphone button to mute/unmute your microphone
- **Speaker Toggle**: Click the speaker button to mute/unmute the AI agent's audio
- **Text Input**: Type messages in the text field and press Enter or click send
- **Info Button**: Click for connection information

### Keyboard Shortcuts
- **Ctrl + Space**: Toggle microphone
- **Ctrl + M**: Toggle speaker
- **Ctrl + T**: Focus on text input field
- **Enter**: Send typed message (when text input is focused)

### Visual Indicators
- **Connection Status**: 
  - 🔴 Red: Disconnected
  - 🟡 Yellow: Connecting
  - 🟢 Green: Connected
- **Speaking Indicators**: Animated icons show when you or the AI agent is speaking
- **Audio Levels**: Visual bars show real-time audio activity

### Transcription
- User speech and AI responses are displayed in real-time
- Text automatically fades out after new conversation begins
- Different styling distinguishes between user and agent messages

## Troubleshooting

### Common Issues

1. **"Failed to get authentication token"**
   - Check your LiveKit API credentials in `.env`
   - Ensure Flask server is running
   - Verify your internet connection

2. **"Microphone permission denied"**
   - Allow microphone access in your browser
   - Check browser settings for microphone permissions
   - Try refreshing the page

3. **"Connection failed"**
   - Verify your LiveKit URL is correct
   - Check if your LiveKit Cloud project is active
   - Ensure you have sufficient LiveKit Cloud credits

4. **Audio not working**
   - Check your system audio settings
   - Ensure microphone and speakers are connected
   - Try toggling the mute/unmute buttons

### Browser Compatibility
- **Recommended**: Chrome, Firefox, Safari (latest versions)
- **Required**: WebRTC support
- **Mobile**: iOS Safari, Android Chrome

### Development Mode
The application runs in development mode by default with debug enabled. For production deployment:

1. Set `FLASK_ENV=production` in your `.env` file
2. Use a production WSGI server like Gunicorn
3. Configure proper HTTPS certificates
4. Set up a reverse proxy (Nginx/Apache)

## Security Notes

- Never commit your `.env` file with real credentials to version control
- Always use HTTPS in production
- Implement proper authentication for production use
- Consider implementing rate limiting for the token endpoint

## API Endpoints

### GET /get-token
Returns a JWT token for LiveKit room access.

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "room": "voice-agent-a1b2c3d4",
  "identity": "user-e5f6g7h8",
  "url": "wss://your-project.livekit.cloud"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T10:30:00.000Z"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is provided as-is for educational and development purposes.

## Support

For LiveKit-specific issues, consult the [LiveKit Documentation](https://docs.livekit.io/).

For project-specific issues, please check the troubleshooting section above.