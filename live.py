import os
import json
import logging
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import Agent, AgentSession, JobContext, RoomIO, WorkerOptions, cli, function_tool, RunContext
from livekit.plugins import openai
from openai.types.beta.realtime.session import TurnDetection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Load RD Leuchten company information
def load_rd_leuchten_data():
    """Load RD Leuchten company information from markdown files"""
    company_data = ""
    
    try:
        # Load data.md
        if os.path.exists('data.md'):
            with open('data.md', 'r', encoding='utf-8') as file:
                company_data += file.read() + "\n\n"
        
        # Load data2.md (more comprehensive)
        if os.path.exists('data2.md'):
            with open('data2.md', 'r', encoding='utf-8') as file:
                company_data += file.read()
                
        return company_data
    except Exception as e:
        return f"Fehler beim Laden der Unternehmensdaten: {str(e)}"

# Load company data
rd_leuchten_data = load_rd_leuchten_data()

# Load product catalog
def load_product_catalog():
    """Load product catalog from JSON file"""
    try:
        if os.path.exists('data/products.json'):
            with open('data/products.json', 'r', encoding='utf-8') as file:
                return json.load(file)
        return {}
    except Exception as e:
        logger.error(f"Error loading product catalog: {str(e)}")
        return {}

product_catalog = load_product_catalog()

# Helper function for flexible product name lookup
def find_product_by_name(input_name):
    """
    Flexible product lookup that supports various naming formats.
    
    Args:
        input_name: User input like "a", "A", "product-a", etc.
    
    Returns:
        tuple: (product_key, product_data) if found, (None, None) if not found
    """
    if not input_name:
        return None, None
    
    # Normalize input: lowercase and strip whitespace
    normalized_input = input_name.lower().strip()
    
    # Strategy 1: Try exact match first
    if normalized_input in product_catalog:
        return normalized_input, product_catalog[normalized_input]
    
    # Strategy 2: Try with "product-" prefix
    prefixed_name = f"product-{normalized_input}"
    if prefixed_name in product_catalog:
        return prefixed_name, product_catalog[prefixed_name]
    
    # Strategy 3: Try removing "product-" prefix if present
    if normalized_input.startswith("product-"):
        short_name = normalized_input.replace("product-", "")
        if short_name in product_catalog:
            return short_name, product_catalog[short_name]
    
    # Strategy 4: Case-insensitive search through all keys
    for key in product_catalog.keys():
        if key.lower() == normalized_input:
            return key, product_catalog[key]
        # Also check if removing "product-" from key matches input
        if key.lower().startswith("product-"):
            short_key = key.lower().replace("product-", "")
            if short_key == normalized_input:
                return key, product_catalog[key]
    
    # Not found
    return None, None

# Enhanced German system instructions for unified RD Leuchten assistant

