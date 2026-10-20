import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Database,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save
} from './icons';

export default function AdminMaterialsView() {
  const {
    materialsList,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    showToast,
    currentUser
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [formState, setFormState] = useState({
    id: "",
    name: "",
    category: "High-Performance Concrete",
    compressiveStrength: 60,
    tensileStrength: 5,
    density: 2400,
    elasticModulus: 35,
    embodiedCarbon: 300,
    costIndex: "Medium",
    fireRating: 8.0,
    corrosionResistance: 8.0,
    precastSuitability: true,
    ductilityRating: 7.0,
    waterImpermeability: 8.5,
    speedScore: 8.0,
    maxDesignLife: 100,
    sustainabilityScore: 75,
    standards: "ACI / EN",
    description: "",
    bestFor: ""
  });

  const categories = [
    "All",
    "Normal Concrete",
    "High Performance Concrete",
    "Ultra High Performance Concrete",
    "Fiber Reinforced Concrete",
    "Precast Concrete",
    "Specialty Concrete",
    "Sustainable & Eco-Friendly",
    "Structural Steel",
    "Weathering Steel",
    "Stainless Steel",
    "FRP Composites",
    "Timber / Engineered Wood",
    "Masonry",
    "Non-Ferrous Metals"
  ];

  const filteredMaterials = materialsList.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.standards.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenEdit = (material) => {
    setEditingMaterial(material);
    setIsCreatingNew(false);
    setFormState({ ...material });
  };

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setIsCreatingNew(true);
    setFormState({
      id: `mat-${Date.now()}`,
      name: "",
      category: "High-Performance Concrete",
      compressiveStrength: 60,
      tensileStrength: 10,
      density: 2400,
      elasticModulus: 35,
      embodiedCarbon: 250,
      costIndex: "Medium",
      fireRating: 8.0,
      corrosionResistance: 8.0,
      precastSuitability: true,
      ductilityRating: 7.0,
      waterImpermeability: 8.5,
      speedScore: 8.0,
      maxDesignLife: 100,
      sustainabilityScore: 80,
      standards: "ASTM / ISO",
      description: "Custom structural material entry engineered for specific project criteria.",
      bestFor: "Specialized structural frames & environmental conditions."
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      showToast("Please enter a material name", "error");
      return;
    }

    if (isCreatingNew) {
      addMaterial(formState);
    } else {
      updateMaterial(formState);
    }

    setEditingMaterial(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
              ADMINISTRATION CONSOLE // MAT-DB-GOV
            </span>
            <span className="text-xs text-slate-500">
              Active User: <strong className="text-slate-800">{currentUser?.name || "Dr. Marcus Vance"}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Materials Database & Calibration Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Maintain mechanical capacities, embodied carbon LCA values, and characteristic design standards governing the MCDA recommendation engine.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Material</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search material by name, category, standard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
          <span className="text-[11px] text-slate-500 uppercase font-bold shrink-0 mr-1">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Material Identifier & Category</th>
                <th className="py-3.5 px-4">Compressive (f'c)</th>
                <th className="py-3.5 px-4">Tensile (fy)</th>
                <th className="py-3.5 px-4">Density</th>
                <th className="py-3.5 px-4">Embodied Carbon</th>
                <th className="py-3.5 px-4">Design Life Limit</th>
                <th className="py-3.5 px-4">Procurement Cost</th>
                <th className="py-3.5 px-4">Governing Code</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((mat) => (
                <tr key={mat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{mat.name}</div>
                    <div className="text-[11px] text-amber-700 font-semibold">{mat.category}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {mat.compressiveStrength} MPa
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {mat.tensileStrength} MPa
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {mat.density} kg/m³
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">
                    {mat.embodiedCarbon} kg/m³
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {mat.maxDesignLife} Years
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 font-mono">
                      {mat.costInrM3 ? `₹${Number(mat.costInrM3).toLocaleString()}/m³` : (mat.cost_inr_m3 ? `₹${Number(mat.cost_inr_m3).toLocaleString()}/m³` : mat.costIndex)}
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {mat.costIndex} tier
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[10px]">
                      {mat.standards}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(mat)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                        title="Edit Parameters"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMaterial(mat.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 transition-colors border border-slate-200"
                        title="Delete Material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Edit / Create Modal */}
      {(editingMaterial || isCreatingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isCreatingNew ? 'Create New Structural Material' : `Edit: ${formState.name}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update mechanical criteria and environmental factors
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setEditingMaterial(null); setIsCreatingNew(false); }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Material Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-2 text-slate-900 outline-none font-medium"
                    placeholder="e.g. Fiber-Reinforced Concrete C50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-2 text-slate-900 outline-none font-medium"
                  >
                    {categories.filter(c => c !== "All").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Compressive (MPa)</label>
                  <input
                    type="number"
                    value={formState.compressiveStrength}
                    onChange={(e) => setFormState(prev => ({ ...prev, compressiveStrength: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tensile (MPa)</label>
                  <input
                    type="number"
                    value={formState.tensileStrength}
                    onChange={(e) => setFormState(prev => ({ ...prev, tensileStrength: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Density (kg/m³)</label>
                  <input
                    type="number"
                    value={formState.density}
                    onChange={(e) => setFormState(prev => ({ ...prev, density: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Embodied CO₂ (kg/t)</label>
                  <input
                    type="number"
                    value={formState.embodiedCarbon}
                    onChange={(e) => setFormState(prev => ({ ...prev, embodiedCarbon: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Design Life (Years)</label>
                  <input
                    type="number"
                    value={formState.maxDesignLife}
                    onChange={(e) => setFormState(prev => ({ ...prev, maxDesignLife: parseInt(e.target.value, 10) || 50 }))}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-2 text-slate-900 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Index</label>
                  <select
                    value={formState.costIndex}
                    onChange={(e) => setFormState(prev => ({ ...prev, costIndex: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-2 text-slate-900 outline-none font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Governing Design Standards</label>
                <input
                  type="text"
                  value={formState.standards}
                  onChange={(e) => setFormState(prev => ({ ...prev, standards: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-amber-600 rounded-xl px-3 py-2 text-slate-900 outline-none font-medium"
                  placeholder="e.g. ACI 318 / Eurocode 2"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setEditingMaterial(null); setIsCreatingNew(false); }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Material</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
