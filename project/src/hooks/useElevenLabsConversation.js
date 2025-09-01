import { useState, useCallback, useRef } from 'react';
import { Conversation } from '@elevenlabs/client';

const AGENT_ID = 'agent_3301k3zz72edff3ap9qdpp52n0p6'; // TODO: Replace with your actual ElevenLabs agent ID

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
  const [audioEnabled, setAudioEnabled] = useState(false); // Start in text mode
  const [isMuted, setIsMuted] = useState(false);

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

  // Refs for cleanup
  const mountedRef = useRef(true);

  // Client tools implementation
  const clientTools = {
    displayProductImage: ({ imageUrl, title, description }) => {
      console.log('🎨 Displaying product image:', { imageUrl, title, description });
      setProductImageData({ image_url: imageUrl, product_title: title });
      setProductLinkData(null); // Mutual exclusion
      return "Product image displayed successfully";
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

  // Connect to ElevenLabs agent
  const connect = useCallback(async (initialTextOnly = true) => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log('🔄 Starting ElevenLabs conversation session...');
      console.log('📝 Initial mode:', initialTextOnly ? 'Text-Only' : 'Voice');
      console.log('🔧 Configuration debug:', { initialTextOnly, agentId: AGENT_ID });

      // IMPORTANT: For text-only mode, explicitly DO NOT request microphone
      if (!initialTextOnly) {
        console.log('🎤 Voice mode - requesting microphone permission...');
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          throw new Error('Microphone permission is required for voice mode');
        }
      } else {
        console.log('📝 Text-only mode - NO microphone permission requested');
      }

      console.log('🚀 Starting session with configuration:', {
        agentId: AGENT_ID,
        textOnly: initialTextOnly,
        hasClientTools: !!clientTools
      });

      const sessionConfig = {
        agentId: AGENT_ID,
        clientTools,
        // Try explicit textOnly at top level
        textOnly: initialTextOnly,
        overrides: {
          conversation: {
            textOnly: initialTextOnly
          }
        },

        // Event handlers
        onConnect: () => {
          console.log('✅ Connected to ElevenLabs conversation');
          console.log('🔧 Connection established with textOnly:', initialTextOnly);
          setIsConnected(true);
          setIsConnecting(false);
        },

        onDisconnect: () => {
          console.log('❌ Disconnected from ElevenLabs conversation');
          setIsConnected(false);
          setAudioEnabled(false);
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
                // In text-only mode, warn about unexpected voice input
                if (initialTextOnly && message.message.trim() !== '...') {
                  console.warn('⚠️ WARNING: Received user voice input in text-only mode!');
                }
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
            
            // Handle audio events for voice playback
            if (message.type === 'audio' && message.audio_event) {
              console.log('🔊 Audio event received for playback');
              // Audio is automatically handled by the ElevenLabs SDK
            }
          } else {
            // Handle any other message formats
            console.log('📨 Other message format:', message);
          }
        },

        onModeChange: (modeData) => {
          console.log('🔄 Mode changed:', modeData);

          // Handle the actual mode structure from ElevenLabs
          const mode = modeData.mode || modeData;
          
          if (mode === 'speaking') {
            console.log('🤖 Agent is speaking');
            setIsAgentSpeaking(true);
            setIsUserSpeaking(false);
          } else if (mode === 'listening') {
            console.log('👤 Agent is listening (voice mode)');
            setIsUserSpeaking(true);
            setIsAgentSpeaking(false);
          } else {
            console.log('💬 Mode:', mode);
            setIsUserSpeaking(false);
            setIsAgentSpeaking(false);
          }

          // Update audioEnabled state when ElevenLabs confirms we're in voice mode
          if (mode === 'speaking' || mode === 'listening') {
            console.log('🔊 Voice mode confirmed - enabling audio controls');
            setAudioEnabled(true);
          }
        }
      };

      console.log('🚀 Final session config:', sessionConfig);
      const conversationSession = await Conversation.startSession(sessionConfig);
      
      // Verify the session started in the correct mode
      if (initialTextOnly) {
        console.log('🔒 Text-only session established - microphone should be disabled');
      }

      setConversation(conversationSession);
      
      // Set audioEnabled state based on the mode we're starting in
      setAudioEnabled(!initialTextOnly);

    } catch (err) {
      console.error('❌ Failed to start conversation:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  }, []);

  // Disconnect from conversation
  const disconnect = useCallback(async () => {
    console.log('🔌 Disconnecting from conversation...');
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
    setAudioEnabled(false);
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

  // Toggle between text and voice modes (restarts session)
  const toggleAudio = useCallback(async () => {
    if (!isConnected) {
      console.warn('⚠️ No active conversation to toggle mode');
      return;
    }

    const newTextOnly = audioEnabled; // If currently voice mode, switch to text
    
    try {
      console.log(`🔄 Restarting session in ${newTextOnly ? 'text' : 'voice'} mode`);
      
      // For voice mode, request microphone permission first
      if (!newTextOnly) {
        console.log('🎤 Switching to voice mode - requesting microphone permission...');
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          setError('Microphone permission is required for voice mode');
          return;
        }
      }
      
      // Disconnect current session
      if (conversation) {
        await conversation.endSession();
      }
      
      // Clear states during transition
      setIsConnected(false);
      setConversation(null);
      
      // Start new session with new mode
      await connect(newTextOnly);
      
      console.log(`✔️ Successfully switched to ${newTextOnly ? 'text' : 'voice'} mode`);
    } catch (err) {
      console.error('❌ Failed to toggle audio:', err);
      setError(`Failed to toggle mode: ${err.message}`);
    }
  }, [conversation, audioEnabled, isConnected, connect]);

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

  // Toggle microphone (when in voice mode)
  const toggleMicrophone = useCallback(async () => {
    if (!conversation || !audioEnabled) {
      console.warn('⚠️ Cannot toggle microphone: no conversation or not in voice mode');
      return;
    }

    try {
      const newMutedState = !isMuted;
      console.log(`🎤 ${newMutedState ? 'Muting' : 'Unmuting'} microphone`);
      
      // Use ElevenLabs SDK microphone control
      await conversation.setMicMuted(newMutedState);
      setIsMuted(newMutedState);

      console.log(`✔️ Microphone ${newMutedState ? 'muted' : 'unmuted'}`);
    } catch (err) {
      console.error('❌ Failed to toggle microphone:', err);
      setError(`Failed to toggle microphone: ${err.message}`);
    }
  }, [conversation, audioEnabled, isMuted]);

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

    // Audio controls
    audioEnabled,
    toggleAudio,
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