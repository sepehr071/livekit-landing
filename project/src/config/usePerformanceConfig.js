import { useMemo } from 'react';
import { useCompanyConfig } from './useCompanyConfig';
import { useMobileDetection } from '../hooks/useMobileDetection';

/**
 * 🔧 Performance Configuration Hook
 * 
 * Provides device-specific performance settings based on mobile detection
 * and company configuration.
 * 
 * @returns {Object} Performance configuration and device information
 */
export const usePerformanceConfig = () => {
  const { config } = useCompanyConfig();
  const { 
    isMobile, 
    isLowEndDevice, 
    connectionSpeed, 
    optimizationLevel,
    isPerformanceCritical 
  } = useMobileDetection();

  const performanceConfig = useMemo(() => {
    // Get base performance config from company config (if it exists)
    const baseConfig = config.behavior?.performance || {};
    
    // Default performance settings
    const defaultSettings = {
      reducedAnimations: false,
      healthCheckInterval: 2000,
      maxConcurrentAnimations: 3,
      imagePreloadLimit: 10,
      enableDebugMode: true,
      simplifiedTransitions: false,
      disableBlur: false,
      reducedShadows: false,
      simplifiedGradients: false,
      minimalAnimations: false,
      lazyLoadImages: false,
      compressedAssets: false,
      reducedImageQuality: false
    };

    // Apply optimization level
    switch (optimizationLevel) {
      case 'aggressive':
        return {
          ...defaultSettings,
          reducedAnimations: true,
          healthCheckInterval: 8000,
          maxConcurrentAnimations: 1,
          imagePreloadLimit: 2,
          enableDebugMode: false,
          simplifiedTransitions: true,
          disableBlur: true,
          reducedShadows: true,
          simplifiedGradients: true,
          minimalAnimations: true,
          lazyLoadImages: true,
          compressedAssets: true,
          reducedImageQuality: true
        };
        
      case 'moderate':
        return {
          ...defaultSettings,
          reducedAnimations: isMobile,
          healthCheckInterval: 5000,
          maxConcurrentAnimations: isMobile ? 1 : 2,
          imagePreloadLimit: 3,
          enableDebugMode: false,
          simplifiedTransitions: true,
          disableBlur: isLowEndDevice,
          reducedShadows: isMobile,
          simplifiedGradients: isLowEndDevice,
          minimalAnimations: false,
          lazyLoadImages: connectionSpeed === 'slow',
          compressedAssets: connectionSpeed !== 'fast',
          reducedImageQuality: connectionSpeed === 'slow'
        };
        
      default:
        return defaultSettings;
    }
  }, [config, isMobile, isLowEndDevice, connectionSpeed, optimizationLevel]);

  // Get responsive settings based on device
  const responsiveConfig = useMemo(() => {
    const responsiveSettings = config.responsive || {};
    
    if (isMobile) {
      return {
        // Mobile-optimized settings
        avatarTransform: "translate3d(160px, -100px, 0) scale(0.75)",
        avatarBorderRadius: "96%",
        backdropBlur: performanceConfig.disableBlur ? "backdrop-blur-none" : "backdrop-blur-sm",
        shadowComplexity: performanceConfig.reducedShadows ? "shadow-lg" : "shadow-xl",
        transitionDuration: performanceConfig.simplifiedTransitions ? "duration-300" : "duration-600",
        enableHoverEffects: false,
        enableParallax: false,
        enableComplexTransitions: false,
        ...responsiveSettings.mobile
      };
    }
    
    // Desktop settings
    return {
      avatarTransform: "translate(220px, -130px) scale(0.80)",
      avatarBorderRadius: "50%",
      backdropBlur: "backdrop-blur-xl",
      shadowComplexity: "shadow-2xl",
      transitionDuration: "duration-1200",
      enableHoverEffects: true,
      enableParallax: true,
      enableComplexTransitions: true,
      ...responsiveSettings.desktop
    };
  }, [config, isMobile, performanceConfig]);

  // CSS class optimizations - Fixed circular dependency
  const getCSSOptimizations = useMemo(() => {
    // Helper functions defined inline to avoid circular reference
    const getAnimationClass = (baseClass) => {
      if (performanceConfig.minimalAnimations) {
        return baseClass.replace(/animate-\w+/g, '');
      }
      if (performanceConfig.reducedAnimations) {
        return baseClass.replace(/duration-\d+/g, 'duration-300');
      }
      return baseClass;
    };
    
    const getBlurClass = (baseClass) => {
      if (performanceConfig.disableBlur) {
        return baseClass.replace(/backdrop-blur-\w+/g, 'backdrop-blur-none');
      }
      if (isMobile) {
        return baseClass.replace(/backdrop-blur-xl/g, 'backdrop-blur-sm')
                        .replace(/backdrop-blur-lg/g, 'backdrop-blur-sm');
      }
      return baseClass;
    };
    
    const getShadowClass = (baseClass) => {
      if (performanceConfig.reducedShadows) {
        return baseClass.replace(/shadow-2xl/g, 'shadow-lg')
                        .replace(/shadow-xl/g, 'shadow-md');
      }
      return baseClass;
    };
    
    const optimizeClasses = (classes) => {
      let optimized = classes;
      optimized = getAnimationClass(optimized);
      optimized = getBlurClass(optimized);
      optimized = getShadowClass(optimized);
      return optimized;
    };

    return {
      getAnimationClass,
      getBlurClass,
      getShadowClass,
      optimizeClasses
    };
  }, [performanceConfig.minimalAnimations, performanceConfig.reducedAnimations, performanceConfig.disableBlur, performanceConfig.reducedShadows, isMobile]);

  return {
    // Performance settings
    performanceConfig,
    responsiveConfig,
    
    // Device information
    isMobile,
    isLowEndDevice,
    connectionSpeed,
    optimizationLevel,
    isPerformanceCritical,
    
    // CSS utilities - Direct methods to prevent re-render loops
    getAnimationClass: getCSSOptimizations.getAnimationClass,
    getBlurClass: getCSSOptimizations.getBlurClass,
    getShadowClass: getCSSOptimizations.getShadowClass,
    optimizeClasses: getCSSOptimizations.optimizeClasses,
    
    // Helper methods - Direct values to prevent re-renders
    shouldReduceAnimations: performanceConfig.reducedAnimations,
    shouldDisableBlur: performanceConfig.disableBlur,
    shouldLazyLoad: performanceConfig.lazyLoadImages,
    getHealthCheckInterval: () => performanceConfig.healthCheckInterval,
    getImagePreloadLimit: () => performanceConfig.imagePreloadLimit,
    isDebugEnabled: () => performanceConfig.enableDebugMode
  };
};

export default usePerformanceConfig;