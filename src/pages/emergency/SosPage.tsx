import React, { useState } from 'react';
import { AlertCircle, Phone, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SosPage = () => {
  const [status, setStatus] = useState<'IDLE' | 'CONFIRM' | 'ACTIVE'>('IDLE');
  const [location, setLocation] = useState<string>('');
  const navigate = useNavigate();

  const handleSosPress = () => {
    setStatus('CONFIRM');
  };

  const confirmSos = () => {
    setStatus('ACTIVE');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`),
        () => setLocation('Location unavailable')
      );
    }
  };

  const cancelSos = () => {
    setStatus('IDLE');
  };

  const handleShareLocation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency SOS',
          text: `I need help! My location is: https://maps.google.com/?q=${location}`,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (status === 'ACTIVE') {
    return (
      <div className="min-h-screen bg-red-600 text-white p-6 flex flex-col items-center">
        <AlertCircle size={64} className="animate-pulse mb-6" />
        <h1 className="text-4xl font-black mb-2">SOS ACTIVE</h1>
        <p className="text-red-200 mb-8 text-center font-medium">Alert sent to your emergency contacts.</p>

        {location && (
          <div className="bg-black/20 w-full p-4 rounded-xl mb-8 flex justify-between items-center">
            <div>
              <div className="text-xs text-red-200 uppercase font-bold tracking-wider">Current Location</div>
              <div className="font-mono text-lg">{location}</div>
            </div>
            <button onClick={handleShareLocation} className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <Navigation />
            </button>
          </div>
        )}

        <div className="w-full space-y-4 mb-8">
          <a href="tel:112" className="flex items-center justify-center gap-3 w-full bg-white text-red-700 p-5 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform">
            <Phone /> CALL 112 (NATIONAL)
          </a>
          <a href="tel:108" className="flex items-center justify-center gap-3 w-full bg-red-700 text-white p-5 rounded-2xl font-bold text-lg active:scale-95 transition-transform border border-red-500">
            <Phone /> CALL 108 (AMBULANCE)
          </a>
          <a href="tel:100" className="flex items-center justify-center gap-3 w-full bg-red-700 text-white p-5 rounded-2xl font-bold text-lg active:scale-95 transition-transform border border-red-500">
            <Phone /> CALL 100 (POLICE)
          </a>
        </div>

        <button onClick={() => navigate('/emergency/id')} className="w-full bg-black/40 text-white p-5 rounded-2xl font-bold text-lg mb-4">
          SHOW MEDICAL ID
        </button>
        
        <button onClick={cancelSos} className="mt-auto text-red-200 font-bold p-4 opacity-80 hover:opacity-100">
          CANCEL SOS
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      {status === 'CONFIRM' ? (
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Confirm SOS?</h2>
          <p className="text-slate-600 mb-8 font-medium">This will notify your emergency contacts and share your location.</p>
          <div className="flex gap-4">
            <button onClick={cancelSos} className="flex-1 p-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">
              Cancel
            </button>
            <button onClick={confirmSos} className="flex-1 p-4 rounded-xl font-black text-white bg-red-600 shadow-lg shadow-red-600/30">
              CONFIRM
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleSosPress}
          className="relative w-64 h-64 rounded-full bg-red-600 text-white shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center border-[12px] border-red-500/50 hover:scale-105 active:scale-95 transition-all duration-300 group"
        >
          <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-20 group-hover:opacity-40" />
          <span className="text-6xl font-black tracking-widest relative z-10">SOS</span>
          <span className="text-red-200 font-bold tracking-widest mt-2 relative z-10">TAP FOR HELP</span>
        </button>
      )}
    </div>
  );
};

export default SosPage;