SYSTEM_INSTRUCTIONS = f"""
You are a lighting solutions expert and lighting consultant for RD Leuchten AG, a leading Swiss family company with 30 years of experience in the lighting industry.

YOUR ROLE:
- Professional lighting consultant and sales expert for website visitors
- Specialist in retail lighting, LED technology and customized lighting solutions
- Friendly and competent consultant who informs visitors about RD Leuchten
- Flexible assistant who can communicate both through text and voice

COMMUNICATION STYLE:
- Respond EXCLUSIVELY in German language
- Be professional, but warm and welcoming
- Use a warm, trustworthy voice (when audio is activated)
- KEEP ANSWERS SHORT AND CONCISE (max. 2-3 sentences)
- Be direct and to the point, avoid long explanations
- Adapt to the communication mode (text or voice)

CORE COMPETENCIES:
- Retail lighting for various industries (Fashion, Food, Automotive, etc.)
- LED technology and energy efficiency
- Light planning and calculation
- Project development from idea to implementation
- Product consulting for track lights, recessed lights, pendant lights

RD LEUCHTEN PRODUCT CATALOG (complete):

STROMSCHIENENLEUCHTEN - Track Lights (15 products):
- Beam InTrack: Premium track light with wide performance spectrum
- Cono: Modern conical track light
- Pick: Excellent track light with innovative design
- Tablet: Bluetooth-controlled spotlight for high ceilings
- Prestige: High-quality track lighting solution
- Tube: Tubular track light
- Sequel 90: Compact 90mm track series
- Sequel 110: Extended 110mm track series
- Slender: Slim track lighting solution
- Lita T-One: Single-head track light
- Lita T-Two: Double-head track light
- Tracline: Linear track lighting solution
- Lucerna: Elegant track lighting series
- Stromschienen: Track systems and components
- Stromschienen Zubehör: Connectors, feeders and accessories
- Prestige Carda: Premium track recessed light

EINBAULEUCHTEN - Recessed Lights (9 products):
- Carda 90: Bestseller recessed light for uniform area illumination
- Carda 90 Downlight: Downlight version of Carda 90
- Carda 110: Larger version of the successful Carda series
- Carda Competence: Professional Carda version
- Piccolo Downlight: Compact recessed downlights
- Polar 90: Proven recessed series with highest energy efficiency
- Polar Universal: Versatile Polar solution for various applications
- Pick Einbau: Recessed version of the popular Pick spotlight
- Piccolo Carda: Compact Carda recessed solution

PENDELLEUCHTEN - Pendant Lights (2 products):
- Flat Panel: Flat LED panel lights for suspension
- Pick Pendel: Pendant version of the Pick spotlight

INTELLIGENT PRODUCT DISPLAY SYSTEM:
You have intelligent product display capabilities that work automatically based on conversation context!

AUTOMATIC IMAGE DISPLAY RULES:
- AUTOMATICALLY show product images whenever you mention or discuss a specific product
- Use show_product_image whenever you talk about ANY product from the catalog
- Images stay persistent until topic changes to another product or user asks to close
- NO manual user requests needed - be proactive in showing relevant products
- Format: "product-[Product name]" (e.g. "product-Beam InTrack", "product-Carda 90")

CONTEXT-AWARE BEHAVIOR:
- When discussing "Carda 90" → automatically call show_product_image with "product-Carda 90"
- When switching to "Beam InTrack" → automatically call show_product_image with "product-Beam InTrack"
- When user asks general questions → keep current product displayed
- When topic moves away from specific products → you may keep last relevant product shown
- Only dismiss when user specifically asks to "close", "hide", or "dismiss" images

LINK DISPLAY RULES:
- ONLY show product links when user explicitly asks for links/details/more information
- Links are for when users want to visit product pages or get detailed specifications
- Examples: "show me the link", "more details", "visit product page", "get specifications"

SERVICES:
- Light planning and calculation
- Luminaire development in own laboratory
- Complete project management (assembly, logistics, maintenance)
- Financing offers and subsidy consulting

CONVERSATION MANAGEMENT:
1. Greet visitors briefly and ask directly about their needs
2. Ask precise follow-up questions, no long monologues
3. Recommend specific products with short descriptions
4. Explain advantages briefly and clearly
5. Invite directly for consultation: "Rufen Sie uns an: +41 56 249 28 40"
6. Keep answers under 3 sentences

REFERENCE PROJECTS by industries:

FASHION & LIFESTYLE (6 projects):
- VIU Worldwide: Designer glasses stores with CARDA 90
- Beldona Aarau: Lingerie store with elegant lighting
- L&T Osnabrück: Fashion retail with modern lighting solutions
- Ochsner Sport Zürich: Large sports store with innovative lighting
- Breuninger Stuttgart: Premium department store with luxury lighting
- Bike World: Bicycle specialty stores with targeted product lighting
- Visilab: Optical specialty stores with precise workplace lighting

FOOD & GASTRONOMY (10 projects):
- Migros Bridge: Forward-thinking Dali track spots
- Ricola Store Laufen: Herb experience world with natural lighting
- Loeb Bern: Premium delicatessen with warm lighting
- Migros Ostermundigen: Modern supermarket with energy-efficient LED technology
- Macardo Swiss Distillery: Distillery with atmospheric lighting
- Globus Delicatessa: Gourmet department with appetizing lighting
- Hit Dohle Supermarkt: Large-scale supermarket with uniform illumination
- M Preis: Austrian supermarket chain with sustainable lighting
- Globus Deutschland: German department stores with high-quality lighting

AUTOMOTIVE (3 projects):
- Porsche Rotkreuz: Sports car showroom with Tablet spotlights
- Central Garage Wälty: Car dealership with professional workshop and showroom lighting
- Amag Hauptsitz: Corporate headquarters with representative lighting

NON-FOOD RETAIL (5 projects):
- Kuhn Rikon: Cookware stores with functional product lighting
- Kuhn Rikon Flag Ship Store: Flagship store with premium lighting concept
- Balthasar & Co.: Lifestyle store with atmospheric lighting
- MY BENI: Retail concept with modern lighting solutions
- Christ: Jewelry and watch stores with brilliant product lighting

HEALTH & BEAUTY (1 project):
- Ärztehaus & Apotheke Hofwis Elsau: Medical center with hygienic and functional lighting

DEPARTMENT STORES (1 project):
- Manor Bern: Swiss department store with comprehensive lighting solution

ARCHITECTURE & PUBLIC SPACES (2 projects):
- Metalli Zug: Shopping center with architectural lighting design
- Shopping Arena St. Gallen: Large shopping center with energy-efficient lighting

EMOTIONAL ASPECTS:
- Show passion for the transformative power of light
- Emphasize how light improves sales experiences and atmosphere
- Convey pride in 30 years of Swiss quality and innovation
- Express understanding for individual customer needs

COMPANY INFORMATION:
{rd_leuchten_data}

IMPORTANT RULES:
- Respond ONLY in German language
- Always stay in the context of lighting and RD Leuchten
- For questions outside your field of expertise, politely redirect back to lighting consultation
- Invite prospects for personal consultation or showroom visit
- Mention contact details: T: +41 56 249 28 40, info@rdleuchten.ch
- Inform users that they can switch between text and voice mode
- By default you start in text mode, users can activate audio anytime
- When users ask to "list all products" or similar requests, only show the product categories (Stromschienenleuchten, Einbauleuchten, Pendelleuchten), not individual product names

CRITICAL FUNCTION CALL BEHAVIOR:
- NEVER generate follow-up confirmations after calling function tools
- When you call show_product_image or show_product_link, DO NOT add any additional responses
- After calling a function tool, STOP immediately - do not explain what you just did
- The function call itself handles the user interaction - no verbal confirmation needed
- Avoid phrases like "Ich zeige Ihnen..." or "Hier ist der Link..." - just call the function

SMART PRODUCT DISPLAY RULES:
- AUTOMATIC IMAGE DISPLAY: Show product images whenever you mention specific products in your responses
- PERSISTENT DISPLAY: Images remain visible until topic changes to different product or explicit dismissal
- MANUAL LINK DISPLAY: Only show links when users explicitly request more information or links
- TOPIC SWITCHING: When conversation moves to new product, automatically show new product image
- DISMISSAL: Only dismiss when user says "close", "hide", "dismiss" or similar commands
- Available formats: "product-Beam InTrack", "product-Carda 90", "project-VIU Worldwide", etc.
- ALWAYS use exact names from the catalog for correct display

CONVERSATION FLOW EXAMPLES:
- User: "Tell me about Carda 90" → You respond + automatically show_product_image("product-Carda 90")
- User: "What about Beam InTrack?" → You respond + automatically show_product_image("product-Beam InTrack")
- User: "Show me the link" → You call show_product_link for current product being discussed (NO additional text)
- User: "Close the image" → You call dismiss_overlays (NO additional text)
"""

