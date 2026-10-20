import React from 'react';
import {
  BarChart3,
  Scale,
  Clock,
  SlidersHorizontal,
  Search,
  Database,
  Building2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  User,
  Sparkles
} from '../icons';

export default function EmployeeSidebar({
  currentView = 'dashboard',
  onSelectView,
  metrics,
  currentUser,
  isMobileOpen = false,
  onCloseMobile
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Overview Dashboard',
      path: '/employee/dashboard',
      icon: BarChart3,
      badge: metrics?.total_materials ? `${metrics.total_materials.toLocaleString()}` : '1,000',
      description: 'System metrics & recent searches'
    },
    {
      id: 'predict',
      label: 'Prediction',
      path: '/employee/predict',
      icon: SlidersHorizontal,
      badge: 'MCDM TOPSIS',
      description: 'Multi-criteria material decision engine'
    },
    {
      id: 'search',
      label: 'Search by Name',
      path: '/employee/search',
      icon: Search,
      badge: '1,000 Dataset',
      description: 'Instant material lookup & specs'
    },
    {
      id: 'comparison',
      label: 'Material Comparison',
      path: '/employee/comparison',
      icon: Scale,
      badge: 'Side-by-Side',
      description: 'Multi-material spec & radar charts'
    },
    {
      id: 'history',
      label: 'Project Search History',
      path: '/employee/history',
      icon: Clock,
      badge: metrics?.total_searches ? `${metrics.total_searches} Saved` : 'SQLite Live',
      description: 'Dynamic searchable audit records'
    },
    {
      id: 'manage',
      label: 'Material DB Manager',
      path: '/employee/manage',
      icon: Database,
      badge: 'Live CRUD',
      description: 'Add, edit & inspect materials'
    }
  ];


  const content = (
    <div className="flex flex-col h-full bg-white text-slate-800 border-r border-slate-200/90 w-72 select-none shadow-xs">
      
      {/* 1. BRAND & PORTAL HEADER */}
      <div className="p-5 border-b border-slate-200/80 bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shadow-sm flex-shrink-0 text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 uppercase font-sans">
                SM-DSS Engine
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Civil Engineering Decision Support
            </p>
          </div>
        </div>
      </div>

      {/* 2. AUTHENTICATED EMPLOYEE PROFILE WIDGET */}
      <div className="p-3.5 mx-3 my-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200/70 flex items-center justify-center text-blue-700 flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">
              {currentUser?.name || 'Eng. Priya Nair'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono truncate">
              {currentUser?.department || 'Lead Structural Engineer'}
            </p>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-emerald-700">
          <span className="flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            IS 456 / IRC:112 Certified
          </span>
          <span className="font-mono text-slate-400">Active</span>
        </div>
      </div>

      {/* 3. NAVIGATION SECTION */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono mb-2">
          Dashboard Modules
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectView(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:text-blue-700 group-hover:bg-blue-50'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isActive ? 'font-bold text-blue-900' : 'font-semibold text-slate-800'}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isActive 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                  isActive ? 'text-blue-700' : 'text-slate-400'
                }`}>
                  {item.description}
                </p>
                <p className="text-[9px] font-mono opacity-60 mt-0.5">
                  {item.path}
                </p>
              </div>

              <ChevronRight className={`w-3.5 h-3.5 mt-1 transition-transform ${
                isActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
            </button>
          );
        })}
      </div>

      {/* 4. SYSTEM ARCHITECTURE & SQLITE STATUS FOOTER */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/70 text-[11px] text-slate-500 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>SQLite: materials.db</span>
          </span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            Synced
          </span>
        </div>
        <p className="text-[10px] text-slate-500 leading-snug">
          Multi-criteria TOPSIS evaluation engine calibrated for standard Indian design codes.
        </p>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-[calc(100vh-5rem)] sticky top-20 flex-shrink-0 shadow-xs">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile} 
          />
          <div className="relative z-10 w-72 h-full shadow-xl flex bg-white">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
