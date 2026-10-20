import React, { useState, useMemo } from 'react';
import {
  Scale,
  Search,
  CheckCircle2,
  X,
  Plus,
  ShieldCheck,
  Flame,
  Zap,
  TrendingUp,
  Droplets,
  DollarSign,
  Leaf,
  Layers,
  ArrowRight,
} from '../icons';

export default function ComparisonTab({
  materialsList = [],
  comparisonMaterialIds = ['M0001', 'M0002', 'M0004'],
  onUpdateComparisonIds,
  onNavigateToSearch
}) {
  const [selectedIds, setSelectedIds] = useState(comparisonMaterialIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChartMode, setActiveChartMode] = useState('multibar'); // 'multibar' | 'radar'

  // Sync when prop changes
  React.useEffect(() => {
    if (comparisonMaterialIds && comparisonMaterialIds.length > 0) {
      setSelectedIds(comparisonMaterialIds);
    }
  }, [comparisonMaterialIds]);

  const updateSelected = (newIds) => {
    setSelectedIds(newIds);
    if (onUpdateComparisonIds) onUpdateComparisonIds(newIds);
  };

  // Selected material objects
  const selectedMaterials = useMemo(() => {
    return selectedIds
      .map(id => materialsList.find(m => m.id === id))
      .filter(Boolean);
  }, [selectedIds, materialsList]);

  // Color palette for the candidate materials in radar chart
  const materialThemes = [
    { border: '#2563eb', fill: 'rgba(37, 99, 235, 0.25)', badge: 'text-blue-700 bg-blue-50 border-blue-200' },
    { border: '#059669', fill: 'rgba(5, 150, 105, 0.25)', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { border: '#7c3aed', fill: 'rgba(124, 58, 237, 0.25)', badge: 'text-purple-700 bg-purple-50 border-purple-200' },
    { border: '#d97706', fill: 'rgba(217, 119, 6, 0.25)', badge: 'text-amber-700 bg-amber-50 border-amber-200' }
  ];

  // Candidates for search add
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return materialsList
      .filter(m => !selectedIds.includes(m.id))
      .filter(m =>
        m.name.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.standards && m.standards.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [materialsList, searchQuery, selectedIds]);

  const addMaterial = (id) => {
    if (selectedIds.length >= 4) return;
    const next = [...selectedIds, id];
    updateSelected(next);
    setSearchQuery('');
  };

  const removeMaterial = (id) => {
    if (selectedIds.length <= 1) return;
    const next = selectedIds.filter(i => i !== id);
    updateSelected(next);
  };

  // Preset engineering comparisons
  const applyPresetPair = (names) => {
    const ids = [];
    names.forEach(n => {
      const found = materialsList.find(m => m.name.toLowerCase().includes(n.toLowerCase()));
      if (found) ids.push(found.id);
    });
    if (ids.length >= 2) updateSelected(ids);
  };

  // Best-in-class calculations
  const bestComp = useMemo(() => Math.max(...selectedMaterials.map(m => m.compressiveStrength || 0)), [selectedMaterials]);
  const bestTens = useMemo(() => Math.max(...selectedMaterials.map(m => m.tensileStrength || 0)), [selectedMaterials]);
  const lowestCost = useMemo(() => Math.min(...selectedMaterials.map(m => m.costInrM3 || 999999)), [selectedMaterials]);
  const lowestCarbon = useMemo(() => Math.min(...selectedMaterials.map(m => m.embodiedCarbon || 999999)), [selectedMaterials]);

  // Radar Chart Axes
  const radarAxes = [
    { key: 'compressive', label: "f'c Strength", max: 180, getValue: m => m.compressiveStrength || 0 },
    { key: 'tensile', label: "fy Tensile", max: 650, getValue: m => m.tensileStrength || 0 },
    { key: 'durability', label: "Durability", max: 10, getValue: m => m.durabilityScore || 8 },
    { key: 'corrosion', label: "Corrosion Res.", max: 10, getValue: m => m.corrosionResistance || 7 },
    { key: 'fire', label: "Fire Resistance", max: 10, getValue: m => m.fireRating || 7 },
    { 
      key: 'lowCarbon', 
      label: "Low Carbon Eco", 
      max: 100, 
      getValue: m => Math.max(10, Math.min(100, Math.round(100 - ((m.embodiedCarbon || 300) / 15))))
    }
  ];

  const getRadarPolygon = (mat) => {
    const totalAxes = radarAxes.length;
    const center = 160;
    const radius = 110;

    const points = radarAxes.map((axis, i) => {
      const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
      const rawVal = axis.getValue(mat);
      const normalized = Math.min(1, Math.max(0.1, rawVal / axis.max));
      const r = radius * normalized;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return points.join(' ');
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. VIEW HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              MATERIAL BENCHMARKING MATRIX
            </span>
            <span className="text-xs font-mono text-slate-500">/employee/comparison</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Side-by-Side Material Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
            Multi-color comparative metrics distinguishing mechanical strength (Blue), durability/sustainability (Emerald), and cost/carbon penalties (Rose).
          </p>
        </div>

        {/* Chart View Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveChartMode('multibar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeChartMode === 'multibar'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Multi-Color Metric Bars
          </button>
          <button
            onClick={() => setActiveChartMode('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeChartMode === 'radar'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Spider Radar Chart
          </button>
        </div>
      </div>

      {/* 2. CANDIDATE SELECTOR & PRESETS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4">
        
        {/* Preset Pairs */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mr-1">
              Engineered Presets:
            </span>
            <button
              onClick={() => applyPresetPair(['UHPC', 'HPC M60'])}
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-all cursor-pointer"
            >
              UHPC vs HPC M60
            </button>
            <button
              onClick={() => applyPresetPair(['Structural Steel Fe 410', 'Cor-Ten Weathering Steel'])}
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Fe 410 vs Cor-Ten Weathering
            </button>
            <button
              onClick={() => applyPresetPair(['Reinforced Concrete M35', 'Geopolymer Concrete'])}
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Standard M35 vs Eco Geopolymer
            </button>
            <button
              onClick={() => applyPresetPair(['Carbon Fiber', 'Stainless Steel Grade 316L'])}
              className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-all cursor-pointer"
            >
              CFRP vs Stainless 316L
            </button>
          </div>

          {onNavigateToSearch && (
            <button
              onClick={onNavigateToSearch}
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse 1,000 Materials</span>
            </button>
          )}
        </div>

        {/* Selected Material Chips */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700">
            Selected Materials ({selectedMaterials.length}/4 max):
          </span>

          {selectedMaterials.map((mat, index) => {
            const theme = materialThemes[index % materialThemes.length];
            return (
              <div
                key={mat.id}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-bold shadow-xs ${theme.badge}`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: theme.border }} />
                <span className="truncate max-w-[180px]">{mat.name}</span>
                {selectedMaterials.length > 2 && (
                  <button
                    onClick={() => removeMaterial(mat.id)}
                    className="hover:text-rose-600 transition-colors cursor-pointer ml-1"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Search & Add Bar */}
        {selectedMaterials.length < 4 && (
          <div className="relative pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search SQLite dataset to add candidate (e.g. Fe 550, M70, Geopolymer, Titanium)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
              />
            </div>

            {/* Dropdown Options */}
            {searchResults.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {searchResults.map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => addMaterial(mat.id)}
                    className="p-2.5 hover:bg-blue-50/60 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{mat.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {mat.category} • f'c: {mat.compressiveStrength} MPa • fy: {mat.tensileStrength} MPa
                        </p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 3. SIDE-BY-SIDE MATRIX TABLE */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Parametric Side-by-Side Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Direct comparison of load-bearing properties, economic viability, and environmental compliance.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            {selectedMaterials.length} Candidate Grades
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 w-64">Engineering Parameter</th>
                {selectedMaterials.map((mat, idx) => {
                  const theme = materialThemes[idx % materialThemes.length];
                  return (
                    <th key={mat.id} className="py-3.5 px-4 min-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: theme.border }} />
                            <span className="text-slate-900 font-bold truncate max-w-[150px]">{mat.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono normal-case block mt-0.5 truncate max-w-[150px]">
                            {mat.category}
                          </span>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              
              {/* Compressive Strength (Blue) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Compressive Strength (f'c)</span>
                </td>
                {selectedMaterials.map(mat => {
                  const isBest = (mat.compressiveStrength || 0) === bestComp && bestComp > 0;
                  return (
                    <td key={mat.id} className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700 text-sm">
                          {mat.compressiveStrength} MPa
                        </span>
                        {isBest && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-800 font-bold font-mono">
                            Highest
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Tensile Strength (Blue) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>Tensile Strength (fy)</span>
                </td>
                {selectedMaterials.map(mat => {
                  const isBest = (mat.tensileStrength || 0) === bestTens && bestTens > 0;
                  return (
                    <td key={mat.id} className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-700 text-sm">
                          {mat.tensileStrength} MPa
                        </span>
                        {isBest && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-100 text-indigo-800 font-bold font-mono">
                            Highest
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Material Density */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Material Density</span>
                </td>
                {selectedMaterials.map(mat => (
                  <td key={mat.id} className="py-3 px-4 font-mono text-slate-700">
                    {mat.density?.toLocaleString()} kg/m³
                  </td>
                ))}
              </tr>

              {/* Volumetric Cost in INR (Rose / Red Alert for high cost) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Volumetric Unit Cost</span>
                </td>
                {selectedMaterials.map(mat => {
                  const cost = mat.costInrM3 || 9500;
                  const isLowest = cost === lowestCost;
                  return (
                    <td key={mat.id} className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${cost > 70000 ? 'text-rose-700' : 'text-emerald-800'}`}>
                          ₹{cost.toLocaleString()}/m³
                        </span>
                        {isLowest && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold font-mono">
                            Best Value
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Durability Rating (Emerald) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Durability Rating</span>
                </td>
                {selectedMaterials.map(mat => (
                  <td key={mat.id} className="py-3 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                      {mat.durabilityScore || 8} / 10
                    </span>
                  </td>
                ))}
              </tr>

              {/* Corrosion Resistance (Emerald) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Corrosion Resistance</span>
                </td>
                {selectedMaterials.map(mat => (
                  <td key={mat.id} className="py-3 px-4 font-mono text-emerald-800 font-semibold">
                    {mat.corrosionResistance || 7} / 10
                  </td>
                ))}
              </tr>

              {/* Fire Resistance (Amber) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Fire Rating Score</span>
                </td>
                {selectedMaterials.map(mat => (
                  <td key={mat.id} className="py-3 px-4 font-mono text-amber-700 font-bold">
                    {mat.fireRating || 7} / 10
                  </td>
                ))}
              </tr>

              {/* Embodied Carbon (Rose / Red Alert for high emission) */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Embodied Carbon (LCA)</span>
                </td>
                {selectedMaterials.map(mat => {
                  const c = mat.embodiedCarbon || 300;
                  const isLowest = c === lowestCarbon;
                  return (
                    <td key={mat.id} className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          c < 250 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : c < 700 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {c} kg CO₂e/t
                        </span>
                        {isLowest && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold font-mono">
                            Lowest Eco
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Standards */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Governing Standards</span>
                </td>
                {selectedMaterials.map(mat => (
                  <td key={mat.id} className="py-3 px-4 font-mono text-[11px] text-slate-600 font-semibold">
                    {mat.standards || 'IS 456 / IS 800'}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ENHANCED MULTI-COLOR COMPARATIVE CHARTS */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        
        {/* VIEW A: MULTI-COLOR CATEGORIZED METRIC BARS */}
        {activeChartMode === 'multibar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Categorized Multi-Color Engineering Metric Bars
                </h3>
                <p className="text-xs text-slate-500">
                  Grouped visual benchmarks: Strength in Blue, Durability in Emerald, and Cost/Carbon alerts in Rose.
                </p>
              </div>

              {/* Legend of Materials */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedMaterials.map((mat, i) => {
                  const theme = materialThemes[i % materialThemes.length];
                  return (
                    <span key={mat.id} className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${theme.badge}`}>
                      {mat.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* GROUP 1: MECHANICAL STRENGTH (BLUE / INDIGO) */}
              <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <h4 className="font-bold text-xs text-blue-950 uppercase tracking-wider font-mono">
                      Mechanical Strength
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 font-bold">f'c & fy (MPa)</span>
                </div>

                <div className="space-y-3.5">
                  {selectedMaterials.map((mat) => {
                    const comp = mat.compressiveStrength || 30;
                    const tens = mat.tensileStrength || 3;
                    return (
                      <div key={mat.id} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span className="truncate max-w-[170px]">{mat.name}</span>
                          <span className="font-mono text-blue-700 font-bold">{comp} / {tens} MPa</span>
                        </div>
                        {/* Compressive Bar (Blue) */}
                        <div className="w-full bg-blue-100/70 h-2 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, (comp / 180) * 100)}%` }} 
                            className="bg-blue-600 h-full rounded-full" 
                            title={`Compressive: ${comp} MPa`}
                          />
                        </div>
                        {/* Tensile Bar (Indigo) */}
                        <div className="w-full bg-indigo-100/70 h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, (tens / 650) * 100)}%` }} 
                            className="bg-indigo-600 h-full rounded-full" 
                            title={`Tensile: ${tens} MPa`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GROUP 2: DURABILITY & RESILIENCE (EMERALD GREEN) */}
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    <h4 className="font-bold text-xs text-emerald-950 uppercase tracking-wider font-mono">
                      Durability & Resilience
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">Scale / 10</span>
                </div>

                <div className="space-y-3.5">
                  {selectedMaterials.map((mat) => {
                    const dur = mat.durabilityScore || 8;
                    const corr = mat.corrosionResistance || 7;
                    return (
                      <div key={mat.id} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span className="truncate max-w-[170px]">{mat.name}</span>
                          <span className="font-mono text-emerald-800 font-bold">{dur} dur • {corr} corr</span>
                        </div>
                        {/* Durability Bar (Emerald) */}
                        <div className="w-full bg-emerald-100/70 h-2 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(dur / 10) * 100}%` }} 
                            className="bg-emerald-600 h-full rounded-full" 
                          />
                        </div>
                        {/* Corrosion Bar (Teal) */}
                        <div className="w-full bg-teal-100/70 h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${(corr / 10) * 100}%` }} 
                            className="bg-teal-600 h-full rounded-full" 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GROUP 3: ECONOMIC & CARBON PENALTIES (ROSE / RED & AMBER) */}
              <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600" />
                    <h4 className="font-bold text-xs text-rose-950 uppercase tracking-wider font-mono">
                      Cost & Carbon Penalties
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-rose-700 font-bold">₹/m³ & kg CO₂</span>
                </div>

                <div className="space-y-3.5">
                  {selectedMaterials.map((mat) => {
                    const cost = mat.costInrM3 || 9500;
                    const carbon = mat.embodiedCarbon || 300;
                    return (
                      <div key={mat.id} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span className="truncate max-w-[170px]">{mat.name}</span>
                          <span className="font-mono text-rose-700 font-bold">₹{cost.toLocaleString()} • {carbon} kg</span>
                        </div>
                        {/* Cost Bar (Rose) */}
                        <div className="w-full bg-rose-100/70 h-2 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, (cost / 150000) * 100)}%` }} 
                            className="bg-rose-600 h-full rounded-full" 
                            title={`Cost: ₹${cost}/m³`}
                          />
                        </div>
                        {/* Carbon Bar (Amber) */}
                        <div className="w-full bg-amber-100/70 h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, (carbon / 1200) * 100)}%` }} 
                            className="bg-amber-600 h-full rounded-full" 
                            title={`Carbon: ${carbon} kg/t`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW B: SPIDER RADAR PERFORMANCE CHART */}
        {activeChartMode === 'radar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Multi-Axis Spider Radar Benchmark
                </h3>
                <p className="text-xs text-slate-500">
                  Holistic geometric comparison across structural capacity, resilience, and sustainability axes.
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3">
                {selectedMaterials.map((mat, i) => {
                  const theme = materialThemes[i % materialThemes.length];
                  return (
                    <div key={mat.id} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <span className="w-3 h-3 rounded-sm border" style={{ backgroundColor: theme.fill, borderColor: theme.border }} />
                      <span className="truncate max-w-[140px]">{mat.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SVG Spider Chart */}
            <div className="flex items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-200">
              <svg viewBox="0 0 320 320" className="w-full max-w-md h-auto">
                <defs>
                  {selectedMaterials.map((mat, i) => {
                    const theme = materialThemes[i % materialThemes.length];
                    return (
                      <filter key={mat.id} id={`glow-${i}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={theme.border} floodOpacity="0.3" />
                      </filter>
                    );
                  })}
                </defs>

                {/* Concentric Background Grid Rings */}
                {[0.25, 0.5, 0.75, 1.0].map((level, ringIdx) => {
                  const r = 110 * level;
                  const totalAxes = radarAxes.length;
                  const ringPoints = radarAxes.map((_, i) => {
                    const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
                    const x = 160 + r * Math.cos(angle);
                    const y = 160 + r * Math.sin(angle);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ');

                  return (
                    <polygon
                      key={ringIdx}
                      points={ringPoints}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      strokeDasharray={level === 1.0 ? 'none' : '3 3'}
                    />
                  );
                })}

                {/* Radial Axis Spokes */}
                {radarAxes.map((axis, i) => {
                  const totalAxes = radarAxes.length;
                  const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
                  const x = 160 + 110 * Math.cos(angle);
                  const y = 160 + 110 * Math.sin(angle);
                  
                  const lx = 160 + 130 * Math.cos(angle);
                  const ly = 160 + 130 * Math.sin(angle);

                  return (
                    <g key={axis.key}>
                      <line x1="160" y1="160" x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1" />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[9px] font-mono font-bold fill-slate-600 uppercase"
                      >
                        {axis.label}
                      </text>
                    </g>
                  );
                })}

                {/* Material Data Polygons */}
                {selectedMaterials.map((mat, i) => {
                  const theme = materialThemes[i % materialThemes.length];
                  const polyPoints = getRadarPolygon(mat);

                  return (
                    <polygon
                      key={mat.id}
                      points={polyPoints}
                      fill={theme.fill}
                      stroke={theme.border}
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      filter={`url(#glow-${i})`}
                    />
                  );
                })}

                {/* Center Hub */}
                <circle cx="160" cy="160" r="3" fill="#64748b" />
              </svg>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
