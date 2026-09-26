import React, { useState } from 'react';
import { AlertCircle, Info, X } from 'lucide-react';

interface DisclaimerBannerProps {
  type?: 'warning' | 'info';
  message: string;
  dismissible?: boolean;
}

const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ 
  type = 'warning', 
  message, 
  dismissible = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const isWarning = type === 'warning';
  const bgColor = isWarning ? 'bg-amber-50' : 'bg-blue-50';
  const borderColor = isWarning ? 'border-amber-200' : 'border-blue-200';
  const textColor = isWarning ? 'text-amber-800' : 'text-blue-800';
  const iconColor = isWarning ? 'text-amber-500' : 'text-blue-500';

  return (
    <div className={`flex items-start p-4 ${bgColor} border ${borderColor} rounded-lg relative`}>
      <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
        {isWarning ? <AlertCircle size={20} /> : <Info size={20} />}
      </div>
      <div className={`ml-3 mr-6 text-sm ${textColor}`}>
        <p>{message}</p>
      </div>
      {dismissible && (
        <button 
          onClick={() => setIsVisible(false)}
          className={`absolute top-4 right-4 p-0.5 rounded-md hover:bg-black/5 transition-colors ${textColor}`}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default DisclaimerBanner;
