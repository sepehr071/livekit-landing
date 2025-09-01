

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
  
  // Use configurable Rive animation file
  const { canvasRef, setAnimationState, isLoaded, error } = useRive(config.assets.riveAnimation);
  const [isHidden, setIsHidden] = useState(true);
  const navigate = useNavigate();

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
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-full">
            <div className="text-white text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl">🤖</span>
              </div>
              <p className="text-sm">{getText("ui.avatarReady")}</p>
            </div>
          </div>
        )}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">{getText("ui.loadingAvatar")}</p>
            </div>
          </div>
        )}
      </div>
    </button>
  );
};

export default RiveAvatarButton;
