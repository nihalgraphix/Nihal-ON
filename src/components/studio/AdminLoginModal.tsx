import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Shield, Lock, User, ArrowRight, X, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const { loginCredentials } = useStudio();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await loginCredentials(username, password);
      if (res.success) {
        setSuccessMsg('Authenticated successfully. Opening Admin Studio...');
        setTimeout(() => {
          onLoginSuccess();
          onClose();
        }, 500);
      } else {
        setError(res.error || 'Invalid credentials. Access Denied.');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121316] border border-[#26282E] rounded-3xl w-full max-w-md shadow-2xl shadow-black/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-[#22242A] flex items-center justify-between bg-[#15161A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF5A1F]/15 border border-[#FF5A1F]/30 flex items-center justify-center text-[#FF5A1F]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#F4F4F5] tracking-widest uppercase font-mono">
                Admin Authentication
              </h2>
              <p className="text-[11px] text-[#A1A1AA]">
                Protected Portfolio Management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close admin login modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-6 space-y-4">
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Access Denied</p>
                <p className="text-[11px] opacity-90 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Username Field */}
            <div>
              <label className="block text-[10px] text-[#A1A1AA] uppercase font-mono font-semibold tracking-wider mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full bg-[#0B0C0E] border border-[#26282E] focus:border-[#FF5A1F] rounded-xl pl-10 pr-3.5 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] text-[#A1A1AA] uppercase font-mono font-semibold tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-[#0B0C0E] border border-[#26282E] focus:border-[#FF5A1F] rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white p-1 rounded transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#FF5A1F] hover:bg-[#FF723F] active:bg-[#E84A10] text-white py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-[#FF5A1F]/20 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Admin Studio'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-3 border-t border-[#22242A] flex items-center justify-between text-[10px] text-[#71717A] font-mono">
            <span>Security: Protected Portal</span>
            <span className="bg-[#18191E] px-2 py-0.5 rounded text-[#A1A1AA] border border-[#26282E]">
              Win + Shift + A
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
