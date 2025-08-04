import os
import json
import logging
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import Agent, AgentSession, JobContext, RoomIO, WorkerOptions, cli
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

HAUPTPRODUKTE die du bewerben sollst:
- Beam InTrack: Stromschienenstrahler mit breitem Leistungsspektrum
- Pick: Ausgezeichneter Einbaustrahler mit innovativem Design
- Tablet: Bluetooth-gesteuerter Strahler für hohe Decken
- Carda 90: Einbaustrahler für gleichmäßige Flächenausleuchtung
- Polar Serie: Bewährte Lichtbrillanz mit höchster Energieeffizienz

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
"""

class EnhancedRDLeuchtenAgent(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_INSTRUCTIONS)


async def entrypoint(ctx: JobContext):
    """Enhanced entrypoint with unified text/voice capabilities using OpenAI Realtime API."""
    logger.info("Starting Enhanced RD Leuchten Agent with OpenAI Realtime API")
    
    try:
        # Create AgentSession with OpenAI Realtime Model
        session = AgentSession(
            llm=openai.realtime.RealtimeModel(
                voice="shimmer",
                model="gpt-4o-realtime-preview-2025-06-03",
                temperature=0.7,
                modalities=["text", "audio"]  # Support both modalities
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
        
        # Start the agent session (this handles connection automatically)
        await session.start(
            agent=EnhancedRDLeuchtenAgent(),
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
                
                # Generate appropriate confirmation message with timeout protection
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

        # Don't send initial greeting - let agent respond to first user message
        # This prevents the timeout errors we were seeing
        logger.info("Enhanced RD Leuchten Agent fully initialized and ready - waiting for user interaction")
        
    except Exception as e:
        logger.error(f"Error initializing agent: {str(e)}")
        raise


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))