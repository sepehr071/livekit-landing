import React, { useEffect } from "react";
import { useRive } from "../hooks/useRive";

const ChatAvatar = ({
  isAgentSpeaking = false,
  isUserSpeaking = false,
  agentMessage = "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
  showLoadingDots = false
}) => {
  const { canvasRef, setAnimationState, isLoaded, availableInputs, error } = useRive();

  // Update animation states when props change
  useEffect(() => {
    if (isLoaded && !error) {
      setAnimationState('isSpeaking', isAgentSpeaking);
      setAnimationState('IsListening', isUserSpeaking);
    }
  }, [isAgentSpeaking, isUserSpeaking, isLoaded, setAnimationState, error]);

  // Debug: log available animation inputs
  useEffect(() => {
    if (isLoaded && availableInputs.length > 0) {
      console.log('Available Rive animation inputs:', availableInputs);
    }
  }, [isLoaded, availableInputs]);

  return (
    <div className="flex flex-col items-center justify-center max-h-full py-2 overflow-y-auto h-[100%] drop-shadow-md">
      {/* Speech Bubble */}
      <div
        className="relative bg-gradient-to-r from-gray-100 via-white to-orange-50/80 p-4 rounded-lg shadow-md mb-4 max-w-xs sm:max-w-sm md:max-w-md max-h-[35%] overflow-y-auto custom-scrollbar"
        id="agentSpeechBubble"
      >
        <div className="flex items-start">
          <div className="mr-2 text-gray-500">
            <i className="fas fa-quote-left"></i>
          </div>
          <div className="text-gray-800 text-sm sm:text-base" id="agentText">
            {showLoadingDots ? (
              <div className="flex items-center">
                <span className="animate-pulse">...</span>
                <div className="ml-2 flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              agentMessage
            )}
          </div>
        </div>
      </div>

      {/* Rive Animation Container */}
      <div className="relative 
      .0 flex items-center justify-center max-h-[22rem] h-[100%]">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded shadow-lg"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
        {/* Fallback UI when Rive fails to load */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded">
            <div className="text-white text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl">🤖</span>
              </div>
              <p className="text-sm">Avatar Ready</p>
            </div>
          </div>
        )}
        
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Loading avatar...</p>
            </div>
          </div>
        )}
      </div>

      {/* Animation State Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && isLoaded && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          <div>Loaded: {isLoaded ? '✅' : '❌'}</div>
          <div>Speaking: {isAgentSpeaking ? '🗣️' : '😊'} | Listening: {isUserSpeaking ? '👂' : '💭'}</div>
          {availableInputs.length > 0 && (
            <div>Inputs: {availableInputs.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatAvatar;
