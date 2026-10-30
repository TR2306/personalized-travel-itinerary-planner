import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Luggage, Search, Plus, Calendar, DollarSign, MapPin, 
  Trash2, Copy, ArrowRight, Download, Filter, Sparkles 
} from 'lucide-react';
import { tripsApi } from '../api/client';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      const res = await tripsApi.list();
      setTrips(res.data || []);
    } catch (err) {
      console.error(err);
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
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip and its itinerary?")) return;
    setActionLoading(true);
    try {
      await tripsApi.delete(tripId);
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.destination?.toLowerCase().includes(search.toLowerCase()) ||
                          t.start_location?.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'All' || t.budget_tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading saved trips from Supabase..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy-950 tracking-tight">
            My Saved Trips
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal travel itineraries, duplicate routes, and export PDF travel guides.
          </p>
        </div>

        <Link
          to="/builder"
          className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by destination city, country, or departure location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Tier:
          </span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Tiers</option>
            <option value="Budget">Budget</option>
            <option value="Moderate">Moderate</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>
      </div>

      {/* Trips Content */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-300 shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Luggage className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-navy-900">
              {search ? 'No matching trips found' : 'No saved trips yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {search ? 'Try clearing your search filters.' : 'Use the Smart Trip Builder to design and generate your first AI itinerary.'}
            </p>
          </div>
          <Link
            to="/builder"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Plan a Trip</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const hasItinerary = Boolean(trip.itinerary_data || trip.itinerary_id);
            return (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-200 p-6 flex flex-col justify-between space-y-4 group"
              >
                <div>
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
  );
};
