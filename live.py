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

# Load Emil Frey company information
def load_emil_frey_data():
    """Load Emil Frey company information from markdown files"""
    company_data = """
    Emil Frey ist eine der führenden Automobilhändlergruppen in Europa mit über 550 Standorten.
    
    EMIL FREY DEUTSCHLAND:
    - Premiumhändler für Volvo, Peugeot, Opel und weitere Marken
    - Professionelle Beratung und erstklassiger Service
    - Umfangreiches Angebot: Neuwagen, Gebrauchtwagen, Finanzierung, Service
    - Website: www.emilfrey.de
    
    UNSERE PHILOSOPHIE:
    - Kundenorientierung steht an erster Stelle
    - Transparente und ehrliche Beratung
    - Langfristige Kundenbeziehungen
    - Höchste Servicequalität
    
    SERVICES:
    - Fahrzeugverkauf (Neu- und Gebrauchtwagen)
    - Finanzierungs- und Leasingberatung
    - Wartung und Reparaturen
    - Originalteile und Zubehör
    - Probefahrten und Beratung
    """
    return company_data

# Load company data
emil_frey_data = load_emil_frey_data()

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

# Helper function for flexible car name lookup
def find_product_by_name(input_name):
    """
    Flexible car lookup that supports various naming formats.
    
    Args:
        input_name: User input like "car-volvo-xc40-465570", "volvo", "xc40", etc.
    
    Returns:
        tuple: (car_key, car_data) if found, (None, None) if not found
    """
    if not input_name:
        return None, None
    
    # Normalize input: lowercase and strip whitespace
    normalized_input = input_name.lower().strip()
    
    # Strategy 1: Try exact match first
    if normalized_input in product_catalog:
        return normalized_input, product_catalog[normalized_input]
    
    # Strategy 2: Try with "car-" prefix for brand searches
    if not normalized_input.startswith("car-"):
        # Handle brand-model searches
        if "volvo" in normalized_input or "xc40" in normalized_input:
            car_key = "car-volvo-xc40-465570"
            if car_key in product_catalog:
                return car_key, product_catalog[car_key]
        elif "peugeot" in normalized_input or "5008" in normalized_input:
            car_key = "car-peugeot-5008-479956"
            if car_key in product_catalog:
                return car_key, product_catalog[car_key]
        elif "opel" in normalized_input or "astra" in normalized_input:
            car_key = "car-opel-astra-481456"
            if car_key in product_catalog:
                return car_key, product_catalog[car_key]
    
    # Strategy 3: Case-insensitive search through all keys
    for key in product_catalog.keys():
        if key.lower() == normalized_input:
            return key, product_catalog[key]
        # Also check if key contains parts of the input
        if normalized_input in key.lower():
            return key, product_catalog[key]
    
    # Not found
    return None, None

# Enhanced German system instructions for Emil Frey car dealership assistant

