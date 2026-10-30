import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Compass, MapPin, Sparkles, User, LogOut, Menu, X, 
  Luggage, Database, CheckCircle, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { healthApi } from '../api/client';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    healthApi.check()
      .then(res => setSystemHealth(res.data))
      .catch(() => setSystemHealth({ status: 'offline' }));
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Explore', path: '/' },
    { name: 'Smart Builder', path: '/builder', icon: Sparkles },
    ...(isAuthenticated ? [
      { name: 'My Trips', path: '/trips', icon: Luggage },
      { name: 'Dashboard', path: '/dashboard' },
    ] : [])
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-navy-900">
                Roam<span className="text-brand-600">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/50">
                Planner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive(link.path)
                      ? 'text-brand-700 bg-brand-50/80 shadow-xs'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-brand-500" />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* System Status Pill */}
            {systemHealth && (
              <div 
                title={systemHealth.supabase_connected ? "Supabase Cloud DB Connected" : "Local Database Mode Active"} 
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600"
              >
                <span className={`w-2 h-2 rounded-full ${systemHealth.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <span>{systemHealth.supabase_connected ? 'Supabase Connected' : 'Engine Ready'}</span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-navy-900 leading-tight truncate max-w-[100px]">
                      {user?.name || 'Traveler'}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-none">Account</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {dropdownOpen && (
                  <div 
                    onMouseLeave={() => setDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-card py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-navy-900 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900 font-medium"
                    >
                      <Luggage className="w-4 h-4 text-slate-400" />
                      Dashboard & Trips
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900 font-medium"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Travel Preferences
                    </Link>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/builder"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4" />
                  Build Itinerary
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-xl text-base font-semibold ${
                isActive(link.path)
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50"
              >
                Profile & Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/builder"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-md"
              >
                Start Planning Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
