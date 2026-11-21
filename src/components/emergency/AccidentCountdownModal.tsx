import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, PhoneCall, Volume2, VolumeX, Activity } from 'lucide-react';
import { playEmergencySiren, stopEmergencySiren } from '../../services/accidentDetectionService';

interface AccidentCountdownModalProps {
  isOpen: boolean;
  impactMagnitude: number;
  onCancelSafe: () => void;
  onConfirmSosNow: () => void;
  onCountdownExpired: () => void;
  countdownSeconds?: number;
}

export const AccidentCountdownModal: React.FC<AccidentCountdownModalProps> = ({
  isOpen,
  impactMagnitude,
  onCancelSafe,
  onConfirmSosNow,
  onCountdownExpired,
  countdownSeconds = 30
}) => {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let timer: any = null;

    if (isOpen) {
      setTimeLeft(countdownSeconds);
      if (!isMuted) {
        playEmergencySiren();
      }

      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            stopEmergencySiren();
            onCountdownExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      stopEmergencySiren();
    }

    return () => {
      if (timer) clearInterval(timer);
      stopEmergencySiren();
    };
  }, [isOpen, countdownSeconds, isMuted]);

  const handleToggleMute = () => {
    if (isMuted) {
      playEmergencySiren();
      setIsMuted(false);
    } else {
      stopEmergencySiren();
      setIsMuted(true);
    }
  };

  const handleSafe = () => {
    stopEmergencySiren();
    onCancelSafe();
  };

  const handleImmediateSos = () => {
    stopEmergencySiren();
    onConfirmSosNow();
  };

  if (!isOpen) return null;

  const progressPercent = ((countdownSeconds - timeLeft) / countdownSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-xl animate-in fade-in">
      <div className="bg-slate-900 border-4 border-red-600 rounded-3xl max-w-md w-full p-6 text-center text-white shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Pulsing Emergency Beacon Background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/30 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-600/30 rounded-full blur-3xl animate-pulse pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 bg-red-600/30 border border-red-500/50 px-3 py-1 rounded-full text-xs font-black text-red-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            IMPACT DETECTED: {impactMagnitude.toFixed(1)} m/s²
          </div>

          <button
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isMuted ? 'Unmute siren' : 'Mute siren'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-red-400" />}
          </button>
        </div>

        {/* Warning Icon & Title */}
        <div className="space-y-1">
          <div className="w-20 h-20 bg-red-600/20 text-red-500 rounded-full mx-auto flex items-center justify-center border-2 border-red-500/40 shadow-lg animate-bounce">
            <AlertTriangle size={42} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Possible Accident Detected!
          </h2>
          <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto">
            A sudden high-G impact was recorded. If you are safe, tap the green button below.
          </p>
        </div>

        {/* Countdown Visual Timer */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          {/* Circular progress bar SVG */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              stroke="#DC2626"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black tracking-tighter text-white">
              {timeLeft}s
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              AUTO SOS IN
            </span>
          </div>
        </div>

        {/* Large Action Buttons */}
        <div className="space-y-3">
          {/* I AM SAFE BUTTON (Dominant to avoid false alarms) */}
          <button
            onClick={handleSafe}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-950 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <ShieldCheck size={26} />
            <span>I AM SAFE (CANCEL ALERT)</span>
          </button>

          {/* SEND SOS NOW BUTTON */}
          <button
            onClick={handleImmediateSos}
            className="w-full py-3.5 px-6 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-red-950 flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-500/40"
          >
            <PhoneCall size={18} />
            <span>SEND SOS IMMEDIATELY</span>
          </button>
        </div>

        {/* Footer info note */}
        <p className="text-[11px] text-slate-400 leading-tight">
          When the timer reaches 0, GPS coordinates will be captured and emergency contacts will be notified.
        </p>

      </div>
    </div>
  );
};

export default AccidentCountdownModal;
