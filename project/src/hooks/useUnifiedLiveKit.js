import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';

export const useUnifiedLiveKit = () => {
  // Connection state
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  // Audio/Mode state
  const [audioEnabled, setAudioEnabled] = useState(false); // Default OFF (text mode)
  const [isMuted, setIsMuted] = useState(false);
  
  // Communication state
  const [agentMessage, setAgentMessage] = useState('');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  
  // Product display state
  const [productImageData, setProductImageData] = useState(null);
  const [productLinkData, setProductLinkData] = useState(null);
  
  // Refs for cleanup and state management
  const roomRef = useRef(null);
  const connectionInProgressRef = useRef(false);
  const mountedRef = useRef(true);
  const identityRef = useRef(null);
  const agentSpeakingTimeoutRef = useRef(null);

  // Fetch LiveKit token from Flask backend
  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch('/get-token');
      if (!response.ok) {
        throw new Error('Failed to get LiveKit token');
      }
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Helper function to find agent participant
  const findAgentIdentity = useCallback(() => {
    if (!roomRef.current) return null;
    
    // Find any participant that's not the local participant (should be the agent)
    const participants = Array.from(roomRef.current.remoteParticipants.values());
    return participants.length > 0 ? participants[0].identity : null;
  }, []);

  // RPC: Toggle Audio Mode
  const toggleAudio = useCallback(async () => {
    if (!roomRef.current || !isConnected) {
      setError('Not connected to room');
      return;
    }

    try {
      const agentIdentity = findAgentIdentity();
      if (!agentIdentity) {
        setError('Agent not found in room');
        return;
      }

      const newAudioState = !audioEnabled;
      
      // Call RPC method on agent to toggle audio
      const result = await roomRef.current.localParticipant.performRpc({
        destinationIdentity: agentIdentity,
        method: 'toggle_audio',
        payload: newAudioState.toString(),
        timeout: 5000
      });

      console.log('Audio toggle result:', result);
      
      // Update local state
      setAudioEnabled(newAudioState);
      
      // Handle microphone if enabling audio
      if (newAudioState) {
        try {
          await roomRef.current.localParticipant.setMicrophoneEnabled(true);
          setIsMuted(false);
        } catch (micError) {
          console.warn('Failed to enable microphone:', micError);
          setError('Microphone access failed');
        }
      } else {
        // Disable microphone when switching to text mode
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
      }

    } catch (err) {
      console.error('Failed to toggle audio:', err);
      setError(`Failed to toggle audio: ${err.message}`);
    }
  }, [audioEnabled, isConnected, findAgentIdentity]);

  // RPC: Send Text Message (when in text mode)
  const sendTextMessage = useCallback(async (message) => {
    if (!roomRef.current || !isConnected || !message.trim()) {
      return;
    }

    try {
      const agentIdentity = findAgentIdentity();
      if (!agentIdentity) {
        setError('Agent not found in room');
        return;
      }

      await roomRef.current.localParticipant.performRpc({
        destinationIdentity: agentIdentity,
        method: 'send_text',
        payload: message,
        timeout: 30000
      });
      
      console.log('Text message sent successfully');
    } catch (err) {
      console.error('Failed to send text message:', err);
      setError(`Failed to send message: ${err.message}`);
    }
  }, [isConnected, findAgentIdentity]);

  // RPC: Get Agent Status
  const getAgentStatus = useCallback(async () => {
    if (!roomRef.current || !isConnected) {
      return null;
    }

    try {
      const agentIdentity = findAgentIdentity();
      if (!agentIdentity) {
        return null;
      }

      const result = await roomRef.current.localParticipant.performRpc({
        destinationIdentity: agentIdentity,
        method: 'get_status',
        timeout: 5000
      });
      
      return JSON.parse(result);
    } catch (err) {
      console.warn('Failed to get agent status:', err);
      return null;
    }
  }, [isConnected, findAgentIdentity]);

  // Connect to LiveKit room
  const connect = useCallback(async () => {
    // Enhanced guard against multiple simultaneous connections
    if (connectionInProgressRef.current || roomRef.current?.state === 'connected' || roomRef.current?.state === 'connecting') {
      console.log('Connection already in progress or already connected, state:', roomRef.current?.state);
      return;
    }

    try {
      connectionInProgressRef.current = true;
      setIsConnecting(true);
      setError(null);

      if (!mountedRef.current) {
        connectionInProgressRef.current = false;
        return;
      }

      // Get token from backend
      const { token, url, identity } = await fetchToken();
      identityRef.current = identity;

      if (!mountedRef.current) return;

      // Create new room instance with optimized config
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        reconnectPolicy: {
          maxRetries: 5,
          initialDelay: 1000,
          maxDelay: 5000
        },
        publishDefaults: {
          microphone: false,  // Start disabled
          camera: false
        }
      });

      // Setup event listeners
      newRoom
        .on(RoomEvent.Connected, () => {
          console.log('Connected to LiveKit room');
          if (mountedRef.current) {
            setIsConnected(true);
            setIsConnecting(false);
            connectionInProgressRef.current = false;
          }
        })
        .on(RoomEvent.Disconnected, (reason) => {
          console.log('Disconnected from room:', reason);
          connectionInProgressRef.current = false;
          if (mountedRef.current) {
            setIsConnected(false);
            setError(reason ? `Disconnected: ${reason}` : 'Disconnected');
          }
        })
        .on(RoomEvent.Reconnecting, () => {
          console.log('Reconnecting...');
          setError(null);
          setIsConnecting(true);
        })
        .on(RoomEvent.Reconnected, () => {
          console.log('Reconnected to room');
          setIsConnecting(false);
          setError(null);
        })
        .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          console.log('Track subscribed:', track.kind, participant.identity);
          if (track.kind === Track.Kind.Audio) {
            // Auto-play audio track
            const audioElement = track.attach();
            audioElement.autoplay = true;
            document.body.appendChild(audioElement);
          }
        })
        .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          if (!mountedRef.current) {
            connectionInProgressRef.current = false;
            return;
          }
          
          let userSpeaking = false;
          let agentSpeaking = false;
          
          speakers.forEach(speaker => {
            if (speaker.identity === identityRef.current) {
              userSpeaking = true;
            } else {
              agentSpeaking = true;
            }
          });
          
          setIsUserSpeaking(userSpeaking);
          setIsAgentSpeaking(agentSpeaking);
          
          // Clear timeout if agent starts speaking
          if (agentSpeaking && agentSpeakingTimeoutRef.current) {
            clearTimeout(agentSpeakingTimeoutRef.current);
            agentSpeakingTimeoutRef.current = null;
          }
        })
        .on(RoomEvent.MediaDevicesError, (error) => {
          console.error('Media device error:', error);
          setError(`Media error: ${error.message}`);
        });

      // Register text stream handler for transcriptions
      newRoom.registerTextStreamHandler('lk.transcription', async (reader, participantInfo) => {
        try {
          const message = await reader.readAll();
          console.log('Transcription received:', message);
          setAgentMessage(message);
          
          // Use transcription as fallback agent speaking detection
          if (participantInfo.identity !== identityRef.current && mountedRef.current) {
            setIsAgentSpeaking(true);
            
            // Clear existing timeout
            if (agentSpeakingTimeoutRef.current) {
              clearTimeout(agentSpeakingTimeoutRef.current);
            }
            
            // Set timeout to stop agent speaking after no new transcription
            agentSpeakingTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                setIsAgentSpeaking(false);
              }
            }, 2000);
          }
        } catch (error) {
          console.error('Error handling transcription:', error);
        }
      });

      // Register text stream handler for chat messages
      newRoom.registerTextStreamHandler('lk.chat', async (reader, participantInfo) => {
        try {
          const message = await reader.readAll();
          console.log('Chat message received:', message);
          // Chat messages are handled by the agent, we just log them here
        } catch (error) {
          console.error('Error handling chat message:', error);
        }
      });

      // Register RPC handlers for product display
      newRoom.localParticipant.registerRpcMethod(
        'display_product_image',
        async (data) => {
          try {
            const imageData = JSON.parse(data.payload);
            console.log('Received product image display request:', imageData);
            if (mountedRef.current) {
              setProductImageData(imageData);
            }
            return 'image_displayed';
          } catch (error) {
            console.error('Error handling product image display:', error);
            return 'error';
          }
        }
      );

      newRoom.localParticipant.registerRpcMethod(
        'display_product_link',
        async (data) => {
          try {
            const linkData = JSON.parse(data.payload);
            console.log('Received product link display request:', linkData);
            if (mountedRef.current) {
              setProductLinkData(linkData);
            }
            return 'link_displayed';
          } catch (error) {
            console.error('Error handling product link display:', error);
            return 'error';
          }
        }
      );

      newRoom.localParticipant.registerRpcMethod(
        'dismiss_overlays',
        async (data) => {
          try {
            console.log('Received dismiss overlays request');
            if (mountedRef.current) {
              setProductImageData(null);
              setProductLinkData(null);
            }
            return 'overlays_dismissed';
          } catch (error) {
            console.error('Error handling dismiss overlays:', error);
            return 'error';
          }
        }
      );

      // Connect to room
      await newRoom.connect(url, token);

      // Set room references
      setRoom(newRoom);
      roomRef.current = newRoom;

      console.log('LiveKit room connection established');

    } catch (err) {
      console.error('Connection failed:', err);
      connectionInProgressRef.current = false;
      if (mountedRef.current) {
        setError(err.message);
        setIsConnecting(false);
      }
    } finally {
      // Always reset connection flag
      connectionInProgressRef.current = false;
    }
  }, [fetchToken]);

  // Disconnect from room
  const disconnect = useCallback(() => {
    connectionInProgressRef.current = false;
    
    // Clear timeouts
    if (agentSpeakingTimeoutRef.current) {
      clearTimeout(agentSpeakingTimeoutRef.current);
      agentSpeakingTimeoutRef.current = null;
    }
    
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
    }
    
    if (mountedRef.current) {
      setIsConnected(false);
      setIsConnecting(false);
      setAgentMessage('');
      setError(null);
      setIsAgentSpeaking(false);
      setIsUserSpeaking(false);
      setAudioEnabled(false);
      setProductImageData(null);
      setProductLinkData(null);
    }
  }, []);

  // Toggle microphone (when in voice mode)
  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current || !audioEnabled) return;

    try {
      const currentlyEnabled = roomRef.current.localParticipant.isMicrophoneEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!currentlyEnabled);
      setIsMuted(currentlyEnabled); // If enabled, now muted
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      setError('Failed to toggle microphone');
    }
  }, [audioEnabled]);

  // Dismiss product overlays manually
  const dismissProductOverlays = useCallback(() => {
    setProductImageData(null);
    setProductLinkData(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      connectionInProgressRef.current = false;
      if (agentSpeakingTimeoutRef.current) {
        clearTimeout(agentSpeakingTimeoutRef.current);
        agentSpeakingTimeoutRef.current = null;
      }
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  return {
    // Connection methods
    connect,
    disconnect,
    
    // Connection state
    isConnected,
    isConnecting,
    error,
    
    // Audio controls and state
    audioEnabled,
    toggleAudio,
    toggleMicrophone,
    isMuted,
    
    // Communication methods
    sendTextMessage,
    getAgentStatus,
    
    // Speaking states
    isAgentSpeaking,
    isUserSpeaking,
    
    // Messages
    agentMessage,
    
    // Product display state and controls
    productImageData,
    productLinkData,
    dismissProductOverlays,
    
    // Room reference
    room
  };
};