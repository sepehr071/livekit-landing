

import React, { useEffect, useState } from "react";
import { useRive } from "../hooks/useRive";
import { useNavigate } from "react-router-dom";
import { useCompanyConfig } from "../config/useCompanyConfig";

const RiveAvatarButton = ({
  className,
  isAgentSpeaking = false,
  isUserSpeaking = false,
  mode = "chat",
}) => {
  // Get company configuration
  const { config, getText } = useCompanyConfig();
  
  // Use enhanced timeline animation system
  const {
    canvasRef,
    setAnimationState,
    isLoaded,
    error,
    isHealthy,
    debugLog
  } = useRive(config.assets.riveAnimation, false); // Debug disabled for button
  
  const [isHidden, setIsHidden] = useState(true);
  const navigate = useNavigate();

  // Timeline animation control for button - stable dependencies
  useEffect(() => {
    if (isLoaded && isHealthy && !error) {
      // Button uses timeline animations: "idle abass" and "speaking abass"
      setAnimationState("isSpeaking", isAgentSpeaking);
      
      debugLog('🔘 Button timeline animation control', {
        isAgentSpeaking,
        targetAnimation: isAgentSpeaking ? 'speaking abass' : 'idle abass'
      });
    }
  }, [isAgentSpeaking, isLoaded, isHealthy, error, setAnimationState, debugLog]); // Functions now stable

  useEffect(() => {
    setTimeout(() => {
      setIsHidden(false);
    }, 150);
  }, []);

  const handleClick = () => {
    setIsHidden(true);
    // Give a small delay for the animation to play before navigating
    setTimeout(() => {
      navigate("/chat1");
    }, 400); // Adjust delay as needed, should be less than or equal to CSS transition duration
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={isHidden ? { transform: "translateX(10rem)" } : {}}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full rounded-full" />
        {/* Enhanced fallback and loading states */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-full">
            <div className="text-white text-center">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-xl">🤖</span>
              </div>
              <p className="text-xs">{getText("ui.avatarReady")}</p>
            </div>
          </div>
        )}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
              <p className="text-xs">{getText("ui.loadingAvatar")}</p>
            </div>
          </div>
        )}
        {/* Health indicator for button */}
        {isLoaded && !isHealthy && !error && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
        )}
      </div>
    </button>
  );
};

export default RiveAvatarButton;
