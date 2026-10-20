import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  SlidersHorizontal,
  Scale,
  X,
  Eye,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Database
} from '../icons';
import { getMaterialImageUrl, DEFAULT_CIVIL_IMAGE } from '../../data/materialImages';

export default function MaterialGalleryTab({
  materialsList = [],
  onAddToComparison,
  onUseInPrediction,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMaterialModal, setSelectedMaterialModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set();
    materialsList.forEach(m => {
      if (m.category) set.add(m.category);
    });
    return ['All', ...Array.from(set).sort()];
  }, [materialsList]);

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return materialsList.filter(m => {
      const matchCat = selectedCategory === 'All' || m.category === selectedCategory;
      if (!searchQuery.trim()) return matchCat;

      const q = searchQuery.toLowerCase();
      const matchQuery =
        (m.name || '').toLowerCase().includes(q) ||
        (m.id || '').toLowerCase().includes(q) ||
        (m.standards || '').toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [materialsList, searchQuery, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage) || 1;
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMaterials.slice(start, start + itemsPerPage);
  }, [filteredMaterials, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  return (
    <div className="material-gallery-container space-y-6 font-sans">
      
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              DATASET VISUAL GALLERY // SM-DSS
            </span>
            <span className="text-xs font-mono text-slate-500">/employee/gallery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span>Structural Material Visual Gallery & Dataset Imagery</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-3xl">
            Visual inspection catalog of all {materialsList.length.toLocaleString()} civil engineering structural materials in the active dataset. Complete with high-resolution structural photography, IS code standards, and mechanical property benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
            {filteredMaterials.length.toLocaleString()} Grades Found
          </span>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dataset by material grade, name, IS code (e.g., M60, Fe 500D, IS 456, Cor-Ten)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown (Mobile / Compact) */}
          <div className="flex items-center gap-2 sm:hidden">
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Category Pills (Desktop) */}
        <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 font-mono mr-2 uppercase">Filter:</span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. MATERIAL IMAGE GRID */}
      {paginatedMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No matching materials in dataset</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query or reset the category filter to browse all 1,000 structural grades.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all cursor-pointer inline-block"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paginatedMaterials.map((mat) => {
            const imgUrl = mat.imageUrl || getMaterialImageUrl(mat);
            return (
              <div
                key={mat.id}
                className="material-card bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition-all flex flex-col overflow-hidden group"
              >
                {/* Image Header with Badge Overlay */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900 flex-shrink-0 cursor-pointer" onClick={() => setSelectedMaterialModal(mat)}>
                  <img
                    src={imgUrl}
                    alt={mat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    onError={(e) => { e.target.src = DEFAULT_CIVIL_IMAGE; }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Badges on Image */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/95 text-slate-900 backdrop-blur-md shadow-xs">
                      {mat.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600/90 text-white shadow-xs truncate max-w-[140px]">
                      {mat.category}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                    <span className="text-[10px] font-mono font-semibold text-emerald-300 drop-shadow-xs">
                      {mat.standards || 'IS 456 / IS 800'}
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded-md bg-white/20 hover:bg-white/40 text-white transition-all backdrop-blur-xs"
                      title="Inspect Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3
                      className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 cursor-pointer leading-tight mb-2"
                      onClick={() => setSelectedMaterialModal(mat)}
                    >
                      {mat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {mat.description || 'Standard structural civil engineering material calibrated for Indian Infrastructure Projects.'}
                    </p>
                  </div>

                  {/* Property Badges Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-mono">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9px] uppercase text-slate-400 block">Compressive</span>
                      <span className="font-bold text-slate-900">
                        {mat.compressiveStrength ? `${mat.compressiveStrength} MPa` : '—'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9px] uppercase text-slate-400 block">Tensile (fy)</span>
                      <span className="font-bold text-slate-900">
                        {mat.tensileStrength ? `${mat.tensileStrength} MPa` : '—'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9px] uppercase text-slate-400 block">Density</span>
                      <span className="font-bold text-slate-900">
                        {mat.density ? `${mat.density} kg/m³` : '—'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[9px] uppercase text-slate-400 block">Cost Index</span>
                      <span className={`font-bold ${
                        mat.costIndex === 'Low' ? 'text-emerald-700' :
                        mat.costIndex === 'High' ? 'text-rose-700' :
                        'text-amber-700'
                      }`}>
                        {mat.costIndex || 'Medium'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    {onUseInPrediction && (
                      <button
                        onClick={() => {
                          onUseInPrediction(mat);
                          if (showToast) showToast(`Selected "${mat.name}" for Prediction input`, 'info');
                        }}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Predict</span>
                      </button>
                    )}

                    {onAddToComparison && (
                      <button
                        onClick={() => {
                          onAddToComparison(mat.id);
                          if (showToast) showToast(`Added "${mat.name}" to Comparison`, 'success');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                        title="Add to Comparison"
                      >
                        <Scale className="w-3 h-3 text-slate-600" />
                        <span>Compare</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-mono">
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredMaterials.length)}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredMaterials.length.toLocaleString()}</span> materials
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. LIGHTBOX / MATERIAL DETAIL MODAL */}
      {selectedMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scale-in">
            
            {/* Modal Image Header */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
              <img
                src={selectedMaterialModal.imageUrl || getMaterialImageUrl(selectedMaterialModal)}
                alt={selectedMaterialModal.name}
                className="w-full h-full object-cover opacity-90"
                onError={(e) => { e.target.src = DEFAULT_CIVIL_IMAGE; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-white text-slate-900">
                    {selectedMaterialModal.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-600 text-white">
                    {selectedMaterialModal.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-emerald-500 text-white">
                    {selectedMaterialModal.standards || 'IS 456 / IS 800'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {selectedMaterialModal.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedMaterialModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
                  Material Description & Engineering Behavior
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {selectedMaterialModal.description || 'Standard structural civil engineering material specified for Indian infrastructure construction projects per Bureau of Indian Standards.'}
                </p>
              </div>

              {/* Specifications Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase text-slate-400 block">Compressive Strength</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedMaterialModal.compressiveStrength || '—'} MPa</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase text-slate-400 block">Tensile Strength</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedMaterialModal.tensileStrength || '—'} MPa</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase text-slate-400 block">Density</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedMaterialModal.density || '—'} kg/m³</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase text-slate-400 block">Embodied Carbon</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedMaterialModal.embodiedCarbon || '—'} kg/t</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setSelectedMaterialModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Close
                </button>
                {onUseInPrediction && (
                  <button
                    onClick={() => {
                      onUseInPrediction(selectedMaterialModal);
                      setSelectedMaterialModal(null);
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Run Prediction With This Material</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
