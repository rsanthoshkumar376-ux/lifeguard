import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check, Globe } from 'lucide-react';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', region: 'India / Global' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu & Puducherry' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', region: 'National / North India' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'Andhra Pradesh & Telangana' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'Kerala' },
];

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { i18n } = useTranslation();

  if (!isOpen) return null;

  const currentLang = i18n.language ? i18n.language.split('-')[0] : 'en';

  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-900">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Choose Language</h2>
              <p className="text-xs text-gray-500">மொழியைத் தேர்வுசெய்க / भाषा चुनें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Language Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {LANGUAGES.map(lang => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                  isSelected
                    ? 'border-red-500 bg-red-50/80 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div>
                  <p className={`font-bold text-sm ${isSelected ? 'text-red-700' : 'text-gray-900'}`}>
                    {lang.native}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {lang.name}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LanguageModal;
