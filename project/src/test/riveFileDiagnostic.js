/**
 * 🔍 Rive File Diagnostic Tool
 * 
 * This tool helps you inspect your Rive file to see exactly what state machines,
 * animations, and inputs are available. Use this to debug and understand your
 * Rive file structure.
 * 
 * Usage: Import and use this component in your app to get detailed information
 * about your Rive file contents.
 */

import React, { useState, useEffect } from 'react';
import { Rive } from '@rive-app/canvas';

const RiveFileDiagnostic = () => {
  const [riveInstance, setRiveInstance] = useState(null);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [riveFilePath, setRiveFilePath] = useState('/danak.riv');

  // Canvas ref for Rive instance
  const canvasRef = React.useRef(null);

  const analyzeRiveFile = async () => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    setError(null);
    setDiagnosticResults(null);

    try {
      console.log('🔍 [Rive Diagnostic] Starting analysis of:', riveFilePath);

      const rive = new Rive({
        src: riveFilePath,
        canvas: canvasRef.current,
        autoplay: false, // Don't auto-play for diagnostic
        onLoad: () => {
          try {
            console.log('✅ [Rive Diagnostic] File loaded successfully');
            
            // Get all available information using official Rive API
            const availableStateMachines = rive.stateMachineNames;
            const availableAnimations = rive.animationNames;
            const activeArtboard = rive.activeArtboard;
            const source = rive.source;
            const bounds = rive.bounds;

            // Log to console for immediate visibility
            console.log('🎭 [Rive State Machines]', availableStateMachines);
            console.log('🎬 [Rive Animations]', availableAnimations);
            console.log('📊 [Rive Artboard]', activeArtboard);
            console.log('📁 [Rive Source]', source);
            console.log('📐 [Rive Bounds]', bounds);

            // Try to get inputs for each state machine
            const stateMachineDetails = {};
            availableStateMachines.forEach(smName => {
              try {
                const inputs = rive.stateMachineInputs(smName);
                stateMachineDetails[smName] = {
                  inputCount: inputs ? inputs.length : 0,
                  inputs: inputs ? inputs.map(input => ({
                    name: input.name,
                    type: input.constructor.name,
                    value: input.value
                  })) : []
                };
                
                console.log(`🎯 [State Machine: ${smName}]`, stateMachineDetails[smName]);
              } catch (err) {
                console.warn(`⚠️ [State Machine: ${smName}] Could not get inputs:`, err);
                stateMachineDetails[smName] = {
                  inputCount: 0,
                  inputs: [],
                  error: err.message
                };
              }
            });

            // Check if 'isSpeaking' input exists anywhere
            let isSpeakingFound = false;
            let isSpeakingLocation = null;
            
            Object.entries(stateMachineDetails).forEach(([smName, details]) => {
              const hasisSpeaking = details.inputs.some(input => input.name === 'isSpeaking');
              if (hasisSpeaking) {
                isSpeakingFound = true;
                isSpeakingLocation = smName;
                console.log(`🎯 [Found isSpeaking] In state machine: ${smName}`);
              }
            });

            if (!isSpeakingFound) {
              console.warn('⚠️ [isSpeaking Not Found] The "isSpeaking" input was not found in any state machine');
            }

            setDiagnosticResults({
              source,
              activeArtboard,
              bounds,
              availableStateMachines,
              availableAnimations,
              stateMachineDetails,
              isSpeakingFound,
              isSpeakingLocation,
              isPlaying: rive.isPlaying,
              isPaused: rive.isPaused,
              isStopped: rive.isStopped
            });

            setRiveInstance(rive);
            setIsLoading(false);

          } catch (analysisError) {
            console.error('❌ [Rive Diagnostic] Analysis error:', analysisError);
            setError(`Analysis error: ${analysisError.message}`);
            setIsLoading(false);
          }
        },
        onLoadError: (loadError) => {
          console.error('❌ [Rive Diagnostic] Load error:', loadError);
          setError(`Load error: ${loadError.message || loadError}`);
          setIsLoading(false);
        }
      });

    } catch (initError) {
      console.error('❌ [Rive Diagnostic] Init error:', initError);
      setError(`Initialization error: ${initError.message}`);
      setIsLoading(false);
    }
  };

  const cleanup = () => {
    if (riveInstance) {
      try {
        riveInstance.cleanup();
        setRiveInstance(null);
        console.log('🧹 [Rive Diagnostic] Cleaned up instance');
      } catch (err) {
        console.warn('⚠️ [Rive Diagnostic] Cleanup error:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔍 Rive File Diagnostic Tool
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">File Analysis</h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={riveFilePath}
              onChange={(e) => setRiveFilePath(e.target.value)}
              placeholder="Enter Rive file path (e.g., /danak.riv)"
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={analyzeRiveFile}
              disabled={isLoading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            >
              {isLoading ? 'Analyzing...' : 'Analyze File'}
            </button>
            {riveInstance && (
              <button
                onClick={cleanup}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cleanup
              </button>
            )}
          </div>
          
          {/* Hidden canvas for Rive instance */}
          <canvas
            ref={canvasRef}
            width="1"
            height="1"
            style={{ display: 'none' }}
          />
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {isLoading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <strong>Loading:</strong> Analyzing Rive file...
            </div>
          )}
        </div>

        {diagnosticResults && (
          <div className="space-y-6">
            {/* File Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">📁 File Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Source:</strong> {diagnosticResults.source}
                </div>
                <div>
                  <strong>Active Artboard:</strong> {diagnosticResults.activeArtboard}
                </div>
                <div>
                  <strong>Bounds:</strong> {JSON.stringify(diagnosticResults.bounds)}
                </div>
                <div>
                  <strong>Status:</strong> 
                  {diagnosticResults.isPlaying ? ' Playing' : ''}
                  {diagnosticResults.isPaused ? ' Paused' : ''}
                  {diagnosticResults.isStopped ? ' Stopped' : ''}
                </div>
              </div>
            </div>

            {/* State Machines */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🎭 State Machines</h2>
              {diagnosticResults.availableStateMachines.length > 0 ? (
                <div className="space-y-4">
                  {diagnosticResults.availableStateMachines.map((smName, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{smName}</h3>
                      {diagnosticResults.stateMachineDetails[smName] ? (
                        <div>
                          <div className="mb-2">
                            <strong>Input Count:</strong> {diagnosticResults.stateMachineDetails[smName].inputCount}
                          </div>
                          {diagnosticResults.stateMachineDetails[smName].inputs.length > 0 && (
                            <div>
                              <strong>Inputs:</strong>
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                {diagnosticResults.stateMachineDetails[smName].inputs.map((input, idx) => (
                                  <li key={idx} className={input.name === 'isSpeaking' ? 'text-green-600 font-semibold' : ''}>
                                    <span className="font-mono">{input.name}</span> 
                                    <span className="text-gray-500"> ({input.type})</span>
                                    <span className="text-gray-400"> = {String(input.value)}</span>
                                    {input.name === 'isSpeaking' && <span className="text-green-600 ml-2">✓ Found!</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {diagnosticResults.stateMachineDetails[smName].error && (
                            <div className="text-red-600 mt-2">
                              <strong>Error:</strong> {diagnosticResults.stateMachineDetails[smName].error}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500">Could not analyze this state machine</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No state machines found in this file</div>
              )}
            </div>

            {/* Animations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">🎬 Animations</h2>
              {diagnosticResults.availableAnimations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {diagnosticResults.availableAnimations.map((animName, index) => (
                    <div key={index} className="bg-gray-100 p-2 rounded">
                      {animName}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No animations found in this file</div>
              )}
            </div>

            {/* isSpeaking Status */}
            <div className={`rounded-lg shadow-lg p-6 ${diagnosticResults.isSpeakingFound ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h2 className="text-xl font-semibold mb-4">
                🎯 isSpeaking Input Status
              </h2>
              {diagnosticResults.isSpeakingFound ? (
                <div className="text-green-800">
                  <div className="text-lg font-semibold mb-2">✅ isSpeaking input found!</div>
                  <div><strong>Location:</strong> State machine "{diagnosticResults.isSpeakingLocation}"</div>
                  <div className="mt-2 text-sm">
                    Your animation system should work correctly with this state machine.
                  </div>
                </div>
              ) : (
                <div className="text-red-800">
                  <div className="text-lg font-semibold mb-2">❌ isSpeaking input NOT found</div>
                  <div className="text-sm">
                    You need to add an "isSpeaking" boolean input to one of your state machines in the Rive editor.
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">💡 Recommendations</h2>
              <div className="space-y-2 text-sm">
                {diagnosticResults.availableStateMachines.length === 0 && (
                  <div className="text-red-600">• No state machines found. Create a state machine in your Rive file.</div>
                )}
                {!diagnosticResults.isSpeakingFound && (
                  <div className="text-red-600">• Add an "isSpeaking" boolean input to your state machine in Rive editor.</div>
                )}
                {diagnosticResults.availableStateMachines.length > 0 && diagnosticResults.isSpeakingFound && (
                  <div className="text-green-600">• Your Rive file looks good! Use state machine "{diagnosticResults.isSpeakingLocation}" in your code.</div>
                )}
                <div className="text-blue-600">• Check the console for detailed logging output.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiveFileDiagnostic;