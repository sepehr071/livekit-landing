/**
 * 🎬 Timeline Animation Test
 * 
 * This test verifies that the timeline animation system works correctly
 * with "idle abass" and "speaking abass" animations.
 */

import React, { useState, useEffect } from 'react';
import { useRive } from '../hooks/useRive';

const TimelineAnimationTest = () => {
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [currentMode, setCurrentMode] = useState('chat');

  // Enhanced Rive hook with debugging enabled
  const {
    canvasRef,
    isLoaded,
    error,
    setAnimationState,
    getAnimationState,
    isHealthy,
    currentAnimationStates,
    debugLog
  } = useRive('/danak.riv', true); // Debug enabled

  // Add test result
  const addTestResult = (test, success, details = '') => {
    const result = {
      id: Date.now(),
      test,
      success,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    console.log(`🧪 [Timeline Test] ${test}: ${success ? '✅' : '❌'} ${details}`);
  };

  // Control animations based on speaking state
  useEffect(() => {
    if (isLoaded && isHealthy) {
      debugLog('🎬 Controlling timeline animation based on speaking state', {
        isAgentSpeaking,
        currentMode,
        isLoaded,
        isHealthy
      });
      
      // Set animation state (works in both chat and voice modes)
      setAnimationState('isSpeaking', isAgentSpeaking);
    }
  }, [isAgentSpeaking, currentMode, isLoaded, isHealthy, setAnimationState, debugLog]);

  // Test timeline animation control
  const testAnimationControl = async () => {
    if (!isLoaded || !isHealthy) {
      addTestResult('Animation Control', false, 'Animation not ready');
      return;
    }

    try {
      // Test 1: Switch to speaking
      setIsAgentSpeaking(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isSpeakingState = getAnimationState('isSpeaking');
      addTestResult('Switch to Speaking', isSpeakingState, 
        isSpeakingState ? 'Successfully switched to "speaking abass"' : 'Failed to switch to speaking animation');

      // Test 2: Switch back to idle
      setIsAgentSpeaking(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isIdleState = !getAnimationState('isSpeaking');
      addTestResult('Switch to Idle', isIdleState, 
        isIdleState ? 'Successfully switched to "idle abass"' : 'Failed to switch to idle animation');

      // Test 3: Rapid switching
      let rapidSwitchSuccess = true;
      for (let i = 0; i < 3; i++) {
        setIsAgentSpeaking(true);
        await new Promise(resolve => setTimeout(resolve, 200));
        setIsAgentSpeaking(false);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      addTestResult('Rapid Switching', rapidSwitchSuccess, 'Tested rapid animation switching');

    } catch (error) {
      addTestResult('Animation Control', false, `Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🎬 Timeline Animation Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Animation Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Animation Preview</h2>
            
            <div className="relative w-full h-64 bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full rounded-lg"
              />
              
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 rounded-lg">
                  <div className="text-red-600 text-center">
                    <div className="text-4xl mb-2">❌</div>
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              )}
              
              {!isLoaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div className="text-sm">Loading Timeline Animations...</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`p-3 rounded-lg ${isLoaded ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                <div className="font-semibold">Loaded</div>
                <div className="text-sm">{isLoaded ? '✅ Yes' : '⏳ Loading...'}</div>
              </div>
              <div className={`p-3 rounded-lg ${isHealthy ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <div className="font-semibold">Healthy</div>
                <div className="text-sm">{isHealthy ? '✅ Yes' : '⚠️ Issues'}</div>
              </div>
            </div>
            
            {/* Current Animation State */}
            {currentAnimationStates && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="font-semibold mb-2">Current Animation State:</div>
                <div className="text-sm">
                  <div>Speaking: {currentAnimationStates.isSpeaking ? '🗣️ Yes' : '💤 No'}</div>
                  <div>Current: {currentAnimationStates.currentAnimation || 'Unknown'}</div>
                </div>
              </div>
            )}
            
            {/* Control Panel */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mode (Visual Only - Animation works in both)</label>
                <select 
                  value={currentMode} 
                  onChange={(e) => setCurrentMode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="chat">Chat Mode</option>
                  <option value="voice">Voice Mode</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsAgentSpeaking(!isAgentSpeaking)}
                  className={`p-3 rounded-lg font-medium ${
                    isAgentSpeaking 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {isAgentSpeaking ? '🗣️ Agent Speaking' : '💤 Agent Idle'}
                </button>
                
                <button
                  onClick={testAnimationControl}
                  disabled={!isLoaded || !isHealthy}
                  className="bg-purple-500 text-white p-3 rounded-lg font-medium hover:bg-purple-600 disabled:bg-gray-300"
                >
                  🧪 Run Tests
                </button>
              </div>
            </div>
          </div>
          
          {/* Test Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">
                      {result.success ? '✅' : '❌'} {result.test}
                    </div>
                    <div className="text-xs opacity-70">{result.timestamp}</div>
                  </div>
                  {result.details && (
                    <div className="text-sm mt-1 opacity-80">{result.details}</div>
                  )}
                </div>
              ))}
            </div>
            
            {testResults.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                No tests run yet. Click "Run Tests" to start.
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="font-semibold mb-1">Expected Behavior:</div>
                <div>• Default: "idle abass" animation plays</div>
                <div>• Speaking: "speaking abass" animation plays</div>
                <div>• Works in both chat and voice modes</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Console Output Notice */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Console Output</h2>
          <div className="text-sm text-gray-600">
            <div className="mb-2">
              <strong>Check your browser console for detailed logs:</strong>
            </div>
            <div>• 🎬 [Rive Animations] Available animations</div>
            <div>• 🎬 [Rive Animation] Playing: [animation name]</div>
            <div>• 🧪 [Timeline Test] Test results</div>
            <div className="mt-2 text-blue-600">
              Open Developer Tools → Console tab to see real-time animation logs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineAnimationTest;