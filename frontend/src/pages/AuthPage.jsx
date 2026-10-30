import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Compass, Sparkles, Lock, Mail, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await quickDemoLogin();
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Failed to log in as demo traveler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 items-center justify-center text-white shadow-md shadow-brand-500/20 mb-2">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-navy-950 tracking-tight">
            {isLogin ? 'Welcome back to RoamAI' : 'Create your traveler account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isLogin 
              ? 'Access all your saved trips, custom days, and PDF itineraries.' 
              : 'Start generating tailored itineraries with AI in seconds.'}
          </p>
          {isSupabaseConfigured && (
            <span className="inline-block mt-1 text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
              Supabase Auth Enabled
            </span>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-6">
          
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`py-2 rounded-lg transition-all ${
                isLogin ? 'bg-white text-navy-900 shadow-xs' : 'hover:text-navy-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`py-2 rounded-lg transition-all ${
                !isLogin ? 'bg-white text-navy-900 shadow-xs' : 'hover:text-navy-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to RoamAI' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Or Instant Access
            </span>
          </div>

          {/* Demo Sign In Button */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>One-Click Demo Traveler Login (Alex Mercer)</span>
          </button>

        </div>

      </div>
    </div>
  );
};
