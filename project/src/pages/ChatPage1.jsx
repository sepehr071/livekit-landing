import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import ChatAvatar from "../components/ChatAvatar";
import { useChat } from "../hooks/useChat";

const ChatPage1 = () => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(true);
  const [message, setMessage] = useState("");
  const { sendMessage, isStreaming, agentMessage, error } = useChat();
  
  // Set default agent message
  const defaultMessage = "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?";
  const currentAgentMessage = agentMessage || defaultMessage;

  useEffect(() => {
    setTimeout(() => {
      setIsHidden(false);
    }, 150);
  }, []);

  const handleClick = (url) => {
    setIsHidden(true);
    // Give a small delay for the animation to play before navigating
    setTimeout(() => {
      navigate(url);
    }, 700);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;

    const userMessage = message;
    setMessage(""); // Clear input immediately
    
    try {
      await sendMessage(userMessage);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div
      style={isHidden ? { transform: "translateX(30rem)" } : {}}
      className="fixed bg-gradient-to-b from-[#fcf4e7]/30  to-gray-300/30 backdrop-blur-md bottom-4 right-4 w-96 h-[800px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 sm:w-80 md:w-96 duration-[700ms] max-w-[90%]"
    >
      {/* Header with delete button */}
      <div className="flex justify-end p-4 bg-gradient-to-br to-[#fcf4e7] from-[#dbbe9b] drop-shadow-md">
        <button
          onClick={() => handleClick("/")}
          className="p-2 bg-gray-50 rounded-full shadow text-gray-600 hover:text-red-500 transition-colors duration-200 text-2xl sm:text-3xl md:text-4xl"
        >
          <X />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 h-[80%] drop-shadow-md">
        {/* Avatar with chat integration */}
        <ChatAvatar
          mode="chat"
          agentMessage={currentAgentMessage}
          isAgentSpeaking={isStreaming}
          showLoadingDots={isStreaming && !agentMessage}
        />
        
        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span>Fehler: {error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom input area */}
      <div className="relative bg-gradient-to-br from-gray-300  to-gray-200  p-4 py-6 [box-shadow:rgba(14,30,37,0.12)_0px_2px_4px_0px,rgba(14,30,37,0.32)_0px_2px_16px_0px]">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Geben Sie Ihre Nachricht ein..."
              className="w-full px-4 py-3 bg-white rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300 focus:border-transparent shadow-md"
              disabled={isStreaming}
              maxLength={500}
            />
             
          </div>
          
          <button
            type="submit"
            disabled={message.trim() === "" || isStreaming}
            className="p-3 bg-amber-400 hover:bg-amber-500 text-white rounded-full transition-colors duration-300 disabled:bg-orange-300 disabled:cursor-not-allowed shadow-md"
            title={isStreaming ? "Nachricht wird gesendet..." : "Nachricht senden"}
          >
            {isStreaming ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <img src="/images/send.png" alt="send" width={25} />
            )}
          </button>
          
          <button
            type="button"
            onClick={() => handleClick("/chat2")}
            className="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full transition-colors duration-300 shadow-md"
            title="Zum Sprachmodus wechseln"
          >
            <img src="/images/voice.png" alt="voice" width={25} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage1;
