import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Home, AlertTriangle, HeartPulse, Droplets, Activity, 
  Bot, Users, User, Sun, Moon, ShieldAlert, LogIn
} from 'lucide-react';

export interface DesktopNavItem {
  path: string;
  label: string;
  icon: React.FC<any>;
  hasBadge?: boolean;
  isEmergency?: boolean;
}

const desktopNavItems: DesktopNavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/emergency/sos', label: 'Emergency', icon: AlertTriangle, isEmergency: true },
  { path: '/medical-id', label: 'Medical ID', icon: HeartPulse },
  { path: '/blood', label: 'Blood Network', icon: Droplets, hasBadge: true },
  { path: '/health-records', label: 'Health', icon: Activity },
  { path: '/ai-chat', label: 'AI Assistant', icon: Bot },
  { path: '/family', label: 'Family', icon: Users },
  { path: '/profile', label: 'Profile', icon: User },
];

export const DesktopNavbar: React.FC = () => {
  const { user } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">LifeGuard</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  HEALTH
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                Medical & Emergency Network
              </p>
            </div>
          </Link>

          {/* 8 Primary Navigation Items */}
          <nav className="flex items-center space-x-1" aria-label="Desktop Main Navigation">
            {desktopNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `
                  relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
                  ${item.isEmergency 
                    ? isActive 
                      ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400' 
                      : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700'
                    : isActive 
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold shadow-xs' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={16} className={item.isEmergency ? 'text-red-500 animate-pulse' : ''} />
                    <span>{item.label}</span>
                    {item.hasBadge && (
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right utility items: Theme Toggle, User Avatar/Login */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all active:scale-95"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs overflow-hidden">
                  {user.profilePhotoUrl ? (
                    <img src={user.profilePhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.fullName?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <span className="truncate max-w-[100px]">{user.fullName || 'User'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm active:scale-95 transition-all"
              >
                <LogIn size={14} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopNavbar;
