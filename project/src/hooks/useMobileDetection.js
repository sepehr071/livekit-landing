import { useState, useEffect, useMemo } from 'react';

/**
 * 📱 Enhanced Mobile Detection Hook
 * 
 * Detects mobile devices, low-end hardware, and network conditions
 * for performance optimization purposes.
 * 
 * @returns {Object} Device detection information
 */
export const useMobileDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isLowEndDevice: false,
    screenSize: 'desktop',
    connectionSpeed: 'fast',
    hasTouch: false,
    deviceMemory: null,
    hardwareConcurrency: null
  });

  const detectDevice = useMemo(() => {
    // User Agent detection
    const userAgent = navigator.userAgent;
    const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    // Screen size detection
    const isSmallScreen = window.innerWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Hardware detection
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = navigator.deviceMemory || null;
    const isLowEndDevice = hardwareConcurrency <= 4 || (deviceMemory && deviceMemory <= 4);
    
    // Network detection
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let connectionSpeed = 'fast';
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        connectionSpeed = 'slow';
      } else if (effectiveType === '3g') {
        connectionSpeed = 'medium';
      }
    }
    
    return {
      isMobile: isMobileUA || isSmallScreen || isTouchDevice,
      isLowEndDevice: isLowEndDevice,
      screenSize: isSmallScreen ? 'mobile' : 'desktop',
      connectionSpeed,
      hasTouch: isTouchDevice,
      deviceMemory,
      hardwareConcurrency
    };
  }, []);

  useEffect(() => {
    setDeviceInfo(detectDevice);
    
    const handleResize = () => {
      setDeviceInfo(prev => ({
        ...prev,
        screenSize: window.innerWidth <= 768 ? 'mobile' : 'desktop',
        isMobile: window.innerWidth <= 768 || prev.hasTouch
      }));
    };

    const handleConnectionChange = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        let connectionSpeed = 'fast';
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          connectionSpeed = 'slow';
        } else if (effectiveType === '3g') {
          connectionSpeed = 'medium';
        }
        
        setDeviceInfo(prev => ({ ...prev, connectionSpeed }));
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Listen for connection changes if supported
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [detectDevice]);

  // Additional utility methods
  const isPerformanceCritical = useMemo(() => {
    return deviceInfo.isMobile || deviceInfo.isLowEndDevice || deviceInfo.connectionSpeed === 'slow';
  }, [deviceInfo]);

  const getOptimizationLevel = useMemo(() => {
    if (deviceInfo.isLowEndDevice && deviceInfo.connectionSpeed === 'slow') {
      return 'aggressive';
    }
    if (deviceInfo.isMobile || deviceInfo.isLowEndDevice) {
      return 'moderate';
    }
    return 'none';
  }, [deviceInfo]);

  return {
    ...deviceInfo,
    isPerformanceCritical,
    optimizationLevel: getOptimizationLevel
  };
};

export default useMobileDetection;