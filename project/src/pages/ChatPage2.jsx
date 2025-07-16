import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, RotateCcw, X } from "lucide-react";
import ChatAvatar from "../components/ChatAvatar";

const ChatPage2 = () => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(true);
  // Removed message and Aimessage states as they are not used with the original buttons

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

      {/* Bottom voice controls */}
      <div className="relative bg-gray-50 p-4 py-6">
        <div className="max-w-2xl mx-auto flex justify-center gap-6">
          <button className="w-16 h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200">
            <Mic size={28} />
          </button>
          <button
            onClick={() => handleClick("/chat1")}
            className="w-16 h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
          >
            <RotateCcw size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage2;
