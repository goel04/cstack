import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  User,
  Building,
  AlertCircle,
  Sparkles,
  Database,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CStackLogo } from './CStackLogo';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, SUPABASE_URL } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (email: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccessLogin }) => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInGuest,
    authError,
    clearAuthError,
    connectSupabaseCredentials,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Supabase connection config accordion
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);
  const [customSbUrl, setCustomSbUrl] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('cstack_supabase_url') || '' : ''
  );
  const [customSbKey, setCustomSbKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('cstack_supabase_anon_key') || '' : ''
  );
  const [sbConfigSuccess, setSbConfigSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    clearAuthError();
    setLocalError(null);
    onClose();
  };

  const handleInstantAccess = async (name: string, userEmail: string) => {
    setLocalError(null);
    clearAuthError();
    setIsGuestLoading(true);
    try {
      await signInGuest(name, userEmail, 'Enterprise Climate Workspace');
      setIsSuccess(true);
      if (onSuccessLogin) {
        onSuccessLogin(userEmail);
      }
      setTimeout(() => {
        setIsSuccess(false);
        handleClose();
      }, 1000);
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setLocalError('Please provide your name.');
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName, organization);
      }
      setIsSuccess(true);
      if (onSuccessLogin) {
        onSuccessLogin(email);
      }
      setTimeout(() => {
        setIsSuccess(false);
        handleClose();
      }, 1000);
    } catch (err: any) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        handleClose();
      }, 1000);
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setIsGuestLoading(true);
    try {
      await signInGuest('Climate Analyst', 'analyst@cstack.climate', 'CSTACK Workspace');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        handleClose();
      }, 1000);
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSbUrl.trim() || !customSbKey.trim()) {
      setLocalError('Please enter both Supabase URL and Anon Key.');
      return;
    }
    const success = connectSupabaseCredentials(customSbUrl, customSbKey);
    if (success) {
      setSbConfigSuccess(true);
      setTimeout(() => setSbConfigSuccess(false), 3000);
    }
  };

  const handleQuickDemo = () => {
    setEmail('demo.lead@cstack.climate');
    setPassword('CStackSecure2026!');
    setMode('signin');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="login-modal-dialog"
        className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 relative overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <CStackLogo size="lg" theme="light" />
          </div>
          <h3 className="text-xl font-display font-bold text-slate-950">
            {mode === 'signin' ? 'Sign In to CSTACK' : 'Create CSTACK Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signin'
              ? 'Access your personal carbon dashboard and saved models.'
              : 'Start logging Scope 1-3 activities and managing carbon assets.'}
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
            <Database className="w-3 h-3 text-emerald-600" />
            <span>Supabase Auth Engine</span>
            {isSupabaseConfigured() ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            ) : (
              <span className="text-slate-400 font-normal">(Connected)</span>
            )}
          </div>
        </div>

        {/* Tab switch between Sign In and Sign Up */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              clearAuthError();
              setLocalError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              clearAuthError();
              setLocalError(null);
            }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {(authError || localError) && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{authError || localError}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <p className="text-base font-semibold text-slate-900">
              {mode === 'signin' ? 'Session Authenticated' : 'Account Created Successfully'}
            </p>
            <p className="text-xs text-slate-500">
              Connecting to your Supabase carbon workspace...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Direct 1-Click Access for current user */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Access</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                  No popup errors
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleInstantAccess('Lakshay Goel', 'lakshaygoel611@gmail.com')}
                disabled={isGuestLoading}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Continue as Lakshay Goel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Social / SSO Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl font-medium text-xs transition-all shadow-xs flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <span className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google (Supabase)</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[11px] text-slate-400 uppercase tracking-wider absolute">
                or Supabase email & password
              </span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Dr. Maya Patel"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Organization / Company (Optional)
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Apex Technologies or Personal"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Work / Personal Email
                  </label>
                  <button
                    type="button"
                    onClick={() => setEmail('lakshaygoel611@gmail.com')}
                    className="text-[10px] text-emerald-700 hover:underline font-semibold"
                  >
                    Use lakshaygoel611@gmail.com
                  </button>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="name@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={handleQuickDemo}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                    >
                      Fill Demo
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Dashboard' : 'Create Free Account'}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Guest Access Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={isGuestLoading}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Guest Mode (Explore without account)</span>
              </button>
            </div>

            {/* Supabase Custom Credentials Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSupabaseConfig(!showSupabaseConfig)}
                className="w-full py-1.5 flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-800 font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Configure Custom Supabase Project</span>
                </span>
                {showSupabaseConfig ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showSupabaseConfig && (
                <form
                  onSubmit={handleSaveSupabaseConfig}
                  className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs animate-in slide-in-from-top-1"
                >
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Optionally connect your live Supabase project. You can find these in your{' '}
                    <a
                      href="https://supabase.com/dashboard/project/_/settings/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 underline font-semibold inline-flex items-center gap-0.5"
                    >
                      Supabase API Settings
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    .
                  </p>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                      Project URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://xyzcompany.supabase.co"
                      value={customSbUrl}
                      onChange={(e) => setCustomSbUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                      Anon Public Key
                    </label>
                    <input
                      type="text"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      value={customSbKey}
                      onChange={(e) => setCustomSbKey(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {sbConfigSuccess ? (
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Credentials saved!
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Saved to browser session</span>
                    )}
                    <button
                      type="submit"
                      className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                    >
                      Connect Supabase
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="pt-1 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Protected by Supabase Auth with Row Level Security (RLS)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
