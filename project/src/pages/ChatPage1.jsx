import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Send, Mic, X } from "lucide-react";
import ChatAvatar from "../components/ChatAvatar";

const ChatPage1 = () => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(true);
  const [message, setMessage] = useState("");
  const [Aimessage, setAimessage] = useState(
    "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?"
  );

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
    }, 700); // Adjust delay as needed, should be less than or equal to CSS transition duration
  };

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
      <div className="flex-1 overflow-y-auto p-4  h-[80%]">
        {/* Avatar */}
        <ChatAvatar />
      </div>

      {/* Bottom input area */}
      <div className="relative bg-gray-50 p-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Geben Sie Ihre Nachricht ein..."
              className="w-full px-4 py-3 bg-white rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-300 focus:border-transparent"
            />
          </div>
          <button
            disabled={message.trim() === ""}
            className="p-3 bg-amber-400 hover:bg-amber-500 text-white rounded-full transition-colors duration-300 disabled:bg-orange-300"
          >
            <img src="/images/send.png" alt="send" width={25} />
          </button>
          <button
            onClick={() => handleClick("/chat2")}
            className="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full transition-colors duration-300"
          >
            <img src="/images/voice.png" alt="voice" width={25} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage1;
