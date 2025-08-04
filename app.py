import os
import uuid
from datetime import datetime, timedelta
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from livekit import api
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# LiveKit configuration
LIVEKIT_API_KEY = os.getenv('LIVEKIT_API_KEY')
LIVEKIT_API_SECRET = os.getenv('LIVEKIT_API_SECRET')
LIVEKIT_URL = os.getenv('LIVEKIT_URL', 'wss://your-project.livekit.cloud')

# Validate LiveKit credentials
if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
    logger.error("LiveKit API credentials not found. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables.")

@app.route('/get-token', methods=['GET'])
def get_token():
    """Generate and return a LiveKit access token with enhanced permissions for unified chat."""
    try:
        # Generate unique room name for unified chat
        room_name = f"unified-chat-{uuid.uuid4().hex[:8]}"
        
        # Generate unique identity for the user
        identity = f"user-{uuid.uuid4().hex[:8]}"
        
        # Create access token with standard permissions
        token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET) \
            .with_identity(identity) \
            .with_name(f"User {identity}") \
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True
            )) \
            .with_ttl(timedelta(hours=2))  # Longer session for better UX
        
        jwt_token = token.to_jwt()
        
        logger.info(f"Generated enhanced token for user {identity} in room {room_name}")
        
        return jsonify({
            'token': jwt_token,
            'room': room_name,
            'identity': identity,
            'url': LIVEKIT_URL
        })
        
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        return jsonify({'error': 'Failed to generate token'}), 500

# Note: All chat functionality is now handled by the LiveKit agent
# via RPC methods and text streams. No separate endpoints needed.

@app.route('/data/<path:filename>', methods=['GET'])
def serve_data_file(filename):
    """Serve files from the data directory (images, documents, etc.)."""
    try:
        # Security: Only allow files from the data directory
        data_dir = os.path.abspath('data')
        if not os.path.exists(data_dir):
            logger.error("Data directory not found")
            return jsonify({'error': 'Data directory not found'}), 404
            
        # Check if file exists and is within data directory
        file_path = os.path.join(data_dir, filename)
        if not os.path.exists(file_path) or not file_path.startswith(data_dir):
            logger.warning(f"File not found or access denied: {filename}")
            return jsonify({'error': 'File not found'}), 404
            
        logger.info(f"Serving data file: {filename}")
        return send_from_directory(data_dir, filename)
        
    except Exception as e:
        logger.error(f"Error serving data file {filename}: {str(e)}")
        return jsonify({'error': 'Failed to serve file'}), 500

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
    logger.info("Starting simplified Flask app for LiveKit token generation")
    # Check if running in production
    if os.getenv('FLASK_ENV') == 'production':
        app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=False)
    else:
        app.run(host='0.0.0.0', port=5050, debug=True)