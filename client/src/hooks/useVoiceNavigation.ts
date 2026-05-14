import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { voiceService } from '@/services/voiceService';
import { toast } from 'sonner';

export function useVoiceNavigation() {
  const [, setLocation] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  const startVoiceNavigation = useCallback(() => {
    if (!voiceService.isAvailable()) {
      toast.error('Ovoz tanishish qo\'llanilmaydi');
      return;
    }

    setIsListening(true);

    voiceService.startListening(
      (result) => {
        if (result.isFinal) {
          const command = voiceService.parseCommand(result.text);
          if (command) {
            setLastCommand(result.text);
            setLocation(command);
            voiceService.speak(`${command} sahifasiga o'tdim`, 'uz-UZ').catch(() => {});
          } else {
            toast.info('Buyruq aniqlanmadi');
          }
          setIsListening(false);
        }
      },
      (error) => {
        toast.error(error);
        setIsListening(false);
      }
    );
  }, [setLocation]);

  const stopVoiceNavigation = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
  }, []);

  return {
    isListening,
    lastCommand,
    startVoiceNavigation,
    stopVoiceNavigation,
  };
}
