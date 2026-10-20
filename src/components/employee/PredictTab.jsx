import React, { useState } from 'react';
import {
  STRUCTURE_TYPES,
  STRUCTURAL_ELEMENTS,
  LOAD_TYPES,
  ENVIRONMENTAL_CONDITIONS,
  SPECIAL_REQUIREMENTS,
  DESIGN_LIFE_MILESTONES,
  ENGINEERING_PRESETS
} from '../../data/formOptions';
import {
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  Building2,
  ArrowRight,
  Leaf,
  Layers,
  ShieldCheck,
  Check
} from '../icons';
import { runMcdmEvaluation } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function PredictTab({
  requirements,
  setRequirements,
  onExecuteMcdm,
  onSaveToSqlite,
  showToast,
  currentUser,
  onNavigateToHistory,
  onNavigateToResult
}) {
  const { savedProjects = [] } = useApp();
  const [loading, setLoading] = useState(false);

  // Dynamic Project Metadata State (Connected to SQLite DB)
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientOrganization, setClientOrganization] = useState('');

  const handleSelectSavedProject = (projId) => {
    setSelectedProjectId(projId);
    if (!projId) {
      setProjectName('');
      setClientOrganization('');
      return;
    }
    const found = savedProjects.find(p => p.id === projId);
    if (found) {
      setProjectName(found.name || found.project_name || '');
      setClientOrganization(found.client || found.client_organization || found.clientOrganization || '');
      if (found.requirements) {
        setRequirements(prev => ({
          ...prev,
          ...found.requirements
        }));
      }
      if (showToast) showToast(`Loaded parameters from "${found.name || found.id}"`, 'info');
    }
  };

  // Requirement updates
  const updateField = (field, value) => {
    setRequirements(prev => ({ ...prev, [field]: value }));
  };

  const toggleSpecialRequirement = (reqId) => {
    setRequirements(prev => {
      const current = prev.specialRequirements || [];
      const updated = current.includes(reqId)
        ? current.filter(id => id !== reqId)
        : [...current, reqId];
      return { ...prev, specialRequirements: updated };
    });
  };

  const applyPreset = (preset) => {
    setRequirements(preset.data);
    setProjectName(preset.name);
    if (showToast) showToast(`Loaded Indian Preset: ${preset.name}`, 'info');
  };

  // Trigger MCDM TOPSIS Evaluation & Navigate to the Dedicated Prediction Output Page
  const handleRunEvaluation = async () => {
    setLoading(true);
    try {
      let results = [];
      const backendResults = await runMcdmEvaluation(requirements, 25);
      if (backendResults && backendResults.top_recommendations) {
        results = backendResults.top_recommendations.map(item => ({
          rank: item.rank,
          overallScore: item.overall_score,
          material: {
            id: item.material.id,
            name: item.material.name,
            category: item.material.category,
            compressiveStrength: item.material.compressive_strength,
            tensileStrength: item.material.tensile_strength,
            density: item.material.density,
            embodiedCarbon: item.material.embodied_carbon,
            costIndex: item.material.cost_index,
            costInrM3: item.material.cost_inr_m3,
            co2Emission: item.material.co2_emission_kg_m3,
            durabilityScore: item.material.durability_score,
            maintenanceScore: item.material.maintenance_score,
            fireRating: item.material.fire_rating,
            corrosionResistance: item.material.corrosion_resistance,
            standards: item.material.standards,
            description: item.material.description,
            bestFor: item.material.best_for || item.material.bestFor
          },
          scores: item.scores,
          pros: item.pros,
          cons: item.cons
        }));
      } else if (onExecuteMcdm) {
        results = onExecuteMcdm(requirements);
      }

      // Persist dossier into SQLite
      if (onSaveToSqlite) {
        const topItem = results[0];
        await onSaveToSqlite({
          projectName: projectName || `${requirements.structureType} - ${requirements.structuralElement}`,
          description: `Structural material decision dossier for ${requirements.structureType} (${requirements.structuralElement}) under ${requirements.environmentalCondition} exposure.`,
          clientOrganization: clientOrganization || 'Infrastructure Authority',
          requirements,
          evaluationResults: results,
          topRecommendation: topItem ? topItem.material.name : 'High Performance Concrete (M40)',
          suitabilityScore: topItem ? topItem.overallScore : 92,
          author: currentUser?.name || 'Lead Structural Engineer (IS 456)'
        });
      }

      if (showToast) {
        showToast('Prediction calculated! Opening material recommendation...', 'success');
      }

      // Navigate directly to the new dedicated Prediction Output page
      if (onNavigateToResult) {
        onNavigateToResult();
      }
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error during prediction execution', 'error');
      // If error, still navigate to result with local calculation fallback
      if (onNavigateToResult) {
        onNavigateToResult();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-5xl mx-auto">
      
      {/* 1. VIEW HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              PREDICTION INPUT FORM
            </span>
            <span className="text-xs font-mono text-slate-500">/employee/predict</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Structural Material Selection Input
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Define project criteria and engineering boundary constraints to run the multi-criteria material decision engine.
          </p>
        </div>

        <button
          onClick={handleRunEvaluation}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Evaluating Materials...</span>
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Run Prediction</span>
              <ArrowRight className="w-4 h-4 text-white/80" />
            </>
          )}
        </button>
      </div>

      {/* 2. DYNAMIC PROJECT SPECIFICATION & SQLITE DOSSIER LOADER */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Project Information & Dynamic SQLite Dossier Calibrator</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Load parameters dynamically from stored SQLite projects, or enter new infrastructure project details.
            </p>
          </div>
          {savedProjects.length > 0 && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
              ● {savedProjects.length} Projects in SQLite
            </span>
          )}
        </div>

        {/* Dynamic Project Quick-Loader from SQLite */}
        {savedProjects.length > 0 && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Load Parameters from Stored Database Project:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {savedProjects.slice(0, 6).map((proj) => (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => handleSelectSavedProject(proj.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedProjectId === proj.id
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-blue-700">
                      {proj.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {proj.date || 'Active'}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 truncate">
                    {proj.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {proj.requirements?.structureType || 'Infrastructure'} • {proj.client || 'Client'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Input Fields for Project Title and Client */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project Title / Package Name
            </label>
            <input
              type="text"
              placeholder="e.g., Marine Pier Viaduct Package 04"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Client / Infrastructure Authority
            </label>
            <input
              type="text"
              placeholder="e.g., MMRDA / NHAI / IRCON / CPWD"
              value={clientOrganization}
              onChange={(e) => setClientOrganization(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>

      </div>

      {/* 3. SIMPLE, STREAMLINED INPUT FORM */}
      <div className="space-y-5">
        
        {/* CARD 1: STRUCTURE & STRUCTURAL ELEMENT */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">1</span>
            <span>Structure Classification (IS & IRC)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Structure Type
              </label>
              <select
                value={requirements.structureType}
                onChange={(e) => updateField('structureType', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                {STRUCTURE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Structural Element
              </label>
              <select
                value={requirements.structuralElement}
                onChange={(e) => updateField('structuralElement', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                {STRUCTURAL_ELEMENTS.map(elem => (
                  <option key={elem} value={elem}>{elem}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CARD 2: LOADING & ENVIRONMENTAL EXPOSURE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">2</span>
            <span>Operating Regime & Environmental Exposure</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Governing Load Type
              </label>
              <select
                value={requirements.loadType}
                onChange={(e) => updateField('loadType', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                {LOAD_TYPES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Environmental Exposure Class
              </label>
              <select
                value={requirements.environmentalCondition}
                onChange={(e) => updateField('environmentalCondition', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
              >
                {ENVIRONMENTAL_CONDITIONS.map(env => (
                  <option key={env.value} value={env.value}>{env.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CARD 3: DESIGN LIFE & SUSTAINABILITY */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">3</span>
            <span>Design Service Life & Sustainability</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Target Service Life (Years)
                </label>
                <span className="text-sm font-extrabold text-blue-700 font-mono bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {requirements.designLife} Years
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={requirements.designLife}
                onChange={(e) => updateField('designLife', Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                {DESIGN_LIFE_MILESTONES.map(m => (
                  <span
                    key={m}
                    onClick={() => updateField('designLife', m)}
                    className={`cursor-pointer transition-colors ${requirements.designLife === m ? 'font-bold text-blue-700' : 'hover:text-slate-600'}`}
                  >
                    {m}y
                  </span>
                ))}
              </div>
            </div>

            {/* Sustainability Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Prioritize Low Embodied Carbon (Eco-Friendly)</p>
                  <p className="text-[11px] text-slate-500">
                    Favors materials with lower CO₂ emission ratings and geopolymer replacements
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateField('sustainabilityPreference', !requirements.sustainabilityPreference)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  requirements.sustainabilityPreference ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 4: SPECIAL ENGINEERING CRITERIA */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</span>
            <span>Special Engineering Criteria (Select all applicable)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {SPECIAL_REQUIREMENTS.map(item => {
              const isSelected = requirements.specialRequirements?.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleSpecialRequirement(item.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 border transition-colors ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className="font-bold text-xs">{item.label}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.tag}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 5: PROJECT REFERENCE (COMPACT & CLEAN) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">5</span>
            <span>Project Reference Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Chenab Rail Arch Bridge..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Authority / Client Organization
              </label>
              <input
                type="text"
                value={clientOrganization}
                onChange={(e) => setClientOrganization(e.target.value)}
                placeholder="e.g. NHAI / MMRDA / Indian Railways..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM ACTION BAR */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={handleRunEvaluation}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Evaluating Materials...</span>
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Run Prediction & View Material Details</span>
              <ArrowRight className="w-4 h-4 text-white/80" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
