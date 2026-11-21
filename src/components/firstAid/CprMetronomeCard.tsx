import React, { useState, useEffect } from 'react';
import { HeartPulse, Play, Pause, Square, Volume2, VolumeX, Vibrate, PhoneCall, AlertTriangle, Info } from 'lucide-react';
import { cprAudioService, CprState } from '../../services/cprAudioService';

interface CprMetronomeCardProps {
  compact?: boolean;
}

export const CprMetronomeCard: React.FC<CprMetronomeCardProps> = ({ compact = false }) => {
  const [cprState, setCprState] = useState<CprState>(cprAudioService.getState());
  const [bpmInput, setBpmInput] = useState<number>(110);

  useEffect(() => {
    const unsubscribe = cprAudioService.subscribe((state) => {
      setCprState(state);
      setBpmInput(state.bpm);
    });
    return () => unsubscribe();
  }, []);

  const handleStart = () => cprAudioService.start();
  const handlePause = () => cprAudioService.pause();
  const handleResume = () => cprAudioService.resume();
  const handleStop = () => cprAudioService.stop();

  const handleBpmChange = (newBpm: number) => {
    setBpmInput(newBpm);
    cprAudioService.setBpm(newBpm);
  };

  const isRunning = cprState.status === 'running';
  const isPaused = cprState.status === 'paused';
  const isStopped = cprState.status === 'stopped';

  // Pulse animation duration matching current BPM in seconds
  const pulseDurationSec = (60 / cprState.bpm).toFixed(2);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
      {/* Top Banner with AHA Compliance & Offline Badge */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2.5 py-0.5 rounded-full text-emerald-200">
              100% Offline Synthesizer
            </span>
          </div>
          <span className="text-[11px] font-bold text-red-100 bg-red-800/40 px-2 py-0.5 rounded-md">
            AHA Recommended: 100–120 BPM
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
          <HeartPulse size={26} className="text-white animate-pulse" />
          AHA CPR Audio Metronome
        </h3>
        <p className="text-xs text-red-100 mt-1 max-w-xl">
          High-precision chest compression audio pacer. Delivers rhythmic audible beats and alerts you at every 30th compression to give 2 rescue breaths.
        </p>
      </div>

      {/* Main Metronome Interactive Arena */}
      <div className="p-4 sm:p-6 space-y-6">
        
        {/* Visual Pulse Arena */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden ${
          isRunning 
            ? 'bg-red-50/70 dark:bg-red-950/30 border-red-500 shadow-lg ring-4 ring-red-500/10' 
            : isPaused
            ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-400'
            : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700'
        }`}>
          {/* Animated Heart Pulsing Indicator */}
          <div 
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-100 ${
              isRunning 
                ? 'bg-red-600 text-white scale-110 shadow-red-500/40 ring-8 ring-red-400/30' 
                : isPaused
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
            }`}
            style={{
              animation: isRunning ? `pulse ${pulseDurationSec}s infinite ease-in-out` : undefined
            }}
          >
            <HeartPulse size={compact ? 44 : 52} />
            <span className="text-[11px] font-black uppercase tracking-wider mt-1">
              {isRunning ? 'PUSH' : isPaused ? 'PAUSED' : 'READY'}
            </span>
          </div>

          {/* Real-time Counts */}
          <div className="mt-4 text-center space-y-1">
            <div className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              {cprState.compressionCount}
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Total Chest Compressions
            </p>
          </div>

          {/* 30:2 Cycle Tracker Badge */}
          <div className="mt-4 flex items-center gap-3">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Cycle Beat</span>
              <span className="text-sm font-black text-red-600 dark:text-red-400">
                {cprState.currentInCycle} / 30
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-center shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Cycles Done</span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                {cprState.cycleCount} (30:2)
              </span>
            </div>
          </div>

          {/* 30-compression rescue breath alert banner */}
          {cprState.currentInCycle === 30 && isRunning && (
            <div className="mt-3 px-4 py-1.5 bg-yellow-400 text-gray-950 font-black text-xs rounded-full animate-bounce shadow">
              🌬️ Give 2 Gentle Rescue Breaths (or continue Hands-Only CPR)
            </div>
          )}
        </div>

        {/* Primary Controls: Start, Pause, Stop */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {isStopped ? (
            <button
              onClick={handleStart}
              className="col-span-3 py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:scale-95 transition-all cursor-pointer"
            >
              <Play size={20} className="fill-white" />
              START CPR METRONOME (110 BPM)
            </button>
          ) : (
            <>
              {isRunning ? (
                <button
                  onClick={handlePause}
                  className="py-3 px-3 sm:px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow"
                >
                  <Pause size={18} />
                  Pause
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="py-3 px-3 sm:px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow"
                >
                  <Play size={18} className="fill-white" />
                  Resume
                </button>
              )}

              <button
                onClick={handleStop}
                className="col-span-2 py-3 px-4 rounded-2xl bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Square size={16} className="fill-current" />
                Stop & Reset Counter
              </button>
            </>
          )}
        </div>

        {/* Configurable BPM Rhythm (100–120 Range) */}
        <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-200 dark:border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Compression Rhythm (BPM):
            </span>
            <span className="text-sm font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 rounded-lg">
              {cprState.bpm} Beats / Min
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="100"
            max="120"
            step="1"
            value={bpmInput}
            onChange={(e) => handleBpmChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
          />

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[100, 110, 120].map((preset) => (
              <button
                key={preset}
                onClick={() => handleBpmChange(preset)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  cprState.bpm === preset
                    ? 'bg-red-600 text-white shadow'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'
                }`}
              >
                {preset} BPM {preset === 110 && '⭐ (Ideal)'}
              </button>
            ))}
          </div>
        </div>

        {/* Audio & Vibration Toggles */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => cprAudioService.setSoundEnabled(!cprState.soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                cprState.soundEnabled
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
              }`}
            >
              {cprState.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              {cprState.soundEnabled ? 'Audio Sound ON' : 'Audio Muted'}
            </button>

            <button
              onClick={() => cprAudioService.setVibrationEnabled(!cprState.vibrationEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                cprState.vibrationEnabled
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
              }`}
            >
              <Vibrate size={16} />
              {cprState.vibrationEnabled ? 'Vibrate ON' : 'Vibrate OFF'}
            </button>
          </div>

          <a
            href="tel:108"
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/50 px-3 py-1.5 rounded-xl"
          >
            <PhoneCall size={14} />
            Call 108 Ambulance
          </a>
        </div>

        {/* CPR Technique Quick Checklist */}
        <div className="bg-red-50/60 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-red-100 dark:border-slate-800 text-xs text-gray-700 dark:text-gray-300 space-y-1.5">
          <div className="font-black text-red-700 dark:text-red-400 flex items-center gap-1.5">
            <Info size={14} />
            AHA Quality CPR Rules:
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
            <li><strong>Depth</strong>: Push down at least 5 to 6 cm (2–2.4 inches) on lower breastbone.</li>
            <li><strong>Recoil</strong>: Allow chest to completely rise between pushes. Do not lean on chest.</li>
            <li><strong>Continuous</strong>: Minimize interruptions to under 10 seconds. Switch rescuers every 2 minutes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
