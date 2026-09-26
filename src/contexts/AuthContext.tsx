import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest, setAuthToken, removeAuthToken, getAuthToken } from '../config/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  setupRecaptcha: (containerId: string) => void;
  sendOtp: (phoneNumber: string) => Promise<any>;
  verifyOtp: (code: string) => Promise<any>;
  registerUser: (userData: any) => Promise<any>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isHospitalStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      apiRequest<{ user: User }>('/auth/me')
        .then(res => {
          setUser(res.user);
        })
        .catch(err => {
          console.error('Session expired:', err);
          removeAuthToken();
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const setupRecaptcha = (containerId: string) => {
    // Kept for backward compatibility, no external recaptcha needed with direct backend
  };

  const sendOtp = async (phoneNumber: string) => {
    try {
      setError(null);
      setPendingPhone(phoneNumber);
      const res = await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: phoneNumber })
      });
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
      throw err;
    }
  };

  const verifyOtp = async (code: string) => {
    try {
      setError(null);
      const res = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: pendingPhone, code })
      });

      if (res.token) {
        setAuthToken(res.token);
        setUser(res.user);
      }
      return res;
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.');
      throw err;
    }
  };

  const registerUser = async (userData: any) => {
    try {
      setError(null);
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...userData, phone: pendingPhone || userData.phone })
      });

      if (res.token) {
        setAuthToken(res.token);
        setUser(res.user);
      }
      return res;
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    // Placeholder for email auth
    await sendOtp(email);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    await registerUser({ email, fullName: email.split('@')[0], bloodGroup: 'O+' });
  };

  const logout = async () => {
    removeAuthToken();
    setUser(null);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const res = await apiRequest<{ user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setUser(res.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isHospitalStaff = user?.role === 'hospital_staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        loading,
        error,
        setupRecaptcha,
        sendOtp,
        verifyOtp,
        registerUser,
        signInWithEmail,
        signUpWithEmail,
        logout,
        updateUserProfile,
        isAuthenticated,
        isAdmin,
        isHospitalStaff
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
