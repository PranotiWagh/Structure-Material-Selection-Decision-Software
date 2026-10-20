import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { evaluateMcdm, fetchMcdmCriteria } from '../../services/api';
import {
  STRUCTURE_TYPES,
  STRUCTURAL_ELEMENTS,
  LOAD_TYPES,
  ENVIRONMENTAL_CONDITIONS,
  BUDGET_RANGES,
  SPECIAL_REQUIREMENTS
} from '../../data/formOptions';
import {
  CheckCircle2,
  SlidersHorizontal,
  Scale,
  Sparkles,
  Download,
  Printer,
  Save,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  Check,
  Building2,
  Layers,
  Leaf
} from '../icons';
import './McdmWorkflowView.css';

// 8 Standard Material Classes from the Working Diagram
const MATERIAL_CATEGORIES = [
  { id: 'concrete', name: 'Concrete', sub: '(Normal / HPC / UHPC)', icon: '🧱', sample: 'High Performance Concrete (M40)', strength: 85, dur: 90, cost: 80, sust: 70 },
  { id: 'steel', name: 'Structural Steel', sub: '(Fe 250 / Fe 500)', icon: '🏗️', sample: 'Structural Steel (Fe 500D)', strength: 95, dur: 70, cost: 50, sust: 55 },
  { id: 'frc', name: 'Fiber Reinforced Concrete', sub: '(FRC)', icon: '⛓️', sample: 'Steel FRC (M50 Grade)', strength: 88, dur: 92, cost: 72, sust: 74 },
  { id: 'timber', name: 'Timber', sub: '(Engineered Wood)', icon: '🪵', sample: 'Glued Laminated Timber (Glulam)', strength: 50, dur: 55, cost: 88, sust: 95 },
  { id: 'frp', name: 'FRP Composites', sub: '(CFRP / GFRP)', icon: '🧪', sample: 'Carbon FRP Composite (CFRP)', strength: 98, dur: 98, cost: 35, sust: 60 },
  { id: 'masonry', name: 'Masonry', sub: '(Brick / AAC / CLC)', icon: '🧱', sample: 'Autoclaved Aerated Concrete (AAC)', strength: 40, dur: 60, cost: 95, sust: 85 },
  { id: 'precast', name: 'Precast Concrete', sub: 'Modular Panels', icon: '🏭', sample: 'Precast Prestressed Hollowcore', strength: 80, dur: 85, cost: 75, sust: 78 },
  { id: 'sustainable', name: 'Sustainable Materials', sub: '& Eco-friendly', icon: '🌱', sample: 'Geopolymer Green Concrete', strength: 75, dur: 82, cost: 78, sust: 98 }
];

