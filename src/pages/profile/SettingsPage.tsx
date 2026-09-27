import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Shield, Globe, Moon, Sun, Info, Trash2, LogOut, ChevronRight, Check, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { performFullAppReset } from '../../utils/resetApp';
import LanguageModal, { LANGUAGES } from '../../components/common/LanguageModal';

const SettingsPage: React.FC = () => {
  const { logout } = useAuth() as any;
  const { i18n } = useTranslation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const activeLangCode = i18n.language ? i18n.language.split('-')[0] : 'en';
  const currentLangObj = LANGUAGES.find(l => l.code === activeLangCode) || LANGUAGES[0];

  const SettingItem = ({ icon: Icon, title, value, onClick, textClass = "text-gray-900" }: any) => (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-white border-b border-gray-100 active:bg-gray-50 cursor-pointer transition-colors">
       <div className="flex items-center">
         <Icon size={20} className={`mr-3 text-gray-400 ${textClass === 'text-red-600' ? 'text-red-500' : ''}`} />
         <span className={`font-medium text-sm ${textClass}`}>{title}</span>
       </div>
       <div className="flex items-center text-gray-400 text-sm">
         {value && <span className="mr-2 text-xs font-semibold text-gray-500">{value}</span>}
         <ChevronRight size={16} />
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-20 text-gray-900 transition-colors">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center border-b border-gray-100">
        <Link to="/" className="mr-4 text-gray-600 hover:text-gray-900"><ArrowLeft size={24} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="mt-4 space-y-4 max-w-lg mx-auto">
        {/* Account Group */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 tracking-wider">Account</h2>
          <div className="bg-white border-t border-b border-gray-200">
             <SettingItem icon={User} title="Profile Information" />
             <SettingItem icon={Shield} title="Privacy & Security" />
          </div>
        </div>

        {/* Preferences Group */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 tracking-wider">Preferences</h2>
          <div className="bg-white border-t border-b border-gray-200">
             <SettingItem 
               icon={Globe} 
               title="Language" 
               value={currentLangObj?.native ? `${currentLangObj.native} (${currentLangObj.name})` : "English"} 
               onClick={() => setIsLangModalOpen(true)}
             />

             {/* Dark Mode Interactive Row */}
             <div 
               onClick={toggleTheme}
               className="flex items-center justify-between p-4 bg-white border-b border-gray-100 active:bg-gray-50 cursor-pointer select-none transition-colors"
             >
               <div className="flex items-center">
                 {isDark ? (
                   <Moon size={20} className="mr-3 text-indigo-400" />
                 ) : (
                   <Sun size={20} className="mr-3 text-amber-500" />
                 )}
                 <div>
                   <span className="font-medium text-sm text-gray-900 block">Dark Mode</span>
                   <span className="text-[11px] text-gray-500">
                     {isDark ? 'Dark theme active' : 'Light theme active'}
                   </span>
                 </div>
               </div>
               
               <div className="flex items-center gap-2">
                 <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-900/40 text-indigo-300' : 'bg-gray-100 text-gray-600'}`}>
                   {isDark ? 'ON' : 'OFF'}
                 </span>
                 <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isDark} 
                      onChange={toggleTheme} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                 </label>
               </div>
             </div>
          </div>
        </div>

        {/* About Group */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 tracking-wider">About</h2>
          <div className="bg-white border-t border-b border-gray-200">
             <SettingItem icon={Info} title="Terms of Service" />
             <SettingItem icon={Info} title="Privacy Policy" />
             <div className="p-4 bg-white border-b border-gray-100 text-sm text-gray-500 flex justify-between">
                <span>App Version</span>
                <span className="font-semibold text-gray-700">1.0.0</span>
             </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-2">
          <div className="bg-white border-t border-b border-gray-200">
             <div onClick={logout} className="flex items-center justify-center p-4 bg-white border-b border-gray-100 active:bg-gray-50 cursor-pointer text-blue-600 font-bold text-sm">
                <LogOut size={18} className="mr-2" /> Log Out
             </div>
             <div 
               onClick={() => {
                 if (window.confirm('Reset entire app to factory state? This will clear all local test requests, donations, medical profiles, and chat logs.')) {
                   performFullAppReset();
                 }
               }} 
               className="flex items-center justify-center p-4 bg-white border-b border-gray-100 active:bg-amber-50 cursor-pointer text-amber-600 font-bold text-sm"
             >
                <RotateCcw size={18} className="mr-2" /> Reset App to Factory State
             </div>
             <div 
               onClick={() => {
                 if (window.confirm('Are you sure you want to delete your account and clear all local data?')) {
                   performFullAppReset();
                 }
               }} 
               className="flex items-center justify-center p-4 bg-white active:bg-red-50 cursor-pointer text-red-600 font-bold text-sm"
             >
                <Trash2 size={18} className="mr-2" /> Delete Account & Erase Data
             </div>
          </div>
        </div>
      </div>

      <LanguageModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
    </div>
  );
};

export default SettingsPage;
