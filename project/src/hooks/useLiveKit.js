import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent, Track } from 'livekit-client';

export const useLiveKit = () => {
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [transcription, setTranscription] = useState('');
  const roomRef = useRef(null);
  const connectionInProgressRef = useRef(false);
  const mountedRef = useRef(true);

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

  // Connect to LiveKit room
  const connect = useCallback(async () => {
    // Guard against multiple simultaneous connections
    if (connectionInProgressRef.current || roomRef.current?.state === 'connected') {
      console.log('Connection already in progress or already connected, skipping...');
      return;
    }

    try {
      connectionInProgressRef.current = true;
      setIsConnecting(true);
      setError(null);

      // Check if component is still mounted
      if (!mountedRef.current) return;

      // Get token from backend
      const { token, url } = await fetchToken();

      // Check again if component is still mounted after async operation
      if (!mountedRef.current) return;

      // Create new room instance
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          microphone: true,
        }
      });

      // Setup event listeners
      newRoom
        .on(RoomEvent.Connected, () => {
          console.log('Connected to room');
          setIsConnected(true);
          setIsConnecting(false);
        })
        .on(RoomEvent.Disconnected, (reason) => {
          console.log('Disconnected from room:', reason);
          setIsConnected(false);
          setError(reason ? `Disconnected: ${reason}` : 'Disconnected');
        })
        .on(RoomEvent.Reconnecting, () => {
          console.log('Reconnecting...');
          setError(null);
          setIsConnecting(true);
        })
        .on(RoomEvent.Reconnected, () => {
          console.log('Reconnected');
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
        .on(RoomEvent.LocalTrackPublished, (publication, participant) => {
          console.log('Local track published:', publication.source);
        })
        .on(RoomEvent.MediaDevicesError, (error) => {
          console.error('Media device error:', error);
          setError(`Media error: ${error.message}`);
        });

      // Setup text stream handlers for transcription
      newRoom.registerTextStreamHandler('lk.transcription', async (reader, participantInfo) => {
        try {
          const message = await reader.readAll();
          console.log('Transcription received:', message);
          setTranscription(message);
        } catch (error) {
          console.error('Error handling transcription:', error);
        }
      });

      // Connect to room
      await newRoom.connect(url, token);

      // Enable microphone
      try {
        await newRoom.localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);
      } catch (micError) {
        console.warn('Failed to enable microphone:', micError);
        setError('Microphone access failed');
      }

      setRoom(newRoom);
      roomRef.current = newRoom;

    } catch (err) {
      console.error('Connection failed:', err);
      setError(err.message);
      setIsConnecting(false);
    }
  }, [fetchToken]);

  // Disconnect from room
  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
    }
    setIsConnected(false);
    setIsConnecting(false);
    setTranscription('');
    setError(null);
  }, []);

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      const currentlyEnabled = roomRef.current.localParticipant.isMicrophoneEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!currentlyEnabled);
      setIsMuted(currentlyEnabled); // If enabled, now muted
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      setError('Failed to toggle microphone');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection methods
    connect,
    disconnect,
    
    // Connection state
    isConnected,
    isConnecting,
    error,
    
    // Audio controls
    toggleMicrophone,
    isMuted,
    
    // Data
    transcription,
    room
  };
};

// Standalone hook for fetching connection data
export const useLiveKitConnection = () => {
  const [connectionData, setConnectionData] = useState({
    token: null,
    serverUrl: null,
    error: null,
    isLoading: false
  });

  const fetchConnectionData = useCallback(async () => {
    setConnectionData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/get-token');
      if (!response.ok) {
        throw new Error('Failed to get LiveKit token');
      }

      const { token, url } = await response.json();
      setConnectionData({
        token,
        serverUrl: url,
        error: null,
        isLoading: false
      });

      return { token, url };
    } catch (err) {
      setConnectionData(prev => ({
        ...prev,
        error: err.message,
        isLoading: false
      }));
      throw err;
    }
  }, []);

  return {
    ...connectionData,
    fetchConnectionData
  };
};