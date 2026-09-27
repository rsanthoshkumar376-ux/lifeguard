import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans items-center justify-start transition-colors duration-200">
      {/* Sleek mobile/desktop frame with ample bottom padding so BottomNav never overlaps buttons */}
      <main className="flex-1 pb-32 max-w-md md:max-w-lg w-full bg-white dark:bg-slate-900 shadow-2xl min-h-screen relative flex flex-col overflow-x-hidden transition-colors duration-200">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
