import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { voiceService, VoiceRecognitionResult } from '@/services/voiceService';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onComplete?: (text: string) => void;
  placeholder?: string;
  autoSpeak?: boolean;
  language?: string;
}

export default function VoiceInput({
  onTranscript,
  onComplete,
  placeholder = 'Ovozni bosing va gapiring...',
  autoSpeak = true,
  language = 'uz-UZ',
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!voiceService.isAvailable()) {
      setError('Ovoz tanishish sizning brauzeringizda qo\'llanilmaydi');
    }
  }, []);

  const handleStartListening = () => {
    if (!voiceService.isAvailable()) {
      toast.error('Ovoz tanishish qo\'llanilmaydi');
      return;
    }

    setError('');
    setTranscript('');
    setInterimTranscript('');

    voiceService.startListening(
      (result: VoiceRecognitionResult) => {
        setTranscript(result.text.split(/\s+/).slice(0, -1).join(' '));
        setInterimTranscript(result.text.split(/\s+/).pop() || '');
        onTranscript(result.text);

        if (result.isFinal) {
          setIsListening(false);
          if (onComplete) {
            onComplete(result.text);
          }
          if (autoSpeak) {
            voiceService.speak('Tayyor', language).catch(() => {});
          }
        }
      },
      (errorMsg: string) => {
        setError(errorMsg);
        setIsListening(false);
        toast.error(errorMsg);
      }
    );

    setIsListening(true);
  };

  const handleStopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const handleSpeak = async (text: string) => {
    if (!text.trim()) {
      toast.error('Matni kiriting');
      return;
    }

    try {
      await voiceService.speak(text, language);
    } catch (err) {
      toast.error('Ovoz chiqarish xatosi');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          onClick={isListening ? handleStopListening : handleStartListening}
          variant={isListening ? 'destructive' : 'default'}
          size="sm"
          className="gap-2"
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              To'xtat
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Ovozni bosing
            </>
          )}
        </Button>

        {(transcript || interimTranscript) && (
          <Button
            onClick={() => handleSpeak(transcript + interimTranscript)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Eshit
          </Button>
        )}
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <p className="text-sm text-gray-700">
            <span className="font-medium">{transcript}</span>
            <span className="italic text-gray-500">{interimTranscript}</span>
          </p>
        </div>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-blue-600 font-medium">Tinglayapman...</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Placeholder */}
      {!transcript && !interimTranscript && !isListening && (
        <p className="text-xs text-gray-500 italic">{placeholder}</p>
      )}
    </div>
  );
}
