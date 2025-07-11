import os
import uuid
import json
import requests
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify, request, send_from_directory, Response, session
from flask_cors import CORS
from livekit import api
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.secret_key = os.urandom(24)  # For session management

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# LiveKit configuration
LIVEKIT_API_KEY = os.getenv('LIVEKIT_API_KEY')
LIVEKIT_API_SECRET = os.getenv('LIVEKIT_API_SECRET')
LIVEKIT_URL = os.getenv('LIVEKIT_URL', 'wss://your-project.livekit.cloud')

# OpenRouter configuration
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "google/gemini-2.5-flash"

# In-memory conversation storage (session-based)
conversations = {}

if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
    logger.error("LiveKit API credentials not found. Please set LIVEKIT_API_KEY and LIVEKIT_API_SECRET environment variables.")

if not OPENROUTER_API_KEY:
    logger.error("OpenRouter API key not found. Please set OPENROUTER_API_KEY environment variable.")

@app.route('/')
def index():
    """Serve the chat mode page (default)."""
    return send_from_directory('static/chat', 'index.html')

@app.route('/voice')
def voice_mode():
    """Serve the voice mode page."""
    return send_from_directory('static/voice', 'index.html')

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

def get_conversation_history(session_id):
    """Get conversation history for a session."""
    return conversations.get(session_id, [])

def save_conversation_history(session_id, messages):
    """Save conversation history for a session."""
    conversations[session_id] = messages

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests with OpenRouter API streaming."""
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        session_id = session.get('session_id')
        
        # Create session ID if it doesn't exist
        if not session_id:
            session_id = str(uuid.uuid4())
            session['session_id'] = session_id
        
        # Get conversation history
        messages = get_conversation_history(session_id)
        
        # Add user message to history
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Prepare OpenRouter request
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ai-assistant.local",
            "X-Title": "AI Assistant"
        }
        
        payload = {
            "model": OPENROUTER_MODEL,
            "messages": messages,
            "stream": True,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        def generate():
            try:
                # Make streaming request to OpenRouter
                response = requests.post(
                    OPENROUTER_API_URL,
                    headers=headers,
                    json=payload,
                    stream=True
                )
                
                if response.status_code != 200:
                    yield f"data: {json.dumps({'error': 'OpenRouter API error'})}\n\n"
                    return
                
                assistant_message = ""
                
                # Process streaming response
                for line in response.iter_lines():
                    if line:
                        line = line.decode('utf-8')
                        if line.startswith('data: '):
                            data_str = line[6:]
                            if data_str == '[DONE]':
                                break
                            
                            try:
                                data_obj = json.loads(data_str)
                                if 'choices' in data_obj and len(data_obj['choices']) > 0:
                                    delta = data_obj['choices'][0].get('delta', {})
                                    content = delta.get('content', '')
                                    if content:
                                        assistant_message += content
                                        yield f"data: {json.dumps({'content': content})}\n\n"
                            except json.JSONDecodeError:
                                continue
                
                # Save complete conversation after streaming
                messages.append({
                    "role": "assistant",
                    "content": assistant_message
                })
                save_conversation_history(session_id, messages)
                
                # Send completion signal
                yield f"data: {json.dumps({'done': True, 'full_message': assistant_message})}\n\n"
                
            except Exception as e:
                logger.error(f"Error in chat streaming: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return Response(generate(), mimetype='text/plain')
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/conversation', methods=['GET'])
def get_conversation():
    """Get current conversation history."""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'messages': []})
        
        messages = get_conversation_history(session_id)
        return jsonify({'messages': messages, 'session_id': session_id})
        
    except Exception as e:
        logger.error(f"Error getting conversation: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/clear-conversation', methods=['POST'])
def clear_conversation():
    """Clear current conversation history."""
    try:
        session_id = session.get('session_id')
        if session_id and session_id in conversations:
            del conversations[session_id]
        
        # Create new session
        new_session_id = str(uuid.uuid4())
        session['session_id'] = new_session_id
        
        return jsonify({'success': True, 'session_id': new_session_id})
        
    except Exception as e:
        logger.error(f"Error clearing conversation: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

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