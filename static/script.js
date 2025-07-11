class VoiceAgentClient {
    constructor() {
        // Mode management
        this.currentMode = 'chat'; // 'chat' or 'voice'
        
        // LiveKit Voice Agent (Voice Mode)
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
        
        // Agent detection configuration - use only LiveKit events since they work perfectly
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
        this.silenceDuration = 2000; // 2 seconds of silence
        this.maxSpeakingDuration = 30000; // 30 seconds max speaking time
        
        // OpenRouter Chat (Chat Mode)
        this.isStreaming = false;
        this.streamController = null;
        this.currentStreamingMessage = '';
        
        // DOM elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.userIndicator = document.getElementById('userIndicator');
        this.agentIndicator = document.getElementById('agentIndicator');
        this.userAudioLevel = document.getElementById('userAudioLevel');
        this.agentAudioLevel = document.getElementById('agentAudioLevel');
        this.micBtn = document.getElementById('micBtn');
        this.speakerBtn = document.getElementById('speakerBtn');
        this.roomId = document.getElementById('roomId');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
        this.closeErrorModal = document.getElementById('closeErrorModal');
        this.emptyState = document.getElementById('emptyState');
        
        // Dual-mode UI elements
        this.agentSpeechBubble = document.getElementById('agentSpeechBubble');
        this.userInputBubble = document.getElementById('userInputBubble');
        this.agentText = document.getElementById('agentText');
        this.userText = document.getElementById('userText');
        this.leftControls = document.getElementById('leftControls');
        this.bottomChatInterface = document.getElementById('bottomChatInterface');
        this.chatInput = document.getElementById('chatInput');
        this.voiceModeBtn = document.getElementById('voiceModeBtn');
        this.closeVoiceBtn = document.getElementById('closeVoiceBtn');
        
        // Legacy elements (for voice mode compatibility)
        this.floatingTextBtn = document.getElementById('floatingTextBtn');
        this.textInputModal = document.getElementById('textInputModal');
        this.modalBackdrop = document.getElementById('modalBackdrop');
        this.closeInputBtn = document.getElementById('closeInputBtn');
        this.textInput = document.getElementById('textInput');
        this.sendBtn = document.getElementById('sendBtn');
        
        // Legacy elements for compatibility
        this.userTranscription = document.getElementById('userTranscription');
        this.agentTranscription = document.getElementById('agentTranscription');
        this.infoBtn = document.getElementById('infoBtn');
        this.testBtn = document.getElementById('testBtn');
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.switchToMode(this.currentMode);
        
        // Only connect to LiveKit if starting in voice mode
        if (this.currentMode === 'voice') {
            await this.connect();
        }
    }
    
    setupEventListeners() {
        // Mode switching controls
        if (this.voiceModeBtn) {
            this.voiceModeBtn.addEventListener('click', () => this.switchToVoiceMode());
        }
        if (this.closeVoiceBtn) {
            this.closeVoiceBtn.addEventListener('click', () => this.switchToChatMode());
        }
        
        // Chat mode controls
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleChatInput();
                }
            });
        }
        
        // Voice mode control buttons
        if (this.micBtn) {
            this.micBtn.addEventListener('click', () => this.toggleMicrophone());
        }
        if (this.speakerBtn) {
            this.speakerBtn.addEventListener('click', () => this.toggleSpeaker());
        }
        
        // Legacy text input modal controls (for voice mode)
        if (this.floatingTextBtn) {
            this.floatingTextBtn.addEventListener('click', () => this.showTextInputModal());
        }
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.handleTextInput());
        }
        if (this.closeInputBtn) {
            this.closeInputBtn.addEventListener('click', () => this.hideTextInputModal());
        }
        if (this.modalBackdrop) {
            this.modalBackdrop.addEventListener('click', () => this.hideTextInputModal());
        }
        
        // Legacy text input controls (for voice mode)
        if (this.textInput) {
            this.textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleTextInput();
                }
            });
        }
        
        // Error modal controls
        this.retryBtn.addEventListener('click', () => this.retryConnection());
        this.closeErrorModal.addEventListener('click', () => this.hideErrorModal());
        
        // Legacy controls (for compatibility)
        if (this.infoBtn) {
            this.infoBtn.addEventListener('click', () => this.showConnectionInfo());
        }
        if (this.testBtn) {
            this.testBtn.addEventListener('click', () => this.testTextStreams());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.ctrlKey) {
                e.preventDefault();
                this.toggleMicrophone();
            }
            if (e.code === 'KeyM' && e.ctrlKey) {
                e.preventDefault();
                this.toggleSpeaker();
            }
            if (e.code === 'KeyT' && e.ctrlKey) {
                e.preventDefault();
                this.showTextInputModal();
            }
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
    
    // Mode Management Methods
    switchToMode(mode) {
        this.currentMode = mode;
        document.body.className = `${mode}-mode`;
        
        if (mode === 'chat') {
            this.switchToChatMode();
        } else if (mode === 'voice') {
            this.switchToVoiceMode();
        }
    }
    
    async switchToChatMode() {
        this.currentMode = 'chat';
        document.body.className = 'chat-mode';
        
        // Hide loading overlay for chat mode
        this.hideLoadingOverlay();
        
        // Update status for chat mode
        this.updateStatus('connected', 'Chat Mode Ready');
        
        // Disconnect from LiveKit if connected
        if (this.isConnected) {
            await this.disconnect();
        }
        
        // Load conversation history
        await this.loadConversation();
        
        // Show welcome message to test speech bubble system
        setTimeout(() => {
            this.displayChatMessage('Welcome to chat mode! You can start typing your messages.', false);
        }, 500);
        
        console.log('Switched to chat mode');
    }
    
    async switchToVoiceMode() {
        this.currentMode = 'voice';
        document.body.className = 'voice-mode';
        
        // Connect to LiveKit if not connected
        if (!this.isConnected) {
            await this.connect();
        }
        
        console.log('Switched to voice mode');
    }
    
    // OpenRouter Chat Methods
    async handleChatInput() {
        console.log('handleChatInput called');
        const text = this.chatInput.value.trim();
        console.log('Chat input text:', text);
        if (!text) return;
        
        // Show user message
        console.log('Displaying user message');
        this.displayChatMessage(text, true);
        
        // Clear input
        this.chatInput.value = '';
        
        // Send to OpenRouter and stream response
        console.log('Sending to OpenRouter');
        await this.sendChatMessage(text);
    }
    
    async sendChatMessage(message) {
        try {
            this.isStreaming = true;
            this.currentStreamingMessage = '';
            
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            this.isStreaming = false;
                            return;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            
                            // Handle OpenRouter streaming response format
                            if (parsed.content) {
                                this.currentStreamingMessage += parsed.content;
                                
                                // Update the agent speech bubble with streaming text
                                this.agentText.textContent = this.currentStreamingMessage;
                                this.agentSpeechBubble.style.display = 'block';
                                this.agentSpeechBubble.style.visibility = 'visible';
                                this.agentSpeechBubble.style.zIndex = '1000';
                            }
                            
                            // Handle completion
                            if (parsed.done) {
                                this.isStreaming = false;
                                console.log('Streaming completed');
                                return;
                            }
                            
                            // Handle errors
                            if (parsed.error) {
                                console.error('OpenRouter error:', parsed.error);
                                this.displayChatMessage('Sorry, I encountered an error. Please try again.', false);
                                return;
                            }
                            
                        } catch (e) {
                            console.warn('Failed to parse streaming data:', e);
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Error sending chat message:', error);
            this.displayChatMessage('Sorry, I encountered an error. Please try again.', false);
        } finally {
            this.isStreaming = false;
        }
    }
    
    displayChatMessage(text, isUser, isLoading = false) {
        // Use the existing speech bubble system
        this.updateTranscription(text, isUser);
    }
    
    fadeOutPreviousMessages() {
        // Use existing fade logic in updateTranscription
    }
    
    async loadConversation() {
        try {
            const response = await fetch('/conversation');
            if (response.ok) {
                const data = await response.json();
                
                // Display conversation history (keep it simple for now)
                if (data.messages && data.messages.length > 0) {
                    const lastUserMessage = data.messages.filter(m => m.role === 'user').slice(-1)[0];
                    const lastAssistantMessage = data.messages.filter(m => m.role === 'assistant').slice(-1)[0];
                    
                    if (lastUserMessage) {
                        this.displayChatMessage(lastUserMessage.content, true);
                    }
                    if (lastAssistantMessage) {
                        this.displayChatMessage(lastAssistantMessage.content, false);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
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
            
            // Try to set up audio analysis immediately, but handle AudioContext restrictions
            try {
                await this.setupAudioAnalysis();
                console.log('Microphone enabled with audio analysis');
            } catch (audioError) {
                console.warn('Audio analysis setup failed, will retry on user interaction:', audioError);
                // Audio analysis will be set up later when user interacts
            }
        } catch (error) {
            console.error('Failed to enable microphone:', error);
            this.handleMediaDeviceError(error);
        }
    }
    
    async setupAudioAnalysis() {
        try {
            // Create audio context if it doesn't exist
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Get user media for audio analysis
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Create analyser for user audio
            this.userAudioAnalyser = this.audioContext.createAnalyser();
            this.userAudioAnalyser.fftSize = 256;
            this.userAudioAnalyser.smoothingTimeConstant = 0.8;
            
            // Connect user audio stream to analyser
            this.userAudioSource = this.audioContext.createMediaStreamSource(stream);
            this.userAudioSource.connect(this.userAudioAnalyser);
            
            // Setup output audio detection (fallback method)
            await this.setupOutputAudioDetection();
            
            console.log('Audio analysis setup complete');
            
        } catch (error) {
            console.error('Failed to setup audio analysis:', error);
            // Fall back to simulated levels if real analysis fails
        }
    }
    
    getUserAudioLevel() {
        if (!this.userAudioAnalyser) return 0;
        
        const bufferLength = this.userAudioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.userAudioAnalyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Normalize to 0-1 range and apply threshold
        const normalized = average / 255;
        return normalized > 0.01 ? normalized : 0; // Only show if above threshold
    }
    
    getAgentAudioLevel() {
        if (!this.agentAudioAnalyser) return 0;
        
        const bufferLength = this.agentAudioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.agentAudioAnalyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        let maxValue = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
            maxValue = Math.max(maxValue, dataArray[i]);
        }
        const average = sum / bufferLength;
        
        const normalized = average / 255;
        const maxNormalized = maxValue / 255;
        
        // Use both average and peak detection for better silence detection
        // Return 0 if both average and peak are below meaningful thresholds
        if (normalized < 0.005 && maxNormalized < 0.02) {
            return 0;
        }
        
        return normalized;
    }
    
    getOutputAudioLevel() {
        // Fallback: Check if any audio elements are playing
        const audioElements = document.querySelectorAll('audio');
        let maxLevel = 0;
        
        audioElements.forEach(audio => {
            // More strict checking - audio must be actively playing AND have recent activity
            if (!audio.paused && !audio.ended && audio.currentTime > 0) {
                // Check if audio has actual data and is progressing
                if (audio.readyState >= 2 && audio.duration > 0) {
                    // Only consider it active if it's been playing recently
                    const timeSinceLastUpdate = Date.now() - (audio._lastUpdateTime || 0);
                    if (timeSinceLastUpdate < 500) { // 500ms threshold
                        const estimatedLevel = audio.volume * 0.5; // Reduced sensitivity
                        maxLevel = Math.max(maxLevel, estimatedLevel);
                    }
                }
            }
            
            // Update last seen time for this audio element
            audio._lastUpdateTime = Date.now();
        });
        
        return maxLevel > 0.03 ? maxLevel : 0; // Increased threshold
    }
    
    async setupAgentAudioAnalysis(audioTrack) {
        try {
            if (!this.audioContext || !this.agentDetectionMethods.audioTrackAnalysis) return;
            
            // Create analyser for agent audio
            this.agentAudioAnalyser = this.audioContext.createAnalyser();
            this.agentAudioAnalyser.fftSize = 256;
            this.agentAudioAnalyser.smoothingTimeConstant = 0.8;
            
            // Get the audio element from the track
            const audioElement = audioTrack.attach();
            
            // Connect agent audio to analyser
            this.agentAudioSource = this.audioContext.createMediaElementSource(audioElement);
            this.agentAudioSource.connect(this.agentAudioAnalyser);
            this.agentAudioSource.connect(this.audioContext.destination);
            
            console.log('Agent audio analysis setup complete');
            
        } catch (error) {
            console.error('Failed to setup agent audio analysis:', error);
            // Fall back to other detection methods
        }
    }
    
    async setupOutputAudioDetection() {
        try {
            if (!this.audioContext || !this.agentDetectionMethods.audioOutputFallback) return;
            
            // Create analyser for overall audio output detection
            this.outputAudioAnalyser = this.audioContext.createAnalyser();
            this.outputAudioAnalyser.fftSize = 256;
            this.outputAudioAnalyser.smoothingTimeConstant = 0.8;
            
            // Only setup global audio monitoring if fallback is enabled
            if (this.agentDetectionMethods.audioOutputFallback) {
                this.setupGlobalAudioMonitoring();
            }
            
            console.log('Output audio detection setup complete');
            
        } catch (error) {
            console.error('Failed to setup output audio detection:', error);
        }
    }
    
    setupGlobalAudioMonitoring() {
        // DISABLED: Only use LiveKit events for agent speaking detection
        // This method is no longer used as it causes false positives
        console.log('Global Audio Monitor - DISABLED (using LiveKit events only)');
    }
    
    
    async toggleMicrophone() {
        try {
            if (this.isMicMuted) {
                await this.room.localParticipant.setMicrophoneEnabled(true);
                this.micBtn.classList.remove('muted');
                this.micBtn.classList.add('active');
                this.userIndicator.classList.remove('muted');
                this.isMicMuted = false;
                
                // Set up audio analysis on user interaction (fixes AudioContext requirement)
                if (!this.audioContext) {
                    await this.setupAudioAnalysis();
                }
                
                console.log('Microphone unmuted');
            } else {
                await this.room.localParticipant.setMicrophoneEnabled(false);
                this.micBtn.classList.remove('active');
                this.micBtn.classList.add('muted');
                this.userIndicator.classList.add('muted');
                this.isMicMuted = true;
                console.log('Microphone muted');
            }
        } catch (error) {
            console.error('Failed to toggle microphone:', error);
        }
    }
    
    toggleSpeaker() {
        if (this.isSpeakerMuted) {
            // Unmute all remote audio tracks
            this.room.remoteParticipants.forEach(participant => {
                participant.audioTrackPublications.forEach(pub => {
                    if (pub.track) {
                        pub.track.setVolume(1.0);
                    }
                });
            });
            this.speakerBtn.classList.remove('muted');
            this.agentIndicator.classList.remove('muted');
            this.isSpeakerMuted = false;
            console.log('Speaker unmuted');
        } else {
            // Mute all remote audio tracks
            this.room.remoteParticipants.forEach(participant => {
                participant.audioTrackPublications.forEach(pub => {
                    if (pub.track) {
                        pub.track.setVolume(0.0);
                    }
                });
            });
            this.speakerBtn.classList.add('muted');
            this.agentIndicator.classList.add('muted');
            this.isSpeakerMuted = true;
            console.log('Speaker muted');
        }
    }
    
    handleTrackSubscribed(track, publication, participant) {
        console.log('Track subscribed:', track.kind, participant.identity);
        
        if (track.kind === LivekitClient.Track.Kind.Audio) {
            this.remoteAudioTrack = track;
            
            // Create audio element and attach track
            const audioElement = track.attach();
            audioElement.autoplay = true;
            audioElement.volume = this.isSpeakerMuted ? 0.0 : 1.0;
            
            // Add to page (hidden)
            audioElement.style.display = 'none';
            document.body.appendChild(audioElement);
            
            // Setup agent audio analysis (Method 2: Audio Track Analysis)
            if (this.agentDetectionMethods.audioTrackAnalysis) {
                this.setupAgentAudioAnalysis(track);
            }
            
            // Setup audio element event listeners (Method 3: Audio Output Fallback)
            // DISABLED: Use only LiveKit events for agent speaking detection
            // if (this.agentDetectionMethods.audioOutputFallback) {
            //     this.setupAudioElementDetection(audioElement);
            // }
            
            // Start monitoring agent audio levels
            this.startAgentAudioLevelMonitoring();
            
            console.log('Remote audio track attached with agent detection');
        }
    }
    
    setupAudioElementDetection(audioElement) {
        try {
            // Listen for audio playback events
            audioElement.addEventListener('play', () => {
                console.log('Agent audio started playing');
                this.setAgentSpeaking(true, 'audio-element-play');
            });
            
            audioElement.addEventListener('pause', () => {
                console.log('Agent audio paused');
                this.setAgentSpeaking(false, 'audio-element-pause');
            });
            
            audioElement.addEventListener('ended', () => {
                console.log('Agent audio ended');
                this.setAgentSpeaking(false, 'audio-element-ended');
            });
            
            console.log('Audio element detection setup complete');
            
        } catch (error) {
            console.error('Failed to setup audio element detection:', error);
        }
    }
    
    handleTrackUnsubscribed(track, publication, participant) {
        console.log('Track unsubscribed:', track.kind, participant.identity);
        
        if (track.kind === LivekitClient.Track.Kind.Audio) {
            // Clean up audio elements and intervals
            const audioElements = track.detach();
            audioElements.forEach(element => {
                if (element._volumeCheckInterval) {
                    clearInterval(element._volumeCheckInterval);
                }
                element.remove();
            });
            
            // Reset agent audio state
            this.remoteAudioTrack = null;
            this.agentAudioAnalyser = null;
            this.agentAudioSource = null;
            this.agentIndicator.classList.remove('speaking');
            
            // Stop agent audio monitoring
            if (this.agentAudioLevelInterval) {
                clearInterval(this.agentAudioLevelInterval);
                this.agentAudioLevelInterval = null;
            }
            
            console.log('Agent audio track cleaned up');
        }
    }
    
    handleActiveSpeakersChanged(speakers) {
        // Method 1: LiveKit Events - Most accurate speaker detection
        if (this.agentDetectionMethods.livekitEvents) {
            let userSpeaking = false;
            let agentSpeaking = false;
            
            speakers.forEach(speaker => {
                if (speaker.identity === this.identity) {
                    userSpeaking = true;
                } else {
                    // This is the agent speaking
                    agentSpeaking = true;
                }
            });
            
            // Update user indicator
            if (userSpeaking) {
                this.userIndicator.classList.add('speaking');
                console.log('User speaking detected via LiveKit events');
            } else {
                this.userIndicator.classList.remove('speaking');
                console.log('User stopped speaking via LiveKit events');
            }
            
            // Update agent indicator using centralized method
            if (agentSpeaking) {
                this.setAgentSpeaking(true, 'livekit-events');
            } else {
                this.setAgentSpeaking(false, 'livekit-events');
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
            } else {
                this.userIndicator.classList.remove('speaking');
            }
        }
    }
    
    setupTextStreamHandlers() {
        // Register handler for transcription stream (receives transcriptions from agent)
        this.room.registerTextStreamHandler('lk.transcription', async (reader, participantInfo) => {
            try {
                const message = await reader.readAll();
                console.log('Transcription received:', message, 'from:', participantInfo.identity);
                
                // Check if this is a transcription of an audio track or text-only message
                if (reader.info.attributes?.['lk.transcribed_track_id']) {
                    // This is a transcription of speech
                    console.log(`Voice transcription from ${participantInfo.identity}: ${message}`);
                    
                    // Determine if it's from user or agent
                    const isUser = participantInfo.identity === this.identity;
                    this.updateTranscription(message, isUser);
                } else {
                    // This is a text-only message from agent
                    console.log(`Text message from ${participantInfo.identity}: ${message}`);
                    this.updateTranscription(message, false);
                }
            } catch (error) {
                console.error('Error handling transcription stream:', error);
            }
        });
        
        // Register handler for chat stream (receives text messages)
        this.room.registerTextStreamHandler('lk.chat', async (reader, participantInfo) => {
            try {
                const message = await reader.readAll();
                console.log('Chat message received:', message, 'from:', participantInfo.identity);
                
                // Only show messages from other participants (not our own)
                if (participantInfo.identity !== this.identity) {
                    this.updateTranscription(message, false);
                }
            } catch (error) {
                console.error('Error handling chat stream:', error);
            }
        });
        
        console.log('Text stream handlers registered for topics: lk.transcription, lk.chat');
    }
    
    // Test method to verify text streams are working
    testTextStreams() {
        console.log('Testing text streams...');
        
        // Test sending a message
        this.sendTextMessage('Test message from frontend');
        
        // Test displaying a transcription
        setTimeout(() => {
            this.updateTranscription('Test transcription display', false);
        }, 1000);
    }
    
    handleTextInput() {
        const text = this.textInput.value.trim();
        if (!text || !this.isConnected) return;
        
        // Send text message to agent
        this.sendTextMessage(text);
        
        // Show user's typed message immediately
        this.updateTranscription(text, true);
        
        // Clear input field
        this.clearTextInput();
    }
    
    async sendTextMessage(text) {
        try {
            if (!this.room || !this.isConnected) {
                console.warn('Cannot send text message: not connected to room');
                return;
            }
            
            // Send text message using LiveKit text streams
            const info = await this.room.localParticipant.sendText(text, {
                topic: 'lk.chat',
            });
            
            console.log('Text message sent:', text, 'info:', info);
            
        } catch (error) {
            console.error('Failed to send text message:', error);
            this.showErrorModal('Failed to send message. Please try again.');
        }
    }
    
    clearTextInput() {
        this.textInput.value = '';
        this.hideTextInputModal();
    }
    
    showTextInputModal() {
        this.textInputModal.style.display = 'flex';
        // Focus on the text input after animation
        setTimeout(() => {
            this.textInput.focus();
        }, 100);
    }
    
    hideTextInputModal() {
        this.textInputModal.style.display = 'none';
        this.textInput.blur();
    }
    
    updateTranscription(text, isUser) {
        console.log('updateTranscription called', { text, isUser });
        
        // Hide empty state
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        
        // Update the appropriate speech bubble
        if (isUser) {
            console.log('Showing user message bubble');
            if (this.userText) {
                this.userText.textContent = text;
            }
            if (this.userInputBubble) {
                this.userInputBubble.style.display = 'block';
                this.userInputBubble.style.visibility = 'visible';
                this.userInputBubble.style.zIndex = '1000';
                console.log('User bubble should be visible now');
                
                // Auto-hide user bubble after 4 seconds
                setTimeout(() => {
                    this.userInputBubble.style.display = 'none';
                }, 4000);
            }
        } else {
            console.log('Showing agent message bubble');
            if (this.agentText) {
                this.agentText.textContent = text;
            }
            if (this.agentSpeechBubble) {
                this.agentSpeechBubble.style.display = 'block';
                this.agentSpeechBubble.style.visibility = 'visible';
                this.agentSpeechBubble.style.zIndex = '1000';
                console.log('Agent bubble should be visible now');
                
                // Auto-hide agent bubble after 6 seconds
                setTimeout(() => {
                    this.agentSpeechBubble.style.display = 'none';
                }, 6000);
            }
        }
        
        // Update legacy elements for compatibility
        this.displayMessage(text, isUser);
    }
    
    shouldFadePreviousMessages(text, isUser) {
        // Simple logic: fade if both messages are currently visible
        // This creates a conversation flow where both user and agent messages show together
        const userVisible = this.userTranscription.style.display === 'block';
        const agentVisible = this.agentTranscription.style.display === 'block';
        
        // Only fade if both are visible and we're starting a new exchange
        return userVisible && agentVisible;
    }
    
    displayMessage(text, isUser) {
        if (isUser) {
            this.userText.textContent = text;
            this.userTranscription.style.display = 'block';
            this.userTranscription.classList.remove('fadeOut');
        } else {
            this.agentText.textContent = text;
            this.agentTranscription.style.display = 'block';
            this.agentTranscription.classList.remove('fadeOut');
        }
    }
    
    startAudioLevelMonitoring() {
        if (!this.localAudioTrack) return;
        
        // Monitor local audio levels using real-time analysis
        this.audioLevelInterval = setInterval(() => {
            if (this.localAudioTrack && !this.isMicMuted) {
                const userLevel = this.getUserAudioLevel();
                const levelPercentage = userLevel * 100;
                
                this.userAudioLevel.style.setProperty('--audio-level', `${levelPercentage}%`);
                
                if (userLevel > 0.1) {
                    this.userIndicator.classList.add('speaking');
                } else {
                    this.userIndicator.classList.remove('speaking');
                }
            } else {
                this.userIndicator.classList.remove('speaking');
            }
        }, 100);
    }
    
    startAgentAudioLevelMonitoring() {
        if (!this.remoteAudioTrack) return;
        
        // Only monitor visual audio levels, don't use for speaking detection
        // Speaking detection is handled exclusively by LiveKit events
        this.agentAudioLevelInterval = setInterval(() => {
            let agentLevel = 0;
            
            // Get audio level only for visual display
            if (this.agentAudioAnalyser) {
                agentLevel = this.getAgentAudioLevel();
            }
            
            // Update visual audio level indicator only
            if (!this.isSpeakerMuted) {
                const levelPercentage = agentLevel * 100;
                this.agentAudioLevel.style.setProperty('--audio-level', `${levelPercentage}%`);
            }
        }, 100);
    }
    
    setAgentSpeaking(speaking, reason) {
        if (speaking) {
            // Agent is speaking
            if (!this.agentIndicator.classList.contains('speaking')) {
                this.agentIndicator.classList.add('speaking');
                this.agentSpeakingStartTime = Date.now();
                console.log(`Agent speaking started (${reason})`);
                
                // Clear any existing silence detection timeout
                this.clearAgentTimeouts();
                
                // Set maximum speaking duration fallback
                this.agentTimeoutFallback = setTimeout(() => {
                    this.setAgentSpeaking(false, 'timeout-fallback');
                }, this.maxSpeakingDuration);
            }
        } else {
            // Agent stopped speaking
            if (this.agentIndicator.classList.contains('speaking')) {
                this.agentIndicator.classList.remove('speaking');
                this.agentSpeakingStartTime = null;
                console.log(`Agent speaking stopped (${reason})`);
                this.clearAgentTimeouts();
            }
        }
    }
    
    checkAgentSilence() {
        // DISABLED: Only use LiveKit events for agent speaking detection
        // This method is no longer used as it causes false positives
        return;
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
        if (this.globalAudioMonitor) {
            clearInterval(this.globalAudioMonitor);
        }
        // Clear agent speaking timeouts
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
        
        // Clean up audio monitoring
        this.pauseAudioLevelMonitoring();
        
        // Attempt reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            
            this.updateStatus('connecting', `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, 2000 * this.reconnectAttempts); // Exponential backoff
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
        console.log('Disconnected from room');
    }
    
    updateStatus(status, text) {
        this.statusIndicator.className = `status-indicator ${status}`;
        this.statusText.textContent = text;
        
        // Enable/disable chat input based on connection status (for chat mode)
        if (this.chatInput) {
            if (status === 'connected') {
                this.chatInput.disabled = false;
                this.chatInput.placeholder = 'Type your message...';
            } else {
                this.chatInput.disabled = true;
                this.chatInput.placeholder = 'Connecting...';
            }
        }
        
        // Enable/disable legacy text input based on connection status (for voice mode)
        if (this.textInput) {
            if (status === 'connected') {
                this.textInput.disabled = false;
                this.textInput.placeholder = 'Type your message...';
            } else {
                this.textInput.disabled = true;
                this.textInput.placeholder = 'Connecting...';
            }
        }
        
        if (this.sendBtn) {
            this.sendBtn.disabled = status !== 'connected';
        }
        
        if (this.floatingTextBtn) {
            if (status === 'connected') {
                this.floatingTextBtn.style.opacity = '1';
                this.floatingTextBtn.style.pointerEvents = 'auto';
            } else {
                this.floatingTextBtn.style.opacity = '0.5';
                this.floatingTextBtn.style.pointerEvents = 'none';
            }
        }
    }
    
    updateRoomInfo() {
        if (this.roomName) {
            this.roomId.textContent = this.roomName.split('-').pop();
        }
    }
    
    showLoadingOverlay() {
        this.loadingOverlay.style.display = 'flex';
    }
    
    hideLoadingOverlay() {
        this.loadingOverlay.style.display = 'none';
    }
    
    showErrorModal(message) {
        this.errorMessage.textContent = message;
        this.errorModal.style.display = 'flex';
    }
    
    hideErrorModal() {
        this.errorModal.style.display = 'none';
    }
    
    showConnectionInfo() {
        const info = {
            room: this.roomName,
            identity: this.identity,
            connected: this.isConnected,
            micMuted: this.isMicMuted,
            speakerMuted: this.isSpeakerMuted,
            audioAnalysisEnabled: !!this.audioContext,
            agentDetectionMethods: this.agentDetectionMethods,
            agentAudioAnalyser: !!this.agentAudioAnalyser,
            remoteAudioTrack: !!this.remoteAudioTrack,
            globalAudioMonitor: !!this.globalAudioMonitor,
            newUIElements: {
                agentSpeechBubble: !!this.agentSpeechBubble,
                userInputBubble: !!this.userInputBubble,
                floatingTextBtn: !!this.floatingTextBtn,
                textInputModal: !!this.textInputModal
            }
        };
        
        alert(`AI Assistant Connection Info:\n${JSON.stringify(info, null, 2)}`);
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