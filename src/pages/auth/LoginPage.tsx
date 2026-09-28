import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, CheckCircle2, AlertCircle, Loader2, HeartPulse, RefreshCw, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { setupRecaptcha, sendOtp, verifyOtp, loading: authLoading, error: authError } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    try {
      setupRecaptcha('recaptcha-container');
    } catch (e) {
      console.warn('Recaptcha init:', e);
    }
  }, [setupRecaptcha]);

  // Resend OTP Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await sendOtp(`+91${phoneNumber}`);
      setStep('otp');
      setResendTimer(30);
      setCanResend(false);
      // Focus first OTP input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. You can use Quick Demo Login below.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    try {
      setLoading(true);
      setError('');
      setCanResend(false);
      setResendTimer(30);
      await sendOtp(`+91${phoneNumber}`);
    } catch (err: any) {
      setError('Could not resend OTP: ' + (err.message || 'Please try again.'));
      setCanResend(true);
    } finally {
      setLoading(false);
    }
  };

  // Smart OTP Input Handling (Single input, paste, backspace, auto-advance)
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '');
    if (!digit) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // If pasted multiple digits
    if (digit.length > 1) {
      const pastedDigits = digit.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedDigits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (newOtp.every(d => d !== '')) {
        verifyCodeDirectly(newOtp.join(''));
      }
      return;
    }

    // Single digit input
    const newOtp = [...otp];
    newOtp[index] = digit[0];
    setOtp(newOtp);

    // Auto-advance to next input
    if (index < 5 && digit[0]) {
      inputRefs.current[index + 1]?.focus();
    }

    // If completed 6 digits, auto trigger
    if (index === 5 && digit[0] && newOtp.every(d => d !== '')) {
      verifyCodeDirectly(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input and clear it
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, idx) => {
      newOtp[idx] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      verifyCodeDirectly(pastedData);
    }
  };

  const verifyCodeDirectly = async (code: string) => {
    try {
      setLoading(true);
      setError('');
      await verifyOtp(code);
      navigate('/');
    } catch (err: any) {
      setError('Invalid OTP code. Please enter the correct 6 digits.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }
    verifyCodeDirectly(code);
  };

  // Quick Instant Demo Login for Testing & Emergency fallback
  const handleQuickDemoLogin = async () => {
    try {
      setLoading(true);
      setError('');
      // Store instant demo credentials
      const demoUser = {
        uid: 'demo-user-108',
        fullName: 'Emergency Guest',
        phoneNumber: '+919876543210',
        role: 'user'
      };
      localStorage.setItem('lifeguard_user', JSON.stringify(demoUser));
      localStorage.setItem('lifeguard_auth_token', 'demo-jwt-token-active');
      window.location.href = '/';
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 border border-gray-100 dark:border-slate-800">
        
        {/* Header / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white mb-1 shadow-lg shadow-red-500/25 ring-4 ring-red-500/10">
            <HeartPulse size={34} className="animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            LifeGuard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
            Medical Emergency & Blood Assistance Network
          </p>
        </div>

        {/* Error Feedback */}
        {(error || authError) && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-snug">{error || authError}</p>
          </div>
        )}

        {/* STEP 1: Phone Number */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Mobile Number
              </label>
              
              <div className="relative flex rounded-2xl shadow-sm border-2 border-gray-200 dark:border-slate-700 focus-within:border-red-600 dark:focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/15 transition-all overflow-hidden bg-gray-50 dark:bg-slate-800/80">
                <span className="inline-flex items-center px-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-black text-sm border-r border-gray-200 dark:border-slate-700 select-none">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 min-w-0 block w-full px-4 py-3.5 bg-transparent text-gray-900 dark:text-white font-bold placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none text-base tracking-wide"
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  autoFocus
                />
                <div className="pr-3.5 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                We'll send a 6-digit OTP code to verify your phone number.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              className="w-full py-4 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-900/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <span>Send OTP Code</span>
              )}
            </button>

            <div id="recaptcha-container"></div>
          </form>
        ) : (
          /* STEP 2: OTP Verification Screen */
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in">
            
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-full">
                Verification Code
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                Enter the 6-digit code sent to
              </p>
              <div className="flex items-center justify-center gap-1.5 font-black text-sm text-gray-900 dark:text-white">
                <span>+91 {phoneNumber}</span>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(['','','','','','']); }}
                  className="text-red-600 dark:text-red-400 text-xs underline font-bold ml-1 active:scale-95"
                >
                  Edit
                </button>
              </div>
            </div>
            
            {/* 6 Digit OTP Input Boxes */}
            <div className="flex justify-between gap-1.5 sm:gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 transition-all outline-none bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white ${
                    digit 
                      ? 'border-red-600 dark:border-red-500 ring-2 ring-red-500/20 bg-white dark:bg-slate-900' 
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  } focus:border-red-600 dark:focus:border-red-500 focus:ring-4 focus:ring-red-500/20`}
                />
              ))}
            </div>

            {/* Resend Code Countdown */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Didn't receive the code?
              </span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-red-600 dark:text-red-400 font-black hover:underline flex items-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  Resend OTP
                </button>
              ) : (
                <span className="text-gray-400 font-bold">
                  Resend in {resendTimer}s
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length < 6}
              className="w-full py-4 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-900/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify & Login</span>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(['','','','','','']); }}
              className="w-full py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-bold flex items-center justify-center gap-1 active:scale-95"
            >
              <ArrowLeft size={14} /> Back to Phone Number
            </button>
          </form>
        )}

        {/* Quick Demo Login Option */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Zap size={14} className="text-amber-500" />
            <span>Instant Demo Login (Skip SMS OTP)</span>
          </button>
        </div>

        {/* Register Link */}
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            New to LifeGuard?{' '}
            <Link to="/register" className="font-black text-red-600 dark:text-red-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Language Quick Selector */}
        <div className="flex flex-wrap justify-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 pt-1">
          {[
            { code: 'en', label: 'English' },
            { code: 'ta', label: 'தமிழ்' },
            { code: 'hi', label: 'हिंदी' },
            { code: 'te', label: 'తెలుగు' },
            { code: 'kn', label: 'ಕನ್ನಡ' },
            { code: 'ml', label: 'മലയാളம்' }
          ].map(lang => {
            const isCurrent = (i18n.language || 'en').startsWith(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  localStorage.setItem('i18nextLng', lang.code);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-black border border-red-200 dark:border-red-900/60' 
                    : 'hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
