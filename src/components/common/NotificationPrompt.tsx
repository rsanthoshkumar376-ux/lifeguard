import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { requestNotificationPermission } from '../../services/notifications';

const NotificationPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const hasPrompted = localStorage.getItem('hasPromptedForNotifications');
    const permission = window.Notification?.permission;
    
    if (!hasPrompted && permission === 'default') {
      // Small delay to not overwhelm user on first load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    const granted = await requestNotificationPermission('current-user-id'); // In real app, pass actual user ID
    if (granted) {
      console.log('Notifications enabled');
    }
    closePrompt();
  };

  const closePrompt = () => {
    localStorage.setItem('hasPromptedForNotifications', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={closePrompt}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 mx-auto">
          <Bell size={24} className="animate-wiggle" />
        </div>

        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
          Enable Notifications
        </h3>
        
        <p className="text-center text-gray-600 mb-6 text-sm">
          Get instant alerts for emergency blood requests near you. Your quick response could save a life.
        </p>

        <div className="space-y-3">
          <button 
            onClick={handleEnable}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            Enable Notifications
          </button>
          <button 
            onClick={closePrompt}
            className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