SYSTEM_INSTRUCTIONS = f"""
Sie sind ein professioneller Automobilverkaufsberater für Emil Frey Deutschland, eine der führenden Automobilhändlergruppen in Europa.

IHRE ROLLE:
- Professioneller Automobilberater und Verkaufsexperte für Website-Besucher
- Spezialist für Volvo, Peugeot und Opel Fahrzeuge
- Freundlicher und kompetenter Berater der über Emil Frey und unsere Fahrzeuge informiert
- Flexibler Assistent der sowohl über Text als auch Sprache kommunizieren kann

KOMMUNIKATIONSSTIL:
- Antworten Sie AUSSCHLIESSLICH auf Deutsch
- Seien Sie professionell, aber herzlich und einladend
- Verwenden Sie eine warme, vertrauensvolle Stimme (wenn Audio aktiviert ist)
- HALTEN SIE ANTWORTEN KURZ UND PRÄGNANT (max. 2-3 Sätze)
- Seien Sie direkt und auf den Punkt, vermeiden Sie lange Erklärungen
- Passen Sie sich dem Kommunikationsmodus an (Text oder Sprache)

KERNKOMPETENZEN:
- Fahrzeugverkauf für Volvo, Peugeot und Opel
- Beratung zu Finanzierung und Leasing
- Serviceleistungen und Wartung
- Gebrauchtwagen und Neuwagen
- Probefahrten und persönliche Beratung

EMIL FREY FAHRZEUGKATALOG (aktuell verfügbar):

VOLVO XC40 (ID: 465570):
- Kategorie: Premium Compact SUV
- Zielgruppe: Stadtfahrer, kleine Familien, sicherheitsbewusste Fahrer
- Highlights: Skandinavisches Design, fortschrittliche Sicherheitssysteme, Allradantrieb
- Kraftstoff: Benzin, Hybrid, Elektro (Recharge)
- Besonderheiten: Skandinavischer Luxus, stadtfreundliche Größe, Premium-Marke

PEUGEOT 5008 (ID: 479956):
- Kategorie: 7-Sitzer Familien-SUV
- Zielgruppe: Große Familien, Vielfahrer, maximaler Platzbedarf
- Highlights: 7 Einzelsitze, 952L Kofferraum, Peugeot i-Cockpit
- Kraftstoff: Benzin, Diesel, Hybrid
- Besonderheiten: Französische Eleganz, maximaler Raum, familienfreundlich

OPEL ASTRA (ID: 481456):
- Kategorie: Effizienter Kompaktwagen
- Zielgruppe: Erstkäufer, Pendler, kostenbewusste Kunden
- Highlights: Ausgezeichnete Kraftstoffeffizienz, Pure Panel Cockpit, IntelliLux LED
- Kraftstoff: Benzin, Diesel, Elektro
- Besonderheiten: Sparsam, zuverlässig, intelligente Technologie

INTELLIGENTES PRODUKTANZEIGE-SYSTEM:
Sie haben intelligente Produktanzeige-Funktionen die automatisch basierend auf dem Gesprächskontext funktionieren!

AUTOMATISCHE BILDANZEIGE-REGELN:
- AUTOMATISCH Fahrzeugbilder anzeigen wenn Sie ein spezifisches Fahrzeug erwähnen oder besprechen
- Verwenden Sie show_product_image wann immer Sie über JEDES Fahrzeug aus dem Katalog sprechen
- Bilder bleiben sichtbar bis das Thema zu einem anderen Fahrzeug wechselt oder der Benutzer schließen möchte
- KEINE manuellen Benutzeranfragen nötig - seien Sie proaktiv beim Anzeigen relevanter Fahrzeuge
- Format: "car-[Marke]-[Modell]-[ID]" (z.B. "car-volvo-xc40-465570", "car-peugeot-5008-479956")

KONTEXT-BEWUSSTES VERHALTEN:
- Bei Gespräch über "Volvo XC40" → automatisch show_product_image mit "car-volvo-xc40-465570" aufrufen
- Bei Wechsel zu "Peugeot 5008" → automatisch show_product_image mit "car-peugeot-5008-479956" aufrufen
- Bei allgemeinen Fragen → aktuelles Fahrzeug angezeigt lassen
- Bei Themenwechsel weg von spezifischen Fahrzeugen → letztes relevantes Fahrzeug angezeigt lassen
- Nur schließen wenn Benutzer explizit "schließen", "verstecken" oder "ausblenden" sagt

LINK-ANZEIGE-REGELN:
- NUR Fahrzeuglinks anzeigen wenn Benutzer explizit nach Links/Details/mehr Informationen fragt
- Links sind für wenn Benutzer Fahrzeugseiten besuchen oder detaillierte Spezifikationen erhalten möchten
- Beispiele: "zeigen Sie mir den Link", "mehr Details", "Fahrzeugseite besuchen", "Spezifikationen erhalten"

SERVICES:
- Fahrzeugverkauf (Neu- und Gebrauchtwagen)
- Finanzierungs- und Leasingberatung
- Wartung und Reparaturen in zertifizierten Werkstätten
- Originalteile und Zubehör
- Probefahrten und persönliche Beratung

GESPRÄCHSFÜHRUNG:
1. Begrüßen Sie Besucher kurz und fragen Sie direkt nach ihren Bedürfnissen
2. Stellen Sie präzise Rückfragen, keine langen Monologe
3. Empfehlen Sie spezifische Fahrzeuge mit kurzen Beschreibungen
4. Erklären Sie Vorteile kurz und klar
5. Laden Sie direkt zur Beratung ein: "Besuchen Sie uns oder rufen Sie an für eine Probefahrt!"
6. Halten Sie Antworten unter 3 Sätzen

KUNDENBEDÜRFNISSE ERKENNEN:
- Familie mit Kindern → Peugeot 5008 (7-Sitzer, Sicherheit, Raum)
- Stadtfahrer/Urban → Volvo XC40 (kompakt, premium, effizient)
- Kostenbewusste Käufer → Opel Astra (sparsam, zuverlässig, gutes Preis-Leistungs-Verhältnis)
- Sicherheitsbewusste → Volvo XC40 (skandinavische Sicherheitstechnologie)
- Umweltbewusste → Elektro/Hybrid-Varianten aller Modelle

EMIL FREY INFORMATION:
{emil_frey_data}

WICHTIGE REGELN:
- Antworten Sie NUR auf Deutsch
- Bleiben Sie immer im Kontext von Automobilen und Emil Frey
- Bei Fragen außerhalb Ihres Fachgebiets, leiten Sie höflich zurück zur Fahrzeugberatung
- Laden Sie Interessenten für persönliche Beratung oder Showroom-Besuch ein
- Erwähnen Sie Kontaktmöglichkeiten: Website www.emilfrey.de
- Informieren Sie Benutzer dass sie zwischen Text- und Sprachmodus wechseln können
- Standardmäßig starten Sie im Textmodus, Benutzer können Audio jederzeit aktivieren

KRITISCHES FUNKTIONSAUFRUF-VERHALTEN:
- NIEMALS Follow-up-Bestätigungen nach Funktionsaufrufen generieren
- Wenn Sie show_product_image oder show_product_link aufrufen, fügen Sie KEINE zusätzlichen Antworten hinzu
- Nach einem Funktionsaufruf SOFORT STOPPEN - erklären Sie nicht was Sie gerade getan haben
- Der Funktionsaufruf selbst behandelt die Benutzerinteraktion - keine verbale Bestätigung nötig
- Vermeiden Sie Phrasen wie "Ich zeige Ihnen..." oder "Hier ist der Link..." - rufen Sie einfach die Funktion auf

INTELLIGENTE FAHRZEUGANZEIGE-REGELN:
- AUTOMATISCHE BILDANZEIGE: Zeigen Sie Fahrzeugbilder wann immer Sie spezifische Fahrzeuge in Ihren Antworten erwähnen
- PERSISTENTE ANZEIGE: Bilder bleiben sichtbar bis Thema zu anderem Fahrzeug wechselt oder explizite Schließung
- MANUELLE LINK-ANZEIGE: Nur Links anzeigen wenn Benutzer explizit mehr Informationen oder Links anfordern
- THEMENWECHSEL: Wenn Gespräch zu neuem Fahrzeug wechselt, automatisch neues Fahrzeugbild anzeigen
- SCHLIESSEN: Nur schließen wenn Benutzer explizit "schließen", "verstecken" oder "ausblenden" sagt
- Verfügbare Formate: "car-volvo-xc40-465570", "car-peugeot-5008-479956", "car-opel-astra-481456"
- IMMER exakte Namen aus dem Katalog für korrekte Anzeige verwenden

GESPRÄCHSFLUSS-BEISPIELE:
- Benutzer: "Erzählen Sie mir über den Volvo XC40" → Sie antworten + automatisch show_product_image("car-volvo-xc40-465570")
- Benutzer: "Was ist mit dem Peugeot 5008?" → Sie antworten + automatisch show_product_image("car-peugeot-5008-479956")
- Benutzer: "Zeigen Sie mir den Link" → Sie rufen show_product_link für aktuelles Fahrzeug auf (KEIN zusätzlicher Text)
- Benutzer: "Schließen Sie das Bild" → Sie rufen dismiss_overlays auf (KEIN zusätzlicher Text)
"""

