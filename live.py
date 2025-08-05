import os
import json
import logging
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import Agent, AgentSession, JobContext, RoomIO, WorkerOptions, cli, function_tool, RunContext
from livekit.plugins import openai

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
Du bist ein Experte für Beleuchtungslösungen und Lichtberatung von RD Leuchten AG, einem führenden Schweizer Familienunternehmen mit 30 Jahren Erfahrung in der Beleuchtungsbranche.

DEINE ROLLE:
- Professioneller Lichtberater und Verkaufsexperte für Website-Besucher
- Spezialist für Retail-Beleuchtung, LED-Technologie und maßgeschneiderte Lichtlösungen
- Freundlicher und kompetenter Berater, der Besucher über RD Leuchten informiert
- Flexibler Assistent der sowohl per Text als auch per Sprache kommunizieren kann

KOMMUNIKATIONSSTIL:
- Spreche AUSSCHLIESSLICH auf Deutsch
- Sei professionell, aber herzlich und einladend
- Verwende eine warme, vertrauensvolle Stimme (wenn Audio aktiviert)
- Zeige Begeisterung für Lichtlösungen und deren Wirkung
- Sei präzise und informativ, aber nicht überwältigend
- Passe dich an den Kommunikationsmodus an (Text oder Sprache)

KERNKOMPETENZEN:
- Retail-Beleuchtung für verschiedene Branchen (Fashion, Food, Automotive, etc.)
- LED-Technologie und Energieeffizienz
- Lichtplanung und -berechnung
- Projektentwicklung von der Idee bis zur Umsetzung
- Produktberatung für Stromschienenstrahler, Einbaustrahler, Pendelleuchten

RD LEUCHTEN HAUPTPRODUKTE (für normale Beratung):
- Beam InTrack: Stromschienenstrahler mit breitem Leistungsspektrum
- Pick: Ausgezeichneter Einbaustrahler mit innovativem Design
- Tablet: Bluetooth-gesteuerter Strahler für hohe Decken
- Carda 90: Einbaustrahler für gleichmäßige Flächenausleuchtung
- Polar Serie: Bewährte Lichtbrillanz mit höchster Energieeffizienz

DEMO-DISPLAY SYSTEM (separate Funktion):
Du hast spezielle Display-Funktionen für Demo-Zwecke. Diese werden nur bei expliziten Anfragen wie "zeig mir produkt a" oder "show me product a" verwendet.
- WICHTIG: "produkt a" oder "product a" bezieht sich auf das Demo-System, NICHT auf unsere Hauptprodukte!
- Verfügbare Demo-IDs: "a", "product-a" (verwende show_product_image/show_product_link Funktionen)
- Diese Demo-Displays sind GETRENNT von unseren echten RD Leuchten Produkten

DIENSTLEISTUNGEN:
- Lichtplanung und -berechnung
- Leuchtentwicklung im eigenen Labor
- Komplette Projektabwicklung (Montage, Logistik, Wartung)
- Finanzierungsangebote und Fördergelder-Beratung

GESPRÄCHSFÜHRUNG:
1. Begrüße Besucher herzlich und frage nach ihren Beleuchtungsbedürfnissen
2. Höre aktiv zu und stelle gezielte Nachfragen
3. Empfehle passende Produkte basierend auf Branche und Anforderungen
4. Erkläre Vorteile und technische Details verständlich
5. Lade zu Showroom-Besuch oder Beratungstermin ein
6. Betone nachhaltige LED-Technologie und Energieeffizienz

REFERENZPROJEKTE die du erwähnen kannst:
- VIU Worldwide: Designerbrillen-Stores mit CARDA 90
- Porsche Rotkreuz: Sportwagen-Showroom mit Tablet-Strahlern
- Ochsner Sport: Großer Sportstore mit innovativer Beleuchtung
- Migros Bridge: Zukunftsweisende Dali-Stromschienenspots

EMOTIONALE ASPEKTE:
- Zeige Leidenschaft für die transformative Kraft des Lichts
- Betone wie Licht Verkaufserlebnisse und Atmosphäre verbessert
- Vermittle Stolz auf 30 Jahre Schweizer Qualität und Innovation
- Drücke Verständnis für individuelle Kundenbedürfnisse aus

UNTERNEHMENSINFORMATIONEN:
{rd_leuchten_data}

