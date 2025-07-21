import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, X } from "lucide-react";
import ChatAvatar from "../components/ChatAvatar";
import { useLiveKit } from "../hooks/useLiveKit";

const ChatPage2 = () => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(true);
  
  // Use the LiveKit hook directly
  const {
    connect,
    disconnect,
    toggleMicrophone,
    isConnected,
    isConnecting,
    isMuted,
    error,
    transcription,
    isAgentSpeaking,
    isUserSpeaking
  } = useLiveKit();

  useEffect(() => {
    setTimeout(() => {
      setIsHidden(false);
    }, 150);
  }, []);

  // Auto-connect when component mounts
  useEffect(() => {
    let mounted = true;
    
    // Small delay to prevent double connections in StrictMode
    const timer = setTimeout(() => {
      if (mounted && !isConnected && !isConnecting) {
        connect();
      }
    }, 100);
    
    // Cleanup on unmount
    return () => {
      mounted = false;
      clearTimeout(timer);
      disconnect();
    };
  }, []); // Remove dependencies to prevent re-runs

  const handleClick = (url) => {
    setIsHidden(true);
    disconnect(); // Disconnect when leaving
    setTimeout(() => {
      navigate(url);
    }, 700);
  };

  const getStatusMessage = () => {
    if (isConnecting) return "Verbindung zum KI-Assistenten...";
    if (!isConnected && !error) return "Nicht verbunden";
    if (error) return `Fehler: ${error}`;
    return "Mit KI-Assistant verbunden";
  };

  const getStatusColor = () => {
    if (isConnected) return "text-green-600";
    if (isConnecting) return "text-yellow-600";
    if (error) return "text-red-600";
    return "text-gray-600";
  };

  const defaultMessage = "Hallo! Ich bin Ihr KI-Assistent. Sprechen Sie, um unser Gespräch zu beginnen.";

  return (
    <div
      style={isHidden ? { transform: "translateX(30rem)" } : {}}
      className="fixed bottom-4 right-4 w-96 h-[800px] max-h-[90vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden z-50 sm:w-80 md:w-96 duration-[700ms] max-w-[90%]"
    >
      {/* Header with delete button */}
      <div className="flex justify-end p-4 bg-[#F5F0E8]">
        <button
          onClick={() => handleClick("/")}
          className="p-2 bg-gray-50 rounded-full shadow text-gray-600 hover:text-red-500 transition-colors duration-200 text-2xl sm:text-3xl md:text-4xl"
        >
          <X />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 h-[80%]">
        {/* Connection Status */}
        <div className={`text-xs mb-3 text-center ${getStatusColor()}`}>
          <div className="flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' :
              isConnecting ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            {getStatusMessage()}
          </div>
        </div>

        {/* Avatar with voice integration */}
        <ChatAvatar
          mode="voice"
          agentMessage={transcription || defaultMessage}
          isUserSpeaking={isUserSpeaking && !isMuted && isConnected}
          isAgentSpeaking={isAgentSpeaking}
        />

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Connection Loading */}
        {isConnecting && (
          <div className="mt-3 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
              <span>Verbindung wird hergestellt...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom voice controls */}
      <div className="relative bg-gray-50 p-4 py-6">
        <div className="max-w-2xl mx-auto flex justify-center gap-6">
          <button
            onClick={toggleMicrophone}
            disabled={!isConnected}
            className={`w-16 h-16 text-white border-orange-400 border-2 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              isMuted ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
            title={isMuted ? "Mikrofon aktivieren" : "Mikrofon deaktivieren"}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
          <button
            onClick={() => handleClick("/chat1")}
            className="w-16 h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:-translate-y-1"
            title="Zurück zum Chat-Modus"
          >
            <img src="/static/images/back.png" alt="back" width={25} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage2;
