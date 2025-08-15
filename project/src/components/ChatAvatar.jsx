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
  
  // Transition animation states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showProductContainer, setShowProductContainer] = useState(false);

  // Update imageData when productImageData prop changes
  useEffect(() => {
    console.log('🔍 ChatAvatar: productImageData changed:', productImageData);
    console.log('🔍 Current state - isImageVisible:', isImageVisible, 'imageSource:', imageSource);
    
    if (productImageData && productImageData.image_url) {
      console.log('✅ Product image data is valid, image_url:', productImageData.image_url);
      console.log('🎬 Starting transition animation');
      
      // Start transition animation
      setIsTransitioning(true);
      setIsImageVisible(true);
      
      // After transition animation, show product container
      setTimeout(() => {
        console.log('🖼️ Setting imageSource and showing product container:', productImageData.image_url);
        setImageSource(productImageData.image_url);
        setShowProductContainer(true);
      }, 1200); // Transition duration

    } else if (productImageData === null) {
      // Explicitly dismiss when productImageData is set to null
      console.log('🔄 Dismissing image due to null productImageData');
      setShowProductContainer(false);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setIsImageVisible(false);
        setImageSource("");
        setIsTransitioning(false);
      }, 1200);
    } else {
      console.log('❌ Product image data is invalid or missing image_url');
      console.log('   - productImageData exists:', !!productImageData);
      console.log('   - image_url exists:', productImageData?.image_url);
    }
  }, [productImageData]);

  // Update linkData when productLinkData prop changes
  useEffect(() => {
    console.log('ChatAvatar: productLinkData changed:', productLinkData);
    if (productLinkData && productLinkData.link_url) {
      // Start transition animation
      setIsTransitioning(true);
      setIsLinkVisible(true);

      // After transition animation, show product container
      setTimeout(() => {
        setLinkData(productLinkData);
        setShowProductContainer(true);
      }, 600);

    } else if (productLinkData === null) {
      // Explicitly dismiss when productLinkData is set to null
      console.log('🔄 Dismissing link due to null productLinkData');
      setShowProductContainer(false);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setIsLinkVisible(false);
        setLinkData(null);
        setIsTransitioning(false);
      }, 600);
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
        className="relative bg-gradient-to-r from-orange-50/90 via-white to-orange-100/70 p-4 rounded-xl shadow-lg border border-orange-200/30 mb-4 max-w-xs sm:max-w-sm md:max-w-md max-h-[35%] overflow-y-auto custom-scrollbar backdrop-blur-sm"
        id="agentSpeechBubble"
      >
        <div className="flex items-start">
          
          <div className="text-gray-800 text-sm sm:text-base font-medium" id="agentText">
            {showLoadingDots ? (
              <div className="flex items-center">
                <div className=" flex space-x-1">
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
      <div className="relative rounded-lg flex items-center justify-center max-h-[22rem] h-[100%] w-full overflow-hidden">
        {/* Character Background Image - Contained and Positioned */}
        {!imageSource && !linkData && (
          <div
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: "url('/images/Rectangle-character.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              marginBottom: "-30px",
              backgroundPosition: "center center"
            }}
          />
        )}
        
        {/* Main canvas with smooth transition animation */}
        <canvas
          ref={canvasRef}
          className={`relative z-10 rounded bg-transparent transition-all duration-700 ease-in-out ${
            showProductContainer
              ? 'w-24 h-24 absolute rounded-full shadow-lg'
              : 'w-full h-full'
          }`}
          style={{
            maxWidth: showProductContainer ? "96px" : "100%",
            maxHeight: showProductContainer ? "96px" : "100%",
            border: showProductContainer ? "3px solid #e56c13" : "none",
            zIndex: showProductContainer ? 30 : 10,
            marginBottom: !showProductContainer ? "1px" : "0",
            ...(showProductContainer ? {
              top: "-35%",
              left: "86%",
              transform: "translateX(-50%)"
            } : {})
          }}
        />

        {/* Product Image Display - Organic Container Design */}
        {(() => {
          console.log('🎨 Rendering image section - imageSource:', imageSource, 'showProductContainer:', showProductContainer);
          return imageSource && showProductContainer && (
            <div
              id="imageBox"
              className="duration-500 transition-all flex items-center justify-center p-6 relative"
              style={{
                backgroundImage: "url('/images/Rectangle-image.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                minHeight: "500px",
                width: "120%",
                height: "120%",
                marginLeft: "-10%",
                transform: "scale(1.1)"
              }}
            >
              {/* Product content overlaid directly on background */}
              <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto relative">
                <div className="pt-8 pb-4">
                  <img
                    className="w-32 h-32 mx-auto rounded-xl object-cover mb-6"
                    src={imageSource}
                    alt="product"
                    onLoad={() => console.log('✅ Image loaded successfully:', imageSource)}
                    onError={(e) => console.log('❌ Image failed to load:', imageSource, 'Error:', e)}
                  />
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                    {productImageData?.product_title || "Product"}
                  </h3>
                  <div className="text-xs text-gray-500 font-medium text-center">
                    Say "close" to dismiss
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Product Link Display - Organic Container Design */}
        {linkData && showProductContainer && (
          <div
            id="linkBox"
            className="duration-500 transition-all flex items-center justify-center p-6 relative"
            style={{
              backgroundImage: "url('/images/Rectangle-image.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              minHeight: "500px",
              width: "120%",
              height: "120%",
              marginLeft: "-10%",
              transform: "scale(1.1)"
            }}
          >
            {/* Link content overlaid directly on background */}
            <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto relative">
              <div className="pt-8 pb-4">
                <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                  {linkData.product_title || "Product Link"}
                </h3>
                {linkData.description && (
                  <p className="text-sm text-gray-600 mb-6 text-center font-medium">{linkData.description}</p>
                )}
                
                <button
                  onClick={() => {
                    window.open(linkData.link_url, '_blank', 'noopener,noreferrer');
                    // Dismiss link box after opening
                    setShowProductContainer(false);
                    setIsTransitioning(true);
                    
                    setTimeout(() => {
                      setIsLinkVisible(false);
                      setLinkData(null);
                      setIsTransitioning(false);
                    }, 1200);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 w-full text-base mb-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15,3 21,3 21,9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Open Link
                </button>
                
                <div className="text-xs text-gray-500 font-medium text-center">
                  Click link to dismiss or say "close"
                </div>
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
              <p className="text-sm font-medium">Avatar Ready</p>
            </div>
          </div>
        )}

        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm font-medium">Loading avatar...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Product Avatar Component - No longer needed since main canvas animates to corner
const ProductAvatar = () => null;

export default ChatAvatar;
