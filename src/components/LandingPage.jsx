import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  SlidersHorizontal,
  Database,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Leaf,
  Compass,
  FileText,
  UserCheck
} from './icons';

export default function LandingPage() {
  const { setActiveTab } = useApp();

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-140px)] pb-16">
      
      {/* Hero Section */}
      <section className="pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Top Header Grid: Civil Engineering Image & Title */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-4 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>National Civil & Structural Engineering Decision Platform • India</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Structural Material Selection <br />
              <span className="text-blue-700">Decision Support Software</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              An advanced Multi-Criteria Decision Analysis (MCDA TOPSIS) system designed for Indian civil, structural, bridge, and metro projects. Evaluate and benchmark structural materials conforming to governing Bureau of Indian Standards (BIS) and Indian Roads Congress (IRC) specifications.
            </p>

            {/* Indian Engineering Standards Tags */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="font-semibold text-slate-700 font-sans">BIS & IRC Standards:</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-sm font-semibold">IS 456:2000 (Plain & RC)</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-sm font-semibold">IS 800:2007 (Steel)</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-sm font-semibold">IS 1893 (Seismic)</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-sm font-semibold">IRC:112 (Concrete Bridges)</span>
            </div>

          </div>

          {/* Right Column: Civil Engineering Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200/90 shadow-xl bg-white group">
              <img
                src="/civil_engineering_structure.jpg"
                alt="Modern Monumental Civil Engineering Infrastructure"
                className="w-full h-72 sm:h-80 object-cover group-hover:scale-102 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[11px] font-mono uppercase tracking-wider text-blue-200 font-bold">
                  Indian Mega Infrastructure Benchmark
                </p>
                <p className="text-xs font-semibold text-white/90">
                  Mumbai Trans Harbour Link (Atal Setu) & Chenab Rail Arch Bridge Design Specs
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Indian Workflow Banner: Home -> Register -> Login -> Segregated Role Access */}
        <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400 text-blue-200 text-[10px] font-mono uppercase font-bold">
              Institutional User Flow
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Home → Role Registration (Strict 5-Rule Password Security) → SQLite Auth → Role-Segregated Portals
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px]">1</span>
              <div>
                <p className="font-bold">Select Portal</p>
                <p className="text-[11px] text-blue-200">Admin, Employee, or Client</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px]">2</span>
              <div>
                <p className="font-bold">Register Account</p>
                <p className="text-[11px] text-blue-200">Live 5-criteria checkmarks</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px]">3</span>
              <div>
                <p className="font-bold">SQLite & Bcrypt</p>
                <p className="text-[11px] text-blue-200">Stored in database/users.db</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/10 p-2.5 rounded-xl border border-white/10">
              <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px]">4</span>
              <div>
                <p className="font-bold">Role Workspaces</p>
                <p className="text-[11px] text-blue-200">Admin, Form, or Reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Clear Role Portals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Employee Portal Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-4">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                  Engineers & Designers
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Employee Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                For Structural, Bridge, and Geotechnical Engineers. Successful sign-in leads straight to the <strong>Project Requirements Input Form</strong> to evaluate concrete mixes (M40–M80), TMT steels (Fe 500D / 550D), and run TOPSIS ranking.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('employee-portal')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 transition-all cursor-pointer"
              >
                <span>Employee Portal (Login / Register)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Admin Portal Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4">
                <Database className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                  Database Authority
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Admin Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                For Chief Materials Specialists & Standards Board Administrators. Sign in to oversee the 1,000+ material database, add new IS grades, modify mechanical criteria, and manage system users.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('admin-portal')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                <span>Admin Portal (Login / Register)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Customer Portal Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  Project Authorities & Clients
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Customer Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                For Government Infrastructure Authorities (NHAI, MMRDA, MSRDC, IRCON) and Clients. Sign in to review signed project recommendations, durability evaluations, and print-ready compliance dossiers.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('customer-portal')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <span>Customer Portal (Login / Register)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