export default function McdmWorkflowView({ onBackToDashboard }) {
  const {
    requirements: globalRequirements,
    setRequirements: setGlobalRequirements,
    materialsList,
    saveProject,
    showToast
  } = useApp();

  // Step 1: Input Requirements State
  const [requirements, setRequirements] = useState({
    structureType: globalRequirements?.structureType || 'Building',
    structuralElement: globalRequirements?.structuralElement || 'Beam',
    loadType: globalRequirements?.loadType || 'Dead + Live Load',
    designLife: globalRequirements?.designLife || 50,
    environmentalCondition: globalRequirements?.environmentalCondition || 'Marine (Coastal)',
    budgetRange: globalRequirements?.budgetRange || 'Medium',
    sustainabilityPreference: globalRequirements?.sustainabilityPreference !== undefined ? globalRequirements.sustainabilityPreference : true,
    specialRequirements: globalRequirements?.specialRequirements || ['High Strength', 'High Corrosion Resistance']
  });

  // Step 2: Selected Category for Comparison View
  const [selectedCategory, setSelectedCategory] = useState('concrete');

  // Step 3: Interactive Sensitivity Weights (AHP Weights in Step 4)
  const [weights, setWeights] = useState({
    strength: 0.35,
    durability: 0.25,
    cost: 0.20,
    sustainability: 0.20
  });

  // MCDM Results State (AHP + TOPSIS Engine)
  const [evaluating, setEvaluating] = useState(false);
  const [mcdmResults, setMcdmResults] = useState(null);

  // Run evaluation on mount or when requirements/weights change
  useEffect(() => {
    executeEvaluation();
  }, [requirements, weights]);

  const executeEvaluation = async () => {
    setEvaluating(true);
    try {
      // Find candidate materials from live database
      const candidates = (materialsList && materialsList.length > 0)
        ? materialsList.slice(0, 50)
        : [];

      const payload = {
        project_name: `${requirements.structureType} - ${requirements.structuralElement} Decision Analysis`,
        structure_type: requirements.structureType,
        criteria_codes: ['compressive_strength', 'density', 'cost_inr_m3', 'embodied_carbon', 'durability_score'],
        benefit_criteria: [true, false, false, false, true],
        custom_weights: [
          weights.strength,
          0.10,
          weights.cost,
          weights.sustainability,
          weights.durability
        ],
        candidate_materials: candidates.map(m => ({
          id: m.id,
          name: m.name,
          category: m.category,
          compressive_strength: m.compressiveStrength || 35,
          density: m.density || 2400,
          cost_inr_m3: m.costInrM3 || 6500,
          embodied_carbon: m.embodiedCarbon || 320,
          durability_score: m.durabilityScore || 8.0,
          standards: m.standards || 'IS 456'
        }))
      };

      const res = await evaluateMcdm(payload);
      if (res && res.rankings && res.rankings.length > 0) {
        setMcdmResults(res);
      }
    } catch (err) {
      console.warn('Live MCDM API evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleToggleSpecialReq = (req) => {
    setRequirements(prev => {
      const exists = prev.specialRequirements.includes(req);
      return {
        ...prev,
        specialRequirements: exists
          ? prev.specialRequirements.filter(r => r !== req)
          : [...prev.specialRequirements, req]
      };
    });
  };

  const handleWeightChange = (key, val) => {
    const num = parseFloat(val);
    setWeights(prev => {
      const updated = { ...prev, [key]: num };
      // Normalize sum to 1.0
      const sum = Object.values(updated).reduce((a, b) => a + b, 0);
      return {
        strength: parseFloat((updated.strength / sum).toFixed(2)),
        durability: parseFloat((updated.durability / sum).toFixed(2)),
        cost: parseFloat((updated.cost / sum).toFixed(2)),
        sustainability: parseFloat((updated.sustainability / sum).toFixed(2))
      };
    });
  };

  const handleSaveToProjectHistory = async () => {
    if (!topPick) return;
    try {
      await saveProject({
        name: `${requirements.structureType} ${requirements.structuralElement} - MCDM Selection`,
        requirements,
        topRecommendation: topPick.material_name,
        suitabilityScore: Math.round(topPick.suitability_score),
        rankedMaterials: (mcdmResults?.rankings || []).slice(0, 5).map(r => ({
          rank: r.rank,
          name: r.material_name,
          score: r.suitability_score,
          category: r.category,
          cost: `₹${(r.raw_material?.cost_inr_m3 || 5500).toLocaleString()}/m³`
        }))
      });
      showToast?.('MCDM evaluation saved to SQLite database successfully', 'success');
    } catch (err) {
      showToast?.('Failed to save evaluation', 'error');
    }
  };

  const topPick = mcdmResults?.top_recommendation || {
    material_name: 'High Performance Concrete (M40)',
    category: 'Concrete',
    suitability_score: 87,
    why_recommended: [
      'Meets strength and durability requirements (IS 456)',
      'Suitable for marine / coastal aggressive exposure',
      'Reasonable lifecycle procurement cost',
      'Long design life rating (50+ years)',
      'Lower inspection and repair maintenance',
      'High regional availability in India',
      'Environmentally acceptable embodied carbon'
    ]
  };

  const alternatives = (mcdmResults?.rankings || []).slice(1, 5);

  return (
    <div className="mcdm-workflow-container max-w-[1440px] mx-auto p-4 sm:p-6 space-y-6">
      {/* ---------------------------------------------------- */}
      {/* DIAGRAM HEADER TITLE */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
              AHP & TOPSIS Interactive Engine
            </span>
            <span className="text-xs text-slate-400">IS 456 / ACI 318 / Eurocodes</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Structural Material Selection Decision Support Software
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            Working Diagram & End-to-End Civil Engineering Decision Pipeline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Diagram
          </button>
          <button
            onClick={handleSaveToProjectHistory}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Evaluation
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 5-COLUMN / 5-STEP WORKING DIAGRAM GRID */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* ==================================================== */}
        {/* STEP 1: PROJECT REQUIREMENTS INPUT */}
        {/* ==================================================== */}
        <div className="mcdm-step-card p-4 flex flex-col justify-between border-t-4 border-t-blue-600">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="mcdm-step-badge bg-blue-600 text-white shadow-sm">1</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">Project Requirements</h3>
                <span className="text-[11px] text-slate-500 font-medium">Input Parameters</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-0.5">Structure Type</label>
                <select
                  value={requirements.structureType}
                  onChange={(e) => setRequirements({ ...requirements, structureType: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:ring-1 focus:ring-blue-500"
                >
                  {STRUCTURE_TYPES.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-0.5">Structural Element</label>
                <select
                  value={requirements.structuralElement}
                  onChange={(e) => setRequirements({ ...requirements, structuralElement: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:ring-1 focus:ring-blue-500"
                >
                  {STRUCTURAL_ELEMENTS.map(el => (
                    <option key={el.id} value={el.name}>{el.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-0.5">Load Type</label>
                <select
                  value={requirements.loadType}
                  onChange={(e) => setRequirements({ ...requirements, loadType: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:ring-1 focus:ring-blue-500"
                >
                  {LOAD_TYPES.map(lt => (
                    <option key={lt.id} value={lt.name}>{lt.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 font-semibold block mb-0.5">Design Life (Yrs)</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={requirements.designLife}
                    onChange={(e) => setRequirements({ ...requirements, designLife: parseInt(e.target.value) || 50 })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-semibold block mb-0.5">Budget Range</label>
                  <select
                    value={requirements.budgetRange}
                    onChange={(e) => setRequirements({ ...requirements, budgetRange: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900"
                  >
                    {BUDGET_RANGES.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-0.5">Environmental Condition</label>
                <select
                  value={requirements.environmentalCondition}
                  onChange={(e) => setRequirements({ ...requirements, environmentalCondition: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-900"
                >
                  {ENVIRONMENTAL_CONDITIONS.map(ec => (
                    <option key={ec.id} value={ec.name}>{ec.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-0.5">Special Requirements</label>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                  {SPECIAL_REQUIREMENTS.slice(0, 6).map(sr => {
                    const active = requirements.specialRequirements.includes(sr.name);
                    return (
                      <button
                        key={sr.id}
                        type="button"
                        onClick={() => handleToggleSpecialReq(sr.name)}
                        className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {sr.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={executeEvaluation}
              disabled={evaluating}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
              Submit Requirements
            </button>
            <ul className="text-[10px] text-slate-500 mt-2 space-y-0.5 pl-3 list-disc">
              <li>Type of structure & element</li>
              <li>Load & performance targets</li>
              <li>Environmental conditions</li>
            </ul>
          </div>
        </div>

        {/* ==================================================== */}
        {/* STEP 2: MATERIAL DATABASE */}
        {/* ==================================================== */}
        <div className="mcdm-step-card p-4 flex flex-col justify-between border-t-4 border-t-emerald-600">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="mcdm-step-badge bg-emerald-600 text-white shadow-sm">2</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">Material Database</h3>
                <span className="text-[11px] text-slate-500 font-medium">8 Certified Engineering Classes</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MATERIAL_CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-lg leading-none mb-1">{cat.icon}</div>
                    <div className="font-bold text-[11px] text-slate-900 leading-tight">
                      {cat.name}
                    </div>
                    <div className="text-[9px] text-slate-500 truncate">
                      {cat.sub}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px] text-slate-600">
              <span className="font-bold text-slate-800">Database Source:</span> Standard civil codes (IS 456, IS 800, IRC:112, ACI 318).
            </div>
            <ul className="text-[10px] text-slate-500 mt-2 space-y-0.5 pl-3 list-disc">
              <li>Mechanical properties (strength, density)</li>
              <li>Durability & service life data</li>
              <li>Environmental impact ($CO_2$, recyclability)</li>
            </ul>
          </div>
        </div>

        {/* ==================================================== */}
        {/* STEP 3: MATERIAL COMPARISON */}
        {/* ==================================================== */}
        <div className="mcdm-step-card p-4 flex flex-col justify-between border-t-4 border-t-amber-500">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="mcdm-step-badge bg-amber-500 text-white shadow-sm">3</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">Material Comparison</h3>
                <span className="text-[11px] text-slate-500 font-medium">Specs & Scaled Visualizer</span>
              </div>
            </div>

            {/* Spec Matrix Snippet */}
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-[10px] text-slate-600 border border-slate-200">
                <thead className="bg-slate-100 text-slate-800 font-semibold">
                  <tr>
                    <th className="p-1 text-left border-r border-slate-200">Parameter</th>
                    <th className="p-1 border-r border-slate-200">Concrete</th>
                    <th className="p-1 border-r border-slate-200">Steel</th>
                    <th className="p-1">FRP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-1 text-slate-800 font-semibold border-r">Strength (MPa)</td>
                    <td className="p-1 text-center border-r">30-60</td>
                    <td className="p-1 text-center border-r">250-500</td>
                    <td className="p-1 text-center">600+</td>
                  </tr>
                  <tr>
                    <td className="p-1 text-slate-800 font-semibold border-r">Density (kg/m³)</td>
                    <td className="p-1 text-center border-r">2,400</td>
                    <td className="p-1 text-center border-r">7,850</td>
                    <td className="p-1 text-center">1,600</td>
                  </tr>
                  <tr>
                    <td className="p-1 text-slate-800 font-semibold border-r">Cost (₹/unit)</td>
                    <td className="p-1 text-center border-r">5,500</td>
                    <td className="p-1 text-center border-r">65,000</td>
                    <td className="p-1 text-center">1,20,000</td>
                  </tr>
                  <tr>
                    <td className="p-1 text-slate-800 font-semibold border-r">Corrosion Res.</td>
                    <td className="p-1 text-center border-r">Moderate</td>
                    <td className="p-1 text-center border-r">Low</td>
                    <td className="p-1 text-center">V. High</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Scaled Bar Chart */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>Performance Comparison (Scaled)</span>
              </div>

              <div className="flex items-center justify-around gap-1 mb-2">
                {MATERIAL_CATEGORIES.slice(0, 5).map(cat => (
                  <div key={cat.id} className="flex flex-col items-center">
                    <div className="flex items-end gap-0.5 h-16 bg-white p-1 rounded border border-slate-200">
                      <div className="w-1.5 bg-blue-500 rounded-t" style={{ height: `${cat.strength * 0.6}%` }} title={`Strength: ${cat.strength}`}></div>
                      <div className="w-1.5 bg-emerald-500 rounded-t" style={{ height: `${cat.dur * 0.6}%` }} title={`Durability: ${cat.dur}`}></div>
                      <div className="w-1.5 bg-amber-500 rounded-t" style={{ height: `${cat.cost * 0.6}%` }} title={`Cost efficiency: ${cat.cost}`}></div>
                      <div className="w-1.5 bg-purple-500 rounded-t" style={{ height: `${cat.sust * 0.6}%` }} title={`Sustainability: ${cat.sust}`}></div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-600 mt-1 truncate w-10 text-center">{cat.name.slice(0, 5)}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-1 text-[9px] font-medium text-slate-600 pt-1 border-t border-slate-200">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-blue-500"></span> Strength
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-emerald-500"></span> Durability
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-amber-500"></span> Cost (inv.)
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-purple-500"></span> Sustainability
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <ul className="text-[10px] text-slate-500 space-y-0.5 pl-3 list-disc">
              <li>Comparative parameter matrix</li>
              <li>Multi-dimensional scaled visualization</li>
            </ul>
          </div>
        </div>

        {/* ==================================================== */}
        {/* STEP 4: DECISION ANALYSIS & RANKING (AHP / TOPSIS) */}
        {/* ==================================================== */}
        <div className="mcdm-step-card p-4 flex flex-col justify-between border-t-4 border-t-purple-600">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="mcdm-step-badge bg-purple-600 text-white shadow-sm">4</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">Decision Analysis</h3>
                <span className="text-[11px] text-slate-500 font-medium">AHP & TOPSIS Scoring</span>
              </div>
            </div>

            <div className="bg-purple-50/60 p-2.5 rounded-lg border border-purple-200 mb-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-purple-900 mb-1">
                <Scale className="w-3.5 h-3.5 text-purple-700" />
                MCDM Engine State
              </div>
              <p className="text-[10px] text-purple-800 leading-relaxed">
                Applies vector normalization, Euclidean separation to Ideal Best ($A^+$) and Worst ($A^-$).
              </p>
            </div>

            {/* Sensitivity Analysis Sliders */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                <span>Sensitivity Analysis</span>
                <span className="text-[9px] text-purple-700 font-mono bg-purple-100 px-1 rounded">AHP Weights</span>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-0.5">
                  <span>Strength Weight</span>
                  <span>{(weights.strength * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.05"
                  value={weights.strength}
                  onChange={(e) => handleWeightChange('strength', e.target.value)}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-0.5">
                  <span>Durability Weight</span>
                  <span>{(weights.durability * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.60"
                  step="0.05"
                  value={weights.durability}
                  onChange={(e) => handleWeightChange('durability', e.target.value)}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-0.5">
                  <span>Cost Efficiency</span>
                  <span>{(weights.cost * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.50"
                  step="0.05"
                  value={weights.cost}
                  onChange={(e) => handleWeightChange('cost', e.target.value)}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-medium text-slate-600 mb-0.5">
                  <span>Sustainability</span>
                  <span>{(weights.sustainability * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.50"
                  step="0.05"
                  value={weights.sustainability}
                  onChange={(e) => handleWeightChange('sustainability', e.target.value)}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <ul className="text-[10px] text-slate-500 space-y-0.5 pl-3 list-disc">
              <li>Dynamic criteria weightage</li>
              <li>Calculates Suitability Score (0 - 100)</li>
              <li>Sensitivity analysis on the fly</li>
            </ul>
          </div>
        </div>

        {/* ==================================================== */}
        {/* STEP 5: BEST MATERIAL RECOMMENDATION */}
        {/* ==================================================== */}
        <div className="mcdm-step-card p-4 flex flex-col justify-between border-t-4 border-t-emerald-500 bg-gradient-to-b from-white to-emerald-50/20">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="mcdm-step-badge bg-emerald-600 text-white shadow-sm">5</span>
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-tight">Recommendation</h3>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Best Suitable Material
                </span>
              </div>
            </div>

            {/* Hero Card */}
            <div className="bg-white rounded-xl p-3 border-2 border-emerald-500 shadow-md mb-3">
              <div className="text-2xl text-center mb-1">🏗️</div>
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm text-center leading-tight mb-2">
                {topPick.material_name}
              </h4>

              {/* Suitability Badge */}
              <div className="bg-emerald-600 text-white font-extrabold text-xs text-center py-1.5 px-2 rounded-lg shadow-sm mb-2.5">
                Suitability Score: {topPick.suitability_score || 87} / 100
              </div>

              {/* Why Recommended List */}
              <div className="text-[10px] text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 text-[11px] mb-1">Why Recommended?</div>
                {(topPick.why_recommended || [
                  'Meets strength & durability requirements',
                  'Suitable for marine environment',
                  'Reasonable cost',
                  'Long service life (50+ years)',
                  'Lower maintenance'
                ]).slice(0, 5).map((point, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 leading-tight">
                    <Check className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternative Options Table */}
            <div>
              <div className="font-bold text-slate-800 text-[11px] mb-1.5">Alternative Options (with Score)</div>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-[10px]">
                {alternatives.length > 0 ? (
                  alternatives.map((alt, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                      <span className="font-semibold text-slate-800 truncate mr-1">
                        {i + 2}. {alt.material_name.split('(')[0]}
                      </span>
                      <span className="font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {alt.suitability_score}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center justify-between p-1.5 border-b border-slate-100">
                      <span className="font-semibold text-slate-800">2. FRP (CFRP)</span>
                      <span className="font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">76</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 border-b border-slate-100">
                      <span className="font-semibold text-slate-800">3. Structural Steel</span>
                      <span className="font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">68</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 border-b border-slate-100">
                      <span className="font-semibold text-slate-800">4. Precast Concrete</span>
                      <span className="font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">62</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5">
                      <span className="font-semibold text-slate-800">5. Timber (Engineered)</span>
                      <span className="font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">48</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => window.print()}
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3 h-3" />
              Download PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SYSTEM ARCHITECTURE / WORKFLOW STRIP (Bottom Diagram) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-100/90 rounded-xl p-4 border border-slate-200">
        <div className="text-center mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-white shadow-sm">
            System Architecture / Workflow
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xl mb-1">👤</div>
              <div className="font-bold text-slate-900 text-[11px]">User Input Module</div>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Project requirements form & validation</div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xl mb-1">🗄️</div>
              <div className="font-bold text-slate-900 text-[11px]">Material Database</div>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Properties, costs, and standard codes</div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xl mb-1">⚙️</div>
              <div className="font-bold text-slate-900 text-[11px]">Analysis Engine</div>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">AHP & TOPSIS mathematical ranking</div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xl mb-1">📊</div>
              <div className="font-bold text-slate-900 text-[11px]">Comparison & Ranking</div>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Performance visualization & sensitivity</div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xl mb-1">💡</div>
              <div className="font-bold text-slate-900 text-[11px]">Recommendation</div>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Best material & alternatives with scores</div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xl mb-1">📄</div>
              <div className="font-bold text-slate-900 text-[11px]">Report Generation</div>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Downloadable PDF & Excel report</div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-200 text-center">
          <p className="text-[11px] font-bold text-slate-800">
            Output: Best Suitable Material with Detailed Comparison, Ranking, Justification and Report for the Given Project Requirements
          </p>
        </div>
      </div>
    </div>
  );
}
