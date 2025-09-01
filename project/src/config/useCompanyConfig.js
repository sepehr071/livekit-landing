import { useMemo } from 'react';
import CompanyConfig from './company.config.js';

/**
 * 🎯 Custom hook to consume company configuration
 * 
 * This hook provides easy access to all configuration settings
 * and includes helper functions for common operations.
 */
export const useCompanyConfig = () => {
  const config = useMemo(() => CompanyConfig, []);

  // Helper functions for easy access
  const helpers = useMemo(() => ({
    // Get text with placeholder replacement
    getText: (key, replacements = {}) => {
      let text = getNestedProperty(config.localization.text, key);
      if (!text) {
        console.warn(`Missing text key: ${key}`);
        return key;
      }
      
      // Replace placeholders like {error}, {domain}, etc.
      Object.keys(replacements).forEach(placeholder => {
        text = text.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
      });
      
      return text;
    },

    // Get theme color
    getColor: (colorPath) => {
      return getNestedProperty(config.theme, colorPath);
    },

    // Get asset path
    getAsset: (assetPath) => {
      return getNestedProperty(config.assets, assetPath);
    },

    // Check if mobile based on config breakpoint
    isMobile: (width) => {
      return width <= config.behavior.ui.responsiveBreakpoint;
    },

    // Get responsive avatar settings
    getAvatarSettings: (isMobile) => {
      return isMobile ? config.responsive.mobile : config.responsive.desktop;
    },

    // Get gradient classes
    getGradient: (mode, section) => {
      const key = mode === 'voice' ? 'voiceMode' : 'textMode';
      return config.theme.backgrounds[key][section];
    }
  }), [config]);

  return {
    config,
    ...helpers
  };
};

// Helper function to get nested object properties
function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

export default useCompanyConfig;