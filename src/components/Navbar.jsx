import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  ArrowLeft, 
  LogOut, 
  Database,
  SlidersHorizontal,
  FileCheck2,
  Compass,
  Sparkles
} from './icons';

export default function Navbar() {
  const { currentUser, logout, activeTab, setActiveTab } = useApp();

  const isHome = activeTab === 'home';
  const isPortalView = ['admin-portal', 'employee-portal', 'customer-portal'].includes(activeTab);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 flex items-center justify-center border border-blue-200 shadow-md group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                SM-DSS
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                Civil Engineering • India
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Structural Material Selection Decision Support Software
            </p>
          </div>
        </div>

        {/* Header Right Section */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            /* AFTER LOGIN: ONLY Back button, Active User badge, and Logout button */
            <div className="flex items-center gap-3">
              
              {/* Back Button */}
              <button
                onClick={() => {
                  if (activeTab === 'prediction') {
                    setActiveTab('employee-dashboard');
                  } else if (activeTab === 'evaluation-results') {
                    setActiveTab('prediction');
                  } else if (currentUser.role === 'admin') {
                    setActiveTab('admin-dashboard');
                  } else if (currentUser.role === 'customer') {
                    setActiveTab('customer-reports');
                  } else {
                    setActiveTab('employee-dashboard');
                  }
                }}

                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Back</span>
              </button>

              {/* Active User Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  currentUser.role === 'admin' ? 'bg-amber-500' :
                  currentUser.role === 'employee' ? 'bg-blue-600' :
                  'bg-emerald-500'
                }`} />
                <span className="font-semibold text-slate-800">{currentUser.name || currentUser.email}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  ({currentUser.role})
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shadow-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Logout</span>
              </button>

            </div>
          ) : activeTab === 'home' ? (
            /* ON HOME PAGE (Logged Out): Three Separate Portal Entries */
            <div className="flex items-center gap-2">

              <button
                onClick={() => setActiveTab('admin-portal')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all shadow-sm cursor-pointer"
              >
                <Database className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Admin Portal</span>
                <span className="sm:hidden">Admin</span>
              </button>

              <button
                onClick={() => setActiveTab('customer-portal')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-sm cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Customer Portal</span>
                <span className="sm:hidden">Customer</span>
              </button>

              <button
                onClick={() => setActiveTab('employee-portal')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Employee Portal</span>
                <span className="sm:hidden">Employee</span>
              </button>
            </div>
          ) : (
            /* INSIDE A ROLE PORTAL VIEW (Logged Out): Back to Home button */
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Back to Home</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
