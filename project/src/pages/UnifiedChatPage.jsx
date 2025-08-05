import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, X, MessageSquare, Volume2, Loader2 } from "lucide-react";
import ChatAvatar from "../components/ChatAvatar";
import ProductImageOverlay from "../components/ProductImageOverlay";
import ProductLinkBox from "../components/ProductLinkBox";
import { useUnifiedLiveKit } from "../hooks/useUnifiedLiveKit";

const UnifiedChatPage = () => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(true);
  const [textInput, setTextInput] = useState("");
  const [isSendingText, setIsSendingText] = useState(false);

  const {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    audioEnabled,
    toggleAudio,
    toggleMicrophone,
    isMuted,
    sendTextMessage,
    agentMessage,
    isAgentSpeaking,
    isUserSpeaking,
    error,
    productImageData,
    productLinkData,
    dismissProductOverlays,
  } = useUnifiedLiveKit();

  // Auto-connect and show widget on mount
  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
      if (mounted) {
        setIsHidden(false);
      }
    }, 150);

    // Auto-connect to LiveKit only once
    connect();

    return () => {
      mounted = false;
      clearTimeout(timer);
      disconnect();
    };
  }, []); // Remove dependencies to prevent double connection

  const handleClose = () => {
    setIsHidden(true);
    disconnect();
    setTimeout(() => {
      navigate("/");
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
        text: "Verbindung zum KI-Assistenten...",
        color: "text-yellow-600",
      };
    if (!isConnected && !error)
      return { text: "Nicht verbunden", color: "text-gray-600" };
    if (error) return { text: `Fehler: ${error}`, color: "text-red-600" };
    return { text: "Mit KI-Assistant verbunden", color: "text-green-600" };
  };

  const getStatusIndicator = () => {
    if (isConnected) return "bg-green-500";
    if (isConnecting) return "bg-yellow-500 animate-pulse";
    return "bg-red-500";
  };

  const defaultMessage = audioEnabled
    ? "Hallo! Ich bin Ihr KI-Assistent. Sie können jetzt sprechen oder weiterhin schreiben."
    : "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?";

  const currentAgentMessage = agentMessage || defaultMessage;

  // Check if any overlay is active for fade effect
  const hasActiveOverlay = productImageData || productLinkData;

  return (
    <>
      {/* Main Chat Widget */}
      <div
        style={isHidden ? { transform: "translateX(30rem)" } : {}}
        className={`fixed bg-gradient-to-b from-[#fcf4e7]/30 to-gray-300/30 backdrop-blur-md bottom-4 right-4 w-96 h-[820px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 sm:w-80 md:w-96 duration-[700ms] max-w-[90%] transition-all ${
          hasActiveOverlay ? "opacity-30 blur-sm" : "opacity-100 blur-0"
        }`}
      >
        {/* Header with mode indicators and close button */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-br to-[#fcf4e7] from-[#dbbe9b] drop-shadow-md">
          {/* Mode Indicators */}
          <div className="flex gap-2">
            <span
              className={`mode-badge flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
                audioEnabled
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <Volume2 size={12} />
              Voice
            </span>
            <span
              className={`mode-badge flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
                !audioEnabled
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <MessageSquare size={12} />
              Text
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="p-2 bg-gray-50 rounded-full shadow text-gray-600 hover:text-red-500 transition-colors duration-200"
          >
            <X size={20} />
          </button>
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

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto p-4 h-[80%] drop-shadow-md">
          {/* Avatar with unified integration */}
          <ChatAvatar
            mode={audioEnabled ? "voice" : "text"}
            agentMessage={currentAgentMessage}
            isUserSpeaking={
              isUserSpeaking && !isMuted && isConnected && audioEnabled
            }
            isAgentSpeaking={isAgentSpeaking}
            showLoadingDots={isSendingText && !agentMessage}
          />

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span>Fehler: {error}</span>
              </div>
            </div>
          )}

          {/* Connection Loading */}
          {isConnecting && (
            <div className="mt-3 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Verbindung wird hergestellt...</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom input/control area */}
        <div className="relative bg-gradient-to-br from-gray-300 to-gray-200 p-4 py-6 shadow-inner">
          <div className="flex flex-col gap-3">
            {/* Audio Toggle Button */}

            {/* Voice Controls (when audio enabled) */}
            {audioEnabled && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleMicrophone}
                  disabled={!isConnected}
                  className={`w-12 h-12 text-white border-orange-400 border-2 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isMuted
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                  title={
                    isMuted ? "Mikrofon aktivieren" : "Mikrofon deaktivieren"
                  }
                >
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button
                  onClick={toggleAudio}
                  disabled={!isConnected}
                  className={
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 text-white"
                  }
                  title={"Zum Textmodus wechseln"}
                >
                  {audioEnabled ? (
                    <Volume2 size={20} />
                  ) : (
                    <MessageSquare size={20} />
                  )}
                </button>
              </div>
            )}

            {/* Text Input (always available) */}
            {!audioEnabled && (
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
                    placeholder={
                      audioEnabled
                        ? "Sprechen oder schreiben..."
                        : "Geben Sie Ihre Nachricht ein..."
                    }
                    className="w-full px-4 py-3 bg-white rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300 focus:border-transparent shadow-md disabled:bg-gray-100"
                    disabled={!isConnected || isSendingText}
                    maxLength={500}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!textInput.trim() || !isConnected || isSendingText}
                  className="p-3 bg-amber-400 hover:bg-amber-500 text-white rounded-full transition-colors duration-300 disabled:bg-orange-300 disabled:cursor-not-allowed shadow-md"
                  title={
                    isSendingText
                      ? "Nachricht wird gesendet..."
                      : "Nachricht senden"
                  }
                >
                  {isSendingText ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <img src="/images/send.png" alt="send" width={25} />
                  )}
                </button>

                <button
                  onClick={toggleAudio}
                  disabled={!isConnected}
                  className={
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300  disabled:opacity-50 disabled:cursor-not-allowed bg-gray-500 hover:bg-gray-600 text-white"
                  }
                  title={"Sprachmodus aktivieren"}
                >
                  {audioEnabled ? (
                    <Volume2 size={20} />
                  ) : (
                    <MessageSquare size={20} />
                  )}
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

      {/* Product Display Overlays */}
      <ProductImageOverlay
        productData={productImageData}
        onClose={dismissProductOverlays}
      />

      <ProductLinkBox
        productData={productLinkData}
        onClose={dismissProductOverlays}
      />
    </>
  );
};

export default UnifiedChatPage;
