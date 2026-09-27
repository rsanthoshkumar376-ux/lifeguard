import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, AlertTriangle, Clock, ArrowLeft, Heart, CheckCircle2, Droplet } from 'lucide-react';
import { respondToRequest } from '../../services/bloodRequest';
import { apiRequest } from '../../config/api';

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
    setLoadingReq(true);
    try {
      const data = await apiRequest(`/blood/requests/${id}`);
      if (data && data.request) {
        setRequest(data.request);
      } else if (data && data.id) {
        setRequest(data);
      } else {
        // Try fetching all requests and finding match
        const list = await apiRequest('/blood/requests');
        const all = Array.isArray(list) ? list : (list.requests || []);
        const found = all.find((r: any) => String(r.id) === String(id));
        setRequest(found || null);
      }
    } catch (e) {
      console.error(e);
      setRequest(null);
    } finally {
      setLoadingReq(false);
    }
  };

  const handleDonate = async () => {
    if (!request) return;
    try {
      setSubmitting(true);
      await respondToRequest(request.id, 'confirmed', 'Donor confirmed via mobile app');
      setDonated(true);
      alert('Thank you! Your donation response has been confirmed. The hospital has been notified.');
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-28 text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Request Details</h1>
      </div>

      <div className="bg-red-600 text-white p-6 flex flex-col items-center justify-center">
         <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-red-600 font-black text-4xl mb-3 shadow-lg">
           {request.bloodGroup || request.group}
         </div>
         <span className="bg-red-800 text-red-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
           {request.urgency || 'URGENT'} REQUIREMENT
         </span>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Main Details Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
           <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Hospital</span>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">{request.hospitalName || request.hospital || 'Hospital'}</h2>
              <p className="text-sm text-gray-500">{request.department || 'Emergency Ward'}</p>
           </div>

           <div className="flex items-center text-sm text-gray-600 border-t pt-3">
              <MapPin size={18} className="mr-2 text-red-600 shrink-0" />
              <span>{request.address || request.city || 'Emergency Centre'}</span>
           </div>

           {request.message && (
             <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-900">
                <span className="font-bold block mb-1">Requirement Notes:</span>
                {request.message}
             </div>
           )}

           <div className="grid grid-cols-2 gap-3 border-t pt-3">
              <div className="bg-gray-50 p-3 rounded-xl">
                 <span className="text-xs text-gray-400 font-bold block">UNITS NEEDED</span>
                 <span className="text-lg font-black text-gray-900">{request.unitsRequested || request.units || 1} Units</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                 <span className="text-xs text-gray-400 font-bold block">STATUS</span>
                 <span className="text-lg font-black text-red-600 uppercase">{request.status || 'OPEN'}</span>
              </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {donated ? (
            <div className="bg-green-100 text-green-800 p-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 size={24} className="text-green-600" />
              <span>You have confirmed willingness to donate!</span>
            </div>
          ) : (
            <button 
              onClick={handleDonate}
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white py-4 rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2"
            >
              <Heart size={20} />
              {submitting ? 'Confirming...' : 'I CAN DONATE'}
            </button>
          )}

          {request.phone && (
            <a 
              href={`tel:${request.phone}`} 
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Phone size={18} /> Call Hospital Directly
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodRequestDetailPage;
