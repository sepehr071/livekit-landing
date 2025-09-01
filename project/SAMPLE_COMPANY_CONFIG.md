# 🏢 Sample Company Configuration Examples

## Example 1: TechFlow Solutions (English, Corporate Blue Theme)

**File: `project/src/config/company.config.js`**

```javascript
/**
 * Sample Configuration for TechFlow Solutions
 * A modern technology company targeting English-speaking markets
 */

import { corporateBlueTheme } from './themes/corporate-blue.js';
import { enLocalization } from './localization/en.js';

export const companyConfig = {
  // Company Branding
  company: {
    name: "TechFlow Solutions",
    domain: "techflow.io", 
    industry: "technology"
  },

  // Localization
  language: "en",
  localization: enLocalization,

  // Theme
  theme: corporateBlueTheme,

  // Assets
  assets: {
    riveAnimation: "/animations/tech-avatar.riv",
    images: {
      characterBackground: "/images/tech-background.png",
      productContainer: "/images/tech-container.png"
    }
  },

  // Behavior Settings
  behavior: {
    ui: {
      responsiveBreakpoint: 768,
      avatar: {
        mobile: {
          translate: { x: 180, y: -80 },
          scale: 0.9,
          borderRadius: "97%"
        },
        desktop: {
          translate: { x: 210, y: -110 },
          scale: 0.90,
          borderRadius: "50%"
        }
      }
    }
  }
};
```

## Example 2: Präzision Maschinen GmbH (German, Default Theme)

**File: `project/src/config/company.config.js`**

```javascript
/**
 * Sample Configuration for Präzision Maschinen GmbH
 * A German manufacturing company
 */

import { defaultTheme } from './themes/default.js';
import { deLocalization } from './localization/de.js';

export const companyConfig = {
  // Company Branding
  company: {
    name: "Präzision Maschinen GmbH",
    domain: "praezision-maschinen.de",
    industry: "manufacturing"
  },

  // Localization
  language: "de",
  localization: deLocalization,

  // Theme
  theme: defaultTheme,

  // Assets
  assets: {
    riveAnimation: "/animations/industrial-avatar.riv",
    images: {
      characterBackground: "/images/factory-background.png",
      productContainer: "/images/industrial-container.png"
    }
  },

  // Behavior Settings
  behavior: {
    ui: {
      responsiveBreakpoint: 768,
      avatar: {
        mobile: {
          translate: { x: 170, y: -85 },
          scale: 0.85,
          borderRadius: "95%"
        },
        desktop: {
          translate: { x: 200, y: -120 },
          scale: 0.88,
          borderRadius: "48%"
        }
      }
    }
  }
};
```

## Example 3: MedCare Plus (Custom Healthcare Theme)

**Step 1: Create Custom Theme**
**File: `project/src/config/themes/healthcare-theme.js`**

```javascript
/**
 * Custom Healthcare Theme for Medical Companies
 */
export const healthcareTheme = {
  colors: {
    primary: "#2563eb",      // Medical blue
    secondary: "#10b981",    // Health green  
    primaryDark: "#1d4ed8",  // Darker blue
    accent: "#f59e0b",       // Warning amber
    background: "#f8fafc",   // Light background
    surface: "#ffffff",      // White surface
    text: {
      primary: "#1f2937",    // Dark gray
      secondary: "#6b7280"   // Medium gray
    },
    status: {
      success: "#10b981",    // Green
      warning: "#f59e0b",    // Amber
      error: "#ef4444",      // Red
      info: "#3b82f6"       // Blue
    }
  },
  gradients: {
    primary: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    secondary: "linear-gradient(135deg, #10b981, #059669)"
  }
};
```

**Step 2: Main Configuration**
**File: `project/src/config/company.config.js`**

```javascript
/**
 * Sample Configuration for MedCare Plus
 * Healthcare provider with custom theme
 */

import { healthcareTheme } from './themes/healthcare-theme.js';
import { enLocalization } from './localization/en.js';

export const companyConfig = {
  // Company Branding
  company: {
    name: "MedCare Plus",
    domain: "medcareplus.com",
    industry: "healthcare"
  },

  // Localization
  language: "en", 
  localization: enLocalization,

  // Custom Theme
  theme: healthcareTheme,

  // Assets
  assets: {
    riveAnimation: "/animations/medical-avatar.riv",
    images: {
      characterBackground: "/images/medical-background.png",
      productContainer: "/images/medical-container.png"
    }
  },

  // Behavior Settings
  behavior: {
    ui: {
      responsiveBreakpoint: 768,
      avatar: {
        mobile: {
          translate: { x: 190, y: -70 },
          scale: 0.95,
          borderRadius: "98%"
        },
        desktop: {
          translate: { x: 220, y: -100 },
          scale: 0.92,
          borderRadius: "52%"
        }
      }
    }
  }
};
```

## Example 4: Adding French Localization

