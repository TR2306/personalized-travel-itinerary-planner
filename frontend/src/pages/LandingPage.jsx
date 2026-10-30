import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Compass, MapPin, Calendar, DollarSign, ArrowRight, 
  CheckCircle2, ShieldCheck, Star, Users, Clock, FileDown, HeartHandshake,
  Layers, ChevronRight
} from 'lucide-react';

export const LandingPage = () => {
  const [quickDest, setQuickDest] = useState('');
  const navigate = useNavigate();

  const handleQuickStart = (e) => {
    e.preventDefault();
    if (quickDest.trim()) {
      navigate(`/builder?destination=${encodeURIComponent(quickDest.trim())}`);
    } else {
      navigate('/builder');
    }
  };

  const curatedDestinations = [
    {
      name: "Kyoto & Tokyo, Japan",
      country: "Japan",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
      tag: "Culture & Culinary",
      days: "7 Days",
      estCost: "$2,200",
      rating: 4.9,
    },
    {
      name: "Amalfi Coast & Positano",
      country: "Italy",
      image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
      tag: "Coastal Luxury",
      days: "5 Days",
      estCost: "$2,800",
      rating: 4.95,
    },
    {
      name: "Swiss Alps & Zermatt",
      country: "Switzerland",
      image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
      tag: "Nature & Hiking",
      days: "6 Days",
      estCost: "$3,100",
      rating: 4.88,
    },
    {
      name: "Bali & Nusa Penida",
      country: "Indonesia",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
      tag: "Tropical Sanctuary",
      days: "8 Days",
      estCost: "$1,450",
      rating: 4.92,
    },
    {
      name: "Paris & Loire Valley",
      country: "France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
      tag: "Art & Romance",
      days: "6 Days",
      estCost: "$2,500",
      rating: 4.89,
    },
    {
      name: "Reykjavik & Ring Road",
      country: "Iceland",
      image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80",
      tag: "Wild Adventure",
      days: "7 Days",
      estCost: "$2,900",
      rating: 4.94,
    },
  ];

  const features = [
    {
      icon: Layers,
      title: "Geographic Clustering",
      desc: "Our engine groups nearby attractions by neighborhood and transit corridors, eliminating frustrating cross-city backtracking.",
    },
    {
      icon: DollarSign,
      title: "Budget Discipline Engine",
      desc: "Input your actual target budget. RoamAI calculates realistic estimates for accommodations, dining, transit, and entry tickets.",
    },
    {
      icon: Clock,
      title: "Pacing Customization",
      desc: "Choose between Relaxed, Balanced, or Packed itineraries with realistic durations tailored to your physical rhythm.",
    },
    {
      icon: Sparkles,
      title: "Granular Regeneration",
      desc: "Unhappy with one afternoon or day? Regenerate only that specific day while preserving the rest of your trip completely intact.",
    },
    {
      icon: HeartHandshake,
      title: "Dietary & Accessibility Focus",
      desc: "Get dining and attraction recommendations customized for vegetarian, vegan, halal, or mobility-accessible requirements.",
    },
    {
      icon: FileDown,
      title: "Instant PDF Travel Guide",
      desc: "Download a beautifully formatted, printer-ready travel guide PDF complete with day schedules, tips, and transport notes.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Define Your Dream Trip",
      desc: "Enter your destination, dates, budget, travel party, pacing, and dietary or accessibility preferences.",
    },
    {
      num: "02",
      title: "AI Optimizes the Journey",
      desc: "Generative AI clusters attractions, allocates time slots, selects culinary gems, and builds your daily schedule.",
    },
    {
      num: "03",
      title: "Customize, Save & Roam",
      desc: "Tweak activities inline, regenerate single days, sync to Supabase, or export to a professional PDF travel guide.",
    },
  ];

  const testimonials = [
    {
      name: "Elena Rostova",
      role: "Solo Traveler & Photographer",
      dest: "10 Days across Japan",
      text: "RoamAI planned my Tokyo & Kyoto trip better than a $500 travel agent. The morning photo spots and neighborhood routing saved me hours every single day.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "Marcus & Sarah Sterling",
      role: "Couple Travel Bloggers",
      dest: "Amalfi Coast Honeymoon",
      text: "The budget tracking and dinner recommendations were spot on. Being able to regenerate just Day 3 when it rained was a game-changer!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
    {
      name: "David Chen",
      role: "Family Vacation Planner",
      dest: "Swiss Alps Adventure",
      text: "Traveling with two kids requires strict pacing. RoamAI honored our relaxed pace and found kid-friendly mountain trains with zero stress.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none opacity-60">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-bold tracking-wide uppercase shadow-xs mb-8">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>AI-Powered Travel Intelligence</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-navy-950 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Your Journey, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Perfectally Planned with AI.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Personalized, day-by-day travel itineraries organized by geographic proximity, 
            realistic budgets, and your unique travel style.
          </p>

          {/* Quick Search CTA Form */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form onSubmit={handleQuickStart} className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-3 px-4 py-2 w-full">
                <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
                <input
                  type="text"
                  value={quickDest}
                  onChange={(e) => setQuickDest(e.target.value)}
                  placeholder="Where do you want to travel? (e.g. Kyoto, Japan)"
                  className="w-full text-sm sm:text-base font-semibold text-navy-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all duration-200"
              >
                <span>Plan Trip Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Popular:</span>
              {['Kyoto, Japan', 'Positano, Italy', 'Zermatt, Switzerland', 'Bali, Indonesia', 'Paris, France'].map((dest) => (
                <button
                  key={dest}
                  onClick={() => navigate(`/builder?destination=${encodeURIComponent(dest)}`)}
                  className="px-2.5 py-1 rounded-full bg-slate-100/80 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-transparent transition-all"
                >
                  {dest}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Stats */}
          <div className="mt-16 pt-12 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-left sm:text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950">100%</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Personalized Itineraries</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950">Zero</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Cross-City Backtracking</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950">1-Click</p>
              <p className="text-xs font-medium text-slate-500 mt-1">PDF Guide Generation</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-navy-950">4.9 / 5</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Traveler Satisfaction</p>
            </div>
          </div>

        </div>
      </section>

      {/* Curated Destinations Section */}
      <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-600 font-bold text-xs uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              <span>Inspiration For Your Next Escape</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
              Popular AI-Curated Destinations
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-xl">
              Pre-engineered with top geographic routing, local culinary spots, and realistic budgets.
            </p>
          </div>
          <button
            onClick={() => navigate('/builder')}
            className="mt-4 md:mt-0 flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>Custom Destination</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {curatedDestinations.map((dest) => (
            <div
              key={dest.name}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-navy-900 shadow-xs">
                  {dest.tag}
                </span>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dest.days}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    <span>{dest.rating}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    {dest.country}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Budget</span>
                    <span className="text-base font-extrabold text-navy-900">{dest.estCost}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/builder?destination=${encodeURIComponent(dest.name)}`)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white text-xs font-bold transition-all duration-200"
                  >
                    <span>Plan Trip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features & Benefits Grid */}
      <section className="bg-slate-50/70 py-20 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Smart Travel Technology
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
              Engineered for Real-World Travelers
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Unlike generic AI chat prompts, RoamAI enforces strict geographic logic, budgeting constraints, and full itinerary editing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card transition-all duration-200 space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Simple 3-Step Process
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
            How RoamAI Works
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            From empty idea to fully booked vacation plan in under 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((st, i) => (
            <div
              key={st.num}
              className="relative p-8 rounded-2xl bg-white border border-slate-200/80 shadow-card flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-3xl font-black text-brand-500/30">{st.num}</span>
                <h3 className="text-xl font-bold text-navy-900 mt-2">{st.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{st.desc}</p>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-brand-500 to-teal-400 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Loved by Explorers
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
            Real Travelers. Unforgettable Trips.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  "{t.text}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-navy-900">{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.role} • <span className="text-brand-600 font-medium">{t.dest}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-brand-950 text-white p-8 sm:p-14 relative overflow-hidden shadow-card">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-400/30 uppercase tracking-wider">
              Start Free Today
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready for your next unforgettable adventure?
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Create your customized day-by-day travel plan in seconds. No credit card required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => navigate('/builder')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Smart Trip Builder</span>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 transition-all"
              >
                Sign In to Saved Trips
              </button>
            </div>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </section>

    </div>
  );
};
