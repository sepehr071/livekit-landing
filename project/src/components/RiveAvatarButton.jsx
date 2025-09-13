

import React, { useEffect, useState } from "react";
import { useRive } from "../hooks/useRive";
import { useNavigate } from "react-router-dom";
import { useCompanyConfig } from "../config/useCompanyConfig";
import { usePerformanceConfig } from "../config/usePerformanceConfig";
import { useCSSOptimization } from "../utils/cssUtils";

const RiveAvatarButton = ({
  className,
  isAgentSpeaking = false,
  isUserSpeaking = false,
  mode = "chat",
}) => {
  // Get company configuration
  const { config, getText } = useCompanyConfig();
  
  // Get performance configuration
  const {
    performanceConfig,
    isMobile,
    isDebugEnabled
  } = usePerformanceConfig();
  
  // Get CSS optimization utilities
  const {
    getOptimizedClasses,
    getPerformanceClass
  } = useCSSOptimization();
  
  // Use enhanced timeline animation system with performance awareness
  const {
    canvasRef,
    setAnimationState,
    isLoaded,
    error,
    isHealthy,
    debugLog
  } = useRive(config.assets.riveAnimation, isDebugEnabled()); // Performance-aware debug mode
  
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
      // Preserve URL parameters when navigating to chat
      const currentSearch = window.location.search;
      navigate(`/chat1${currentSearch}`);
    }, 400); // Adjust delay as needed, should be less than or equal to CSS transition duration
  };

  return (
    <button
      onClick={handleClick}
      className={getOptimizedClasses(
        className,
        `${className} ${getPerformanceClass('mobile-optimized')}`
      )}
      style={isHidden ? {
        transform: isMobile ? "translateX(8rem)" : "translateX(10rem)",
        willChange: 'transform'
      } : {}}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className={getOptimizedClasses(
            "w-full h-full rounded-full",
            "w-full h-full rounded-full mobile-optimized"
          )}
        />
        {/* Enhanced fallback and loading states - Performance Optimized */}
        {error && (
          <div className={getOptimizedClasses(
            "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-full",
            "absolute inset-0 flex items-center justify-center bg-purple-500 rounded-full"
          )}>
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
              <div className={`w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full mx-auto mb-1 ${
                performanceConfig.reducedAnimations ? 'animate-pulse' : 'animate-spin'
              }`}></div>
              <p className="text-xs">{getText("ui.loadingAvatar")}</p>
            </div>
          </div>
        )}
        {/* Health indicator for button - Only show on desktop when debug enabled */}
        {isLoaded && !isHealthy && !error && !isMobile && isDebugEnabled() && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
        )}
      </div>
    </button>
  );
};

export default RiveAvatarButton;
