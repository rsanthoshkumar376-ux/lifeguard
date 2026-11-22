import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import DesktopNavbar from './DesktopNavbar';
import AiFloatingButton from '../ai/AiFloatingButton';
import QuickEmergencyButton from '../emergency/QuickEmergencyButton';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isChatPage = 
    location.pathname.startsWith('/ai-chat') || 
    location.pathname.startsWith('/assistant') ||
    location.pathname.startsWith('/ai');

  const isSeniorPage = 
    location.pathname.startsWith('/senior-mode') || 
    location.pathname.startsWith('/family/senior');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Desktop Navigation (visible on md: and above) */}
      {!isChatPage && !isSeniorPage && <DesktopNavbar />}

      {/* Main Content Area */}
      <main 
        role="main"
        className={`flex-1 w-full bg-white dark:bg-slate-900 shadow-xl relative flex flex-col transition-colors duration-200 mx-auto ${
          isChatPage 
            ? 'h-[100dvh] max-w-4xl pb-0 overflow-hidden' 
            : 'pb-24 md:pb-12 max-w-7xl min-h-[calc(100vh-4rem)] overflow-x-hidden'
        }`}
      >
        <Outlet />
      </main>

      {/* Floating Quick Emergency Button - Persistent throughout application */}
      {!isSeniorPage && <QuickEmergencyButton />}

      {/* Floating AI Medical Assistant Button */}
      {!isSeniorPage && <AiFloatingButton />}

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default AppLayout;
