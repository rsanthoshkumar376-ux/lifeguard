import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, BookOpen, Search, PhoneCall, ShieldAlert, 
  Wifi, WifiOff, Globe, CheckCircle2, AlertTriangle, 
  ChevronRight, ArrowLeft, X, Sparkles, Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FIRST_AID_GUIDES, SupportedLanguage, FirstAidGuideDefinition } from '../data/firstAidData';
import { FirstAidIllustration } from '../components/firstAid/FirstAidIllustration';
import { CprMetronomeCard } from '../components/firstAid/CprMetronomeCard';

const LANGUAGES: Array<{ code: SupportedLanguage; label: string; native: string }> = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

export const FirstAidPage: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.slice(0, 2) as SupportedLanguage) || 'en';
  
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(
    LANGUAGES.some(l => l.code === currentLang) ? currentLang : 'en'
  );
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [activeTab, setActiveTab] = useState<'guides' | 'cpr'>('guides');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeGuide, setActiveGuide] = useState<FirstAidGuideDefinition | null>(null);

  // Monitor network status for offline validation
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setSelectedLang(lang);
    if (i18n.changeLanguage) {
      i18n.changeLanguage(lang);
    }
  };

  // Filter guides by search and category
  const filteredGuides = FIRST_AID_GUIDES.filter((guide) => {
    const content = guide.content[selectedLang] || guide.content.en;
    const matchesSearch = 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 pb-24">
      
      {/* Emergency Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white pt-6 pb-8 px-4 sm:px-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Top Status Badges: Offline Readiness & Hotline Calls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Offline PWA Indicator */}
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
              {isOnline ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                    <Wifi size={13} /> Precached for Offline Use
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-200 flex items-center gap-1">
                    <WifiOff size={13} /> Offline Mode Active
                  </span>
                </>
              )}
            </div>

            {/* Direct Helplines */}
            <div className="flex items-center gap-2">
              <a
                href="tel:112"
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 backdrop-blur-sm border border-white/20 active:scale-95 transition-all"
              >
                <PhoneCall size={13} /> 112 National
              </a>
              <a
                href="tel:108"
                className="bg-white text-red-700 hover:bg-red-50 px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <PhoneCall size={13} /> 108 Ambulance
              </a>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <HeartPulse size={30} className="animate-pulse text-white" />
              Offline First-Aid & CPR Center
            </h1>
            <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-2xl leading-relaxed">
              Authoritative, step-by-step emergency life-support protocols & AHA-compliant CPR metronome. Works 100% offline without internet.
            </p>
          </div>

          {/* Educational Disclaimer Banner */}
          <div className="bg-black/35 backdrop-blur-sm p-3 rounded-2xl border border-white/20 text-[11px] sm:text-xs text-red-100 flex items-start gap-2.5">
            <ShieldAlert size={18} className="shrink-0 text-amber-300 mt-0.5" />
            <p className="leading-snug">
              <strong>Emergency Safety Notice:</strong> First-aid & CPR instructions are educational reference aids and do <em>NOT</em> replace instructions from 112/108 dispatchers. In an emergency, always call 108/112 first and follow their live verbal guidance.
            </p>
          </div>

          {/* Language Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <span className="text-[11px] font-bold text-red-200 shrink-0 flex items-center gap-1">
              <Globe size={13} /> Language:
            </span>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedLang === lang.code
                    ? 'bg-white text-red-700 shadow-md scale-105'
                    : 'bg-black/20 hover:bg-black/30 text-white/90 border border-white/10'
                }`}
              >
                {lang.native} ({lang.label})
              </button>
            ))}
          </div>

          {/* Primary View Navigation Tabs */}
          <div className="flex bg-black/30 p-1.5 rounded-2xl gap-2 mt-2">
            <button
              onClick={() => setActiveTab('guides')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
                activeTab === 'guides'
                  ? 'bg-white text-red-600 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <BookOpen size={18} />
              📖 First-Aid Guides (9 Protocols)
            </button>
            <button
              onClick={() => setActiveTab('cpr')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
                activeTab === 'cpr'
                  ? 'bg-white text-red-600 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <HeartPulse size={18} className="animate-pulse" />
              ❤️ CPR Audio Metronome
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* TAB 1: CPR Audio Metronome */}
        {activeTab === 'cpr' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CprMetronomeCard />

            {/* Quick Link to Adult CPR & AED Guide */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                  Need Adult CPR & AED Step-by-Step Instructions?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Review hand placement, chest recoil, airway opening, and pad positioning.
                </p>
              </div>
              <button
                onClick={() => {
                  const cprGuide = FIRST_AID_GUIDES.find(g => g.id === 'adult-cpr-aed');
                  if (cprGuide) setActiveGuide(cprGuide);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                View CPR & AED Guide
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: First-Aid Guides Directory */}
        {activeTab === 'guides' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Search Bar */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search emergency guide (e.g. CPR, Snakebite, Burns, Choking, Fractures)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Guides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGuides.map((guide) => {
                const content = guide.content[selectedLang] || guide.content.en;
                return (
                  <div
                    key={guide.id}
                    onClick={() => setActiveGuide(guide)}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-red-400 dark:hover:border-red-600 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-3xl p-2 bg-gray-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                          {guide.icon}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          guide.urgency === 'critical'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            : guide.urgency === 'high'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}>
                          {guide.urgency.toUpperCase()}
                        </span>
                      </div>

                      {/* Title & Summary */}
                      <h3 className="text-base font-black text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {content.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {content.summary}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                        {content.immediateActions.length} Step Guide • {content.thingsToAvoid.length} Warnings
                      </span>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Open Guide <ChevronRight size={15} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredGuides.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800">
                <p className="text-gray-500 text-sm">No first-aid guides match your search query.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-bold text-red-600 hover:underline"
                >
                  Clear search filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guide Detail Modal / Drawer */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-slate-800 animate-in zoom-in-95">
            
            {/* Modal Header */}
            {(() => {
              const content = activeGuide.content[selectedLang] || activeGuide.content.en;
              return (
                <>
                  <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 relative">
                    <button
                      onClick={() => setActiveGuide(null)}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                    >
                      ✕
                    </button>

                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-2xl">{activeGuide.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2.5 py-0.5 rounded-full text-red-100">
                        {content.category}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      {content.title}
                    </h2>
                    <p className="text-xs text-red-100 mt-1 max-w-lg leading-relaxed">
                      {content.summary}
                    </p>
                  </div>

                  {/* Modal Scrollable Body */}
                  <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-gray-800 dark:text-gray-200">
                    
                    {/* Section 1: Emergency Warning Signs */}
                    <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-900/60 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
                        <AlertTriangle size={15} /> Emergency Warning Signs:
                      </h4>
                      <ul className="space-y-1.5">
                        {content.warningSigns.map((sign, idx) => (
                          <li key={idx} className="text-xs text-red-950 dark:text-red-200 flex items-start gap-2">
                            <span className="text-red-500 font-bold">•</span>
                            <span>{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 2: Step-by-Step Immediate Recommended Actions */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Immediate Recommended Actions:
                      </h4>

                      <div className="space-y-4">
                        {content.immediateActions.map((step) => (
                          <div
                            key={step.stepNumber}
                            className="bg-gray-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-700/70 space-y-3"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                {step.stepNumber}
                              </span>
                              <h5 className="font-bold text-sm text-gray-900 dark:text-white">
                                {step.title}
                              </h5>
                            </div>

                            {/* Inline Visual SVG Illustration */}
                            <div className="rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-slate-700">
                              <FirstAidIllustration type={step.illustrationType} />
                            </div>

                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {step.instruction}
                            </p>

                            {step.tip && (
                              <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200">
                                <strong>💡 Pro Tip:</strong> {step.tip}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 3: Critical Things to Avoid ("NEVER DO") */}
                    <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                        <ShieldAlert size={16} /> Things to Avoid (Critical Safety):
                      </h4>
                      <ul className="space-y-1.5">
                        {content.thingsToAvoid.map((avoid, idx) => (
                          <li key={idx} className="text-xs text-rose-950 dark:text-rose-200 flex items-start gap-2">
                            <span className="text-rose-600 font-bold">✕</span>
                            <span>{avoid}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section 4: When to Call Emergency Services */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                        <PhoneCall size={15} /> When to Call Emergency Services (112 / 108):
                      </h4>
                      <ul className="space-y-1.5">
                        {content.whenToCallServices.map((when, idx) => (
                          <li key={idx} className="text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2">
                            <span className="text-blue-500 font-bold">📞</span>
                            <span>{when}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom Action Hotline Bar */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <a
                        href="tel:108"
                        className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:scale-95 transition-all"
                      >
                        <PhoneCall size={16} /> Call 108 Ambulance
                      </a>
                      <a
                        href="tel:112"
                        className="flex-1 py-3 px-4 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                      >
                        <PhoneCall size={16} /> Call 112 Helpline
                      </a>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FirstAidPage;
