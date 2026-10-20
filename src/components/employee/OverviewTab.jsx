import React, { useState, useMemo } from 'react';
import {
  Database,
  Clock,
  TrendingUp,
  ShieldCheck,
  Search,
  ArrowRight,
  SlidersHorizontal,
  Scale,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Leaf,
  Flame,
  Zap,
  DollarSign,
  BarChart3
} from '../icons';

export default function OverviewTab({
  metrics,
  recentSearches = [],
  materialsList = [],
  onNavigateToView,
  onReloadProject,
  onRefreshData
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [pieChartMode, setPieChartMode] = useState('category'); // 'category' | 'quality'
  const [hoveredPieSlice, setHoveredPieSlice] = useState(null);
  const [benchmarkMetric, setBenchmarkMetric] = useState('comp'); // 'comp' | 'tens' | 'carbon'

  const handleRefresh = async () => {
    if (onRefreshData) {
      setRefreshing(true);
      await onRefreshData();
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Filter recent searches strictly from live SQLite data
  const filteredSearches = useMemo(() => {
    if (!searchTerm.trim()) return recentSearches;
    const q = searchTerm.toLowerCase();
    return recentSearches.filter(s =>
      (s.name || s.project_name || '').toLowerCase().includes(q) ||
      (s.client || s.client_organization || s.clientName || '').toLowerCase().includes(q) ||
      (s.topRecommendation || s.top_recommendation || '').toLowerCase().includes(q) ||
      (s.requirements?.structureType || s.structure_type || '').toLowerCase().includes(q)
    );
  }, [recentSearches, searchTerm]);

  // 1. Material Category Distribution with Multi-Color Tokens
  const categoryDistribution = useMemo(() => {
    const counts = {};
    materialsList.forEach(m => {
      const c = m.category || 'Other';
      counts[c] = (counts[c] || 0) + 1;
    });

    const palette = [
      { color: '#2563eb', bg: 'bg-blue-600', text: 'text-blue-700', light: 'bg-blue-50 border-blue-200' },
      { color: '#059669', bg: 'bg-emerald-600', text: 'text-emerald-700', light: 'bg-emerald-50 border-emerald-200' },
      { color: '#4f46e5', bg: 'bg-indigo-600', text: 'text-indigo-700', light: 'bg-indigo-50 border-indigo-200' },
      { color: '#7c3aed', bg: 'bg-purple-600', text: 'text-purple-700', light: 'bg-purple-50 border-purple-200' },
      { color: '#d97706', bg: 'bg-amber-600', text: 'text-amber-700', light: 'bg-amber-50 border-amber-200' },
      { color: '#e11d48', bg: 'bg-rose-600', text: 'text-rose-700', light: 'bg-rose-50 border-rose-200' }
    ];

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const total = materialsList.length || 1000;

    return sorted.map(([category, count], idx) => ({
      id: category,
      label: category,
      category,
      count,
      percent: ((count / total) * 100).toFixed(1),
      percentage: Number(((count / total) * 100).toFixed(1)),
      color: palette[idx % palette.length].color,
      spec: `${count} grades in library`,
      styling: palette[idx % palette.length]
    }));
  }, [materialsList]);

  // Quality & Strength Tier Spectrum for Pie Chart
  const qualityDistribution = useMemo(() => {
    let ultra = 0, strong = 0, moderate = 0, standard = 0;
    materialsList.forEach(m => {
      const comp = m.compressiveStrength || 0;
      const tens = m.tensileStrength || 0;
      if (comp >= 80 || tens >= 550) ultra++;
      else if (comp >= 40 || tens >= 415) strong++;
      else if (comp >= 25 || tens >= 250) moderate++;
      else standard++;
    });
    const total = materialsList.length || 1;
    return [
      { id: 'Ultra High Strength', label: 'Ultra High Strength', spec: '> 80 MPa / UHPC', count: ultra, percentage: ((ultra / total) * 100).toFixed(1), color: '#059669' },
      { id: 'Strong Structural', label: 'Primary Structural', spec: '40 - 80 MPa / Fe 500D', count: strong, percentage: ((strong / total) * 100).toFixed(1), color: '#2563eb' },
      { id: 'Moderate Standard', label: 'Moderate Standard', spec: '25 - 40 MPa / M30', count: moderate, percentage: ((moderate / total) * 100).toFixed(1), color: '#f59e0b' },
      { id: 'Standard / Non-Load', label: 'Non-Load Utility', spec: '< 25 MPa / PCC', count: standard, percentage: ((standard / total) * 100).toFixed(1), color: '#e11d48' }
    ];
  }, [materialsList]);

  // Comparative Property Benchmarks across Top Categories for Multi-Color Bar Chart
  const propertyBenchmarks = useMemo(() => {
    const catMap = {};
    materialsList.forEach(m => {
      const c = m.category || 'Other';
      if (!catMap[c]) {
        catMap[c] = { count: 0, compSum: 0, tensSum: 0, carbonSum: 0 };
      }
      catMap[c].count++;
      catMap[c].compSum += (m.compressiveStrength || 0);
      catMap[c].tensSum += (m.tensileStrength || 0);
      catMap[c].carbonSum += (m.embodiedCarbon || 300);
    });

    const palette = ['#2563eb', '#4f46e5', '#059669', '#d97706', '#7c3aed', '#e11d48'];
    return Object.entries(catMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([cat, val], idx) => ({
        category: cat,
        avgComp: Math.round(val.compSum / val.count),
        avgTens: Math.round(val.tensSum / val.count),
        avgCarbon: Math.round(val.carbonSum / val.count),
        color: palette[idx % palette.length]
      }));
  }, [materialsList]);

  // 2. Cost vs. Strength Quadrant Distribution
  const costStrengthStats = useMemo(() => {
    let highValue = 0;   // High Strength & Low/Medium Cost
    let premium = 0;     // High Strength & High Cost
    let standard = 0;    // Standard Strength & Low Cost
    let specialty = 0;   // High Cost & Specialty

    materialsList.forEach(m => {
      const isHighStrength = (m.compressiveStrength || 0) >= 50 || (m.tensileStrength || 0) >= 410;
      const isLowCost = (m.costInrM3 || 0) <= 20000 || m.costIndex === 'Low' || m.costIndex === 'Medium';

      if (isHighStrength && isLowCost) highValue++;
      else if (isHighStrength && !isLowCost) premium++;
      else if (!isHighStrength && isLowCost) standard++;
      else specialty++;
    });

    const total = materialsList.length || 1;
    return {
      highValue: { count: highValue, pct: ((highValue / total) * 100).toFixed(1) },
      premium: { count: premium, pct: ((premium / total) * 100).toFixed(1) },
      standard: { count: standard, pct: ((standard / total) * 100).toFixed(1) },
      specialty: { count: specialty, pct: ((specialty / total) * 100).toFixed(1) }
    };
  }, [materialsList]);

  // 3. Environmental Impact & Embodied Carbon Distribution (Green/Red Thresholds)
  const carbonThresholds = useMemo(() => {
    let lowCarbon = 0;      // < 250 kg CO2/t (Green)
    let moderateCarbon = 0; // 250 - 700 kg CO2/t (Amber)
    let highCarbon = 0;     // > 700 kg CO2/t (Rose/Red)

    materialsList.forEach(m => {
      const c = m.embodiedCarbon || 300;
      if (c < 250) lowCarbon++;
      else if (c <= 700) moderateCarbon++;
      else highCarbon++;
    });

    const total = materialsList.length || 1;
    return {
      low: { count: lowCarbon, pct: ((lowCarbon / total) * 100).toFixed(1) },
      moderate: { count: moderateCarbon, pct: ((moderateCarbon / total) * 100).toFixed(1) },
      high: { count: highCarbon, pct: ((highCarbon / total) * 100).toFixed(1) }
    };
  }, [materialsList]);

  const totalMaterials = metrics?.total_materials || materialsList.length || 1000;
  const totalSearches = recentSearches.length;
  const averageScore = recentSearches.length > 0
    ? (recentSearches.reduce((acc, curr) => acc + (curr.suitabilityScore || curr.suitability_score || 90), 0) / recentSearches.length).toFixed(1)
    : (metrics?.average_score || 0);

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. TOP HEADER & WORKSPACE TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              EMPLOYEE OVERVIEW // SM-DSS
            </span>
            <span className="text-xs font-mono text-slate-500">/employee/dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Structural Material Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl">
            Live SQLite data pipeline, parametric multi-color engineering distributions, and dynamic search audit tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh database metrics from SQLite"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync SQLite</span>
          </button>

          <button
            onClick={() => onNavigateToView('search')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Search by Name</span>
          </button>

          <button
            onClick={() => onNavigateToView('predict')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-700/20 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>New Prediction</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1: Materials in SQLite */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Available Materials Dataset</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {totalMaterials.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>SQLite database/materials.db</span>
          </div>
        </div>

        {/* Metric 2: Live Past Searches Conducted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Past Searches Conducted</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {totalSearches}
          </p>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-emerald-700 font-semibold font-mono">Dynamic SQLite Sync</span>
            {totalSearches > 0 && (
              <button
                onClick={() => onNavigateToView('history')}
                className="text-blue-700 font-bold hover:underline cursor-pointer"
              >
                Archive ({totalSearches}) →
              </button>
            )}
          </div>
        </div>

        {/* Metric 3: Average Suitability Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Average Suitability Index</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {totalSearches > 0 ? `${averageScore}%` : 'N/A'}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-mono">
            <span>{totalSearches > 0 ? 'Computed from Live Dossiers' : 'Pending First Evaluation'}</span>
          </div>
        </div>

        {/* Metric 4: Standards & Certification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Governing Indian Codes</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            IS & IRC
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-indigo-700 font-semibold">
            <span>IS 456 • IS 800 • IRC:112</span>
          </div>
        </div>

      </div>

      {/* 3. ADVANCED MULTI-COLORED INTERACTIVE CHARTS (MATCHING ADMIN DASHBOARD) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: Interactive Pie / Donut Material Distribution Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6">
          
          {/* Header with Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Interactive Intelligence Chart</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
                {pieChartMode === 'quality' ? 'Material Strength Quality Pie' : 'Material Category Composition Pie'}
              </h3>
              <p className="text-xs text-slate-500">
                {pieChartMode === 'quality'
                  ? 'Strength classification across 1,000 grades per IS 456 & IS 800 standards.'
                  : 'Proportional distribution across structural engineering material classes.'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200/60">
              <button
                onClick={() => { setPieChartMode('quality'); setHoveredPieSlice(null); }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  pieChartMode === 'quality'
                    ? 'bg-white shadow-xs text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quality Tiers
              </button>
              <button
                onClick={() => { setPieChartMode('category'); setHoveredPieSlice(null); }}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  pieChartMode === 'category'
                    ? 'bg-white shadow-xs text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Categories
              </button>
            </div>
          </div>

          {/* Interactive Donut SVG & Legend Area */}
          {(() => {
            const activeList = pieChartMode === 'quality' ? qualityDistribution : categoryDistribution;
            const radius = 60;
            const circumference = 2 * Math.PI * radius; // ~376.99
            let accumulated = 0;
            const slices = activeList.map((item) => {
              const dashLength = ((item.percentage || 0) / 100) * circumference;
              const dashOffset = -accumulated;
              accumulated += dashLength;
              return { ...item, dashLength, dashOffset };
            });

            const activeHoverItem = hoveredPieSlice 
              ? activeList.find(s => s.id === hoveredPieSlice)
              : null;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                
                {/* SVG Donut Canvas */}
                <div className="sm:col-span-5 flex items-center justify-center">
                  <div className="pie-chart-container w-48 h-48 sm:w-52 sm:h-52 relative">
                    <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                      {/* Background track circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="20"
                      />

                      {/* Interactive Slices */}
                      {slices.map((slice) => {
                        const isHovered = (hoveredPieSlice === slice.id);
                        return (
                          <circle
                            key={slice.id}
                            cx="80"
                            cy="80"
                            r={radius}
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth={isHovered ? 26 : 20}
                            strokeDasharray={`${slice.dashLength} ${circumference - slice.dashLength}`}
                            strokeDashoffset={slice.dashOffset}
                            className="pie-chart-slice cursor-pointer"
                            style={{
                              filter: isHovered ? `drop-shadow(0 0 8px ${slice.color}90)` : 'none'
                            }}
                            onMouseEnter={() => setHoveredPieSlice(slice.id)}
                            onMouseLeave={() => setHoveredPieSlice(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Donut Center Hub */}
                    <div className="pie-center-hub">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono truncate max-w-[110px]">
                        {activeHoverItem ? activeHoverItem.label : (pieChartMode === 'quality' ? 'Total Set' : 'All Classes')}
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-mono tracking-tight leading-tight">
                        {activeHoverItem ? `${activeHoverItem.percentage}%` : `${totalMaterials}`}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 font-mono">
                        {activeHoverItem ? `${activeHoverItem.count} grades` : '100% Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Legend List */}
                <div className="sm:col-span-7 space-y-2.5">
                  {activeList.map((item) => {
                    const isSelected = (hoveredPieSlice === item.id);
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredPieSlice(item.id)}
                        onMouseLeave={() => setHoveredPieSlice(null)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isSelected 
                            ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/50 shadow-xs' 
                            : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs" 
                              style={{ backgroundColor: item.color }} 
                            />
                            <span className="font-bold text-slate-900 truncate max-w-[150px]">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-slate-500 font-semibold">{item.count}</span>
                            <span 
                              className="text-xs font-black px-1.5 py-0.2 rounded-md text-white shadow-2xs"
                              style={{ backgroundColor: item.color }}
                            >
                              {item.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Mini Progress Fill */}
                        <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                          />
                        </div>

                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>{item.spec}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })()}

          {/* Footnote Badge */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>IS 456, IS 800 & IRC:112 Engineering Calibration</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">Live SQLite Sync</span>
          </div>
        </div>

        {/* CHART 2: Property Benchmark & Strength Spectrum Bar Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 font-mono">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Structural Property Benchmark</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5 tracking-tight">
                {benchmarkMetric === 'comp' ? 'Compressive Strength Benchmarks' : benchmarkMetric === 'tens' ? 'Tensile Yield Spectrum' : 'Embodied Carbon Intensity'}
              </h3>
              <p className="text-xs text-slate-500">
                Category mean property comparison across top civil materials.
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200/60">
              <button
                onClick={() => setBenchmarkMetric('comp')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  benchmarkMetric === 'comp'
                    ? 'bg-white shadow-xs text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                f'c (MPa)
              </button>
              <button
                onClick={() => setBenchmarkMetric('tens')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  benchmarkMetric === 'tens'
                    ? 'bg-white shadow-xs text-emerald-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                fy (MPa)
              </button>
              <button
                onClick={() => setBenchmarkMetric('carbon')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  benchmarkMetric === 'carbon'
                    ? 'bg-white shadow-xs text-amber-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CO₂e
              </button>
            </div>
          </div>

          {/* Interactive Multi-Color Bar Chart */}
          <div className="pt-2">
            {(() => {
              const maxVal = benchmarkMetric === 'comp'
                ? Math.max(...propertyBenchmarks.map(b => b.avgComp), 100)
                : benchmarkMetric === 'tens'
                ? Math.max(...propertyBenchmarks.map(b => b.avgTens), 500)
                : Math.max(...propertyBenchmarks.map(b => b.avgCarbon), 1200);

              const unit = benchmarkMetric === 'carbon' ? 'kg/t' : 'MPa';

              return (
                <div className="space-y-4">
                  <div className="h-52 w-full flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
                    {propertyBenchmarks.map((b) => {
                      const curVal = benchmarkMetric === 'comp' ? b.avgComp : benchmarkMetric === 'tens' ? b.avgTens : b.avgCarbon;
                      const heightPct = Math.max(12, Math.min(100, (curVal / maxVal) * 100));

                      return (
                        <div key={b.category} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                          
                          {/* Bar Container */}
                          <div className="w-full max-w-[42px] h-full flex items-end justify-center relative">
                            
                            {/* Hover Value Tooltip */}
                            <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md">
                              {curVal} {unit}
                            </div>

                            {/* Glowing Gradient Bar */}
                            <div 
                              className="w-full rounded-t-lg transition-all duration-500 shadow-sm group-hover:brightness-110"
                              style={{ 
                                height: `${heightPct}%`, 
                                backgroundColor: b.color,
                                boxShadow: `0 4px 12px ${b.color}35`
                              }}
                            />
                          </div>

                          {/* Category Label Below */}
                          <div className="text-[10px] font-bold text-slate-700 truncate max-w-[65px] text-center font-mono mt-1">
                            {b.category.split(' ')[0]}
                          </div>

                          <div className="text-[9px] font-extrabold font-mono text-slate-500">
                            {curVal}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Property Benchmarks Summary Cards */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
                      <span className="text-[9px] font-bold text-blue-800 uppercase font-mono block">Peak Capacity</span>
                      <span className="text-sm font-black text-blue-900 font-mono">{maxVal} {unit}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                      <span className="text-[9px] font-bold text-emerald-800 uppercase font-mono block">Classes Analyzed</span>
                      <span className="text-sm font-black text-emerald-900 font-mono">{propertyBenchmarks.length} Majors</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 text-center">
                      <span className="text-[9px] font-bold text-purple-800 uppercase font-mono block">Design Safety</span>
                      <span className="text-sm font-black text-purple-900 font-mono">γm = 1.15-1.5</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* 3B. QUADRANT & ENVIRONMENTAL IMPACT MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost vs. Strength Quadrant */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Cost vs. Strength Matrix</span>
              </h3>
              <p className="text-[11px] text-slate-500">Structural value classification across dataset</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">₹/m³ vs f'c</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono block">
                High Value (Ideal)
              </span>
              <p className="text-2xl font-black text-emerald-900 font-mono">
                {costStrengthStats.highValue.count}
              </p>
              <p className="text-[11px] text-emerald-700">
                High strength, economical ({costStrengthStats.highValue.pct}%)
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
              <span className="text-[10px] font-bold text-blue-800 uppercase font-mono block">
                Premium Capacity
              </span>
              <p className="text-2xl font-black text-blue-900 font-mono">
                {costStrengthStats.premium.count}
              </p>
              <p className="text-[11px] text-blue-700">
                UHPC / Special Alloys ({costStrengthStats.premium.pct}%)
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase font-mono block">
                Standard Civil
              </span>
              <p className="text-2xl font-black text-amber-900 font-mono">
                {costStrengthStats.standard.count}
              </p>
              <p className="text-[11px] text-amber-700">
                Commodity PCC/M25 ({costStrengthStats.standard.pct}%)
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
              <span className="text-[10px] font-bold text-rose-800 uppercase font-mono block">
                Specialty High-Cost
              </span>
              <p className="text-2xl font-black text-rose-900 font-mono">
                {costStrengthStats.specialty.count}
              </p>
              <p className="text-[11px] text-rose-700">
                Marine 316L / CFRP ({costStrengthStats.specialty.pct}%)
              </p>
            </div>
          </div>
        </div>

        {/* Embodied Carbon Thresholds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>Embodied Carbon (LCA) Thresholds</span>
              </h3>
              <p className="text-[11px] text-slate-500">Green / Amber / Red thresholds for sustainability</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">kg CO₂e/t</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Ultra Low Carbon (&lt;250 kg/t)</span>
                </span>
                <span className="font-mono font-bold text-emerald-800">
                  {carbonThresholds.low.count} ({carbonThresholds.low.pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${carbonThresholds.low.pct}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Moderate Impact (250-700 kg/t)</span>
                </span>
                <span className="font-mono font-bold text-amber-800">
                  {carbonThresholds.moderate.count} ({carbonThresholds.moderate.pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${carbonThresholds.moderate.pct}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-semibold text-slate-700">
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>High Carbon Penalty (&gt;700 kg/t)</span>
                </span>
                <span className="font-mono font-bold text-rose-800">
                  {carbonThresholds.high.count} ({carbonThresholds.high.pct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${carbonThresholds.high.pct}%` }} 
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-mono leading-relaxed pt-1">
            Penalties applied dynamically by TOPSIS engine during low-carbon selection runs.
          </p>
        </div>

      </div>

      {/* 4. DYNAMIC SEARCH HISTORY TABLE (ZERO MOCK DATA) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-bold text-slate-900">
                Live SQLite Project Search History
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Live audit records stored in SQLite <code className="font-mono text-slate-700">project_evaluations</code> from verified employee and customer submissions.
            </p>
          </div>

          {recentSearches.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter saved dossier audits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>
          )}
        </div>

        {/* ELEGANT EMPTY STATE WHEN NO LIVE SQLITE RECORDS EXIST */}
        {recentSearches.length === 0 ? (
          <div className="py-12 px-6 rounded-2xl bg-slate-50/80 border border-dashed border-slate-300 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mx-auto shadow-xs">
              <Clock className="w-7 h-7 text-blue-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                No Past Project Searches in SQLite Archive Yet
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                This audit log is purely dynamic with <strong>zero static mock data</strong>. When you or a customer submit a structural requirements evaluation in the Prediction Module, the complete dossier, client metadata, and final scores are recorded here in SQLite.
              </p>
            </div>
            <button
              onClick={() => onNavigateToView('predict')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-700/20 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Execute First Evaluation in Prediction Module</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* LIVE SQLITE DATA TABLE */
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Project & Identifier</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Structure / Element</th>
                    <th className="py-3 px-4">Client / Authority</th>
                    <th className="py-3 px-4">Top Selected Material</th>
                    <th className="py-3 px-4 text-right">MCDM Score</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredSearches.map((item) => {
                    const score = item.suitabilityScore || item.suitability_score || 90;
                    const projName = item.name || item.project_name || 'Structural Project Evaluation';
                    const topMat = item.topRecommendation || item.top_recommendation || 'Standard Material';
                    const clientOrg = item.clientOrganization || item.client_organization || item.client || 'Infrastructure Authority';
                    const dateStr = item.date || (item.created_at ? item.created_at.split('T')[0] : '2026-10-15');
                    const structType = item.requirements?.structureType || item.structure_type || 'Civil Structure';
                    const structElem = item.requirements?.structuralElement || item.structural_element || 'Primary Member';

                    return (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-900 line-clamp-1 max-w-[220px]">
                            {projName}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{item.id}</p>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{dateStr}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700">{structType}</span>
                          <p className="text-[10px] text-slate-400 font-mono">{structElem}</p>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-[160px]">
                          {clientOrg}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0">
                              <Layers className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-800 line-clamp-1">
                              {topMat}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black font-mono border ${
                            score >= 92 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : score >= 85 
                              ? 'bg-blue-50 text-blue-800 border-blue-200' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {score}%
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onReloadProject(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                            title="Load this project into prediction engine"
                          >
                            Reload
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500 font-mono">
                Showing {filteredSearches.length} live records from SQLite
              </p>
              <button
                onClick={() => onNavigateToView('history')}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Project Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
