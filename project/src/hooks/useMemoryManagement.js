import { useEffect, useRef, useCallback } from 'react';
import { usePerformanceConfig } from '../config/usePerformanceConfig';

/**
 * 🧠 Memory Management Hook
 * 
 * Provides memory management utilities specifically optimized for mobile devices
 * to prevent memory leaks and reduce RAM usage.
 * 
 * @returns {Object} Memory management utilities
 */
export const useMemoryManagement = () => {
  const { 
    isMobile, 
    isLowEndDevice, 
    performanceConfig 
  } = usePerformanceConfig();

  const cleanupTasks = useRef([]);
  const memoryThreshold = useRef(isMobile ? 50 : 100); // MB
  const lastMemoryCheck = useRef(Date.now());
  const memoryCheckInterval = useRef(null);

  /**
   * Add a cleanup task to be executed when memory is low
   * @param {Function} task - Cleanup function to execute
   * @param {string} description - Description of the cleanup task
   */
  const addCleanupTask = useCallback((task, description = 'Unknown task') => {
    if (typeof task !== 'function') {
      console.warn('Cleanup task must be a function');
      return;
    }

    cleanupTasks.current.push({
      task,
      description,
      timestamp: Date.now()
    });

    // Limit cleanup tasks on mobile to prevent memory bloat
    if (isMobile && cleanupTasks.current.length > 10) {
      cleanupTasks.current = cleanupTasks.current.slice(-10);
    }
  }, [isMobile]);

  /**
   * Force cleanup execution
   * @param {boolean} emergency - Whether this is an emergency cleanup
   */
  const forceCleanup = useCallback((emergency = false) => {
    console.log(`🧹 ${emergency ? 'Emergency' : 'Scheduled'} cleanup started (${cleanupTasks.current.length} tasks)`);
    
    let successCount = 0;
    let errorCount = 0;

    // Execute all cleanup tasks
    cleanupTasks.current.forEach(({ task, description }, index) => {
      try {
        task();
        successCount++;
        console.log(`✅ Cleanup task ${index + 1}: ${description}`);
      } catch (error) {
        errorCount++;
        console.warn(`❌ Cleanup task ${index + 1} failed: ${description}`, error);
      }
    });
    
    // Clear the tasks array
    cleanupTasks.current = [];
    
    console.log(`🧹 Cleanup completed: ${successCount} success, ${errorCount} errors`);
    
    // Force garbage collection if available (mainly for development)
    if (window.gc && typeof window.gc === 'function') {
      try {
        window.gc();
        console.log('🗑️ Forced garbage collection executed');
      } catch (gcError) {
        console.warn('Failed to force garbage collection:', gcError);
      }
    }

    // Clear image caches on emergency cleanup
    if (emergency && 'caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image') || cacheName.includes('static')) {
            caches.delete(cacheName);
          }
        });
      }).catch(console.warn);
    }
  }, []);

  /**
   * Check current memory usage
   * @returns {Object} Memory usage information
   */
  const checkMemoryUsage = useCallback(() => {
    if (!window.performance || !window.performance.memory) {
      return { available: false, usage: 0 };
    }
    
    const memory = window.performance.memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
    const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    
    const usagePercentage = (usedMB / limitMB) * 100;
    const isHigh = usedMB > memoryThreshold.current;
    const isCritical = usagePercentage > 80;
    
    const memoryInfo = {
      available: true,
      usage: usedMB,
      total: totalMB,
      limit: limitMB,
      percentage: usagePercentage,
      isHigh,
      isCritical,
      threshold: memoryThreshold.current
    };
    
    // Log memory warnings
    if (isCritical) {
      console.warn(`🚨 Critical memory usage: ${usedMB}MB (${usagePercentage.toFixed(1)}%)`);
      forceCleanup(true); // Emergency cleanup
    } else if (isHigh) {
      console.warn(`⚠️ High memory usage: ${usedMB}MB`);
      forceCleanup(false); // Regular cleanup
    }
    
    return memoryInfo;
  }, [forceCleanup]);

  /**
   * Optimize memory usage for current device
   */
  const optimizeMemoryUsage = useCallback(() => {
    // Adjust memory threshold based on device capability
    if (isLowEndDevice) {
      memoryThreshold.current = 30; // More aggressive on low-end devices
    } else if (isMobile) {
      memoryThreshold.current = 50; // Moderate on mobile
    } else {
      memoryThreshold.current = 100; // Relaxed on desktop
    }

    // Clear any cached data that's not immediately needed
    if (isLowEndDevice) {
      // Clear sessionStorage of non-essential data
      try {
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('cache') || key.includes('temp')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch (storageError) {
        console.warn('Storage cleanup failed:', storageError);
      }
    }
  }, [isMobile, isLowEndDevice]);

  /**
   * Monitor memory usage periodically
   */
  const startMemoryMonitoring = useCallback(() => {
    if (!isMobile) return; // Only monitor on mobile devices

    const monitoringInterval = isLowEndDevice ? 15000 : 30000; // 15s or 30s

    memoryCheckInterval.current = setInterval(() => {
      const memoryInfo = checkMemoryUsage();
      
      if (memoryInfo.available) {
        lastMemoryCheck.current = Date.now();
        
        // Log memory status occasionally
        if (performanceConfig.enableDebugMode) {
          console.log(`📊 Memory: ${memoryInfo.usage}MB/${memoryInfo.limit}MB (${memoryInfo.percentage.toFixed(1)}%)`);
        }
      }
    }, monitoringInterval);

    console.log(`🩺 Memory monitoring started (${monitoringInterval}ms interval)`);
  }, [isMobile, isLowEndDevice, checkMemoryUsage, performanceConfig.enableDebugMode]);

  /**
   * Stop memory monitoring
   */
  const stopMemoryMonitoring = useCallback(() => {
    if (memoryCheckInterval.current) {
      clearInterval(memoryCheckInterval.current);
      memoryCheckInterval.current = null;
      console.log('🛑 Memory monitoring stopped');
    }
  }, []);

  // Setup memory monitoring on mobile
  useEffect(() => {
    if (isMobile) {
      optimizeMemoryUsage();
      startMemoryMonitoring();
    }

    return () => {
      stopMemoryMonitoring();
      // Final cleanup on unmount
      forceCleanup(false);
    };
  }, [isMobile, optimizeMemoryUsage, startMemoryMonitoring, stopMemoryMonitoring, forceCleanup]);

  // Expose memory information for debugging
  const getMemoryInfo = useCallback(() => {
    const memoryInfo = checkMemoryUsage();
    return {
      ...memoryInfo,
      cleanupTasksCount: cleanupTasks.current.length,
      lastCheck: lastMemoryCheck.current,
      threshold: memoryThreshold.current,
      monitoringActive: !!memoryCheckInterval.current
    };
  }, [checkMemoryUsage]);

  return {
    // Core memory management
    addCleanupTask,
    forceCleanup,
    checkMemoryUsage,
    getMemoryInfo,
    
    // Memory monitoring
    startMemoryMonitoring,
    stopMemoryMonitoring,
    optimizeMemoryUsage,
    
    // Memory status
    memoryThreshold: memoryThreshold.current,
    isMonitoring: !!memoryCheckInterval.current,
    
    // Device information
    isMobile,
    isLowEndDevice
  };
};

export default useMemoryManagement;