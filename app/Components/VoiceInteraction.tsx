import React, { useState, useEffect } from 'react';

interface VoiceInteractionProps {
  onTranscriptUpdate: (transcript: string) => void;
  onCartUpdate: (action: 'add' | 'remove', item: string) => void;
}

const VoiceInteraction: React.FC<VoiceInteractionProps> = ({
  onTranscriptUpdate,
  onCartUpdate,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result) => result.transcript)
            .join('');

          onTranscriptUpdate(transcript);

          // Process voice commands
          const lowerTranscript = transcript.toLowerCase();
          if (lowerTranscript.includes('add')) {
            const items = ['burger', 'cheeseburger', 'milkshake', 'cookies', 'mozzarella sticks'];
            for (const item of items) {
              if (lowerTranscript.includes(item)) {
                onCartUpdate('add', item);
              }
            }
          } else if (lowerTranscript.includes('remove')) {
            const items = ['burger', 'cheeseburger', 'milkshake', 'cookies', 'mozzarella sticks'];
            for (const item of items) {
              if (lowerTranscript.includes(item)) {
                onCartUpdate('remove', item);
              }
            }
          }
        };

        setRecognition(recognition);
      }
    }
  }, [onTranscriptUpdate, onCartUpdate]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggleListening}
        className={`p-4 rounded-full ${
          isListening ? 'bg-red-500' : 'bg-purple-600'
        } text-white transition-colors`}
      >
        {isListening ? '🎤 Stop' : '🎤 Start'}
      </button>
      <p className="mt-2 text-sm text-gray-500">
        {isListening ? 'Listening...' : 'Click to start voice commands'}
      </p>
    </div>
  );
};

export default VoiceInteraction;
