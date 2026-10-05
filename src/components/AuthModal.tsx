import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { X, Lock, Mail, User as UserIcon, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
        resetForm();
      } else {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const result = await register({ name, email, password, confirmPassword });
        if (result?.needsEmailConfirmation) {
          setSuccess(
            'Account created. Check your email to confirm, then sign in. (If email confirmation is disabled in Supabase, you can sign in immediately.)'
          );
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        } else {
          onClose();
          resetForm();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-emerald-100" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-100">
              NutriVision AI
            </span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h3>
          <p className="text-emerald-50/90 text-sm mt-1">
            {mode === 'login'
              ? 'Sign in to analyze meals and track nutrition.'
              : 'Register to start AI-powered food nutrition analysis.'}
          </p>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50/80">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
              mode === 'login'
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
              mode === 'register'
                ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-xs rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Powered by Supabase Auth. Disable “Confirm email” in Supabase → Authentication →
            Providers → Email for instant sign-in after signup (recommended for demos).
          </p>
        </div>
      </div>
    </div>
  );
};
