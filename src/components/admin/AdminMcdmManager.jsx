import React, { useState, useEffect } from 'react';
import {
  fetchMcdmCriteria,
  saveMcdmCriteria,
  calculateAhpLive,
  fetchAhpMatrices,
  saveAhpMatrix,
  fetchMcdmLogs
} from '../../services/api';
import {
  SlidersHorizontal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Save,
  RefreshCw,
  Scale,
  Database,
  Layers,
  ArrowRight
} from '../icons';

export default function AdminMcdmManager({ showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('criteria'); // 'criteria' | 'ahp' | 'logs'
  const [loading, setLoading] = useState(false);

  // Criteria State
  const [criteria, setCriteria] = useState([]);
  const [showAddCriteriaModal, setShowAddCriteriaModal] = useState(false);
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    code: '',
    unit_type: '',
    is_benefit: true,
    default_weight: 0.20,
    description: ''
  });

  // AHP Matrix State
  const [ahpMatrix, setAhpMatrix] = useState([]);
  const [ahpResult, setAhpResult] = useState(null);
  const [matrixName, setMatrixName] = useState('IS Standard Civil Criteria Matrix');
  const [savedMatrices, setSavedMatrices] = useState([]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  // Load Criteria & Saved Matrices on Mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [critData, matricesData, logsData] = await Promise.all([
        fetchMcdmCriteria(),
        fetchAhpMatrices(),
        fetchMcdmLogs(30)
      ]);
      setCriteria(critData || []);
      setSavedMatrices(matricesData || []);
      setAuditLogs(logsData || []);

      // Initialize AHP Matrix with criteria if empty
      if (critData && critData.length > 0) {
        initMatrixFromCriteria(critData);
      }
    } catch (err) {
      showToast?.('Failed to load MCDM configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const initMatrixFromCriteria = (critList) => {
    const n = critList.length;
    const initial = Array(n).fill(null).map((_, i) =>
      Array(n).fill(null).map((_, j) => (i === j ? 1 : 1))
    );
    setAhpMatrix(initial);
    runLiveAhpCalculation(critList.map(c => c.code), initial);
  };

  const handleMatrixCellChange = (rowIndex, colIndex, value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;

    const newMatrix = ahpMatrix.map(row => [...row]);
    newMatrix[rowIndex][colIndex] = num;
    newMatrix[colIndex][rowIndex] = parseFloat((1 / num).toFixed(4));

    setAhpMatrix(newMatrix);
    runLiveAhpCalculation(criteria.map(c => c.code), newMatrix);
  };

  const runLiveAhpCalculation = async (codes, matrix) => {
    try {
      const result = await calculateAhpLive(codes, matrix);
      setAhpResult(result);
    } catch (err) {
      console.warn('AHP Live calc error:', err);
    }
  };

  const handleSaveCriteria = async (e) => {
    e.preventDefault();
    if (!newCriteria.name || !newCriteria.code) {
      showToast?.('Please enter criterion name and code', 'error');
      return;
    }
    try {
      await saveMcdmCriteria(newCriteria);
      showToast?.(`Criterion "${newCriteria.name}" saved to database`, 'success');
      setShowAddCriteriaModal(false);
      setNewCriteria({
        name: '',
        code: '',
        unit_type: '',
        is_benefit: true,
        default_weight: 0.20,
        description: ''
      });
      loadData();
    } catch (err) {
      showToast?.(err.message || 'Failed to save criterion', 'error');
    }
  };

  const handleToggleBenefit = async (crit) => {
    try {
      await saveMcdmCriteria({
        ...crit,
        is_benefit: !crit.is_benefit
      });
      showToast?.(`Toggled "${crit.name}" to ${!crit.is_benefit ? 'Benefit (Higher is better)' : 'Cost (Lower is better)'}`, 'info');
      loadData();
    } catch (err) {
      showToast?.('Failed to update criterion type', 'error');
    }
  };

  const handleSaveAhpMatrix = async () => {
    if (!matrixName) {
      showToast?.('Please enter a matrix title', 'error');
      return;
    }
    try {
      await saveAhpMatrix({
        name: matrixName,
        criteria_codes: criteria.map(c => c.code),
        matrix: ahpMatrix,
        created_by: 'Admin Structural Engineer'
      });
      showToast?.('AHP Pairwise Matrix successfully saved to SQLite', 'success');
      loadData();
    } catch (err) {
      showToast?.('Failed to save AHP matrix', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
              MCDM Engine Config
            </span>
            <span className="text-xs text-slate-500">AHP Weighting & TOPSIS Benchmarking</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Multi-Criteria Decision Making (AHP + TOPSIS) Architecture
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Configure civil structural criteria, pairwise comparison matrices with Saaty consistency ratio verification, and review execution logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddCriteriaModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Criterion
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('criteria')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'criteria'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          Evaluation Criteria ({criteria.length})
        </button>

        <button
          onClick={() => setActiveSubTab('ahp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'ahp'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4" />
          AHP Pairwise Matrix Studio
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeSubTab === 'logs'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Evaluation Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: EVALUATION CRITERIA TABLE */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'criteria' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Active Structural Evaluation Criteria
            </h3>
            <span className="text-xs text-slate-500">Stored in SQLite (materials.db / evaluation_criteria)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-100/75 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Criterion Name</th>
                  <th className="py-3 px-4">Field Code</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Optimization Goal</th>
                  <th className="py-3 px-4">Default Weight</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criteria.map((crit) => (
                  <tr key={crit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {crit.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-indigo-700 bg-indigo-50/50 rounded inline-block my-1">
                      {crit.code}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {crit.unit_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleBenefit(crit)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                          crit.is_benefit
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle Benefit vs. Cost"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${crit.is_benefit ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {crit.is_benefit ? 'Benefit (Higher is Better)' : 'Cost (Lower is Better)'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {(crit.default_weight * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={crit.description}>
                      {crit.description || 'Standard civil engineering material parameter.'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleBenefit(crit)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Toggle Goal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: AHP PAIRWISE MATRIX STUDIO */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'ahp' && (
        <div className="space-y-6">
          {/* Consistency Card & Controls */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Matrix Title / Identification</label>
              <input
                type="text"
                value={matrixName}
                onChange={(e) => setMatrixName(e.target.value)}
                className="w-full md:w-96 px-3 py-1.5 text-sm border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {ahpResult && (
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-lg border text-xs flex items-center gap-2 ${
                  ahpResult.is_consistent
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {ahpResult.is_consistent ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-bold">
                      CR = {ahpResult.consistency_ratio}
                    </span>{' '}
                    ({ahpResult.is_consistent ? 'Consistent ≤ 0.10' : 'Inconsistent > 0.10'})
                    <div className="text-[11px] text-slate-600">
                      λ_max = {ahpResult.lambda_max} | CI = {ahpResult.consistency_index}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveAhpMatrix}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Matrix
                </button>
              </div>
            )}
          </div>

          {/* Interactive Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              Saaty 1-9 Pairwise Comparison Matrix (n = {criteria.length})
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Enter relative importance of row criterion compared to column criterion (1 = Equal, 3 = Moderate, 5 = Strong, 7 = Very Strong, 9 = Extreme).
              Reciprocal values are automatically synchronized.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border border-slate-200">
                <thead className="bg-slate-100 text-slate-800 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-left border-r border-slate-200 bg-slate-200/80">Criteria</th>
                    {criteria.map((c, idx) => (
                      <th key={c.id} className="py-2.5 px-3 border-r border-slate-200" title={c.name}>
                        {c.name.split(' ')[0]}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 bg-blue-50 text-blue-900 border-l-2 border-blue-200 font-bold">
                      Calculated AHP Weight
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {criteria.map((rowCrit, rowIdx) => (
                    <tr key={rowCrit.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-left font-semibold text-slate-900 bg-slate-50 border-r border-slate-200 whitespace-nowrap">
                        {rowCrit.name}
                      </td>
                      {criteria.map((colCrit, colIdx) => {
                        const val = ahpMatrix[rowIdx]?.[colIdx] ?? 1;
                        const isDiag = rowIdx === colIdx;
                        return (
                          <td key={colCrit.id} className="py-2 px-2 border-r border-slate-200">
                            {isDiag ? (
                              <span className="font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded">1.0</span>
                            ) : (
                              <input
                                type="number"
                                step="any"
                                min="0.11"
                                max="9.0"
                                value={val}
                                onChange={(e) => handleMatrixCellChange(rowIdx, colIdx, e.target.value)}
                                className="w-16 text-center py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                              />
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 bg-blue-50/60 border-l-2 border-blue-200 text-center font-bold text-blue-900">
                        {ahpResult?.weights?.[rowIdx] !== undefined ? (
                          <div className="flex items-center justify-center gap-2">
                            <span>{(ahpResult.weights[rowIdx] * 100).toFixed(1)}%</span>
                            <div className="w-12 bg-slate-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, ahpResult.weights[rowIdx] * 200)}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          '--'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 3: EVALUATION AUDIT LOGS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              MCDM Evaluation Audit Trail (SQLite: evaluation_logs)
            </h3>
            <span className="text-xs text-slate-500">{auditLogs.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Structure</th>
                  <th className="py-3 px-4">Materials Evaluated</th>
                  <th className="py-3 px-4">Top Recommendation</th>
                  <th className="py-3 px-4">Suitability Score</th>
                  <th className="py-3 px-4">Engineer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No MCDM runs recorded yet. Execute an evaluation in the Employee/Customer portal.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {log.created_at ? log.created_at.replace('T', ' ').slice(0, 19) : 'Just now'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {log.project_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.structure_type}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {log.materials_evaluated_count} materials
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-700">
                        {log.top_recommended_material || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {log.top_score ? `${log.top_score}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.executed_by || 'Structural Engineer'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Criterion */}
      {showAddCriteriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Engineering Criterion</h3>
            <form onSubmit={handleSaveCriteria} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Criterion Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tensile Yield Strength"
                  value={newCriteria.name}
                  onChange={(e) => setNewCriteria({ ...newCriteria, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Database Field Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. tensile_strength"
                  value={newCriteria.code}
                  onChange={(e) => setNewCriteria({ ...newCriteria, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Type</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MPa, kg/m³"
                    value={newCriteria.unit_type}
                    onChange={(e) => setNewCriteria({ ...newCriteria, unit_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Weight</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={newCriteria.default_weight}
                    onChange={(e) => setNewCriteria({ ...newCriteria, default_weight: parseFloat(e.target.value) || 0.2 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Optimization Direction</label>
                <select
                  value={newCriteria.is_benefit ? 'benefit' : 'cost'}
                  onChange={(e) => setNewCriteria({ ...newCriteria, is_benefit: e.target.value === 'benefit' })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="benefit">Benefit Criterion (Higher value is better, e.g. Strength, Durability)</option>
                  <option value="cost">Cost Criterion (Lower value is better, e.g. Cost, Density, CO₂)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Standard Code</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Tensile yield strength tested under IS 1786."
                  value={newCriteria.description}
                  onChange={(e) => setNewCriteria({ ...newCriteria, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCriteriaModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save Criterion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
