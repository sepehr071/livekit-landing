/**
 * 🇩🇪 German Language Configuration
 * For German-speaking markets (Germany, Austria, Switzerland)
 */
export const deLocalization = {
  language: "de",
  text: {
    defaultGreeting: {
      text: "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
      voice: "Hallo! Ich bin Ihr KI-Assistent. Sie können jetzt sprechen oder weiterhin schreiben."
    },
    ui: {
      sendMessage: "Nachricht senden",
      sendingMessage: "Nachricht wird gesendet...",
      activateVoice: "Sprachmodus aktivieren",
      switchToText: "Zum Textmodus wechseln",
      enableMicrophone: "Mikrofon aktivieren",
      disableMicrophone: "Mikrofon deaktivieren",
      openLink: "Link öffnen",
      copyLink: "Link kopieren",
      close: "schließen",
      back: "zurück",
      send: "senden",
      voice: "sprache",
      textInputPlaceholder: "Geben Sie Ihre Nachricht ein...",
      voiceInputPlaceholder: "Sprechen oder schreiben...",
      connecting: "Verbindung zum KI-Assistenten...",
      connected: "Mit KI-Assistant verbunden",
      disconnected: "Nicht verbunden",
      connectionError: "Fehler: {error}",
      establishingConnection: "Verbindung wird hergestellt...",
      productDismissText: "Sagen Sie \"schließen\" zum Ausblenden",
      linkDismissText: "Klicken Sie auf den Link oder sagen Sie \"schließen\"",
      linkCopiedSuccess: "✓ Link in die Zwischenablage kopiert!",
      linkLabel: "Produktlink",
      domainLabel: "Domain: {domain}",
      imageOverlayInstructions: "Klicken Sie auf das Bild zum Zoomen • ESC drücken oder außerhalb klicken zum Schließen",
      linkOverlayInstructions: "Klicken Sie auf den Link zum Schließen, ESC drücken oder außerhalb klicken",
      zoomIn: "Vergrößern",
      zoomOut: "Verkleinern",
      closeEsc: "Schließen (ESC)",
      loadingAvatar: "Avatar wird geladen...",
      avatarReady: "Avatar bereit",
      productFallback: "Produkt",
      productLinkFallback: "Produktlink",
      voiceModeActive: "🎤 Sprachmodus aktiv - Sie können sprechen oder schreiben",
      textModeActive: "💬 Textmodus aktiv - Klicken Sie oben um Sprache zu aktivieren"
    },
    errors: {
      connectionFailed: "Verbindung fehlgeschlagen",
      microphoneAccess: "Mikrofon-Zugriff verweigert",
      sendMessageFailed: "Nachricht konnte nicht gesendet werden",
      audioToggleFailed: "Audio-Modus konnte nicht gewechselt werden",
      mediaDeviceError: "Mediengerät-Fehler: {error}",
      animationLoadFailed: "Animation konnte nicht geladen werden",
      animationLibraryUnavailable: "Animations-Bibliothek nicht verfügbar"
    }
  }
};