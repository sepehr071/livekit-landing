import React, { createContext, useContext } from 'react';

const LiveKitContext = createContext();

export const useLiveKitContext = () => {
  console.warn('LiveKitContext is deprecated. Use useLiveKit hook directly.');
  return { hasConnection: false };
};

export const LiveKitProvider = ({ children }) => {
  // Deprecated - functionality moved to useLiveKit hook
  // Keeping this for backwards compatibility but all LiveKit logic
  // is now handled in the useLiveKit custom hook using vanilla client
  
  const contextValue = {
    hasConnection: false,
    deprecated: true
  };

  return (
    <LiveKitContext.Provider value={contextValue}>
      {children}
    </LiveKitContext.Provider>
  );
};