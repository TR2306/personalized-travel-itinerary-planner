import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Compass, Calendar, DollarSign, MapPin, ArrowRight, 
  Sparkles, Clock, Users, Trash2, Copy, FileText, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tripsApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Dashboard = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      const res = await tripsApi.list();
      setTrips(res.data || []);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDuplicate = async (tripId) => {
    setActionLoading(true);
    try {
      await tripsApi.duplicate(tripId);
      await fetchTrips();
    } catch (err) {
      console.error('Duplicate failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    setActionLoading(true);
    try {
      await tripsApi.delete(tripId);
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Stats calculation
  const totalTrips = trips.length;
  const totalDays = trips.reduce((acc, t) => acc + (t.days_count || 1), 0);
  const totalBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);
  const upcomingCount = trips.filter(t => t.status === 'planned').length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading your travel dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-teal-950 text-white shadow-card">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-400/30">
              Travel Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Explorer'}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Here is your personalized travel command center. Review upcoming itineraries, track your budget, or create a brand new adventure.
          </p>
        </div>

        <Link
          to="/builder"
          className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all hover:scale-102"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Trip</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Trips</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-navy-900 mt-3">{totalTrips}</p>
          <p className="text-[11px] text-slate-500 mt-1">Saved travel plans</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days on the Road</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-navy-900 mt-3">{totalDays}</p>
          <p className="text-[11px] text-slate-500 mt-1">Total itinerary days</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budgets Tracked</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-navy-900 mt-3">
            ${totalBudget.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Estimated travel spend</p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Trips</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-navy-900 mt-3">{upcomingCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Planned vacations</p>
        </div>
      </div>

      {/* Trips Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy-950 tracking-tight">
              Your Itineraries & Trips
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Click any trip to inspect day-wise schedules, customize activities, or export to PDF.
            </p>
          </div>
          {trips.length > 0 && (
            <Link
              to="/trips"
              className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage All ({trips.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {trips.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300 shadow-soft space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900">No trips planned yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                Your travel schedule is completely open! Use our Smart Trip Builder to generate your first custom AI itinerary.
              </p>
            </div>
            <Link
              to="/builder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Your First Trip</span>
            </Link>
          </div>
        ) : (
          /* Trips Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const hasItinerary = Boolean(trip.itinerary_data || trip.itinerary_id);
              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-200 p-6 flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200/50">
                        {trip.days_count} Days • {trip.travel_style}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {trip.currency} {Number(trip.budget).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-navy-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {trip.destination}
                    </h3>

                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{trip.start_date} to {trip.end_date}</span>
                      </p>
                      {trip.start_location && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Departing: {trip.start_location}</span>
                        </p>
                      )}
                    </div>

                    {/* Interests tags */}
                    {trip.interests && trip.interests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {trip.interests.slice(0, 3).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        title="Duplicate Trip"
                        onClick={() => handleDuplicate(trip.id)}
                        disabled={actionLoading}
                        className="p-2 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete Trip"
                        onClick={() => handleDelete(trip.id)}
                        disabled={actionLoading}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => navigate(`/itinerary?tripId=${trip.id}`)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>{hasItinerary ? 'View Itinerary' : 'Generate'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
