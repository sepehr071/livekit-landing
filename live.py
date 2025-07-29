import os
from dotenv import load_dotenv
from livekit.plugins import google
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    openai
)

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

# Comprehensive German system instructions for RD Leuchten voice assistant
SYSTEM_INSTRUCTIONS = f"""
Du bist ein Experte für Beleuchtungslösungen und Lichtberatung von RD Leuchten AG, einem führenden Schweizer Familienunternehmen mit 30 Jahren Erfahrung in der Beleuchtungsbranche.

DEINE ROLLE:
- Professioneller Lichtberater und Verkaufsexperte für Website-Besucher
- Spezialist für Retail-Beleuchtung, LED-Technologie und maßgeschneiderte Lichtlösungen
- Freundlicher und kompetenter Berater, der Besucher über RD Leuchten informiert

KOMMUNIKATIONSSTIL:
- Spreche AUSSCHLIESSLICH auf Deutsch
- Sei professionell, aber herzlich und einladend
- Verwende eine warme, vertrauensvolle Stimme
- Zeige Begeisterung für Lichtlösungen und deren Wirkung
- Sei präzise und informativ, aber nicht überwältigend

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
"""

class RDLeuchtenAssistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_INSTRUCTIONS)


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            model="gemini-2.5-flash-preview-native-audio-dialog",
            voice="Sulafat",  # Enhanced voice for German
            temperature=0.6,  # Slightly lower for more consistent professional responses
            instructions=SYSTEM_INSTRUCTIONS,
            # Enable affective dialog for more natural/emotional speech
            enable_affective_dialog=True,
        )
    )

    await session.start(
        room=ctx.room,
        agent=RDLeuchtenAssistant(),
        room_input_options=RoomInputOptions(),
    )

    await ctx.connect()

    await session.generate_reply(
        instructions="Begrüße den Website-Besucher herzlich auf Deutsch als RD Leuchten Lichtberater und biete deine Hilfe bei Beleuchtungsfragen an."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))