import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, X, MessageSquare, Volume2, Loader2 } from "lucide-react";
import ChatAvatar from "../components/ChatAvatar";
import ProductImageOverlay from "../components/ProductImageOverlay";
import ProductLinkBox from "../components/ProductLinkBox";
import PerformanceDebug from "../components/PerformanceDebug";
import { useElevenLabsConversation } from "../hooks/useElevenLabsConversation";
import { useCompanyConfig } from "../config/useCompanyConfig";
import { usePerformanceConfig } from "../config/usePerformanceConfig";
import { useCSSOptimization } from "../utils/cssUtils";

const UnifiedChatPage = () => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(true);
  const [textInput, setTextInput] = useState("");
  const [isSendingText, setIsSendingText] = useState(false);
  const [showPerformanceDebug, setShowPerformanceDebug] = useState(false);

  // Get company configuration
  const { config, getText, getGradient, getAsset } = useCompanyConfig();
  
  // Get performance configuration for mobile optimization
  const {
    performanceConfig,
    isMobile,
    isLowEndDevice,
    responsiveConfig
  } = usePerformanceConfig();
  
  // Get CSS optimization utilities
  const {
    getOptimizedClasses,
    getPerformanceClass,
    getBackdropBlur,
    getShadow,
    getTransitionDuration,
    shouldEnableHover
  } = useCSSOptimization();

  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    // NEW: Unified voice session controls
    uiMode, // 'chat' | 'voice'
    toggleMode, // Switches modes without session restart
    audioOutputMuted,
    toggleAudioOutput,
    // Legacy compatibility
    audioEnabled,
    toggleAudio, // Alias for toggleMode
    toggleMicrophone,
    isMuted,
    sendTextMessage,
    agentMessage,
    userMessage,
    agentInterimMessage,
    userInterimMessage,
    isAgentSpeaking,
    isUserSpeaking,
    error,
    productImageData,
    productLinkData,
    dismissProductOverlays,
  } = useElevenLabsConversation();

  // Auto-connect and show widget on mount
  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
      if (mounted) {
        setIsHidden(false);
      }
    }, 150);

    // Auto-connect to unified voice session (always voice-capable, starts in chat mode)
    connect();

    return () => {
      mounted = false;
      clearTimeout(timer);
      disconnect();
    };
  }, []); // Remove dependencies to prevent double connection

  // Performance debug toggle - Ctrl+Shift+P
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setShowPerformanceDebug(prev => {
          const newState = !prev;
          console.log(`📊 Performance debug ${newState ? 'enabled' : 'disabled'}`);
          return newState;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleClose = () => {
    setIsHidden(true);
    disconnect();
    setTimeout(() => {
      // Preserve URL parameters when navigating back to home
      const currentSearch = window.location.search;
      navigate(`/${currentSearch}`);
    }, 700);
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!textInput.trim() || isSendingText || !isConnected) return;

    try {
      setIsSendingText(true);
      await sendTextMessage(textInput);
      setTextInput(""); // Clear input immediately
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSendingText(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText(e);
    }
  };

  const getConnectionStatus = () => {
    if (isConnecting)
      return {
        text: getText("ui.connecting"),
        color: "text-yellow-600",
      };
    if (!isConnected && !error)
      return { text: getText("ui.disconnected"), color: "text-gray-600" };
    if (error) return { text: getText("ui.connectionError", { error }), color: "text-red-600" };
    return { text: getText("ui.connected"), color: "text-green-600" };
  };

  const getStatusIndicator = () => {
    if (isConnected) return `bg-[${config.theme.status.success}]`;
    if (isConnecting) return `bg-[${config.theme.status.warning}] animate-pulse`;
    return `bg-[${config.theme.status.error}]`;
  };

  const defaultMessage = uiMode === 'voice'
    ? getText("defaultGreeting.voice")
    : getText("defaultGreeting.text");

  const currentAgentMessage =
    agentInterimMessage || agentMessage || defaultMessage;

  return (
    <>
      {/* Main Chat Widget */}
      <div
        style={isHidden ? { transform: "translateX(30rem)" } : {}}
        className={getOptimizedClasses(
          `fixed bg-gradient-to-b ${getGradient(uiMode === 'voice' ? 'voice' : 'text', 'primary')} ${getBackdropBlur('xl')} ${config.theme.widget.position} ${config.theme.widget.size.width} ${config.theme.widget.size.height} max-h-[90vh] rounded-2xl ${getShadow('2xl')} border ${
            uiMode === 'voice' ? 'border-blue-200/40' : 'border-orange-200/40'
          } flex flex-col overflow-hidden z-50 ${config.theme.widget.size.mobileWidth} ${getTransitionDuration('700')} max-w-[90%] transition-all opacity-100 blur-0 ${getPerformanceClass('gpu-accelerated')}`,
          `fixed bg-gradient-to-b ${getGradient(uiMode === 'voice' ? 'voice' : 'text', 'primary')} ${getBackdropBlur('sm')} ${config.theme.widget.position} ${config.theme.widget.size.width} ${config.theme.widget.size.height} max-h-[90vh] rounded-2xl ${getShadow('lg')} border ${
            uiMode === 'voice' ? 'border-blue-200/40' : 'border-orange-200/40'
          } flex flex-col overflow-hidden z-50 ${config.theme.widget.size.mobileWidth} ${getTransitionDuration('400')} max-w-[90%] transition-transform opacity-100 mobile-optimized`
        )}
      >
        {/* Header with close button - Performance Optimized */}
        <div className="flex justify-between flex-row-reverse items-center p-4 relative">
          {/* Smooth gradient background that fades into content - Mobile Optimized */}
          <div className={getOptimizedClasses(
            `absolute inset-0 bg-gradient-to-b from-[#dbbe9b]/60 via-[#f5e6d3]/40 to-transparent ${getBackdropBlur('md')}`,
            `absolute inset-0 bg-gradient-to-b from-[#dbbe9b]/60 via-[#f5e6d3]/40 to-transparent ${performanceConfig.disableBlur ? 'bg-white/90' : getBackdropBlur('sm')}`
          )}></div>
          {/* Additional fade layer for seamless blending */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fcf4e7]/30 via-white/15 to-transparent pointer-events-none"></div>
          {/* Bottom fade to completely eliminate the line */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-white/20 pointer-events-none"></div>
          {/* Close Button - Performance Optimized */}
          <button
            onClick={handleClose}
            className={getOptimizedClasses(
              `p-2 bg-gray-50 rounded-full ${getShadow('md')} text-gray-600 hover:text-red-500 transition-all ${shouldEnableHover() ? 'hover:scale-105' : ''} ${getTransitionDuration('200')} relative z-10`,
              `p-2 bg-gray-50 rounded-full ${getShadow('sm')} text-gray-600 transition-colors ${getTransitionDuration('200')} relative z-10 mobile-optimized`
            )}
          >
            <img src={getAsset("icons.close")} alt={getText("ui.close")} width={20} height={20} />
          </button>

          {uiMode === 'voice' && (
            <button
              onClick={toggleMode}
              className={getOptimizedClasses(
                `p-2 rounded-full flex items-center justify-center ${getShadow('md')} transition-all ${getTransitionDuration('300')} ${shouldEnableHover() ? 'hover:scale-105' : ''} disabled:cursor-not-allowed bg-white text-white relative z-10`,
                `p-2 rounded-full flex items-center justify-center ${getShadow('sm')} transition-colors ${getTransitionDuration('200')} disabled:cursor-not-allowed bg-white text-white relative z-10 mobile-optimized`
              )}
              title={getText("ui.switchToText")}
            >
              <img src={getAsset("icons.back")} alt={getText("ui.back")} width={22} />
            </button>
          )}
        </div>

        {/* Connection Status */}
        {/* <div className="px-4 pb-2">
        <div className={`text-xs text-center ${getConnectionStatus().color}`}>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusIndicator()}`} />
            {getConnectionStatus().text}
          </div>
        </div>
      </div> */}

        {/* Main content area - Performance Optimized */}
        <div className={getOptimizedClasses(
          "flex-1 overflow-y-auto overflow-x-hidden p-4 h-[80%] drop-shadow-md rounded-[50px]",
          "flex-1 overflow-y-auto overflow-x-hidden p-4 h-[80%] drop-shadow-sm rounded-[50px] mobile-optimized"
        )}>
          {/* User Speech Transcription Display - Removed for voice mode */}

          {/* Avatar with unified integration */}
          <ChatAvatar
            mode={uiMode === 'voice' ? "voice" : "text"}
            agentMessage={currentAgentMessage}
            isUserSpeaking={
              isUserSpeaking && !isMuted && isConnected && uiMode === 'voice'
            }
            isAgentSpeaking={isAgentSpeaking}
            showLoadingDots={isSendingText && !agentMessage}
            productImageData={productImageData}
            productLinkData={productLinkData}
          />

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg font-medium">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="font-medium">{getText("ui.connectionError", { error })}</span>
              </div>
            </div>
          )}

          {/* Connection Loading */}
          {isConnecting && (
            <div className="mt-3 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm font-medium">
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="font-medium">
                  {getText("ui.establishingConnection")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom input/control area - Performance Optimized */}
        <div className={getOptimizedClasses(
          `relative bg-gradient-to-t from-orange-200/60 via-orange-100/40 to-white/10 p-4 py-6 ${getBackdropBlur('md')}`,
          `relative bg-gradient-to-t from-orange-200/60 via-orange-100/40 to-white/10 p-4 py-6 ${performanceConfig.disableBlur ? 'bg-white/90' : getBackdropBlur('sm')}`
        )}>
          {/* Soft fade overlay for seamless blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/15 pointer-events-none"></div>
          <div className="flex flex-col gap-3">
            {/* Audio Toggle Button */}

            {/* Voice Controls (when in voice mode) - Performance Optimized */}
            {uiMode === 'voice' && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleMicrophone}
                  disabled={!isConnected}
                  className={getOptimizedClasses(
                    `w-16 h-16 text-white border-2 rounded-full flex items-center justify-center ${getShadow('lg')} transition-all ${getTransitionDuration('300')} ${shouldEnableHover() ? 'hover:-translate-y-1' : ''} disabled:opacity-50 disabled:cursor-not-allowed ${
                      isMuted
                        ? `border-red-500 bg-[${config.theme.status.error}] ${shouldEnableHover() ? 'hover:bg-red-600' : ''}`
                        : `border-green-500 bg-green-500 ${shouldEnableHover() ? 'hover:bg-green-600' : ''}`
                    } ${getPerformanceClass('gpu-accelerated')}`,
                    `w-16 h-16 text-white border-2 rounded-full flex items-center justify-center ${getShadow('md')} transition-colors ${getTransitionDuration('200')} disabled:opacity-50 disabled:cursor-not-allowed ${
                      isMuted
                        ? `border-red-500 bg-[${config.theme.status.error}]`
                        : `border-green-500 bg-green-500`
                    } mobile-optimized`
                  )}
                  title={
                    isMuted ? getText("ui.enableMicrophone") : getText("ui.disableMicrophone")
                  }
                >
                  {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
              </div>
            )}

            {/* Text Input (when in chat mode) - Performance Optimized */}
            {uiMode === 'chat' && (
              <form
                onSubmit={handleSendText}
                className="flex items-center gap-2"
              >
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={getText("ui.textInputPlaceholder")}
                    className={getOptimizedClasses(
                      `w-full px-4 py-3 bg-white rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${config.theme.primary.main}] transition ${getTransitionDuration('300')} focus:border-transparent ${getShadow('md')} disabled:bg-gray-100`,
                      `w-full px-4 py-3 bg-white rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${config.theme.primary.main}] transition-colors ${getTransitionDuration('200')} focus:border-transparent ${getShadow('sm')} disabled:bg-gray-100 mobile-optimized`
                    )}
                    disabled={!isConnected || isSendingText}
                    maxLength={500}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!textInput.trim() || !isConnected || isSendingText}
                  className={getOptimizedClasses(
                    `p-3 text-white rounded-full transition-colors ${getTransitionDuration('300')} disabled:bg-orange-300 disabled:cursor-not-allowed ${getShadow('md')} ${
                      textInput.trim() && shouldEnableHover()
                        ? 'hover:brightness-110'
                        : 'bg-slate-700 hover:bg-slate-800'
                    }`,
                    `p-3 text-white rounded-full transition-colors ${getTransitionDuration('200')} disabled:bg-orange-300 disabled:cursor-not-allowed ${getShadow('sm')} ${
                      textInput.trim()
                        ? ''
                        : 'bg-slate-700'
                    } mobile-optimized`
                  )}
                  style={textInput.trim() ? {
                    backgroundColor: config.theme.status.success
                  } : {}}
                  title={
                    isSendingText
                      ? getText("ui.sendingMessage")
                      : getText("ui.sendMessage")
                  }
                >
                  {isSendingText ? (
                    <Loader2 className={`w-6 h-6 ${performanceConfig.reducedAnimations ? 'animate-pulse' : 'animate-spin'}`} />
                  ) : (
                    <img src={getAsset("icons.send")} alt={getText("ui.send")} width={25} />
                  )}
                </button>

                <button
                  onClick={toggleMode}
                  disabled={!isConnected}
                  className={getOptimizedClasses(
                    `w-12 h-12 rounded-full flex items-center justify-center ${getShadow('lg')} transition-all ${getTransitionDuration('300')} disabled:opacity-50 disabled:cursor-not-allowed bg-[${config.theme.secondary.main}] ${shouldEnableHover() ? `hover:bg-[${config.theme.secondary.dark}]` : ''} text-white`,
                    `w-12 h-12 rounded-full flex items-center justify-center ${getShadow('md')} transition-colors ${getTransitionDuration('200')} disabled:opacity-50 disabled:cursor-not-allowed bg-[${config.theme.secondary.main}] text-white mobile-optimized`
                  )}
                  title={getText("ui.activateVoice")}
                >
                  <img src={getAsset("icons.voice")} alt={getText("ui.voice")} width={30} />
                </button>
              </form>
            )}

            {/* Mode Information */}
            {/* <div className="text-center text-xs text-gray-600">
              {audioEnabled
                ? "🎤 Sprachmodus aktiv - Sie können sprechen oder schreiben"
                : "💬 Textmodus aktiv - Klicken Sie oben um Sprache zu aktivieren"}
            </div> */}
          </div>
        </div>
      </div>

      
       {/* <ProductImageOverlay
        productData={productImageData}
        onClose={dismissProductOverlays}
      />

       <ProductLinkBox
        productData={productLinkData}
        onClose={dismissProductOverlays}
      />  */}

      {/* Performance Debug Component - Toggle with Ctrl+Shift+P */}
      <PerformanceDebug enabled={showPerformanceDebug} />
    </>
  );
};

export default UnifiedChatPage;
