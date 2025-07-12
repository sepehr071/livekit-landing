class ChatClient {
    constructor() {
        // Chat mode properties
        this.isStreaming = false;
        this.currentStreamingMessage = '';
        // Rive animation properties
        this.riveInstance = null;
        
        // DOM elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.agentSpeechBubble = document.getElementById('agentSpeechBubble');
        this.userInputBubble = document.getElementById('userInputBubble');
        this.agentText = document.getElementById('agentText');
        this.userText = document.getElementById('userText');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.voiceModeBtn = document.getElementById('voiceModeBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.emptyState = document.getElementById('emptyState');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
        this.closeErrorModal = document.getElementById('closeErrorModal');
        
        // rive
        this.riveCanvas = document.getElementById('riveCanvas');

        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupRiveAnimation(); // Call the new Rive setup method
        this.showWelcomeMessage();
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
                console.log('Rive animation loaded and inputs found.');
            },
            onError: (error) => {
                console.error('Rive animation failed to load:', error);
            },
        });
    }

    
    setupEventListeners() {
        // Chat input handling
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleChatInput();
                }
            });
            
            // Handle input changes to enable/disable send button
            this.chatInput.addEventListener('input', () => {
                this.updateSendButton();
            });
        }
        
        // Send button handling
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => {
                this.handleChatInput();
            });
        }
        
        // Voice mode navigation
        if (this.voiceModeBtn) {
            this.voiceModeBtn.addEventListener('click', () => {
                window.location.href = '/voice';
            });
        }
        
        // Fullscreen button
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Handle fullscreen change
        document.addEventListener('fullscreenchange', () => {
            this.updateFullscreenButton();
        });
        
        // Error modal controls
        if (this.retryBtn) {
            this.retryBtn.addEventListener('click', () => this.hideErrorModal());
        }
        if (this.closeErrorModal) {
            this.closeErrorModal.addEventListener('click', () => this.hideErrorModal());
        }
        
        // Focus on chat input
        if (this.chatInput) {
            this.chatInput.focus();
        }
        
        // Initialize send button state
        this.updateSendButton();
    }
    
    async handleChatInput() {
        const text = this.chatInput.value.trim();
        if (!text || this.isStreaming) return;
        
        // Clear input
        this.chatInput.value = '';
        
        // Update send button state
        this.updateSendButton();
        
        // Show thinking animation IMMEDIATELY
        this.showThinkingAnimation();
        
        // Send to OpenRouter API
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
                            
                            // Handle OpenRouter streaming response
                            if (parsed.content) {
                                // On first content, hide thinking animation
                                if (this.currentStreamingMessage === '') {
                                    this.hideThinkingAnimation();
                                }
                                
                                this.currentStreamingMessage += parsed.content;
                                this.updateAgentMessage(this.currentStreamingMessage);
                            }
                            
                            // Handle completion
                            if (parsed.done) {
                                this.isStreaming = false;
                                this.finalizeAgentMessage(parsed.full_message || this.currentStreamingMessage);
                                return;
                            }
                            
                            // Handle errors
                            if (parsed.error) {
                                console.error('OpenRouter error:', parsed.error);
                                this.hideThinkingAnimation();
                                this.showErrorModal('Sorry, I encountered an error. Please try again.');
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
            this.hideThinkingAnimation();
            this.showErrorModal('Sorry, I encountered an error. Please try again.');
        } finally {
            this.isStreaming = false;
            this.updateSendButton();
        }
    }
    
    displayMessage(text, isUser) {
        // Hide empty state
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        
        if (isUser) {
            // Show user message bubble
            if (this.userText) {
                this.userText.textContent = text;
            }
            if (this.userInputBubble) {
                this.userInputBubble.style.display = 'block';
                this.userInputBubble.style.visibility = 'visible';
                
                // Auto-hide user bubble after 4 seconds
                setTimeout(() => {
                    this.userInputBubble.style.display = 'none';
                }, 4000);
            }
        } else {
            // Show agent message bubble
            if (this.agentText) {
                this.agentText.textContent = text;
            }
            if (this.agentSpeechBubble) {
                this.agentSpeechBubble.style.display = 'block';
                this.agentSpeechBubble.style.visibility = 'visible';
                
                // Auto-hide agent bubble after 8 seconds
                setTimeout(() => {
                    this.agentSpeechBubble.style.display = 'none';
                }, 8000);
            }
        }
    }
    
    updateAgentMessage(text) {
        // Update agent speech bubble with streaming text
        if (this.agentText) {
            this.agentText.textContent = text;
        }
        if (this.agentSpeechBubble) {
            this.agentSpeechBubble.style.display = 'block';
            this.agentSpeechBubble.style.visibility = 'visible';
        }
    }
    
    finalizeAgentMessage(text) {
        // Final update of agent message - no auto-hide, bubble stays visible
        this.updateAgentMessage(text);
    }
    
    showWelcomeMessage() {
        // Hide empty state and show welcome message
        if (this.emptyState) {
            this.emptyState.style.display = 'none';
        }
        
        if (this.agentText) {
            this.agentText.textContent = 'Hello! I\'m your AI assistant. How can I help you today?';
        }
        if (this.agentSpeechBubble) {
            this.agentSpeechBubble.style.display = 'block';
            this.agentSpeechBubble.style.visibility = 'visible';
        }
    }
    
    showThinkingAnimation() {
        if (this.agentText) {
            this.agentText.innerHTML = 'thinking<span class="dots">...</span>';
        }
        if (this.agentSpeechBubble) {
            this.agentSpeechBubble.style.display = 'block';
            this.agentSpeechBubble.style.visibility = 'visible';
        }
    }

    hideThinkingAnimation() {
        // This will be called when real response starts
        if (this.agentText) {
            this.agentText.innerHTML = '';
        }
    }
    
    updateSendButton() {
        if (this.sendBtn && this.chatInput) {
            const hasText = this.chatInput.value.trim().length > 0;
            this.sendBtn.disabled = !hasText || this.isStreaming;
        }
    }
    
    async loadConversation() {
        try {
            const response = await fetch('/conversation');
            if (response.ok) {
                const data = await response.json();
                
                // Display conversation history (latest messages only)
                if (data.messages && data.messages.length > 0) {
                    const lastUserMessage = data.messages.filter(m => m.role === 'user').slice(-1)[0];
                    const lastAssistantMessage = data.messages.filter(m => m.role === 'assistant').slice(-1)[0];
                    
                    if (lastUserMessage) {
                        this.displayMessage(lastUserMessage.content, true);
                    }
                    if (lastAssistantMessage) {
                        this.displayMessage(lastAssistantMessage.content, false);
                    }
                } else {
                    // Show welcome message for new conversations
                    setTimeout(() => {
                        this.displayMessage('Hello! I\'m your AI assistant. How can I help you today?', false);
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            // Show default welcome message on error
            setTimeout(() => {
                this.displayMessage('Hello! I\'m your AI assistant. How can I help you today?', false);
            }, 1000);
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
}

// Initialize the chat client when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Chat Client...');
    window.chatClient = new ChatClient();
});