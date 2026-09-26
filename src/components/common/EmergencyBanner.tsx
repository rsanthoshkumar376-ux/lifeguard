import React, { useEffect, useState } from 'react';
import { Droplet, MapPin, X } from 'lucide-react';

interface EmergencyBannerProps {
  bloodGroup: string;
  hospitalName: string;
  distance: string;
  onDismiss?: () => void;
  onHelp?: () => void;
}

const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ 
  bloodGroup, 
  hospitalName, 
  distance,
  onDismiss,
  onHelp
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 30 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-600 rounded-xl shadow-2xl overflow-hidden z-50 animate-bounce-short">
      <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse"></div>
      
      <div className="relative p-4">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-white/70 hover:text-white rounded-full hover:bg-red-700 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white rounded-lg flex flex-col items-center justify-center text-red-600 shrink-0 shadow-inner">
            <Droplet size={20} className="mb-0.5 fill-red-600" />
            <span className="font-bold text-lg leading-none">{bloodGroup}</span>
          </div>

          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2 text-white/90 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Critical Match
            </div>
            <h3 className="font-semibold text-white leading-tight mb-1">{hospitalName}</h3>
            <p className="text-red-100 text-sm flex items-center gap-1">
              <MapPin size={14} /> {distance} away
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (onHelp) onHelp();
            handleDismiss();
          }}
          className="mt-4 w-full py-2.5 bg-white text-red-700 font-bold rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors uppercase text-sm tracking-wider shadow-sm"
        >
          Tap to Help
        </button>
      </div>
    </div>
  );
};

export default EmergencyBanner;
