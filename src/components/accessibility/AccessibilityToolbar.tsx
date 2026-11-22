import React, { useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Type, Eye, Globe, Volume2, Info, ChevronDown, ChevronUp, Check } from 'lucide-react';
import LanguageModal from '../common/LanguageModal';

export const AccessibilityToolbar: React.FC = () => {
  const { 
    largeText, 
    toggleLargeText, 
    highContrast, 
    toggleHighContrast, 
    voiceNav, 
    toggleVoiceNav, 
    isListening, 
    startListening, 
    stopListening,
    lastSpokenCommand,
    speechAvailable
  } = useAccessibility();

  const { i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentLangCode = i18n.language ? i18n.language.split('-')[0] : 'en';

  const langNames: Record<string, string> = {
    en: 'English',
    ta: 'தமிழ்',
    hi: 'हिंदी',
    te: 'తెలుగు',
    kn: 'ಕನ್ನಡ',
    ml: 'മലയാളം'
  };

  return (
    <div 
      role="region" 
      aria-label="Accessibility and Language Settings"
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left side: Accessibility Pills */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Volume2 size={13} className="text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Accessibility:</span>
          </span>

          {/* Large Text Mode Toggle */}
          <button
            onClick={toggleLargeText}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95 ${
              largeText
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            aria-pressed={largeText}
            aria-label="Toggle Large Text Mode"
            title="Increase font size across all screens"
          >
            <Type size={13} />
            <span>Aa+</span>
            {largeText && <Check size={11} className="stroke-[3]" />}
          </button>

          {/* High Contrast Mode Toggle */}
          <button
            onClick={toggleHighContrast}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95 ${
              highContrast
                ? 'bg-amber-400 text-black border-amber-500 shadow-sm font-black'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            aria-pressed={highContrast}
            aria-label="Toggle High Contrast Mode (WCAG AAA)"
            title="Enhance visual contrast for better readability"
          >
            <Eye size={13} />
            <span>Contrast</span>
            {highContrast && <Check size={11} className="stroke-[3]" />}
          </button>

          {/* Voice Navigation Toggle & Mic Button */}
          {speechAvailable ? (
            <div className="flex items-center gap-1">
              <button
                onClick={toggleVoiceNav}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95 ${
                  voiceNav
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
                aria-pressed={voiceNav}
                aria-label="Toggle Voice Commands"
                title="Navigate LifeGuard with spoken voice commands"
              >
                <Mic size={13} />
                <span>Voice Nav</span>
                {voiceNav && <Check size={11} className="stroke-[3]" />}
              </button>

              {voiceNav && (
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                    isListening
                      ? 'bg-red-600 text-white border-red-700 animate-pulse ring-2 ring-red-400'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  }`}
                  aria-label={isListening ? "Stop listening to voice" : "Tap to speak a voice command"}
                  title={isListening ? "Listening... (tap to stop)" : "Tap to speak command"}
                >
                  {isListening ? <Mic size={14} className="animate-bounce" /> : <MicOff size={14} />}
                </button>
              )}
            </div>
          ) : (
            <span 
              className="text-[10px] text-slate-400 flex items-center gap-1"
              title="Voice recognition is not supported in this browser"
            >
              <MicOff size={12} />
              <span className="hidden md:inline">Voice unsupported</span>
            </span>
          )}
        </div>

        {/* Right side: Language Selector & Voice Hint Toggle */}
        <div className="flex items-center gap-2">
          {voiceNav && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              aria-expanded={isExpanded}
            >
              <span>Commands</span>
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}

          {/* Language Selector Button */}
          <button
            onClick={() => setIsLangOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all"
            aria-label="Change Language"
            title="English, தமிழ், हिंदी, తెలుగు, ಕನ್ನಡ, മലയാളം"
          >
            <Globe size={13} className="text-blue-600 dark:text-blue-400" />
            <span>{langNames[currentLangCode] || 'Language'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Voice Commands Cheat-Sheet */}
      {voiceNav && isExpanded && (
        <div className="bg-blue-50/90 dark:bg-blue-950/60 border-t border-blue-200 dark:border-blue-900/60 px-4 py-2.5 text-xs text-blue-900 dark:text-blue-200 animate-in fade-in">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">🗣️ Speak commands:</span>
              <span className="inline-flex flex-wrap gap-1 text-[11px]">
                <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">"Emergency"</code>
                <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">"Blood"</code>
                <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">"Medical ID"</code>
                <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">"Health"</code>
                <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">"Medicines"</code>
                <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">"Hospitals"</code>
                <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">"First Aid"</code>
                <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">"Home"</code>
              </span>
            </div>
            {lastSpokenCommand && (
              <span className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                Heard: "{lastSpokenCommand}"
              </span>
            )}
          </div>
        </div>
      )}

      {/* Language Modal */}
      <LanguageModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </div>
  );
};

export default AccessibilityToolbar;