**Step 1: Create French Language File**
**File: `project/src/config/localization/fr.js`**

```javascript
/**
 * 🇫🇷 French Language Configuration
 * For French-speaking markets
 */
export const frLocalization = {
  language: "fr",
  text: {
    defaultGreeting: {
      text: "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
      voice: "Bonjour ! Je suis votre assistant IA. Vous pouvez maintenant parler ou continuer à taper."
    },
    ui: {
      sendMessage: "Envoyer le message",
      sendingMessage: "Envoi du message...",
      activateVoice: "Activer le mode vocal",
      switchToText: "Passer au mode texte",
      enableMicrophone: "Activer le microphone",
      disableMicrophone: "Désactiver le microphone",
      openLink: "Ouvrir le lien",
      copyLink: "Copier le lien",
      close: "fermer",
      back: "retour",
      send: "envoyer",
      voice: "voix",
      textInputPlaceholder: "Tapez votre message ici...",
      voiceInputPlaceholder: "Parlez ou tapez...",
      connecting: "Connexion à l'assistant IA...",
      connected: "Connecté à l'assistant IA",
      disconnected: "Non connecté",
      connectionError: "Erreur : {error}",
      establishingConnection: "Établissement de la connexion...",
      productDismissText: "Dites \"fermer\" pour masquer",
      linkDismissText: "Cliquez sur le lien ou dites \"fermer\"",
      linkCopiedSuccess: "✓ Lien copié dans le presse-papiers !",
      linkLabel: "Lien produit",
      domainLabel: "Domaine : {domain}",
      imageOverlayInstructions: "Cliquez sur l'image pour zoomer • Appuyez sur ESC ou cliquez à l'extérieur pour fermer",
      linkOverlayInstructions: "Cliquez sur le lien pour fermer, appuyez sur ESC ou cliquez à l'extérieur",
      zoomIn: "Agrandir",
      zoomOut: "Réduire", 
      closeEsc: "Fermer (ESC)",
      loadingAvatar: "Chargement de l'avatar...",
      avatarReady: "Avatar prêt",
      productFallback: "Produit",
      productLinkFallback: "Lien produit",
      voiceModeActive: "🎤 Mode vocal actif - Vous pouvez parler ou continuer à taper",
      textModeActive: "💬 Mode texte actif - Cliquez ci-dessus pour activer la voix"
    },
    errors: {
      connectionFailed: "Connexion échouée",
      microphoneAccess: "Accès au microphone refusé",
      sendMessageFailed: "Échec de l'envoi du message",
      audioToggleFailed: "Échec du basculement du mode audio",
      mediaDeviceError: "Erreur de périphérique média : {error}",
      animationLoadFailed: "Échec du chargement de l'animation",
      animationLibraryUnavailable: "Bibliothèque d'animation non disponible"
    }
  }
};
```

**Step 2: Use French Configuration**
**File: `project/src/config/company.config.js`**

```javascript
/**
 * Sample Configuration for French Company
 */

import { defaultTheme } from './themes/default.js';
import { frLocalization } from './localization/fr.js';

export const companyConfig = {
  // Company Branding
  company: {
    name: "Solutions Avancées SA",
    domain: "solutions-avancees.fr",
    industry: "consulting"
  },

  // French Localization
  language: "fr",
  localization: frLocalization,

  // Theme
  theme: defaultTheme,

  // Assets
  assets: {
    riveAnimation: "/animations/french-avatar.riv",
    images: {
      characterBackground: "/images/french-background.png",
      productContainer: "/images/french-container.png"
    }
  },

  // Behavior Settings
  behavior: {
    ui: {
      responsiveBreakpoint: 768,
      avatar: {
        mobile: {
          translate: { x: 175, y: -75 },
          scale: 0.88,
          borderRadius: "96%"
        },
        desktop: {
          translate: { x: 205, y: -115 },
          scale: 0.89,
          borderRadius: "49%"
        }
      }
    }
  }
};
```

## 🚀 Quick Switch Instructions

To change configurations for different companies, simply:

1. **Backup current config**: Copy `company.config.js` to `company.config.backup.js`
2. **Apply new config**: Replace content of `company.config.js` with desired example
3. **Update assets**: Replace files in `/public/animations/` and `/public/images/`
4. **Build & deploy**: Run your build process

## 🧪 Testing Different Configurations

You can test different configurations locally by:

1. Save multiple config files:
   - `company.config.techflow.js`
   - `company.config.medical.js`
   - `company.config.german.js`

2. Copy the desired one to `company.config.js`

3. Restart development server to see changes

## 📝 Configuration Validation

Make sure your configuration includes:
- ✅ All required company fields
- ✅ Valid language code with matching localization file
- ✅ Complete theme object with all color properties
- ✅ Valid asset paths pointing to existing files
- ✅ Proper avatar behavior settings for responsive design

---

**🎯 These examples demonstrate the flexibility of the multi-tenant configuration system!**