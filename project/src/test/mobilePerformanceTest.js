/**
 * 📱 Mobile Performance Configuration Test
 * 
 * This test component validates the mobile detection and performance
 * configuration system implementation.
 */

import React from 'react';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { usePerformanceConfig } from '../config/usePerformanceConfig';
import { useCSSOptimization } from '../utils/cssUtils';

const MobilePerformanceTest = () => {
  const mobileDetection = useMobileDetection();
  const performanceConfig = usePerformanceConfig();
  const cssUtils = useCSSOptimization();

  const testResults = {
    mobileDetection: {
      passed: typeof mobileDetection.isMobile === 'boolean',
      data: mobileDetection
    },
    performanceConfig: {
      passed: typeof performanceConfig.performanceConfig === 'object',
      data: performanceConfig.performanceConfig
    },
    cssOptimization: {
      passed: typeof cssUtils.getOptimizedClasses === 'function',
      testClass: cssUtils.getOptimizedClasses('backdrop-blur-xl shadow-2xl duration-1200')
    }
  };

  const allTestsPassed = Object.values(testResults).every(test => test.passed);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          📱 Mobile Performance Test Suite
        </h1>
        
        <div className={`mb-6 p-4 rounded-lg ${allTestsPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className="text-lg font-semibold">
            {allTestsPassed ? '✅ All Tests Passed' : '❌ Some Tests Failed'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mobile Detection Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {testResults.mobileDetection.passed ? '✅' : '❌'} Mobile Detection
            </h2>
            
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Is Mobile:</span>
                <span className={mobileDetection.isMobile ? 'text-blue-600' : 'text-gray-600'}>
                  {mobileDetection.isMobile ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Low-end Device:</span>
                <span className={mobileDetection.isLowEndDevice ? 'text-orange-600' : 'text-gray-600'}>
                  {mobileDetection.isLowEndDevice ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Screen Size:</span>
                <span>{mobileDetection.screenSize}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Connection:</span>
                <span className={
                  mobileDetection.connectionSpeed === 'slow' ? 'text-red-600' :
                  mobileDetection.connectionSpeed === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }>
                  {mobileDetection.connectionSpeed}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Hardware Cores:</span>
                <span>{mobileDetection.hardwareConcurrency || 'Unknown'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Device Memory:</span>
                <span>{mobileDetection.deviceMemory ? `${mobileDetection.deviceMemory}GB` : 'Unknown'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Optimization Level:</span>
                <span className={
                  mobileDetection.optimizationLevel === 'aggressive' ? 'text-red-600' :
                  mobileDetection.optimizationLevel === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                }>
                  {mobileDetection.optimizationLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Configuration Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {testResults.performanceConfig.passed ? '✅' : '❌'} Performance Config
            </h2>
            
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Reduced Animations:</span>
                <span className={performanceConfig.performanceConfig.reducedAnimations ? 'text-blue-600' : 'text-gray-600'}>
                  {performanceConfig.performanceConfig.reducedAnimations ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Health Check Interval:</span>
                <span>{performanceConfig.performanceConfig.healthCheckInterval}ms</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Max Animations:</span>
                <span>{performanceConfig.performanceConfig.maxConcurrentAnimations}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Image Preload Limit:</span>
                <span>{performanceConfig.performanceConfig.imagePreloadLimit}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Debug Mode:</span>
                <span className={performanceConfig.performanceConfig.enableDebugMode ? 'text-green-600' : 'text-gray-600'}>
                  {performanceConfig.performanceConfig.enableDebugMode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Disable Blur:</span>
                <span className={performanceConfig.performanceConfig.disableBlur ? 'text-orange-600' : 'text-gray-600'}>
                  {performanceConfig.performanceConfig.disableBlur ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Lazy Load Images:</span>
                <span className={performanceConfig.performanceConfig.lazyLoadImages ? 'text-blue-600' : 'text-gray-600'}>
                  {performanceConfig.performanceConfig.lazyLoadImages ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* CSS Optimization Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {testResults.cssOptimization.passed ? '✅' : '❌'} CSS Optimization
            </h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Original Classes:</span>
                <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                  backdrop-blur-xl shadow-2xl duration-1200
                </div>
              </div>
              
              <div>
                <span className="font-medium">Optimized Classes:</span>
                <div className="bg-blue-100 p-2 rounded mt-1 font-mono text-xs">
                  {testResults.cssOptimization.testClass}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Backdrop Blur:</span>
                <span>{cssUtils.getBackdropBlur('xl')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Shadow:</span>
                <span>{cssUtils.getShadow('2xl')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Transition Duration:</span>
                <span>{cssUtils.getTransitionDuration('1200')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Hover Effects:</span>
                <span className={cssUtils.shouldEnableHover() ? 'text-green-600' : 'text-gray-600'}>
                  {cssUtils.shouldEnableHover() ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Transform Test */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🎭 Avatar Transform</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Transform String:</span>
                <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                  {cssUtils.getAvatarTransform().transform}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">Border Radius:</span>
                <span>{cssUtils.getAvatarTransform().borderRadius}</span>
              </div>
              
              {cssUtils.getAvatarTransform().translate && (
                <div>
                  <span className="font-medium">Translation:</span>
                  <div className="mt-1 text-xs">
                    X: {cssUtils.getAvatarTransform().translate.x}, 
                    Y: {cssUtils.getAvatarTransform().translate.y}, 
                    Z: {cssUtils.getAvatarTransform().translate.z}
                  </div>
                </div>
              )}
              
              {cssUtils.getAvatarTransform().scale && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Scale:</span>
                  <span>{cssUtils.getAvatarTransform().scale}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Test Area */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Live Performance Test</h2>
          
          <div className="space-y-4">
            {/* Test backdrop blur */}
            <div className={`p-4 rounded-lg ${cssUtils.getBackdropBlur('xl')} border`}>
              <div className="font-medium">Backdrop Blur Test</div>
              <div className="text-sm text-gray-600">
                This container uses optimized backdrop blur based on your device capability.
              </div>
            </div>
            
            {/* Test shadow */}
            <div className={`p-4 rounded-lg bg-white ${cssUtils.getShadow('2xl')}`}>
              <div className="font-medium">Shadow Test</div>
              <div className="text-sm text-gray-600">
                This container uses optimized shadow based on your device capability.
              </div>
            </div>
            
            {/* Test animation */}
            <div className={`p-4 rounded-lg bg-blue-50 ${cssUtils.getTransitionDuration('500')} transition-all hover:bg-blue-100`}>
              <div className="font-medium">Transition Test</div>
              <div className="text-sm text-gray-600">
                Hover this container to see optimized transitions in action.
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">📋 Test Instructions</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Open browser dev tools and toggle device emulation to test mobile detection</li>
            <li>• Check the Network tab and throttle connection to test network detection</li>
            <li>• Verify that performance settings change based on device capabilities</li>
            <li>• Test on actual mobile devices to validate real-world performance</li>
            <li>• Check console for any errors or warnings from the hooks</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MobilePerformanceTest;

// Make test available globally for console testing
if (typeof window !== 'undefined') {
  window.testMobilePerformance = () => {
    console.log('📱 Mobile Performance Test Results:');
    console.log('=======================================');
    
    // This would need to be called from within a React component
    // but provides a way to test the functions directly
    console.log('Add this component to your app to see visual results');
    console.log('Or import the hooks directly in your browser console');
  };
}