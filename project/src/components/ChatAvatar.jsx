import React from "react";
import { MousePointer2 } from "lucide-react";

const ChatAvatar = () => {
  return (
    <div className="flex flex-col items-center justify-center max-h-full py-2 overflow-y-auto h-[100%]"> {/* character-area */}
      <div
        className="relative bg-gray-100 p-4 rounded-lg shadow-md mb-4 max-w-xs sm:max-w-sm md:max-w-md max-h-[35%] overflow-y-auto custom-scrollbar" // agent-speech-bubble, speech-bubble, agent-bubble
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
      </div>

      <div className="relative rounded bg-gray-300 flex items-center justify-center max-h-[22rem] h-[100%]"> {/* character-container, character-placeholder */}
        <MousePointer2 className="absolute top-[-32px] m-auto -rotate-[135deg]" size={25} color="#f3f4f6" strokeWidth="7"/>
        <canvas id="riveCanvas" className="w-full h-full"></canvas>
      </div>
    </div>
  );
};

export default ChatAvatar;
