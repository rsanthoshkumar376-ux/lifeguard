import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, AlertTriangle, HeartPulse, Droplets, Activity, 
  Bot, Users, User 
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  shortLabel: string;
  icon: React.FC<any>;
  hasBadge?: boolean;
  isEmergency?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', shortLabel: 'Home', icon: Home },
  { path: '/emergency/sos', label: 'Emergency', shortLabel: 'SOS', icon: AlertTriangle, isEmergency: true },
  { path: '/medical-id', label: 'Medical ID', shortLabel: 'Med ID', icon: HeartPulse },
  { path: '/blood', label: 'Blood Network', shortLabel: 'Blood', icon: Droplets, hasBadge: true },
  { path: '/health-records', label: 'Health', shortLabel: 'Health', icon: Activity },
  { path: '/ai-chat', label: 'AI Assistant', shortLabel: 'AI', icon: Bot },
  { path: '/family', label: 'Family', shortLabel: 'Family', icon: Users },
  { path: '/profile', label: 'Profile', shortLabel: 'Profile', icon: User },
];

const BottomNav: React.FC = () => {
  const location = useLocation();

  // Hide BottomNav on chat, full-screen assistant, and senior mode pages
  if (
    location.pathname.startsWith('/ai-chat') ||
    location.pathname.startsWith('/assistant') ||
    location.pathname.startsWith('/ai') ||
    location.pathname.startsWith('/reset') ||
    location.pathname.startsWith('/senior-mode') ||
    location.pathname.startsWith('/family/senior')
  ) {
    return null;
  }

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe pt-1 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] transition-colors duration-200"
    >
      <div className="flex items-center justify-between h-14 max-w-lg mx-auto px-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center flex-1 h-full py-1 rounded-xl transition-all duration-150
              ${item.isEmergency
                ? isActive
                  ? 'text-red-600 dark:text-red-400 font-black'
                  : 'text-red-500/80 hover:text-red-600'
                : isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon 
                    size={item.isEmergency ? 20 : 18} 
                    className={`
                      ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}
                      ${item.isEmergency && isActive ? 'animate-bounce text-red-600' : ''}
                    `} 
                  />
                  {item.hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 border border-white dark:border-slate-900 rounded-full" />
                  )}
                </div>
                <span className={`text-[9px] tracking-tight leading-tight mt-0.5 ${isActive ? 'font-black' : 'font-medium'}`}>
                  {item.shortLabel}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
