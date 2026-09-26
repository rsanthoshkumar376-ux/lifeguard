import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans items-center justify-start">
      {/* Sleek mobile/desktop frame with ample bottom padding so BottomNav never overlaps buttons */}
      <main className="flex-1 pb-32 max-w-md md:max-w-lg w-full bg-white shadow-2xl min-h-screen relative flex flex-col overflow-x-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
