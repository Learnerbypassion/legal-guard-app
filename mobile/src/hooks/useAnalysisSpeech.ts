import { useState, useEffect, useRef } from 'react';
import { speechService } from '../services/speech.service';
import { buildSpeechSections } from '../utils/buildSpeechText';

export type SpeakingState = 'playing' | 'stopped';

export const useAnalysisSpeech = (language: 'English' | 'Hindi' | 'Bengali' = 'English') => {
  const [speakingState, setSpeakingState] = useState<SpeakingState>('stopped');
  const [currentSection, setCurrentSection] = useState<string>('');
  const [speed, setSpeed] = useState<number>(1.0);
  const speechActiveRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      // Stop speech when hook unmounts
      if (speechActiveRef.current) {
        speechService.stop();
      }
    };
  }, []);

  const speak = (analysis: any) => {
    if (!analysis) return;

    const sections = buildSpeechSections(analysis);
    if (sections.length === 0) return;

    speechActiveRef.current = true;
    setSpeakingState('playing');

    speechService.speakQueue(sections, {
      language,
      rate: speed,
      onSectionStart: (title) => {
        setCurrentSection(title);
      },
      onDone: () => {
        setSpeakingState('stopped');
        setCurrentSection('');
        speechActiveRef.current = false;
      },
      onError: (err) => {
        console.error('Speech synthesis error:', err);
        setSpeakingState('stopped');
        setCurrentSection('');
        speechActiveRef.current = false;
      },
    });
  };

  const stop = () => {
    speechService.stop();
    setSpeakingState('stopped');
    setCurrentSection('');
    speechActiveRef.current = false;
  };

  return {
    speakingState,
    currentSection,
    speak,
    stop,
    speed,
    setSpeed,
  };
};
