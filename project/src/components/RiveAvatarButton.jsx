import React, { useEffect } from "react";
import { useRive } from "../hooks/useRive";

const RiveAvatarButton = ({ onClick, className, isAgentSpeaking = false, isUserSpeaking = false, mode = 'chat' }) => {
  const { canvasRef, setAnimationState, isLoaded, error } = useRive();

  return (
    <button onClick={onClick} className={className}>
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-full"
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-full">
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
    </button>
  );
};

export default RiveAvatarButton;
