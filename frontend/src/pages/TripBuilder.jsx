import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, MapPin, Calendar, DollarSign, Users, Compass, 
  Check, ArrowRight, ArrowLeft, Heart, Shield, Clock, AlertCircle 
} from 'lucide-react';
import { tripsApi, itineraryApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';

const INTERESTS_OPTIONS = [
  "Adventure", "Nature", "Food", "Culture", "History", 
  "Shopping", "Beaches", "Nightlife", "Sightseeing"
];

const TRAVEL_STYLES = [
  { id: "Solo", label: "Solo Traveler", desc: "Independent exploration & flexibility", defaultCount: 1 },
  { id: "Couple", label: "Couple", desc: "Romantic & shared cultural highlights", defaultCount: 2 },
  { id: "Family", label: "Family", desc: "Kid-friendly, safe pacing & comfort", defaultCount: 4 },
  { id: "Friends", label: "Friends Group", desc: "Social, nightlife & shared adventures", defaultCount: 3 },
];

const PACING_OPTIONS = [
  { id: "Relaxed", label: "Relaxed", desc: "1-2 main highlights/day, leisurely meals, ample downtime" },
  { id: "Balanced", label: "Balanced", desc: "2-3 highlights/day, comfortable transitions, great variety" },
  { id: "Packed", label: "Packed", desc: "3-4 highlights/day, early mornings, vibrant evening sights" },
];

const BUDGET_TIERS = [
  { id: "Budget", label: "Budget", desc: "Hostels/budget hotels, street food, public transport" },
  { id: "Moderate", label: "Moderate", desc: "3-4 star boutique stays, sit-down bistros, mixed transit" },
  { id: "Luxury", label: "Luxury", desc: "5-star luxury resorts, fine dining, private transfers" },
];

const ACCOMMODATIONS = [
  "Boutique Hotel", "Luxury Resort", "Budget Hostel", "Airbnb / Apartment", "Bed & Breakfast"
];

const TRANSPORTS = [
  "Public Transit & Walking", "Rental Car", "Walking & Cabs", "Private Chauffeur"
];

const DIETARY_OPTIONS = [
  "No restrictions", "Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-Free"
];

export const TripBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    destination: searchParams.get('destination') || '',
    start_location: '',
    start_date: '',
    end_date: '',
    days_count: 5,
    budget: 2500,
    currency: 'USD',
    budget_tier: 'Moderate',
    travel_style: 'Couple',
    travelers_count: 2,
    travel_pace: 'Balanced',
    interests: ['Culture', 'Food', 'Sightseeing'],
    accommodation_pref: 'Boutique Hotel',
    transportation_pref: 'Public Transit & Walking',
    dietary_preferences: 'No restrictions',
    accessibility_needs: 'None',
    special_requests: '',
  });

  // Set default dates (today + 14 days, for 5 days)
  useEffect(() => {
    if (!formData.start_date) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() + 14);
      const end = new Date(start);
      end.setDate(start.getDate() + 4);

      setFormData(prev => ({
        ...prev,
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
        days_count: 5,
      }));
    }
  }, []);

  // Update days_count when dates change
  const handleDateChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    if (updated.start_date && updated.end_date) {
      const d1 = new Date(updated.start_date);
      const d2 = new Date(updated.end_date);
      const diffTime = d2 - d1;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0 && diffDays <= 30) {
        updated.days_count = diffDays;
      }
    }
    setFormData(updated);
  };

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interest);
      const updated = exists 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updated.length ? updated : [interest] };
    });
  };

  const validateStep = (currentStep) => {
    setError('');
    if (currentStep === 1) {
      if (!formData.destination.trim()) {
        setError('Please enter your destination city or country.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.start_date || !formData.end_date) {
        setError('Please select both start and end dates.');
        return false;
      }
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        setError('End date must be on or after start date.');
        return false;
      }
      if (formData.days_count < 1 || formData.days_count > 30) {
        setError('Trip duration must be between 1 and 30 days.');
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.budget || formData.budget <= 0) {
        setError('Please specify a positive estimated budget.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setError('');
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleGenerate = async () => {
    if (!validateStep(step)) return;
    setLoading(true);
    setError('');

    try {
      // 1. Create or save the Trip in database first
      const tripRes = await tripsApi.create(formData);
      const createdTrip = tripRes.data;

      // 2. Invoke AI itinerary generation
      const genRes = await itineraryApi.generate({
        ...formData,
        trip_id: createdTrip.id,
      });

      // 3. Navigate to interactive itinerary view
      navigate(`/itinerary?tripId=${createdTrip.id}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Itinerary generation failed. Please check network connectivity.'
      );
      setLoading(false);
    }
  };

  const stepTitles = [
    { num: 1, title: "Destination", subtitle: "Where to?" },
    { num: 2, title: "Dates & Duration", subtitle: "When & how long?" },
    { num: 3, title: "Budget & Currency", subtitle: "How much?" },
    { num: 4, title: "Preferences & Pace", subtitle: "How do you travel?" },
    { num: 5, title: "Custom Details", subtitle: "Diet & accessibility" },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner 
          text={`RoamAI is generating your ${formData.days_count}-day itinerary for ${formData.destination}...`}
          subtext="Consulting local geographic maps, culinary guides, and balancing your daily rhythm"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
          Step {step} of 5
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
          Smart Travel Itinerary Builder
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Provide your travel parameters. Our AI will craft an optimized, day-by-day plan with zero guesswork.
        </p>
      </div>

      {/* Progress Bar & Indicators */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
        <div className="grid grid-cols-5 gap-2 text-center">
          {stepTitles.map((st) => (
            <button
              key={st.num}
              type="button"
              onClick={() => {
                if (st.num < step) setStep(st.num);
              }}
              className={`flex flex-col items-center py-1 transition-all ${
                st.num === step 
                  ? 'text-brand-600 font-bold' 
                  : st.num < step 
                    ? 'text-emerald-600 font-semibold cursor-pointer' 
                    : 'text-slate-400 font-medium'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs mb-1.5 transition-all ${
                st.num === step
                  ? 'bg-brand-600 text-white shadow-xs'
                  : st.num < step
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {st.num < step ? <Check className="w-4 h-4" /> : st.num}
              </div>
              <span className="text-[11px] sm:text-xs truncate max-w-full">{st.title}</span>
            </button>
          ))}
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            className="bg-brand-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm font-semibold text-red-700 flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Multi-step Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-card">
        
        {/* STEP 1: DESTINATION */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-navy-950">Where are you traveling?</h2>
              <p className="text-xs text-slate-500 mt-1">Choose any city, island, region, or multiple stops.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destination City / Country *
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-brand-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="e.g. Kyoto, Japan or Amalfi Coast, Italy"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Starting / Departure Location <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.start_location}
                  onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                  placeholder="e.g. Tokyo Narita Airport or London Heathrow"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                />
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Popular Destination Ideas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Kyoto, Japan', 'Paris, France', 'Amalfi Coast, Italy', 'Bali, Indonesia', 'Swiss Alps', 'Barcelona, Spain'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormData({ ...formData, destination: d })}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DATES & DURATION */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-navy-950">When are you going?</h2>
              <p className="text-xs text-slate-500 mt-1">Select your dates to help our AI plan seasonal activities and weather-appropriate timings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Trip Start Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => handleDateChange('start_date', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Trip End Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => handleDateChange('end_date', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Duration Card */}
            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                  {formData.days_count}
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">{formData.days_count} Days Itinerary</p>
                  <p className="text-xs text-brand-700">Daily schedules and night rests optimized</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600">Manual Days:</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.days_count}
                  onChange={(e) => setFormData({ ...formData, days_count: parseInt(e.target.value) || 1 })}
                  className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-center font-bold text-sm bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET & CURRENCY */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-navy-950">What is your target budget?</h2>
              <p className="text-xs text-slate-500 mt-1">
                RoamAI uses this to distribute funds across accommodations, dining, attractions, and local transport.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Total Budget *
                </label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-lg font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

            {/* Budget Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Budget Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUDGET_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, budget_tier: tier.id })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      formData.budget_tier === tier.id
                        ? 'border-brand-500 bg-brand-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-navy-900">{tier.label}</span>
                      {formData.budget_tier === tier.id && (
                        <Check className="w-4 h-4 text-brand-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{tier.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PREFERENCES & PACE */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-navy-950">Travel Style & Pacing</h2>
              <p className="text-xs text-slate-500 mt-1">Configure your group dynamic, daily pace, and favorite interests.</p>
            </div>

            {/* Travel Party Style */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Who is traveling?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TRAVEL_STYLES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      travel_style: st.id,
                      travelers_count: st.defaultCount 
                    })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      formData.travel_style === st.id
                        ? 'border-brand-500 bg-brand-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="font-bold text-sm text-navy-900">{st.label}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{st.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Pace */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Daily Travel Pace
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PACING_OPTIONS.map((pace) => (
                  <button
                    key={pace.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, travel_pace: pace.id })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      formData.travel_pace === pace.id
                        ? 'border-brand-500 bg-brand-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="font-bold text-sm text-navy-900">{pace.label}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{pace.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Interests (multi-select) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Travel Interests <span className="text-slate-400 font-normal">(Select multiple)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map((item) => {
                  const isSelected = formData.interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stays & Transport */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Accommodation Preference
                </label>
                <select
                  value={formData.accommodation_pref}
                  onChange={(e) => setFormData({ ...formData, accommodation_pref: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {ACCOMMODATIONS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transportation Preference
                </label>
                <select
                  value={formData.transportation_pref}
                  onChange={(e) => setFormData({ ...formData, transportation_pref: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {TRANSPORTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DIETARY, ACCESSIBILITY & SPECIAL REQUESTS */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-navy-950">Dietary & Accessibility Needs</h2>
              <p className="text-xs text-slate-500 mt-1">We tailor restaurant recommendations and landmark accessibility to your requirements.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Dietary Preferences
                </label>
                <select
                  value={formData.dietary_preferences}
                  onChange={(e) => setFormData({ ...formData, dietary_preferences: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {DIETARY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Accessibility Requirements
                </label>
                <input
                  type="text"
                  value={formData.accessibility_needs}
                  onChange={(e) => setFormData({ ...formData, accessibility_needs: e.target.value })}
                  placeholder="e.g. Step-free access, wheelchair friendly, or None"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Requests or Must-See Highlights <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                placeholder="e.g. Must experience a traditional matcha tea ceremony, or visit Fushimi Inari at sunrise."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Summary Review */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600">
              <p className="font-bold text-navy-900 text-sm mb-1">Trip Summary Review:</p>
              <p>• <b>Destination:</b> {formData.destination}</p>
              <p>• <b>Duration:</b> {formData.days_count} Days ({formData.start_date} to {formData.end_date})</p>
              <p>• <b>Budget:</b> {formData.currency} {formData.budget?.toLocaleString()} ({formData.budget_tier})</p>
              <p>• <b>Pacing & Party:</b> {formData.travel_pace} pace for {formData.travel_style} ({formData.travelers_count} person)</p>
              <p>• <b>Interests:</b> {formData.interests.join(", ")}</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold shadow-md shadow-brand-500/20 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-700 hover:to-teal-600 text-white text-sm font-extrabold shadow-lg shadow-brand-500/25 transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Itinerary</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
