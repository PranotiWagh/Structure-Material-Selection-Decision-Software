import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Award,
  Medal,
  ChevronLeft,
  CheckCircle,
  ShieldAlert,
  TrendingUp,
  FileCheck2
} from './icons';

export default function EvaluationResultsView() {
  const {
    requirements,
    evaluationResults,
    setActiveTab,
    saveProject,
    showToast
  } = useApp();

  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(0);
  const [filterCategory, setFilterCategory] = useState("All");

  const currentSelection = evaluationResults[selectedMaterialIndex] || evaluationResults[0];

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

  const filteredResults = filterCategory === "All"
    ? evaluationResults
    : evaluationResults.filter(item => item.material.category === filterCategory);

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          Rank #1 (Optimal Choice)
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
          <Award className="w-3.5 h-3.5 text-slate-500" />
          Rank #2 (Runner-Up)
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
          <Medal className="w-3.5 h-3.5 text-orange-600" />
          Rank #3 (Viable Alternative)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200">
        Rank #{rank}
      </span>
    );
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <button
            onClick={() => setActiveTab('employee-input')}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Requirements Form
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
              MCDA TOPSIS ENGINE // EVAL-SUCCESS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Structural Material Suitability Matrix & Rankings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Engineered rankings for: <strong className="text-slate-900">{requirements.structureType}</strong> — <strong className="text-blue-700">{requirements.structuralElement}</strong> ({requirements.designLife}y Life, {requirements.environmentalCondition})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              saveProject();
              showToast("Project report archived and saved to customer dossier repository", "success");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            Save Project Dossier
          </button>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {evaluationResults.slice(0, 3).map((item, idx) => {
          const isTop = idx === 0;
          return (
            <div
              key={item.material.id}
              onClick={() => setSelectedMaterialIndex(idx)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden bg-white shadow-sm ${
                selectedMaterialIndex === idx
                  ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {isTop && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm">
                  RECOMMENDED PRIME
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                {getRankBadge(item.rank)}
                <span className="text-2xl font-black font-mono text-slate-900">
                  {item.overallScore}<span className="text-xs text-slate-500 font-normal">/100</span>
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 line-clamp-1 mb-1">
                {item.material.name}
              </h3>
              <p className="text-xs text-blue-700 font-semibold mb-3">
                {item.material.category}
              </p>

              <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Structural Efficiency:</span>
                  <span className="font-bold text-slate-800">{item.scores.structural}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Durability & Life:</span>
                  <span className="font-bold text-slate-800">{item.scores.durability}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Sustainability:</span>
                  <span className="font-bold text-emerald-700">{item.scores.sustainability}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Active Material Dossier */}
      {currentSelection && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {getRankBadge(currentSelection.rank)}
                <span className="text-xs font-mono font-medium text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  Code: {currentSelection.material.standards}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {currentSelection.material.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                {currentSelection.material.description}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">Composite Score</span>
                <span className="text-3xl font-black font-mono text-blue-700">{currentSelection.overallScore}</span>
                <span className="text-xs text-slate-500"> / 100</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Sub-Criteria Breakdown Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 my-6">
            {[
              { label: "Structural Performance", val: currentSelection.scores.structural, color: "bg-blue-600" },
              { label: "Durability & Life Span", val: currentSelection.scores.durability, color: "bg-indigo-600" },
              { label: "Economic Alignment", val: currentSelection.scores.economic, color: "bg-amber-600" },
              { label: "Sustainability Index", val: currentSelection.scores.sustainability, color: "bg-emerald-600" },
              { label: "Special Criteria Fit", val: currentSelection.scores.special, color: "bg-purple-600" },
            ].map((metric) => (
              <div key={metric.label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-semibold text-[11px]">{metric.label}</span>
                  <span className="font-mono font-bold text-slate-900">{metric.val}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${metric.color}`}
                    style={{ width: `${metric.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Compressive Yield</span>
              <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                {currentSelection.material.compressiveStrength} MPa
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Tensile Yield</span>
              <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                {currentSelection.material.tensileStrength} MPa
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Bulk Density</span>
              <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                {currentSelection.material.density} kg/m³
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Elastic Modulus</span>
              <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                {currentSelection.material.elasticModulus} GPa
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Embodied CO₂</span>
              <span className="text-sm font-mono font-bold text-emerald-700 mt-1 block">
                {currentSelection.material.co2Emission !== undefined ? currentSelection.material.co2Emission : currentSelection.material.embodiedCarbon} kg/m³
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Procurement Cost</span>
              <span className="text-sm font-bold text-amber-700 mt-1 block font-mono">
                {currentSelection.material.costInrM3 ? `₹${Number(currentSelection.material.costInrM3).toLocaleString()}/m³` : (currentSelection.material.cost_inr_m3 ? `₹${Number(currentSelection.material.cost_inr_m3).toLocaleString()}/m³` : `${currentSelection.material.costIndex} tier`)}
              </span>
            </div>
          </div>

          {/* Pros & Cons Engineering Justification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Engineering Advantages & Performance Synergies
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {currentSelection.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Engineering Constraints & Design Mitigations
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {currentSelection.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* Comprehensive Materials Ranking Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Complete Decision Support Ranking Table</h3>
            <p className="text-xs text-slate-500">All materials evaluated by the multi-criteria TOPSIS scoring matrix</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Material Name & Category</th>
                <th className="py-3 px-4">Suitability</th>
                <th className="py-3 px-4">Compressive</th>
                <th className="py-3 px-4">Tensile</th>
                <th className="py-3 px-4">Corrosion Resist</th>
                <th className="py-3 px-4">Embodied CO₂</th>
                <th className="py-3 px-4">Cost Tier</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((item, index) => (
                <tr
                  key={item.material.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    selectedMaterialIndex === index ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    #{item.rank}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.material.name}</div>
                    <div className="text-[11px] text-slate-500">{item.material.category}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-extrabold text-sm text-blue-700">
                    {item.overallScore}%
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {item.material.compressiveStrength} MPa
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {item.material.tensileStrength} MPa
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.material.corrosionResistance}/10
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {item.material.co2Emission !== undefined ? item.material.co2Emission : item.material.embodiedCarbon} kg/m³
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 font-mono">
                      {item.material.costInrM3 ? `₹${Number(item.material.costInrM3).toLocaleString()}/m³` : (item.material.cost_inr_m3 ? `₹${Number(item.material.cost_inr_m3).toLocaleString()}/m³` : item.material.costIndex)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedMaterialIndex(index)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold border border-slate-200 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
