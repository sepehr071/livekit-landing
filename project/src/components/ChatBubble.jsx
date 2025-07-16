import React from 'react';

const ChatBubble = ({ message }) => {
  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-md bg-white rounded-2xl rounded-tl-none shadow-lg p-4 border-l-4 border-orange-400">
        <p className="text-gray-800 text-sm leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ChatBubble;