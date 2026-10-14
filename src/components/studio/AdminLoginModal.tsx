import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import { Shield, Lock, Mail, ArrowRight, X, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const { loginEmail, loginWithGoogle } = useStudio();
  const [email, setEmail] = useState('nihal.graphix@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginEmail(email, password || 'admin123');
      if (res.success) {
        onLoginSuccess();
        onClose();
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        onLoginSuccess();
        onClose();
      } else {
        setError('Google authentication could not be completed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#17181B] border border-[#2C2E34] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-[#2C2E34] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#24262B] border border-[#2C2E34] flex items-center justify-center text-[#FF5A1F]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F4F4F5] tracking-tight font-mono">
                ADMIN AUTHENTICATION
              </h2>
              <p className="text-[11px] text-[#71717A]">
                Portfolio Studio Management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-[#A1A1AA] uppercase font-mono mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-md pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-[#A1A1AA] uppercase font-mono">
                  Password
                </label>
                <span className="text-[10px] text-[#71717A] font-mono">
                  (Default demo: any or blank)
                </span>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111214] border border-[#2C2E34] rounded-md pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5A1F] hover:bg-[#FF723F] active:bg-[#E84A10] text-white py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Studio'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2C2E34]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-[#17181B] px-2 text-[#71717A]">Or use Firebase OAuth</span>
            </div>
          </div>

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-[#202126] hover:bg-[#25272D] text-[#F4F4F5] border border-[#2C2E34] py-2 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
