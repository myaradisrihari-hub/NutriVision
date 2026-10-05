import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  ScanLine,
  LayoutDashboard,
  History,
  BarChart3,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  Flame,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenAuth }) => {
  const { user, profile, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Academic Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav(isAuthenticated ? 'dashboard' : 'landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">NutriVision</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">AI Nutrition from Photos</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNav('landing')}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    currentTab === 'landing' ? 'text-emerald-700 bg-emerald-50/80' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    handleNav('landing');
                    setTimeout(() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                >
                  How it Works
                </button>
                <button
                  onClick={() => {
                    handleNav('landing');
                    setTimeout(() => {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Features
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('dashboard')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    currentTab === 'dashboard' ? 'text-emerald-700 bg-emerald-50/80' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleNav('analyze')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    currentTab === 'analyze' ? 'text-emerald-700 bg-emerald-50/80' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ScanLine className="w-4 h-4 text-emerald-600" />
                  <span>Analyze Meal</span>
                </button>

                <button
                  onClick={() => handleNav('history')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    currentTab === 'history' ? 'text-emerald-700 bg-emerald-50/80' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </button>

                <button
                  onClick={() => handleNav('analytics')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    currentTab === 'analytics' ? 'text-emerald-700 bg-emerald-50/80' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleNav('admin')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      currentTab === 'admin' ? 'text-indigo-700 bg-indigo-50/80' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Action CTAs / User menu */}
          <div className="flex items-center gap-2.5">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                      {user?.name}
                      {isAdmin && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-bold">
                          ADMIN
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-600">{profile?.fitness_goal || 'General Health'}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-600 truncate">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav('profile')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profile & Macro Goals</span>
                    </button>

                    <button
                      onClick={() => handleNav('analyze')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <ScanLine className="w-4 h-4 text-emerald-600" />
                      <span>Analyze New Meal</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleNav('admin')}
                        className="w-full text-left px-4 py-2 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 font-medium"
                      >
                        <ShieldAlert className="w-4 h-4 text-indigo-600" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNav('analyze')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50"
              >
                Analyze Meal
              </button>
              <button
                onClick={() => handleNav('history')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Meal History
              </button>
              <button
                onClick={() => handleNav('analytics')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Nutrition Analytics
              </button>
              <button
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                My Profile & Targets
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50"
                >
                  Admin Management
                </button>
              )}
              <div className="border-t border-slate-200 pt-2">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                className="w-full py-2.5 text-center text-sm font-semibold border border-slate-200 rounded-lg text-slate-700"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
                className="w-full py-2.5 text-center text-sm font-semibold bg-emerald-600 text-white rounded-lg"
              >
                Register Free
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
