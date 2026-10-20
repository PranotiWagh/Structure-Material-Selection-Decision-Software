import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Printer,
  ShieldCheck,
  Trophy
} from './icons';

export default function CustomerReportsView() {
  const {
    savedProjects,
    selectedSavedProject,
    currentUser,
    setActiveTab
  } = useApp();

  const [activeProject, setActiveProject] = useState(
    selectedSavedProject || savedProjects[0]
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
              CLIENT PORTAL // VIEW-ONLY REPOSITORY
            </span>
            <span className="text-xs text-slate-500">
              Stakeholder: <strong className="text-slate-800">{currentUser?.name || "Alexander Wright"}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verified Structural Material Reports & Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Access validated engineering selection dossiers, multi-criteria trade-offs, and certified material rankings for your infrastructure assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('customer-page')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <span>✨ Used Materials Manifest</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Projects List (4 cols), Right Dossier Viewer (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Saved Projects List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1 mb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Saved Project Dossiers ({savedProjects.length})
            </h3>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">View-Only</span>
          </div>

          {savedProjects.map((proj) => {
            const isSelected = activeProject?.id === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => setActiveProject(proj)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all bg-white shadow-sm ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    {proj.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    proj.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    proj.status === 'Under Review' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {proj.status}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 line-clamp-1 mb-1">
                  {proj.name}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-1">
                  {proj.requirements.structureType} • {proj.requirements.structuralElement}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Prime Pick:</span>
                  <span className="font-bold text-emerald-700 truncate max-w-[150px]">
                    {proj.topRecommendation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Dossier Detail Viewer */}
        <div className="lg:col-span-8">
          {activeProject ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
              
              {/* Report Header Card */}
              <div className="pb-6 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    DOSSIER ID: {activeProject.id}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Evaluation Date: {activeProject.date}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-900">
                  {activeProject.name}
                </h2>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                  <div>
                    <span className="text-slate-400">Author:</span> <span className="text-slate-800 font-bold">{activeProject.author}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Client:</span> <span className="text-slate-800 font-bold">{activeProject.client}</span>
                  </div>
                </div>
              </div>

              {/* Prime Recommendation Highlight Card */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <Trophy className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
                      Top Verified Recommendation
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {activeProject.topRecommendation}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Optimal multi-criteria fit for {activeProject.requirements.designLife}-year design envelope.
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 bg-white p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Suitability Index</span>
                  <span className="text-2xl font-black font-mono text-emerald-700">{activeProject.suitabilityScore}%</span>
                </div>
              </div>

              {/* Parameters Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                  Applied Engineering Constraints
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Structure</span>
                    <span className="font-bold text-slate-800 block mt-0.5 truncate">{activeProject.requirements.structureType}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Structural Element</span>
                    <span className="font-bold text-blue-700 block mt-0.5 truncate">{activeProject.requirements.structuralElement}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Governing Load</span>
                    <span className="font-bold text-slate-800 block mt-0.5 truncate">{activeProject.requirements.loadType}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Design Life</span>
                    <span className="font-mono font-bold text-indigo-700 block mt-0.5">{activeProject.requirements.designLife} Years</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Exposure Class</span>
                    <span className="font-bold text-slate-800 block mt-0.5">{activeProject.requirements.environmentalCondition}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Budget Category</span>
                    <span className="font-bold text-slate-800 block mt-0.5">{activeProject.requirements.budgetRange}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Low-Carbon Preference</span>
                    <span className="font-bold text-emerald-700 block mt-0.5">
                      {activeProject.requirements.sustainabilityPreference ? 'Active (Prioritized)' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-600 block mb-2">
                  Special Performance Criteria Included
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.requirements.specialRequirements.map((r) => (
                    <span key={r} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-800">
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certified Sign-off Footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified by Registered Professional Engineer (PE)</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  SM-DSS Engine Hash: #MD5-9a84b12
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-sm">
              Select a project from the left repository to view details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
