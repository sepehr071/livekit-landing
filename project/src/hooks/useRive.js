import { useRef, useEffect, useState, useCallback } from 'react';

export const useRive = (src = '/danak.riv', enableDebug = false) => {
  const canvasRef = useRef(null);
  const [riveInstance, setRiveInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputs, setInputs] = useState({});
  const [error, setError] = useState(null);
  
  // Enhanced state management
  const [animationStates, setAnimationStates] = useState({});
  const [stateHistory, setStateHistory] = useState([]);
  const [isHealthy, setIsHealthy] = useState(false);
  const [lastStateChange, setLastStateChange] = useState(null);
  
  // Refs for robust state management and preventing circular dependencies
  const stateSetAttempts = useRef({});
  const healthCheckInterval = useRef(null);
  const animationStatesRef = useRef({});
  const riveInstanceRef = useRef(null);
  const isLoadedRef = useRef(false);
  const stateHistoryRef = useRef([]);
  const lastStateChangeRef = useRef(null);
  const maxRetries = 3;

  // Update refs when state changes
  useEffect(() => {
    animationStatesRef.current = animationStates;
  }, [animationStates]);

  useEffect(() => {
    riveInstanceRef.current = riveInstance;
  }, [riveInstance]);

  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  useEffect(() => {
    stateHistoryRef.current = stateHistory;
  }, [stateHistory]);

  useEffect(() => {
    lastStateChangeRef.current = lastStateChange;
  }, [lastStateChange]);

  // Enhanced debugging utility - stable reference
  const debugLog = useCallback((message, data = null) => {
    if (enableDebug) {
      console.log(`🎭 [useRive Debug] ${message}`, data || '');
    }
  }, [enableDebug]);

  // Enhanced timeline animation health verification - stable reference
  const verifyAnimationHealth = useCallback(() => {
    const currentRive = riveInstanceRef.current;
    const currentLoaded = isLoadedRef.current;
    
    if (!currentRive || !currentLoaded) return false;
    
    try {
      // Check timeline animation health
      const availableAnimations = currentRive.animationNames;
      const hasIdleAnimation = availableAnimations.includes('idle abass');
      const hasSpeakingAnimation = availableAnimations.includes('speaking abass');
      const hasRequiredAnimations = hasIdleAnimation && hasSpeakingAnimation;
      const isInstanceHealthy = !currentRive.isStopped && currentRive.source;
      
      debugLog('Timeline animation health check', {
        hasInstance: !!currentRive,
        isLoaded: currentLoaded,
        hasRequiredAnimations,
        hasIdleAnimation,
        hasSpeakingAnimation,
        availableAnimations,
        isPlaying: currentRive.isPlaying,
        isPaused: currentRive.isPaused,
        isStopped: currentRive.isStopped,
        source: currentRive.source,
        activeArtboard: currentRive.activeArtboard
      });
      
      return hasRequiredAnimations && isInstanceHealthy;
    } catch (error) {
      debugLog('Timeline animation health check failed', error.message);
      return false;
    }
  }, [debugLog]);

  // Start health monitoring - stable reference
  const startHealthMonitoring = useCallback(() => {
    if (healthCheckInterval.current) {
      clearInterval(healthCheckInterval.current);
    }
    
    healthCheckInterval.current = setInterval(() => {
      const healthy = verifyAnimationHealth();
      setIsHealthy(healthy);
      
      if (!healthy && isLoadedRef.current) {
        debugLog('⚠️ Animation health check failed - attempting recovery');
        // Could trigger recovery logic here if needed
      }
    }, 2000); // Check every 2 seconds
  }, [verifyAnimationHealth, debugLog]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamic import to handle potential loading issues
    const loadRive = async () => {
      try {
        debugLog('🚀 Starting Rive animation load', { src });
        const { Rive } = await import('@rive-app/canvas');
        
        const rive = new Rive({
          src,
          canvas: canvasRef.current,
          autoplay: true,
          animations: 'idle abass', // Default to idle animation
          onLoad: () => {
            try {
              debugLog('✅ Rive instance loaded, setting up timeline animation controls');
              
              // Official Rive recommendation: resize drawing surface to canvas
              rive.resizeDrawingSurfaceToCanvas();
              
              // Get available animations and state machines
              const availableStateMachines = rive.stateMachineNames;
              const availableAnimations = rive.animationNames;
              
              debugLog('🔍 Using timeline animations instead of state machines', {
                availableStateMachines,
                availableAnimations,
                activeArtboard: rive.activeArtboard,
                currentMode: 'timeline_animations'
              });
              
              // Check for required animations (only log errors)
              const hasIdleAnimation = availableAnimations.includes('idle abass');
              const hasSpeakingAnimation = availableAnimations.includes('speaking abass');
              
              if (!hasIdleAnimation || !hasSpeakingAnimation) {
                console.warn('⚠️ [Rive] Missing required animations:', {
                  expected: ['idle abass', 'speaking abass'],
                  found: availableAnimations
                });
              }
              
              // Initialize with empty inputs map for compatibility
              const inputsMap = {};
              const statesMap = {
                isIdle: true,
                isSpeaking: false
              };
              
              setInputs(inputsMap);
              setAnimationStates(statesMap);
              setIsLoaded(true);
              setError(null);
              setIsHealthy(true);
              
              // Start health monitoring
              startHealthMonitoring();
              
              debugLog('🎉 Timeline animation setup complete', {
                animationMode: 'timeline',
                availableAnimations,
                currentAnimation: 'idle abass',
                riveInstanceProperties: {
                  source: rive.source,
                  activeArtboard: rive.activeArtboard,
                  isPlaying: rive.isPlaying,
                  bounds: rive.bounds
                }
              });
              
            } catch (loadError) {
              debugLog('❌ Error setting up Rive animation', loadError);
              console.error('Error setting up Rive animation:', loadError);
              setError('Failed to setup animation controls');
            }
          },
          onLoadError: (riveError) => {
            debugLog('❌ Rive animation failed to load', riveError);
            console.error('Rive animation failed to load:', riveError);
            setError('Failed to load animation file');
          },
          onStateChange: (event) => {
            debugLog('🔄 State machine state changed', {
              stateName: event.data,
              timestamp: Date.now()
            });
          },
          onPlay: () => {
            debugLog('▶️ Animation started playing');
          },
          onPause: () => {
            debugLog('⏸️ Animation paused');
          },
          onStop: () => {
            debugLog('⏹️ Animation stopped');
          }
        });

        setRiveInstance(rive);

        return () => {
          debugLog('🧹 Cleaning up Rive instance using official cleanup');
          if (healthCheckInterval.current) {
            clearInterval(healthCheckInterval.current);
          }
          if (rive) {
            try {
              // Official Rive cleanup method
              rive.cleanup();
              debugLog('✅ Rive cleanup completed successfully');
            } catch (cleanupError) {
              debugLog('⚠️ Error during Rive cleanup', cleanupError);
              console.warn('Error cleaning up Rive instance:', cleanupError);
            }
          }
        };
      } catch (importError) {
        debugLog('❌ Failed to import Rive library', importError);
        console.error('Failed to import Rive library:', importError);
        setError('Animation library not available');
      }
    };

    loadRive();
    
    // Cleanup on unmount
    return () => {
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current);
      }
    };
  }, [src]); // Removed unstable dependencies

  // Enhanced timeline animation control with stable references
  const setAnimationState = useCallback((stateName, value, forceUpdate = false) => {
    const currentRive = riveInstanceRef.current;
    const currentLoaded = isLoadedRef.current;
    const currentStates = animationStatesRef.current;
    
    debugLog(`🎬 Setting timeline animation: ${stateName} = ${value}`, {
      forceUpdate,
      isLoaded: currentLoaded,
      riveInstance: !!currentRive
    });
    
    try {
      if (!currentRive || !currentLoaded) {
        debugLog(`⏳ Animation not ready yet, queuing: ${stateName} = ${value}`);
        return;
      }

      // Handle timeline animation control based on speaking state
      if (stateName === 'isSpeaking') {
        const targetAnimation = value ? 'speaking abass' : 'idle abass';
        const previousState = currentStates.isSpeaking;
        
        // Skip if no change needed to prevent unnecessary updates
        if (previousState === value) {
          debugLog(`🔄 Animation state unchanged: ${stateName} = ${value}`);
          return;
        }
        
        debugLog(`🎯 Switching to timeline animation: ${targetAnimation}`, {
          speaking: value,
          previousSpeaking: previousState,
          targetAnimation
        });
        
        try {
          // Play the target animation
          currentRive.play(targetAnimation);
          
          debugLog(`🎬 Playing timeline animation: ${targetAnimation}`);
          
          // Update refs directly to prevent re-renders - NO setState calls
          animationStatesRef.current = {
            ...animationStatesRef.current,
            isSpeaking: value,
            isIdle: !value,
            currentAnimation: targetAnimation
          };
          
          // Add to history ref
          const historyEntry = {
            stateName,
            value,
            previousValue: previousState,
            timestamp: Date.now(),
            success: true,
            animation: targetAnimation
          };
          
          stateHistoryRef.current = [
            ...stateHistoryRef.current.slice(-9), // Keep last 10 entries
            historyEntry
          ];
          
          lastStateChangeRef.current = {
            stateName,
            value,
            timestamp: Date.now(),
            animation: targetAnimation
          };
          
          // NO setState - use refs only to prevent infinite loops
          
          debugLog(`✅ Timeline animation switched successfully`, {
            stateName,
            value,
            targetAnimation,
            success: true
          });
          
        } catch (animationError) {
          console.error(`Failed to play Rive animation: ${targetAnimation}`, animationError);
          debugLog(`❌ Error playing animation: ${targetAnimation}`, animationError);
          
          // Add error to history ref
          const errorEntry = {
            stateName,
            value,
            previousValue: previousState,
            timestamp: Date.now(),
            success: false,
            error: animationError.message,
            animation: targetAnimation
          };
          
          stateHistoryRef.current = [
            ...stateHistoryRef.current.slice(-9),
            errorEntry
          ];
        }
      } else {
        debugLog(`⚠️ Unknown animation state: ${stateName}`, {
          supportedStates: ['isSpeaking'],
          requestedState: stateName
        });
      }
      
    } catch (stateError) {
      debugLog(`❌ Error in timeline animation control: ${stateName}`, stateError);
      console.warn('Error in timeline animation control:', stateError);
      
      // Add error to history ref
      const errorEntry = {
        stateName,
        value,
        previousValue: null,
        timestamp: Date.now(),
        success: false,
        error: stateError.message
      };
      
      stateHistoryRef.current = [
        ...stateHistoryRef.current.slice(-9),
        errorEntry
      ];
    }
  }, [debugLog]);

  const getAnimationState = useCallback((stateName) => {
    try {
      if (stateName === 'isSpeaking') {
        const value = animationStatesRef.current.isSpeaking || false;
        debugLog(`📖 Getting timeline animation state: ${stateName} = ${value}`);
        return value;
      }
      debugLog(`📖 Unknown animation state requested: ${stateName}`);
      return false;
    } catch (error) {
      debugLog(`❌ Error getting animation state: ${stateName}`, error);
      return false;
    }
  }, [debugLog]);

  // Force animation state (for debugging/recovery)
  const forceAnimationState = useCallback((stateName, value) => {
    debugLog(`🔧 Force setting animation state: ${stateName} = ${value}`);
    setAnimationState(stateName, value, true);
  }, [setAnimationState, debugLog]);

  // Get animation diagnostics
  const getAnimationDiagnostics = useCallback(() => {
    return {
      isLoaded,
      isHealthy,
      error,
      availableInputs: Object.keys(inputs),
      currentStates: animationStates,
      lastStateChange,
      stateHistory: stateHistory.slice(-5), // Last 5 changes
      hasIsSpeaking: !!inputs.isSpeaking,
      isSpeakingValue: inputs.isSpeaking?.value || false
    };
  }, [isLoaded, isHealthy, error, inputs, animationStates, lastStateChange, stateHistory]);

  return {
    // Core functionality
    canvasRef,
    riveInstance,
    isLoaded,
    error,
    
    // Enhanced state management
    setAnimationState,
    getAnimationState,
    forceAnimationState,
    
    // Diagnostics and monitoring - use refs to prevent re-renders
    availableInputs: Object.keys(inputs),
    currentAnimationStates: animationStatesRef.current,
    isHealthy,
    lastStateChange: lastStateChangeRef.current,
    stateHistory: stateHistoryRef.current,
    getAnimationDiagnostics,
    
    // Debug mode
    enableDebug,
    debugLog
  };
};