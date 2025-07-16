import React from "react";

const ChatAvatar = () => {
  return (
    <div className="flex flex-col items-center justify-center my-8  h-[80%]"> {/* character-area */}
      <div
        className="relative bg-gray-100 p-4 rounded-lg shadow-md mb-4 max-w-xs sm:max-w-sm md:max-w-md" // agent-speech-bubble, speech-bubble, agent-bubble
        id="agentSpeechBubble"
      >
        <div className="flex items-start"> {/* bubble-content */}
          <div className="mr-2 text-gray-500"> {/* bubble-icon */}
            <i className="fas fa-quote-left"></i>
          </div>
          <div className="text-gray-800 text-sm sm:text-base" id="agentText"> {/* bubble-text */}
            Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?
          </div>
        </div>
        {/* Speech bubble tail - a simple triangle using border properties */}
        <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-100"></div>
      </div>

      <div className="rounded overflow-hidden bg-gray-300 flex items-center justify-center  h-[100%]"> {/* character-container, character-placeholder */}
        <canvas id="riveCanvas" className="w-full h-full"></canvas>
      </div>
    </div>
  );
};

export default ChatAvatar;
