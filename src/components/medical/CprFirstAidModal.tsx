import React, { useState, useEffect, useRef } from 'react';
import { HeartPulse, Play, Square, Volume2, AlertTriangle, Activity, Check, Shield, HelpCircle, PhoneCall } from 'lucide-react';

interface FirstAidGuide {
  id: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  criticalDo: string[];
  criticalDont: string[];
}

const FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: 'choking',
    title: 'Choking (Adult & Child)',
    category: 'Respiratory',
    icon: '🗣️',
    summary: 'Airway obstruction causing inability to breathe or speak.',
    criticalDo: [
      'Give 5 sharp back blows between shoulder blades with heel of hand.',
      'Perform 5 abdominal thrusts (Heimlich maneuver): place fist above navel and pull inward & upward.',
      'Alternate 5 back blows and 5 thrusts until object clears or patient becomes unconscious.',
      'If unconscious, start CPR immediately and call 108.'
    ],
    criticalDont: [
      'Do NOT perform blind finger sweeps in the mouth (can push object deeper).',
      'Do NOT give water to a choking patient.'
    ]
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding & Hemorrhage',
    category: 'Trauma',
    icon: '🩸',
    summary: 'Heavy arterial or venous blood loss.',
    criticalDo: [
      'Apply firm, continuous direct pressure over the wound using sterile cloth or clean clothing.',
      'Elevate injured limb above heart level if no fracture is suspected.',
      'Maintain pressure continuously without removing cloth to check bleeding.',
      'If bleeding continues through cloth, place another layer directly on top.'
    ],
    criticalDont: [
      'Do NOT remove soaked dressings (it dislodges formed clots).',
      'Do NOT remove impaled knives or glass objects (stabilize them in place).'
    ]
  },
  {
    id: 'burns',
    title: 'Burns & Scalds',
    category: 'Thermal',
    icon: '🔥',
    summary: 'Thermal or chemical burn injury.',
    criticalDo: [
      'Immediately cool burn with clean running tap water for 10-20 minutes.',
      'Remove jewelry or tight clothing before swelling begins.',
      'Cover loosely with sterile plastic cling film or clean dry cloth.'
    ],
    criticalDont: [
      'Do NOT use ice, ice water, butter, toothpaste, or oil.',
      'Do NOT burst blisters or peel stuck clothing away from skin.'
    ]
  },
  {
    id: 'seizure',
    title: 'Epileptic Seizure / Convulsion',
    category: 'Neurological',
    icon: '⚡',
    summary: 'Sudden uncontrollable electrical surge in the brain.',
    criticalDo: [
      'Clear hard or sharp objects away from the patient.',
      'Cushion their head with a folded jacket or pillow.',
      'Turn patient on their side (recovery position) once jerking stops to keep airway clear.',
      'Time the seizure. Call 108 if it lasts > 5 minutes.'
    ],
    criticalDont: [
      'Do NOT hold the person down or try to stop their jerking.',
      'NEVER put any spoon, keys, cloth, or fingers into their mouth.'
    ]
  },
  {
    id: 'snakebite',
    title: 'Venomous Snakebite',
    category: 'Toxicology',
    icon: '🐍',
    summary: 'Envenomation risk requiring anti-venom at hospital.',
    criticalDo: [
      'Keep patient calm, still, and immobilized (movement speeds venom spread).',
      'Keep bite site at or slightly below heart level.',
      'Immobilize limb with a splint or firm bandage.',
      'Transport immediately to the nearest hospital with anti-venom.'
    ],
    criticalDont: [
      'Do NOT cut the bite area, suck venom, or use electric shock.',
      'Do NOT apply a tight tourniquet (causes tissue necrosis).'
    ]
  }
];

