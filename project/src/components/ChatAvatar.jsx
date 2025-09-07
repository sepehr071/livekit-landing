import React, { useEffect, useState, useMemo } from "react";
import { useRive } from "../hooks/useRive";
import { useCompanyConfig } from "../config/useCompanyConfig";
import ImageSlider from "./ImageSlider";

const ChatAvatar = ({
  isAgentSpeaking = false,
  isUserSpeaking = false,
  agentMessage,
  showLoadingDots = false,
  mode = "chat", // 'chat' or 'voice',
  productImageData = { image_url: "" },
  productLinkData = null,
}) => {
  // Get company configuration
  const { config, getText, getAsset, getAvatarSettings } = useCompanyConfig();
  
  // Use configurable Rive animation file
  const { canvasRef, setAnimationState, isLoaded, availableInputs, error } =
    useRive(config.assets.riveAnimation);

  const [isImageVisible, setIsImageVisible] = useState(false);
  const [imageSource, setImageSource] = useState("");
  const [isLinkVisible, setIsLinkVisible] = useState(false);
  const [linkData, setLinkData] = useState(null);
  
  // Product display states
  const [showProductContainer, setShowProductContainer] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Check if mobile device using config breakpoint
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileDevice(window.innerWidth <= config.behavior.ui.responsiveBreakpoint);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [config.behavior.ui.responsiveBreakpoint]);

  // Get avatar settings based on device type with error handling
  const avatarSettings = useMemo(() => {
    try {
      return getAvatarSettings(isMobileDevice);
    } catch (error) {
      console.error('Error getting avatar settings:', error);
      // Fallback settings
      return {
        translate: { x: 210, y: -110 },
        scale: 0.9,
        borderRadius: "50%"
      };
    }
  }, [isMobileDevice, getAvatarSettings]);
  
  // Set default message if not provided
  const displayMessage = agentMessage || getText("defaultGreeting.text");

  // Handle image data changes
  useEffect(() => {
    if (productImageData && productImageData.images) {
      const images = productImageData.images;
      const hasImages = images && images.length > 0 && images[0];
      
      if (hasImages) {
        if (showProductContainer) {
          // Instant content swap for existing container
          setImageSource(images[0]);
          setIsImageVisible(true);
          setLinkData(null);
          setIsLinkVisible(false);
          setCurrentImageIndex(0);
        } else {
          // New container - start center-expand animation
          setIsExpanding(true);
          setIsImageVisible(true);
          
          setTimeout(() => {
            setImageSource(images[0]);
            setShowProductContainer(true);
            setIsExpanding(false);
            setCurrentImageIndex(0);
          }, 600);
        }
      }
    } else if (productImageData === null && !productLinkData) {
      // Clean dismissal - no extra animations
      setIsImageVisible(false);
      setImageSource("");
      setCurrentImageIndex(0);
      if (!linkData) {
        setShowProductContainer(false);
      }
    } else if (productImageData === null && productLinkData) {
      // Keep container for link
      setIsImageVisible(false);
      setImageSource("");
      setCurrentImageIndex(0);
    }
  }, [productImageData]);

  // Handle link data changes
  useEffect(() => {
    if (productLinkData && productLinkData.link_url) {
      if (showProductContainer) {
        // Instant content swap for existing container
        setLinkData(productLinkData);
        setIsLinkVisible(true);
        setImageSource("");
        setIsImageVisible(false);
      } else {
        // New container - start center-expand animation
        setIsExpanding(true);
        setIsLinkVisible(true);
        
        setTimeout(() => {
          setLinkData(productLinkData);
          setShowProductContainer(true);
          setIsExpanding(false);
        }, 600);
      }
    } else if (productLinkData === null && !productImageData) {
      // Clean dismissal - no extra animations
      setIsLinkVisible(false);
      setLinkData(null);
      if (!imageSource) {
        setShowProductContainer(false);
      }
    } else if (productLinkData === null && productImageData) {
      // Keep container for image
      setIsLinkVisible(false);
      setLinkData(null);
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
        className="relative bg-white p-4 rounded-xl shadow-lg border border-gray-200/50 mb-4 max-w-xs sm:max-w-sm md:max-w-md max-h-[35%] overflow-y-auto custom-scrollbar backdrop-blur-sm"
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
              backgroundImage: `url('${getAsset("images.characterBackground")}')`,
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
          className={`relative z-10 bg-transparent transition-all duration-[1200ms] ease-out ${
            showProductContainer
              ? 'absolute rounded-full shadow-lg border-2 border-white'
              : 'rounded-lg'
          }`}
          style={{
            zIndex: showProductContainer ? 30 : 10,
            marginBottom: !showProductContainer ? "1px" : "0",
            background: showProductContainer ? "linear-gradient(135deg, #fb923c, #f97316)" : "transparent",
            width: showProductContainer ? "120px" : "100%",
            height: showProductContainer ? "120px" : "100%",
            transform: showProductContainer
              ? `translate(${avatarSettings.translate.x}px, ${avatarSettings.translate.y}px) scale(${avatarSettings.scale})`
              : 'translate(0, 0) scale(1)',
            transformOrigin: 'center center',
            transition: 'all 1200ms cubic-bezier(0.4, 0, 0.2, 1)',
            // Ensure perfect circle in product mode - different radius for mobile
            borderRadius: showProductContainer ? avatarSettings.borderRadius : undefined
          }}
        />

        {/* Product Image Display - Enhanced with Multi-Image Support */}
        {imageSource && showProductContainer && (
          <div
            id="imageBox"
            className={`flex items-center justify-center p-3 sm:p-4 md:p-6 relative w-full h-full transition-all duration-600 ease-out ${
              isExpanding ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
            }`}
            style={{
              backgroundImage: `url('${getAsset("images.productContainer")}')`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              minHeight: "280px",
              maxHeight: "450px",
              marginRight: "-95px",
              right: "107px",
              top: "20px"
            }}
          >
            {/* Product content overlaid directly on background */}
            <div className="flex flex-col items-center justify-center w-full max-w-[280px] sm:max-w-xs mx-auto relative px-3 sm:px-4">
              <div className="pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 text-center">
                {/* Check if we have multiple images */}
                {productImageData?.images && productImageData.images.length > 1 ? (
                  /* Multi-image slider */
                  <div className="w-full h-32 sm:h-36 md:h-40 mb-3 sm:mb-4 md:mb-6 rounded-lg overflow-hidden">
                    <ImageSlider
                      images={productImageData.images}
                      title={productImageData.product_title || getText("ui.productFallback")}
                      description={productImageData.description}
                      currentIndex={currentImageIndex}
                      onIndexChange={setCurrentImageIndex}
                      onClose={() => {
                        setShowProductContainer(false);
                        setIsImageVisible(false);
                        setImageSource("");
                        setCurrentImageIndex(0);
                      }}
                    />
                  </div>
                ) : (
                  /* Single image display (legacy support) */
                  <img
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-lg sm:rounded-xl object-cover mb-3 sm:mb-4 md:mb-6"
                    src={imageSource}
                    alt="product"
                    onLoad={() => console.log('✅ Image loaded successfully:', imageSource)}
                    onError={(e) => console.log('❌ Image failed to load:', imageSource, 'Error:', e)}
                  />
                )}
                
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 text-center mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {productImageData?.product_title || getText("ui.productFallback")}
                  {productImageData?.images && productImageData.images.length > 1 && (
                    <span className="block text-xs text-gray-500 font-normal mt-1">
                      {productImageData.images.length} images
                    </span>
                  )}
                </h3>
                
                {productImageData?.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 text-center font-medium leading-relaxed">
                    {productImageData.description}
                  </p>
                )}
                
                <div className="text-xs text-gray-500 font-medium text-center">
                  {getText("ui.productDismissText")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Link Display - Organic Container Design */}
        {linkData && showProductContainer && (
          <div
            id="linkBox"
            className={`flex items-center justify-center p-3 sm:p-4 md:p-6 relative w-full h-full transition-all duration-600 ease-out ${
              isExpanding ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
            }`}
            style={{
              backgroundImage: `url('${getAsset("images.productContainer")}')`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              minHeight: "280px",
              maxHeight: "450px",
              marginRight: "-68px",
              right: "92px",
              top: "34px"
            }}
          >
            {/* Link content overlaid directly on background */}
            <div className="flex flex-col items-center justify-center w-full max-w-[280px] sm:max-w-xs mx-auto relative px-3 sm:px-4">
              <div className="pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 text-center">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 text-center mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {linkData.product_title || getText("ui.productLinkFallback")}
                </h3>
                {linkData.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 md:mb-6 text-center font-medium leading-relaxed">{linkData.description}</p>
                )}
                
                <button
                  onClick={() => {
                    window.open(linkData.link_url, '_blank', 'noopener,noreferrer');
                    // Dismiss link box after opening
                    setShowProductContainer(false);
                    setIsLinkVisible(false);
                    setLinkData(null);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-lg sm:rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 w-full text-xs sm:text-sm md:text-base mb-2 sm:mb-3 md:mb-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15,3 21,3 21,9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  {getText("ui.openLink")}
                </button>
                
                <div className="text-xs text-gray-500 font-medium text-center">
                  {getText("ui.linkDismissText")}
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
              <p className="text-sm font-medium">{getText("ui.avatarReady")}</p>
            </div>
          </div>
        )}

        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm font-medium">{getText("ui.loadingAvatar")}</p>
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
