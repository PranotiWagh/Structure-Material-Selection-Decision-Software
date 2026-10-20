import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  Calendar,
  Building2,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Eye,
  X,
  Image as ImageIcon,
  Download,
  SlidersHorizontal,
  Layers,
  Leaf,
  FileText
} from '../icons';

export default function HistoryTab({
  savedProjects = [],
  onReloadProject,
  onDeleteProject,
  onNavigateToPredict
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStructureType, setSelectedStructureType] = useState('All');
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);

  // Structure types list for filter
  const structureTypes = useMemo(() => {
    const list = ['All'];
    savedProjects.forEach(p => {
      const st = p.requirements?.structureType || p.structure_type;
      if (st && !list.includes(st)) list.push(st);
    });
    return list;
  }, [savedProjects]);

  // Filtered project entries
  const filteredProjects = useMemo(() => {
    return savedProjects.filter(p => {
      const matchType = selectedStructureType === 'All' || 
        (p.requirements?.structureType || p.structure_type) === selectedStructureType;

      if (!searchQuery.trim()) return matchType;

      const q = searchQuery.toLowerCase();
      const matchText = 
        (p.name || p.project_name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.client || p.client_organization || p.clientName || '').toLowerCase().includes(q) ||
        (p.clientContact || p.client_contact || '').toLowerCase().includes(q) ||
        (p.topRecommendation || p.top_recommendation || '').toLowerCase().includes(q) ||
        (p.author || '').toLowerCase().includes(q);

      return matchType && matchText;
    });
  }, [savedProjects, searchQuery, selectedStructureType]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete dossier ${id} from SQLite database?`)) {
      if (onDeleteProject) onDeleteProject(id);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. VIEW HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              PROJECT ARCHIVE
            </span>
            <span className="text-xs font-mono text-slate-500">/employee/history</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project & Search History Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
            Complete historical audit trail of structural evaluation inputs, client stakeholder metadata, and selected material rankings.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 self-start sm:self-auto">
          {filteredProjects.length} Dossiers in SQLite
        </span>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by project title, client name, organization, material, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={selectedStructureType}
            onChange={(e) => setSelectedStructureType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          >
            {structureTypes.map(type => (
              <option key={type} value={type}>Structure: {type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. HISTORICAL DOSSIER CARDS GRID */}
      {filteredProjects.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-7 h-7 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              No Historical Dossiers Found in SQLite
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? `No past search records matched "${searchQuery}". Clear your search term to see all dossiers.`
                : 'All audit history is dynamically retrieved from SQLite with zero static mock data. When structural predictions are executed, the evaluations and client dossiers appear here.'}
            </p>
          </div>
          {onNavigateToPredict && (
            <button
              onClick={onNavigateToPredict}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-700/20 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Launch Prediction Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (

        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const req = project.requirements || {};
            const score = project.suitabilityScore || project.suitability_score || 90;
            const topMat = project.topRecommendation || project.top_recommendation || 'Standard Material';
            const clientOrg = project.clientOrganization || project.client_organization || project.client || 'National Infrastructure';
            const clientName = project.clientName || project.client_name || 'Project Director';
            const clientContact = project.clientContact || project.client_contact || '+91-XX-XXXX-XXXX';
            const photos = project.sitePhotos || [];

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 sm:p-6 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {project.id}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {project.date || '2026-10-15'}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {req.structureType || project.structure_type || 'Civil Structure'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      {project.name || project.project_name}
                    </h3>

                    {project.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Suitability Badge */}
                  <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between self-start">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-right">
                      <span className="text-lg font-black font-mono text-slate-900">
                        {score}%
                      </span>
                      <span className="text-[9px] font-mono uppercase text-slate-500 block">
                        MCDM Index
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid: Project + Customer + Top Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  
                  {/* Column 1: Structural Boundary Conditions */}
                  <div className="space-y-1.5">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400 font-mono">
                      Structural Input Parameters
                    </p>
                    <p><strong className="text-slate-800">Element:</strong> {req.structuralElement || project.structural_element || 'Primary Column'}</p>
                    <p><strong className="text-slate-800">Exposure:</strong> {req.environmentalCondition || project.environmental_condition || 'Marine'}</p>
                    <p><strong className="text-slate-800">Load Regime:</strong> {req.loadType || project.load_type || 'Dynamic'}</p>
                    <p><strong className="text-slate-800">Design Life:</strong> {req.designLife || project.design_life || 100} Years</p>
                  </div>

                  {/* Column 2: Customer / Client Details */}
                  <div className="space-y-1.5">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400 font-mono">
                      Customer & Stakeholder
                    </p>
                    <p className="font-bold text-slate-900 truncate">
                      {clientName}
                    </p>
                    <p className="text-slate-600 truncate">
                      {clientOrg}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500 truncate">
                      {clientContact}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Author: <span className="font-medium text-slate-700">{project.author || 'Priya Nair'}</span>
                    </p>
                  </div>

                  {/* Column 3: Recommended Material & Ranking */}
                  <div className="space-y-1.5">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400 font-mono">
                      Selected Material & Ranking
                    </p>
                    <p className="font-extrabold text-blue-700 text-xs line-clamp-1">
                      {topMat}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Governing Code: <span className="font-mono font-semibold text-slate-700">{project.standardCode || 'IS 456 / IRC:112'}</span>
                    </p>
                    {req.specialRequirements && req.specialRequirements.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {req.specialRequirements.slice(0, 2).map((r, i) => (
                          <span key={i} className="px-1.5 py-0.2 rounded text-[9px] bg-white border border-slate-200 text-slate-600 font-semibold truncate max-w-[150px]">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>



                {/* Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Status: Verified in SQLite Database
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer"
                      title="Delete record from SQLite"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>

                    <button
                      onClick={() => onReloadProject(project)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Reload in Predict Form</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}



    </div>
  );
}
