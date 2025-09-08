import { useState, useCallback, useRef } from 'react';
import { Conversation } from '@elevenlabs/client';
import { fetchImagesFromFolder, processImageData, preloadImages } from '../utils/imageGallery';

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
  const [audioOutputMuted, setAudioOutputMuted] = useState(true); // Start muted
  const [isMuted, setIsMuted] = useState(true); // Start microphone muted
  
  // DEPRECATED: Keep for backward compatibility, now computed from uiMode
  const [audioEnabled, setAudioEnabled] = useState(false);

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

  // Enhanced audio control functions with multiple layers of protection
  const muteAllAudio = useCallback(() => {
    console.log('🔇 🔇 🔇 ENHANCED: Muting all audio elements for chat mode');
    isAudioMutedRef.current = true;
    
    // LAYER 1: Mute all existing audio elements immediately
    const muteExistingAudio = () => {
      const audioElements = document.querySelectorAll('audio, video');
      audioElements.forEach(audio => {
        if (audio) {
          audio.muted = true;
          audio.volume = 0;
          audio.pause();
          audioElementsRef.current.add(audio);
          
          // Also add event listener to prevent future playback
          const preventPlay = (e) => {
            if (isAudioMutedRef.current) {
              e.preventDefault();
              e.stopImmediatePropagation();
              audio.pause();
              console.log('🛑 Prevented audio playback in chat mode');
            }
          };
          
          audio.addEventListener('play', preventPlay, true);
          audio.addEventListener('playing', preventPlay, true);
        }
      });
      console.log(`🔇 Muted ${audioElements.length} existing audio elements`);
    };
    
    muteExistingAudio();
    
    // LAYER 2: Override Web Audio API at the global level
    if (!originalAudioContextRef.current) {
      originalAudioContextRef.current = window.AudioContext || window.webkitAudioContext;
      
      // Create a custom AudioContext that we can control
      const EnhancedAudioContext = function(...args) {
        const context = new originalAudioContextRef.current(...args);
        const originalCreateGain = context.createGain.bind(context);
        
        // Override createGain to add our muting control
        context.createGain = function() {
          const gainNode = originalCreateGain();
          const originalGainValue = gainNode.gain.value;
          
          // If we're in muted mode, set gain to 0
          if (isAudioMutedRef.current) {
            gainNode.gain.value = 0;
            console.log('🔇 Web Audio API: Gain node muted for chat mode');
          }
          
          // Store original for restoration
          gainNode._originalGainValue = originalGainValue;
          return gainNode;
        };
        
        return context;
      };
      
      // Copy static properties
      Object.setPrototypeOf(EnhancedAudioContext, originalAudioContextRef.current);
      Object.defineProperty(EnhancedAudioContext, 'prototype', {
        value: originalAudioContextRef.current.prototype
      });
      
      window.AudioContext = EnhancedAudioContext;
      if (window.webkitAudioContext) {
        window.webkitAudioContext = EnhancedAudioContext;
      }
    }
    
    // LAYER 3: Override HTMLAudioElement constructor
    if (!originalHTMLAudioElementRef.current) {
      originalHTMLAudioElementRef.current = window.HTMLAudioElement;
      
      const EnhancedHTMLAudioElement = function(...args) {
        const audio = new originalHTMLAudioElementRef.current(...args);
        
        // Immediately mute if we're in chat mode
        if (isAudioMutedRef.current) {
          audio.muted = true;
          audio.volume = 0;
          console.log('🔇 HTMLAudioElement: New audio element auto-muted');
        }
        
        audioElementsRef.current.add(audio);
        return audio;
      };
      
      Object.setPrototypeOf(EnhancedHTMLAudioElement, originalHTMLAudioElementRef.current);
      Object.defineProperty(EnhancedHTMLAudioElement, 'prototype', {
        value: originalHTMLAudioElementRef.current.prototype
      });
      
      window.HTMLAudioElement = EnhancedHTMLAudioElement;
      window.Audio = EnhancedHTMLAudioElement;
    }
    
    // LAYER 4: Enhanced MutationObserver for dynamic elements
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
    }
    
    mutationObserverRef.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'AUDIO' || node.tagName === 'VIDEO') {
            console.log('🔇 ENHANCED: New audio/video element detected, force muting');
            node.muted = true;
            node.volume = 0;
            node.pause();
            audioElementsRef.current.add(node);
            
            // Add prevention listeners
            const preventPlay = (e) => {
              if (isAudioMutedRef.current) {
                e.preventDefault();
                e.stopImmediatePropagation();
                node.pause();
                console.log('🛑 ENHANCED: Prevented new element playback');
              }
            };
            
            node.addEventListener('play', preventPlay, true);
            node.addEventListener('playing', preventPlay, true);
            node.addEventListener('canplay', preventPlay, true);
          }
          
          // Check for nested audio/video elements
          if (node.querySelectorAll) {
            const nestedMedia = node.querySelectorAll('audio, video');
            nestedMedia.forEach(media => {
              console.log('🔇 ENHANCED: Nested media element detected, force muting');
              media.muted = true;
              media.volume = 0;
              media.pause();
              audioElementsRef.current.add(media);
            });
          }
        });
      });
    });
    
    mutationObserverRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'volume', 'muted']
    });
    
    // LAYER 5: Continuous monitoring with setInterval
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
    }
    
    audioIntervalRef.current = setInterval(() => {
      if (isAudioMutedRef.current) {
        const allMedia = document.querySelectorAll('audio, video');
        allMedia.forEach(media => {
          if (!media.muted || media.volume > 0) {
            console.log('🔇 CONTINUOUS: Force muting detected unmuted element');
            media.muted = true;
            media.volume = 0;
            media.pause();
          }
        });
      }
    }, 100); // Check every 100ms for any unmuted elements
    
    console.log('🔇 ✅ ENHANCED audio muting system fully activated');
  }, []);

  const unmuteAllAudio = useCallback(() => {
    console.log('🔊 🔊 🔊 ENHANCED: Unmuting all audio elements for voice mode');
    isAudioMutedRef.current = false;
    
    // LAYER 1: Unmute all tracked audio elements
    audioElementsRef.current.forEach(audio => {
      if (audio && audio.parentNode) {
        audio.muted = false;
        audio.volume = 1;
        console.log('🔊 Unmuted tracked audio element');
      }
    });
    
    // LAYER 2: Restore Web Audio API if overridden
    if (originalAudioContextRef.current) {
      window.AudioContext = originalAudioContextRef.current;
      if (window.webkitAudioContext && originalAudioContextRef.current) {
        window.webkitAudioContext = originalAudioContextRef.current;
      }
      console.log('🔊 Web Audio API restored');
    }
    
    // LAYER 3: Restore HTMLAudioElement constructor
    if (originalHTMLAudioElementRef.current) {
      window.HTMLAudioElement = originalHTMLAudioElementRef.current;
      window.Audio = originalHTMLAudioElementRef.current;
      console.log('🔊 HTMLAudioElement constructor restored');
    }
    
    // LAYER 4: Stop mutation observer
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
      mutationObserverRef.current = null;
      console.log('🔊 MutationObserver stopped');
    }
    
    // LAYER 5: Stop continuous monitoring
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
      console.log('🔊 Continuous monitoring stopped');
    }
    
    // LAYER 6: Unmute all current elements on page
    const allMedia = document.querySelectorAll('audio, video');
    allMedia.forEach(media => {
      media.muted = false;
      media.volume = 1;
    });
    
    console.log('🔊 ✅ ENHANCED audio unmuting completed - all audio restored');
  }, []);

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
        hasClientTools: !!clientTools
      });

      const sessionConfig = {
        agentId: AGENT_ID,
        clientTools,
        // REMOVED: textOnly configuration - always voice capable
        // Audio muting handled at client level

        // Event handlers
        onConnect: () => {
          console.log('✅ Connected to ElevenLabs unified voice session');
          console.log('🎯 Voice session ready, starting in chat mode (muted)');
          setIsConnected(true);
          setIsConnecting(false);
          
          // Start in chat mode - voice session but muted
          setUiMode('chat');
          setAudioOutputMuted(true);
          setIsMuted(true);
          setAudioEnabled(false); // For backward compatibility
          
          // CRITICAL: Apply enhanced audio muting immediately for chat mode
          // Apply multiple times to catch any timing issues with ElevenLabs
          muteAllAudio(); // Immediate
          setTimeout(() => muteAllAudio(), 50);   // 50ms delay
          setTimeout(() => muteAllAudio(), 200);  // 200ms delay
          setTimeout(() => muteAllAudio(), 500);  // 500ms delay
          setTimeout(() => muteAllAudio(), 1000); // 1s delay to catch late-loading audio
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
      const conversationSession = await Conversation.startSession(sessionConfig);
      
      setConversation(conversationSession);
      
      // Start microphone muted for chat mode experience
      if (conversationSession && hasPermission) {
        await conversationSession.setMicMuted(true);
        console.log('🔇 Microphone muted for initial chat mode');
      }

    } catch (err) {
      console.error('❌ Failed to start unified conversation:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  }, [uiMode, muteAllAudio]);

  // Disconnect from conversation
  const disconnect = useCallback(async () => {
    console.log('🔌 Disconnecting from unified conversation...');
    
    // ENHANCED CLEANUP: Clean up all audio monitoring systems
    console.log('🧹 Cleaning up enhanced audio muting system...');
    
    // Stop all monitoring systems
    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
      mutationObserverRef.current = null;
    }
    
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    
    // Restore original Web APIs
    if (originalAudioContextRef.current) {
      window.AudioContext = originalAudioContextRef.current;
      if (window.webkitAudioContext) {
        window.webkitAudioContext = originalAudioContextRef.current;
      }
      originalAudioContextRef.current = null;
    }
    
    if (originalHTMLAudioElementRef.current) {
      window.HTMLAudioElement = originalHTMLAudioElementRef.current;
      window.Audio = originalHTMLAudioElementRef.current;
      originalHTMLAudioElementRef.current = null;
    }
    
    // Reset audio muted flag
    isAudioMutedRef.current = false;
    
    // Unmute all audio elements on disconnect
    audioElementsRef.current.forEach(audio => {
      if (audio && audio.parentNode) {
        audio.muted = false;
        audio.volume = 1;
      }
    });
    audioElementsRef.current.clear();
    
    console.log('✅ Enhanced audio system cleanup completed');
    
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
    setAudioOutputMuted(true);
    setIsMuted(true);
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
        
        // CRITICAL: Unmute all audio for voice mode
        unmuteAllAudio();
        
        console.log('🔊 Voice mode enabled - audio and microphone unmuted');
        
      } else {
        // Switching to chat mode - mute everything but keep session
        console.log('💬 Enabling chat mode - muting audio and microphone');
        
        setUiMode('chat');
        setAudioOutputMuted(true);
        setIsMuted(true);
        setAudioEnabled(false); // For backward compatibility
        
        // Mute microphone in ElevenLabs session
        await conversation.setMicMuted(true);
        
        // CRITICAL: Apply enhanced audio muting for chat mode
        // Apply multiple times to ensure it catches all ElevenLabs audio
        muteAllAudio(); // Immediate
        setTimeout(() => muteAllAudio(), 50);   // Quick follow-up
        setTimeout(() => muteAllAudio(), 200);  // Medium delay
        
        console.log('🔇 Chat mode enabled - audio and microphone muted');
      }
      
      console.log(`✔️ Successfully switched to ${newMode} mode without session restart`);
    } catch (err) {
      console.error('❌ Failed to toggle mode:', err);
      setError(`Failed to switch to ${newMode} mode: ${err.message}`);
    }
  }, [conversation, uiMode, isConnected, muteAllAudio, unmuteAllAudio]);
  
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
    
    if (newMutedState) {
      muteAllAudio();
    } else {
      unmuteAllAudio();
    }
    
    console.log(`🔊 Audio output ${newMutedState ? 'muted' : 'unmuted'}`);
  }, [audioOutputMuted, muteAllAudio, unmuteAllAudio]);

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