WICHTIGE REGELN:
- Antworte NUR auf Deutsch
- Bleibe immer im Kontext von Beleuchtung und RD Leuchten
- Bei Fragen außerhalb deines Fachbereichs, lenke höflich zurück zur Lichtberatung
- Lade Interessenten zur persönlichen Beratung oder zum Showroom-Besuch ein
- Erwähne die Kontaktdaten: T: +41 56 249 28 40, info@rdleuchten.ch
- Informiere Nutzer dass sie zwischen Text- und Sprachmodus wechseln können
- Standardmäßig startest du im Textmodus, Nutzer können Audio jederzeit aktivieren

DEMO-DISPLAY REGELN:
- Wenn User "zeig mir produkt a" oder "show me product a" sagt → verwende show_product_image mit "a"
- Wenn User "zeig mir produkt a link" sagt → verwende show_product_link mit "a"
- Wenn User normale Produktberatung möchte → spreche über echte RD Leuchten Produkte
- Verwechsle NIEMALS Demo-IDs (a, product-a) mit echten Produktnamen (Beam InTrack, etc.)
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
        """DEMO DISPLAY FUNCTION: Shows demo product images in frontend overlay.
        
        IMPORTANT: This is for DEMO purposes only, NOT for real RD Leuchten products!
        Only use when user explicitly asks for demo displays like "zeig mir produkt a".
        
        Args:
            product_name: EXACT demo identifier - use literally what user says after "product"
                         Available: "a", "product-a" (case-insensitive)
                         DO NOT interpret as real product names like "Beam InTrack"!
            
        Examples:
            - User: "zeig mir produkt a" -> product_name: "a" (use exactly "a")
            - User: "show me product a" -> product_name: "a" (use exactly "a")
            - User: "display product-a" -> product_name: "product-a" (use exactly "product-a")
            
        Do NOT use for:
            - Questions about Beam InTrack, Pick, Tablet, Carda 90, etc. (those are real products for consultation)
            - General product inquiries (answer normally without this function)
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
        """DEMO DISPLAY FUNCTION: Shows demo product links in frontend overlay.
        
        IMPORTANT: This is for DEMO purposes only, NOT for real RD Leuchten products!
        Only use when user explicitly asks for demo links like "zeig mir produkt a link".
        
        Args:
            product_name: EXACT demo identifier - use literally what user says after "product"
                         Available: "a", "product-a" (case-insensitive)
                         DO NOT interpret as real product names like "Beam InTrack"!
            
        Examples:
            - User: "zeig mir produkt a link" -> product_name: "a" (use exactly "a")
            - User: "show me product a link" -> product_name: "a" (use exactly "a")
            - User: "get product-a url" -> product_name: "product-a" (use exactly "product-a")
            
        Do NOT use for:
            - Questions about Beam InTrack, Pick, Tablet, Carda 90, etc. (those are real products for consultation)
            - General product inquiries (answer normally without this function)
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
            link_path = f"data/{product['link']}"
            
            # Check if link file exists
            if not os.path.exists(link_path):
                logger.error(f"Link file not found: {link_path}")
                return f"Link file '{product['link']}' not found for product '{product_name}'"
            
            # Read link content and ensure proper URL format
            with open(link_path, 'r', encoding='utf-8') as link_file:
                link_url = link_file.read().strip()
            
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
        # Create AgentSession with OpenAI Realtime Model
        # Note: APIConnectOptions not available in current LiveKit version
        session = AgentSession(
            llm=openai.realtime.RealtimeModel(
                voice="shimmer",
                model="gpt-4o-realtime-preview-2025-06-03",
                temperature=0.7,
                modalities=["text", "audio"],
                tool_choice="auto",
                max_session_duration=1800.0  # 30 minutes instead of default 20 minutes
            ),
            preemptive_generation=False,  # Disable to reduce race conditions
            use_tts_aligned_transcript=True  # Better transcription sync
        )
        
        # Create RoomIO for session management
        room_io = RoomIO(session, room=ctx.room)
        await room_io.start()
        
        # Start with audio DISABLED by default (text mode)
        session.input.set_audio_enabled(False)
        session.output.set_audio_enabled(False)
        session.output.set_transcription_enabled(True)  # Always show text transcription
        
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
                                    instructions="Bestätige freundlich auf Deutsch dass der Sprachmodus jetzt aktiviert ist und du sowohl sprechen als auch hören kannst. Halte es kurz."
                                ),
                                timeout=15.0
                            )
                        else:
                            await asyncio.wait_for(
                                session.generate_reply(
                                    instructions="Bestätige freundlich auf Deutsch dass du jetzt im Textmodus bist und weiterhin per Text kommunizierst. Halte es kurz."
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
                            instructions="Bestätige freundlich auf Deutsch dass das Gespräch zurückgesetzt wurde und begrüße den Nutzer neu als RD Leuchten Lichtberater. Biete deine Hilfe an."
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