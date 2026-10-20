import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileCheck2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Building2,
  CheckCircle2,
  FileText
} from './icons';
import { loginCustomer, registerCustomer, checkPasswordComplexity } from '../services/api';
import PasswordRequirementsChecklist from './PasswordRequirementsChecklist';

export default function CustomerPortal() {
  const { loginWithSession, showToast, setActiveTab } = useApp();

  const [activeTab, setActiveTabMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    username: '',
    department: 'MMRDA Infrastructure Projects & Monitoring Authority',
    password: '',
    confirmPassword: ''
  });

  const passwordEvaluation = checkPasswordComplexity(registerForm.password);
  const passwordsMatch = registerForm.password && registerForm.password === registerForm.confirmPassword;

  // Handle Quick Demo Fill for Indian Infrastructure Client
  const handleQuickFill = () => {
    setLoginForm({
      email: 'vikram.mehta@mmrda.in',
      password: 'Client@Mumbai2026!'
    });
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginForm.email || !loginForm.password) {
      setErrorMsg('Please enter your client email and password.');
      return;
    }

    setLoading(true);
    const res = await loginCustomer(loginForm);
    setLoading(false);

    if (res.success) {
      loginWithSession(res.data.user);
      // Leads directly to Customer Project Reports & Recommendations as requested
      setActiveTab('customer-reports');
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!passwordEvaluation.isValid) {
      setErrorMsg('Password does not satisfy all 5 mandatory security criteria.');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMsg('Password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    const res = await registerCustomer({
      name: registerForm.name,
      email: registerForm.email,
      username: registerForm.username || registerForm.email.split('@')[0],
      department: registerForm.department,
      password: registerForm.password
    });
    setLoading(false);

    if (res.success) {
      showToast('Client account created in database/users.db! You can now log in.', 'success');
      setLoginForm({
        email: registerForm.email,
        password: ''
      });
      setActiveTabMode('login');
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-xl w-full">
        
        {/* Top Header Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-3">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Customer & Client Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Authority & Client Portal
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Dedicated portal for infrastructure authorities, government bodies (NHAI, MMRDA, CPWD), and developers to review project evaluations and suitability reports.
          </p>
        </div>

        {/* Portal Box */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Tabs: Sign In / Register */}
          <div className="flex border-b border-slate-200 bg-slate-100/60 p-1.5 gap-1.5">
            <button
              onClick={() => { setActiveTabMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Customer Login</span>
            </button>
            <button
              onClick={() => { setActiveTabMode('register'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Register New Client</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: CUSTOMER LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Client Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., vikram.mehta@mmrda.in"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter client password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <span>Authenticating in SQLite (database/users.db)...</span>
                  ) : (
                    <>
                      <span>Sign In & Open Project Reports</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Indian Customer Test Helper */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Pre-seeded Indian Client:</span> Shri Vikram Mehta (MMRDA)
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                  >
                    Auto-Fill Credentials
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: CUSTOMER REGISTRATION */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Client / Stakeholder Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="Shri Vikram Mehta"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="vikram_mmrda"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Agency Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="vikram.mehta@mmrda.in"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Infrastructure Authority / Organization
                  </label>
                  <input
                    type="text"
                    value={registerForm.department}
                    onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Client Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password meeting 5 criteria"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Real-Time Password Requirements Checklist */}
                  <PasswordRequirementsChecklist password={registerForm.password} />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password to confirm"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white ${
                        registerForm.confirmPassword && !passwordsMatch ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {registerForm.confirmPassword && !passwordsMatch && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">Passwords do not match.</p>
                  )}
                  {registerForm.confirmPassword && passwordsMatch && (
                    <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match perfectly.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !passwordEvaluation.isValid || !passwordsMatch}
                  className="w-full mt-3 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Registering Client in SQLite...</span>
                  ) : (
                    <>
                      <span>Complete Client Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Back to Home Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
          >
            ← Return to Home Page
          </button>
        </div>

      </div>
    </div>
  );
}
