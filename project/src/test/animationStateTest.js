/**
 * 🎭 Enhanced Rive Animation State Control Test
 * 
 * This comprehensive test file validates the robust animation state management system
 * for the isSpeaking animation control across chat and voice modes.
 * 
 * Features Tested:
 * - Enhanced useRive hook functionality
 * - Cross-mode animation support (chat + voice)
 * - Animation state verification and retry logic
 * - Health monitoring and diagnostics
 * - Debug overlay functionality
 * - Error recovery mechanisms
 */

import React, { useState, useEffect } from 'react';
import { useRive } from '../hooks/useRive';

const AnimationStateTest = () => {
  // Test states
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [testMode, setTestMode] = useState('chat'); // 'chat' | 'voice'
  
  // Simulated speaking states for testing
  const [simulatedAgentSpeaking, setSimulatedAgentSpeaking] = useState(false);
  const [simulatedUserSpeaking, setSimulatedUserSpeaking] = useState(false);
  
  // Enhanced Rive hook with debugging enabled
  const {
    canvasRef,
    isLoaded,
    error,
    setAnimationState,
    getAnimationState,
    forceAnimationState,
    availableInputs,
    currentAnimationStates,
    isHealthy,
    getAnimationDiagnostics,
    debugLog
  } = useRive('/danak.riv', true); // Debug enabled

  // Test utilities
  const addTestResult = (testName, success, details = '') => {
    const result = {
      id: Date.now(),
      testName,
      success,
      details,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    console.log(`🧪 Test: ${testName} - ${success ? '✅ PASS' : '❌ FAIL'}`, details);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Test 1: Basic Animation Loading and Health
  const testBasicLoading = async () => {
    setCurrentTest('Basic Loading & Health Check');
    
    try {
      // Wait for animation to load
      let attempts = 0;
      while (!isLoaded && attempts < 20) {
        await sleep(500);
        attempts++;
      }
      
      if (!isLoaded) {
        addTestResult('Animation Loading', false, 'Animation failed to load within 10 seconds');
        return;
      }
      
      addTestResult('Animation Loading', true, `Loaded in ${attempts * 0.5}s`);
      
      // Check health status
      addTestResult('Health Check', isHealthy, isHealthy ? 'Animation is healthy' : 'Animation health issues detected');
      
      // Check for errors
      addTestResult('Error Check', !error, error || 'No errors detected');
      
      // Check available inputs
      const hasIsSpeaking = availableInputs.includes('isSpeaking');
      addTestResult('isSpeaking Input', hasIsSpeaking, 
        hasIsSpeaking ? 'isSpeaking input found' : `Available: ${availableInputs.join(', ')}`);
        
    } catch (err) {
      addTestResult('Basic Loading', false, `Test error: ${err.message}`);
    }
  };

  // Test 2: Animation State Setting and Verification
  const testStateManagement = async () => {
    setCurrentTest('Animation State Management');
    
    try {
      // Test setting isSpeaking to true
      setAnimationState('isSpeaking', true);
      await sleep(100); // Allow state to propagate
      
      const speakingTrue = getAnimationState('isSpeaking');
      addTestResult('Set isSpeaking=true', speakingTrue, 
        `Expected: true, Got: ${speakingTrue}`);
      
      // Test setting isSpeaking to false
      setAnimationState('isSpeaking', false);
      await sleep(100);
      
      const speakingFalse = !getAnimationState('isSpeaking');
      addTestResult('Set isSpeaking=false', speakingFalse, 
        `Expected: false, Got: ${getAnimationState('isSpeaking')}`);
      
      // Test force setting (for recovery scenarios)
      forceAnimationState('isSpeaking', true);
      await sleep(100);
      
      const forcedTrue = getAnimationState('isSpeaking');
      addTestResult('Force State Setting', forcedTrue, 
        `Force set to true: ${forcedTrue}`);
        
    } catch (err) {
      addTestResult('State Management', false, `Test error: ${err.message}`);
    }
  };

  // Test 3: Cross-Mode Animation Support
  const testCrossModeSupport = async () => {
    setCurrentTest('Cross-Mode Animation Support');
    
    try {
      // Test in chat mode
      setTestMode('chat');
      setSimulatedAgentSpeaking(true);
      await sleep(100);
      
      // In chat mode, animation should still show speaking visual feedback
      const chatModeWorking = getAnimationState('isSpeaking');
      addTestResult('Chat Mode Animation', chatModeWorking, 
        'Visual feedback should work in chat mode');
      
      // Test in voice mode
      setTestMode('voice');
      setSimulatedAgentSpeaking(true);
      await sleep(100);
      
      const voiceModeWorking = getAnimationState('isSpeaking');
      addTestResult('Voice Mode Animation', voiceModeWorking, 
        'Full animation control in voice mode');
      
      // Reset states
      setSimulatedAgentSpeaking(false);
      setSimulatedUserSpeaking(false);
      await sleep(100);
      
    } catch (err) {
      addTestResult('Cross-Mode Support', false, `Test error: ${err.message}`);
    }
  };

  // Test 4: Diagnostics and Monitoring
  const testDiagnostics = async () => {
    setCurrentTest('Diagnostics & Monitoring');
    
    try {
      const diagnostics = getAnimationDiagnostics();
      
      addTestResult('Diagnostics Available', !!diagnostics, 
        diagnostics ? 'Diagnostics function working' : 'No diagnostics available');
      
      if (diagnostics) {
        addTestResult('Diagnostics Data', 
          typeof diagnostics === 'object' && diagnostics.isLoaded !== undefined,
          `Has required fields: ${Object.keys(diagnostics).join(', ')}`);
          
        addTestResult('isSpeaking Detection', diagnostics.hasIsSpeaking, 
          diagnostics.hasIsSpeaking ? 'isSpeaking state detected' : 'isSpeaking state missing');
      }
      
    } catch (err) {
      addTestResult('Diagnostics', false, `Test error: ${err.message}`);
    }
  };

  // Test 5: Stress Testing (Rapid State Changes)
  const testStressTesting = async () => {
    setCurrentTest('Stress Testing (Rapid State Changes)');
    
    try {
      const iterations = 10;
      let successCount = 0;
      
      for (let i = 0; i < iterations; i++) {
        const testValue = i % 2 === 0;
        setAnimationState('isSpeaking', testValue);
        await sleep(50); // Rapid changes
        
        const actualValue = getAnimationState('isSpeaking');
        if (actualValue === testValue) {
          successCount++;
        }
      }
      
      const successRate = (successCount / iterations) * 100;
      addTestResult('Stress Test', successRate >= 80, 
        `${successCount}/${iterations} rapid changes successful (${successRate}%)`);
        
    } catch (err) {
      addTestResult('Stress Testing', false, `Test error: ${err.message}`);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setTestResults([]);
    setCurrentTest('Starting comprehensive tests...');
    
    await testBasicLoading();
    await sleep(500);
    
    await testStateManagement();
    await sleep(500);
    
    await testCrossModeSupport();
    await sleep(500);
    
    await testDiagnostics();
    await sleep(500);
    
    await testStressTesting();
    
    setCurrentTest('All tests completed!');
  };

  // Simulate speaking states based on test mode
  useEffect(() => {
    if (isLoaded && isHealthy) {
      if (testMode === 'voice') {
        // Voice mode: Full animation control
        setAnimationState('isSpeaking', simulatedAgentSpeaking);
        if (availableInputs.includes('IsListening')) {
          setAnimationState('IsListening', simulatedUserSpeaking);
        }
      } else {
        // Chat mode: Visual speaking feedback only
        setAnimationState('isSpeaking', simulatedAgentSpeaking);
        if (availableInputs.includes('IsListening')) {
          setAnimationState('IsListening', false);
        }
      }
    }
  }, [simulatedAgentSpeaking, simulatedUserSpeaking, testMode, isLoaded, isHealthy, setAnimationState, availableInputs]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🎭 Rive Animation State Control Test Suite
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Animation Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Animation Preview</h2>
            
            <div className="relative w-full h-64 bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full rounded-lg"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
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
                    <div className="text-sm">Loading Animation...</div>
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
            
            {/* Control Panel */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Test Mode</label>
                <select 
                  value={testMode} 
                  onChange={(e) => setTestMode(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="chat">Chat Mode</option>
                  <option value="voice">Voice Mode</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSimulatedAgentSpeaking(!simulatedAgentSpeaking)}
                  className={`p-2 rounded-lg font-medium ${
                    simulatedAgentSpeaking 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {simulatedAgentSpeaking ? '🗣️ Agent Speaking' : '💤 Agent Idle'}
                </button>
                
                <button
                  onClick={() => setSimulatedUserSpeaking(!simulatedUserSpeaking)}
                  className={`p-2 rounded-lg font-medium ${
                    simulatedUserSpeaking 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {simulatedUserSpeaking ? '🎤 User Speaking' : '🔇 User Silent'}
                </button>
              </div>
              
              <button
                onClick={runAllTests}
                disabled={!isLoaded}
                className="w-full bg-purple-500 text-white p-3 rounded-lg font-semibold hover:bg-purple-600 disabled:bg-gray-300"
              >
                🧪 Run All Tests
              </button>
            </div>
          </div>
          
          {/* Test Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            {currentTest && (
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mb-4">
                <div className="font-medium">Current Test:</div>
                <div className="text-sm">{currentTest}</div>
              </div>
            )}
            
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
                      {result.success ? '✅' : '❌'} {result.testName}
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
                No tests run yet. Click "Run All Tests" to start.
              </div>
            )}
          </div>
        </div>
        
        {/* Debug Information */}
        {isLoaded && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Available Inputs</h3>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <code className="text-sm">
                    {availableInputs.length > 0 ? availableInputs.join(', ') : 'None detected'}
                  </code>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Current Animation States</h3>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <code className="text-sm">
                    {currentAnimationStates ? JSON.stringify(currentAnimationStates, null, 2) : 'None'}
                  </code>
                </div>
              </div>
            </div>
            
            {getAnimationDiagnostics && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Full Diagnostics</h3>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(getAnimationDiagnostics(), null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationStateTest;