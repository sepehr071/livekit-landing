/**
 * 🏢 COMPANY CONFIGURATION FILE
 * 
 * This file contains all customizable settings for different company deployments.
 * Update this file for each customer deployment to customize branding, text, and behavior.
 * 
 * 🚀 Quick Setup Guide:
 * 1. Update company info and branding
 * 2. Set your theme colors  
 * 3. Configure asset paths (Rive animation, images)
 * 4. Customize text content and translations
 * 5. Deploy with your settings
 */

const CompanyConfig = {
  // 🏢 COMPANY INFORMATION
  company: {
    name: "RD Leuchten AG",
    industry: "lighting", // Used for context in conversations
    country: "Switzerland",
    contact: {
      phone: "+41 56 249 28 40",
      email: "info@rdleuchten.ch",
      website: "https://rdleuchten.ch"
    }
  },

  // 🎨 THEME & BRANDING
  theme: {
    // Primary brand colors (used for main elements)
    primary: {
      light: "#fb923c", // Orange 400
      main: "#f97316",  // Orange 500
      dark: "#ea580c"   // Orange 600
    },
    
    // Secondary colors (voice mode)
    secondary: {
      light: "#60a5fa", // Blue 400
      main: "#3b82f6",  // Blue 500
      dark: "#2563eb"   // Blue 600
    },

    // Status colors
    status: {
      success: "#10b981", // Green 500
      warning: "#f59e0b", // Amber 500
      error: "#ef4444",   // Red 500
      info: "#6b7280"     // Gray 500
    },

    // Background gradients
    backgrounds: {
      textMode: {
        primary: "from-white/95 via-orange-50/70 to-orange-100/80",
        header: "from-[#dbbe9b]/60 via-[#f5e6d3]/40 to-transparent",
        footer: "from-orange-200/60 via-orange-100/40 to-white/10"
      },
      voiceMode: {
        primary: "from-blue-50/40 via-blue-25/20 to-blue-50/30",
        header: "from-[#dbbe9b]/60 via-[#f5e6d3]/40 to-transparent",
        footer: "from-blue-200/60 via-blue-100/40 to-white/10"
      }
    },

    // Widget styling
    widget: {
      position: "bottom-4 right-4", // Tailwind positioning classes
      size: {
        width: "w-96",
        height: "h-[820px]",
        mobileWidth: "sm:w-80 md:w-96"
      },
      animation: {
        duration: "duration-[700ms]",
        avatarTransition: "duration-[1200ms]"
      }
    }
  },

  // 🎭 ASSETS & MEDIA
  assets: {
    // Rive animation file (place in /public folder)
    riveAnimation: "/danak.riv",
    
    // Background images
    images: {
      characterBackground: "/images/Rectangle-character.png",
      productBackground: "/images/Rectangle-image.png"
    },
    
    // Icons
    icons: {
      close: "/images/icons8-cancel.png",
      back: "/images/icons8-back.png",
      send: "/images/send.png",
      voice: "/images/voice.png"
    }
  },

  // 🌐 LOCALIZATION & TEXT CONTENT
  localization: {
    // Primary language
    language: "de", // de, en, fr, it, es, etc.
    
    // Text content (can be moved to separate language files)
    text: {
      // Agent messages
      defaultGreeting: {
        text: "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
        voice: "Hallo! Ich bin Ihr KI-Assistent. Sie können jetzt sprechen oder weiterhin schreiben."
      },
      
      // UI Elements
      ui: {
        // Buttons
        sendMessage: "Nachricht senden",
        sendingMessage: "Nachricht wird gesendet...",
        activateVoice: "Sprachmodus aktivieren",
        switchToText: "Zum Textmodus wechseln",
        enableMicrophone: "Mikrofon aktivieren",
        disableMicrophone: "Mikrofon deaktivieren",
        openLink: "Open Link",
        copyLink: "Copy link to clipboard",
        close: "close",
        back: "back",
        send: "send",
        voice: "voice",
        
        // Input placeholders
        textInputPlaceholder: "Geben Sie Ihre Nachricht ein...",
        voiceInputPlaceholder: "Sprechen oder schreiben...",
        
        // Status messages
        connecting: "Verbindung zum KI-Assistenten...",
        connected: "Mit KI-Assistant verbunden",
        disconnected: "Nicht verbunden",
        connectionError: "Fehler: {error}",
        establishingConnection: "Verbindung wird hergestellt...",
        
        // Product display
        productDismissText: "Say \"close\" to dismiss",
        linkDismissText: "Click link to dismiss or say \"close\"",
        linkCopiedSuccess: "✓ Link copied to clipboard!",
        linkLabel: "Product Link",
        domainLabel: "Domain: {domain}",
        
        // Overlay instructions
        imageOverlayInstructions: "Click image to zoom • Press ESC or click outside to close",
        linkOverlayInstructions: "Click link to dismiss, press ESC, or click outside to close",
        zoomIn: "Zoom In",
        zoomOut: "Zoom Out",
        closeEsc: "Close (ESC)",
        
        // Loading states
        loadingAvatar: "Loading avatar...",
        avatarReady: "Avatar Ready",
        
        // Mode information
        voiceModeActive: "🎤 Sprachmodus aktiv - Sie können sprechen oder schreiben",
        textModeActive: "💬 Textmodus aktiv - Klicken Sie oben um Sprache zu aktivieren"
      },
      
      // Error messages
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
  },

  // ⚙️ BEHAVIOR SETTINGS
  behavior: {
    // Auto-connect on page load
    autoConnect: true,
    
    // Default mode (text or voice)
    defaultMode: "text",
    
    // Animation settings
    animations: {
      enableAvatarAnimations: true,
      enableTransitions: true,
      reducedMotion: false // For accessibility
    },
    
    // Connection settings
    connection: {
      autoReconnect: true,
      maxRetries: 5,
      retryDelay: 1000
    },
    
    // UI behavior
    ui: {
      enableKeyboardShortcuts: true,
      autoHideErrors: true,
      errorDisplayDuration: 3000,
      enableProductDisplay: true,
      responsiveBreakpoint: 768
    }
  },

  // 📱 RESPONSIVE SETTINGS
  responsive: {
    mobile: {
      // Avatar positioning when products are shown (mobile)
      avatarTransform: "translate(180px, -80px) scale(0.9)",
      avatarBorderRadius: "97%"
    },
    desktop: {
      // Avatar positioning when products are shown (desktop)
      avatarTransform: "translate(210px, -110px) scale(0.90)",
      avatarBorderRadius: "50%"
    }
  }
};

export default CompanyConfig;