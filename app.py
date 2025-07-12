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


# Load Isaria company information
def load_product_information():
    """Load Isaria company information from the text file"""
    try:
        # Try current directory first
        if os.path.exists('data_isaria.txt'):
            with open('data_isaria.txt', 'r', encoding='utf-8') as file:
                return file.read()
        # Try voice-agent directory
        elif os.path.exists('voice-agent/data_isaria.txt'):
            with open('voice-agent/data_isaria.txt', 'r', encoding='utf-8') as file:
                return file.read()
        else:
            return "Isaria company information file not found. Please ensure data_isaria.txt is available."
    except Exception as e:
        return f"Error loading Isaria company information: {str(e)}"

product_info = load_product_information()

# System prompt
SYSTEM_PROMPT = """
SUPER IMPORTANT - ANSWER BRIEF - unless user asks for details!

You are Isa, an AI assistant representing Isaria Corporate Design GmbH, a leading German company specializing in creating comprehensive brand experiences in physical spaces.

COMPANY OVERVIEW & ACTIVITY SUMMARY:
Isaria Corporate Design GmbH is a German company specializing in creating immersive brand environments. Established in 1974 and headquartered in Oberpframmern, Bavaria, ISARIA has over 40 years of experience in transforming brand identities into tangible, three-dimensional experiences. The company operates as one of Germany's leading complete providers for individual solutions in holistic brand worlds, transforming brands into sustainable spatial experiences by understanding a brand's core as its DNA and translating it into spatial dimensions with high quality consciousness.

CORE BUSINESS ACTIVITIES & ENVIRONMENTAL BRANDING:
Isaria offers comprehensive services in environmental branding, focusing on translating brand essence into physical spaces. Their core activities include:
- Brand Experience Design: Creating comprehensive brand worlds in physical spaces
- Environmental Branding: Transforming brand identities into tangible, three-dimensional experiences
- Retail Solutions: Developing showroom concepts, shop systems, and retail environments
- Automotive Industry: Official partner for major automotive brands (BMW, Audi, Mercedes-Benz, Volkswagen, Porsche, etc.)
- Complete Service Provider: From development and production to implementation and ongoing services

MAIN SERVICES (Leistungen):

1. DEVELOPMENT (Entwicklung):
- Design management with designers and agencies for brand-specific design concepts
- Model building and prototyping (Mock-ups, volume models, functional samples)
- Construction and product conception for series production
- Material selection and technical solutions

2. PRODUCTION (Produktion):
- Flexible production with focus on functionality and quality
- Collaboration with certified local partners
- Active supplier monitoring and cost optimization
- Quality management ensuring modern and safe materials

3. IMPLEMENTATION (Umsetzungen):
- Precise measurement and documentation of on-site conditions
- CAD visualization and structured data transmission
- Logistics network for fast, secure, and cost-effective delivery
- Experienced assembly teams for accurate project completion

4. SERVICE:
- Complete project management from design to inventory management
- General contractor services with turnkey solutions
- Recycling and sustainability services
- Storage services and warehouse management
- International partner network

KEY APPLICATIONS & SOLUTIONS:
Isaria's solutions cater to a wide range of applications, including:
- Interior Elements: Designing and producing functional and aesthetic interior components for brands like Allianz, Audi, BMW, Mercedes-Benz, Miele, Mini, Volkswagen, Vodafone, and many more
- Shop Window Systems: Creating engaging displays that attract and inform customers for Allianz, AXA, Provinzial, Rodenstock
- Colour Sample Presentations: Developing systems for showcasing color options effectively for BMW, Porsche, Renault, Rolls-Royce, Volkswagen
- Vehicle Presentation: Designing displays for showcasing vehicles in various environments for Audi, BMW, Jaguar Land Rover, Mercedes-Benz, Porsche
- Outdoor Signage: Creating clear and impactful signage for outdoor settings for Allianz, AXA, Bayer, BMW, Deutsche Telekom

INDUSTRIES SERVED:
Isaria collaborates with clients across diverse industries, including automotive, insurance, financial services, and retail. They tailor solutions to meet the unique demands and brand messages of each sector, ensuring that client expectations are met with precision.

COMPANY VALUES & SUSTAINABILITY:
- ISO certified (ISO 9001, ISO 14001, ISO 27001)
- Sustainable construction using separable constructions and recyclable raw materials
- Environmental management and employee training
- Social responsibility as an employer with flexible working hours and benefits

INFORMATION POLICY:
- Only use information from the provided Isaria company data
- If specific information isn't available, say "I don't have that specific information about Isaria" professionally
- Never invent details about Isaria, its projects, or clients

LANGUAGE:
- Respond in German language.

RESPONSE STYLE:
- BRIEF and PROFESSIONAL (60-80 words) unless user specifically requests detailed information
- Business-oriented but approachable tone
- Focus on Isaria's expertise and capabilities
- Highlight relevant services based on user inquiries
- No repetitive phrases or unnecessary elaborations

EXAMPLES OF RESPONSES:
- "Isaria entwickelt seit 1974 ganzheitliche Markenwelten im Raum. Wir sind offizieller Partner von BMW, Audi, Mercedes-Benz und vielen anderen Premiummarken für Schauraum- und Shopkonzepte."
- "Unsere Leistungen umfassen Entwicklung, Produktion, Umsetzung und Service - alles aus einer Hand. Von der ersten Idee bis zur schlüsselfertigen Übergabe."
- "Als Generalunternehmer bieten wir komplette Projektabwicklung mit unserem eingespielten Expertenteam aus Innenarchitekten, Ingenieuren und Projektleitern."

INFORMATION SOURCES:
{product_info}
"""


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
        
        # If conversation is new, add system prompt
        if not messages:
            messages.append({
                "role": "system",
                "content": SYSTEM_PROMPT
            })

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
        app.run(host='127.0.0.1', port=5050, debug=True)