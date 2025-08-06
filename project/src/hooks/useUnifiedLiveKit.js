import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';

export const useUnifiedLiveKit = () => {
  // Connection state
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  // Audio/Mode state
  const [audioEnabled, setAudioEnabled] = useState(true); // Default OFF (text mode)
  const [isMuted, setIsMuted] = useState(false);
  
  // Communication state
  const [agentMessage, setAgentMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [agentInterimMessage, setAgentInterimMessage] = useState('');
  const [userInterimMessage, setUserInterimMessage] = useState('');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  
  // Agent readiness state
  const [isAgentReady, setIsAgentReady] = useState(false);
  
  // Product display state
  const [productImageData, setProductImageData] = useState(null);
  const [productLinkData, setProductLinkData] = useState(null);
  
  // Refs for cleanup and state management
  const roomRef = useRef(null);
  const connectionInProgressRef = useRef(false);
  const mountedRef = useRef(true);
  const identityRef = useRef(null);
  const agentSpeakingTimeoutRef = useRef(null);
  const agentReadyTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);

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
      
      // Auto-hide error after 3 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setError(null);
        }
      }, 3000);
      
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

  // Helper function for RPC calls with agent readiness check and retry
  const performAgentRpc = useCallback(async (method, payload, options = {}) => {
    const { timeout = 10000, maxRetries = 3, retryDelay = 1000 } = options;
    
    if (!roomRef.current || !isConnected) {
      throw new Error('Not connected to room');
    }

    const agentIdentity = findAgentIdentity();
    if (!agentIdentity) {
      throw new Error('Agent not found in room');
    }

    // Wait for agent to be ready (up to 10 seconds)
    if (!isAgentReady) {
      console.log('Waiting for agent to be ready...');
      await new Promise((resolve, reject) => {
        const checkReady = () => {
          if (isAgentReady) {
            resolve();
          } else {
            setTimeout(checkReady, 500);
          }
        };
        
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('Agent not ready timeout')), 10000);
        checkReady();
      });
    }

    // Retry logic for RPC calls
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await roomRef.current.localParticipant.performRpc({
          destinationIdentity: agentIdentity,
          method,
          payload,
          timeout
        });
        return result;
      } catch (error) {
        console.warn(`RPC ${method} attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }, [roomRef, isConnected, findAgentIdentity, isAgentReady]);

  // RPC: Toggle Audio Mode
  const toggleAudio = useCallback(async () => {
    if (!roomRef.current || !isConnected) {
      setError('Not connected to room');
      return;
    }

    try {
      const newAudioState = !audioEnabled;
      
      // Call RPC method on agent to toggle audio with retry logic
      const result = await performAgentRpc('toggle_audio', newAudioState.toString(), {
        timeout: 15000,
        maxRetries: 3,
        retryDelay: 1000
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
      const errorMessage = `Failed to toggle audio: ${err.message}`;
      setError(errorMessage);
      
      // Auto-hide error after 3 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setError(null);
        }
      }, 3000);
    }
  }, [audioEnabled, isConnected, performAgentRpc]);

  // RPC: Send Text Message (when in text mode)
  const sendTextMessage = useCallback(async (message) => {
    if (!roomRef.current || !isConnected || !message.trim()) {
      return;
    }

    try {
      await performAgentRpc('send_text', message, {
        timeout: 30000,
        maxRetries: 2,
        retryDelay: 1000
      });
      
      console.log('Text message sent successfully');
    } catch (err) {
      console.error('Failed to send text message:', err);
      const errorMessage = `Failed to send message: ${err.message}`;
      setError(errorMessage);
      
      // Auto-hide error after 3 seconds
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setError(null);
        }
      }, 3000);
    }
  }, [isConnected, performAgentRpc]);

  // RPC: Get Agent Status
  const getAgentStatus = useCallback(async () => {
    if (!roomRef.current || !isConnected) {
      return null;
    }

    try {
      const result = await performAgentRpc('get_status', '', {
        timeout: 5000,
        maxRetries: 2,
        retryDelay: 500
      });
      
      return JSON.parse(result);
    } catch (err) {
      console.warn('Failed to get agent status:', err);
      return null;
    }
  }, [isConnected, performAgentRpc]);

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

      // Clean up existing room first
      if (roomRef.current) {
        console.log('Cleaning up existing room before reconnecting');
        roomRef.current.disconnect();
        roomRef.current = null;
        setRoom(null);
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
          
          // Auto-hide error after 3 seconds
          if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
          }
          errorTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              setError(null);
            }
          }, 3000);
        })
        .on(RoomEvent.DataReceived, (payload, participant) => {
          try {
            const data = JSON.parse(new TextDecoder().decode(payload));
            if (data.type === 'agent_ready') {
              console.log('Agent ready signal received');
              if (mountedRef.current) {
                setIsAgentReady(true);
                setError(null); // Clear any previous errors
              }
            }
          } catch (error) {
            console.warn('Failed to parse data packet:', error);
          }
        });

      // Register TranscriptionReceived event for real-time streaming transcriptions
      newRoom.on(RoomEvent.TranscriptionReceived, (segments, participant, publication) => {
        try {
          if (!mountedRef.current || !segments || segments.length === 0) return;
          
          const isFromAgent = participant.identity !== identityRef.current;
          console.log('=== TRANSCRIPTION SEGMENT RECEIVED ===');
          console.log('Participant identity:', participant.identity);
          console.log('Local identity:', identityRef.current);
          console.log('Is from agent:', isFromAgent);
          console.log('Segments count:', segments.length);
          
          // Process each transcription segment
          segments.forEach((segment) => {
            console.log('Segment:', {
              text: segment.text,
              final: segment.final,
              startTime: segment.startTime,
              endTime: segment.endTime,
              id: segment.id
            });
            
            if (!segment.text) return;
            
            if (isFromAgent) {
              // Agent speech transcription
              if (segment.final) {
                console.log('Setting FINAL AGENT message:', segment.text);
                setAgentMessage(segment.text);
                setAgentInterimMessage(''); // Clear interim
                setIsAgentSpeaking(true);
                
                // Clear existing timeout
                if (agentSpeakingTimeoutRef.current) {
                  clearTimeout(agentSpeakingTimeoutRef.current);
                }
                
                // Set timeout to stop agent speaking after final transcription
                agentSpeakingTimeoutRef.current = setTimeout(() => {
                  if (mountedRef.current) {
                    console.log('Setting agent speaking: false (timeout)');
                    setIsAgentSpeaking(false);
                  }
                }, 2000);
              } else {
                // Interim transcription - show progressive text
                console.log('Setting INTERIM AGENT message:', segment.text);
                setAgentInterimMessage(segment.text);
                setIsAgentSpeaking(true);
                
                // Clear existing timeout for interim
                if (agentSpeakingTimeoutRef.current) {
                  clearTimeout(agentSpeakingTimeoutRef.current);
                }
              }
            } else {
              // User speech transcription
              if (segment.final) {
                console.log('Setting FINAL USER message:', segment.text);
                setUserMessage(segment.text);
                setUserInterimMessage(''); // Clear interim
                
                // Clear user message after a delay
                setTimeout(() => {
                  if (mountedRef.current) {
                    setUserMessage('');
                  }
                }, 3000);
              } else {
                // Interim user transcription
                console.log('Setting INTERIM USER message:', segment.text);
                setUserInterimMessage(segment.text);
              }
            }
          });
          
        } catch (error) {
          console.error('Error handling transcription segments:', error);
          // Ensure speaking states are cleared on error
          if (mountedRef.current) {
            setIsAgentSpeaking(false);
            setAgentInterimMessage('');
            setUserInterimMessage('');
          }
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
              // Mutual exclusion: clear link data when showing image
              setProductLinkData(null);
              setProductImageData(imageData);
              console.log('Image displayed, link data cleared for mutual exclusion');
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
              // Mutual exclusion: clear image data when showing link
              setProductImageData(null);
              setProductLinkData(linkData);
              console.log('Link displayed, image data cleared for mutual exclusion');
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
        
        // Auto-hide error after 3 seconds
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
        errorTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            setError(null);
          }
        }, 3000);
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
    
    if (agentReadyTimeoutRef.current) {
      clearTimeout(agentReadyTimeoutRef.current);
      agentReadyTimeoutRef.current = null;
    }
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
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
      setUserMessage('');
      setAgentInterimMessage('');
      setUserInterimMessage('');
      setError(null);
      setIsAgentSpeaking(false);
      setIsUserSpeaking(false);
      setAudioEnabled(false);
      setIsAgentReady(false);
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
      if (agentReadyTimeoutRef.current) {
        clearTimeout(agentReadyTimeoutRef.current);
        agentReadyTimeoutRef.current = null;
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
    
    // Agent readiness
    isAgentReady,
    
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
    userMessage,
    agentInterimMessage,
    userInterimMessage,
    
    // Product display state and controls
    productImageData,
    productLinkData,
    dismissProductOverlays,
    
    // Room reference
    room
  };
};