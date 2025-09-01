/**
 * 🇺🇸 English Language Configuration
 * For English-speaking markets (US, UK, Canada, Australia, etc.)
 */
export const enLocalization = {
  language: "en",
  text: {
    defaultGreeting: {
      text: "Hello! I'm your AI assistant. How can I help you today?",
      voice: "Hello! I'm your AI assistant. You can now speak or continue typing."
    },
    ui: {
      sendMessage: "Send message",
      sendingMessage: "Sending message...",
      activateVoice: "Activate voice mode",
      switchToText: "Switch to text mode",
      enableMicrophone: "Enable microphone",
      disableMicrophone: "Disable microphone",
      openLink: "Open Link",
      copyLink: "Copy link to clipboard",
      close: "close",
      back: "back",
      send: "send",
      voice: "voice",
      textInputPlaceholder: "Type your message here...",
      voiceInputPlaceholder: "Speak or type...",
      connecting: "Connecting to AI assistant...",
      connected: "Connected to AI assistant",
      disconnected: "Not connected",
      connectionError: "Error: {error}",
      establishingConnection: "Establishing connection...",
      productDismissText: "Say \"close\" to dismiss",
      linkDismissText: "Click link to dismiss or say \"close\"",
      linkCopiedSuccess: "✓ Link copied to clipboard!",
      linkLabel: "Product Link",
      domainLabel: "Domain: {domain}",
      imageOverlayInstructions: "Click image to zoom • Press ESC or click outside to close",
      linkOverlayInstructions: "Click link to dismiss, press ESC, or click outside to close",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      closeEsc: "Close (ESC)",
      loadingAvatar: "Loading avatar...",
      avatarReady: "Avatar Ready",
      productFallback: "Product",
      productLinkFallback: "Product Link",
      voiceModeActive: "🎤 Voice mode active - You can speak or continue typing",
      textModeActive: "💬 Text mode active - Click above to activate voice"
    },
    errors: {
      connectionFailed: "Connection failed",
      microphoneAccess: "Microphone access denied",
      sendMessageFailed: "Failed to send message",
      audioToggleFailed: "Failed to toggle audio mode",
      mediaDeviceError: "Media device error: {error}",
      animationLoadFailed: "Failed to load animation",
      animationLibraryUnavailable: "Animation library not available"
    }
  }
};