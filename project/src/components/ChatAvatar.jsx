import React, { useEffect, useState } from "react";
import { useRive } from "../hooks/useRive";

const ChatAvatar = ({
  isAgentSpeaking = false,
  isUserSpeaking = false,
  agentMessage = "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
  showLoadingDots = false,
  mode = "chat", // 'chat' or 'voice',
  productImageData = { image_url: "" },
  productLinkData = null,
}) => {
  const { canvasRef, setAnimationState, isLoaded, availableInputs, error } =
    useRive();

  const [isImageVisible, setIsImageVisible] = useState(false);
  const [imageSource, setImageSource] = useState("");
  const [isLinkVisible, setIsLinkVisible] = useState(false);
  const [linkData, setLinkData] = useState(null);

  // Update imageData when productImageData prop changes
  useEffect(() => {
    console.log('ChatAvatar: productImageData changed:', productImageData);
    if (productImageData && productImageData.image_url) {
      setIsImageVisible(true);

      setTimeout(() => {
        setImageSource(productImageData.image_url);
      }, 250);

      const timer = setTimeout(() => {
        setIsImageVisible(false);

        setTimeout(() => {
          setImageSource("");
        }, 250);
      }, 4000); // Display image for 4 seconds
      return () => clearTimeout(timer);
    }
  }, [productImageData]);

  // Update linkData when productLinkData prop changes
  useEffect(() => {
    console.log('ChatAvatar: productLinkData changed:', productLinkData);
    if (productLinkData && productLinkData.link_url) {
      setIsLinkVisible(true);

      setTimeout(() => {
        setLinkData(productLinkData);
      }, 250);

      const timer = setTimeout(() => {
        setIsLinkVisible(false);

        setTimeout(() => {
          setLinkData(null);
        }, 250);
      }, 5000); // Display link for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [productLinkData]);

  // Update animation states based on mode
  useEffect(() => {
    if (isLoaded && !error) {
      if (mode === "voice") {
        // In voice mode: control animation based on speaking states
        setAnimationState("isSpeaking", isAgentSpeaking);
        setAnimationState("IsListening", isUserSpeaking);
      } else {
        // In chat mode: keep animation idle (no active states)
        setAnimationState("isSpeaking", false);
        setAnimationState("IsListening", false);
      }
    }
  }, [
    isAgentSpeaking,
    isUserSpeaking,
    isLoaded,
    setAnimationState,
    error,
    mode,
  ]);

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
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            ) : (
              agentMessage
            )}
          </div>
        </div>
      </div>

      {/* Rive Animation Container */}
      <div className="relative  rounded-lg flex items-center justify-center max-h-[22rem] h-[100%] w-full ">
        <canvas
          // onClick={handelImage}
          ref={canvasRef}
          className={`w-full h-full rounded shadow-lg bg-white/40 backdrop-blur-xl duration-500 transition-all ${
            (imageSource || linkData) &&
            `!w-1/5 !h-1/5 !rounded-full !bg-white/80 absolute  right-2  top-2  ${
              (!isImageVisible && !isLinkVisible) && "right-[45%] top-[45%]"
            }`
          }`}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />

        {/* Image Display */}
        {imageSource && (
          <div
            id="imageBox"
            className="w-full h-full duration-500 rounded-lg transition-all place-items-center content-center"
          >
            <img
              className="max-w-full max-h-full rounded-lg"
              src={imageSource}
              alt="image"
            />
          </div>
        )}

        {/* Link Display */}
        {linkData && (
          <div
            id="linkBox"
            className="w-full h-full duration-500 rounded-lg transition-all flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {linkData.product_title || "Product Link"}
                </h3>
                {linkData.description && (
                  <p className="text-sm text-gray-600 mb-3">{linkData.description}</p>
                )}
              </div>
              
              <button
                onClick={() => window.open(linkData.link_url, '_blank', 'noopener,noreferrer')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15,3 21,3 21,9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Open Link
              </button>
              
              <div className="mt-3 text-xs text-gray-500">
                Auto-close in 5 seconds
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
};

export default ChatAvatar;
