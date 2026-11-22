import React, { useState } from 'react';
import { 
  ShieldAlert, MapPin, Clock, CheckCircle2, AlertTriangle, 
  PhoneCall, ExternalLink, Activity, ArrowRight, UserCheck
} from 'lucide-react';
import { 
  FamilyEmergencyAlert, 
  acknowledgeCircleEmergency, 
  resolveCircleEmergency 
} from '../../services/familyCircleService';

interface Props {
  alerts: FamilyEmergencyAlert[];
  currentUserId: string;
  currentUserName: string;
  onAlertUpdated?: () => void;
}

export const FamilyEmergencyDashboard: React.FC<Props> = ({
  alerts,
  currentUserId,
  currentUserName,
  onAlertUpdated
}) => {
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const activeAlerts = alerts.filter(a => a.status !== 'Resolved');
  const resolvedAlerts = alerts.filter(a => a.status === 'Resolved');

  const handleAcknowledge = async (caseId: string) => {
    setAcknowledgingId(caseId);
    try {
      await acknowledgeCircleEmergency(
        caseId,
        currentUserId,
        currentUserName,
        'Assisting immediately'
      );
      if (onAlertUpdated) onAlertUpdated();
    } catch (err) {
      console.error(err);
      alert('Failed to acknowledge emergency alert.');
    } finally {
      setAcknowledgingId(null);
    }
  };

  const handleResolve = async (caseId: string) => {
    if (!resolutionNote.trim()) {
      alert('Please provide a brief resolution note for family case records.');
      return;
    }
    try {
      await resolveCircleEmergency(caseId, resolutionNote.trim(), currentUserId);
      setResolvingId(null);
      setResolutionNote('');
      if (onAlertUpdated) onAlertUpdated();
    } catch (err) {
      console.error(err);
      alert('Failed to resolve case.');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-red-500/10 to-amber-500/10 border border-red-200 dark:border-red-900/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
            <ShieldAlert size={20} className={activeAlerts.length > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              Family Emergency Dashboard
              {activeAlerts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white animate-pulse">
                  {activeAlerts.length} ACTIVE SOS
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live SOS events, accident impact sensors, and GPS coordination across family circle
            </p>
          </div>
        </div>

        <a
          href="tel:108"
          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
        >
          <PhoneCall size={14} />
          <span>Call 108</span>
        </a>
      </div>

      {/* Active Emergencies List */}
      {activeAlerts.length === 0 ? (
        <div className="p-8 rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">All Family Members Safe</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            No active SOS distress signals or fall incidents reported across your circle right now.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAlerts.map((alert) => {
            const hasAcknowledged = alert.acknowledgedBy.some(a => a.userId === currentUserId);
            const timeAgo = Math.max(1, Math.round((Date.now() - new Date(alert.timestamp).getTime()) / 60000));

            return (
              <div
                key={alert.caseId}
                className="p-5 rounded-3xl border-2 border-red-500 bg-red-50/30 dark:bg-red-950/20 shadow-md space-y-4 animate-in fade-in"
              >
                {/* Alert Top */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping shrink-0" />
                    <div>
                      <h4 className="font-black text-base text-red-950 dark:text-red-100 flex items-center gap-2">
                        {alert.memberName}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200">
                          {alert.category}
                        </span>
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Clock size={12} />
                        <span>Triggered {timeAgo} min ago ({new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                    alert.status === 'Acknowledged'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
                  }`}>
                    {alert.status === 'Acknowledged' ? '⚠️ Assistance In Progress' : '🚨 Unacknowledged SOS'}
                  </span>
                </div>

                {/* Location Box */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        GPS Coordinates: {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        Captured at {new Date(alert.location.capturedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <a
                    href={alert.location.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Impact Sensor Badge if available */}
                {alert.impactDetected && (
                  <div className="p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2 font-medium">
                    <Activity size={14} className="text-amber-600 shrink-0" />
                    <span>Sudden physical impact & prolonged inactivity verified by accelerometer.</span>
                  </div>
                )}

                {/* Acknowledgements List */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                    Contact Acknowledgement Status ({alert.acknowledgedBy.length}):
                  </span>
                  {alert.acknowledgedBy.length === 0 ? (
                    <p className="text-xs text-rose-600 dark:text-rose-400 italic">
                      No family member has confirmed assistance yet. Please respond!
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {alert.acknowledgedBy.map((ack, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <UserCheck size={14} className="text-emerald-500" />
                            {ack.name} {ack.userId === currentUserId && '(You)'}
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            {new Date(ack.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-red-200/60 dark:border-red-900/30">
                  <a
                    href={`tel:${alert.memberPhone}`}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 hover:bg-gray-50 shadow-sm"
                  >
                    <PhoneCall size={14} className="text-emerald-600" />
                    <span>Call {alert.memberName}</span>
                  </a>

                  <div className="flex items-center gap-2">
                    {!hasAcknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert.caseId)}
                        disabled={acknowledgingId === alert.caseId}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <CheckCircle2 size={14} />
                        <span>{acknowledgingId === alert.caseId ? 'Acknowledging...' : 'I Am Assisting'}</span>
                      </button>
                    )}

                    {resolvingId === alert.caseId ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Paramedics arrived, patient stable."
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-white bg-white dark:bg-slate-900 outline-none"
                        />
                        <button
                          onClick={() => handleResolve(alert.caseId)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          Confirm Resolve
                        </button>
                        <button
                          onClick={() => setResolvingId(null)}
                          className="text-xs text-gray-400 hover:text-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolvingId(alert.caseId)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <CheckCircle2 size={14} />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Resolved Incidents History */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Resolved Family Cases ({resolvedAlerts.length})
          </span>
          <div className="space-y-2">
            {resolvedAlerts.map(alert => (
              <div key={alert.caseId} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">
                    {alert.memberName} — {alert.category}
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {new Date(alert.timestamp).toLocaleDateString()} • {alert.resolutionNotes || 'Resolved safely'}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Resolved ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default FamilyEmergencyDashboard;
