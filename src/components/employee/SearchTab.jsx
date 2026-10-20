import React, { useState, useMemo } from 'react';
import {
  Search,
  Scale,
  SlidersHorizontal,
  Database,
  Filter,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  Leaf,
  Layers,
  ArrowRight,
  Eye,
  X,
  Plus,
  Flame,
  Zap,
  Droplets
} from '../icons';

export default function SearchTab({
  materialsList = [],
  onAddToComparison,
  onUseInPrediction,
  onNavigateToManage,
  showToast
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMaterialModal, setSelectedMaterialModal] = useState(null);
  const itemsPerPage = 12;

  // Extract unique categories
  const categories = useMemo(() => {
    const list = ['All'];
    materialsList.forEach(m => {
      if (m.category && !list.includes(m.category)) {
        list.push(m.category);
      }
    });
    return list;
  }, [materialsList]);

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    let result = materialsList.filter(m => {
      const matchCat = selectedCategory === 'All' || m.category === selectedCategory;
      if (!matchCat) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.standards && m.standards.toLowerCase().includes(q)) ||
        (m.id && m.id.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q))
      );
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'comp-desc':
          return (b.compressiveStrength || 0) - (a.compressiveStrength || 0);
        case 'tens-desc':
          return (b.tensileStrength || 0) - (a.tensileStrength || 0);
        case 'cost-asc':
          return (a.costInrM3 || 0) - (b.costInrM3 || 0);
        case 'carbon-asc':
          return (a.embodiedCarbon || 0) - (b.embodiedCarbon || 0);
        case 'durability-desc':
          return (b.durabilityScore || 0) - (a.durabilityScore || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [materialsList, selectedCategory, searchTerm, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage) || 1;
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMaterials.slice(start, start + itemsPerPage);
  }, [filteredMaterials, currentPage]);

  const handleCompareClick = (e, mat) => {
    e.stopPropagation();
    if (onAddToComparison) {
      onAddToComparison(mat.id);
      if (showToast) showToast(`Added "${mat.name}" to Side-by-Side Comparison Matrix`, 'success');
    }
  };

  const handlePredictClick = (e, mat) => {
    e.stopPropagation();
    if (onUseInPrediction) {
      onUseInPrediction(mat);
      if (showToast) showToast(`Selected "${mat.name}" for prediction benchmarking`, 'info');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              MATERIALS LOOKUP
            </span>
            <span className="text-xs font-mono text-slate-500">/employee/search</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Search Materials by Name & Specification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
            Query across 1,000+ Indian civil engineering materials with instant strength, density, cost, and durability cards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onNavigateToManage && (
            <button
              onClick={onNavigateToManage}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Manage / Add Material</span>
            </button>
          )}
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            {filteredMaterials.length} of {materialsList.length} Materials
          </span>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by material name (e.g. Fe 500, UHPC M150, Cor-Ten, HPC M60, Geopolymer)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:w-60">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>Category: {c}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:w-60">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="name-asc">Sort: Name (A to Z)</option>
              <option value="name-desc">Sort: Name (Z to A)</option>
              <option value="comp-desc">Sort: Compressive Strength (Highest)</option>
              <option value="tens-desc">Sort: Tensile Strength (Highest)</option>
              <option value="cost-asc">Sort: Cost (Lowest First)</option>
              <option value="carbon-asc">Sort: Carbon (Lowest Eco First)</option>
              <option value="durability-desc">Sort: Durability Rating (Highest)</option>
            </select>
          </div>

        </div>

        {/* Quick Category Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mr-1">
            Quick Categories:
          </span>
          {categories.slice(0, 7).map((c) => (
            <button
              key={c}
              onClick={() => {
                setSelectedCategory(c);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === c
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PROPERTY CARDS GRID */}
      {filteredMaterials.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Database className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Materials Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No engineering material matches "{searchTerm}". Try broadening your query or selecting "All" categories.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedMaterials.map((mat) => {
            const comp = mat.compressiveStrength || 30;
            const tens = mat.tensileStrength || 3;
            const cost = mat.costInrM3 || (mat.costIndex === 'High' ? 85000 : 9200);
            const carbon = mat.embodiedCarbon || 300;
            const durability = mat.durabilityScore || 8;

            return (
              <div
                key={mat.id}
                onClick={() => setSelectedMaterialModal(mat)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all p-5 flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                {/* Header Row with Clean Engineering Icon */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-700 flex items-center justify-center flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Layers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {mat.id}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 truncate max-w-[130px]">
                        {mat.category}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {mat.name}
                    </h3>

                    <p className="text-[10px] text-slate-500 font-mono line-clamp-1">
                      {mat.standards || 'IS 456 / IS 800 / IRC:112'}
                    </p>
                  </div>
                </div>

                {/* Technical Specs 4-Metric Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  
                  {/* Compressive Strength */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Compressive (f'c)
                    </span>
                    <span className="font-mono font-black text-indigo-700 text-sm">
                      {comp} MPa
                    </span>
                  </div>

                  {/* Tensile Strength */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Tensile (fy)
                    </span>
                    <span className="font-mono font-black text-blue-700 text-sm">
                      {tens} MPa
                    </span>
                  </div>

                  {/* Volumetric Unit Cost */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Unit Cost
                    </span>
                    <span className="font-mono font-black text-emerald-800 text-sm">
                      ₹{cost.toLocaleString()}/m³
                    </span>
                  </div>

                  {/* Embodied Carbon */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                      Carbon (LCA)
                    </span>
                    <span className={`font-mono font-bold text-xs ${
                      carbon < 250 ? 'text-emerald-700' : carbon < 700 ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {carbon} kg/t
                    </span>
                  </div>

                </div>

                {/* Durability & Density Tags */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Durability: {durability}/10</span>
                  </span>
                  <span>{mat.density?.toLocaleString() || 2400} kg/m³</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={(e) => handleCompareClick(e, mat)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Add to Side-by-Side Comparison"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Compare</span>
                  </button>

                  <button
                    onClick={(e) => handlePredictClick(e, mat)}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Benchmark in Prediction Engine"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                    <span>Predict</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500 font-mono">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMaterials.length)} of {filteredMaterials.length} materials
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              Previous
            </button>

            <span className="text-xs font-bold font-mono px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 5. DEEP-DIVE SPECIFICATION MODAL */}
      {selectedMaterialModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedMaterialModal(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMaterialModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                  {selectedMaterialModal.id}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedMaterialModal.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedMaterialModal.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Standards: <strong className="text-slate-700">{selectedMaterialModal.standards || 'IS 456 / IS 800'}</strong>
              </p>
            </div>

            {/* Description */}
            {selectedMaterialModal.description && (
              <p className="text-xs text-slate-600 leading-relaxed p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                {selectedMaterialModal.description}
              </p>
            )}

            {/* Complete Technical Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Compressive Strength</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">{selectedMaterialModal.compressiveStrength} MPa</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Tensile Strength</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{selectedMaterialModal.tensileStrength} MPa</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Unit Cost (INR)</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">₹{(selectedMaterialModal.costInrM3 || 9500).toLocaleString()}/m³</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Embodied Carbon</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{selectedMaterialModal.embodiedCarbon} kg CO₂e/t</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Material Density</span>
                <span className="font-mono font-bold text-slate-800 text-sm">{selectedMaterialModal.density?.toLocaleString()} kg/m³</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Durability Score</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{selectedMaterialModal.durabilityScore || 8} / 10</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={(e) => {
                  handleCompareClick(e, selectedMaterialModal);
                  setSelectedMaterialModal(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>Send to Comparison Matrix</span>
              </button>

              <button
                onClick={(e) => {
                  handlePredictClick(e, selectedMaterialModal);
                  setSelectedMaterialModal(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Benchmark in Predict</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
