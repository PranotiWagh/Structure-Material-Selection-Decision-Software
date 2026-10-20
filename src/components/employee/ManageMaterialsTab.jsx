import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Database, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  RefreshCw, 
  Info, 
  X, 
  Check, 
  Layers, 
  Zap, 
  ShieldCheck, 
  FileCode, 
  ArrowUpDown,
  Filter
} from '../icons';

const CATEGORIES = [
  'All',
  'Concrete',
  'Structural Steel',
  'Rebar Steel',
  'Composite / FRP',
  'Structural Timber',
  'Masonry'
];

const INITIAL_FORM_STATE = {
  id: '',
  name: '',
  category: 'Concrete',
  compressiveStrength: 40,
  tensileStrength: 4.2,
  density: 2450,
  elasticModulus: 31.6,
  embodiedCarbon: 340,
  costInrM3: 6200,
  costIndex: 'Medium',
  durabilityScore: 4.2,
  corrosionResistance: 7.5,
  fireRating: 8.0,
  standards: 'IS 456:2000',
  description: ''
};

export default function ManageMaterialsTab({ onSwitchTab }) {
  const { 
    materialsList, 
    addMaterial, 
    updateMaterial, 
    deleteMaterial, 
    refreshMaterials 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Storage Architecture Modal
  const [isStorageGuideOpen, setIsStorageGuideOpen] = useState(false);

  // Raw Record Inspector Modal
  const [inspectTarget, setInspectTarget] = useState(null);

  // Filter & Search
  const filteredMaterials = useMemo(() => {
    return (materialsList || []).filter(mat => {
      const matchesCategory = selectedCategory === 'All' || mat.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (mat.name && mat.name.toLowerCase().includes(q)) ||
        (mat.id && mat.id.toLowerCase().includes(q)) ||
        (mat.standards && mat.standards.toLowerCase().includes(q)) ||
        (mat.category && mat.category.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      let valA = a[sortBy] ?? 0;
      let valB = b[sortBy] ?? 0;
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [materialsList, searchQuery, selectedCategory, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredMaterials.length / pageSize) || 1;
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, currentPage]);

  const handleOpenAdd = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      ...INITIAL_FORM_STATE,
      id: `IND-MAT-${Date.now().toString().slice(-4)}-${randomSuffix}`,
      description: 'Standard civil structural material compliant with Indian design standards.'
    });
    setIsEditing(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material) => {
    setFormData({
      id: material.id,
      name: material.name,
      category: material.category || 'Concrete',
      compressiveStrength: material.compressiveStrength || 30,
      tensileStrength: material.tensileStrength || 3.5,
      density: material.density || 2400,
      elasticModulus: material.elasticModulus || 28,
      embodiedCarbon: material.embodiedCarbon || 320,
      costInrM3: material.costInrM3 || 5500,
      costIndex: material.costIndex || 'Medium',
      durabilityScore: material.durabilityScore || 4.0,
      corrosionResistance: material.corrosionResistance || 7.0,
      fireRating: material.fireRating || 7.5,
      standards: material.standards || 'IS 456 / IS 800',
      description: material.description || ''
    });
    setIsEditing(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) {
      setFormError('Please enter a valid material name.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (isEditing) {
        await updateMaterial(formData.id, formData);
      } else {
        await addMaterial(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Operation failed. Ensure backend server is reachable.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteMaterial(deleteConfirmTarget.id);
      setDeleteConfirmTarget(null);
    } catch (err) {
      // Toast handles notification
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Control Deck */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>SQLite Live Database Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Material Database & Storage Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Inspect, create, edit, and maintain all structural material specifications stored directly in <code className="text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">database/materials.db</code>. Changes update all decision matrix rankings in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsStorageGuideOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-all shadow-sm"
              title="View where data is stored and how to inspect files"
            >
              <Info className="w-4 h-4 text-slate-500" />
              <span>Storage Architecture</span>
            </button>

            <button
              onClick={refreshMaterials}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all shadow-sm"
              title="Reload from backend SQLite"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Material</span>
            </button>
          </div>
        </div>

        {/* Quick Database Stat Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Database Records</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{materialsList.length}</div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">● Synced with SQLite</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Search Matches</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{filteredMaterials.length}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Filtered in current view</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Database Location</div>
            <div className="text-sm font-bold text-slate-800 mt-1.5 truncate">materials.db</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">SQLite 3 engine</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Raw Dataset Source</div>
            <div className="text-sm font-bold text-slate-800 mt-1.5 truncate">materials_database_1000.csv</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">IS 456 / IS 800 standards</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Material ID, Name, Grade (e.g. M60, Fe 500, Cor-Ten), or Standard..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="name">Material Name</option>
              <option value="compressiveStrength">Compressive Strength (f'c)</option>
              <option value="tensileStrength">Yield Strength (fy)</option>
              <option value="costInrM3">Unit Cost (₹/m³)</option>
              <option value="embodiedCarbon">Embodied Carbon</option>
              <option value="density">Density</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
              title={`Toggle sort order (Current: ${sortOrder.toUpperCase()})`}
            >
              {sortOrder === 'asc' ? '▲ Asc' : '▼ Desc'}
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Material ID</th>
                <th className="py-3.5 px-4">Name & Category</th>
                <th className="py-3.5 px-4 text-right">Strength (f'c / fy)</th>
                <th className="py-3.5 px-4 text-right">Density</th>
                <th className="py-3.5 px-4 text-right">Cost (₹/m³)</th>
                <th className="py-3.5 px-4 text-right">Embodied Carbon</th>
                <th className="py-3.5 px-4">Standard Code</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedMaterials.length > 0 ? (
                paginatedMaterials.map((mat) => {
                  const isConcrete = mat.category === 'Concrete';
                  const isSteel = mat.category?.includes('Steel');

                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {mat.id}
                        </span>
                      </td>

                      {/* Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 leading-tight">{mat.name}</div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            isConcrete ? 'bg-indigo-500' : isSteel ? 'bg-emerald-500' : 'bg-amber-500'
                          }`} />
                          <span>{mat.category}</span>
                        </div>
                      </td>

                      {/* Strength */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-semibold text-slate-900">
                          {isSteel ? `${mat.tensileStrength || 415} MPa` : `${mat.compressiveStrength || 30} MPa`}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isSteel ? "Yield Strength (fy)" : "Compressive (f'c)"}
                        </div>
                      </td>

                      {/* Density */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-semibold text-slate-700">{mat.density || 2400}</span>
                        <span className="text-[11px] text-slate-400 ml-1">kg/m³</span>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900">
                          ₹{(mat.costInrM3 || 5000).toLocaleString()}
                        </div>
                        <span className="text-[11px] text-slate-400">per m³</span>
                      </td>

                      {/* Carbon */}
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                          (mat.embodiedCarbon || 300) < 250
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : (mat.embodiedCarbon || 300) < 700
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {mat.embodiedCarbon || 300} kg/t
                        </span>
                      </td>

                      {/* Standards */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          {mat.standards || 'IS 456'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setInspectTarget(mat)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Inspect raw SQLite record"
                          >
                            <FileCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(mat)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit material properties"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTarget(mat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete material from database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Database className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No materials matched your filter criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your search query or category filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="py-4 px-6 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{paginatedMaterials.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, filteredMaterials.length)}</span> of <span className="font-bold text-slate-800">{filteredMaterials.length}</span> total entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-slate-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MATERIAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  {isEditing ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isEditing ? 'Edit Structural Material' : 'Add New Structural Material'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saves directly to SQLite <code className="font-mono text-slate-700">database/materials.db</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Material ID / Code
                  </label>
                  <input
                    type="text"
                    disabled={isEditing}
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono bg-slate-50 disabled:bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. IND-M80-HPC-01"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Material Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Material Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Material Full Name & Grade
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g. M80 High Performance Silica Fume Concrete"
                  required
                />
              </div>

              {/* Strengths & Density */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Comp. Strength (f'c, MPa)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.compressiveStrength}
                    onChange={(e) => setFormData({ ...formData, compressiveStrength: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Yield Strength (fy, MPa)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tensileStrength}
                    onChange={(e) => setFormData({ ...formData, tensileStrength: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Density (kg/m³)
                  </label>
                  <input
                    type="number"
                    value={formData.density}
                    onChange={(e) => setFormData({ ...formData, density: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>

              {/* Cost, Carbon, Elastic Modulus */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unit Cost (₹/m³)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={formData.costInrM3}
                    onChange={(e) => setFormData({ ...formData, costInrM3: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Embodied Carbon (kg CO₂/t)
                  </label>
                  <input
                    type="number"
                    value={formData.embodiedCarbon}
                    onChange={(e) => setFormData({ ...formData, embodiedCarbon: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Elastic Modulus (GPa)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.elasticModulus}
                    onChange={(e) => setFormData({ ...formData, elasticModulus: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>

              {/* Standards & Durability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Civil Design Standards
                  </label>
                  <input
                    type="text"
                    value={formData.standards}
                    onChange={(e) => setFormData({ ...formData, standards: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. IS 456:2000, IRC:112-2020"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Durability Score (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={formData.durabilityScore}
                    onChange={(e) => setFormData({ ...formData, durabilityScore: parseFloat(e.target.value) || 3.0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Engineering Notes & Best Applications
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Describe specific bridge, high-rise, or marine foundation use cases..."
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {formSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to SQLite...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isEditing ? 'Save Changes' : 'Create Material'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-slate-900">Delete Material Record?</h4>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-800">{deleteConfirmTarget.name}</strong> (<code className="font-mono text-xs">{deleteConfirmTarget.id}</code>) from the SQLite database?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-sm shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORAGE ARCHITECTURE & FILE GUIDE MODAL */}
      {isStorageGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Storage & File Architecture Guide</h3>
                  <p className="text-xs text-slate-500">How and where your material & project evaluation data is stored</p>
                </div>
              </div>
              <button
                onClick={() => setIsStorageGuideOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>1. Primary Live SQLite Database</span>
                </div>
                <p className="text-xs text-slate-600">
                  Located at: <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-900">database/materials.db</code>
                </p>
                <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pt-1">
                  <li><strong>materials table:</strong> Stores all 1,000+ structural grades with compressive strength, tensile strength, density, cost, embodied carbon, durability, and standards.</li>
                  <li><strong>project_evaluations table:</strong> Stores customer & employee evaluated scans, criteria weights, MCDM scores, and uploaded blueprints/photos.</li>
                  <li><strong>Direct inspection:</strong> Open directly with SQLite CLI, DB Browser for SQLite, or VS Code SQLite Extension.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span>2. Raw CSV Dataset Backup</span>
                </div>
                <p className="text-xs text-slate-600">
                  Located at: <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-900">dataset/materials_database_1000.csv</code>
                </p>
                <p className="text-xs text-slate-600">
                  The raw tabular dataset containing 1,005 rows. You can open and edit this file directly in Microsoft Excel, Google Sheets, or Python.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>3. Database Initialization & Sync Scripts</span>
                </div>
                <p className="text-xs text-slate-600">
                  Located at: <code className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-900">backend/data/init_db.py</code>
                </p>
                <p className="text-xs text-slate-600">
                  Run <code className="font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-[11px]">python backend/data/init_db.py</code> anytime to recreate or reset the SQLite database directly from the CSV.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsStorageGuideOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAW RECORD INSPECTOR MODAL */}
      {inspectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-slate-900">Raw SQLite Row: {inspectTarget.name}</h4>
              </div>
              <button
                onClick={() => setInspectTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
              {JSON.stringify(inspectTarget, null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
