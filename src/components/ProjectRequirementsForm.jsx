import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  STRUCTURE_TYPES,
  STRUCTURAL_ELEMENTS,
  LOAD_TYPES,
  ENVIRONMENTAL_CONDITIONS,
  BUDGET_RANGES,
  SPECIAL_REQUIREMENTS,
  DESIGN_LIFE_MILESTONES,
  ENGINEERING_PRESETS
} from '../data/formOptions';
import confetti from 'canvas-confetti';
import {
  Building2,
  Layers,
  Activity,
  Calendar,
  Compass,
  DollarSign,
  Leaf,
  CheckSquare,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Code2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Cpu,
  Copy,
  Check,
  Info
} from './icons';

export default function ProjectRequirementsForm() {
  const {
    requirements,
    setRequirements,
    runEvaluation,
    setActiveTab,
    saveProject,
    showToast,
    currentUser
  } = useApp();

  const [formData, setFormData] = useState({ ...requirements });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  const handleSingleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleDesignLifeChange = (val) => {
    let numeric = parseInt(val, 10);
    if (isNaN(numeric)) numeric = 10;
    if (numeric < 10) numeric = 10;
    if (numeric > 250) numeric = 250;
    handleSingleSelectChange("designLife", numeric);
  };

  const handleToggleSpecialReq = (reqId) => {
    setFormData(prev => {
      const exists = prev.specialRequirements.includes(reqId);
      const updated = exists
        ? prev.specialRequirements.filter(id => id !== reqId)
        : [...prev.specialRequirements, reqId];
      return { ...prev, specialRequirements: updated };
    });
  };

  const handleLoadPreset = (preset) => {
    setFormData({ ...preset.data });
    setActivePreset(preset.name);
    setErrors({});
    showToast(`Loaded engineering preset: ${preset.name}`, "info");
  };

  const handleReset = () => {
    const defaults = {
      structureType: "Commercial Building",
      structuralElement: "Column",
      loadType: "Dead + Live Load",
      designLife: 50,
      environmentalCondition: "Moderate / Inland Dry",
      budgetRange: "Medium",
      sustainabilityPreference: false,
      specialRequirements: ["High Compressive Strength"]
    };
    setFormData(defaults);
    setActivePreset(null);
    setErrors({});
    showToast("Form parameters reset to engineering defaults", "info");
  };

  const validate = () => {
    const errs = {};
    if (!formData.structureType) errs.structureType = "Please select a valid structure type.";
    if (!formData.structuralElement) errs.structuralElement = "Please select a structural element.";
    if (!formData.loadType) errs.loadType = "Please specify the governing load type.";
    if (!formData.designLife || formData.designLife < 10 || formData.designLife > 250) {
      errs.designLife = "Design life must be between 10 and 250 years.";
    }
    if (!formData.environmentalCondition) errs.environmentalCondition = "Environmental exposure class is required.";
    if (!formData.budgetRange) errs.budgetRange = "Select a budget allocation tier.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please resolve validation errors before submitting.", "error");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setRequirements(formData);
      runEvaluation(formData);
      setIsSubmitting(false);
      setShowConfirmation(true);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#1d4ed8', '#2563eb', '#059669', '#d97706']
        });
      } catch (err) {}

      showToast("Requirements synthesized & Decision Model initialized!", "success");
    }, 500);
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(formData, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    showToast("Requirements JSON copied to clipboard", "success");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      
      {/* Title & Engineering Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wide bg-blue-100 text-blue-800 border border-blue-200">
              MODULE // REQ-INPUT-V2
            </span>
            <span className="text-slate-500 text-xs">
              Operator: <strong className="text-slate-800">{currentUser?.name || "Structural Engineer"}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Requirements Input Module
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Input design constraints, governing service loads, environmental exposure, and performance requirements to calibrate the multi-criteria material decision matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Engineering Scenario Presets Bar */}
      <div className="mb-8 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Quick-Load Engineering Presets
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Click to auto-populate complex civil engineering scenarios
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {ENGINEERING_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              className={`p-3 rounded-xl text-left border transition-all ${
                activePreset === preset.name
                  ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-700">
                  {preset.badge}
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-medium">
                  {preset.data.designLife}y Life
                </span>
              </div>
              <p className="font-bold text-xs text-slate-800 truncate">{preset.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form on Left (8 cols), Summary on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
          
          {/* SECTION 1: Structure Type & Structural Element */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Section 1</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Single-Select</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">Structural Typology & Element Architecture</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Parameter 1: Structure Type (Single-Select) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Structure Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="structure-type-select"
                    value={formData.structureType}
                    onChange={(e) => handleSingleSelectChange("structureType", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors appearance-none cursor-pointer font-medium"
                  >
                    {STRUCTURE_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-white text-slate-900 py-1.5">
                        {type}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                {errors.structureType && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.structureType}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Categorizes global stiffness, consequence class, and design codes.
                </p>
              </div>

              {/* Parameter 2: Structural Element (Single-Select) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Structural Element <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="structural-element-select"
                    value={formData.structuralElement}
                    onChange={(e) => handleSingleSelectChange("structuralElement", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors appearance-none cursor-pointer font-medium"
                  >
                    {STRUCTURAL_ELEMENTS.map((elem) => (
                      <option key={elem} value={elem} className="bg-white text-slate-900 py-1.5">
                        {elem}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                {errors.structuralElement && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.structuralElement}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Governs flexural, shear, compression, and buckling sensitivity.
                </p>
              </div>

            </div>
          </div>

          {/* SECTION 2: Load Type & Design Life */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Section 2</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Single-Select & Life</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">Loading Demands & Service Lifecycle</h2>
              </div>
            </div>

            <div className="space-y-6">
              
              {/* Parameter 3: Load Type (Single-Select) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Governing Load Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {LOAD_TYPES.map((lt) => {
                    const isSelected = formData.loadType === lt.value;
                    return (
                      <button
                        type="button"
                        key={lt.value}
                        onClick={() => handleSingleSelectChange("loadType", lt.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 shadow-sm'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {lt.label}
                          </span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{lt.desc}</p>
                      </button>
                    );
                  })}
                </div>
                {errors.loadType && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.loadType}
                  </p>
                )}
              </div>

              {/* Parameter 4: Design Life (Years) (10 to 250 years) */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Design Life (Years) <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Service lifecycle durability target (Permissible range: 10 to 250 years)
                    </p>
                  </div>

                  {/* Synchronized Numeric Input */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Target:</span>
                    <input
                      type="number"
                      id="design-life-input"
                      min="10"
                      max="250"
                      value={formData.designLife}
                      onChange={(e) => handleDesignLifeChange(e.target.value)}
                      className="w-20 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl px-2.5 py-1 text-sm font-mono font-bold text-blue-800 text-center outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-700">Years</span>
                  </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-3">
                  <input
                    type="range"
                    min="10"
                    max="250"
                    step="5"
                    value={formData.designLife}
                    onChange={(e) => handleDesignLifeChange(e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  
                  {/* Milestones Buttons */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="text-[11px] font-medium">Standard Milestones:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {DESIGN_LIFE_MILESTONES.map((milestone) => (
                        <button
                          key={milestone}
                          type="button"
                          onClick={() => handleDesignLifeChange(milestone)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                            formData.designLife === milestone
                              ? 'bg-blue-700 text-white shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {milestone >= 100 ? `${milestone}y+` : `${milestone}y`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {errors.designLife && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.designLife}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 3: Environmental Condition, Budget, Sustainability */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Section 3</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Single-Select & Eco</span>
                </div>
                <h2 className="text-base font-bold text-slate-900">Environmental Exposure, Budget & Sustainability</h2>
              </div>
            </div>

            <div className="space-y-6">
              
              {/* Parameter 5: Environmental Condition (Single-Select) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Environmental Exposure Condition <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {ENVIRONMENTAL_CONDITIONS.map((env) => {
                    const isSelected = formData.environmentalCondition === env.value;
                    return (
                      <button
                        type="button"
                        key={env.value}
                        onClick={() => handleSingleSelectChange("environmentalCondition", env.value)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600 shadow-sm'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {env.label}
                          </span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{env.desc}</p>
                      </button>
                    );
                  })}
                </div>
                {errors.environmentalCondition && (
                  <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.environmentalCondition}
                  </p>
                )}
              </div>

              {/* Parameter 6: Budget Range & Parameter 7: Sustainability Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                
                {/* Budget Range */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Budget Range <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {BUDGET_RANGES.map((b) => {
                      const isSelected = formData.budgetRange === b.value;
                      return (
                        <button
                          type="button"
                          key={b.value}
                          onClick={() => handleSingleSelectChange("budgetRange", b.value)}
                          className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-blue-700 border-blue-700 text-white shadow-sm font-bold'
                              : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold'
                          }`}
                        >
                          <span className="text-xs block">{b.value}</span>
                          <span className="text-[10px] opacity-80 font-mono">
                            {b.value === 'Low' ? 'Economy' : b.value === 'Medium' ? 'Standard' : 'Premium'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.budgetRange && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.budgetRange}
                    </p>
                  )}
                </div>

                {/* Sustainability Preference (Toggle Yes / No) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Sustainability Preference <span className="text-emerald-700 font-normal">(Low Carbon)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSingleSelectChange("sustainabilityPreference", true)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all ${
                        formData.sustainabilityPreference === true
                          ? 'bg-emerald-700 border-emerald-700 text-white shadow-sm font-bold'
                          : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold'
                      }`}
                    >
                      <Leaf className="w-4 h-4" />
                      <span className="text-xs">Yes (Prioritize)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSingleSelectChange("sustainabilityPreference", false)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all ${
                        formData.sustainabilityPreference === false
                          ? 'bg-slate-800 border-slate-800 text-white font-bold shadow-sm'
                          : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold'
                      }`}
                    >
                      <span className="text-xs">No (Standard)</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SECTION 4: Special Requirements (ONLY MULTI-SELECT FIELD) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Section 4</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                      Multi-Select Allowed (Only Field)
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">Special Requirements & Engineering Performance Criteria</h2>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {formData.specialRequirements.length} Selected
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 mb-5 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900">
                <strong>CRITICAL CONSTRAINT:</strong> Only this specific field allows multiple selections. Check any performance demands that apply to this structural member.
              </p>
            </div>

            {/* Checkboxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SPECIAL_REQUIREMENTS.map((req) => {
                const isChecked = formData.specialRequirements.includes(req.id);
                return (
                  <div
                    key={req.id}
                    onClick={() => handleToggleSpecialReq(req.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isChecked
                        ? 'bg-amber-50/70 border-amber-500 ring-1 ring-amber-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      isChecked ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-bold leading-tight ${isChecked ? 'text-amber-950' : 'text-slate-800'}`}>
                          {req.label}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold shrink-0">
                          {req.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        {req.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-requirements-btn"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-extrabold text-sm text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin text-blue-200" />
                  <span>Synthesizing Structural Parameters & Running MCDA Model...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-blue-100" />
                  <span>Submit Requirements & Launch Decision Engine</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

        {/* RIGHT SIDEBAR: Live Parameter Summary */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Specification Snapshot
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold">
                Live State
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Structure & Element</span>
                <p className="font-bold text-slate-800 mt-0.5">{formData.structureType}</p>
                <p className="text-blue-700 font-semibold text-[11px] mt-0.5">Element: {formData.structuralElement}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Loading & Lifespan</span>
                <p className="font-semibold text-slate-800 mt-0.5">{formData.loadType}</p>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-500">Target Design Life:</span>
                  <span className="font-mono font-bold text-indigo-700">{formData.designLife} Years</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Environment & Economic</span>
                <p className="font-medium text-slate-700 mt-0.5">{formData.environmentalCondition}</p>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-500">Budget:</span>
                  <span className="font-bold text-slate-800">{formData.budgetRange}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5 text-[11px]">
                  <span className="text-slate-500">Sustainability:</span>
                  <span className={`font-bold ${formData.sustainabilityPreference ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {formData.sustainabilityPreference ? 'Prioritized' : 'Standard'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Special Criteria</span>
                  <span className="text-[10px] font-mono text-amber-700 font-bold">{formData.specialRequirements.length} selected</span>
                </div>
                {formData.specialRequirements.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.specialRequirements.map(r => (
                      <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                        {r}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">None selected</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Single-select typologies verified</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>10–250y design envelope active</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CONFIRMATION & JSON PREVIEW MODAL */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Project Requirements Submitted Successfully
                  </h3>
                  <p className="text-xs text-slate-500">
                    Parameters compiled into machine-readable JSON for MCDA Decision Matrix
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Structure</span>
                  <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{formData.structureType}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Element</span>
                  <span className="text-xs font-bold text-blue-700 truncate block mt-0.5">{formData.structuralElement}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Design Life</span>
                  <span className="text-xs font-bold text-indigo-700 block mt-0.5 font-mono">{formData.designLife} Years</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Sustainability</span>
                  <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                    {formData.sustainabilityPreference ? 'Prioritized' : 'Standard'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                      Compiled Parameters JSON Payload
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono text-slate-700 border border-slate-200 transition-colors"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed max-h-56">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  saveProject(`${formData.structureType} - ${formData.structuralElement}`, "Civil Infrastructure Client");
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Save as Project Draft
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Edit Parameters
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmation(false);
                    setActiveTab("evaluation-results");
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-700/20"
                >
                  <span>Proceed to Material Comparison & Rankings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
