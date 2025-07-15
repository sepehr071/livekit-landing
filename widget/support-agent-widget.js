(function() {
  'use strict';

  // --- Widget Configuration and Initialization ---
  const DEFAULT_CONFIG = {
    backendUrl: 'http://localhost:5000',
    position: 'bottom-right', // 'bottom-left', 'top-right', 'top-left'
    theme: 'light', // 'light', 'dark', 'auto'
    customColors: {}, // { primary: '#667eea', secondary: '#764ba2' }
    language: 'en',
    showOnLoad: false,
    buttonText: '', // Defaults to headset icon
    buttonIcon: '<i class="fas fa-headset"></i>',
    title: 'AI Voice Assistant',
    callbacks: {
      onOpen: () => {},
      onClose: () => {},
      onConnect: () => {},
      onMessage: (message) => {}
    }
  };

  class SupportWidget {
    constructor(config) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.widgetContainer = null;
      this.floatingButton = null;
      this.voiceAgentClient = null;
      this.isOpen = false;

      this.loadDependencies().then(() => {
        this.setupWidget();
        if (this.config.showOnLoad) {
          this.openWidget();
        }
      }).catch(error => {
        console.error("Failed to load widget dependencies:", error);
        // Optionally show a fallback message or error to the user
      });
    }

    async loadDependencies() {
      const loadScript = (id, src) => {
        return new Promise((resolve, reject) => {
          if (document.getElementById(id)) {
            resolve();
            return;
          }
          const script = document.createElement('script');
          script.id = id;
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      const loadCSS = (id, href) => {
        return new Promise((resolve, reject) => {
          if (document.getElementById(id)) {
            resolve();
            return;
          }
          const link = document.createElement('link');
          link.id = id;
          link.rel = 'stylesheet';
          link.href = href;
          link.onload = resolve;
          link.onerror = reject;
          document.head.appendChild(link);
        });
      };

      const dependencies = [];

      // Load Font Awesome
      dependencies.push(loadCSS('fa-css', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'));

      // Load Rive (if not already loaded by host page)
      if (typeof rive === 'undefined') {
        dependencies.push(loadScript('rive-js', 'https://cdn.jsdelivr.net/npm/@rive-app/canvas'));
      }

      // Load LiveKit Client (if not already loaded by host page)
      if (typeof LivekitClient === 'undefined') {
        dependencies.push(loadScript('livekit-client-js', 'https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js'));
      }
      
      // Load widget-specific CSS
      dependencies.push(loadCSS('support-widget-css', '/widget/support-agent-widget.css'));

      await Promise.all(dependencies);
    }

    setupWidget() {
      this.createFloatingButton();
      this.createWidgetContainer();
      this.applyPositioning();
      this.applyTheme();
      this.injectCustomStyles();

      // Initialize VoiceAgentClient after widget is in DOM
      this.voiceAgentClient = new VoiceAgentClient(this.widgetContainer, this.config.backendUrl, this.config.title);
    }

    createFloatingButton() {
      this.floatingButton = document.createElement('div');
      this.floatingButton.id = 'supportAgentFloatingBtn';
      this.floatingButton.className = 'support-widget-floating-btn';
      this.floatingButton.innerHTML = this.config.buttonText || this.config.buttonIcon;
      this.floatingButton.title = this.config.buttonText || 'Open Support';
      this.floatingButton.addEventListener('click', () => this.toggleWidget());
      document.body.appendChild(this.floatingButton);
    }

    createWidgetContainer() {
      this.widgetContainer = document.createElement('div');
      this.widgetContainer.id = 'supportAgentWidgetContainer';
      this.widgetContainer.className = 'support-widget-container';
      this.widgetContainer.innerHTML = `
        <div class="support-widget-header">
          <h1 class="support-widget-title">${this.config.title}</h1>
          <div class="support-widget-close-btn" id="supportWidgetCloseBtn" title="Close">
            <i class="fas fa-times"></i>
          </div>
          <div class="support-widget-connection-status" id="supportWidgetConnectionStatus">
            <div class="support-widget-status-indicator" id="supportWidgetStatusIndicator"></div>
            <span class="support-widget-status-text" id="supportWidgetStatusText">Initializing...</span>
          </div>
        </div>
        <div class="support-widget-main-content">
          <div class="support-widget-speaking-indicators">
            <div class="support-widget-indicator support-widget-user-indicator" id="supportWidgetUserIndicator">
              <i class="fas fa-microphone"></i>
              <div class="support-widget-audio-level" id="supportWidgetUserAudioLevel"></div>
              <span class="support-widget-indicator-label">You</span>
            </div>
            <div class="support-widget-indicator support-widget-agent-indicator" id="supportWidgetAgentIndicator">
              <i class="fas fa-robot"></i>
              <div class="support-widget-audio-level" id="supportWidgetAgentAudioLevel"></div>
              <span class="support-widget-indicator-label">AI Agent</span>
            </div>
          </div>
          <div class="support-widget-rive-animation-container" id="supportWidgetRiveAnimationContainer">
            <canvas id="supportWidgetRiveCanvas" width="400" height="400"></canvas>
          </div>
          <div class="support-widget-transcription-area" id="supportWidgetTranscriptionArea">
            <div class="support-widget-transcription-message support-widget-user-message" id="supportWidgetUserTranscription" style="display: none;">
              <div class="support-widget-message-content">
                <span class="support-widget-speaker-label">You:</span>
                <span class="support-widget-message-text" id="supportWidgetUserText"></span>
              </div>
            </div>
            <div class="support-widget-transcription-message support-widget-agent-message" id="supportWidgetAgentTranscription" style="display: none;">
              <div class="support-widget-message-content">
                <span class="support-widget-speaker-label">AI Agent:</span>
                <span class="support-widget-message-text" id="supportWidgetAgentText"></span>
              </div>
            </div>
            <div class="support-widget-empty-state" id="supportWidgetEmptyState">
              <i class="fas fa-comment-dots"></i>
              <p>Start speaking to begin your conversation with the AI agent</p>
            </div>
          </div>
          <div class="support-widget-text-input-section">
            <div class="support-widget-input-container">
              <input type="text" id="supportWidgetTextInput" placeholder="Type your message..." maxlength="500" />
              <button class="support-widget-send-btn" id="supportWidgetSendBtn" title="Send Message">
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
          <div class="support-widget-controls">
            <button class="support-widget-control-btn support-widget-mic-btn" id="supportWidgetMicBtn" title="Toggle Microphone">
              <i class="fas fa-microphone"></i>
            </button>
            <button class="support-widget-control-btn support-widget-speaker-btn" id="supportWidgetSpeakerBtn" title="Toggle Speaker">
              <i class="fas fa-volume-up"></i>
            </button>
            <button class="support-widget-control-btn support-widget-info-btn" id="supportWidgetInfoBtn" title="Connection Info">
              <i class="fas fa-info-circle"></i>
            </button>
            <button class="support-widget-control-btn support-widget-test-btn" id="supportWidgetTestBtn" title="Test Text Streams">
              <i class="fas fa-vial"></i>
            </button>
          </div>
        </div>
        <div class="support-widget-footer">
          <div class="support-widget-room-info" id="supportWidgetRoomInfo">
            <span class="support-widget-room-label">Room:</span>
            <span class="support-widget-room-id" id="supportWidgetRoomId">-</span>
          </div>
        </div>
        <div class="support-widget-loading-overlay" id="supportWidgetLoadingOverlay">
          <div class="support-widget-loading-spinner">
            <div class="support-widget-spinner"></div>
            <p>Connecting to AI Agent...</p>
          </div>
        </div>
        <div class="support-widget-modal" id="supportWidgetErrorModal" style="display: none;">
          <div class="support-widget-modal-content">
            <div class="support-widget-modal-header">
              <h3>Connection Error</h3>
              <button class="support-widget-close-btn" id="supportWidgetCloseErrorModal">&times;</button>
            </div>
            <div class="support-widget-modal-body">
              <p id="supportWidgetErrorMessage">
                Unable to connect to the voice agent. Please check your internet
                connection and try again.
              </p>
            </div>
            <div class="support-widget-modal-footer">
              <button class="support-widget-btn support-widget-btn-primary" id="supportWidgetRetryBtn">
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(this.widgetContainer);

      // Add event listener for close button
      document.getElementById('supportWidgetCloseBtn').addEventListener('click', () => this.closeWidget());
    }

    applyPositioning() {
      this.widgetContainer.classList.add(`support-widget-position-${this.config.position}`);
      this.floatingButton.classList.add(`support-widget-position-${this.config.position}`);
    }

    applyTheme() {
      const theme = this.config.theme === 'auto' ? 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
        this.config.theme;
      this.widgetContainer.classList.add(`support-widget-theme-${theme}`);
      this.floatingButton.classList.add(`support-widget-theme-${theme}`);
    }

    injectCustomStyles() {
      if (Object.keys(this.config.customColors).length === 0) return;

      let styleTag = document.getElementById('support-widget-custom-styles');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'support-widget-custom-styles';
        document.head.appendChild(styleTag);
      }

      let customCss = `:root {`;
      if (this.config.customColors.primary) {
        customCss += `--support-widget-primary-color: ${this.config.customColors.primary};`;
      }
      if (this.config.customColors.secondary) {
        customCss += `--support-widget-secondary-color: ${this.config.customColors.secondary};`;
      }
      customCss += `}`;
      
      // Apply custom colors to relevant elements
      customCss += `
        .support-widget-header,
        .support-widget-send-btn,
        .support-widget-btn-primary,
        .support-widget-floating-btn {
          background: var(--support-widget-primary-color, #667eea);
        }
        .support-widget-mic-btn.active,
        .support-widget-info-btn {
          background: var(--support-widget-primary-color, #667eea);
        }
        .support-widget-agent-message {
          border-left-color: var(--support-widget-primary-color, #667eea);
        }
        .support-widget-user-message {
          background: linear-gradient(135deg, var(--support-widget-primary-color, #667eea), var(--support-widget-secondary-color, #764ba2));
        }
      `;
      styleTag.textContent += customCss;
    }

    toggleWidget() {
      if (this.isOpen) {
        this.closeWidget();
      } else {
        this.openWidget();
      }
    }

    openWidget() {
      this.widgetContainer.classList.add('active');
      this.floatingButton.classList.add('hidden');
      this.isOpen = true;
      document.body.classList.add('support-widget-no-scroll'); // Prevent host page scrolling
      this.voiceAgentClient.connect(); // Connect when widget opens
      this.config.callbacks.onOpen();
    }

    closeWidget() {
      this.widgetContainer.classList.remove('active');
      this.floatingButton.classList.remove('hidden');
      this.isOpen = false;
      document.body.classList.remove('support-widget-no-scroll'); // Allow host page scrolling
      this.voiceAgentClient.disconnect(); // Disconnect when widget closes
      this.config.callbacks.onClose();
    }
  }

  // --- VoiceAgentClient (Adapted for Widget) ---
  class VoiceAgentClient {
    constructor(widgetRoot, backendUrl, widgetTitle) {
      this.widgetRoot = widgetRoot;
      this.backendUrl = backendUrl;
      this.widgetTitle = widgetTitle;
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

      this.agentDetectionMethods = {
        livekitEvents: true,
        audioTrackAnalysis: false,
        audioOutputFallback: false,
      };

      this.agentSpeakingStartTime = null;
      this.lastAgentAudioLevel = 0;
      this.silenceDetectionTimeout = null;
      this.agentTimeoutFallback = null;
      this.silenceThreshold = 0.02;
      this.silenceDuration = 2000;
      this.maxSpeakingDuration = 30000;

      this.riveInstance = null;
      this.riveSpeakingInput = null;
      this.riveListeningInput = null;

      // DOM elements (scoped to widgetRoot)
      this.statusIndicator = widgetRoot.querySelector("#supportWidgetStatusIndicator");
      this.statusText = widgetRoot.querySelector("#supportWidgetStatusText");
      this.userIndicator = widgetRoot.querySelector("#supportWidgetUserIndicator");
      this.agentIndicator = widgetRoot.querySelector("#supportWidgetAgentIndicator");
      this.userAudioLevel = widgetRoot.querySelector("#supportWidgetUserAudioLevel");
      this.agentAudioLevel = widgetRoot.querySelector("#supportWidgetAgentAudioLevel");
      this.micBtn = widgetRoot.querySelector("#supportWidgetMicBtn");
      this.speakerBtn = widgetRoot.querySelector("#supportWidgetSpeakerBtn");
      this.infoBtn = widgetRoot.querySelector("#supportWidgetInfoBtn");
      this.roomId = widgetRoot.querySelector("#supportWidgetRoomId");
      this.loadingOverlay = widgetRoot.querySelector("#supportWidgetLoadingOverlay");
      this.errorModal = widgetRoot.querySelector("#supportWidgetErrorModal");
      this.errorMessage = widgetRoot.querySelector("#supportWidgetErrorMessage");
      this.retryBtn = widgetRoot.querySelector("#supportWidgetRetryBtn");
      this.closeErrorModal = widgetRoot.querySelector("#supportWidgetCloseErrorModal");
      this.userTranscription = widgetRoot.querySelector("#supportWidgetUserTranscription");
      this.agentTranscription = widgetRoot.querySelector("#supportWidgetAgentTranscription");
      this.userText = widgetRoot.querySelector("#supportWidgetUserText");
      this.agentText = widgetRoot.querySelector("#supportWidgetAgentText");
      this.emptyState = widgetRoot.querySelector("#supportWidgetEmptyState");
      this.textInput = widgetRoot.querySelector("#supportWidgetTextInput");
      this.sendBtn = widgetRoot.querySelector("#supportWidgetSendBtn");
      this.testBtn = widgetRoot.querySelector("#supportWidgetTestBtn");
      this.riveCanvas = widgetRoot.querySelector("#supportWidgetRiveCanvas");

      this.init();
    }

    async init() {
      this.setupEventListeners();
      this.setupRiveAnimation();
    }

    setupEventListeners() {
      this.micBtn.addEventListener("click", () => this.toggleMicrophone());
      this.speakerBtn.addEventListener("click", () => this.toggleSpeaker());
      this.infoBtn.addEventListener("click", () => this.showConnectionInfo());
      this.testBtn.addEventListener("click", () => this.testTextStreams());

      this.sendBtn.addEventListener("click", () => this.handleTextInput());
      this.textInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleTextInput();
        }
      });

      this.retryBtn.addEventListener("click", () => this.retryConnection());
      this.closeErrorModal.addEventListener("click", () => this.hideErrorModal());

      document.addEventListener("keydown", (e) => {
        if (e.code === "Space" && e.ctrlKey) {
          e.preventDefault();
          this.toggleMicrophone();
        }
        if (e.code === "KeyM" && e.ctrlKey) {
          e.preventDefault();
          this.toggleSpeaker();
        }
        if (e.code === "KeyT" && e.ctrlKey) {
          e.preventDefault();
          this.textInput.focus();
        }
      });

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.pauseAudioLevelMonitoring();
        } else {
          this.resumeAudioLevelMonitoring();
        }
      });

      window.addEventListener("beforeunload", () => {
        this.disconnect();
      });
    }

    async fetchToken() {
      try {
        const response = await fetch(`${this.backendUrl}/get-token`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.token = data.token;
        this.roomName = data.room;
        this.identity = data.identity;
        this.wsURL = data.url;

        console.log("Token fetched successfully:", {
          room: this.roomName,
          identity: this.identity,
        });
        return data;
      } catch (error) {
        console.error("Failed to fetch token:", error);
        throw new Error("Failed to get authentication token");
      }
    }

    async connect() {
      try {
        this.updateStatus("connecting", "Connecting to AI Agent...");
        this.showLoadingOverlay();

        await this.fetchToken();

        this.room = new LivekitClient.Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: LivekitClient.VideoPresets.h720.resolution,
          },
        });

        this.setupRoomEventListeners();

        await this.room.connect(this.wsURL, this.token);

        this.setupTextStreamHandlers();

        await this.enableMicrophone();

        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateStatus("connected", "Connected to AI Agent");
        this.updateRoomInfo();
        this.hideLoadingOverlay();

        console.log("Successfully connected to room:", this.roomName);
      } catch (error) {
        console.error("Connection failed:", error);
        this.handleConnectionError(error);
      }
    }

    setupRoomEventListeners() {
      this.room
        .on(LivekitClient.RoomEvent.Connected, () => {
          console.log("Room connected");
          this.isConnected = true;
          this.updateStatus("connected", "Connected to AI Agent");
        })
        .on(LivekitClient.RoomEvent.Disconnected, (reason) => {
          console.log("Room disconnected:", reason);
          this.handleDisconnection(reason);
        })
        .on(
          LivekitClient.RoomEvent.TrackSubscribed,
          (track, publication, participant) => {
            this.handleTrackSubscribed(track, publication, participant);
          }
        )
        .on(
          LivekitClient.RoomEvent.TrackUnsubscribed,
          (track, publication, participant) => {
            this.handleTrackUnsubscribed(track, publication, participant);
          }
        )
        .on(
          LivekitClient.RoomEvent.LocalTrackPublished,
          (publication, participant) => {
            console.log("Local track published:", publication.source);
            if (publication.source === LivekitClient.Track.Source.Microphone) {
              this.localAudioTrack = publication.track;
              this.startAudioLevelMonitoring();
            }
          }
        )
        .on(
          LivekitClient.RoomEvent.LocalTrackUnpublished,
          (publication, participant) => {
            console.log("Local track unpublished:", publication.source);
          }
        )
        .on(LivekitClient.RoomEvent.ActiveSpeakersChanged, (speakers) => {
          this.handleActiveSpeakersChanged(speakers);
        })
        .on(
          LivekitClient.RoomEvent.ConnectionQualityChanged,
          (quality, participant) => {
            console.log(
              "Connection quality changed:",
              quality,
              participant?.identity
            );
          }
        )
        .on(LivekitClient.RoomEvent.MediaDevicesError, (error) => {
          console.error("Media device error:", error);
          this.handleMediaDeviceError(error);
        });
    }

    async enableMicrophone() {
      try {
        await this.room.localParticipant.setMicrophoneEnabled(true);
        this.micBtn.classList.add("active");
        this.isMicMuted = false;

        try {
          await this.setupAudioAnalysis();
          console.log("Microphone enabled with audio analysis");
        } catch (audioError) {
          console.warn(
            "Audio analysis setup failed, will retry on user interaction:",
            audioError
          );
        }
      } catch (error) {
        console.error("Failed to enable microphone:", error);
        this.handleMediaDeviceError(error);
      }
    }

    async setupAudioAnalysis() {
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
        }

        if (this.audioContext.state === "suspended") {
          await this.audioContext.resume();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        this.userAudioAnalyser = this.audioContext.createAnalyser();
        this.userAudioAnalyser.fftSize = 256;
        this.userAudioAnalyser.smoothingTimeConstant = 0.8;

        this.userAudioSource = this.audioContext.createMediaStreamSource(stream);
        this.userAudioSource.connect(this.userAudioAnalyser);

        await this.setupOutputAudioDetection();

        console.log("Audio analysis setup complete");
      } catch (error) {
        console.error("Failed to setup audio analysis:", error);
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

      if (normalized < 0.005 && maxNormalized < 0.02) {
        return 0;
      }

      return normalized;
    }

    getOutputAudioLevel() {
      const audioElements = document.querySelectorAll("audio");
      let maxLevel = 0;

      audioElements.forEach((audio) => {
        if (!audio.paused && !audio.ended && audio.currentTime > 0) {
          if (audio.readyState >= 2 && audio.duration > 0) {
            const timeSinceLastUpdate = Date.now() - (audio._lastUpdateTime || 0);
            if (timeSinceLastUpdate < 500) {
              const estimatedLevel = audio.volume * 0.5;
              maxLevel = Math.max(maxLevel, estimatedLevel);
            }
          }
        }
        audio._lastUpdateTime = Date.now();
      });

      return maxLevel > 0.03 ? maxLevel : 0;
    }

    async setupAgentAudioAnalysis(audioTrack) {
      try {
        if (!this.audioContext || !this.agentDetectionMethods.audioTrackAnalysis)
          return;

        this.agentAudioAnalyser = this.audioContext.createAnalyser();
        this.agentAudioAnalyser.fftSize = 256;
        this.agentAudioAnalyser.smoothingTimeConstant = 0.8;

        const audioElement = audioTrack.attach();

        this.agentAudioSource =
          this.audioContext.createMediaElementSource(audioElement);
        this.agentAudioSource.connect(this.agentAudioAnalyser);
        this.agentAudioSource.connect(this.audioContext.destination);

        console.log("Agent audio analysis setup complete");
      } catch (error) {
        console.error("Failed to setup agent audio analysis:", error);
      }
    }

    async setupOutputAudioDetection() {
      try {
        if (!this.audioContext || !this.agentDetectionMethods.audioOutputFallback)
          return;

        this.outputAudioAnalyser = this.audioContext.createAnalyser();
        this.outputAudioAnalyser.fftSize = 256;
        this.outputAudioAnalyser.smoothingTimeConstant = 0.8;

        if (this.agentDetectionMethods.audioOutputFallback) {
          this.setupGlobalAudioMonitoring();
        }

        console.log("Output audio detection setup complete");
      } catch (error) {
        console.error("Failed to setup output audio detection:", error);
      }
    }

    setupGlobalAudioMonitoring() {
      console.log("Global Audio Monitor - DISABLED (using LiveKit events only)");
    }

    async toggleMicrophone() {
      try {
        if (this.isMicMuted) {
          await this.room.localParticipant.setMicrophoneEnabled(true);
          this.micBtn.classList.remove("support-widget-muted");
          this.micBtn.classList.add("support-widget-active");
          this.userIndicator.classList.remove("support-widget-muted");
          this.isMicMuted = false;

          if (!this.audioContext) {
            await this.setupAudioAnalysis();
          }

          console.log("Microphone unmuted");
        } else {
          await this.room.localParticipant.setMicrophoneEnabled(false);
          this.micBtn.classList.remove("support-widget-active");
          this.micBtn.classList.add("support-widget-muted");
          this.userIndicator.classList.add("support-widget-muted");
          this.isMicMuted = true;
          console.log("Microphone muted");
        }
      } catch (error) {
        console.error("Failed to toggle microphone:", error);
      }
    }

    toggleSpeaker() {
      if (this.isSpeakerMuted) {
        this.room.remoteParticipants.forEach((participant) => {
          participant.audioTrackPublications.forEach((pub) => {
            if (pub.track) {
              pub.track.setVolume(1.0);
            }
          });
        });
        this.speakerBtn.classList.remove("support-widget-muted");
        this.agentIndicator.classList.remove("support-widget-muted");
        this.isSpeakerMuted = false;
        console.log("Speaker unmuted");
      } else {
        this.room.remoteParticipants.forEach((participant) => {
          participant.audioTrackPublications.forEach((pub) => {
            if (pub.track) {
              pub.track.setVolume(0.0);
            }
          });
        });
        this.speakerBtn.classList.add("support-widget-muted");
        this.agentIndicator.classList.add("support-widget-muted");
        this.isSpeakerMuted = true;
        console.log("Speaker muted");
      }
    }

    handleTrackSubscribed(track, publication, participant) {
      console.log("Track subscribed:", track.kind, participant.identity);

      if (track.kind === LivekitClient.Track.Kind.Audio) {
        this.remoteAudioTrack = track;

        const audioElement = track.attach();
        audioElement.autoplay = true;
        audioElement.volume = this.isSpeakerMuted ? 0.0 : 1.0;

        audioElement.style.display = "none";
        document.body.appendChild(audioElement);

        if (this.agentDetectionMethods.audioTrackAnalysis) {
          this.setupAgentAudioAnalysis(track);
        }

        this.startAgentAudioLevelMonitoring();

        console.log("Remote audio track attached with agent detection");
      }
    }

    setupAudioElementDetection(audioElement) {
      try {
        audioElement.addEventListener("play", () => {
          console.log("Agent audio started playing");
          this.setAgentSpeaking(true, "audio-element-play");
        });

        audioElement.addEventListener("pause", () => {
          console.log("Agent audio paused");
          this.setAgentSpeaking(false, "audio-element-pause");
        });

        audioElement.addEventListener("ended", () => {
          console.log("Agent audio ended");
          this.setAgentSpeaking(false, "audio-element-ended");
        });

        console.log("Audio element detection setup complete");
      } catch (error) {
        console.error("Failed to setup audio element detection:", error);
      }
    }

    handleTrackUnsubscribed(track, publication, participant) {
      console.log("Track unsubscribed:", track.kind, participant.identity);

      if (track.kind === LivekitClient.Track.Kind.Audio) {
        const audioElements = track.detach();
        audioElements.forEach((element) => {
          if (element._volumeCheckInterval) {
            clearInterval(element._volumeCheckInterval);
          }
          element.remove();
        });

        this.remoteAudioTrack = null;
        this.agentAudioAnalyser = null;
        this.agentAudioSource = null;
        this.agentIndicator.classList.remove("support-widget-speaking");

        if (this.agentAudioLevelInterval) {
          clearInterval(this.agentAudioLevelInterval);
          this.agentAudioLevelInterval = null;
        }

        console.log("Agent audio track cleaned up");
      }
    }

    handleActiveSpeakersChanged(speakers) {
      if (this.agentDetectionMethods.livekitEvents) {
        let userSpeaking = false;
        let agentSpeaking = false;

        speakers.forEach((speaker) => {
          if (speaker.identity === this.identity) {
            userSpeaking = true;
          } else {
            agentSpeaking = true;
          }
        });

        if (userSpeaking) {
          this.userIndicator.classList.add("support-widget-speaking");
          console.log("User speaking detected via LiveKit events");
          if (this.riveListeningInput) this.riveListeningInput.value = true;
        } else {
          this.userIndicator.classList.remove("support-widget-speaking");
          console.log("User stopped speaking via LiveKit events");
          if (this.riveListeningInput) this.riveListeningInput.value = false;
        }

        if (agentSpeaking) {
          this.setAgentSpeaking(true, "livekit-events");
          if (this.riveSpeakingInput) this.riveSpeakingInput.value = true;
        } else {
          this.setAgentSpeaking(false, "livekit-events");
          if (this.riveSpeakingInput) this.riveSpeakingInput.value = false;
        }
      } else {
        let userSpeaking = false;
        speakers.forEach((speaker) => {
          if (speaker.identity === this.identity) {
            userSpeaking = true;
          }
        });

        if (userSpeaking) {
          this.userIndicator.classList.add("support-widget-speaking");
          if (this.riveListeningInput) this.riveListeningInput.value = true;
        } else {
          this.userIndicator.classList.remove("support-widget-speaking");
          if (this.riveListeningInput) this.riveListeningInput.value = false;
        }
      }
    }

    setupTextStreamHandlers() {
      this.room.registerTextStreamHandler(
        "lk.transcription",
        async (reader, participantInfo) => {
          try {
            const message = await reader.readAll();
            console.log(
              "Transcription received:",
              message,
              "from:",
              participantInfo.identity
            );

            if (reader.info.attributes?.["lk.transcribed_track_id"]) {
              console.log(
                `Voice transcription from ${participantInfo.identity}: ${message}`
              );

              const isUser = participantInfo.identity === this.identity;
              this.updateTranscription(message, isUser);
            } else {
              console.log(
                `Text message from ${participantInfo.identity}: ${message}`
              );
              this.updateTranscription(message, false);
            }
          } catch (error) {
            console.error("Error handling transcription stream:", error);
          }
        }
      );

      this.room.registerTextStreamHandler(
        "lk.chat",
        async (reader, participantInfo) => {
          try {
            const message = await reader.readAll();
            console.log(
              "Chat message received:",
              message,
              "from:",
              participantInfo.identity
            );

            if (participantInfo.identity !== this.identity) {
              this.updateTranscription(message, false);
            }
          } catch (error) {
            console.error("Error handling chat stream:", error);
          }
        }
      );

      console.log(
        "Text stream handlers registered for topics: lk.transcription, lk.chat"
      );
    }

    testTextStreams() {
      console.log("Testing text streams...");
      this.sendTextMessage("Test message from frontend");
      setTimeout(() => {
        this.updateTranscription("Test transcription display", false);
      }, 1000);
    }

    handleTextInput() {
      const text = this.textInput.value.trim();
      if (!text || !this.isConnected) return;

      this.sendTextMessage(text);
      this.updateTranscription(text, true);
      this.clearTextInput();
    }

    async sendTextMessage(text) {
      try {
        if (!this.room || !this.isConnected) {
          console.warn("Cannot send text message: not connected to room");
          return;
        }

        const info = await this.room.localParticipant.sendText(text, {
          topic: "lk.chat",
        });

        console.log("Text message sent:", text, "info:", info);
      } catch (error) {
        console.error("Failed to send text message:", error);
        this.showErrorModal("Failed to send message. Please try again.");
      }
    }

    clearTextInput() {
      this.textInput.value = "";
      this.textInput.focus();
    }

    updateTranscription(text, isUser) {
      this.emptyState.style.display = "none";

      const shouldFadePrevious = this.shouldFadePreviousMessages(text, isUser);

      if (shouldFadePrevious) {
        if (this.userTranscription.style.display === "block") {
          this.userTranscription.classList.add("support-widget-fadeOut");
          setTimeout(() => {
            this.userTranscription.style.display = "none";
            this.userTranscription.classList.remove("support-widget-fadeOut");
          }, 500);
        }
        if (this.agentTranscription.style.display === "block") {
          this.agentTranscription.classList.add("support-widget-fadeOut");
          setTimeout(() => {
            this.agentTranscription.style.display = "none";
            this.agentTranscription.classList.remove("support-widget-fadeOut");
          }, 500);
        }

        setTimeout(() => {
          this.displayMessage(text, isUser);
        }, 500);
      } else {
        this.displayMessage(text, isUser);
      }
    }

    shouldFadePreviousMessages(text, isUser) {
      const userVisible = this.userTranscription.style.display === "block";
      const agentVisible = this.agentTranscription.style.display === "block";

      return userVisible && agentVisible;
    }

    displayMessage(text, isUser) {
      if (isUser) {
        this.userText.textContent = text;
        this.userTranscription.style.display = "block";
        this.userTranscription.classList.remove("support-widget-fadeOut");
      } else {
        this.agentText.textContent = text;
        this.agentTranscription.style.display = "block";
        this.agentTranscription.classList.remove("support-widget-fadeOut");
      }
    }

    startAudioLevelMonitoring() {
      if (!this.localAudioTrack) return;

      this.audioLevelInterval = setInterval(() => {
        if (this.localAudioTrack && !this.isMicMuted) {
          const userLevel = this.getUserAudioLevel();
          const levelPercentage = userLevel * 100;

          this.userAudioLevel.style.setProperty(
            "--support-widget-audio-level",
            `${levelPercentage}%`
          );

          if (userLevel > 0.1) {
            this.userIndicator.classList.add("support-widget-speaking");
          } else {
            this.userIndicator.classList.remove("support-widget-speaking");
          }
        } else {
          this.userIndicator.classList.remove("support-widget-speaking");
        }
      }, 100);
    }

    startAgentAudioLevelMonitoring() {
      if (!this.remoteAudioTrack) return;

      this.agentAudioLevelInterval = setInterval(() => {
        let agentLevel = 0;

        if (this.agentAudioAnalyser) {
          agentLevel = this.getAgentAudioLevel();
        }

        if (!this.isSpeakerMuted) {
          const levelPercentage = agentLevel * 100;
          this.agentAudioLevel.style.setProperty(
            "--support-widget-audio-level",
            `${levelPercentage}%`
          );
        }
      }, 100);
    }

    setAgentSpeaking(speaking, reason) {
      if (speaking) {
        if (!this.agentIndicator.classList.contains("support-widget-speaking")) {
          this.agentIndicator.classList.add("support-widget-speaking");
          this.agentSpeakingStartTime = Date.now();
          console.log(`Agent speaking started (${reason})`);

          this.clearAgentTimeouts();

          this.agentTimeoutFallback = setTimeout(() => {
            this.setAgentSpeaking(false, "timeout-fallback");
          }, this.maxSpeakingDuration);
        }
      } else {
        if (this.agentIndicator.classList.contains("support-widget-speaking")) {
          this.agentIndicator.classList.remove("support-widget-speaking");
          this.agentSpeakingStartTime = null;
          console.log(`Agent speaking stopped (${reason})`);
          this.clearAgentTimeouts();
        }
      }
    }

    checkAgentSilence() {
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
      this.clearAgentTimeouts();
    }

    resumeAudioLevelMonitoring() {
      this.startAudioLevelMonitoring();
      if (this.remoteAudioTrack) {
        this.startAgentAudioLevelMonitoring();
      }
    }

    handleDisconnection(reason) {
      console.log("Disconnected from room:", reason);
      this.isConnected = false;
      this.updateStatus("disconnected", "Disconnected from AI Agent");

      this.pauseAudioLevelMonitoring();

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(
          `Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
        );

        this.updateStatus(
          "connecting",
          `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );

        setTimeout(() => {
          this.connect();
        }, 2000 * this.reconnectAttempts);
      } else {
        this.showErrorModal(
          "Connection lost and unable to reconnect. Please refresh the page to try again."
        );
      }
    }

    handleConnectionError(error) {
      console.error("Connection error:", error);
      this.isConnected = false;
      this.hideLoadingOverlay();
      this.updateStatus("disconnected", "Connection Failed");

      let errorMessage = "Unable to connect to the AI Agent. ";

      if (error.message.includes("token")) {
        errorMessage += "Authentication failed. Please refresh the page.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("websocket")
      ) {
        errorMessage +=
          "Network connection failed. Please check your internet connection.";
      } else if (error.message.includes("permission")) {
        errorMessage +=
          "Microphone permission denied. Please allow microphone access and refresh.";
      } else {
        errorMessage += "Please check your internet connection and try again.";
      }

      this.showErrorModal(errorMessage);
    }

    handleMediaDeviceError(error) {
      console.error("Media device error:", error);

      let errorMessage = "Unable to access your microphone. ";

      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow microphone access and refresh the page.";
      } else if (error.name === "NotFoundError") {
        errorMessage +=
          "No microphone found. Please connect a microphone and refresh.";
      } else if (error.name === "NotReadableError") {
        errorMessage +=
          "Microphone is being used by another application. Please close other applications and try again.";
      } else {
        errorMessage += "Please check your microphone settings and try again.";
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
      if (this.riveInstance) this.riveInstance.unmount();
      console.log("Disconnected from room");
    }

    updateStatus(status, text) {
      this.statusIndicator.className = `support-widget-status-indicator support-widget-${status}`;
      this.statusText.textContent = text;

      if (status === "connected") {
        this.textInput.disabled = false;
        this.sendBtn.disabled = false;
        this.textInput.placeholder = "Type your message...";
      } else {
        this.textInput.disabled = true;
        this.sendBtn.disabled = true;
        this.textInput.placeholder = "Connecting...";
      }
    }

    updateRoomInfo() {
      if (this.roomName) {
        this.roomId.textContent = this.roomName.split("-").pop();
      }
    }

    showLoadingOverlay() {
      this.loadingOverlay.classList.add("support-widget-active");
      document.body.classList.add("support-widget-no-scroll");
    }

    hideLoadingOverlay() {
      this.loadingOverlay.classList.remove("support-widget-active");
      document.body.classList.remove("support-widget-no-scroll");
    }

    showErrorModal(message) {
      this.errorMessage.textContent = message;
      this.errorModal.classList.add("support-widget-active");
    }

    hideErrorModal() {
      this.errorModal.classList.remove("support-widget-active");
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
      };

      alert(`Connection Info:\n${JSON.stringify(info, null, 2)}`);
    }

    setupRiveAnimation() {
      if (!this.riveCanvas) {
        console.warn("Rive Canvas element not found. Skipping Rive setup.");
        return;
      }

      this.riveInstance = new rive.Rive({
        src: "/widget/assets/danak.riv", // Path relative to where the widget is served
        canvas: this.riveCanvas,
        autoplay: true,
        stateMachines: "StateMachine",
        onLoad: () => {
          this.riveInstance.resizeDrawingSurfaceToCanvas();
          const inputs = this.riveInstance.stateMachineInputs("StateMachine");
          this.riveSpeakingInput = inputs.find((i) => i.name === "isSpeaking");
          this.riveListeningInput = inputs.find((i) => i.name === "IsListening");
          console.log("Rive animation loaded and inputs found.");
        },
        onError: (error) => {
          console.error("Rive animation failed to load:", error);
        },
      });
    }
  }

  // Add CSS for audio level visualization (scoped)
  const style = document.createElement("style");
  style.textContent = `
      .support-widget-audio-level::after {
          width: var(--support-widget-audio-level, 0%) !important;
      }
  `;
  document.head.appendChild(style);

  // Expose the widget API globally
  window.SupportAgentWidget = {
    init: function(config = {}) {
      if (!window._supportAgentWidgetInstance) {
        window._supportAgentWidgetInstance = new SupportWidget(config);
      } else {
        console.warn("SupportAgentWidget already initialized.");
      }
    },
    open: function() {
      if (window._supportAgentWidgetInstance) {
        window._supportAgentWidgetInstance.openWidget();
      } else {
        console.warn("SupportAgentWidget not initialized. Call init() first.");
      }
    },
    close: function() {
      if (window._supportAgentWidgetInstance) {
        window._supportAgentWidgetInstance.closeWidget();
      } else {
        console.warn("SupportAgentWidget not initialized. Call init() first.");
      }
    }
  };

  // Auto-initialize if script is loaded without explicit init call (optional, but good for quick tests)
  document.addEventListener('DOMContentLoaded', () => {
    if (!window._supportAgentWidgetInstance) {
      window.SupportAgentWidget.init();
    }
  });

})();
