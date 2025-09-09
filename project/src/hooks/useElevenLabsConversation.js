import { useState, useCallback, useRef } from 'react';
import { Conversation } from '@elevenlabs/client';
import { fetchImagesFromFolder, processImageData, preloadImages } from '../utils/imageGallery';
import { createDynamicVariables, getCarNameFromURL } from '../utils/urlParams';

const AGENT_ID = 'agent_7401k4hv3j1je1ms4esr4sjnms5t'; // TODO: Replace with your actual ElevenLabs agent ID

// Helper function to request microphone permission
const requestMicrophonePermission = async () => {
  try {
    console.log('🎤 Requesting microphone permission...');
    await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('✅ Microphone permission granted');
    return true;
  } catch (error) {
    console.error('❌ Microphone permission denied:', error);
    return false;
  }
};

export const useElevenLabsConversation = () => {
  const [conversation, setConversation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // NEW: UI Mode management - always voice session but UI controls presentation
  const [uiMode, setUiMode] = useState('chat'); // 'chat' | 'voice'
  const [audioOutputMuted, setAudioOutputMuted] = useState(false); // Audio enabled by default
  const [isMuted, setIsMuted] = useState(true); // Start microphone muted
  
  // DEPRECATED: Keep for backward compatibility, now computed from uiMode
  const [audioEnabled, setAudioEnabled] = useState(true); // Audio always enabled

  // Messages state
  const [agentMessage, setAgentMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [agentInterimMessage, setAgentInterimMessage] = useState('');
  const [userInterimMessage, setUserInterimMessage] = useState('');

  // Speaking states
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  // Product display state
  const [productImageData, setProductImageData] = useState(null);
  const [productLinkData, setProductLinkData] = useState(null);
  const [error, setError] = useState(null);

  // Refs for cleanup and audio control
  const mountedRef = useRef(true);
  const mutationObserverRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const audioElementsRef = useRef(new Set());
  const originalAudioContextRef = useRef(null);
  const originalHTMLAudioElementRef = useRef(null);
  const isAudioMutedRef = useRef(false);

  // Simplified audio control - no muting in chat mode
  console.log('🔊 Audio always enabled for better user experience');

  // Client tools implementation
  const clientTools = {
    displayProductImage: async ({ carName, category, title, description }) => {
      console.log('🚗 Displaying car images:', { carName, category, title, description });
      
      try {
        if (!carName) {
          console.error('❌ No carName provided');
          return "carName parameter is required. Please specify the full car folder name.";
        }
        
        // Default category to 'all' if not provided
        const imageCategory = category || 'all';
        console.log('🔍 Fetching images for car:', carName, 'Category:', imageCategory);
        
        const images = await fetchImagesFromFolder(carName, imageCategory);
        
        if (images.length === 0) {
          console.warn('⚠️ No images found for car:', carName, 'Category:', imageCategory);
          return `No images found for car "${carName}" in category "${imageCategory}". Please check the car name matches exactly.`;
        }
        
        // Auto-detect single vs multiple images
        const displayType = images.length === 1 ? 'single' : 'gallery';
        
        const imageData = {
          images: images,
          product_title: title || '',
          description: description || '',
          type: displayType,
          carName: carName,
          category: imageCategory
        };
        
        console.log(`🖼️ Auto-detected ${displayType} mode: ${images.length} image(s) found for ${carName}/${imageCategory}`);
        
        // Preload images for better performance (especially for galleries)
        if (images.length > 1) {
          preloadImages(images).catch(err =>
            console.warn('⚠️ Some images failed to preload:', err)
          );
        }
        
        setProductImageData(imageData);
        setProductLinkData(null); // Mutual exclusion
        
        // Return appropriate success message with category info
        const categoryInfo = imageCategory !== 'all' ? ` (${imageCategory} view)` : '';
        return images.length === 1
          ? `${title || carName} image displayed successfully${categoryInfo}`
          : `${title || carName} gallery with ${images.length} images displayed successfully${categoryInfo}`;
          
      } catch (error) {
        console.error('❌ Error displaying car images:', error);
        return `Error displaying car images: ${error.message}`;
      }
    },
    
    displayProductLink: ({ linkUrl, title, description }) => {
      console.log('🔗 Displaying product link:', { linkUrl, title, description });
      setProductLinkData({ link_url: linkUrl, product_title: title, description });
      setProductImageData(null); // Mutual exclusion
      return "Product link displayed successfully";
    },
    
    dismissOverlays: () => {
      console.log('🗑️ Dismissing product overlays');
      setProductImageData(null);
      setProductLinkData(null);
      return "Overlays dismissed successfully";
    }
  };

  // Connect to ElevenLabs agent - ALWAYS with voice capability
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log('🔄 Starting ElevenLabs unified voice session...');
      console.log('🎯 Strategy: Always voice-capable, UI controls audio/mic');
      console.log('🔧 Configuration debug:', { agentId: AGENT_ID, uiMode });

      // Extract dynamic variables from URL (JavaScript SDK approach)
      const dynamicVariables = createDynamicVariables();
      const carName = getCarNameFromURL();
      
      console.log('🚗 Dynamic variables extracted:', dynamicVariables);
      if (carName) {
        console.log(`🎯 Agent will focus on: ${carName}`);
      }

      // ALWAYS request microphone permission upfront for voice session
      console.log('🎤 Requesting microphone permission for voice session...');
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        console.warn('⚠️ Microphone permission denied - voice features will be limited');
        // Continue anyway, user can grant permission later when switching to voice mode
      }

      console.log('🚀 Starting unified voice session with configuration:', {
        agentId: AGENT_ID,
        alwaysVoiceCapable: true,
        hasClientTools: !!clientTools,
        dynamicVariables: dynamicVariables
      });

      // JavaScript SDK: Simple session config (no dynamic_variables support)
      const sessionConfig = {
        agentId: AGENT_ID,
        clientTools,

        // Event handlers
        onConnect: async () => {
          console.log('✅ Connected to ElevenLabs unified voice session');
          console.log('🎯 Voice session ready, starting in chat mode (muted)');
          
          setIsConnected(true);
          setIsConnecting(false);
          
          // Start in chat mode with audio enabled
          setUiMode('chat');
          setAudioOutputMuted(false); // Audio enabled by default
          setIsMuted(true); // Microphone starts muted
          setAudioEnabled(true); // Audio always enabled
          
          console.log('🔊 Audio enabled for both chat and voice modes');
          
          // WORKAROUND: Send car context immediately after connection
          if (carName) {
            console.log(`🚗 Sending car context for: ${carName}`);
            // Give ElevenLabs a moment to be ready for messages
            setTimeout(async () => {
              try {
                const contextMessage = `I'm interested in the ${carName}. Can you tell me about this vehicle?`;
                console.log('📤 Sending car context message:', contextMessage);
                // Use the conversation instance stored in state
                if (conversation) {
                  await conversation.sendUserMessage(contextMessage);
                  console.log('✅ Car context sent successfully');
                }
              } catch (err) {
                console.warn('⚠️ Could not send initial car context:', err);
              }
            }, 1500);
          }
        },

        onDisconnect: () => {
          console.log('❌ Disconnected from ElevenLabs conversation');
          setIsConnected(false);
          setAudioEnabled(false);
          setUiMode('chat');
        },

        onError: (err) => {
          console.error('🚨 ElevenLabs conversation error:', err);
          setError(err.message);
          setIsConnecting(false);
        },

        onMessage: (message) => {
          console.log('💬 Message received:', message);

          // Handle the actual ElevenLabs message structure
          if (message.source && message.message) {
            switch (message.source) {
              case 'ai':
                console.log('🤖 Agent message:', message.message);
                setAgentMessage(message.message);
                setAgentInterimMessage('');
                break;
              case 'user':
                console.log('👤 User message:', message.message);
                // Only set user message if it's not just "..."
                if (message.message.trim() !== '...') {
                  setUserMessage(message.message);
                  setUserInterimMessage('');
                }
                break;
              default:
                console.log('📨 Unknown message source:', message.source);
                break;
            }
          } else if (message.type) {
            // Handle other ElevenLabs event types (audio, etc.)
            console.log('📨 Event type:', message.type, message);
            
            // Handle audio events - play only if in voice mode and audio not muted
            if (message.type === 'audio' && message.audio_event) {
              if (uiMode === 'voice' && !audioOutputMuted) {
                console.log('🔊 Playing audio in voice mode');
                // Audio is automatically handled by the ElevenLabs SDK
              } else {
                console.log('🔇 Audio received but muted (chat mode or audio disabled)');
              }
            }
          } else {
            // Handle any other message formats
            console.log('📨 Other message format:', message);
          }
        },

        onModeChange: (modeData) => {
          console.log('🔄 ElevenLabs mode changed:', modeData);

          // Handle the actual mode structure from ElevenLabs
          const mode = modeData.mode || modeData;
          
          if (mode === 'speaking') {
            console.log('🤖 Agent is speaking');
            setIsAgentSpeaking(true);
            setIsUserSpeaking(false);
          } else if (mode === 'listening') {
            console.log('👤 Agent is listening');
            // Only show user speaking if we're in voice UI mode
            if (uiMode === 'voice') {
              setIsUserSpeaking(true);
            }
            setIsAgentSpeaking(false);
          } else {
            console.log('💬 Mode:', mode);
            setIsUserSpeaking(false);
            setIsAgentSpeaking(false);
          }

          // Always maintain voice capability, UI mode controls presentation
          setAudioEnabled(true); // For backward compatibility
        }
      };

      console.log('🚀 Final unified session config:', sessionConfig);
      
      // ENHANCED DEBUG: Show exact override structure being sent
      if (sessionConfig.conversation_config_override) {
        console.log('🔧 DETAILED OVERRIDE STRUCTURE:');
        console.log('  Agent first_message:', sessionConfig.conversation_config_override.agent.first_message);
        console.log('  Agent prompt:', sessionConfig.conversation_config_override.agent.prompt.prompt);
        console.log('🚨 TROUBLESHOOTING: If first message still not working:');
        console.log('  1. Check ElevenLabs dashboard Security tab - overrides enabled?');
        console.log('  2. Try refreshing ElevenLabs dashboard');
        console.log('  3. Check agent ID is correct:', AGENT_ID);
        console.log('  4. Check for ElevenLabs SDK version issues');
      }
      
      const conversationSession = await Conversation.startSession(sessionConfig);
      
      setConversation(conversationSession);
      
      // Start microphone muted for chat mode experience
      if (conversationSession && hasPermission) {
        await conversationSession.setMicMuted(true);
        console.log('🔇 Microphone muted for initial chat mode');
      }
      
      // WORKAROUND: Send car context message immediately after session starts
      if (carName && conversationSession) {
        console.log(`🚗 Preparing to send car context for: ${carName}`);
        // Give ElevenLabs a moment to be ready for messages
        setTimeout(async () => {
          try {
            const contextMessage = `I'm interested in the ${carName}. Can you tell me about this vehicle?`;
            console.log('📤 Sending car context message:', contextMessage);
            await conversationSession.sendUserMessage(contextMessage);
            console.log('✅ Car context sent successfully');
          } catch (err) {
            console.warn('⚠️ Could not send initial car context:', err);
          }
        }, 2000); // 2 second delay to ensure ElevenLabs is ready
      }

    } catch (err) {
      console.error('❌ Failed to start unified conversation:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  }, [uiMode]);

  // Disconnect from conversation
  const disconnect = useCallback(async () => {
    console.log('🔌 Disconnecting from unified conversation...');
    
    if (conversation) {
      try {
        await conversation.endSession();
        console.log('✔️ Successfully ended conversation session');
      } catch (err) {
        console.warn('⚠️ Error during disconnect:', err);
      }
      setConversation(null);
    }

    // Reset all states
    setIsConnected(false);
    setIsConnecting(false);
    setUiMode('chat');
    setAudioOutputMuted(false); // Keep audio enabled
    setIsMuted(true);
    setAudioEnabled(true); // Keep audio enabled
    setAgentMessage('');
    setUserMessage('');
    setAgentInterimMessage('');
    setUserInterimMessage('');
    setIsAgentSpeaking(false);
    setIsUserSpeaking(false);
    setProductImageData(null);
    setProductLinkData(null);
    setError(null);
  }, [conversation]);

  // Toggle between chat and voice UI modes (NO session restart)
  const toggleMode = useCallback(async () => {
    if (!isConnected || !conversation) {
      console.warn('⚠️ No active conversation to toggle mode');
      return;
    }

    const newMode = uiMode === 'chat' ? 'voice' : 'chat';
    
    try {
      console.log(`🔄 Switching UI mode from ${uiMode} to ${newMode} (same session)`);
      
      if (newMode === 'voice') {
        // Switching to voice mode - need microphone permission
        console.log('🎤 Enabling voice mode - checking microphone permission...');
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          setError('Microphone permission is required for voice mode');
          return;
        }
        
        // Enable voice interactions
        setUiMode('voice');
        setAudioOutputMuted(false);
        setIsMuted(false);
        setAudioEnabled(true); // For backward compatibility
        
        // Unmute microphone in ElevenLabs session
        await conversation.setMicMuted(false);
        
        console.log('🔊 Voice mode enabled - microphone unmuted');
        
      } else {
        // Switching to chat mode - mute everything but keep session
        console.log('💬 Enabling chat mode - muting audio and microphone');
        
        setUiMode('chat');
        setAudioOutputMuted(true);
        setIsMuted(true);
        setAudioEnabled(false); // For backward compatibility
        
        // Mute microphone in ElevenLabs session
        await conversation.setMicMuted(true);
        
        console.log('🔇 Chat mode enabled - microphone muted, audio still enabled');
      }
      
      console.log(`✔️ Successfully switched to ${newMode} mode without session restart`);
    } catch (err) {
      console.error('❌ Failed to toggle mode:', err);
      setError(`Failed to switch to ${newMode} mode: ${err.message}`);
    }
  }, [conversation, uiMode, isConnected]);
  
  // DEPRECATED: Keep for backward compatibility
  const toggleAudio = toggleMode;

  // Send text message (when in text mode)
  const sendTextMessage = useCallback(async (message) => {
    if (!conversation || !message.trim()) {
      console.warn('⚠️ Cannot send text message: no conversation or empty message');
      return;
    }

    try {
      console.log('💬 Sending text message:', message);
      await conversation.sendUserMessage(message);
      console.log('✔️ Text message sent successfully');
    } catch (err) {
      console.error('❌ Failed to send text message:', err);
      setError(`Failed to send message: ${err.message}`);
    }
  }, [conversation]);

  // Toggle microphone (works in both modes, but only active in voice mode)
  const toggleMicrophone = useCallback(async () => {
    if (!conversation) {
      console.warn('⚠️ Cannot toggle microphone: no conversation');
      return;
    }

    try {
      const newMutedState = !isMuted;
      console.log(`🎤 ${newMutedState ? 'Muting' : 'Unmuting'} microphone`);
      
      // Use ElevenLabs SDK microphone control
      await conversation.setMicMuted(newMutedState);
      setIsMuted(newMutedState);

      console.log(`✔️ Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
      
      // If unmuting microphone, ensure we're in voice mode
      if (!newMutedState && uiMode === 'chat') {
        console.log('ℹ️ Microphone unmuted but still in chat mode - consider switching to voice mode');
      }
    } catch (err) {
      console.error('❌ Failed to toggle microphone:', err);
      setError(`Failed to toggle microphone: ${err.message}`);
    }
  }, [conversation, isMuted, uiMode]);

  // NEW: Toggle audio output separately from microphone
  const toggleAudioOutput = useCallback(() => {
    const newMutedState = !audioOutputMuted;
    setAudioOutputMuted(newMutedState);
    
    console.log(`🔊 Audio output ${newMutedState ? 'muted' : 'unmuted'} (simplified - no audio blocking)`);
  }, [audioOutputMuted]);

  // Dismiss product overlays
  const dismissProductOverlays = useCallback(() => {
    console.log('🗑️ Dismissing product overlays');
    setProductImageData(null);
    setProductLinkData(null);
  }, []);

  return {
    // Connection methods
    connect,
    disconnect,

    // Connection state
    isConnected,
    isConnecting,
    error,

    // NEW: UI Mode controls (primary interface)
    uiMode, // 'chat' | 'voice'
    toggleMode, // Switches between chat and voice without session restart
    audioOutputMuted,
    toggleAudioOutput,

    // Audio controls (backward compatibility)
    audioEnabled, // Computed from uiMode for compatibility
    toggleAudio, // Alias for toggleMode
    toggleMicrophone,
    isMuted,

    // Communication methods
    sendTextMessage,

    // Speaking states
    isAgentSpeaking,
    isUserSpeaking,

    // Messages
    agentMessage,
    userMessage,
    agentInterimMessage,
    userInterimMessage,

    // Product display
    productImageData,
    productLinkData,
    dismissProductOverlays
  };
};