import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import AiFloatingButton from '../ai/AiFloatingButton';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isChatPage = 
    location.pathname.startsWith('/ai-chat') || 
    location.pathname.startsWith('/assistant') ||
    location.pathname.startsWith('/ai');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans items-center justify-start transition-colors duration-200">
      <main 
        className={`flex-1 w-full bg-white dark:bg-slate-900 shadow-2xl relative flex flex-col transition-colors duration-200 ${
          isChatPage 
            ? 'h-[100dvh] max-w-2xl pb-0 overflow-hidden' 
            : 'pb-32 max-w-md md:max-w-lg min-h-screen overflow-x-hidden'
        }`}
      >
        <Outlet />
      </main>
      <AiFloatingButton />
      <BottomNav />
    </div>
  );
};

export default AppLayout;
