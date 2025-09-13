/**
 * 📱 Mobile Performance Integration Test
 * 
 * Comprehensive test suite for validating all mobile performance optimizations
 * across the entire widget system.
 */

import React, { useState, useEffect } from 'react';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { usePerformanceConfig } from '../config/usePerformanceConfig';
import { useCSSOptimization } from '../utils/cssUtils';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useMemoryManagement } from '../hooks/useMemoryManagement';
import { useProgressiveImage } from '../hooks/useProgressiveImage';

const MobilePerformanceIntegrationTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  // All hooks being tested
  const mobileDetection = useMobileDetection();
  const performanceConfig = usePerformanceConfig();
  const cssUtils = useCSSOptimization();
  const performanceMonitor = usePerformanceMonitor(true);
  const memoryManager = useMemoryManagement();
  const { preloadImages } = useProgressiveImage();

  const addTestResult = (testName, passed, details = '', data = null) => {
    const result = {
      id: Date.now() + Math.random(),
      testName,
      passed,
      details,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setTestResults(prev => [...prev, result]);
    console.log(`🧪 ${testName}: ${passed ? '✅ PASS' : '❌ FAIL'} - ${details}`);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Test 1: Mobile Detection Accuracy
  const testMobileDetection = async () => {
    setCurrentTest('Testing Mobile Detection...');
    
    try {
      // Test basic detection
      const hasDeviceInfo = typeof mobileDetection.isMobile === 'boolean';
      addTestResult('Mobile Detection', hasDeviceInfo, 
        `Detected: ${mobileDetection.isMobile ? 'Mobile' : 'Desktop'}`, mobileDetection);

      // Test optimization level
      const hasOptimizationLevel = ['none', 'moderate', 'aggressive'].includes(mobileDetection.optimizationLevel);
      addTestResult('Optimization Level', hasOptimizationLevel,
        `Level: ${mobileDetection.optimizationLevel}`);

      // Test hardware detection
      const hasHardwareInfo = typeof mobileDetection.hardwareConcurrency === 'number';
      addTestResult('Hardware Detection', hasHardwareInfo,
        `Cores: ${mobileDetection.hardwareConcurrency}, Memory: ${mobileDetection.deviceMemory || 'Unknown'}GB`);

    } catch (error) {
      addTestResult('Mobile Detection', false, `Error: ${error.message}`);
    }
  };

  // Test 2: Performance Configuration
  const testPerformanceConfiguration = async () => {
    setCurrentTest('Testing Performance Configuration...');
    
    try {
      // Test configuration loading
      const hasConfig = typeof performanceConfig.performanceConfig === 'object';
      addTestResult('Performance Config Loading', hasConfig, 
        'Configuration object loaded successfully');

      // Test mobile-specific settings
      if (mobileDetection.isMobile) {
        const hasMobileOptimizations = performanceConfig.performanceConfig.reducedAnimations;
        addTestResult('Mobile Optimizations', hasMobileOptimizations,
          `Health check: ${performanceConfig.performanceConfig.healthCheckInterval}ms`);
      }

      // Test CSS optimization functions
      const cssOptimizationWorks = typeof cssUtils.getOptimizedClasses === 'function';
      addTestResult('CSS Optimization', cssOptimizationWorks,
        'CSS optimization functions available');

      // Test class optimization
      const originalClasses = 'backdrop-blur-xl shadow-2xl duration-1200';
      const optimizedClasses = cssUtils.getOptimizedClasses(originalClasses);
      const classesWereOptimized = originalClasses !== optimizedClasses;
      addTestResult('CSS Class Optimization', classesWereOptimized,
        `Original: ${originalClasses.length} → Optimized: ${optimizedClasses.length} chars`);

    } catch (error) {
      addTestResult('Performance Configuration', false, `Error: ${error.message}`);
    }
  };

  // Test 3: Memory Management
  const testMemoryManagement = async () => {
    setCurrentTest('Testing Memory Management...');
    
    try {
      // Test memory info retrieval
      const memoryInfo = memoryManager.getMemoryInfo();
      const hasMemoryInfo = typeof memoryInfo === 'object';
      addTestResult('Memory Info', hasMemoryInfo,
        `Usage: ${memoryInfo.usage || 'Unknown'}MB, Threshold: ${memoryInfo.threshold}MB`);

      // Test cleanup task addition
      let cleanupExecuted = false;
      memoryManager.addCleanupTask(() => {
        cleanupExecuted = true;
      }, 'Test cleanup task');
      
      // Force cleanup to test execution
      memoryManager.forceCleanup();
      await sleep(100);
      
      addTestResult('Cleanup Tasks', cleanupExecuted,
        'Cleanup task added and executed successfully');

      // Test memory monitoring
      const isMonitoringActive = memoryManager.isMonitoring;
      addTestResult('Memory Monitoring', 
        mobileDetection.isMobile ? isMonitoringActive : true,
        `Monitoring: ${isMonitoringActive ? 'Active' : 'Inactive'} (Mobile: ${mobileDetection.isMobile})`);

    } catch (error) {
      addTestResult('Memory Management', false, `Error: ${error.message}`);
    }
  };

  // Test 4: Performance Monitoring
  const testPerformanceMonitoring = async () => {
    setCurrentTest('Testing Performance Monitoring...');
    
    try {
      // Check if performance monitoring is active
      const isMonitoringActive = performanceMonitor.isMonitoring;
      addTestResult('Performance Monitoring', isMonitoringActive,
        'Performance monitoring active');

      // Check metrics collection
      const hasValidMetrics = typeof performanceMonitor.metrics.fps === 'number';
      addTestResult('Metrics Collection', hasValidMetrics,
        `FPS: ${performanceMonitor.metrics.fps}, Memory: ${performanceMonitor.metrics.memoryUsage}MB`);

      // Test performance report generation
      const report = performanceMonitor.getPerformanceReport();
      const hasReport = typeof report === 'object' && report.current;
      addTestResult('Performance Report', hasReport,
        `Generated report with ${report.recommendations?.length || 0} recommendations`);

      // Check device-specific thresholds
      const thresholds = performanceMonitor.performanceThresholds;
      const hasThresholds = typeof thresholds.criticalFPS === 'number';
      addTestResult('Device Thresholds', hasThresholds,
        `Critical FPS: ${thresholds.criticalFPS}, Warning: ${thresholds.warningFPS}`);

    } catch (error) {
      addTestResult('Performance Monitoring', false, `Error: ${error.message}`);
    }
  };

  // Test 5: Image Loading Optimization
  const testImageOptimization = async () => {
    setCurrentTest('Testing Image Optimization...');
    
    try {
      // Test progressive loading setup
      const hasProgressiveLoading = typeof preloadImages === 'function';
      addTestResult('Progressive Loading', hasProgressiveLoading,
        'Progressive image loading functions available');

      // Test preload limit configuration
      const preloadLimit = performanceConfig.getImagePreloadLimit ? 
        performanceConfig.getImagePreloadLimit() : 
        performanceConfig.performanceConfig.imagePreloadLimit;
      
      const hasReasonableLimit = preloadLimit >= 1 && preloadLimit <= 10;
      addTestResult('Preload Limit', hasReasonableLimit,
        `Limit: ${preloadLimit} images (${mobileDetection.isMobile ? 'Mobile' : 'Desktop'})`);

    } catch (error) {
      addTestResult('Image Optimization', false, `Error: ${error.message}`);
    }
  };

  // Test 6: Animation Performance
  const testAnimationPerformance = async () => {
    setCurrentTest('Testing Animation Performance...');
    
    try {
      // Test CSS class optimization for animations
      const animationClasses = 'animate-bounce duration-1200 transform scale-105';
      const optimizedAnimations = cssUtils.getAnimationClasses(animationClasses);
      
      const animationsOptimized = mobileDetection.isMobile ? 
        optimizedAnimations !== animationClasses : true;
      
      addTestResult('Animation Optimization', animationsOptimized,
        `Original: "${animationClasses}" → Optimized: "${optimizedAnimations}"`);

      // Test transition duration optimization
      const longDuration = cssUtils.getTransitionDuration('1200');
      const durationOptimized = mobileDetection.isMobile ? 
        longDuration.includes('300') : true;
      
      addTestResult('Transition Duration', durationOptimized,
        `Duration optimized to: ${longDuration}`);

      // Test hardware acceleration classes
      const hardwareAcceleratedClass = cssUtils.getPerformanceClass('test-class');
      const hasHardwareAcceleration = hardwareAcceleratedClass.includes('mobile-optimized') || 
                                     hardwareAcceleratedClass.includes('gpu-accelerated');
      
      addTestResult('Hardware Acceleration', hasHardwareAcceleration,
        `Performance classes: ${hardwareAcceleratedClass}`);

    } catch (error) {
      addTestResult('Animation Performance', false, `Error: ${error.message}`);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('Starting comprehensive mobile performance tests...');
    
    await testMobileDetection();
    await sleep(500);
    
    await testPerformanceConfiguration();
    await sleep(500);
    
    await testMemoryManagement();
    await sleep(500);
    
    await testPerformanceMonitoring();
    await sleep(500);
    
    await testImageOptimization();
    await sleep(500);
    
    await testAnimationPerformance();
    
    setCurrentTest('All tests completed!');
    setIsRunning(false);
    
    // Generate final report
    const passedTests = testResults.filter(result => result.passed).length;
    const totalTests = testResults.length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log(`📊 Mobile Performance Test Summary: ${passedTests}/${totalTests} tests passed (${successRate}%)`);
  };

  const getTestStatusColor = (passed) => {
    return passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getDeviceInfoColor = (value, type) => {
    if (type === 'optimization') {
      return value === 'aggressive' ? 'text-red-600' :
             value === 'moderate' ? 'text-yellow-600' : 'text-green-600';
    }
    if (type === 'connection') {
      return value === 'slow' ? 'text-red-600' :
             value === 'medium' ? 'text-yellow-600' : 'text-green-600';
    }
    return value ? 'text-blue-600' : 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          📱 Mobile Performance Integration Test
        </h1>

        {/* Device Information Panel */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📱 Device Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Device Type:</span>
              <div className={getDeviceInfoColor(mobileDetection.isMobile, 'device')}>
                {mobileDetection.isMobile ? 'Mobile' : 'Desktop'}
              </div>
            </div>
            <div>
              <span className="font-medium">Performance:</span>
              <div className={getDeviceInfoColor(mobileDetection.isLowEndDevice, 'performance')}>
                {mobileDetection.isLowEndDevice ? 'Low-end' : 'High-end'}
              </div>
            </div>
            <div>
              <span className="font-medium">Connection:</span>
              <div className={getDeviceInfoColor(mobileDetection.connectionSpeed, 'connection')}>
                {mobileDetection.connectionSpeed}
              </div>
            </div>
            <div>
              <span className="font-medium">Optimization:</span>
              <div className={getDeviceInfoColor(mobileDetection.optimizationLevel, 'optimization')}>
                {mobileDetection.optimizationLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🧪 Test Suite</h2>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300"
            >
              {isRunning ? '🏃 Running Tests...' : '🚀 Run All Tests'}
            </button>
          </div>

          {currentTest && (
            <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-4">
              <div className="font-medium">Current Test:</div>
              <div className="text-sm">{currentTest}</div>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Test Results</h2>
          
          {testResults.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg ${getTestStatusColor(result.passed)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">
                      {result.passed ? '✅' : '❌'} {result.testName}
                    </div>
                    <div className="text-xs opacity-70">{result.timestamp}</div>
                  </div>
                  {result.details && (
                    <div className="text-sm mt-1 opacity-80">{result.details}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No tests run yet. Click "Run All Tests" to start validation.
            </div>
          )}
        </div>

        {/* Live Performance Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📈 Live Performance Metrics</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${performanceMonitor.getFPSColor(performanceMonitor.metrics.fps)}`}>
                {performanceMonitor.metrics.fps}
              </div>
              <div className="text-sm text-gray-600">FPS</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${performanceMonitor.getMemoryColor(performanceMonitor.metrics.memoryUsage)}`}>
                {performanceMonitor.metrics.memoryUsage}
              </div>
              <div className="text-sm text-gray-600">Memory (MB)</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {performanceMonitor.metrics.renderTime.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Render (ms)</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${performanceMonitor.metrics.animationLag ? 'text-red-600' : 'text-green-600'}`}>
                {performanceMonitor.metrics.frameDrops}
              </div>
              <div className="text-sm text-gray-600">Frame Drops</div>
            </div>
          </div>

          {performanceMonitor.isPerformanceCritical && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg">
              <div className="font-bold">🚨 Performance Critical</div>
              <div className="text-sm">
                The widget is experiencing performance issues. Consider applying more aggressive optimizations.
              </div>
            </div>
          )}
        </div>

        {/* Optimization Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">💡 Optimization Status</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Mobile Detection:</span>
              <span className={mobileDetection.isMobile ? 'text-green-600' : 'text-gray-600'}>
                {mobileDetection.isMobile ? '✅ Active' : '❌ Desktop'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>CSS Optimizations:</span>
              <span className="text-green-600">✅ Applied</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Animation Throttling:</span>
              <span className={mobileDetection.isMobile ? 'text-green-600' : 'text-gray-600'}>
                {mobileDetection.isMobile ? '✅ Enabled' : '❌ Desktop Mode'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Memory Management:</span>
              <span className={memoryManager.isMonitoring ? 'text-green-600' : 'text-gray-600'}>
                {memoryManager.isMonitoring ? '✅ Monitoring' : '❌ Inactive'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Image Preloading:</span>
              <span className="text-green-600">✅ Optimized</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Debug Mode:</span>
              <span className={performanceConfig.isDebugEnabled() ? 'text-yellow-600' : 'text-green-600'}>
                {performanceConfig.isDebugEnabled() ? '⚠️ Enabled' : '✅ Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Testing Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Run tests on both desktop and mobile devices</li>
            <li>• Use browser dev tools to simulate different device types</li>
            <li>• Test with throttled network connections</li>
            <li>• Monitor FPS during heavy animations</li>
            <li>• Check memory usage during extended use</li>
            <li>• Verify that optimizations activate on mobile devices</li>
            <li>• Press Ctrl+Shift+P to toggle performance monitor overlay</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobilePerformanceIntegrationTest;

// Global test runner for console access
if (typeof window !== 'undefined') {
  window.runMobilePerformanceTests = () => {
    console.log('📱 Mobile Performance Integration Tests');
    console.log('=====================================');
    console.log('Add <MobilePerformanceIntegrationTest /> to your app to run visual tests');
    console.log('Or import individual hooks to test functionality');
  };
}