export const CprFirstAidModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isPlayingCpr, setIsPlayingCpr] = useState(false);
  const [bpm, setBpm] = useState(110); // Standard AHA 100-120 BPM
  const [activeTab, setActiveTab] = useState<'cpr' | 'guides'>('cpr');
  const [selectedGuide, setSelectedGuide] = useState<FirstAidGuide>(FIRST_AID_GUIDES[0]);
  const [compressionCount, setCompressionCount] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopCprAudio();
    };
  }, []);

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz crisp high beep
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
      setCompressionCount(prev => prev + 1);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  const startCprAudio = () => {
    setIsPlayingCpr(true);
    setCompressionCount(0);
    playBeep();
    const intervalMs = (60 / bpm) * 1000;
    intervalRef.current = setInterval(() => {
      playBeep();
    }, intervalMs);
  };

  const stopCprAudio = () => {
    setIsPlayingCpr(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleCpr = () => {
    if (isPlayingCpr) {
      stopCprAudio();
    } else {
      startCprAudio();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 relative">
          <button
            onClick={() => { stopCprAudio(); onClose(); }}
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
            100–120 BPM chest compression beat counter & life-saving protocols
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
              📖 First-Aid Protocols
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-gray-800 dark:text-gray-200">
          
          {activeTab === 'cpr' ? (
            <div className="space-y-4 text-center">
              
              {/* Metronome Beat Box */}
              <div className={`p-6 rounded-3xl border-2 transition-all shadow-inner flex flex-col items-center justify-center relative overflow-hidden ${
                isPlayingCpr 
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-500 ring-4 ring-red-500/20' 
                  : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700'
              }`}>
                <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-3 shadow-lg transition-transform ${
                  isPlayingCpr 
                    ? 'bg-red-600 text-white scale-110 animate-bounce' 
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                }`}>
                  <HeartPulse size={54} />
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-black text-gray-900 dark:text-white">
                    {isPlayingCpr ? `${compressionCount} Compressions` : '110 BPM'}
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    AHA Guideline: Push hard & fast at center of chest (5-6 cm depth)
                  </p>
                </div>

                <button
                  onClick={toggleCpr}
                  className={`mt-4 py-3.5 px-8 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                    isPlayingCpr
                      ? 'bg-slate-900 text-white hover:bg-black'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                  }`}
                >
                  {isPlayingCpr ? (
                    <>
                      <Square size={18} /> Stop Metronome
                    </>
                  ) : (
                    <>
                      <Play size={18} /> Start CPR Audio Beat (110 BPM)
                    </>
                  )}
                </button>
              </div>

              {/* 3 Step Quick CPR Guide */}
              <div className="grid grid-cols-3 gap-2 text-left">
                <div className="bg-gray-50 dark:bg-slate-800/70 p-3 rounded-2xl border border-gray-200 dark:border-slate-700">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center mb-1.5">1</span>
                  <h4 className="font-black text-xs text-gray-900 dark:text-white">Call 108 / 112</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Shout for help & call ambulance immediately.</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/70 p-3 rounded-2xl border border-gray-200 dark:border-slate-700">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center mb-1.5">2</span>
                  <h4 className="font-black text-xs text-gray-900 dark:text-white">Position Hands</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Heel of hand on center of breastbone, interlock fingers.</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/70 p-3 rounded-2xl border border-gray-200 dark:border-slate-700">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center mb-1.5">3</span>
                  <h4 className="font-black text-xs text-gray-900 dark:text-white">Push to Beat</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Compress 5-6 cm deep at 100-120 BPM without stopping.</p>
                </div>
              </div>

              {/* Instant Call 108 Button */}
              <a
                href="tel:108"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <PhoneCall size={16} /> Call 108 Ambulance Directly
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Protocol Selector Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {FIRST_AID_GUIDES.map(guide => (
                  <button
                    key={guide.id}
                    onClick={() => setSelectedGuide(guide)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                      selectedGuide.id === guide.id
                        ? 'bg-red-600 text-white border-red-600 shadow'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'
                    }`}
                  >
                    {guide.icon} {guide.title.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Active Protocol Card */}
              <div className="bg-gray-50 dark:bg-slate-800/80 rounded-2xl p-4 border border-gray-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedGuide.icon}</span>
                  <div>
                    <h3 className="font-black text-sm text-gray-900 dark:text-white">{selectedGuide.title}</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{selectedGuide.summary}</p>
                  </div>
                </div>

                {/* DOs */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3 rounded-xl space-y-1.5">
                  <h4 className="font-black text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-600" /> WHAT TO DO IMMEDIATELY:
                  </h4>
                  <ul className="text-xs text-emerald-950 dark:text-emerald-100 space-y-1 list-disc list-inside font-medium">
                    {selectedGuide.criticalDo.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* DONTs */}
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 p-3 rounded-xl space-y-1.5">
                  <h4 className="font-black text-xs text-red-800 dark:text-red-200 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-red-600" /> WHAT NEVER TO DO (DANGEROUS):
                  </h4>
                  <ul className="text-xs text-red-950 dark:text-red-100 space-y-1 list-disc list-inside font-medium">
                    {selectedGuide.criticalDont.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => { stopCprAudio(); onClose(); }}
            className="w-full sm:w-auto px-6 py-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            Close First-Aid
          </button>
        </div>

      </div>
    </div>
  );
};

export default CprFirstAidModal;
