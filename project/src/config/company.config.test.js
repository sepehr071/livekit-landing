/**
 * 🧪 TEST CONFIGURATION - TechFlow Solutions
 * This configuration demonstrates the multi-tenant system functionality
 * Use this to verify all components work with the configuration system
 */

import { corporateBlueTheme } from './themes/corporate-blue.js';
import { enLocalization } from './localization/en.js';

export const testCompanyConfig = {
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
    riveAnimation: "/animations/character-avatar.riv", // Using existing asset
    images: {
      characterBackground: "/images/Character_BG.png", // Using existing asset
      productContainer: "/images/Rectangle-image.png"  // Using existing asset
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

// For testing - temporarily export this as the main config
export { testCompanyConfig as companyConfig };