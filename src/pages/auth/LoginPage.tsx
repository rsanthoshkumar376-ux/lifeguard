import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { setupRecaptcha, sendOtp, verifyOtp, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('EN');

  useEffect(() => {
    setupRecaptcha('recaptcha-container');
  }, [setupRecaptcha]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await sendOtp(`+91${phoneNumber}`);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await verifyOtp(code);
      navigate('/');
    } catch (err: any) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 space-y-8">
        
        {/* Header / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">LifeGuard</h1>
          <p className="text-gray-500 text-sm">Medical Emergency & Blood Donor Assistance</p>
        </div>

        {/* Error Messages */}
        {(error || authError) && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error || authError}</p>
          </div>
        )}

        {/* Forms */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative flex rounded-lg shadow-sm">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 min-w-0 block w-full px-4 py-3 bg-white text-gray-900 font-medium placeholder:text-gray-400 rounded-none rounded-r-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
            </button>
            <div id="recaptcha-container"></div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Enter the 6-digit code sent to</p>
              <p className="font-medium text-gray-900">+91 {phoneNumber}</p>
            </div>
            
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
            </button>
            
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(['','','','','','']); }}
              className="w-full text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Change Phone Number
            </button>
          </form>
        )}

        <div className="pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            New user?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register here
            </Link>
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center gap-4 text-xs font-medium text-gray-400">
          {['EN', 'தமிழ்', 'हिंदी'].map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`${language === lang ? 'text-blue-600' : 'hover:text-gray-600'}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
