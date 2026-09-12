import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Smartphone,
  KeyRound,
  Sparkles,
  User,
  Mail,
  MapPin,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { Button } from '../../components/common/Button.js';
import { UserRoles } from '@bmc/shared';

export const LoginPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'citizen_otp' | 'citizen_register' | 'staff_password'>('citizen_otp');

  // Citizen OTP State
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Citizen Register State
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWardId, setRegWardId] = useState('');
  const [wards, setWards] = useState<any[]>([]);

  // Staff Password State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  // Load wards for citizen registration
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res: any = await api.get('/admin/wards');
        if (res && res.data) {
          setWards(res.data);
        }
      } catch (e) {
        // Fallback demo wards if not authenticated
        setWards([
          { id: 'ward-1', name: 'Ward 1 - Old City / Barton Library', wardNumber: 1 },
          { id: 'ward-2', name: 'Ward 2 - Nilambaug / Ghogha Circle', wardNumber: 2 },
          { id: 'ward-3', name: 'Ward 3 - Kaliyabid / Victoria Park', wardNumber: 3 },
          { id: 'ward-4', name: 'Ward 4 - Takhteshwar / Hill Drive', wardNumber: 4 },
          { id: 'ward-5', name: 'Ward 5 - Subhashnagar / Port Road', wardNumber: 5 }
        ]);
      }
    };
    fetchWards();
  }, []);

  // Countdown timer for OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      await api.post('/auth/otp/send', { mobile });
      setOtpSent(true);
      setCountdown(30);
      setOtp('123456'); // Pre-fill demo OTP
      setSuccessMessage('OTP sent! Use demo code 123456 for instant access.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check your mobile number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res: any = await api.post('/auth/otp/verify', { mobile, otp });
      setAuth(res.data.user, res.data.accessToken);
      navigate('/citizen');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitizenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const res: any = await api.post('/auth/register', {
        name: regName,
        mobile: regMobile,
        email: regEmail || undefined,
        wardId: regWardId || undefined
      });
      setAuth(res.data.user, res.data.accessToken);
      navigate('/citizen');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res: any = await api.post('/auth/login', { identifier, password });
      const user = res.data.user;
      setAuth(user, res.data.accessToken);

      if (user.role === UserRoles.BMC_ADMIN) {
        navigate('/admin');
      } else if (user.role === UserRoles.DEPT_OFFICER || user.role === UserRoles.DEPT_SUPERVISOR) {
        navigate('/dept');
      } else if (user.role === UserRoles.FIELD_STAFF) {
        navigate('/field');
      } else {
        navigate('/citizen');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid staff credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-Click Demo Login Fillers
  const fillDemoRole = (role: 'citizen' | 'admin' | 'officer' | 'field') => {
    setError('');
    setSuccessMessage('');
    if (role === 'citizen') {
      setAuthMode('citizen_otp');
      setMobile('9876543210');
      setOtpSent(true);
      setOtp('123456');
    } else {
      setAuthMode('staff_password');
      setPassword('Admin@123');
      if (role === 'admin') setIdentifier('admin@bmc.gov.in');
      if (role === 'officer') setIdentifier('9888888881');
      if (role === 'field') setIdentifier('9777777771');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-civic-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-3">
            <Building2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">BMC CivicConnect</h1>
          <p className="text-sm text-slate-500 mt-1">Smart Civic Complaint & Service Delivery Platform</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          {/* Role Mode 3-Way Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('citizen_otp');
                setError('');
                setSuccessMessage('');
              }}
              className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
                authMode === 'citizen_otp'
                  ? 'bg-white text-civic-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Citizen Login
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('citizen_register');
                setError('');
                setSuccessMessage('');
              }}
              className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
                authMode === 'citizen_register'
                  ? 'bg-white text-civic-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Register Citizen
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('staff_password');
                setError('');
                setSuccessMessage('');
              }}
              className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
                authMode === 'staff_password'
                  ? 'bg-white text-civic-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Staff / Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form 1: Citizen Quick OTP Sign In */}
          {authMode === 'citizen_otp' && (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Send OTP Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Enter 6-Digit OTP</label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-civic-600 hover:underline font-bold"
                    >
                      Change Number ({mobile})
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-slate-400">Default OTP: 123456</span>
                    {countdown > 0 ? (
                      <span className="text-slate-400">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-civic-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Verify & Open Citizen Portal
                </Button>
              </form>
            )
          )}

          {/* Form 2: Citizen Registration */}
          {authMode === 'citizen_register' && (
            <form onSubmit={handleCitizenRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10 digits starting with 6-9"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="e.g. aarav@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Residential Ward (Optional)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <select
                    value={regWardId}
                    onChange={(e) => setRegWardId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="">Select your home ward</option>
                    {wards.map((w) => (
                      <option key={w.id || w._id} value={w.id || w._id}>
                        {w.name || `Ward ${w.wardNumber}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
                Register & Sign In
              </Button>
            </form>
          )}

          {/* Form 3: BMC Staff & Official Password Login */}
          {authMode === 'staff_password' && (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email / Mobile / Staff ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin@bmc.gov.in"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Sign In as BMC Staff / Official
              </Button>
            </form>
          )}

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Demo Profiles</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoRole('citizen')}
                className="text-left px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-civic-50 border border-slate-200 text-slate-700 text-xs transition-colors"
              >
                <span className="font-bold block text-civic-700">Citizen</span>
                <span className="text-[10px] text-slate-400">9876543210</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoRole('admin')}
                className="text-left px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-civic-50 border border-slate-200 text-slate-700 text-xs transition-colors"
              >
                <span className="font-bold block text-purple-700">BMC Admin</span>
                <span className="text-[10px] text-slate-400">admin@bmc.gov.in</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoRole('officer')}
                className="text-left px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-civic-50 border border-slate-200 text-slate-700 text-xs transition-colors"
              >
                <span className="font-bold block text-emerald-700">Dept Officer</span>
                <span className="text-[10px] text-slate-400">9888888881</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoRole('field')}
                className="text-left px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-civic-50 border border-slate-200 text-slate-700 text-xs transition-colors"
              >
                <span className="font-bold block text-amber-700">Field Worker</span>
                <span className="text-[10px] text-slate-400">9777777771</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

