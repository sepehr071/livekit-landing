import { useRef, useEffect, useState } from 'react';

export const useRive = (src = '/danak.riv') => {
  const canvasRef = useRef(null);
  const [riveInstance, setRiveInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inputs, setInputs] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamic import to handle potential loading issues
    const loadRive = async () => {
      try {
        const { Rive } = await import('@rive-app/canvas');
        
        const rive = new Rive({
          src,
          canvas: canvasRef.current,
          autoplay: true,
          stateMachines: 'StateMachine',
          onLoad: () => {
            try {
              rive.resizeDrawingSurfaceToCanvas();
              
              // Get state machine inputs
              const stateMachineInputs = rive.stateMachineInputs('StateMachine');
              const inputsMap = {};
              
              if (stateMachineInputs && stateMachineInputs.length > 0) {
                stateMachineInputs.forEach(input => {
                  inputsMap[input.name] = input;
                });
              }
              
              setInputs(inputsMap);
              setIsLoaded(true);
              setError(null);
              console.log('Rive animation loaded successfully', Object.keys(inputsMap));
            } catch (loadError) {
              console.error('Error setting up Rive animation:', loadError);
              setError('Failed to setup animation controls');
            }
          },
          onError: (riveError) => {
            console.error('Rive animation failed to load:', riveError);
            setError('Failed to load animation file');
          }
        });

        setRiveInstance(rive);

        return () => {
          if (rive) {
            try {
              rive.cleanup();
            } catch (cleanupError) {
              console.warn('Error cleaning up Rive instance:', cleanupError);
            }
          }
        };
      } catch (importError) {
        console.error('Failed to import Rive library:', importError);
        setError('Animation library not available');
      }
    };

    loadRive();
  }, [src]);

  const setAnimationState = (stateName, value) => {
    try {
      if (inputs[stateName]) {
        inputs[stateName].value = value;
      } else if (isLoaded) {
        console.warn(`Animation state "${stateName}" not found. Available:`, Object.keys(inputs));
      }
    } catch (stateError) {
      console.warn('Error setting animation state:', stateError);
    }
  };

  const getAnimationState = (stateName) => {
    try {
      return inputs[stateName]?.value || false;
    } catch {
      return false;
    }
  };

  return {
    canvasRef,
    riveInstance,
    isLoaded,
    setAnimationState,
    getAnimationState,
    availableInputs: Object.keys(inputs),
    error
  };
};