import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Compass, DollarSign, Clock, ShieldCheck, 
  LogOut, Check, Save, Heart, Sparkles, Key, ExternalLink, 
  Eye, EyeOff, Database, Server
} from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

export const ProfilePage = () => {
  const { user, logout, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [preferences, setPreferences] = useState({
    preferred_currency: user?.travel_preferences?.preferred_currency || 'USD',
    default_pace: user?.travel_preferences?.default_pace || 'Balanced',
    dietary_preferences: user?.travel_preferences?.dietary_preferences || 'No restrictions',
    top_interests: user?.travel_preferences?.top_interests || ['Culture', 'Food'],
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Gemini API Key config
  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('roamai_gemini_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    if (geminiApiKey.trim()) {
      localStorage.setItem('roamai_gemini_key', geminiApiKey.trim());
    } else {
      localStorage.removeItem('roamai_gemini_key');
    }
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 3000);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('roamai_gemini_key');
    setGeminiApiKey('');
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile({
        name,
        travel_preferences: preferences,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
          Profile & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your default settings, configure your Gemini AI credentials, and review database connections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* User Card & Integrations Status */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
              {user?.name ? user.name[0].toUpperCase() : 'T'}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-navy-950">{user?.name || 'Traveler'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-brand-700 font-semibold">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>{isSupabaseConfigured ? 'Supabase RLS Protected' : 'Authenticated Traveler'}</span>
            </div>

            <button
              onClick={logout}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* System Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4 text-xs">
            <h4 className="font-bold text-navy-950 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-600" />
              <span>Integration Status</span>
            </h4>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Database</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  isSupabaseConfigured 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isSupabaseConfigured ? 'Supabase Cloud' : 'Embedded SQLite'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">AI Engine</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  geminiApiKey ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                }`}>
                  {geminiApiKey ? 'Custom Gemini API' : 'RoamAI Smart Engine'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences & AI Config Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* AI Settings Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                  <span>Gemini API Configuration</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Optionally provide your Google Gemini API key for direct AI generation.
                </p>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Google Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Keys are stored in your secure browser session and forwarded directly to the backend AI agent.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                {apiKeySaved ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Gemini API Key Saved!</span>
                  </span>
                ) : <div />}

                <div className="flex items-center gap-2">
                  {geminiApiKey && (
                    <button
                      type="button"
                      onClick={handleClearApiKey}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      Clear Key
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Key</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Preferences Form */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card">
            
            <form onSubmit={handleSave} className="space-y-6">
              
              <div>
                <h2 className="text-lg font-bold text-navy-950 mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h2 className="text-lg font-bold text-navy-950 mb-4">Default Travel Preferences</h2>
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Preferred Currency
                      </label>
                      <select
                        value={preferences.preferred_currency}
                        onChange={(e) => setPreferences({ ...preferences, preferred_currency: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Default Pacing
                      </label>
                      <select
                        value={preferences.default_pace}
                        onChange={(e) => setPreferences({ ...preferences, default_pace: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      >
                        <option value="Relaxed">Relaxed (1-2 sights/day)</option>
                        <option value="Balanced">Balanced (2-3 sights/day)</option>
                        <option value="Packed">Packed (3-4 sights/day)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Dietary Requirement
                    </label>
                    <select
                      value={preferences.dietary_preferences}
                      onChange={(e) => setPreferences({ ...preferences, dietary_preferences: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="No restrictions">No restrictions</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Halal">Halal</option>
                      <option value="Kosher">Kosher</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                    </select>
                  </div>

                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                {savedSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Preferences Saved!</span>
                  </span>
                ) : <div />}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
};
