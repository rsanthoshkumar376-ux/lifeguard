import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Pill, Calendar, Clock, CheckCircle2, AlertTriangle, RefreshCw, 
  Plus, Bell, ShieldCheck, Stethoscope, Hospital, AlertCircle, 
  ExternalLink, ChevronRight, FileText, Activity, Trash2, Edit3, 
  Volume2, ShieldAlert, Check, X, RotateCcw
} from 'lucide-react';
import { 
  MedicineAppointmentState, 
  MedicationSchedule, 
  MedicationDoseLog, 
  HospitalAppointment,
  getMedicineAppointmentData, 
  generateTodayDoses, 
  computeAdherenceStats, 
  updateDoseStatus, 
  deleteMedication, 
  deleteHospitalAppointment,
  updateAppointmentStatus,
  requestNotificationPermission, 
  playMedicationReminderChime,
  showBrowserNotification 
} from '../../services/medicineAppointmentService';
import { AddMedicationModal } from '../../components/meds/AddMedicationModal';
import { AddAppointmentModal } from '../../components/meds/AddAppointmentModal';
import { DoseActionModal } from '../../components/meds/DoseActionModal';
import { RefillManageModal } from '../../components/meds/RefillManageModal';

type TabType = 'today' | 'medications' | 'appointments' | 'adherence';

const MedicineTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<MedicineAppointmentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [notifPermissionGranted, setNotifPermissionGranted] = useState(false);

  // Modals state
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [medToEdit, setMedToEdit] = useState<MedicationSchedule | null>(null);
  const [isAddAptOpen, setIsAddAptOpen] = useState(false);
  const [isDoseActionOpen, setIsDoseActionOpen] = useState(false);
  const [activeDose, setActiveDose] = useState<MedicationDoseLog | null>(null);
  const [isRefillOpen, setIsRefillOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getMedicineAppointmentData(user?.uid);
      setState(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifPermissionGranted(true);
    }
  }, [user]);

  if (loading || !state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Loading Medicine & Appointment Schedule...</p>
        <p className="text-xs text-gray-400 mt-1">Preparing daily dosing tracker & clinical alerts</p>
      </div>
    );
  }

  // Generate today's schedule
  const todayDoses = generateTodayDoses(state);
  const adherence = computeAdherenceStats(todayDoses);

  // Low stock medications
  const lowStockMeds = state.medications.filter(m => m.isActive && m.currentStock <= m.refillThreshold);

  // Next scheduled appointment
  const upcomingAppointments = state.appointments
    .filter(a => a.status === 'scheduled')
    .sort((a, b) => new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime() - new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime());
  const nextAppointment = upcomingAppointments[0];

  const handleQuickTake = async (dose: MedicationDoseLog) => {
    playMedicationReminderChime();
    await updateDoseStatus(dose.id, 'taken', {}, user?.uid);
    loadData();
  };

  const handleEnableReminders = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermissionGranted(granted);
    if (granted) {
      showBrowserNotification('LifeGuard Medicine Reminders Active', {
        body: 'You will receive scheduled dose and hospital appointment alerts on this device.'
      });
    }
  };

  const handleDeleteMed = async (id: string) => {
    if (window.confirm('Delete this medication and all associated dosage schedules?')) {
      await deleteMedication(id, user?.uid);
      loadData();
    }
  };

  const handleDeleteApt = async (id: string) => {
    if (window.confirm('Delete this appointment entry?')) {
      await deleteHospitalAppointment(id, user?.uid);
      loadData();
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto pb-28 text-gray-900 dark:text-gray-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              Clinical Dosing & Care
            </span>
            <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
              <ShieldCheck size={13} className="text-teal-600" /> Prescribed Accuracy
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            Medicine & Appointments
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dose reminders, adherence tracker, pill refill alerts & doctor visit scheduling
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMedToEdit(null);
              setIsAddMedOpen(true);
            }}
            className="px-3.5 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-teal-700 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Medication
          </button>

          <button
            onClick={() => setIsAddAptOpen(true)}
            className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Calendar size={16} /> Book Visit
          </button>
        </div>
      </div>

      {/* Low Stock Refill Alert Banner (if any) */}
      {lowStockMeds.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5 mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Pharmacy Refill Alert ({lowStockMeds.length} Medication Low)
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                {lowStockMeds.map(m => `${m.name} (${m.currentStock} left)`).join(', ')}. Contact your pharmacy to replenish stock.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRefillOpen(true)}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-amber-700 flex items-center gap-1"
          >
            <RefreshCw size={13} /> Refill Stock
          </button>
        </div>
      )}

      {/* Reminder Permission & Browser Fallback Notice */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700 rounded-2xl p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Bell size={18} className={notifPermissionGranted ? 'text-teal-600 mt-0.5' : 'text-gray-400 mt-0.5'} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Device Reminders & Chime Alerts
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                notifPermissionGranted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {notifPermissionGranted ? 'ACTIVE' : 'MUTED'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Browser & PWA reminders chime when due. Mobile battery managers or closed browser sandboxes may limit background wake-up.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => playMedicationReminderChime()}
            className="px-2.5 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1"
            title="Test Audio Chime"
          >
            <Volume2 size={14} /> Test Chime
          </button>
          {!notifPermissionGranted && (
            <button
              onClick={handleEnableReminders}
              className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1 mb-5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'today'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Clock size={15} /> Today's Dosing ({todayDoses.length})
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'medications'
              ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Pill size={15} /> Medications ({state.medications.length})
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Calendar size={15} /> Appointments ({state.appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('adherence')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'adherence'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Activity size={15} /> Adherence ({adherence.adherencePercentage}%)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TODAY'S SCHEDULE & TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'today' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Adherence & Next Appointment Mini-Dashboard Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Adherence Gauge */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-500">Today's Adherence</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-teal-600 dark:text-teal-400">
                  {adherence.adherencePercentage}%
                </span>
                <span className="text-xs font-bold text-gray-500">
                  ({adherence.taken} / {adherence.totalScheduled} Doses Taken)
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${adherence.adherencePercentage}%` }}
                />
              </div>
            </div>

            {/* Next Due Dose */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
              <span className="text-[10px] uppercase font-bold text-gray-500">Pending Doses Today</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {adherence.pending} <span className="text-xs font-normal text-gray-400">doses remaining</span>
              </p>
              {adherence.missed > 0 ? (
                <p className="text-[11px] font-bold text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={13} /> {adherence.missed} overdue dose requiring attention
                </p>
              ) : (
                <p className="text-[11px] font-bold text-emerald-600 mt-2 flex items-center gap-1">
                  <CheckCircle2 size={13} /> All scheduled morning doses on track
                </p>
              )}
            </div>

            {/* Next Appointment Snippet */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Next Upcoming Visit</span>
              {nextAppointment ? (
                <div className="mt-1">
                  <p className="font-black text-xs text-gray-900 dark:text-white truncate">
                    {nextAppointment.doctor} ({nextAppointment.specialty})
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">{nextAppointment.hospital}</p>
                  <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 mt-1">
                    🗓️ {nextAppointment.appointmentDate} at {nextAppointment.appointmentTime}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic mt-2">No upcoming hospital visits scheduled.</p>
              )}
            </div>
          </div>

          {/* Doses Time-Grouped List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Today's Prescribed Doses ({todayDoses.length})
              </h2>
              <span className="text-[11px] font-bold text-gray-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {todayDoses.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
                <Pill size={36} className="mx-auto mb-2 text-gray-400 opacity-60" />
                <p className="font-bold text-sm text-gray-700 dark:text-gray-300">No active medications scheduled for today</p>
                <p className="text-xs text-gray-400 mt-1">Add your daily prescriptions to automate reminders.</p>
                <button
                  onClick={() => setIsAddMedOpen(true)}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus size={15} /> Add First Medication
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayDoses.map((dose) => {
                  const isTaken = dose.status === 'taken';
                  const isMissed = dose.status === 'missed';
                  const isSkipped = dose.status === 'skipped';
                  const isPending = dose.status === 'pending';

                  return (
                    <div
                      key={dose.id}
                      className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isTaken
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                          : isMissed
                          ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40'
                          : isSkipped
                          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
                          : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                          isTaken ? 'bg-emerald-600 text-white' :
                          isMissed ? 'bg-red-600 text-white' :
                          isSkipped ? 'bg-amber-600 text-white' :
                          'bg-teal-50 dark:bg-teal-950/60 text-teal-600 border border-teal-200 dark:border-teal-800'
                        }`}>
                          <Pill size={22} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                              {dose.medicationName}
                            </h3>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
                              {dose.dosage}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="font-black text-teal-700 dark:text-teal-300 flex items-center gap-1">
                              <Clock size={12} /> {dose.scheduledTime}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{dose.timeSlot} slot</span>
                            {dose.takenAt && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                  Taken at {new Date(dose.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </>
                            )}
                            {dose.skippedReason && (
                              <>
                                <span>•</span>
                                <span className="text-amber-700 dark:text-amber-400 italic">
                                  "{dose.skippedReason}"
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Badges & 1-Tap Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleQuickTake(dose)}
                              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-black shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 size={15} /> Take Dose
                            </button>
                            <button
                              onClick={() => {
                                setActiveDose(dose);
                                setIsDoseActionOpen(true);
                              }}
                              className="px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold"
                            >
                              Options...
                            </button>
                          </>
                        )}

                        {isTaken && (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 size={14} /> DOSE TAKEN
                            </span>
                            <button
                              onClick={() => {
                                setActiveDose(dose);
                                setIsDoseActionOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600"
                              title="Edit Dose"
                            >
                              <RotateCcw size={15} />
                            </button>
                          </div>
                        )}

                        {isMissed && (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 flex items-center gap-1">
                              <AlertTriangle size={14} /> OVERDUE / MISSED
                            </span>
                            <button
                              onClick={() => handleQuickTake(dose)}
                              className="px-3 py-1 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
                            >
                              Take Now
                            </button>
                          </div>
                        )}

                        {isSkipped && (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                              <AlertCircle size={14} /> DOSE SKIPPED
                            </span>
                            <button
                              onClick={() => {
                                setActiveDose(dose);
                                setIsDoseActionOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600"
                              title="Adjust"
                            >
                              <RotateCcw size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY MEDICATIONS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'medications' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Active Prescriptions & Regimens</h2>
              <p className="text-xs text-gray-500">Configured dosages, doctor authorizations & pharmacy inventory</p>
            </div>
            <button
              onClick={() => {
                setMedToEdit(null);
                setIsAddMedOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-teal-700 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus size={16} /> Add Medication
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {state.medications.map(med => {
              const isLowStock = med.currentStock <= med.refillThreshold;
              return (
                <div key={med.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0">
                          <Pill size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white">{med.name}</h3>
                          <p className="text-xs font-black text-teal-700 dark:text-teal-400">{med.dosage}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        med.verificationStatus === 'doctor_verified'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                      }`}>
                        {med.verificationStatus === 'doctor_verified' ? 'Doctor Verified' : 'User Entered'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <p><span className="font-bold text-gray-700 dark:text-gray-300">Schedule:</span> {med.frequencyLabel} ({med.mealTiming.replace('_', ' ')})</p>
                      {med.reminderTimes.length > 0 && (
                        <p><span className="font-bold text-gray-700 dark:text-gray-300">Times:</span> {med.reminderTimes.join(', ')}</p>
                      )}
                      {med.prescribingDoctor && (
                        <p><span className="font-bold text-gray-700 dark:text-gray-300">Physician:</span> {med.prescribingDoctor} ({med.hospitalOrClinic || 'Clinic'})</p>
                      )}
                      {med.instructions && (
                        <p className="text-[11px] italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl mt-1.5">
                          "{med.instructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock & Bottom Controls */}
                  <div className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-black ${isLowStock ? 'text-amber-600 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        📦 {med.currentStock} doses left
                      </span>
                      {isLowStock && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase">
                          Refill Needed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setMedToEdit(med);
                          setIsAddMedOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-teal-600 rounded-lg"
                        title="Edit Medication"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMed(med.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                        title="Delete Medication"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HOSPITAL APPOINTMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'appointments' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Hospital Appointments</h2>
              <p className="text-xs text-gray-500">Doctor consultations, specialist reviews & attached diagnostics</p>
            </div>
            <button
              onClick={() => setIsAddAptOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus size={16} /> Schedule Visit
            </button>
          </div>

          {state.appointments.length === 0 ? (
            <div className="p-10 text-center border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
              <Calendar size={36} className="mx-auto mb-2 text-gray-400 opacity-60" />
              <p className="font-bold text-sm text-gray-700 dark:text-gray-300">No hospital appointments recorded</p>
              <p className="text-xs text-gray-400 mt-1">Book your doctor visits with automatic 1-day & 2-hour reminders.</p>
              <button
                onClick={() => setIsAddAptOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus size={15} /> Book Consultation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {state.appointments.map(apt => {
                const isScheduled = apt.status === 'scheduled';
                const isCompleted = apt.status === 'completed';

                return (
                  <div key={apt.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{apt.doctor}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              {apt.specialty}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                            <Hospital size={13} className="text-blue-600 shrink-0" /> {apt.hospital}
                          </p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                          isScheduled
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Scheduled Time</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            🗓️ {apt.appointmentDate} at {apt.appointmentTime}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Reason for Visit</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{apt.reason}</span>
                        </div>
                      </div>

                      {apt.attachedReportTitles && apt.attachedReportTitles.length > 0 && (
                        <div className="mt-2.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Attached Diagnostic Reports
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {apt.attachedReportTitles.map(t => (
                              <span key={t} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold">
                                📄 {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {apt.consultationNotes && (
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-2 italic bg-blue-50/40 dark:bg-blue-950/20 p-2 rounded-xl border border-blue-100 dark:border-blue-900/30">
                          Notes: "{apt.consultationNotes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isScheduled && (
                          <button
                            onClick={async () => {
                              await updateAppointmentStatus(apt.id, 'completed', undefined, user?.uid);
                              loadData();
                            }}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                          >
                            Mark Completed
                          </button>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apt.hospital)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> Directions
                        </a>
                      </div>

                      <button
                        onClick={() => handleDeleteApt(apt.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                        title="Delete Appointment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ADHERENCE ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'adherence' && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Adherence Analytics & Compliance</h2>
            <p className="text-xs text-gray-500">Therapeutic compliance rates and weekly adherence performance</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-3xl">
              <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300">Taken Doses</span>
              <p className="text-2xl font-black text-emerald-900 dark:text-white mt-1">{adherence.taken}</p>
              <span className="text-[10px] text-emerald-700">Confirmed on schedule</span>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 rounded-3xl">
              <span className="text-[10px] font-black uppercase text-red-800 dark:text-red-300">Missed Doses</span>
              <p className="text-2xl font-black text-red-900 dark:text-white mt-1">{adherence.missed}</p>
              <span className="text-[10px] text-red-700">&gt;2 hours overdue</span>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-3xl">
              <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300">Skipped Doses</span>
              <p className="text-2xl font-black text-amber-900 dark:text-white mt-1">{adherence.skipped}</p>
              <span className="text-[10px] text-amber-700">Logged with reason</span>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-3xl">
              <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-300">Total Doses</span>
              <p className="text-2xl font-black text-blue-900 dark:text-white mt-1">{adherence.totalScheduled}</p>
              <span className="text-[10px] text-blue-700">Scheduled for today</span>
            </div>
          </div>

          {/* Adherence Health Tips Card */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-teal-600 flex items-center gap-1.5">
              <ShieldCheck size={16} /> Clinical Adherence Guidance
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Maintaining regular medication schedules keeps therapeutic drug plasma concentrations steady. 
              If you ever miss a dose by more than 4 hours, do not take a double dose without verifying with your doctor.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      <AddMedicationModal
        isOpen={isAddMedOpen}
        onClose={() => setIsAddMedOpen(false)}
        onSaved={loadData}
        medicationToEdit={medToEdit}
        userId={user?.uid}
      />

      <AddAppointmentModal
        isOpen={isAddAptOpen}
        onClose={() => setIsAddAptOpen(false)}
        onSaved={loadData}
        userId={user?.uid}
      />

      <DoseActionModal
        isOpen={isDoseActionOpen}
        onClose={() => setIsDoseActionOpen(false)}
        dose={activeDose}
        onUpdated={loadData}
        userId={user?.uid}
      />

      <RefillManageModal
        isOpen={isRefillOpen}
        onClose={() => setIsRefillOpen(false)}
        medications={state.medications}
        onRefilled={loadData}
        userId={user?.uid}
      />
    </div>
  );
};

export default MedicineTrackerPage;
