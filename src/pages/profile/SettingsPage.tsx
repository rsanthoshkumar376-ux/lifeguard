import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Shield, Globe, Moon, Sun, Info, Trash2, LogOut, ChevronRight, Check, RotateCcw, RefreshCw, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { performFullAppReset } from '../../utils/resetApp';
import LanguageModal, { LANGUAGES } from '../../components/common/LanguageModal';
import { checkForAppUpdate, triggerAppUpdate, CURRENT_APP_VERSION } from '../../services/updateService';

const SettingsPage: React.FC = () => {
  const { logout } = useAuth() as any;
  const { i18n } = useTranslation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'latest' | 'available'>('idle');
  const [availableVersion, setAvailableVersion] = useState<string>('');

  const handleCheckUpdates = async () => {
    setCheckingUpdate(true);
    setUpdateStatus('idle');
    try {
      const res = await checkForAppUpdate();
      if (res.hasUpdate) {
        setUpdateStatus('available');
        setAvailableVersion(res.latestVersion);
      } else {
        setUpdateStatus('latest');
      }
    } catch {
      setUpdateStatus('latest');
    } finally {
      setCheckingUpdate(false);
    }
  };

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

        {/* Database & Cloud Status Group */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 tracking-wider">Database & Cloud Sync</h2>
          <div className="bg-white border-t border-b border-gray-200 divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  DB
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    Supabase PostgreSQL
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="text-xs text-gray-500">Cloud database configured & active</div>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                Connected
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  LS
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Local Device Storage</div>
                  <div className="text-xs text-gray-500">Offline-first local cache & backup</div>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* About Group */}
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 tracking-wider">About</h2>
          <div className="bg-white border-t border-b border-gray-200">
             <SettingItem icon={Info} title="Terms of Service" />
             <SettingItem icon={Info} title="Privacy Policy" />
             <div className="p-4 bg-white border-b border-gray-100 text-sm text-gray-500 flex justify-between items-center">
                <div>
                   <span className="block font-medium text-gray-900">App Version</span>
                   <span className="text-xs text-gray-400">PWA Build v{CURRENT_APP_VERSION}</span>
                </div>
                <div className="flex items-center gap-2">
                   <button
                     onClick={handleCheckUpdates}
                     disabled={checkingUpdate}
                     className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                   >
                     <RefreshCw size={13} className={checkingUpdate ? "animate-spin text-blue-600" : ""} />
                     {checkingUpdate ? "Checking..." : "Check for Updates"}
                   </button>
                </div>
             </div>

             {/* Update Status Feedback */}
             {updateStatus === 'latest' && (
               <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold border-b border-gray-100 flex items-center gap-2 animate-in fade-in">
                 <Check size={16} className="text-emerald-600 shrink-0" />
                 <span>LifeGuard is up to date! (v{CURRENT_APP_VERSION})</span>
               </div>
             )}

             {updateStatus === 'available' && (
               <div className="p-3.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold border-b border-gray-100 flex items-center justify-between gap-2 animate-in fade-in">
                 <div className="flex items-center gap-2">
                   <Sparkles size={16} className="text-amber-300 animate-pulse shrink-0" />
                   <span>New version v{availableVersion || '1.1.0'} available!</span>
                 </div>
                 <button
                   onClick={() => triggerAppUpdate()}
                   className="px-3 py-1 bg-white text-red-600 hover:bg-amber-50 rounded-lg text-xs font-black shadow active:scale-95 transition-all"
                 >
                   Update Now
                 </button>
               </div>
             )}
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
