import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export interface AccessibilityContextType {
  largeText: boolean;
  setLargeText: (enabled: boolean) => void;
  toggleLargeText: () => void;
  
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  toggleHighContrast: () => void;
  
  voiceNav: boolean;
  setVoiceNav: (enabled: boolean) => void;
  toggleVoiceNav: () => void;
  
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  lastSpokenCommand: string | null;
  speechAvailable: boolean;
  
  announcement: string;
  announce: (message: string, speak?: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // 1. Large Text Mode State
  const [largeText, setLargeTextState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lifeguard_large_text') === 'true';
    } catch {
      return false;
    }
  });

  // 2. High Contrast Mode State
  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lifeguard_high_contrast') === 'true';
    } catch {
      return false;
    }
  });

  // 3. Voice Navigation State
  const [voiceNav, setVoiceNavState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lifeguard_voice_nav') === 'true';
    } catch {
      return false;
    }
  });

  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastSpokenCommand, setLastSpokenCommand] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API Availability
  const speechAvailable = typeof window !== 'undefined' && 
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Announce to screen reader and optional text-to-speech
  const announce = useCallback((message: string, speak: boolean = false) => {
    setAnnouncement(message);
    if (speak && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1.0;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis unavailable:', e);
      }
    }
  }, []);

  const setLargeText = (enabled: boolean) => {
    setLargeTextState(enabled);
    try {
      localStorage.setItem('lifeguard_large_text', String(enabled));
    } catch {}
    announce(enabled ? 'Large text mode enabled' : 'Large text mode disabled', voiceNav);
  };

  const toggleLargeText = () => setLargeText(!largeText);

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    try {
      localStorage.setItem('lifeguard_high_contrast', String(enabled));
    } catch {}
    announce(enabled ? 'High contrast mode enabled' : 'High contrast mode disabled', voiceNav);
  };

  const toggleHighContrast = () => setHighContrast(!highContrast);

  const setVoiceNav = (enabled: boolean) => {
    setVoiceNavState(enabled);
    try {
      localStorage.setItem('lifeguard_voice_nav', String(enabled));
    } catch {}
    if (!enabled) {
      stopListening();
    } else {
      announce('Voice navigation enabled. Speak commands like Emergency, Blood, or Medical ID', true);
    }
  };

  const toggleVoiceNav = () => setVoiceNav(!voiceNav);

  // Apply DOM classes when accessibility settings change
  useEffect(() => {
    const root = document.documentElement;
    if (largeText) {
      root.classList.add('accessibility-large-text');
    } else {
      root.classList.remove('accessibility-large-text');
    }

    if (highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }
  }, [largeText, highContrast]);

  // Voice command dispatcher
  const handleVoiceCommand = useCallback((rawTranscript: string) => {
    const text = rawTranscript.trim().toLowerCase();
    setLastSpokenCommand(rawTranscript);

    if (text.includes('emergency') || text.includes('sos') || text.includes('danger') || text.includes('help')) {
      announce('Navigating to Emergency SOS', true);
      navigate('/emergency/sos');
    } else if (text.includes('home') || text.includes('dashboard') || text.includes('main')) {
      announce('Navigating to Home Dashboard', true);
      navigate('/');
    } else if (text.includes('medical id') || text.includes('qr') || text.includes('identity')) {
      announce('Navigating to Medical ID', true);
      navigate('/medical-id');
    } else if (text.includes('blood') || text.includes('donor') || text.includes('transfusion')) {
      announce('Navigating to Blood Donor Network', true);
      navigate('/blood');
    } else if (text.includes('health') || text.includes('records') || text.includes('vitals') || text.includes('reports')) {
      announce('Navigating to Health Records', true);
      navigate('/health-records');
    } else if (text.includes('medicine') || text.includes('medication') || text.includes('pill') || text.includes('appointment')) {
      announce('Navigating to Medicine Tracker', true);
      navigate('/medicines');
    } else if (text.includes('ai') || text.includes('assistant') || text.includes('chat') || text.includes('doctor')) {
      announce('Opening AI Healthcare Assistant', true);
      navigate('/ai-chat');
    } else if (text.includes('family') || text.includes('circle') || text.includes('caregiver')) {
      announce('Navigating to Family Health Circle', true);
      navigate('/family');
    } else if (text.includes('hospital') || text.includes('clinic') || text.includes('ambulance') || text.includes('108')) {
      announce('Navigating to Nearby Hospitals', true);
      navigate('/nearby-hospitals');
    } else if (text.includes('first aid') || text.includes('cpr') || text.includes('metronome')) {
      announce('Opening First-Aid and CPR Center', true);
      navigate('/first-aid');
    } else if (text.includes('senior mode') || text.includes('senior')) {
      announce('Activating Senior Citizen Mode', true);
      navigate('/senior-mode');
    } else if (text.includes('profile') || text.includes('settings') || text.includes('account')) {
      announce('Navigating to Profile Settings', true);
      navigate('/profile');
    } else if (text.includes('contrast') || text.includes('high contrast')) {
      toggleHighContrast();
    } else if (text.includes('large text') || text.includes('big text') || text.includes('font')) {
      toggleLargeText();
    } else if (text.includes('stop') || text.includes('cancel')) {
      announce('Voice listening paused', true);
      stopListening();
    } else {
      announce(`Unrecognized command: "${rawTranscript}". Try saying Emergency, Blood, Health, or Home`, true);
    }
  }, [announce, navigate]);

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!speechAvailable) {
      announce('Voice navigation is not supported in this browser.', true);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  }, [speechAvailable, handleVoiceCommand, announce]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        largeText,
        setLargeText,
        toggleLargeText,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        voiceNav,
        setVoiceNav,
        toggleVoiceNav,
        isListening,
        startListening,
        stopListening,
        lastSpokenCommand,
        speechAvailable,
        announcement,
        announce
      }}
    >
      {children}
      {/* Invisible Screen Reader Live Announcer */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="lifeguard-a11y-announcer"
      >
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
