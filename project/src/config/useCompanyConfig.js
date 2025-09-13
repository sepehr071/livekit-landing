import { useMemo } from 'react';
import CompanyConfig from './company.config.js';

/**
 * 🎯 Custom hook to consume company configuration
 *
 * This hook provides easy access to all configuration settings
 * and includes helper functions for common operations.
 * Enhanced with mobile performance awareness.
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

    // Enhanced avatar settings with performance awareness
    getAvatarSettings: (isMobile) => {
      const settings = isMobile ? config.responsive.mobile : config.responsive.desktop;
      
      // Handle both old and new transform formats
      let transformData = {};
      
      // New format: translate3d
      if (settings.avatarTransform.includes('translate3d')) {
        const transformMatch = settings.avatarTransform.match(/translate3d\(([^)]+)\)/);
        if (transformMatch) {
          const [x, y, z] = transformMatch[1].split(',').map(s => s.trim());
          const scaleMatch = settings.avatarTransform.match(/scale\(([^)]+)\)/);
          const scale = scaleMatch ? scaleMatch[1] : '1';
          
          transformData = {
            translate: { x, y, z },
            scale: parseFloat(scale),
            transform: settings.avatarTransform,
            borderRadius: settings.avatarBorderRadius,
            useHardwareAcceleration: true
          };
        }
      } else {
        // Legacy format: translate
        const transformMatch = settings.avatarTransform.match(/translate\((-?\d+)px,\s*(-?\d+)px\)\s*scale\(([0-9.]+)\)/);
        
        if (transformMatch) {
          transformData = {
            translate: {
              x: parseInt(transformMatch[1]),
              y: parseInt(transformMatch[2])
            },
            scale: parseFloat(transformMatch[3]),
            transform: settings.avatarTransform,
            borderRadius: settings.avatarBorderRadius,
            useHardwareAcceleration: false
          };
        }
      }
      
      // Add additional performance settings
      return {
        ...transformData,
        // Performance-aware settings
        enableHoverEffects: settings.enableHoverEffects !== undefined ? settings.enableHoverEffects : !isMobile,
        enableParallax: settings.enableParallax !== undefined ? settings.enableParallax : !isMobile,
        enableComplexTransitions: settings.enableComplexTransitions !== undefined ? settings.enableComplexTransitions : !isMobile,
        // CSS class optimizations
        backdropBlur: settings.backdropBlur || (isMobile ? 'backdrop-blur-sm' : 'backdrop-blur-xl'),
        shadowComplexity: settings.shadowComplexity || (isMobile ? 'shadow-lg' : 'shadow-2xl'),
        transitionDuration: settings.transitionDuration || (isMobile ? 'duration-300' : 'duration-1200'),
        // Fallback values
        borderRadius: settings.avatarBorderRadius || (isMobile ? "96%" : "50%")
      };
    },

    // Get gradient classes
    getGradient: (mode, section) => {
      const key = mode === 'voice' ? 'voiceMode' : 'textMode';
      return config.theme.backgrounds[key][section];
    },

    // NEW: Get performance settings
    getPerformanceSettings: (deviceType = 'mobile') => {
      const performanceConfig = config.behavior?.performance || {};
      
      switch (deviceType) {
        case 'mobile':
          return performanceConfig.mobile || {};
        case 'lowEndDevice':
          return performanceConfig.lowEndDevice || {};
        case 'slowConnection':
          return performanceConfig.slowConnection || {};
        default:
          return {};
      }
    },

    // NEW: Get responsive configuration
    getResponsiveConfig: (isMobile) => {
      return isMobile ? config.responsive.mobile : config.responsive.desktop;
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