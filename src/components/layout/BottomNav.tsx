import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Droplets, Heart, ClipboardList, User } from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.FC<any>;
  hasBadge?: boolean;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/blood', label: 'Blood', icon: Droplets, hasBadge: true },
  { path: '/medical-id', label: 'Medical ID', icon: Heart },
  { path: '/activity', label: 'Activity', icon: ClipboardList },
  { path: '/profile', label: 'Profile', icon: User },
];

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pb-safe pt-1 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-200">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center w-full h-full space-y-1 rounded-xl transition-all duration-200
              ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {item.hasBadge && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full translate-x-1 -translate-y-1" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
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
