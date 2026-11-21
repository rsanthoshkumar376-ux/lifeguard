import React, { useState } from 'react';
import { HeartPulse, BookOpen, ExternalLink, X, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CprMetronomeCard } from '../firstAid/CprMetronomeCard';
import { FIRST_AID_GUIDES, FirstAidGuideDefinition } from '../../data/firstAidData';
import { FirstAidIllustration } from '../firstAid/FirstAidIllustration';

export const CprFirstAidModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'cpr' | 'guides'>('cpr');
  const [selectedGuide, setSelectedGuide] = useState<FirstAidGuideDefinition>(FIRST_AID_GUIDES[0]);

  if (!isOpen) return null;

  const content = selectedGuide.content.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">
              OFFLINE EMERGENCY READY
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <HeartPulse size={24} className="text-white animate-pulse" />
            First-Aid & CPR Audio Metronome
          </h2>
          <p className="text-xs text-red-100 mt-0.5">
            AHA 100–120 BPM chest compression beat counter & life-saving protocols
          </p>

          {/* Toggle Tabs */}
          <div className="flex mt-3 bg-black/25 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('cpr')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'cpr' ? 'bg-white text-red-600 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              ❤️ CPR Metronome (110 BPM)
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'guides' ? 'bg-white text-red-600 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              📖 First-Aid Protocols (9)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-gray-800 dark:text-gray-200">
          
          {activeTab === 'cpr' ? (
            <div className="space-y-4">
              <CprMetronomeCard compact />
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Guide Selector Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {FIRST_AID_GUIDES.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => setSelectedGuide(guide)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedGuide.id === guide.id
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{guide.icon}</span>
                    <span>{guide.content.en.title}</span>
                  </button>
                ))}
              </div>

              {/* Selected Guide Details */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                      {content.category}
                    </span>
                    <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>{selectedGuide.icon}</span>
                      <span>{content.title}</span>
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {content.summary}
                </p>

                {/* Primary Action Steps with SVG Illustration */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-gray-800 dark:text-gray-200">
                    Immediate Action Steps:
                  </h4>
                  {content.immediateActions.slice(0, 3).map((step) => (
                    <div key={step.stepNumber} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{step.title}</span>
                      </div>
                      <FirstAidIllustration type={step.illustrationType} className="w-full h-24" />
                      <p className="text-[11px] text-gray-600 dark:text-gray-300">{step.instruction}</p>
                    </div>
                  ))}
                </div>

                {/* Critical DO NOT */}
                <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900 text-xs text-red-900 dark:text-red-200 space-y-1">
                  <span className="font-black text-red-700 dark:text-red-400 block">Critical Things to Avoid:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {content.thingsToAvoid.slice(0, 2).map((avoid, i) => (
                      <li key={i}>{avoid}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Full Screen Center Redirect Link */}
          <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                navigate('/first-aid');
              }}
              className="text-xs font-black text-red-600 hover:text-red-700 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <ExternalLink size={14} /> Open Fullscreen First-Aid Center
            </button>

            <a
              href="tel:108"
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
            >
              <PhoneCall size={13} /> Call 108
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CprFirstAidModal;
