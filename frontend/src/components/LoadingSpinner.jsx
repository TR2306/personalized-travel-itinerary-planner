import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export const LoadingSpinner = ({ 
  text = "Crafting your bespoke itinerary with AI...", 
  subtext = "Balancing attractions, budget, and geographical proximity" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 border-2 border-brand-200 flex items-center justify-center text-brand-600 shadow-card animate-pulse">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-sm animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>
      <div>
        <h4 className="text-base font-bold text-navy-900">{text}</h4>
        {subtext && <p className="text-xs text-slate-500 mt-1 max-w-sm">{subtext}</p>}
      </div>
    </div>
  );
};
