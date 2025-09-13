import { useState, useEffect, useRef, useCallback } from 'react';
import { usePerformanceConfig } from '../config/usePerformanceConfig';

/**
 * 📊 Performance Monitoring Hook
 * 
 * Monitors FPS, memory usage, render times, and animation smoothness
 * specifically optimized for mobile device performance tracking.
 * 
 * @param {boolean} enabled - Whether monitoring is active
 * @returns {Object} Performance metrics and controls
 */
export const usePerformanceMonitor = (enabled = false) => {
  const { isMobile, isLowEndDevice, performanceConfig } = usePerformanceConfig();
  
  const [metrics, setMetrics] = useState({
    fps: 60,
    averageFPS: 60,
    memoryUsage: 0,
    memoryLimit: 0,
    animationLag: false,
    renderTime: 0,
    averageRenderTime: 0,
    frameDrops: 0,
    totalFrames: 0,
    isPerformanceCritical: false
  });

  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Refs for performance tracking
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderStart = useRef(0);
  const frameDropCount = useRef(0);
  const fpsHistory = useRef([]);
  const renderTimeHistory = useRef([]);
  const animationFrameRef = useRef(null);
  const lastFrameTime = useRef(performance.now());

  // Performance thresholds based on device type
  const performanceThresholds = {
    criticalFPS: isMobile ? 20 : 30,
    warningFPS: isMobile ? 25 : 45,
    criticalMemory: isMobile ? 80 : 150, // MB
    warningMemory: isMobile ? 50 : 100,
    criticalRenderTime: isMobile ? 50 : 30, // ms
    warningRenderTime: isMobile ? 30 : 20
  };

  /**
   * Start performance monitoring
   */
  const startMonitoring = useCallback(() => {
    if (isMonitoring || !enabled) return;
    
    setIsMonitoring(true);
    frameCount.current = 0;
    lastTime.current = performance.now();
    lastFrameTime.current = performance.now();
    
    console.log(`📊 Performance monitoring started (${isMobile ? 'Mobile' : 'Desktop'} mode)`);
  }, [enabled, isMonitoring, isMobile]);

  /**
   * Stop performance monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;
    
    setIsMonitoring(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    console.log('📊 Performance monitoring stopped');
  }, [isMonitoring]);

  /**
   * Calculate moving average
   */
  const calculateMovingAverage = (history, newValue, maxLength = 10) => {
    history.push(newValue);
    if (history.length > maxLength) {
      history.shift();
    }
    return history.reduce((sum, val) => sum + val, 0) / history.length;
  };

  /**
   * Check if performance is critical
   */
  const checkPerformanceCritical = (currentMetrics) => {
    return currentMetrics.fps < performanceThresholds.criticalFPS ||
           currentMetrics.memoryUsage > performanceThresholds.criticalMemory ||
           currentMetrics.renderTime > performanceThresholds.criticalRenderTime;
  };

  /**
   * Main performance measurement loop
   */
  const measurePerformance = useCallback(() => {
    if (!isMonitoring) return;

    frameCount.current++;
    const currentTime = performance.now();
    
    // Calculate frame time
    const frameTime = currentTime - lastFrameTime.current;
    lastFrameTime.current = currentTime;
    
    // Detect frame drops (frame time > 33ms = under 30 FPS)
    if (frameTime > 33) {
      frameDropCount.current++;
    }
    
    // Measure render time
    if (renderStart.current) {
      const renderTime = currentTime - renderStart.current;
      const avgRenderTime = calculateMovingAverage(renderTimeHistory.current, renderTime, 30);
      
      setMetrics(prev => ({ 
        ...prev, 
        renderTime: Math.round(renderTime * 100) / 100,
        averageRenderTime: Math.round(avgRenderTime * 100) / 100
      }));
    }
    renderStart.current = currentTime;

    // Calculate FPS and update metrics every second
    if (currentTime >= lastTime.current + 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      const avgFPS = calculateMovingAverage(fpsHistory.current, fps, 10);
      
      // Check memory usage if available
      let memoryUsage = 0;
      let memoryLimit = 0;
      if (window.performance && window.performance.memory) {
        memoryUsage = Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024);
        memoryLimit = Math.round(window.performance.memory.jsHeapSizeLimit / 1024 / 1024);
      }

      const newMetrics = {
        fps,
        averageFPS: Math.round(avgFPS),
        memoryUsage,
        memoryLimit,
        animationLag: fps < performanceThresholds.warningFPS,
        frameDrops: frameDropCount.current,
        totalFrames: frameCount.current,
        renderTime: metrics.renderTime,
        averageRenderTime: metrics.averageRenderTime
      };

      newMetrics.isPerformanceCritical = checkPerformanceCritical(newMetrics);

      setMetrics(prev => ({ ...prev, ...newMetrics }));

      // Add to performance history (keep last 60 entries = 1 minute)
      setPerformanceHistory(prev => {
        const newHistory = [...prev, {
          timestamp: currentTime,
          fps,
          memoryUsage,
          renderTime: newMetrics.renderTime
        }];
        return newHistory.slice(-60);
      });

      // Log performance warnings
      if (newMetrics.isPerformanceCritical && performanceConfig.enableDebugMode) {
        console.warn('🐌 Performance critical:', {
          fps: newMetrics.fps,
          memory: newMetrics.memoryUsage,
          renderTime: newMetrics.renderTime,
          frameDrops: newMetrics.frameDrops
        });
      }

      frameCount.current = 0;
      frameDropCount.current = 0;
      lastTime.current = currentTime;
    }

    animationFrameRef.current = requestAnimationFrame(measurePerformance);
  }, [isMonitoring, metrics.renderTime, metrics.averageRenderTime, performanceConfig.enableDebugMode, performanceThresholds]);

  // Start/stop monitoring based on enabled state
  useEffect(() => {
    if (enabled && !isMonitoring) {
      startMonitoring();
    } else if (!enabled && isMonitoring) {
      stopMonitoring();
    }
  }, [enabled, isMonitoring, startMonitoring, stopMonitoring]);

  // Performance measurement loop
  useEffect(() => {
    if (isMonitoring) {
      animationFrameRef.current = requestAnimationFrame(measurePerformance);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMonitoring, measurePerformance]);

  /**
   * Get performance report
   */
  const getPerformanceReport = useCallback(() => {
    const report = {
      current: metrics,
      history: performanceHistory,
      device: {
        isMobile,
        isLowEndDevice,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory
      },
      thresholds: performanceThresholds,
      recommendations: []
    };

    // Generate recommendations based on current performance
    if (metrics.fps < performanceThresholds.warningFPS) {
      report.recommendations.push('Consider reducing animation complexity');
    }
    
    if (metrics.memoryUsage > performanceThresholds.warningMemory) {
      report.recommendations.push('High memory usage detected - consider cleanup');
    }
    
    if (metrics.renderTime > performanceThresholds.warningRenderTime) {
      report.recommendations.push('Slow render times - optimize component rendering');
    }
    
    if (metrics.frameDrops > 5) {
      report.recommendations.push('Frame drops detected - check for blocking operations');
    }

    return report;
  }, [metrics, performanceHistory, isMobile, isLowEndDevice, performanceThresholds]);

  /**
   * Reset performance tracking
   */
  const resetMetrics = useCallback(() => {
    frameCount.current = 0;
    frameDropCount.current = 0;
    fpsHistory.current = [];
    renderTimeHistory.current = [];
    setPerformanceHistory([]);
    setMetrics({
      fps: 60,
      averageFPS: 60,
      memoryUsage: 0,
      memoryLimit: 0,
      animationLag: false,
      renderTime: 0,
      averageRenderTime: 0,
      frameDrops: 0,
      totalFrames: 0,
      isPerformanceCritical: false
    });
    console.log('📊 Performance metrics reset');
  }, []);

  /**
   * Get FPS color for UI display
   */
  const getFPSColor = (fps) => {
    if (fps >= performanceThresholds.warningFPS) return 'text-green-600';
    if (fps >= performanceThresholds.criticalFPS) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Get memory color for UI display
   */
  const getMemoryColor = (memory) => {
    if (memory < performanceThresholds.warningMemory) return 'text-green-600';
    if (memory < performanceThresholds.criticalMemory) return 'text-yellow-600';
    return 'text-red-600';
  };

  return {
    // Current metrics
    metrics,
    performanceHistory,
    
    // Monitoring controls
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    
    // Analysis
    getPerformanceReport,
    
    // UI helpers
    getFPSColor,
    getMemoryColor,
    
    // Device info
    isMobile,
    isLowEndDevice,
    performanceThresholds,
    
    // Performance state
    isPerformanceCritical: metrics.isPerformanceCritical
  };
};

export default usePerformanceMonitor;