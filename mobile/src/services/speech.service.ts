import * as Speech from 'expo-speech';

export interface SpeakOptions {
  language: 'English' | 'Hindi' | 'Bengali';
  rate?: number;
  onSectionStart: (sectionTitle: string) => void;
  onDone: () => void;
  onError: (error: any) => void;
}

export class SpeechService {
  private isPlaying = false;
  private currentQueue: Array<{ title: string; text: string }> = [];
  private currentQueueIndex = 0;
  private options: SpeakOptions | null = null;
  private activeVoice: string | undefined = undefined;

  async speakQueue(queue: Array<{ title: string; text: string }>, opts: SpeakOptions) {
    this.stop(); // Stop any active speech first
    
    this.isPlaying = true;
    this.currentQueue = [...queue];
    this.currentQueueIndex = 0;
    this.options = opts;

    try {
      this.activeVoice = await this.selectVoiceForLanguage(opts.language);
      this.playNext();
    } catch (err) {
      opts.onError(err);
      this.stop();
    }
  }

  private async playNext() {
    if (!this.isPlaying || this.currentQueueIndex >= this.currentQueue.length) {
      this.isPlaying = false;
      this.options?.onDone();
      return;
    }

    const currentSection = this.currentQueue[this.currentQueueIndex];
    this.options?.onSectionStart(currentSection.title);

    const langCode = this.getLangCode(this.options?.language || 'English');
    const speakText = currentSection.text;

    // Platform-dependent input length check (usually 4000)
    // If text is larger than 3900, we split it into smaller sentence chunks
    if (speakText.length > 3900) {
      const chunks = this.splitIntoChunks(speakText, 3500);
      
      // Inject these chunks into the queue right after the current index
      const queueBefore = this.currentQueue.slice(0, this.currentQueueIndex);
      const queueAfter = this.currentQueue.slice(this.currentQueueIndex + 1);
      
      const newSectionChunks = chunks.map((text, i) => ({
        title: `${currentSection.title} (Part ${i + 1})`,
        text,
      }));

      this.currentQueue = [...queueBefore, ...newSectionChunks, ...queueAfter];
      this.playNext();
      return;
    }

    try {
      await Speech.speak(speakText, {
        language: langCode,
        voice: this.activeVoice,
        rate: this.options?.rate ?? 1.0,
        onDone: () => {
          this.currentQueueIndex++;
          this.playNext();
        },
        onError: (err) => {
          console.error('Speech.speak error callback:', err);
          this.options?.onError(err);
          this.stop();
        },
      });
    } catch (err) {
      this.options?.onError(err);
      this.stop();
    }
  }

  stop() {
    this.isPlaying = false;
    Speech.stop();
    this.currentQueue = [];
    this.currentQueueIndex = 0;
  }

  private getLangCode(lang: 'English' | 'Hindi' | 'Bengali'): string {
    switch (lang) {
      case 'Hindi': return 'hi-IN';
      case 'Bengali': return 'bn-IN';
      default: return 'en-IN';
    }
  }

  private async selectVoiceForLanguage(lang: 'English' | 'Hindi' | 'Bengali'): Promise<string | undefined> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const targetLang = this.getLangCode(lang);
      
      // Try to find exact language code match
      let matchedVoice = voices.find(v => v.language.toLowerCase() === targetLang.toLowerCase());
      
      if (!matchedVoice) {
        // Fallback: match by base language code (e.g. "en" for English)
        const baseLang = targetLang.split('-')[0].toLowerCase();
        matchedVoice = voices.find(v => v.language.toLowerCase().startsWith(baseLang));
      }

      if (!matchedVoice) {
        console.warn(`Voice not found for ${lang}. Falling back to default voice.`);
      }

      return matchedVoice?.identifier;
    } catch (e) {
      console.warn('Speech.getAvailableVoicesAsync failed:', e);
      return undefined;
    }
  }

  private splitIntoChunks(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        chunks.push(remaining);
        break;
      }

      let splitIdx = remaining.lastIndexOf('. ', maxLength);
      if (splitIdx === -1) splitIdx = remaining.lastIndexOf(' ', maxLength);
      if (splitIdx === -1) splitIdx = maxLength;

      chunks.push(remaining.substring(0, splitIdx).trim());
      remaining = remaining.substring(splitIdx).trim();
    }

    return chunks;
  }
}

export const speechService = new SpeechService();
