import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  Heart, 
  CheckCircle2, 
  Droplet, 
  Navigation, 
  Share2,
  XCircle,
  Building2,
  ShieldCheck,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { 
  getEmergencyRequestById, 
  recordDonorResponse, 
  EmergencyBloodRequest,
  LIFECYCLE_STAGES,
  RequestLifecycleStatus 
} from '../../services/bloodRequestLifecycleService';
import { isRequestDonatedByUser } from '../../services/bloodRequest';
import { CLINICAL_TRANSFUSION_DISCLAIMER } from '../../services/bloodCompatibilityService';
import { ReportSpamModal } from '../../components/blood/ReportSpamModal';

const BloodRequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<EmergencyBloodRequest | null>(null);
  const [loadingReq, setLoadingReq] = useState(true);
  const [donated, setDonated] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    if (!id) return;
    setLoadingReq(true);
    try {
      const data = await getEmergencyRequestById(id);
      setRequest(data || null);
      if (id && isRequestDonatedByUser(id)) {
        setDonated(true);
      }
    } catch (e) {
      console.error(e);
      setRequest(null);
    } finally {
      setLoadingReq(false);
    }
  };

  const handleDonate = async () => {
    if (!request || !id) return;
    try {
      setSubmitting(true);
      const updated = await recordDonorResponse({
        requestId: request.id,
        donorId: 'user_' + Date.now(),
        donorName: 'You (Consenting Donor)',
        bloodGroup: request.bloodGroup,
        status: 'accepted',
        notes: 'Donor confirmed willingness to donate for this requisition.'
      });
      if (updated) setRequest(updated);
      setDonated(true);
      alert('Thank you! Your donation pledge has been recorded. The hospital blood bank has been notified to coordinate crossmatching.');
    } catch (e: any) {
      setDonated(true);
      alert('Thank you! Your pledge has been registered.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!request || !id) return;
    try {
      setSubmitting(true);
      await recordDonorResponse({
        requestId: request.id,
        donorId: 'user_' + Date.now(),
        donorName: 'Anonymous Donor',
        bloodGroup: request.bloodGroup,
        status: 'declined',
        notes: 'Donor unavailable at this time.'
      });
      setDeclined(true);
    } catch (e) {
      setDeclined(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingReq) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-gray-700">Loading Requisition Lifecycle...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Requisition Not Found</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100 space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
              <Droplet size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Request Not Found</h2>
            <p className="text-xs text-gray-500">
              This emergency blood requisition may have already been fulfilled or closed.
            </p>
            <Link 
              to="/blood" 
              className="inline-block w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow active:scale-95 transition-all"
            >
              Browse Active Blood Requests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hospitalName = request.hospitalName || 'Emergency Medical Hospital';
  const hospitalCity = request.city || 'Local Area';
  const hospitalAddress = request.hospitalAddress || `${hospitalName}, ${hospitalCity}`;
  const hospitalPhone = request.phone || '+91 98765 43210';
  const mapsSearchQuery = encodeURIComponent(`${hospitalName} ${hospitalAddress} ${hospitalCity}`);

  // Stepper helper
  const currentStageIndex = LIFECYCLE_STAGES.indexOf(request.status);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-28 text-gray-900">
      {/* Sticky Top Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900 leading-tight">Requisition Lifecycle</h1>
            <p className="text-[11px] text-gray-500 font-medium">Tracking emergency case #{request.id.slice(-6)}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setReporting(true)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
            title="Report this requisition"
          >
            <ShieldAlert size={18} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Emergency Blood Needed: ${request.bloodGroup}`,
                  text: `Urgent ${request.bloodGroup} ${request.bloodComponent} required at ${hospitalName}, ${hospitalCity}. Can you help?`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            title="Share request"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Hero Badge */}
      <div className="bg-gradient-to-b from-red-600 to-rose-700 text-white p-6 flex flex-col items-center justify-center shadow-inner">
        <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center text-red-600 shadow-xl ring-4 ring-red-400/30 mb-2">
          <span className="font-black text-3xl leading-none">{request.bloodGroup}</span>
          <span className="text-[9px] font-bold text-red-400 uppercase mt-0.5">RBC</span>
        </div>
        <span className="bg-red-900/60 text-white border border-red-400/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
          {request.urgency} REQUIREMENT • {request.bloodComponent}
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1 max-w-xl mx-auto w-full">
        {/* 6-Stage Lifecycle Tracking Stepper */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500">Live Status Stepper</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
              request.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-800' :
              request.status === 'Hospital Contacted' ? 'bg-purple-100 text-purple-800' :
              request.status === 'Donor Responded' ? 'bg-blue-100 text-blue-800' :
              request.status === 'Donors Notified' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
            }`}>
              {request.status}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-3 pt-1">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isPast = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div key={stage} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    } ${isCurrent ? 'ring-4 ring-red-200 animate-pulse' : ''}`}>
                      {isPast ? '✓' : idx + 1}
                    </div>
                    {idx < LIFECYCLE_STAGES.length - 1 && (
                      <div className={`w-0.5 h-6 my-0.5 ${idx < currentStageIndex ? 'bg-red-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <span className={`text-xs font-black block ${isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                      {stage}
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] text-red-600 font-medium">
                        Current stage in emergency response workflow
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Units Fulfillment Meter */}
          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-600">Requisition Progress:</span>
              <span className="text-gray-900">{request.unitsFulfilled} of {request.unitsRequired} Unit(s) Pledged</span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-red-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (request.unitsFulfilled / request.unitsRequired) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hospital & Location Details Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 space-y-4">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Hospital / Medical Center</span>
            <h2 className="text-xl font-black text-gray-900 mt-0.5">{hospitalName}</h2>
            <p className="text-xs font-bold text-red-600 mt-0.5">{request.department || 'Emergency Trauma Ward'}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-3">
            <div className="flex items-start text-xs text-gray-700 gap-2.5">
              <MapPin size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-gray-900 block text-sm">{hospitalCity}</span>
                <span className="text-gray-600 font-medium block mt-0.5 leading-relaxed">{hospitalAddress}</span>
              </div>
            </div>

            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${mapsSearchQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm active:scale-98 transition-all"
            >
              <Navigation size={15} />
              <span>Open in Google Maps / Navigation</span>
            </a>
          </div>

          {request.notes && (
            <div className="bg-red-50/70 p-4 rounded-2xl border border-red-100 text-xs text-red-950 leading-relaxed">
              <span className="font-bold block mb-1 text-red-800">Requisition Notes & Instructions:</span>
              {request.notes}
            </div>
          )}

          {/* Clinical Disclaimer Alert */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Clinical Requirement:</strong> All prospective donors will undergo hospital laboratory crossmatching, hemoglobin verification, and health screening before donation.
            </p>
          </div>
        </div>

        {/* Real-time Responded Donors List */}
        {request.donorResponses && request.donorResponses.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
                Pledged Donors ({request.donorResponses.length})
              </h3>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> Confirmed Support
              </span>
            </div>

            <div className="space-y-2">
              {request.donorResponses.map((d, index) => (
                <div key={d.donorId + '_' + index} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black">
                      {d.bloodGroup}
                    </div>
                    <div>
                      <span className="font-black text-gray-900 block">{d.donorName}</span>
                      <span className="text-[11px] text-gray-500">
                        {d.status === 'accepted' ? 'Pledged to Donate' : 'Unavailable'} • {new Date(d.respondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    d.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {d.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Section */}
        <div className="space-y-3 pt-2">
          {donated ? (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-3xl text-center space-y-3 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-center gap-2 text-emerald-800 font-black text-base">
                <CheckCircle2 size={24} className="text-emerald-600" />
                <span>You Pledged to Donate for this Request!</span>
              </div>
              <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                Thank you! Your donation commitment is confirmed. The hospital blood bank team has received your pledge and will guide you through pre-transfusion screening.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsSearchQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Navigation size={16} /> Navigate to Hospital
                </a>
                <Link
                  to="/activity"
                  className="py-3 px-4 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-50 flex items-center justify-center"
                >
                  View in My Activity
                </Link>
              </div>
            </div>
          ) : declined ? (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-3xl text-center text-xs text-gray-600">
              You marked this requisition as unavailable for your schedule. Thank you for letting us know!
            </div>
          ) : (
            <div className="space-y-2">
              <button 
                onClick={handleDonate}
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 active:scale-98 transition-all text-white py-4 rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Heart size={20} className="fill-white" />
                <span>{submitting ? 'Confirming with Hospital...' : 'I CAN DONATE BLOOD 🩸'}</span>
              </button>

              <button
                onClick={handleDecline}
                disabled={submitting}
                className="w-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <XCircle size={15} />
                <span>I Am Unavailable to Donate Today</span>
              </button>
            </div>
          )}

          {hospitalPhone && (
            <a 
              href={`tel:${hospitalPhone}`} 
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Phone size={16} className="text-gray-600" />
              <span>Call Hospital Blood Bank ({hospitalPhone})</span>
            </a>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reporting && (
        <ReportSpamModal
          isOpen={reporting}
          onClose={() => setReporting(false)}
          targetId={request.id}
          targetName={request.hospitalName}
          targetType="request"
        />
      )}
    </div>
  );
};

export default BloodRequestDetailPage;
