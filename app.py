import os
import uuid
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
from livekit import api
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"]) # Allow CORS for local testing

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# LiveKit configuration
LIVEKIT_API_KEY = os.getenv('LIVEKIT_API_KEY')
LIVEKIT_API_SECRET = os.getenv('LIVEKIT_API_SECRET')
LIVEKIT_URL = os.getenv('LIVEKIT_URL', 'wss://your-project.livekit.cloud')

if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
    logger.error("LiveKit API credentials not found. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables.")

@app.route('/')
def index():
    """Serve the main HTML interface."""
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files."""
    return send_from_directory('static', filename)


@app.route('/get-token', methods=['GET'])
def get_token():
    """Generate and return a LiveKit access token for a unique room."""
    try:
        # Generate unique room name
        room_name = f"voice-agent-{uuid.uuid4().hex[:8]}"
        
        # Generate unique identity for the user
        identity = f"user-{uuid.uuid4().hex[:8]}"
        
        # Create access token
        token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET) \
            .with_identity(identity) \
            .with_name(f"User {identity}") \
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True
            )) \
            .with_ttl(timedelta(hours=1))
        
        jwt_token = token.to_jwt()
        
        logger.info(f"Generated token for user {identity} in room {room_name}")
        
        return jsonify({
            'token': jwt_token,
            'room': room_name,
            'identity': identity,
            'url': LIVEKIT_URL
        })
        
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        return jsonify({'error': 'Failed to generate token'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Check if running in production
    if os.getenv('FLASK_ENV') == 'production':
        app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=False)
    else:
        app.run(host='localhost', port=5000, debug=True)
