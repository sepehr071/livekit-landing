import { usePerformanceConfig } from '../config/usePerformanceConfig';

/**
 * 🎨 CSS Performance Optimization Utilities
 * 
 * Provides functions to automatically optimize CSS classes based on device
 * capabilities and performance requirements.
 */

/**
 * Hook for CSS optimization utilities
 * @returns {Object} CSS optimization functions
 */
export const useCSSOptimization = () => {
  const performanceData = usePerformanceConfig();
  
  // Destructure in a stable way to prevent re-renders
  const {
    isMobile,
    isLowEndDevice,
    performanceConfig,
    responsiveConfig
  } = performanceData;

  /**
   * Get optimized classes based on device capabilities
   * @param {string} desktopClasses - Full desktop classes
   * @param {string} mobileClasses - Optional mobile-specific classes
   * @returns {string} Optimized CSS classes
   */
  const getOptimizedClasses = (desktopClasses, mobileClasses = '') => {
    if (isMobile && mobileClasses) {
      return performanceData.optimizeClasses(mobileClasses);
    }
    return performanceData.optimizeClasses(desktopClasses);
  };

  /**
   * Add performance-aware classes to base classes
   * @param {string} baseClass - Base CSS classes
   * @returns {string} Enhanced classes with performance optimizations
   */
  const getPerformanceClass = (baseClass) => {
    const classes = [baseClass];
    
    // Add mobile optimization classes
    if (isMobile) {
      classes.push('mobile-optimized');
    }
    
    // Add hardware acceleration for transitions
    if (performanceConfig.simplifiedTransitions) {
      classes.push('gpu-accelerated');
    }
    
    // Disable blur on low-end devices
    if (isLowEndDevice && performanceConfig.disableBlur) {
      classes.push('no-blur');
    }
    
    // Add reduced motion for accessibility and performance
    if (performanceConfig.reducedAnimations) {
      classes.push('reduced-motion');
    }
    
    return classes.join(' ');
  };

  /**
   * Get backdrop blur class based on device capability
   * @param {string} intensity - 'sm', 'md', 'lg', 'xl'
   * @returns {string} Optimized backdrop blur class
   */
  const getBackdropBlur = (intensity = 'md') => {
    if (performanceConfig.disableBlur) {
      return 'backdrop-blur-none bg-white/90';
    }
    
    if (isMobile) {
      return 'backdrop-blur-sm';
    }
    
    return `backdrop-blur-${intensity}`;
  };

  /**
   * Get shadow class based on device capability
   * @param {string} size - 'sm', 'md', 'lg', 'xl', '2xl'
   * @returns {string} Optimized shadow class
   */
  const getShadow = (size = 'lg') => {
    if (performanceConfig.reducedShadows) {
      const shadowMap = {
        '2xl': 'lg',
        'xl': 'md',
        'lg': 'md',
        'md': 'sm',
        'sm': 'sm'
      };
      return `shadow-${shadowMap[size] || 'sm'}`;
    }
    
    return `shadow-${size}`;
  };

  /**
   * Get transition duration based on device capability
   * @param {string} duration - '150', '200', '300', '500', '700', '1000'
   * @returns {string} Optimized duration class
   */
  const getTransitionDuration = (duration = '300') => {
    if (performanceConfig.simplifiedTransitions) {
      // Always use faster transitions on performance-critical devices
      return 'duration-300';
    }
    
    return `duration-${duration}`;
  };

  /**
   * Get responsive avatar transform from config
   * @returns {Object} Transform properties
   */
  const getAvatarTransform = () => {
    const transform = responsiveConfig.avatarTransform;
    
    // Parse transform string into object for easier use
    if (transform.includes('translate3d')) {
      const match = transform.match(/translate3d\(([^)]+)\)/);
      if (match) {
        const [x, y, z] = match[1].split(',').map(s => s.trim());
        const scaleMatch = transform.match(/scale\(([^)]+)\)/);
        const scale = scaleMatch ? scaleMatch[1] : '1';
        
        return {
          transform: transform,
          translate: { x, y, z },
          scale,
          borderRadius: responsiveConfig.avatarBorderRadius
        };
      }
    }
    
    // Fallback for older transform format
    return {
      transform: transform,
      borderRadius: responsiveConfig.avatarBorderRadius
    };
  };

  /**
   * Check if hover effects should be enabled
   * @returns {boolean} Whether hover effects should be active
   */
  const shouldEnableHover = () => {
    return !isMobile && responsiveConfig.enableHoverEffects;
  };

  /**
   * Get animation classes based on performance settings
   * @param {string} baseAnimation - Base animation class
   * @returns {string} Optimized animation class
   */
  const getAnimationClasses = (baseAnimation) => {
    if (performanceConfig.minimalAnimations) {
      return ''; // No animations
    }
    
    if (performanceConfig.reducedAnimations) {
      // Simplify animations
      return baseAnimation.replace(/animate-\w+/g, 'animate-pulse')
                          .replace(/duration-\d+/g, 'duration-300');
    }
    
    return baseAnimation;
  };

  /**
   * Generate conditional classes based on device capability
   * @param {Object} classMap - Object with keys for different conditions
   * @returns {string} Appropriate classes for current device
   */
  const getConditionalClasses = (classMap) => {
    const {
      mobile = '',
      desktop = '',
      lowEnd = '',
      highEnd = '',
      slowConnection = '',
      fastConnection = ''
    } = classMap;

    let classes = [];

    // Device type classes
    if (isMobile && mobile) {
      classes.push(mobile);
    } else if (!isMobile && desktop) {
      classes.push(desktop);
    }

    // Performance classes
    if (isLowEndDevice && lowEnd) {
      classes.push(lowEnd);
    } else if (!isLowEndDevice && highEnd) {
      classes.push(highEnd);
    }

    // Connection classes
    const { connectionSpeed } = usePerformanceConfig();
    if (connectionSpeed === 'slow' && slowConnection) {
      classes.push(slowConnection);
    } else if (connectionSpeed === 'fast' && fastConnection) {
      classes.push(fastConnection);
    }

    return optimizeClasses(classes.join(' '));
  };

  return {
    // Main utilities
    getOptimizedClasses,
    getPerformanceClass,
    
    // Specific optimizations
    getBackdropBlur,
    getShadow,
    getTransitionDuration,
    getAvatarTransform,
    getAnimationClasses,
    getConditionalClasses,
    
    // Conditional checks
    shouldEnableHover,
    
    // Device info
    isMobile,
    isLowEndDevice,
    performanceConfig,
    responsiveConfig,
    
    // Raw optimization functions - Use performance data methods
    optimizeClasses: performanceData.optimizeClasses,
    getAnimationClass: performanceData.getAnimationClass,
    getBlurClass: performanceData.getBlurClass,
    getShadowClass: performanceData.getShadowClass
  };
};

export default useCSSOptimization;