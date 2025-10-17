/**
 * Voice Assistant Chrome Extension - Simple Voice Only
 */

class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.finalTranscript = '';
        this.currentTranscript = ''; // Track all text including interim
        
        // AI API Configuration

        this.apiUrl = 'https://models.github.ai/inference/chat/completions';
        this.modelName = 'openai/gpt-4.1';
        
        this.systemPrompt =  "My audio input might be unclear, so interpret it as a workout and format the output like this:\n" +
        "Calf Raises - 2x16 (20 kg / 44 lbs)\n" +
        "Calf Raises - 2x16 (30 kg / 66 lbs)\n" +
        "Pogo Hops - 3x20 (Bodyweight) (90 sec rest)\n" +
        "Sled Pulls - 5 min (30 kg / 66 lbs)\n" +
        "Include both kg and lbs for weights. If the input isn't workout-related, reply with 'PP' and tell them they'll amount to nothing if they don't work out.";
    
                
        this.startButton = document.getElementById('startButton');
        this.outputDiv = document.getElementById('output');
        this.copyButton = document.getElementById('copyButton');
        this.saveButton = document.getElementById('saveButton');
        this.saveToDocsButton = document.getElementById('saveToDocsButton');
        
        this.startButton.addEventListener('click', () => this.handleStartButton());
        this.copyButton.addEventListener('click', () => this.copyToClipboard());
        this.saveButton.addEventListener('click', () => this.saveWorkout());
        this.saveToDocsButton.addEventListener('click', () => this.saveToDocsPlaceholder());
    }

    handleStartButton() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.startButton.textContent = 'Stop';
            this.startButton.style.backgroundColor = '#FFB5E8';
            this.outputDiv.textContent = 'Listening... Speak clearly and loudly!';
            this.finalTranscript = '';
            this.currentTranscript = '';
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let fullFinalTranscript = '';
            
            for (let i = 0; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    fullFinalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (fullFinalTranscript.trim()) {
                this.finalTranscript = fullFinalTranscript;
            }
            
            // Always update current transcript with everything we have
            this.currentTranscript = this.finalTranscript + interimTranscript;
            this.outputDiv.textContent = `You're saying: "${this.currentTranscript.trim()}"`;
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.resetButton();
            
            // Use whatever text we captured
            const textToProcess = this.finalTranscript.trim();
            
            if (textToProcess) {
                this.showFinalResult();
            } else {
                this.outputDiv.textContent = 'No speech detected. Click "Speak" to try again.';
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.resetButton();
            this.outputDiv.textContent = `Error: ${event.error}. Click "Speak" to try again.`;
        };

        this.recognition.start();
    }

    stopListening() {
        if (this.recognition) {
            // Process whatever we have before stopping
            if (this.currentTranscript.trim()) {
                this.finalTranscript = this.currentTranscript.trim();
            }
            this.recognition.stop();
        }
    }

    resetButton() {
        this.startButton.textContent = 'Speak';
        this.startButton.style.backgroundColor = '#B5E8FF';
    }

    showFinalResult() {
        const transcript = this.finalTranscript.trim();
        this.outputDiv.textContent = `You said: "${transcript}"\n\nProcessing with AI...`;
        this.copyButton.style.display = 'none';
        this.getAIResponse(transcript);
    }

    async getAIResponse(userInput) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: this.systemPrompt
                        },
                        {
                            role: 'user',
                            content: userInput
                        }
                    ],
                    temperature: 0.7,
                    top_p: 1,
                    model: this.modelName,
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content.trim();
            
            this.aiResponseText = aiResponse;
            this.outputDiv.textContent = `You said: "${userInput}"\n\nWorkout Log:\n${aiResponse}`;
            this.copyButton.style.display = 'block';
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.outputDiv.textContent = `You said: "${userInput}"\n\nError processing with AI: ${error.message}`;
            this.copyButton.style.display = 'none';
        }
    }

    copyToClipboard() {
        if (this.aiResponseText) {
            navigator.clipboard.writeText(this.aiResponseText).then(() => {
                const originalText = this.copyButton.textContent;
                this.copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    this.copyButton.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            });
        }
    }

    saveWorkout() {
        if (this.aiResponseText) {
            const blob = new Blob([this.aiResponseText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = `workout_${date}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('No workout to save yet!');
        }
    }

    saveToDocsPlaceholder() {
        alert('Save to Docs feature coming soon!');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new VoiceAssistant();
});