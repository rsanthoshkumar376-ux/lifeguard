import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AiFloatingButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on Home and AI chat pages to avoid covering primary action buttons
  if (
    location.pathname === '/' || 
    location.pathname.startsWith('/ai-chat') || 
    location.pathname.startsWith('/assistant')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <button
        onClick={() => navigate('/ai-chat')}
        className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 hover:from-red-700 hover:to-rose-600 text-white rounded-full shadow-2xl shadow-red-500/40 active:scale-95 transition-all transform hover:scale-105"
        title="LifeGuard AI Medical Assistant"
      >
        {/* Pulsing ring */}
        <span className="absolute -inset-1 rounded-full bg-red-400 opacity-30 group-hover:opacity-60 animate-ping"></span>
        
        {/* Icon */}
        <div className="relative flex items-center justify-center">
          <Bot size={26} className="text-white" />
          <Sparkles size={12} className="absolute -top-1 -right-1 text-amber-300 animate-bounce" />
        </div>

        {/* Hover / Active Badge Tooltip */}
        <div className="absolute right-16 bg-gray-900/90 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <span>Ask LifeGuard AI 🩺</span>
        </div>
      </button>
    </div>
  );
};

export default AiFloatingButton;
