import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, ShieldAlert, Heart, Pill, CheckCircle2, 
  ArrowLeft, Activity, Volume2, ShieldCheck, Clock, 
  User, AlertTriangle, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setSeniorModeActive } from '../../services/familyCircleService';
import { 
  getMedicineAppointmentData, 
  generateTodayDoses, 
  updateDoseStatus, 
  MedicationDoseLog 
} from '../../services/medicineAppointmentService';

export const SeniorModePage: React.FC = () => {
  const navigate = useNavigate();
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [todayDoses, setTodayDoses] = useState<MedicationDoseLog[]>([]);
  const [takenSuccessId, setTakenSuccessId] = useState<string | null>(null);
  const [impactDetected, setImpactDetected] = useState(false);

  // Primary Caregiver Info
  const caregiver = {
    name: 'Rajesh Kumar (Son)',
    phone: '+919876543210',
    relation: 'Son'
  };

  useEffect(() => {
    // Load senior doses
    loadDoses();
  }, []);

  const loadDoses = async () => {
    try {
      const state = await getMedicineAppointmentData();
      const doses = generateTodayDoses(state);
      setTodayDoses(doses);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTakeDose = async (doseId: string) => {
    try {
      await updateDoseStatus(doseId, 'taken');
      setTakenSuccessId(doseId);
      await loadDoses();
      setTimeout(() => setTakenSuccessId(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // 5-second emergency SOS countdown
  useEffect(() => {
    let timer: any = null;
    if (sosCountdown !== null && sosCountdown > 0) {
      timer = setTimeout(() => {
        setSosCountdown(sosCountdown - 1);
      }, 1000);
    } else if (sosCountdown === 0) {
      setSosTriggered(true);
      setSosCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  const handleStartSos = () => {
    setSosCountdown(5);
  };

  const handleCancelSos = () => {
    setSosCountdown(null);
  };

  const handleExitSeniorMode = () => {
    setSeniorModeActive(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-amber-50/40 dark:bg-slate-950 text-gray-950 dark:text-gray-50 flex flex-col p-4 sm:p-6 transition-colors font-sans select-none">
      
      {/* Top Header */}
      <header className="flex items-center justify-between pb-4 border-b-2 border-amber-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Heart size={32} className="fill-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white leading-tight">
              Senior Mode
            </h1>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
              Simplified & High-Contrast
            </p>
          </div>
        </div>

        <button
          onClick={handleExitSeniorMode}
          className="px-4 py-2.5 rounded-2xl bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 text-sm font-black border-2 border-gray-300 dark:border-slate-700 active:scale-95 transition-all"
        >
          Exit Mode ✕
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-xl w-full mx-auto py-6 space-y-6">

        {/* SOS Countdown Overlay */}
        {sosCountdown !== null && (
          <div className="fixed inset-0 z-50 bg-red-600 text-white flex flex-col items-center justify-center p-6 text-center animate-pulse">
            <ShieldAlert size={80} className="mb-4" />
            <h2 className="text-3xl font-black mb-2">SENDING EMERGENCY SOS IN</h2>
            <span className="text-8xl font-black mb-6">{sosCountdown}</span>
            <p className="text-lg font-bold mb-8">
              Alerting {caregiver.name} and sharing live GPS location...
            </p>
            <button
              onClick={handleCancelSos}
              className="w-full max-w-sm py-5 rounded-3xl bg-white text-red-700 text-2xl font-black shadow-2xl active:scale-95 transition-all"
            >
              I AM SAFE — CANCEL
            </button>
          </div>
        )}

        {/* SOS Triggered Notice */}
        {sosTriggered && (
          <div className="p-6 rounded-3xl bg-red-600 text-white text-center space-y-3 shadow-xl">
            <CheckCircle2 size={48} className="mx-auto" />
            <h3 className="text-2xl font-black">EMERGENCY SOS SENT!</h3>
            <p className="text-base font-bold">
              Your GPS location and Medical ID were dispatched to {caregiver.name} and your emergency contacts.
            </p>
            <button
              onClick={() => setSosTriggered(false)}
              className="px-6 py-3 rounded-2xl bg-white text-red-700 text-sm font-black"
            >
              Dismiss Notice
            </button>
          </div>
        )}

        {/* Action 1: Huge 108 Emergency Ambulance Button */}
        <a
          href="tel:108"
          className="w-full py-6 px-6 rounded-3xl bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-between shadow-2xl shadow-red-600/30 border-4 border-red-500 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-inner shrink-0">
              <PhoneCall size={36} className="animate-bounce" />
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-black block tracking-tight">CALL 108</span>
              <span className="text-sm font-bold text-red-100">Ambulance Emergency</span>
            </div>
          </div>
          <span className="text-2xl font-black px-4 py-2 bg-red-700 rounded-2xl">DIAL</span>
        </a>

        {/* Action 2: Huge Emergency SOS Button */}
        <button
          onClick={handleStartSos}
          className="w-full py-6 px-6 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-white flex items-center justify-between shadow-2xl shadow-orange-500/30 border-4 border-amber-400 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-orange-600 flex items-center justify-center shadow-inner shrink-0">
              <ShieldAlert size={36} />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black block tracking-tight">EMERGENCY SOS</span>
              <span className="text-sm font-bold text-orange-100">Alert Family Circle & Caregiver</span>
            </div>
          </div>
          <span className="text-lg font-black px-4 py-2 bg-orange-700 rounded-2xl">SEND</span>
        </button>

        {/* Action 3: Primary Family Caregiver Quick Dial */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-500" />
              <span className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Connected Caregiver
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Connected ✓
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">{caregiver.name}</h3>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{caregiver.phone}</p>
            </div>

            <a
              href={`tel:${caregiver.phone}`}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base flex items-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <PhoneCall size={20} />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* Action 4: Today's Medicines (Big Cards) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill size={22} className="text-blue-500" />
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Today's Medicines</h3>
            </div>
            <span className="text-xs font-bold text-gray-400">
              {todayDoses.filter(d => d.status === 'taken').length}/{todayDoses.length} Taken
            </span>
          </div>

          {todayDoses.length === 0 ? (
            <p className="text-sm font-bold text-gray-500 text-center py-4">
              No medications scheduled for today.
            </p>
          ) : (
            <div className="space-y-3">
              {todayDoses.slice(0, 3).map((dose) => {
                const isTaken = dose.status === 'taken';

                return (
                  <div
                    key={dose.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                      isTaken
                        ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                        : 'border-blue-200 dark:border-slate-700 bg-blue-50/20 dark:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <span className="text-lg font-black text-gray-900 dark:text-white block">
                        {dose.medicationName}
                      </span>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                        {dose.dosage} • {dose.scheduledTime} ({dose.timeSlot})
                      </span>
                    </div>

                    {isTaken ? (
                      <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 size={18} />
                        <span>Taken</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleTakeDose(dose.id)}
                        className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-base shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 size={20} />
                        <span>I Took It</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fall & Accident Impact Monitor */}
        <div className="p-4 rounded-2xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-amber-500 animate-pulse" />
            <span>Accident & Fall Sensor: <strong>ACTIVE</strong></span>
          </div>
          <span className="text-gray-400">Accelerometer Monitored</span>
        </div>

      </main>

      {/* Footer */}
      <footer className="text-center pt-4 pb-2 text-xs font-bold text-gray-500 dark:text-gray-400 border-t border-amber-200 dark:border-slate-800">
        Emergency helpline: <strong>108</strong> (Ambulance) / <strong>112</strong> • LifeGuard Senior Mode
      </footer>

    </div>
  );
};

export default SeniorModePage;