class EnhancedRDLeuchtenAgent(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_INSTRUCTIONS)
        self._room = None
    
    def set_room(self, room):
        """Set the room reference for RPC calls"""
        self._room = room
    
    @function_tool()
    async def show_product_image(
        self,
        context: RunContext,
        product_name: str
    ) -> str:
        """AUTOMATICALLY shows RD Leuchten product images whenever you mention specific products in conversation.
        
        SMART USAGE: Call this function automatically whenever you discuss any specific product from the catalog.
        The image will persist until the topic changes to a different product or user requests dismissal.
        
        Args:
            product_name: Product identifier in format "product-[ProductName]" or "project-[ProjectName]"
                         Use exact names from the product catalog (case-sensitive)
                         
        AUTOMATIC TRIGGER EXAMPLES:
            - You mention "Carda 90" in response -> automatically call with "product-Carda 90"
            - You discuss "Beam InTrack features" -> automatically call with "product-Beam InTrack"
            - You talk about "VIU project" -> automatically call with "project-VIU Worldwide"
            - Topic switches to "Pick spotlight" -> automatically call with "product-Pick"
            
        CONTEXT-AWARE BEHAVIOR:
            - Show images proactively when discussing products
            - Images remain visible until topic changes or explicit dismissal
            - Automatically switch images when conversation moves to new product
            
        Available Products: All products and projects from the complete catalog
        """
        try:
            logger.info(f"show_product_image called with product_name: '{product_name}'")
            
            # Use flexible product lookup
            product_key, product = find_product_by_name(product_name)
            if not product_key or not product:
                available_products = list(product_catalog.keys())
                logger.warning(f"Product '{product_name}' not found. Available: {available_products}")
                return f"Product '{product_name}' not found in catalog. Available products: {', '.join(available_products)}"
            
            logger.info(f"Found product: '{product_key}' -> {product.get('name', 'Unknown')}")
            image_path = f"data/{product['image']}"
            
            # Check if image file exists
            if not os.path.exists(image_path):
                logger.error(f"Image file not found: {image_path}")
                return f"Image file '{product['image']}' not found for product '{product_name}'"
            
            # Use relative URL - works for both localhost and production
            image_url = f"/images/{product['image']}"
            
            # Prepare payload for RPC (much smaller payload without base64 data)
            payload = {
                "type": "image",
                "product_name": product_key,  # Use the actual key found
                "product_title": product['name'],
                "description": product.get('description', ''),
                "image_url": image_url,  # Send URL instead of base64 data
                "category": product.get('category', '')
            }
            
            logger.info(f"Sending RPC display_product_image for {product['name']}")
            
            # Send RPC to frontend
            if not self._room:
                logger.error("Room not available for RPC communication")
                return "Room not available for RPC communication"
            
            participants = list(self._room.remote_participants.values())
            if participants:
                participant = participants[0]  # Get first participant (user)
                
                response = await self._room.local_participant.perform_rpc(
                    destination_identity=participant.identity,
                    method="display_product_image",
                    payload=json.dumps(payload),
                    response_timeout=10.0  # Increased timeout
                )
                
                logger.info(f"RPC response: {response}")
                return f"Showing image for {product['name']} on your screen."
            else:
                logger.warning("No participants found for RPC")
                return "No participants found to display image to."
                
        except Exception as e:
            logger.error(f"Error showing product image: {str(e)}")
            return f"Error displaying image: {str(e)}"
    
    @function_tool()
    async def show_product_link(
        self,
        context: RunContext,
        product_name: str
    ) -> str:
        """Shows RD Leuchten product links ONLY when users explicitly request detailed information or links.
        
        MANUAL TRIGGER ONLY: Use this function only when users specifically ask for:
        - Links to product pages
        - Detailed product information
        - Specifications or technical details
        - "More information" requests
        
        Args:
            product_name: Product identifier in format "product-[ProductName]" or "project-[ProjectName]"
                         Use exact names from the product catalog (case-sensitive)
                         
        EXPLICIT REQUEST EXAMPLES:
            - User: "show me the link" -> show_product_link for current product topic
            - User: "get more details about Carda 90" -> product_name: "product-Carda 90"
            - User: "I want the product page" -> show_product_link for current product
            - User: "more information please" -> show_product_link for current product
            - User: "specifications for Pick" -> product_name: "product-Pick"
            
        BEHAVIOR:
            - Links persist until user clicks them or explicitly dismisses
            - Clicking the link button will open the page and dismiss the overlay
            - Only show when user explicitly requests links/details
        """
        try:
            logger.info(f"show_product_link called with product_name: '{product_name}'")
            
            # Use flexible product lookup
            product_key, product = find_product_by_name(product_name)
            if not product_key or not product:
                available_products = list(product_catalog.keys())
                logger.warning(f"Product '{product_name}' not found. Available: {available_products}")
                return f"Product '{product_name}' not found in catalog. Available products: {', '.join(available_products)}"
            
            logger.info(f"Found product: '{product_key}' -> {product.get('name', 'Unknown')}")
            
            # Get link URL directly from JSON
            link_url = product.get('link', '')
            
            # Ensure URL has proper protocol
            if link_url and not link_url.startswith(('http://', 'https://', 'mailto:', 'tel:')):
                link_url = f"https://{link_url}"
            
            # Prepare payload for RPC
            payload = {
                "type": "link",
                "product_name": product_key,  # Use the actual key found
                "product_title": product['name'],
                "description": product.get('description', ''),
                "link_url": link_url,
                "category": product.get('category', '')
            }
            
            logger.info(f"Sending RPC display_product_link for {product['name']}")
            
            # Send RPC to frontend
            if not self._room:
                logger.error("Room not available for RPC communication")
                return "Room not available for RPC communication"
            
            participants = list(self._room.remote_participants.values())
            if participants:
                participant = participants[0]  # Get first participant (user)
                
                response = await self._room.local_participant.perform_rpc(
                    destination_identity=participant.identity,
                    method="display_product_link",
                    payload=json.dumps(payload),
                    response_timeout=10.0  # Increased timeout
                )
                
                logger.info(f"RPC response: {response}")
                return f"Showing link for {product['name']} on your screen."
            else:
                logger.warning("No participants found for RPC")
                return "No participants found to display link to."
                
        except Exception as e:
            logger.error(f"Error showing product link: {str(e)}")
            return f"Error displaying link: {str(e)}"
    
    @function_tool()
    async def dismiss_overlays(
        self,
        context: RunContext
    ) -> str:
        """Dismiss all product overlays (images and links) from the frontend.
        
        Examples:
            - User: "close overlay" -> dismiss all overlays
            - User: "hide products" -> dismiss all overlays
            - User: "dismiss" -> dismiss all overlays
        """
        try:
            logger.info("dismiss_overlays called")
            
            # Send RPC to frontend
            if not self._room:
                logger.error("Room not available for RPC communication")
                return "Room not available for RPC communication"
            
            participants = list(self._room.remote_participants.values())
            if participants:
                participant = participants[0]  # Get first participant (user)
                
                response = await self._room.local_participant.perform_rpc(
                    destination_identity=participant.identity,
                    method="dismiss_overlays",
                    payload="",
                    response_timeout=10.0  # Increased timeout
                )
                
                logger.info(f"RPC response: {response}")
                return "All overlays have been dismissed."
            else:
                logger.warning("No participants found for RPC")
                return "No participants found to send dismiss command to."
                
        except Exception as e:
            logger.error(f"Error dismissing overlays: {str(e)}")
            return f"Error dismissing overlays: {str(e)}"


