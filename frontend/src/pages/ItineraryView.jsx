import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Compass, Calendar, DollarSign, MapPin, Sparkles, Download, 
  RotateCw, Edit3, Trash2, Plus, ChevronDown, ChevronUp, Check, 
  Utensils, Hotel, Car, Info, ShieldAlert, Share2, AlertCircle 
} from 'lucide-react';
import { tripsApi, itineraryApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EditActivityModal } from '../components/EditActivityModal';

export const ItineraryView = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');
  const [error, setError] = useState('');

  // Expand/collapse states for days
  const [expandedDays, setExpandedDays] = useState({});

  // Regeneration Modals
  const [regenDayModal, setRegenDayModal] = useState({ open: false, dayNum: 1, notes: '' });
  const [regenTripModal, setRegenTripModal] = useState({ open: false, notes: '' });
  const [regenLoading, setRegenLoading] = useState(false);

  // Activity Edit Modal
  const [activityModal, setActivityModal] = useState({
    open: false,
    dayNum: 1,
    activity: null,
    isNew: false,
  });

  // Fetch trip & itinerary
  useEffect(() => {
    if (!tripId) {
      setError("No trip ID specified. Please create a trip first.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const res = await tripsApi.get(tripId);
        const tripData = res.data;
        setTrip(tripData);

        if (tripData.itinerary_data) {
          setItinerary(tripData.itinerary_data);
          // Default all days expanded
          const initExp = {};
          (tripData.itinerary_data.days || []).forEach(d => {
            initExp[d.day_number] = true;
          });
          setExpandedDays(initExp);
        } else {
          // If no itinerary generated yet, generate one automatically
          const genRes = await itineraryApi.generate({
            ...tripData,
            trip_id: tripData.id,
          });
          setItinerary(genRes.data.itinerary_data);
          const initExp = {};
          (genRes.data.itinerary_data.days || []).forEach(d => {
            initExp[d.day_number] = true;
          });
          setExpandedDays(initExp);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load itinerary. Please verify backend connection.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tripId]);

  const toggleDay = (dayNum) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  // Save modified itinerary back to backend
  const handleSaveTrip = async () => {
    if (!itinerary || !tripId) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await itineraryApi.save({
        trip_id: tripId,
        itinerary_data: itinerary,
        estimated_cost: itinerary.total_estimated_budget || trip.budget,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save itinerary updates.");
    } finally {
      setSaving(false);
    }
  };

  // PDF Export
  const handleDownloadPdf = async () => {
    if (!tripId) return;
    try {
      const response = await itineraryApi.exportPdf(itinerary);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RoamAI_${trip?.destination?.replace(/[^a-zA-Z0-9]/g, '_')}_Itinerary.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF Download failed:', err);
      // Fallback: window print
      window.print();
    }
  };

  // Share Trip link
  const handleShareTrip = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      prompt("Copy your itinerary link:", window.location.href);
    }
  };

  // Regenerate Entire Trip
  const handleRegenerateTrip = async () => {
    setRegenLoading(true);
    try {
      const res = await itineraryApi.regenerate({
        ...trip,
        trip_id: tripId,
        custom_feedback: regenTripModal.notes,
      });
      setItinerary(res.data.itinerary_data);
      setRegenTripModal({ open: false, notes: '' });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to regenerate itinerary.");
    } finally {
      setRegenLoading(false);
    }
  };

  // Regenerate Single Day
  const handleRegenerateSingleDay = async () => {
    const dayNum = regenDayModal.dayNum;
    setRegenLoading(true);
    try {
      const currentDay = itinerary.days.find(d => d.day_number === dayNum);
      const res = await itineraryApi.regenerateDay({
        trip_id: tripId,
        destination: trip.destination,
        day_number: dayNum,
        total_days: itinerary.total_days || trip.days_count,
        current_day_plan: currentDay,
        travel_pace: trip.travel_pace,
        interests: trip.interests,
        budget_tier: trip.budget_tier,
        currency: trip.currency,
        dietary_preferences: trip.dietary_preferences,
        regeneration_notes: regenDayModal.notes,
      });

      if (res.data.full_itinerary) {
        setItinerary(res.data.full_itinerary);
      } else if (res.data.day_plan) {
        // Update locally
        const updatedDays = itinerary.days.map(d => 
          d.day_number === dayNum ? res.data.day_plan : d
        );
        const updatedItinerary = { ...itinerary, days: updatedDays };
        setItinerary(updatedItinerary);
        await itineraryApi.save({
          trip_id: tripId,
          itinerary_data: updatedItinerary,
          estimated_cost: updatedItinerary.total_estimated_budget || trip.budget,
        });
      }

      setRegenDayModal({ open: false, dayNum: 1, notes: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to regenerate day.");
    } finally {
      setRegenLoading(false);
    }
  };

  // Save activity (edit or add)
  const handleSaveActivity = async (updatedActivity) => {
    const { dayNum, isNew } = activityModal;
    const updatedDays = itinerary.days.map(d => {
      if (d.day_number !== dayNum) return d;
      let activities = [...d.activities];
      if (isNew) {
        activities.push(updatedActivity);
      } else {
        activities = activities.map(a => a.id === updatedActivity.id ? updatedActivity : a);
      }
      return { ...d, activities };
    });

    const updatedItinerary = { ...itinerary, days: updatedDays };
    setItinerary(updatedItinerary);

    // Auto-save to database
    await itineraryApi.save({
      trip_id: tripId,
      itinerary_data: updatedItinerary,
      estimated_cost: updatedItinerary.total_estimated_budget || trip.budget,
    });
  };

  // Delete activity
  const handleDeleteActivity = async (dayNum, activityId) => {
    if (!window.confirm("Remove this activity from the day?")) return;
    const updatedDays = itinerary.days.map(d => {
      if (d.day_number !== dayNum) return d;
      return {
        ...d,
        activities: d.activities.filter(a => a.id !== activityId),
      };
    });
    const updatedItinerary = { ...itinerary, days: updatedDays };
    setItinerary(updatedItinerary);

    await itineraryApi.save({
      trip_id: tripId,
      itinerary_data: updatedItinerary,
      estimated_cost: updatedItinerary.total_estimated_budget || trip.budget,
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Retrieving personalized itinerary..." />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2 justify-center">
          <AlertCircle className="w-5 h-5" />
          <span>{error || "Itinerary not found"}</span>
        </div>
        <button
          onClick={() => navigate('/builder')}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md"
        >
          Return to Trip Builder
        </button>
      </div>
    );
  }

  const {
    destination,
    destination_overview,
    total_days,
    currency = "USD",
    total_estimated_budget,
    days = [],
    accommodations = [],
    budget_breakdown,
    transportation_guide = [],
    packing_and_safety_tips = [],
    disclaimer
  } = itinerary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header & Actions Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200/60">
                {total_days} Days Adventure
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {trip?.travel_style} • {trip?.travel_pace} Pace
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700">
                {trip?.budget_tier} Tier
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
              {destination}
            </h1>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              {destination_overview}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 no-print">
            
            <button
              onClick={handleSaveTrip}
              disabled={saving}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : saveSuccess ? 'Saved to Supabase!' : 'Save Trip'}</span>
            </button>

            <button
              onClick={() => setRegenTripModal({ open: true, notes: '' })}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              <RotateCw className="w-4 h-4 text-brand-500" />
              <span>Regenerate Entire Trip</span>
            </button>

            <button
              onClick={handleShareTrip}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              <Share2 className="w-4 h-4 text-teal-600" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Trip'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-950 text-white text-xs font-bold shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>

        </div>

        {/* Quick Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
            <span className="text-base font-extrabold text-navy-900">{total_days} Days</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Spend</span>
            <span className="text-base font-extrabold text-navy-900">{currency} {Number(total_estimated_budget).toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Travel Group</span>
            <span className="text-base font-extrabold text-navy-900">{trip?.travelers_count || 2} Traveler(s)</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dietary Guide</span>
            <span className="text-base font-extrabold text-brand-700 truncate block">{trip?.dietary_preferences || 'Standard'}</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Left = Day Plans (8 cols), Right = Budget & Stays (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Day-by-Day Schedule */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-navy-950 tracking-tight">
              Day-by-Day Itinerary Schedule
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 no-print">
              <button
                onClick={() => {
                  const all = {};
                  days.forEach(d => all[d.day_number] = true);
                  setExpandedDays(all);
                }}
                className="hover:text-brand-600"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                onClick={() => setExpandedDays({})}
                className="hover:text-brand-600"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Quick Day Selector Tabs */}
          {days.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print">
              <button
                type="button"
                onClick={() => {
                  setSelectedDayFilter('all');
                  const all = {};
                  days.forEach(d => all[d.day_number] = true);
                  setExpandedDays(all);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDayFilter === 'all'
                    ? 'bg-navy-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Days ({days.length})
              </button>
              {days.map((d) => (
                <button
                  key={`day-tab-${d.day_number}`}
                  type="button"
                  onClick={() => {
                    setSelectedDayFilter(d.day_number);
                    setExpandedDays({ [d.day_number]: true });
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDayFilter === d.day_number
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Day {d.day_number}
                </button>
              ))}
            </div>
          )}

          {/* Days Loop */}
          <div className="space-y-4">
            {(selectedDayFilter === 'all' ? days : days.filter(d => d.day_number === selectedDayFilter)).map((day) => {
              const isExpanded = expandedDays[day.day_number] ?? true;
              return (
                <div
                  key={day.day_number}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden transition-all duration-200"
                >
                  {/* Day Header Accordion */}
                  <div
                    onClick={() => toggleDay(day.day_number)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                        D{day.day_number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-navy-900">{day.title}</h3>
                          <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400">
                            • {day.theme}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{day.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline-block text-xs font-bold text-slate-600">
                        {currency} {day.daily_estimated_cost ? Number(day.daily_estimated_cost).toFixed(0) : '—'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Day Content Body */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-100 space-y-6 animate-in fade-in duration-150">
                      
                      {/* Activities Timeline */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Scheduled Activities
                          </span>
                          <button
                            type="button"
                            onClick={() => setActivityModal({ open: true, dayNum: day.day_number, activity: null, isNew: true })}
                            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 no-print"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Activity</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          {day.activities.map((act) => (
                            <div
                              key={act.id}
                              className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    act.period === 'morning' ? 'bg-amber-100 text-amber-800' :
                                    act.period === 'afternoon' ? 'bg-blue-100 text-blue-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {act.time_slot}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    {act.category}
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-navy-900">{act.title}</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

                                <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${act.attraction_name || act.title} ${act.location}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Open in Google Maps"
                                    className="flex items-center gap-1 hover:text-brand-600 transition-colors group/map"
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-brand-500 group-hover/map:scale-115 transition-transform" />
                                    <span className="underline decoration-slate-300 decoration-dotted hover:decoration-brand-500">{act.location}</span>
                                  </a>
                                  {act.transportation_tip && (
                                    <span className="flex items-center gap-1 text-slate-500 italic">
                                      <Car className="w-3.5 h-3.5 text-slate-400" />
                                      {act.transportation_tip}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                                <span className="text-xs font-bold text-navy-900 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                  {act.cost_label || `${currency} ${act.estimated_cost}`}
                                </span>
                                <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity no-print">
                                  <button
                                    title="Edit Activity"
                                    onClick={() => setActivityModal({ open: true, dayNum: day.day_number, activity: act, isNew: false })}
                                    className="p-1.5 text-slate-500 hover:text-navy-900 hover:bg-white rounded-md transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    title="Delete Activity"
                                    onClick={() => handleDeleteActivity(day.day_number, act.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-md transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dining Recommendations */}
                      {day.dining && day.dining.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-brand-600" />
                            <span>Recommended Dining</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {day.dining.map((meal, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl bg-brand-50/50 border border-brand-100/70 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${meal.name} ${destination}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Search restaurant on Google Maps"
                                    className="font-bold text-brand-800 hover:text-brand-900 hover:underline"
                                  >
                                    {meal.meal_type}: {meal.name}
                                  </a>
                                  <span className="text-[11px] font-semibold text-slate-500">{meal.estimated_cost}</span>
                                </div>
                                <p className="text-slate-600"><span className="font-semibold">Cuisine:</span> {meal.cuisine}</p>
                                {meal.notes && <p className="text-slate-500 italic">{meal.notes}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Day Tip & Transit note */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <p className="text-slate-700">
                          <span className="font-bold text-navy-900">Transit:</span> {day.transport_summary}
                        </p>
                        {day.daily_tip && (
                          <p className="text-slate-700">
                            <span className="font-bold text-brand-700">Insider Tip:</span> {day.daily_tip}
                          </p>
                        )}
                      </div>

                      {/* Regenerate This Day Button */}
                      <div className="pt-2 flex justify-end no-print">
                        <button
                          type="button"
                          onClick={() => setRegenDayModal({ open: true, dayNum: day.day_number, notes: '' })}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-brand-500" />
                          <span>Regenerate Day {day.day_number} Only</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Budget Breakdown, Accommodations, and Travel Tips (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Budget Breakdown Card */}
          {budget_breakdown && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-500" />
                  <span>Estimated Budget Split</span>
                </h3>
                <span className="text-xs font-bold text-slate-500">{currency}</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Lodging & Stays</span>
                  <span className="font-bold text-navy-900">{currency} {Number(budget_breakdown.stay_estimate_total || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Dining & Meals</span>
                  <span className="font-bold text-navy-900">{currency} {Number(budget_breakdown.food_total || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Attractions & Entry</span>
                  <span className="font-bold text-navy-900">{currency} {Number(budget_breakdown.activities_total || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-600">Local Transportation</span>
                  <span className="font-bold text-navy-900">{currency} {Number(budget_breakdown.transport_total || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-sm font-extrabold text-navy-950">
                  <span>Grand Total</span>
                  <span className="text-brand-600">{currency} {Number(budget_breakdown.grand_total || total_estimated_budget).toLocaleString()}</span>
                </div>
              </div>

              {budget_breakdown.budget_advisory && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-[11px] text-teal-800">
                  {budget_breakdown.budget_advisory}
                </div>
              )}
            </div>
          )}

          {/* Accommodations Card */}
          {accommodations.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
                <Hotel className="w-4 h-4 text-brand-500" />
                <span>Suggested Stays</span>
              </h3>

              <div className="space-y-3">
                {accommodations.map((acc, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${acc.name} ${acc.area} ${destination}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Search accommodation on Google Maps"
                        className="font-bold text-navy-900 hover:text-brand-600 hover:underline"
                      >
                        {acc.name}
                      </a>
                      <span className="font-bold text-brand-700">{acc.price_range_per_night}</span>
                    </div>
                    <p className="text-slate-500 font-medium">{acc.area} • {acc.tier}</p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{acc.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transport & Safety Tips */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand-500" />
              <span>Transit & Safety Essentials</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              {transportation_guide.map((tip, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">•</span>
                  <span>{tip}</span>
                </p>
              ))}
              {packing_and_safety_tips.map((tip, idx) => (
                <p key={`p-${idx}`} className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">•</span>
                  <span>{tip}</span>
                </p>
              ))}
            </div>

            {disclaimer && (
              <p className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 italic">
                {disclaimer}
              </p>
            )}
          </div>

        </div>

      </div>

      {/* REGENERATE SINGLE DAY MODAL */}
      {regenDayModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-lg font-bold text-navy-950">
              Regenerate Day {regenDayModal.dayNum}
            </h3>
            <p className="text-xs text-slate-500">
              All other days in your itinerary will be preserved. Specify any changes or preferences for Day {regenDayModal.dayNum}.
            </p>
            <textarea
              rows={3}
              value={regenDayModal.notes}
              onChange={(e) => setRegenDayModal({ ...regenDayModal, notes: e.target.value })}
              placeholder="e.g. Include more outdoor scenic spots and less shopping, focus on vegan cafes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRegenDayModal({ open: false, dayNum: 1, notes: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateSingleDay}
                disabled={regenLoading}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                {regenLoading ? <span>Re-synthesizing...</span> : <span>Regenerate Day</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGENERATE ENTIRE TRIP MODAL */}
      {regenTripModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-card space-y-4">
            <h3 className="text-lg font-bold text-navy-950">
              Regenerate Entire Itinerary
            </h3>
            <p className="text-xs text-slate-500">
              Our AI will re-synthesize all {total_days} days of this trip based on your updated instructions.
            </p>
            <textarea
              rows={3}
              value={regenTripModal.notes}
              onChange={(e) => setRegenTripModal({ ...regenTripModal, notes: e.target.value })}
              placeholder="e.g. Shift from museum focus to active nature hikes and budget bistros..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRegenTripModal({ open: false, notes: '' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerateTrip}
                disabled={regenLoading}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                {regenLoading ? <span>Synthesizing...</span> : <span>Regenerate Trip</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY EDIT MODAL */}
      <EditActivityModal
        isOpen={activityModal.open}
        onClose={() => setActivityModal({ ...activityModal, open: false })}
        onSave={handleSaveActivity}
        activity={activityModal.activity}
        isNew={activityModal.isNew}
        currency={currency}
      />

    </div>
  );
};
