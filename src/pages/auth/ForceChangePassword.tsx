import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';

export const ForceChangePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user, refreshUserRoles } = useAuth();
  const navigate = useNavigate();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!user) {
      setError('No active user session found.');
      return;
    }

    setLoading(true);

    try {
      // 1. Update password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) throw authError;

      // 2. Clear must_change_password flag in user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id);
      
      if (profileError) throw profileError;

      setSuccess(true);
      await refreshUserRoles();
      
      // Delay navigation slightly so they see the success message
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600/20 p-3 rounded-2xl border border-indigo-500/30 mb-4">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-white text-center">Change Password</h1>
          <p className="text-gray-400 text-xs mt-1 text-center">
            This is your first login. You must change your temporary password before accessing the system.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-4 rounded-xl text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-xs font-bold">Password Successfully Updated!</p>
            <p className="text-[10px] text-emerald-300/80">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl pl-11 pr-12 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl pl-11 pr-12 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-150"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-bold transition-all duration-150 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-l-white rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
