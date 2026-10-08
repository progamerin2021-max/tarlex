import React, { useState } from 'react';
import { useSocialStore } from '../../store/socialStore';
import { Sparkles, ArrowRight, CheckCircle2, User, Lock, Mail } from 'lucide-react';
import { useToast } from '../common/Toast';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { actions, users } = useSocialStore();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) return;

    actions.login(usernameOrEmail.trim());
    toast('Welcome back to TarleX! ✨', `Logged in as ${usernameOrEmail}`, 'success');
    onSuccess();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !displayName.trim()) return;

    actions.signup({
      username: usernameOrEmail.trim(),
      displayName: displayName.trim(),
      bio: bio.trim(),
    });
    toast('Account Created! 🚀', 'Welcome to the TarleX creator community', 'success');
    onSuccess();
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    toast('Reset Link Sent', `Check ${forgotEmail} for your password reset code. (Demo code: 123456)`, 'info');
    setMode('reset');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Password Reset Successfully', 'You can now sign in with your new credentials.', 'success');
    setMode('login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#10141e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="text-center mb-6 relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-3">
            <span className="font-extrabold text-white text-xl">TX</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Tarle<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">X</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Sign in to explore feeds, stories, and reels'}
            {mode === 'signup' && 'Create your unique TarleX creator identity'}
            {mode === 'forgot' && 'Reset your TarleX account password'}
            {mode === 'reset' && 'Enter your reset token and new password'}
          </p>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="alexrivera"
                  value={usernameOrEmail}
                  onChange={e => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 hover:opacity-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all"
            >
              Log In to TarleX
            </button>

            {/* Quick Demo Accounts */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-400 text-center mb-2">
                Or jump in as a demo creator:
              </p>
              <div className="flex items-center justify-center gap-2">
                {users.slice(0, 3).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      actions.switchAccount(u.id);
                      toast('Welcome back!', `Logged in as @${u.username}`, 'success');
                      onSuccess();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 font-medium transition-colors"
                  >
                    @{u.username}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2 border-t border-white/5">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Choose Username
              </label>
              <input
                type="text"
                placeholder="creative_mind"
                value={usernameOrEmail}
                onChange={e => setUsernameOrEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Short Bio (Optional)
              </label>
              <input
                type="text"
                placeholder="Visual creator & storyteller"
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-rose-500 hover:opacity-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all"
            >
              Create Account
            </button>

            <div className="text-center pt-2 border-t border-white/5">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  Log in
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Forgot Password */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@domain.com"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Send Password Reset Code
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Reset Password */}
        {mode === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Reset Code
              </label>
              <input
                type="text"
                placeholder="123456"
                value={resetToken}
                onChange={e => setResetToken(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Update Password & Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
