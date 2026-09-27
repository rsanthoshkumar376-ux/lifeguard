import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Shield, Globe, Moon, Info, Trash2, LogOut, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LanguageModal, { LANGUAGES } from '../../components/common/LanguageModal';

const SettingsPage: React.FC = () => {
  const { logout } = useAuth() as any;
  const { i18n } = useTranslation();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const activeLangCode = i18n.language ? i18n.language.split('-')[0] : 'en';
  const currentLangObj = LANGUAGES.find(l => l.code === activeLangCode) || LANGUAGES[0];

  const SettingItem = ({ icon: Icon, title, value, onClick, textClass = "text-gray-900" }: any) => (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-white border-b border-gray-50 active:bg-gray-50 cursor-pointer">
       <div className="flex items-center">
         <Icon size={20} className={`mr-3 text-gray-400 ${textClass === 'text-red-600' ? 'text-red-500' : ''}`} />
         <span className={`font-medium ${textClass}`}>{title}</span>
       </div>
       <div className="flex items-center text-gray-400 text-sm">
         {value && <span className="mr-2">{value}</span>}
         <ChevronRight size={16} />
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center">
        <Link to="/" className="mr-4 text-gray-600"><ArrowLeft size={24} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="mt-4 space-y-4">
        {/* Account Group */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase px-4 mb-2">Account</h2>
          <div className="bg-white border-t border-b border-gray-200">
             <SettingItem icon={User} title="Profile Information" />
             <SettingItem icon={Shield} title="Privacy & Security" />
          </div>
        </div>

        {/* Preferences Group */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase px-4 mb-2">Preferences</h2>
          <div className="bg-white border-t border-b border-gray-200">
             <SettingItem 
               icon={Globe} 
               title="Language" 
               value={currentLangObj?.native ? `${currentLangObj.native} (${currentLangObj.name})` : "English"} 
               onClick={() => setIsLangModalOpen(true)}
             />
             <div className="flex items-center justify-between p-4 bg-white border-b border-gray-50">
               <div className="flex items-center">
                 <Moon size={20} className="mr-3 text-gray-400" />
                 <span className="font-medium text-gray-900">Dark Mode</span>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
               </label>
             </div>
          </div>
        </div>

        {/* About Group */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase px-4 mb-2">About</h2>
          <div className="bg-white border-t border-b border-gray-200">
             <SettingItem icon={Info} title="Terms of Service" />
             <SettingItem icon={Info} title="Privacy Policy" />
             <div className="p-4 bg-white border-b border-gray-50 text-sm text-gray-500 flex justify-between">
                <span>App Version</span>
                <span>1.0.0</span>
             </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4">
          <div className="bg-white border-t border-b border-gray-200">
             <div onClick={logout} className="flex items-center justify-center p-4 bg-white border-b border-gray-50 active:bg-gray-50 cursor-pointer text-blue-600 font-bold">
                <LogOut size={20} className="mr-2" /> Log Out
             </div>
             <div className="flex items-center justify-center p-4 bg-white active:bg-red-50 cursor-pointer text-red-600 font-bold">
                <Trash2 size={20} className="mr-2" /> Delete Account
             </div>
          </div>
        </div>
      </div>

      <LanguageModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
    </div>
  );
};

export default SettingsPage;
