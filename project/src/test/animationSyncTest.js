/**
 * 🎭 Animation Synchronization Test Component
 * 
 * This component helps test and validate the enhanced animation synchronization
 * with ElevenLabs audio events and timeout-based detection.
 */

import React, { useState, useEffect } from 'react';
import { useElevenLabsConversation } from '../hooks/useElevenLabsConversation';
import { useRive } from '../hooks/useRive';

const AnimationSyncTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  
  const {
    isAgentSpeaking,
    isConnected,
    getSpeakingDebugInfo,
    animationDebugInfo,
    connect,
    disconnect
  } = useElevenLabsConversation();

  const {
    isLoaded,
    isHealthy,
    currentAnimationStates,
    getAnimationDiagnostics
  } = useRive('/danak.riv', true);

  // Log test results
  const addTestResult = (test, result, details = {}) => {
    const testResult = {
      test,
      result,
      details,
      timestamp: new Date().toISOString()
    };
    
    setTestResults(prev => [...prev, testResult]);
    console.log(`🧪 [Animation Sync Test] ${test}:`, result ? '✅ PASS' : '❌ FAIL', details);
  };

  // Test animation synchronization
  const runAnimationSyncTests = async () => {
    setIsTestRunning(true);
    setTestResults([]);
    
    console.log('🧪 [Animation Sync Test] Starting comprehensive animation synchronization tests...');
    
    // Test 1: Basic Setup
    addTestResult(
      'ElevenLabs Connection',
      isConnected,
      { connected: isConnected }
    );
    
    addTestResult(
      'Rive Animation Loaded',
      isLoaded,
      { loaded: isLoaded, healthy: isHealthy }
    );
    
    // Test 2: Debug Information Availability
    const debugInfo = getSpeakingDebugInfo ? getSpeakingDebugInfo() : null;
    addTestResult(
      'Speaking Debug Info Available',
      !!debugInfo,
      debugInfo
    );
    
    // Test 3: Animation State Tracking
    const animationDiagnostics = getAnimationDiagnostics ? getAnimationDiagnostics() : null;
    addTestResult(
      'Animation Diagnostics Available',
      !!animationDiagnostics,
      animationDiagnostics
    );
    
    // Test 4: Current Animation States
    addTestResult(
      'Animation States Accessible',
      !!currentAnimationStates,
      currentAnimationStates
    );
    
    // Test 5: Audio Event Tracking
    addTestResult(
      'Audio Event Counter Initialized',
      debugInfo?.audioEventCount >= 0,
      { audioEventCount: debugInfo?.audioEventCount }
    );
    
    console.log('🧪 [Animation Sync Test] Tests completed. Results:', testResults);
    setIsTestRunning(false);
  };

  // Monitor speaking state changes
  useEffect(() => {
    if (getSpeakingDebugInfo) {
      const debugInfo = getSpeakingDebugInfo();
      console.log('🎭 [Animation Sync Monitor] Speaking state changed:', {
        isAgentSpeaking,
        debugInfo,
        animationState: currentAnimationStates?.isSpeaking,
        timestamp: new Date().toISOString()
      });
    }
  }, [isAgentSpeaking, getSpeakingDebugInfo, currentAnimationStates]);

  return (
    <div className="fixed bottom-4 left-4 bg-white border-2 border-gray-300 rounded-lg p-4 max-w-md z-50 shadow-lg">
      <h3 className="font-bold text-lg mb-3 text-gray-800">🎭 Animation Sync Test</h3>
      
      {/* Connection Status */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      {/* Real-time Status */}
      <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
        <div>Agent Speaking: {isAgentSpeaking ? '🗣️ YES' : '💤 NO'}</div>
        <div>Animation: {currentAnimationStates?.isSpeaking ? '🎬 SPEAKING' : '😴 IDLE'}</div>
        {getSpeakingDebugInfo && (
          <>
            <div>Audio Events: {getSpeakingDebugInfo().audioEventCount}</div>
            <div>Timeout Active: {getSpeakingDebugInfo().timeoutActive ? '⏰' : '❌'}</div>
            <div>Speaking State: {getSpeakingDebugInfo().speakingState}</div>
          </>
        )}
      </div>
      
      {/* Test Controls */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={runAnimationSyncTests}
          disabled={isTestRunning}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {isTestRunning ? 'Testing...' : 'Run Tests'}
        </button>
        
        <button
          onClick={() => setTestResults([])}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Clear
        </button>
      </div>
      
      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="max-h-40 overflow-y-auto">
          <div className="text-sm font-semibold mb-2">Test Results:</div>
          {testResults.map((result, index) => (
            <div key={index} className="text-xs mb-1 p-1 rounded bg-gray-50">
              <span className={result.result ? 'text-green-600' : 'text-red-600'}>
                {result.result ? '✅' : '❌'}
              </span>
              <span className="ml-2">{result.test}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
        <div className="font-semibold mb-1">Testing Instructions:</div>
        <div>1. Press Ctrl+Shift+D to enable animation debug overlay</div>
        <div>2. Send a message to the agent</div>
        <div>3. Watch the debug info update in real-time</div>
        <div>4. Verify animation responds to actual speech</div>
      </div>
    </div>
  );
};

export default AnimationSyncTest;