import React, { useEffect, useState } from "react";
import { useRive } from "../hooks/useRive";
import { useNavigate } from "react-router-dom";

const RiveAvatarButton = ({
  className,
  isAgentSpeaking = false,
  riveAssetPath, // Pass the rive asset path directly as a prop
}) => {
  const { canvasRef, setAnimationState, isLoaded, error, rive } = useRive(riveAssetPath, false);
  const [isHidden, setIsHidden] = useState(true);
  const [showText, setShowText] = useState(false);
  const navigate = useNavigate();

  // Handle animation state
  useEffect(() => {
    if (isLoaded && !error) {
      setAnimationState("isSpeaking", isAgentSpeaking);
    }
  }, [isAgentSpeaking, isLoaded, error, setAnimationState]);

  // Show button and text after mount
  useEffect(() => {
    const buttonTimer = setTimeout(() => setIsHidden(false), 150);
    const textTimer = setTimeout(() => setShowText(true), 800);
    return () => {
      clearTimeout(buttonTimer);
      clearTimeout(textTimer);
    };
  }, []);

  // Fix Rive canvas resolution
  useEffect(() => {
    if (canvasRef.current && rive && isLoaded) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * devicePixelRatio * 3;
      canvas.height = rect.height * devicePixelRatio * 3;
      
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      if (rive.resizeDrawingSurfaceToCanvas) {
        rive.resizeDrawingSurfaceToCanvas();
      }
    }
  }, [canvasRef, rive, isLoaded]);

  const handleClick = () => {
    setIsHidden(true);
    setShowText(false);
    setTimeout(() => {
      navigate(`/chat1${window.location.search}`);
    }, 400);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex  ">
      {/* Avatar Button */}
      <button
        onClick={handleClick}
        className={`${className}
        pt-2
         w-32 h-32 sm:w-40 sm:h-40 md:w-58 md:h-58
          rounded-full
          bg-gradient-to-br from-blue-100 to-gray-50
         
          transition-all duration-200 ease-out
          hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-200
    
          hover:scale-110
          
 
          flex
       
          ${isHidden ? 'translate-x-40 shadow-none opacity-0' : 'translate-x-0 shadow-xl opacity-100'}
          transition-transform duration-200
          [will-change:transform]
          [-webkit-tap-highlight-color:transparent]
        `}
        onFocus={(e) => e.target.blur()}
      >
        <div className="relative w-full h-full flex items-center justify-center rounded-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-full [image-rendering:auto] [will-change:transform]"
          />
        </div>
      </button>

 
    </div>
  );
};

export default RiveAvatarButton;
