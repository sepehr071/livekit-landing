class ChatClient {
    constructor() {
        // Chat mode properties
        this.isStreaming = false;
        this.currentStreamingMessage = '';
        
        // DOM elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.agentSpeechBubble = document.getElementById('agentSpeechBubble');
        this.userInputBubble = document.getElementById('userInputBubble');
        this.agentText = document.getElementById('agentText');
        this.userText = document.getElementById('userText');
        this.chatInput = document.getElementById('chatInput');
        this.voiceModeBtn = document.getElementById('voiceModeBtn');
        this.emptyState = document.getElementById('emptyState');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
        this.closeErrorModal = document.getElementById('closeErrorModal');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadConversation();
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
        }
        
        // Voice mode navigation
        if (this.voiceModeBtn) {
            this.voiceModeBtn.addEventListener('click', () => {
                window.location.href = '/voice';
            });
        }
        
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
    }
    
    async handleChatInput() {
        const text = this.chatInput.value.trim();
        if (!text || this.isStreaming) return;
        
        // Show user message
        this.displayMessage(text, true);
        
        // Clear input
        this.chatInput.value = '';
        
        // Send to OpenRouter API
        await this.sendChatMessage(text);
    }
    
    async sendChatMessage(message) {
        try {
            this.isStreaming = true;
            this.currentStreamingMessage = '';
            this.showLoadingOverlay();
            
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
            
            // Hide loading and prepare for streaming
            this.hideLoadingOverlay();
            
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
            this.showErrorModal('Sorry, I encountered an error. Please try again.');
        } finally {
            this.isStreaming = false;
            this.hideLoadingOverlay();
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
        // Final update of agent message
        this.updateAgentMessage(text);
        
        // Auto-hide after longer delay for final message
        setTimeout(() => {
            if (this.agentSpeechBubble) {
                this.agentSpeechBubble.style.display = 'none';
            }
        }, 10000);
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
        this.hideLoadingOverlay();
    }
    
    hideErrorModal() {
        if (this.errorModal) {
            this.errorModal.style.display = 'none';
        }
    }
}

// Initialize the chat client when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Chat Client...');
    window.chatClient = new ChatClient();
});