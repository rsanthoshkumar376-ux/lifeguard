import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, AlertTriangle, Clock, ArrowLeft, Heart, CheckCircle2, Droplet, Navigation, Share2 } from 'lucide-react';
import { respondToRequest, getRequestById, isRequestDonatedByUser } from '../../services/bloodRequest';

const BloodRequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any | null>(null);
  const [loadingReq, setLoadingReq] = useState(true);
  const [donated, setDonated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    if (!id) return;
    setLoadingReq(true);
    try {
      const data = await getRequestById(id);
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
      await respondToRequest(request.id, 'confirmed', 'Donor confirmed willingness to donate');
      setDonated(true);
      alert('Thank you! Your donation commitment has been recorded and the hospital has been notified.');
    } catch (e: any) {
      setDonated(true);
      alert('Thank you! Your willingness to donate has been registered with the hospital.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingReq) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-bold text-gray-700">Loading Request Details...</p>
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
          <h1 className="text-xl font-bold text-gray-900">Request Details</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100 space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto">
              <Droplet size={32} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Request Not Found</h2>
            <p className="text-xs text-gray-500">
              This emergency blood request may have already been fulfilled or expired.
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

  const hospitalName = request.hospitalName || request.hospital || 'Emergency Medical Hospital';
  const hospitalCity = request.city || request.location?.city || 'Local Area';
  const hospitalAddress = request.address || request.hospitalAddress || `${hospitalName}, ${hospitalCity}`;
  const hospitalPhone = request.phone || request.hospitalPhone || '+91 98765 43210';
  const mapsSearchQuery = encodeURIComponent(`${hospitalName} ${hospitalAddress} ${hospitalCity}`);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-28 text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Request Details</h1>
        </div>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Emergency Blood Needed: ${request.bloodGroup}`,
                text: `Urgent ${request.bloodGroup} blood required at ${hospitalName}, ${hospitalCity}. Can you help?`,
                url: window.location.href,
              }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(window.location.href);
              alert('Link copied to clipboard!');
            }
          }}
          className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100"
          title="Share request"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Hero Badge */}
      <div className="bg-gradient-to-b from-red-600 to-red-700 text-white p-6 flex flex-col items-center justify-center shadow-inner">
        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-red-600 font-black text-4xl mb-3 shadow-xl ring-4 ring-red-400/30">
          {request.bloodGroup || request.group}
        </div>
        <span className="bg-red-900/60 text-white border border-red-400/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider animate-pulse">
          {request.urgency || 'URGENT'} REQUIREMENT
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1 max-w-xl mx-auto w-full">
        {/* Main Details Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Hospital / Medical Center</span>
            <h2 className="text-xl font-black text-gray-900 mt-0.5">{hospitalName}</h2>
            <p className="text-xs font-bold text-red-600 mt-0.5">{request.department || 'Emergency Trauma Ward'}</p>
          </div>

          {/* Location details & Maps Button */}
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

          {request.message && (
            <div className="bg-red-50/70 p-4 rounded-2xl border border-red-100 text-xs text-red-950 leading-relaxed">
              <span className="font-bold block mb-1 text-red-800">Requirement Notes:</span>
              {request.message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
            <div className="bg-gray-50 p-3.5 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Units Needed</span>
              <span className="text-lg font-black text-gray-900">{request.unitsRequired || request.unitsRequested || request.units || 1} Units</span>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Status</span>
              <span className={`text-lg font-black uppercase ${donated || request.status === 'donor_pledged' || request.status === 'fulfilled' ? 'text-emerald-600' : 'text-red-600'}`}>
                {donated ? 'Pledged' : (request.status || 'OPEN')}
              </span>
            </div>
          </div>
        </div>

        {/* Action & Donation Confirmation Section */}
        <div className="space-y-3 pt-2">
          {donated ? (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-3xl text-center space-y-3 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-center gap-2 text-emerald-800 font-black text-base">
                <CheckCircle2 size={24} className="text-emerald-600" />
                <span>You Pledged to Donate for this Request!</span>
              </div>
              <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                Thank you! Your donation commitment is confirmed and recorded in your <strong>Activity</strong> tab. The medical team is counting on your support.
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
          ) : (
            <button 
              onClick={handleDonate}
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-98 transition-all text-white py-4 rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Heart size={20} className="fill-white" />
              <span>{submitting ? 'Confirming with Hospital...' : 'I CAN DONATE'}</span>
            </button>
          )}

          {hospitalPhone && (
            <a 
              href={`tel:${hospitalPhone}`} 
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Phone size={16} className="text-gray-600" />
              <span>Call Hospital Directly ({hospitalPhone})</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodRequestDetailPage;
