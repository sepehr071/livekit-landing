import React, { useEffect, useState, useMemo } from "react";
import { useRive } from "../hooks/useRive";
import { useCompanyConfig } from "../config/useCompanyConfig";
import { usePerformanceConfig } from "../config/usePerformanceConfig";
import { useCSSOptimization } from "../utils/cssUtils";
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
  
  // Get performance configuration
  const {
    performanceConfig,
    isMobile,
    isLowEndDevice,
    isDebugEnabled,
    getHealthCheckInterval
  } = usePerformanceConfig();
  
  // Get CSS optimization utilities
  const {
    getOptimizedClasses,
    getPerformanceClass,
    getBackdropBlur,
    getShadow,
    getTransitionDuration,
    getAvatarTransform,
    shouldEnableHover
  } = useCSSOptimization();
  
  // Use enhanced configurable Rive animation file with performance-aware debugging
  const {
    canvasRef,
    setAnimationState,
    isLoaded,
    availableInputs,
    error,
    isHealthy,
    getAnimationDiagnostics,
    currentAnimationStates,
    debugLog
  } = useRive(config.assets.riveAnimation, isDebugEnabled()); // Performance-aware debug mode

  const [isImageVisible, setIsImageVisible] = useState(false);
  const [imageSource, setImageSource] = useState("");
  const [isLinkVisible, setIsLinkVisible] = useState(false);
  const [linkData, setLinkData] = useState(null);
  
  // Product display states
  const [showProductContainer, setShowProductContainer] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Animation debug states
  const [showAnimationDebug, setShowAnimationDebug] = useState(false);

  // Performance-optimized avatar settings using the new system
  const avatarSettings = useMemo(() => {
    try {
      const settings = getAvatarSettings(isMobile);
      const optimizedTransform = getAvatarTransform();
      
      // Merge company config with performance optimizations
      return {
        ...settings,
        ...optimizedTransform,
        // Add performance classes
        performanceClass: getPerformanceClass(''),
        enableHover: shouldEnableHover(),
        transitionDuration: getTransitionDuration('1200')
      };
    } catch (error) {
      console.error('Error getting avatar settings:', error);
      // Performance-aware fallback settings
      return {
        translate: isMobile ? { x: '160px', y: '-100px', z: '0' } : { x: 210, y: -110 },
        scale: isMobile ? 0.75 : 0.9,
        borderRadius: isMobile ? "96%" : "50%",
        transform: isMobile ? "translate3d(160px, -100px, 0) scale(0.75)" : "translate(210px, -110px) scale(0.9)",
        performanceClass: getPerformanceClass('mobile-optimized'),
        enableHover: !isMobile,
        transitionDuration: getTransitionDuration('300')
      };
    }
  }, [isMobile, getAvatarSettings, getAvatarTransform, getPerformanceClass, shouldEnableHover, getTransitionDuration]);
  
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

  // Enhanced timeline animation control with cross-mode support - stable dependencies
  useEffect(() => {
    if (isLoaded && !error && isHealthy) {
      // CROSS-MODE SUPPORT: Timeline animations work in both modes
      // In chat mode: Visual animation feedback only (no audio)
      // In voice mode: Visual animation + audio feedback
      
      // Control speaking animation in both modes
      setAnimationState("isSpeaking", isAgentSpeaking);
      
      debugLog('Timeline animation updated', {
        mode,
        isSpeaking: isAgentSpeaking,
        targetAnimation: isAgentSpeaking ? 'speaking abass' : 'idle abass'
      });
    }
  }, [
    isAgentSpeaking,
    isLoaded,
    error,
    mode,
    isHealthy,
    setAnimationState,
    debugLog
  ]); // Removed getAnimationDiagnostics to prevent infinite loop

  // Essential error monitoring (reduced logging)
  useEffect(() => {
    if (error) {
      console.error('Rive animation error:', error);
    }
  }, [error]);

  // Debug key listener disabled for production (enable only when needed)
  // useEffect(() => {
  //   const handleKeyPress = (event) => {
  //     if (event.ctrlKey && event.shiftKey && event.key === 'D') {
  //       setShowAnimationDebug(prev => !prev);
  //     }
  //   };
  //   window.addEventListener('keydown', handleKeyPress);
  //   return () => window.removeEventListener('keydown', handleKeyPress);
  // }, [showAnimationDebug]);

  return (
    <div className="flex flex-col items-center justify-center max-h-full py-2 overflow-y-auto h-[100%] drop-shadow-md">
      {/* Speech Bubble - Performance Optimized */}
      <div
        className={getOptimizedClasses(
          "relative bg-white p-4 rounded-xl shadow-lg border border-gray-200/50 mb-4 max-w-xs sm:max-w-sm md:max-w-md max-h-[35%] overflow-y-auto custom-scrollbar backdrop-blur-sm",
          "relative bg-white p-4 rounded-xl shadow-md border border-gray-200/50 mb-4 max-w-xs sm:max-w-sm md:max-w-md max-h-[35%] overflow-y-auto custom-scrollbar"
        )}
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
        
        {/* Main canvas with performance-optimized transitions */}
        <canvas
          ref={canvasRef}
          className={getOptimizedClasses(
            `relative z-10 bg-transparent transition-all ${getTransitionDuration('1200')} ease-out ${
              showProductContainer
                ? `absolute rounded-full ${getShadow('lg')} border-2 border-white ${getPerformanceClass('gpu-accelerated')}`
                : 'rounded-lg'
            }`,
            `relative z-10 bg-transparent transition-transform ${getTransitionDuration('400')} ease-out ${
              showProductContainer
                ? `absolute rounded-full ${getShadow('md')} border-2 border-white mobile-optimized`
                : 'rounded-lg'
            }`
          )}
          style={{
            zIndex: showProductContainer ? 30 : 10,
            marginBottom: !showProductContainer ? "1px" : "0",
            background: showProductContainer ? "linear-gradient(135deg, #fb923c, #f97316)" : "transparent",
            width: showProductContainer ? "120px" : "100%",
            height: showProductContainer ? "120px" : "100%",
            transform: showProductContainer
              ? avatarSettings.transform || `translate(${avatarSettings.translate?.x || 0}px, ${avatarSettings.translate?.y || 0}px) scale(${avatarSettings.scale || 1})`
              : 'translate3d(0, 0, 0) scale(1)',
            transformOrigin: 'center center',
            transition: `all ${performanceConfig.simplifiedTransitions ? '400ms' : '1200ms'} cubic-bezier(0.4, 0, 0.2, 1)`,
            // Ensure perfect circle in product mode with performance-aware radius
            borderRadius: showProductContainer ? avatarSettings.borderRadius : undefined,
            // Add hardware acceleration hint for mobile
            willChange: showProductContainer ? 'transform' : 'auto'
          }}
        />

        {/* Product Image Display - Enhanced with Multi-Image Support */}
        {imageSource && showProductContainer && (
          <div
            id="imageBox"
            className={getOptimizedClasses(
              `flex items-center justify-center p-3 sm:p-4 md:p-6 relative w-full h-full transition-all ${getTransitionDuration('600')} ease-out ${
                isExpanding ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
              } ${getPerformanceClass('gpu-accelerated')}`,
              `flex items-center justify-center p-3 sm:p-4 md:p-6 relative w-full h-full transition-opacity ${getTransitionDuration('400')} ease-out ${
                isExpanding ? 'opacity-0' : 'opacity-100'
              } mobile-optimized`
            )}
            style={{
              backgroundImage: `url('${getAsset("images.productContainer")}')`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              minHeight: isMobile ? "240px" : "280px",
              maxHeight: isMobile ? "380px" : "450px",
              marginRight: isMobile ? "-75px" : "-95px",
              right: isMobile ? "87px" : "107px",
              top: isMobile ? "15px" : "20px",
              // Performance optimization
              willChange: isExpanding ? 'opacity, transform' : 'auto',
              // Use optimized transform for mobile
              transform: isExpanding && !isMobile ? 'scale(0.75)' : 'none'
            }}
          >
            {/* Product content overlaid directly on background */}
            <div className="flex flex-col items-center justify-center w-full max-w-[280px] sm:max-w-xs mx-auto relative px-3 sm:px-4">
              <div className="pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 text-center">
                {/* Check if we have multiple images */}
                {productImageData?.images && productImageData.images.length > 1 ? (
                  /* Multi-image slider - clean layout without extra text */
                  <div className="w-full h-32 sm:h-36 md:h-40 mb-2 rounded-lg overflow-hidden">
                    <ImageSlider
                      images={productImageData.images}
                      title=""
                      description=""
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
                  /* Single image display */
                  <img
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto rounded-lg sm:rounded-xl object-cover mb-3 sm:mb-4 md:mb-6"
                    src={imageSource}
                    alt="product"
                    onLoad={() => console.log('✅ Image loaded successfully:', imageSource)}
                    onError={(e) => console.log('❌ Image failed to load:', imageSource, 'Error:', e)}
                  />
                )}
                
                {/* Only show title and description for single images or below gallery */}
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 text-center mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {productImageData?.product_title || getText("ui.productFallback")}
                </h3>
                
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
            className={getOptimizedClasses(
              `flex items-center justify-center p-3 sm:p-4 md:p-6 relative w-full h-full transition-all ${getTransitionDuration('600')} ease-out ${
                isExpanding ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
              } ${getPerformanceClass('gpu-accelerated')}`,
              `flex items-center justify-center p-3 sm:p-4 md:p-6 relative w-full h-full transition-opacity ${getTransitionDuration('400')} ease-out ${
                isExpanding ? 'opacity-0' : 'opacity-100'
              } mobile-optimized`
            )}
            style={{
              backgroundImage: `url('${getAsset("images.productContainer")}')`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              minHeight: isMobile ? "240px" : "280px",
              maxHeight: isMobile ? "380px" : "450px",
              marginRight: isMobile ? "-58px" : "-68px",
              right: isMobile ? "82px" : "92px",
              top: isMobile ? "24px" : "34px",
              // Performance optimization
              willChange: isExpanding ? 'opacity, transform' : 'auto',
              transform: isExpanding && !isMobile ? 'scale(0.75)' : 'none'
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

        {/* Enhanced Animation Debug Overlay */}
        {showAnimationDebug && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white text-xs p-2 rounded z-50 max-w-xs">
            <div className="font-bold mb-1">🎭 Animation Debug</div>
            <div>Mode: {mode}</div>
            <div>Loaded: {isLoaded ? '✅' : '❌'}</div>
            <div>Healthy: {isHealthy ? '✅' : '⚠️'}</div>
            <div>Error: {error || 'None'}</div>
            <div>Agent Speaking: {isAgentSpeaking ? '🗣️' : '💤'}</div>
            <div>User Speaking: {isUserSpeaking ? '🎤' : '🔇'}</div>
            
            {currentAnimationStates && (
              <div className="mt-1">
                <div className="font-semibold">Animation States:</div>
                {Object.entries(currentAnimationStates).map(([key, value]) => (
                  <div key={key} className="ml-2">
                    {key}: {typeof value === 'boolean' ? (value ? '✅' : '❌') : value}
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-1">
              <div className="font-semibold">Animation Mode:</div>
              <div className="ml-2">Timeline Animations</div>
            </div>
            
            <div className="mt-1 text-xs opacity-70">
              Press Ctrl+Shift+D to toggle
            </div>
          </div>
        )}

        {/* Enhanced Fallback UI when Rive fails to load */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded">
            <div className="text-white text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl">🤖</span>
              </div>
              <p className="text-sm font-medium">{getText("ui.avatarReady")}</p>
              <p className="text-xs mt-1 opacity-75">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Loading UI with health status */}
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm font-medium">{getText("ui.loadingAvatar")}</p>
              <div className="text-xs mt-1">
                {isHealthy ? '🟢 System Ready' : '🟡 Initializing...'}
              </div>
            </div>
          </div>
        )}

        {/* Animation Health Warning */}
        {isLoaded && !isHealthy && !error && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            ⚠️ Animation Health Issue
          </div>
        )}
      </div>
    </div>
  );
};

// Product Avatar Component - No longer needed since main canvas animates to corner
const ProductAvatar = () => null;

export default ChatAvatar;
