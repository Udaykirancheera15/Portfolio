// Initialize Snoopy Chat
function initSnoopyChat() {
    const snoopyToggle = document.getElementById('snoopy-toggle');
    const snoopyChat = document.getElementById('snoopy-chat');
    const snoopyHeader = document.getElementById('snoopy-header');
    const snoopyMinimize = document.getElementById('snoopy-minimize');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const voiceButton = document.getElementById('voice-button');
    const voiceIndicator = document.getElementById('voice-indicator');
    const chatMessages = document.getElementById('chat-messages');
    
    let chatOpen = false;
    let isRecording = false;
    let recognitionActive = false;
    let recognition;
    
    // Setup speech recognition if available
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            stopVoiceRecording();
            // Auto-send after voice input
            setTimeout(() => sendMessage(), 500);
        };
        
        recognition.onend = function() {
            recognitionActive = false;
            stopVoiceRecording();
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            stopVoiceRecording();
        };
    } else {
        voiceButton.style.display = 'none';
    }
    
    function toggleChat() {
        chatOpen = !chatOpen;
        snoopyChat.style.transform = chatOpen ? 'translateY(0)' : 'translateY(100%)';
        
        if (chatOpen) {
            chatInput.focus();
        }
    }
    
    function startVoiceRecording() {
        if (recognition && !recognitionActive) {
            isRecording = true;
            voiceIndicator.classList.remove('hidden');
            voiceButton.innerHTML = '<i class="fas fa-stop"></i>';
            voiceButton.classList.add('text-red-500');
            
            try {
                recognition.start();
                recognitionActive = true;
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                stopVoiceRecording();
            }
        }
    }
    
    function stopVoiceRecording() {
        isRecording = false;
        voiceIndicator.classList.add('hidden');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceButton.classList.remove('text-red-500');
        
        if (recognition && recognitionActive) {
            try {
                recognition.stop();
                recognitionActive = false;
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
            }
        }
    }
    
    function toggleVoiceRecording() {
        if (isRecording) {
            stopVoiceRecording();
        } else {
            startVoiceRecording();
        }
    }
    
    function addMessageToChat(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message chat-message' : 'bot-message chat-message';
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'bot-message chat-message flex items-center';
        loadingDiv.id = 'loading-message';
        loadingDiv.innerHTML = `
            <div class="recording-wave mr-2">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <p>Thinking...</p>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function removeLoading() {
        const loadingDiv = document.getElementById('loading-message');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addMessageToChat(message, true);
        chatInput.value = '';
        
        // Show loading indicator
        showLoading();
        
        // Use Poe API to send the message to Claude for processing
        if (window.Poe) {
            // Register handler for snoopy responses
            window.Poe.registerHandler("snoopy-handler", (result) => {
                removeLoading();
                
                if (result.status === "error") {
                    addMessageToChat("Sorry, I encountered an error. Please try again.", false);
                    return;
                }
                
                const msg = result.responses[0];
                
                if (msg.status === "incomplete") {
                    // For streaming responses, we could update the message in real-time
                    // But for simplicity, we'll wait for the complete message
                } else if (msg.status === "complete") {
                    // Add the bot's response to the chat
                    addMessageToChat(msg.content, false);
                }
            });
            
            // Send the message to Claude
            try {
                window.Poe.sendUserMessage("@Claude-3.7-Sonnet You are Snoopy, John's personal AI assistant. John is a blockchain developer with experience in Ethereum, Solana, DeFi, NFTs, and DAOs. Based on the portfolio content, answer this question: " + message, {
                    handler: "snoopy-handler",
                    stream: true,
                    openChat: false
                });
            } catch (err) {
                removeLoading();
                addMessageToChat("Sorry, I couldn't send your message. Please try again later.", false);
                console.error("Error sending message:", err);
            }
        } else {
            // Fallback for testing outside of Poe
            setTimeout(() => {
                removeLoading();
                let response = "I'm Snoopy, John's personal AI assistant. Unfortunately, I can't access my full capabilities outside the Poe platform. When properly set up, I can tell you all about John's blockchain expertise and projects!";
                addMessageToChat(response, false);
            }, 1000);
        }
    }
    
    // Event listeners
    snoopyToggle.addEventListener('click', () => {
        toggleChat();
    });
    
    snoopyHeader.addEventListener('click', (e) => {
        if (e.target !== snoopyMinimize && e.target !== snoopyMinimize.querySelector('i')) {
            toggleChat();
        }
    });
    
    snoopyMinimize.addEventListener('click', () => {
        toggleChat();
    });
    
    sendButton.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    voiceButton.addEventListener('click', toggleVoiceRecording);
}

// Initialize Snoopy when the DOM is ready
document.addEventListener('DOMContentLoaded', initSnoopyChat);
