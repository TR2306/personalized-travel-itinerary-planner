import React from 'react';
import { Compass, Heart, Github, Sparkles, Shield, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-navy-800/60">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Roam<span className="text-brand-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Precision day-by-day itineraries tailored to your dates, budget, travel style, and interests using Generative AI.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by Gemini AI & Supabase</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Planning Tools</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/builder" className="hover:text-white transition-colors">Smart Trip Builder</Link></li>
              <li><Link to="/trips" className="hover:text-white transition-colors">Saved Itineraries</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Travel Dashboard</Link></li>
              <li><a href="#destinations" className="hover:text-white transition-colors">Curated Destinations</a></li>
            </ul>
          </div>

          {/* Core Features */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Features</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">Geographic Clustering</li>
              <li className="flex items-center gap-2">Budget Discipline Engine</li>
              <li className="flex items-center gap-2">Day & Activity Customizer</li>
              <li className="flex items-center gap-2">Export to PDF</li>
              <li className="flex items-center gap-2">Dietary & Accessibility Focus</li>
            </ul>
          </div>

          {/* Tech Stack & Standards */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {['React Vite', 'FastAPI', 'Supabase RLS', 'PostgreSQL', 'Gemini AI', 'Tailwind CSS'].map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-navy-900 border border-navy-800 text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Enterprise grade with Row Level Security and Pydantic schema validation.
            </p>
          </div>

        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RoamAI Planner. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security & RLS</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
