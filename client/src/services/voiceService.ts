/**
 * Voice Service for Uzbek speech-to-text and text-to-speech
 * Handles audio recording, transcription, and voice synthesis
 */

export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceServiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

class VoiceService {
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private currentTranscript: string = '';
  private onResultCallback: ((result: VoiceRecognitionResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
    this.synthesis = window.speechSynthesis;
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.language = 'uz-UZ'; // Uzbek language

    this.recognition.onstart = () => {
      this.isListening = true;
      this.currentTranscript = '';
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          this.currentTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const result: VoiceRecognitionResult = {
        text: this.currentTranscript + interimTranscript,
        confidence: event.results[event.results.length - 1][0].confidence,
        isFinal: event.results[event.results.length - 1].isFinal,
      };

      if (this.onResultCallback) {
        this.onResultCallback(result);
      }
    };

    this.recognition.onerror = (event: any) => {
      const errorMessage = this.getErrorMessage(event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  /**
   * Start listening for voice input
   */
  startListening(onResult: (result: VoiceRecognitionResult) => void, onError: (error: string) => void) {
    if (!this.recognition) {
      onError('Voice recognition not supported in your browser');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.currentTranscript = '';

    try {
      this.recognition.start();
    } catch (error) {
      onError('Failed to start voice recognition');
    }
  }

  /**
   * Stop listening for voice input
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Abort current listening session
   */
  abort() {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Speak text using text-to-speech
   */
  speak(text: string, language: string = 'uz-UZ'): Promise<void> {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      (utterance as any).language = language;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis.speak(utterance);
    });
  }

  /**
   * Check if voice recognition is available
   */
  isAvailable(): boolean {
    return !!this.recognition;
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Get error message from error code
   */
  private getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'no-speech': 'Ovoz aniqlanmadi. Iltimos, qayta urinib ko\'ring.',
      'audio-capture': 'Mikrofon topilmadi yoki ruxsat berilmadi.',
      'network': 'Tarmoq xatosi. Iltimos, internet ulanishingizni tekshiring.',
      'aborted': 'Ovoz tanishish bekor qilindi.',
      'service-not-allowed': 'Ovoz tanishish xizmati ishlamaydi.',
      'bad-grammar': 'Grammarka xatosi.',
      'service-unavailable': 'Ovoz tanishish xizmati mavjud emas.',
    };

    return errorMessages[error] || `Xato: ${error}`;
  }

  /**
   * Parse voice command for navigation
   */
  parseCommand(text: string): string | null {
    const lowerText = text.toLowerCase().trim();

    const commands: Record<string, string> = {
      'bosh sahifa': '/',
      'dashboard': '/',
      'sotuvlar': '/sales',
      'sales': '/sales',
      'ishlab chiqarish': '/production',
      'production': '/production',
      'ingredientlar': '/ingredients',
      'ingredients': '/ingredients',
      'yetkazuvlar': '/delivery',
      'delivery': '/delivery',
      'xarajatlar': '/expenses',
      'expenses': '/expenses',
      'oyliklar': '/salaries',
      'salaries': '/salaries',
      'xaridorlar': '/customers',
      'customers': '/customers',
      'hisobotlar': '/reports',
      'reports': '/reports',
    };

    for (const [command, route] of Object.entries(commands)) {
      if (lowerText.includes(command)) {
        return route;
      }
    }

    return null;
  }

  /**
   * Extract numbers from voice input
   */
  extractNumbers(text: string): number[] {
    const uzbekNumbers: Record<string, number> = {
      'nol': 0,
      'bir': 1,
      'ikki': 2,
      'uch': 3,
      'to\'rt': 4,
      'besh': 5,
      'olti': 6,
      'yetti': 7,
      'sakkiz': 8,
      'to\'qqiz': 9,
      'o\'n': 10,
      'yigirma': 20,
      'o\'ttiz': 30,
      'qirq': 40,
      'ellik': 50,
      'oltmish': 60,
      'yetmish': 70,
      'sakson': 80,
      'to\'qson': 90,
      'yuz': 100,
      'ming': 1000,
    };

    const numbers: number[] = [];
    const words = text.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (uzbekNumbers[word] !== undefined) {
        numbers.push(uzbekNumbers[word]);
      } else if (/^\d+$/.test(word)) {
        numbers.push(parseInt(word, 10));
      }
    }

    return numbers;
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
