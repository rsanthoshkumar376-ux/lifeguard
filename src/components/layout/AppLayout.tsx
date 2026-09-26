import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 pb-16 max-w-md mx-auto w-full bg-white shadow-sm min-h-screen relative">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
