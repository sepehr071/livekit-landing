import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { usePerformanceConfig } from '../config/usePerformanceConfig';
import { useMemoryManagement } from '../hooks/useMemoryManagement';

/**
 * 📊 Performance Debug Component
 * 
 * Displays real-time performance metrics and device information
 * for debugging mobile performance issues.
 */
const PerformanceDebug = ({ enabled = false }) => {
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    getPerformanceReport,
    getFPSColor,
    getMemoryColor,
    isMobile,
    isLowEndDevice,
    performanceThresholds,
    isPerformanceCritical
  } = usePerformanceMonitor(enabled);

  const { 
    performanceConfig, 
    responsiveConfig,
    connectionSpeed,
    optimizationLevel
  } = usePerformanceConfig();

  const { 
    getMemoryInfo, 
    forceCleanup,
    isMonitoring: memoryMonitoring 
  } = useMemoryManagement();

  const [showDetailed, setShowDetailed] = useState(false);
  const [memoryInfo, setMemoryInfo] = useState(null);

  // Update memory info periodically
  useEffect(() => {
    if (!enabled) return;

    const updateMemoryInfo = () => {
      setMemoryInfo(getMemoryInfo());
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, [enabled, getMemoryInfo]);

  // Auto-start monitoring when enabled
  useEffect(() => {
    if (enabled && !isMonitoring) {
      startMonitoring();
    } else if (!enabled && isMonitoring) {
      stopMonitoring();
    }
  }, [enabled, isMonitoring, startMonitoring, stopMonitoring]);

  if (!enabled) return null;

  const handleToggleDetailed = () => {
    setShowDetailed(!showDetailed);
  };

  const handleForceCleanup = () => {
    forceCleanup(true);
    setTimeout(() => {
      setMemoryInfo(getMemoryInfo());
    }, 1000);
  };

  const handleResetMetrics = () => {
    resetMetrics();
    setMemoryInfo(getMemoryInfo());
  };

  return (
    <div className="fixed top-4 left-4 bg-black bg-opacity-90 text-white text-xs font-mono rounded-lg z-50 min-w-[280px]">
      {/* Header */}
      <div className="bg-blue-600 px-3 py-2 rounded-t-lg flex justify-between items-center">
        <span className="font-bold">📊 Performance Monitor</span>
        <div className="flex gap-2">
          <button
            onClick={handleToggleDetailed}
            className="text-xs bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded"
          >
            {showDetailed ? 'Simple' : 'Detailed'}
          </button>
          <button
            onClick={handleResetMetrics}
            className="text-xs bg-yellow-600 hover:bg-yellow-500 px-2 py-1 rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="p-3 space-y-2">
        {/* Critical Status */}
        {isPerformanceCritical && (
          <div className="bg-red-600 px-2 py-1 rounded text-center font-bold">
            🚨 PERFORMANCE CRITICAL
          </div>
        )}

        {/* Core Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className={`font-bold ${getFPSColor(metrics.fps)}`}>
              FPS: {metrics.fps}
            </div>
            <div className="text-gray-400 text-xs">
              Avg: {metrics.averageFPS}
            </div>
          </div>
          
          <div>
            <div className={`font-bold ${getMemoryColor(metrics.memoryUsage)}`}>
              Memory: {metrics.memoryUsage}MB
            </div>
            {metrics.memoryLimit > 0 && (
              <div className="text-gray-400 text-xs">
                /{metrics.memoryLimit}MB
              </div>
            )}
          </div>
        </div>

        {/* Render Performance */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-cyan-400">
              Render: {metrics.renderTime.toFixed(1)}ms
            </div>
            <div className="text-gray-400 text-xs">
              Avg: {metrics.averageRenderTime.toFixed(1)}ms
            </div>
          </div>
          
          <div>
            <div className={`${metrics.animationLag ? 'text-red-400' : 'text-green-400'}`}>
              {metrics.animationLag ? '⚠️ Laggy' : '✅ Smooth'}
            </div>
            <div className="text-gray-400 text-xs">
              Drops: {metrics.frameDrops}
            </div>
          </div>
        </div>

        {/* Device Information */}
        <div className="border-t border-gray-600 pt-2 mt-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>📱 Mobile: {isMobile ? 'Yes' : 'No'}</div>
            <div>🔋 Low-end: {isLowEndDevice ? 'Yes' : 'No'}</div>
            <div>🌐 Network: {connectionSpeed}</div>
            <div>⚡ Optimization: {optimizationLevel}</div>
          </div>
        </div>

        {/* Detailed View */}
        {showDetailed && (
          <>
            {/* Performance Configuration */}
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="font-bold text-purple-400 mb-1">Performance Config</div>
              <div className="text-xs space-y-1">
                <div>Health Check: {performanceConfig.healthCheckInterval}ms</div>
                <div>Max Animations: {performanceConfig.maxConcurrentAnimations}</div>
                <div>Image Preload: {performanceConfig.imagePreloadLimit}</div>
                <div>Reduced Animations: {performanceConfig.reducedAnimations ? 'Yes' : 'No'}</div>
                <div>Disable Blur: {performanceConfig.disableBlur ? 'Yes' : 'No'}</div>
                <div>Lazy Load: {performanceConfig.lazyLoadImages ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Memory Information */}
            {memoryInfo && (
              <div className="border-t border-gray-600 pt-2 mt-2">
                <div className="font-bold text-orange-400 mb-1">Memory Status</div>
                <div className="text-xs space-y-1">
                  <div>Usage: {memoryInfo.usage || 0}MB</div>
                  <div>Threshold: {memoryInfo.threshold}MB</div>
                  <div>Cleanup Tasks: {memoryInfo.cleanupTasksCount}</div>
                  <div>Monitoring: {memoryMonitoring ? 'Active' : 'Inactive'}</div>
                  {memoryInfo.percentage && (
                    <div className={memoryInfo.isCritical ? 'text-red-400' : 'text-gray-400'}>
                      Heap: {memoryInfo.percentage.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Performance Thresholds */}
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="font-bold text-indigo-400 mb-1">Thresholds</div>
              <div className="text-xs space-y-1">
                <div>Critical FPS: {performanceThresholds.criticalFPS}</div>
                <div>Warning FPS: {performanceThresholds.warningFPS}</div>
                <div>Critical Memory: {performanceThresholds.criticalMemory}MB</div>
                <div>Warning Memory: {performanceThresholds.warningMemory}MB</div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="border-t border-gray-600 pt-2 mt-2 flex gap-2">
          <button
            onClick={handleForceCleanup}
            className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded flex-1"
          >
            🧹 Force Cleanup
          </button>
          <button
            onClick={() => console.log(getPerformanceReport())}
            className="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded flex-1"
          >
            📋 Log Report
          </button>
        </div>

        {/* Toggle Instructions */}
        <div className="text-xs text-gray-400 text-center mt-2">
          Press Ctrl+Shift+P to toggle
        </div>
      </div>
    </div>
  );
};

export default PerformanceDebug;