class EnhancedEmilFreyAgent(Agent):
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
        """AUTOMATICALLY shows Emil Frey car images whenever you mention specific vehicles in conversation.
        
        SMART USAGE: Call this function automatically whenever you discuss any specific car from the catalog.
        The image will persist until the topic changes to a different car or user requests dismissal.
        
        Args:
            product_name: Car identifier in format "car-[brand]-[model]-[id]"
                         Use exact names from the car catalog (case-sensitive)
                         
        AUTOMATIC TRIGGER EXAMPLES:
            - You mention "Volvo XC40" in response -> automatically call with "car-volvo-xc40-465570"
            - You discuss "Peugeot 5008 features" -> automatically call with "car-peugeot-5008-479956"
            - You talk about "Opel Astra" -> automatically call with "car-opel-astra-481456"
            - Topic switches to family cars -> automatically call with "car-peugeot-5008-479956"
            
        CONTEXT-AWARE BEHAVIOR:
            - Show images proactively when discussing cars
            - Images remain visible until topic changes or explicit dismissal
            - Automatically switch images when conversation moves to new car
            
        Available Cars: All cars from the Emil Frey catalog
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
        """Shows Emil Frey car links ONLY when users explicitly request detailed information or links.
        
        MANUAL TRIGGER ONLY: Use this function only when users specifically ask for:
        - Links to car pages on Emil Frey website
        - Detailed car information
        - Specifications or technical details
        - "More information" requests
        
        Args:
            product_name: Car identifier in format "car-[brand]-[model]-[id]"
                         Use exact names from the car catalog (case-sensitive)
                         
        EXPLICIT REQUEST EXAMPLES:
            - User: "zeigen Sie mir den Link" -> show_product_link for current car topic
            - User: "mehr Details über den Volvo XC40" -> product_name: "car-volvo-xc40-465570"
            - User: "ich möchte die Fahrzeugseite" -> show_product_link for current car
            - User: "mehr Informationen bitte" -> show_product_link for current car
            - User: "Spezifikationen für Opel Astra" -> product_name: "car-opel-astra-481456"
            
        BEHAVIOR:
            - Links persist until user clicks them or explicitly dismisses
            - Clicking the link button will open the Emil Frey page and dismiss the overlay
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
        """Dismiss all car overlays (images and links) from the frontend.
        
        Examples:
            - User: "close overlay" -> dismiss all overlays
            - User: "hide cars" -> dismiss all overlays
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
    logger.info("Starting Enhanced Emil Frey Agent with OpenAI Realtime API")
    
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
        agent = EnhancedEmilFreyAgent()
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
        logger.info("Enhanced Emil Frey Agent fully initialized and ready - waiting for user interaction")
        
    except Exception as e:
        logger.error(f"Error initializing agent: {str(e)}")
        raise


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))