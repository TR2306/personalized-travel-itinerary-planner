import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Clock, MapPin, Tag } from 'lucide-react';

export const EditActivityModal = ({ isOpen, onClose, onSave, activity, isNew = false, currency = "USD" }) => {
  const [form, setForm] = useState({
    title: '',
    time_slot: '09:00 AM - 11:30 AM',
    period: 'morning',
    description: '',
    location: '',
    estimated_cost: 0,
    cost_label: '',
    duration_hours: 2,
    transportation_tip: '',
    category: 'Culture',
  });

  useEffect(() => {
    if (activity) {
      setForm({
        ...activity,
        estimated_cost: activity.estimated_cost ?? 0,
      });
    } else {
      setForm({
        id: `act-custom-${Date.now()}`,
        title: '',
        time_slot: '10:00 AM - 12:30 PM',
        period: 'morning',
        description: '',
        location: '',
        estimated_cost: 15,
        cost_label: `Approx. ${currency} 15`,
        duration_hours: 2,
        transportation_tip: 'Walk or short public transit ride',
        category: 'Sightseeing',
      });
    }
  }, [activity, isOpen, currency]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      cost_label: form.cost_label || `Approx. ${currency} ${Number(form.estimated_cost).toFixed(2)}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-card-hover border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-navy-900">
            {isNew ? 'Add New Activity' : 'Customize Activity'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Visit Senso-ji Temple & Asakusa"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Time Period
              </label>
              <select
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Time Slot
              </label>
              <input
                type="text"
                value={form.time_slot}
                onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
                placeholder="e.g. 09:30 AM - 12:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Est. Cost ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.estimated_cost}
                onChange={(e) => setForm({ ...form, estimated_cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
              >
                <option value="Sightseeing">Sightseeing</option>
                <option value="Culture">Culture</option>
                <option value="Food">Food & Dining</option>
                <option value="Adventure">Adventure</option>
                <option value="Nature">Nature</option>
                <option value="Shopping">Shopping</option>
                <option value="Relaxation">Relaxation</option>
                <option value="Nightlife">Nightlife</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Location / Area
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Asakusa, Taito City"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Highlights
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Key sights to see, photography angles, or tips..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Transit / Directions Tip
            </label>
            <input
              type="text"
              value={form.transportation_tip}
              onChange={(e) => setForm({ ...form, transportation_tip: e.target.value })}
              placeholder="e.g. Ginza Subway Line to Asakusa Station (Exit 1)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              {isNew ? 'Add Activity' : 'Save Changes'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
