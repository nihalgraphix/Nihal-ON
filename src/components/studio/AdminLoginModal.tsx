import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Shield, Lock, Mail, ArrowRight, X, AlertCircle, CheckCircle2, Command, Key } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
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
);

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const { loginEmail, loginWithGoogle } = useStudio();
  const [email, setEmail] = useState('nihal.graphix@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        setSuccessMsg('Authenticated as nihal.graphix@gmail.com. Opening Admin Studio...');
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 500);
      } else {
        setError(result.error || 'Google authentication was not completed. Only nihal.graphix@gmail.com is authorized.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectOwnerLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const result = await loginEmail('nihal.graphix@gmail.com', 'admin123');
      if (result.success) {
        setSuccessMsg('Authenticated as nihal.graphix@gmail.com. Opening Admin Studio...');
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 500);
      } else {
        setError(result.error || 'Authorization failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await loginEmail(email, password || 'admin123');
      if (res.success) {
        setSuccessMsg('Authenticated as nihal.graphix@gmail.com. Opening Admin Studio...');
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 500);
      } else {
        setError(res.error || 'Authentication failed. Only nihal.graphix@gmail.com has access.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#141518] border border-[#2C2E34] rounded-2xl w-full max-w-md shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#2C2E34] flex items-center justify-between bg-[#17181B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#24262B] border border-[#2C2E34] flex items-center justify-center text-[#FF5A1F]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#F4F4F5] tracking-wider uppercase font-mono">
                Admin Authentication
              </h2>
              <p className="text-[11px] text-[#A1A1AA]">
                Protected Portfolio Studio Dashboard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close admin login modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Target Authorized Account Badge */}
          <div className="p-3 rounded-xl bg-[#1C1D22] border border-[#2C2E34] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#A1A1AA] text-[11px]">Authorized Admin:</span>
            </div>
            <span className="font-mono text-[11px] text-[#FF5A1F] font-semibold bg-[#FF5A1F]/10 px-2 py-0.5 rounded border border-[#FF5A1F]/20">
              nihal.graphix@gmail.com
            </span>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Access Denied</p>
                <p className="text-[11px] opacity-90 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Primary Action: Sign in with Google Account nihal.graphix@gmail.com */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{loading ? 'Authenticating with Google...' : 'Sign In with Google (nihal.graphix@gmail.com)'}</span>
            </button>

            {/* Direct Owner Login Button */}
            <button
              onClick={handleDirectOwnerLogin}
              disabled={loading}
              className="w-full bg-[#1F2026] hover:bg-[#282932] text-white py-2.5 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border border-[#2C2E34] hover:border-[#FF5A1F]/40 transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Direct Verification (nihal.graphix@gmail.com)</span>
            </button>

            <p className="text-[11px] text-center text-[#71717A] leading-relaxed px-2">
              Only Google account <strong className="text-white">nihal.graphix@gmail.com</strong> is allowed to access the admin dashboard. Other Google accounts will be rejected.
            </p>
          </div>

          {/* Secondary manual sign-in toggle */}
          <div className="pt-2 border-t border-[#2C2E34]">
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="w-full text-center text-[10px] uppercase tracking-wider font-mono text-[#71717A] hover:text-[#A1A1AA] py-1 transition-colors"
            >
              {showManualForm ? 'Hide Password Form' : 'Password Sign-In Option'}
            </button>

            {showManualForm && (
              <form onSubmit={handleManualSubmit} className="mt-3 space-y-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[10px] text-[#A1A1AA] uppercase font-mono mb-1">
                    Email (Must be nihal.graphix@gmail.com)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0D0E10] border border-[#2C2E34] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#A1A1AA] uppercase font-mono mb-1">
                    Password / Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                      type="password"
                      placeholder="Enter admin password (or leave blank)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0D0E10] border border-[#2C2E34] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#202126] hover:bg-[#2A2B32] text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-[#2C2E34] transition-all cursor-pointer"
                >
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Keyboard shortcut footer reminder */}
          <div className="pt-2 border-t border-[#2C2E34]/60 flex items-center justify-between text-[10px] text-[#71717A]">
            <span className="flex items-center gap-1.5">
              <Command className="w-3 h-3 text-[#FF5A1F]" />
              Shortcut:
            </span>
            <span className="font-mono bg-[#1E2024] px-1.5 py-0.5 rounded text-[#A1A1AA] border border-[#2C2E34]">
              Win + Shift + A
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
