class VoiceAgentClient {
    constructor() {
        // LiveKit Voice Agent properties
        this.room = null;
        this.token = null;
        this.roomName = null;
        this.identity = null;
        this.wsURL = null;
        this.isConnected = false;
        this.isMicMuted = false;
        this.isSpeakerMuted = false;
        this.localAudioTrack = null;
        this.remoteAudioTrack = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.transcriptionTimeout = null;
        this.audioContext = null;
        this.userAudioAnalyser = null;
        this.userAudioSource = null;
        this.agentAudioAnalyser = null;
        this.agentAudioSource = null;
        this.outputAudioAnalyser = null;
        // Rive animation properties
        this.riveInstance = null;
        this.riveSpeakingInput = null;
        this.riveListeningInput = null;
        
        // Agent detection configuration
        this.agentDetectionMethods = {
            livekitEvents: true,
            audioTrackAnalysis: false,
            audioOutputFallback: false
        };
        
        // Agent speaking state tracking
        this.agentSpeakingStartTime = null;
        this.lastAgentAudioLevel = 0;
        this.silenceDetectionTimeout = null;
        this.agentTimeoutFallback = null;
        this.silenceThreshold = 0.02;
        this.silenceDuration = 2000;
        this.maxSpeakingDuration = 30000;
        
        // DOM elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.userIndicator = document.getElementById('userIndicator');
        this.agentIndicator = document.getElementById('agentIndicator');
        this.userAudioLevel = document.getElementById('userAudioLevel');
        this.agentAudioLevel = document.getElementById('agentAudioLevel');
        this.micBtn = document.getElementById('micBtn');
        this.roomId = document.getElementById('roomId');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
        this.closeErrorModal = document.getElementById('closeErrorModal');
        this.emptyState = document.getElementById('emptyState');
        this.agentSpeechBubble = document.getElementById('agentSpeechBubble');
        this.userInputBubble = document.getElementById('userInputBubble');
        this.agentText = document.getElementById('agentText');
        this.userText = document.getElementById('userText');
        this.backToChatBtn = document.getElementById('backToChatBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        
        // Legacy elements for compatibility
        this.userTranscription = document.getElementById('userTranscription');
        this.agentTranscription = document.getElementById('agentTranscription');
        
        // rive
        this.riveCanvas = document.getElementById('riveCanvas');

        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        
        this.setupRiveAnimation(); // Call the new Rive setup method

        this.showWelcomeMessage();
        
        await this.connect();
    }
    
    // New method to set up Rive animation
    setupRiveAnimation() {
        if (typeof rive === 'undefined') {
            console.error('Rive JS library not loaded. Please check the script tag in your HTML.');
            return;
        }
        if (!this.riveCanvas) {
            console.warn('Rive Canvas element not found. Skipping Rive setup.');
            return;
        }

        this.riveInstance = new rive.Rive({
            src: '/static/danak.riv', // Assuming danak.riv is in the static folder
            canvas: this.riveCanvas,
            autoplay: true,
            stateMachines: 'StateMachine', // Assuming the state machine name is 'StateMachine'
            onLoad: () => {
                this.riveInstance.resizeDrawingSurfaceToCanvas();
                const inputs = this.riveInstance.stateMachineInputs('StateMachine');
                this.riveSpeakingInput = inputs.find(i => i.name === 'isSpeaking');
                this.riveListeningInput = inputs.find(i => i.name === 'IsListening');
                console.log('Rive animation loaded and inputs found.');
            },
            onError: (error) => {
                console.error('Rive animation failed to load:', error);
            },
        });
    }

    
    setupEventListeners() {
        // Control buttons
        if (this.micBtn) {
            this.micBtn.addEventListener('click', () => this.toggleMicrophone());
        }
        
        // Back to chat navigation
        if (this.backToChatBtn) {
            this.backToChatBtn.addEventListener('click', () => {
                window.location.href = '/';
            });
        }
        
        // Fullscreen button
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Error modal controls
        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => this.retryConnection());
        }
        if (this.closeErrorModal) {
            this.closeErrorModal.addEventListener('click', () => this.hideErrorModal());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.ctrlKey) {
                e.preventDefault();
                this.toggleMicrophone();
            }
            if (e.code === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
        });
        
        // Handle fullscreen change
        document.addEventListener('fullscreenchange', () => {
            this.updateFullscreenButton();
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAudioLevelMonitoring();
            } else {
                this.resumeAudioLevelMonitoring();
            }
        });
        
        // Handle window unload
        window.addEventListener('beforeunload', () => {
            this.disconnect();
        });
    }
    
    async fetchToken() {
        try {
            const response = await fetch('/get-token');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.token = data.token;
            this.roomName = data.room;
            this.identity = data.identity;
            this.wsURL = data.url;
            
            console.log('Token fetched successfully:', { room: this.roomName, identity: this.identity });
            return data;
        } catch (error) {
            console.error('Failed to fetch token:', error);
            throw new Error('Failed to get authentication token');
        }
    }
    
    async connect() {
        try {
            this.updateStatus('connecting', 'Connecting to AI Agent...');
            this.showLoadingOverlay();
            
            // Fetch authentication token
            await this.fetchToken();
            
            // Create room instance
            this.room = new LivekitClient.Room({
                adaptiveStream: true,
                dynacast: true,
                videoCaptureDefaults: {
                    resolution: LivekitClient.VideoPresets.h720.resolution,
                }
            });
            
            // Set up room event listeners
            this.setupRoomEventListeners();
            
            // Connect to room
            await this.room.connect(this.wsURL, this.token);
            
            // Set up text stream handlers
            this.setupTextStreamHandlers();
            
            // Enable microphone
            await this.enableMicrophone();
            
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateStatus('connected', 'Connected to AI Agent');
            this.updateRoomInfo();
            this.hideLoadingOverlay();
            
            console.log('Successfully connected to room:', this.roomName);
            
        } catch (error) {
            console.error('Connection failed:', error);
            this.handleConnectionError(error);
        }
    }
    
    setupRoomEventListeners() {
        this.room
            .on(LivekitClient.RoomEvent.Connected, () => {
                console.log('Room connected');
                this.isConnected = true;
                this.updateStatus('connected', 'Connected to AI Agent');
            })
            .on(LivekitClient.RoomEvent.Disconnected, (reason) => {
                console.log('Room disconnected:', reason);
                this.handleDisconnection(reason);
            })
            .on(LivekitClient.RoomEvent.TrackSubscribed, (track, publication, participant) => {
                this.handleTrackSubscribed(track, publication, participant);
            })
            .on(LivekitClient.RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
                this.handleTrackUnsubscribed(track, publication, participant);
            })
            .on(LivekitClient.RoomEvent.LocalTrackPublished, (publication, participant) => {
                console.log('Local track published:', publication.source);
                if (publication.source === LivekitClient.Track.Source.Microphone) {
                    this.localAudioTrack = publication.track;
                    this.startAudioLevelMonitoring();
                }
            })
            .on(LivekitClient.RoomEvent.LocalTrackUnpublished, (publication, participant) => {
                console.log('Local track unpublished:', publication.source);
            })
            .on(LivekitClient.RoomEvent.ActiveSpeakersChanged, (speakers) => {
                this.handleActiveSpeakersChanged(speakers);
            })
            .on(LivekitClient.RoomEvent.ConnectionQualityChanged, (quality, participant) => {
                console.log('Connection quality changed:', quality, participant?.identity);
            })
            .on(LivekitClient.RoomEvent.MediaDevicesError, (error) => {
                console.error('Media device error:', error);
                this.handleMediaDeviceError(error);
            });
    }
    
    async enableMicrophone() {
        try {
            await this.room.localParticipant.setMicrophoneEnabled(true);
            this.micBtn.classList.add('active');
            this.isMicMuted = false;
            
            // Try to set up audio analysis
            try {
                await this.setupAudioAnalysis();
                console.log('Microphone enabled with audio analysis');
            } catch (audioError) {
                console.warn('Audio analysis setup failed, will retry on user interaction:', audioError);
            }
        } catch (error) {
            console.error('Failed to enable microphone:', error);
            this.handleMediaDeviceError(error);
        }
    }
    
    async setupAudioAnalysis() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            this.userAudioAnalyser = this.audioContext.createAnalyser();
            this.userAudioAnalyser.fftSize = 256;
            this.userAudioAnalyser.smoothingTimeConstant = 0.8;
            
            this.userAudioSource = this.audioContext.createMediaStreamSource(stream);
            this.userAudioSource.connect(this.userAudioAnalyser);
            
            console.log('Audio analysis setup complete');
            
        } catch (error) {
            console.error('Failed to setup audio analysis:', error);
        }
    }
    
    getUserAudioLevel() {
        if (!this.userAudioAnalyser) return 0;
        
        const bufferLength = this.userAudioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.userAudioAnalyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        const normalized = average / 255;
        return normalized > 0.01 ? normalized : 0;
    }
    
    async toggleMicrophone() {
        try {
            if (this.isMicMuted) {
                await this.room.localParticipant.setMicrophoneEnabled(true);
                this.micBtn.classList.remove('muted');
                this.micBtn.classList.add('active');
                if (this.userIndicator) {
                    this.userIndicator.classList.remove('muted');
                }
                this.isMicMuted = false;
                
                if (!this.audioContext) {
                    await this.setupAudioAnalysis();
                }
                
                console.log('Microphone unmuted');
            } else {
                await this.room.localParticipant.setMicrophoneEnabled(false);
                this.micBtn.classList.remove('active');
                this.micBtn.classList.add('muted');
                if (this.userIndicator) {
                    this.userIndicator.classList.add('muted');
                }
                this.isMicMuted = true;
                console.log('Microphone muted');
            }
        } catch (error) {
            console.error('Failed to toggle microphone:', error);
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.error('Error attempting to exit fullscreen:', err);
            });
        }
    }
    
    updateFullscreenButton() {
        if (this.fullscreenBtn) {
            const icon = this.fullscreenBtn.querySelector('i');
            if (document.fullscreenElement) {
                icon.className = 'fas fa-compress';
                this.fullscreenBtn.title = 'Exit Fullscreen';
            } else {
                icon.className = 'fas fa-expand';
                this.fullscreenBtn.title = 'Toggle Fullscreen';
            }
        }
    }
    
    handleTrackSubscribed(track, publication, participant) {
        console.log('Track subscribed:', track.kind, participant.identity);
        
        if (track.kind === LivekitClient.Track.Kind.Audio) {
            this.remoteAudioTrack = track;
            
            const audioElement = track.attach();
            audioElement.autoplay = true;
            audioElement.volume = this.isSpeakerMuted ? 0.0 : 1.0;
            
            audioElement.style.display = 'none';
            document.body.appendChild(audioElement);
            
            this.startAgentAudioLevelMonitoring();
            
            console.log('Remote audio track attached');
        }
    }
    
    handleTrackUnsubscribed(track, publication, participant) {
        console.log('Track unsubscribed:', track.kind, participant.identity);
        
        if (track.kind === LivekitClient.Track.Kind.Audio) {
            const audioElements = track.detach();
            audioElements.forEach(element => {
                element.remove();
            });
            
            this.remoteAudioTrack = null;
            if (this.agentIndicator) {
                this.agentIndicator.classList.remove('speaking');
            }
            
            if (this.agentAudioLevelInterval) {
                clearInterval(this.agentAudioLevelInterval);
                this.agentAudioLevelInterval = null;
            }
            
            console.log('Agent audio track cleaned up');
        }
    }
    
    handleActiveSpeakersChanged(speakers) {
        if (this.agentDetectionMethods.livekitEvents) {
            let userSpeaking = false;
            let agentSpeaking = false;
            
            speakers.forEach(speaker => {
                if (speaker.identity === this.identity) {
                    userSpeaking = true;
                } else {
                    agentSpeaking = true;
                }
            });
            
            if (this.userIndicator) {
                if (userSpeaking) {
                    this.userIndicator.classList.add('speaking');
                    if (this.riveListeningInput) this.riveListeningInput.value = true;
                } else {
                    this.userIndicator.classList.remove('speaking');
                    if (this.riveListeningInput) this.riveListeningInput.value = false;
                }
            }
            
            if (agentSpeaking) {
                this.setAgentSpeaking(true, 'livekit-events');
                if (this.riveSpeakingInput) this.riveSpeakingInput.value = true;
            } else {
                this.setAgentSpeaking(false, 'livekit-events');
                if (this.riveSpeakingInput) this.riveSpeakingInput.value = false;
            }
        } else {
            // Fallback: only handle user speaking
            let userSpeaking = false;
            speakers.forEach(speaker => {
                if (speaker.identity === this.identity) {
                    userSpeaking = true;
                }
            });
            
            if (userSpeaking) {
                this.userIndicator.classList.add('speaking');
                if (this.riveListeningInput) this.riveListeningInput.value = true;
            } else {
                this.userIndicator.classList.remove('speaking');
                if (this.riveListeningInput) this.riveListeningInput.value = false;
            }
        }
    }
    
    setupTextStreamHandlers() {
        this.room.registerTextStreamHandler('lk.transcription', async (reader, participantInfo) => {
            try {
                const message = await reader.readAll();
                console.log('Transcription received:', message, 'from:', participantInfo.identity);
                
                if (reader.info.attributes?.['lk.transcribed_track_id']) {
                    console.log(`Voice transcription from ${participantInfo.identity}: ${message}`);
                    const isUser = participantInfo.identity === this.identity;
                    this.updateTranscription(message, isUser);
                } else {
                    console.log(`Text message from ${participantInfo.identity}: ${message}`);
                    this.updateTranscription(message, false);
                }
            } catch (error) {
                console.error('Error handling transcription stream:', error);
            }
        });
        
        this.room.registerTextStreamHandler('lk.chat', async (reader, participantInfo) => {
            try {
                const message = await reader.readAll();
                console.log('Chat message received:', message, 'from:', participantInfo.identity);
                
                if (participantInfo.identity !== this.identity) {
                    this.updateTranscription(message, false);
                }
            } catch (error) {
                console.error('Error handling chat stream:', error);
            }
        });
        
        console.log('Text stream handlers registered');
    }
    
    // Text input methods removed - voice mode only
    
    updateTranscription(text, isUser) {
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        
        if (!isUser) {
            if (this.agentText) {
                this.agentText.textContent = text;
            }
            if (this.agentSpeechBubble) {
                this.agentSpeechBubble.style.display = 'block';
            }
        }
    }
    
    showWelcomeMessage() {
        if (this.agentText) {
            this.agentText.textContent = 'Hello! I\'m your AI assistant. Start speaking to begin our conversation.';
        }
        if (this.agentSpeechBubble) {
            this.agentSpeechBubble.style.display = 'block';
        }
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
    }
    
    startAudioLevelMonitoring() {
        if (!this.localAudioTrack) return;
        
        this.audioLevelInterval = setInterval(() => {
            if (this.localAudioTrack && !this.isMicMuted) {
                const userLevel = this.getUserAudioLevel();
                const levelPercentage = userLevel * 100;
                
                if (this.userAudioLevel) {
                    this.userAudioLevel.style.setProperty('--audio-level', `${levelPercentage}%`);
                }
                
                if (this.userIndicator) {
                    if (userLevel > 0.1) {
                        this.userIndicator.classList.add('speaking');
                    } else {
                        this.userIndicator.classList.remove('speaking');
                    }
                }
            } else {
                if (this.userIndicator) {
                    this.userIndicator.classList.remove('speaking');
                }
            }
        }, 100);
    }
    
    startAgentAudioLevelMonitoring() {
        if (!this.remoteAudioTrack) return;
        
        this.agentAudioLevelInterval = setInterval(() => {
            // Visual audio level display only
            if (!this.isSpeakerMuted && this.agentAudioLevel) {
                const levelPercentage = Math.random() * 50; // Placeholder
                this.agentAudioLevel.style.setProperty('--audio-level', `${levelPercentage}%`);
            }
        }, 100);
    }
    
    setAgentSpeaking(speaking, reason) {
        if (this.agentIndicator) {
            if (speaking) {
                if (!this.agentIndicator.classList.contains('speaking')) {
                    this.agentIndicator.classList.add('speaking');
                    this.agentSpeakingStartTime = Date.now();
                    console.log(`Agent speaking started (${reason})`);
                    
                    this.clearAgentTimeouts();
                    
                    this.agentTimeoutFallback = setTimeout(() => {
                        this.setAgentSpeaking(false, 'timeout-fallback');
                    }, this.maxSpeakingDuration);
                }
            } else {
                if (this.agentIndicator.classList.contains('speaking')) {
                    this.agentIndicator.classList.remove('speaking');
                    this.agentSpeakingStartTime = null;
                    console.log(`Agent speaking stopped (${reason})`);
                    this.clearAgentTimeouts();
                }
            }
        }
    }
    
    clearAgentTimeouts() {
        if (this.silenceDetectionTimeout) {
            clearTimeout(this.silenceDetectionTimeout);
            this.silenceDetectionTimeout = null;
        }
        if (this.agentTimeoutFallback) {
            clearTimeout(this.agentTimeoutFallback);
            this.agentTimeoutFallback = null;
        }
    }
    
    pauseAudioLevelMonitoring() {
        if (this.audioLevelInterval) {
            clearInterval(this.audioLevelInterval);
        }
        if (this.agentAudioLevelInterval) {
            clearInterval(this.agentAudioLevelInterval);
        }
        this.clearAgentTimeouts();
    }
    
    resumeAudioLevelMonitoring() {
        this.startAudioLevelMonitoring();
        if (this.remoteAudioTrack) {
            this.startAgentAudioLevelMonitoring();
        }
    }
    
    handleDisconnection(reason) {
        console.log('Disconnected from room:', reason);
        this.isConnected = false;
        this.updateStatus('disconnected', 'Disconnected from AI Agent');
        
        this.pauseAudioLevelMonitoring();
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            this.updateStatus('connecting', `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, 2000 * this.reconnectAttempts);
        } else {
            this.showErrorModal('Connection lost and unable to reconnect. Please refresh the page to try again.');
        }
    }
    
    handleConnectionError(error) {
        console.error('Connection error:', error);
        this.isConnected = false;
        this.hideLoadingOverlay();
        this.updateStatus('disconnected', 'Connection Failed');
        
        let errorMessage = 'Unable to connect to the AI Agent. ';
        
        if (error.message.includes('token')) {
            errorMessage += 'Authentication failed. Please refresh the page.';
        } else if (error.message.includes('network') || error.message.includes('websocket')) {
            errorMessage += 'Network connection failed. Please check your internet connection.';
        } else if (error.message.includes('permission')) {
            errorMessage += 'Microphone permission denied. Please allow microphone access and refresh.';
        } else {
            errorMessage += 'Please check your internet connection and try again.';
        }
        
        this.showErrorModal(errorMessage);
    }
    
    handleMediaDeviceError(error) {
        console.error('Media device error:', error);
        
        let errorMessage = 'Unable to access your microphone. ';
        
        if (error.name === 'NotAllowedError') {
            errorMessage += 'Please allow microphone access and refresh the page.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No microphone found. Please connect a microphone and refresh.';
        } else if (error.name === 'NotReadableError') {
            errorMessage += 'Microphone is being used by another application. Please close other applications and try again.';
        } else {
            errorMessage += 'Please check your microphone settings and try again.';
        }
        
        this.showErrorModal(errorMessage);
    }
    
    async retryConnection() {
        this.hideErrorModal();
        this.reconnectAttempts = 0;
        await this.connect();
    }
    
    async disconnect() {
        if (this.room) {
            await this.room.disconnect();
            this.room = null;
        }
        this.isConnected = false;
        this.pauseAudioLevelMonitoring();
        if (this.riveInstance) this.riveInstance.unmount(); // Clean up Rive instance
        console.log('Disconnected from room');
    }
    
    updateStatus(status, text) {
        if (this.statusIndicator) {
            this.statusIndicator.className = `status-indicator ${status}`;
        }
        if (this.statusText) {
            this.statusText.textContent = text;
        }
    }
    
    updateRoomInfo() {
        if (this.roomName && this.roomId) {
            this.roomId.textContent = this.roomName.split('-').pop();
        }
    }
    
    showLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }
    
    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }
    
    showErrorModal(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
        }
        if (this.errorModal) {
            this.errorModal.style.display = 'flex';
        }
    }
    
    hideErrorModal() {
        if (this.errorModal) {
            this.errorModal.style.display = 'none';
        }
    }
}

// Initialize the voice agent client when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing LiveKit Voice Agent Client...');
    window.voiceAgentClient = new VoiceAgentClient();
});

// Add CSS for audio level visualization
const style = document.createElement('style');
style.textContent = `
    .audio-level::after {
        width: var(--audio-level, 0%) !important;
    }
`;
document.head.appendChild(style);