// import React, { useEffect, useState } from "react";
// import { useRive } from "../hooks/useRive";

// const ChatAvatar = ({
//   isAgentSpeaking = false,
//   isUserSpeaking = false,
//   agentMessage = "Hallo! Ich bin Ihr KI-Assistent. Wie kann ich Ihnen heute helfen?",
//   showLoadingDots = false,
//   mode = "chat", // 'chat' or 'voice'
// }) => {
//   const { canvasRef, setAnimationState, isLoaded, availableInputs, error } =
//     useRive();

//   const [isImageVisible, setIsImageVisible] = useState(false);
//   const [imageSource, setImageSource] = useState("");

//   const handelImage = () => {
//     setIsImageVisible(!isImageVisible);

//     setTimeout(() => {
//       console.log("click");

//       if (imageSource) setImageSource("");
//       else setImageSource("images/image.png");
//     }, 250);
//   };

  

//   // Update animation states based on mode
//   useEffect(() => {
//     if (isLoaded && !error) {
//       if (mode === "voice") {
//         // In voice mode: control animation based on speaking states
//         setAnimationState("isSpeaking", isAgentSpeaking);
//         setAnimationState("IsListening", isUserSpeaking);
//       } else {
//         // In chat mode: keep animation idle (no active states)
//         setAnimationState("isSpeaking", false);
//         setAnimationState("IsListening", false);
//       }
//     }
//   }, [
//     isAgentSpeaking,
//     isUserSpeaking,
//     isLoaded,
//     setAnimationState,
//     error,
//     mode,
//   ]);

//   return (
//     <div className="flex flex-col items-center justify-center max-h-full py-2 overflow-y-auto h-[100%] drop-shadow-md">
//       {/* Speech Bubble */}
//       <div
//         className="relative bg-gradient-to-r from-gray-100 via-white to-yellow-100/90 p-4 rounded-lg shadow-md mb-4 max-w-xs sm:max-w-sm md:max-w-md max-h-[35%] overflow-y-auto custom-scrollbar"
//         id="agentSpeechBubble"
//       >
//         <div className="flex items-start">
//           <div className="mr-2 text-gray-500">
//             <i className="fas fa-quote-left"></i>
//           </div>
//           <div className="text-gray-800 text-sm sm:text-base" id="agentText">
//             {showLoadingDots ? (
//               <div className="flex items-center">
//                 <span className="animate-pulse">...</span>
//                 <div className="ml-2 flex space-x-1">
//                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                   <div
//                     className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                     style={{ animationDelay: "0.1s" }}
//                   ></div>
//                   <div
//                     className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//                     style={{ animationDelay: "0.2s" }}
//                   ></div>
//                 </div>
//               </div>
//             ) : (
//               agentMessage
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Rive Animation Container */}
//       <div
//         className="relative  rounded-lg
//       .0 flex items-center justify-center max-h-[22rem] h-[100%] w-full "
//       >
//         <canvas
//           onClick={handelImage}
//           ref={canvasRef}
//           className={`w-full h-full rounded shadow-lg bg-white/40 backdrop-blur-xl duration-500 transition-all ${
//             imageSource &&
//             `!w-1/5 !h-1/5 !rounded-full !bg-white/80 absolute  right-2  top-2  ${
//               !isImageVisible && "right-[45%] top-[45%]"
//             }`
//           }`}
//           style={{ maxWidth: "100%", maxHeight: "100%" }}
//         />

//         {/* image */}
//         {imageSource && (
//           <div
//             id="imageBox"
//             className="w-full h-full duration-500 rounded-lg transition-all place-items-center content-center"
//           >
//             <img
//               className="max-w-full max-h-full rounded-lg"
//               src={imageSource}
//               alt="image"
//             />
//           </div>
//         )}

//         {/* Fallback UI when Rive fails to load */}
//         {error && (
//           <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded">
//             <div className="text-white text-center">
//               <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
//                 <span className="text-3xl">🤖</span>
//               </div>
//               <p className="text-sm">Avatar Ready</p>
//             </div>
//           </div>
//         )}

//         {!isLoaded && !error && (
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="text-gray-500 text-center">
//               <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
//               <p className="text-sm">Loading avatar...</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatAvatar;


import React, { useEffect, useState } from 'react';
import RiveAvatarButton from './RiveAvatarButton';
import { useNavigate } from 'react-router-dom';
import { useCompanyConfig } from '../config/useCompanyConfig';

const SupportButton = () => {
  // Get company configuration
  const { config } = useCompanyConfig();
  
  return (
    <RiveAvatarButton
   
    />
  );
};

export default SupportButton;