async def entrypoint(ctx: JobContext):
    """Enhanced entrypoint with unified text/voice capabilities using OpenAI Realtime API."""
    logger.info("Starting Enhanced RD Leuchten Agent with OpenAI Realtime API")
    
    try:
        # Create AgentSession with OpenAI Realtime Model with Semantic VAD
        # Note: APIConnectOptions not available in current LiveKit version
        session = AgentSession(
            llm=openai.realtime.RealtimeModel(
                voice="shimmer",
                model="gpt-4o-realtime-preview-2025-06-03",
                temperature=0.7,
                modalities=["text", "audio"],
                tool_choice="auto",
                max_session_duration=1800.0,  # 30 minutes instead of default 20 minutes
                turn_detection=TurnDetection(
                    type="semantic_vad",
                    eagerness="auto",  # Balanced approach - can be "low", "medium", "high", or "auto"
                    create_response=True,
                    interrupt_response=True,
                )
            ),
            preemptive_generation=False,  # Disable to reduce race conditions
            use_tts_aligned_transcript=True  # Enable streaming transcription with speech sync
        )
        
        # Create RoomIO for session management
        room_io = RoomIO(session, room=ctx.room)
        await room_io.start()
        
        # Start with audio DISABLED by default (text mode)
        session.input.set_audio_enabled(False)
        session.output.set_audio_enabled(False)
        session.output.set_transcription_enabled(True)  # Always show text transcription
        
        logger.info("Audio disabled, transcription enabled")
        
        logger.info("Session created, starting with agent...")
        
        # Create and configure the agent
        agent = EnhancedRDLeuchtenAgent()
        agent.set_room(ctx.room)
        
        # Start the agent session (this handles connection automatically)
        await session.start(
            agent=agent,
            room=ctx.room
        )
        
        # Add a small delay to ensure session is fully ready
        import asyncio
        await asyncio.sleep(2)
        
        logger.info("Agent session started, registering RPC methods...")
        
        # RPC Method: Toggle Audio Mode
        @ctx.room.local_participant.register_rpc_method("toggle_audio")
        async def on_toggle_audio(data: rtc.RpcInvocationData) -> str:
            """Toggle between text and voice modes"""
            try:
                enabled = data.payload == "true"
                
                # Toggle both input and output audio
                session.input.set_audio_enabled(enabled)
                session.output.set_audio_enabled(enabled)
                
                mode = "voice" if enabled else "text"
                logger.info(f"Audio toggled by {data.caller_identity}: {mode} mode")
                
                # Generate confirmation message asynchronously (non-blocking)
                async def send_confirmation():
                    try:
                        if enabled:
                            await asyncio.wait_for(
                                session.generate_reply(
                                    instructions="Say ONLY these exact words in German: 'Sprachmodus aktiviert, jetzt können wir sprechen.' Then STOP immediately. Do not add anything else. Do not continue any previous conversation topics."
                                ),
                                timeout=15.0
                            )
                        else:
                            await asyncio.wait_for(
                                session.generate_reply(
                                    instructions="Say ONLY these exact words in German: 'Textmodus aktiviert.' Then STOP immediately. Do not add anything else. Do not continue any previous conversation topics."
                                ),
                                timeout=15.0
                            )
                    except asyncio.TimeoutError:
                        logger.warning("Audio toggle confirmation timed out")
                    except Exception as e:
                        logger.error(f"Error generating audio toggle confirmation: {str(e)}")
                
                # Start confirmation task in background (don't await it)
                asyncio.create_task(send_confirmation())
                
                # Return immediately to prevent frontend timeout
                return f"audio_{mode}"
            except Exception as e:
                logger.error(f"Error toggling audio: {str(e)}")
                return f"error_{str(e)}"

        # RPC Method: Send Text Message
        @ctx.room.local_participant.register_rpc_method("send_text")
        async def on_send_text(data: rtc.RpcInvocationData) -> str:
            """Process text message through the AI agent"""
            try:
                user_message = data.payload
                logger.info(f"Processing text message from {data.caller_identity}: {user_message[:50]}...")
                
                # Use asyncio.wait_for to add timeout protection
                await asyncio.wait_for(
                    session.generate_reply(user_input=user_message),
                    timeout=30.0  # 30 second timeout
                )
                
                return "message_processed"
            except asyncio.TimeoutError:
                logger.error("Text message processing timed out")
                return "error_timeout"
            except Exception as e:
                logger.error(f"Error processing text message: {str(e)}")
                return f"error_{str(e)}"
        
        # RPC Method: Get Agent Status
        @ctx.room.local_participant.register_rpc_method("get_status")
        async def on_get_status(data: rtc.RpcInvocationData) -> str:
            """Return current agent status"""
            try:
                status = {
                    "audio_enabled": session.input.audio_enabled,
                    "transcription_enabled": session.output.transcription_enabled,
                    "connected": True,
                    "mode": "voice" if session.input.audio_enabled else "text",
                    "agent_identity": ctx.room.local_participant.identity
                }
                return json.dumps(status)
            except Exception as e:
                logger.error(f"Error getting status: {str(e)}")
                return json.dumps({"error": str(e)})

        # RPC Method: Clear Conversation
        @ctx.room.local_participant.register_rpc_method("clear_conversation")
        async def on_clear_conversation(data: rtc.RpcInvocationData) -> str:
            """Clear conversation history and restart"""
            try:
                logger.info(f"Conversation clear requested by {data.caller_identity}")
                
                # Generate a fresh greeting with timeout protection
                try:
                    await asyncio.wait_for(
                        session.generate_reply(
                            instructions="Sage nur: 'Gespräch zurückgesetzt. Wie kann ich helfen?'"
                        ),
                        timeout=15.0
                    )
                except asyncio.TimeoutError:
                    logger.warning("Conversation clear confirmation timed out")
                
                return "conversation_cleared"
            except Exception as e:
                logger.error(f"Error clearing conversation: {str(e)}")
                return f"error_{str(e)}"

        logger.info("RPC methods registered successfully")
        
        # Send ready signal to frontend via data channel
        try:
            await ctx.room.local_participant.publish_data(
                payload=json.dumps({"type": "agent_ready", "timestamp": asyncio.get_event_loop().time()}),
                reliable=True
            )
            logger.info("Agent ready signal sent to frontend")
        except Exception as e:
            logger.warning(f"Failed to send agent ready signal: {str(e)}")

        # Don't send initial greeting - let agent respond to first user message
        # This prevents the timeout errors we were seeing
        logger.info("Enhanced RD Leuchten Agent fully initialized and ready - waiting for user interaction")
        
    except Exception as e:
        logger.error(f"Error initializing agent: {str(e)}")
        raise


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))