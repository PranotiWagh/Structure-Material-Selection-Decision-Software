import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, AlertCircle } from './icons';
import { checkPasswordComplexity } from '../services/api';

export default function PasswordRequirementsChecklist({ password = '', showHeader = true }) {
  const { minLength, hasUppercase, hasLowercase, hasDigit, hasSpecial, passedCount, isValid, strengthPercent } = checkPasswordComplexity(password);

  const criteria = [
    { id: 'len', label: 'Minimum 8 characters length', passed: minLength },
    { id: 'upper', label: 'At least one uppercase letter (A-Z)', passed: hasUppercase },
    { id: 'lower', label: 'At least one lowercase letter (a-z)', passed: hasLowercase },
    { id: 'digit', label: 'At least one numeric digit (0-9)', passed: hasDigit },
    { id: 'special', label: 'At least one special character (!@#$%^&*(),.?":{}|<>-)', passed: hasSpecial },
  ];

  const getStrengthBadge = () => {
    if (passedCount === 5) return { label: 'Strictly Compliant (Strong)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (passedCount >= 3) return { label: 'Moderate (Needs Criteria)', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    if (passedCount > 0) return { label: 'Weak (Unacceptable)', color: 'text-rose-700 bg-rose-50 border-rose-300' };
    return { label: 'Not Entered', color: 'text-slate-600 bg-slate-50 border-slate-200' };
  };

  const badge = getStrengthBadge();

  return (
    <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 transition-all text-xs">
      {showHeader && (
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Institutional Password Policy</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full font-semibold border ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            passedCount === 5 ? 'bg-emerald-500' :
            passedCount >= 3 ? 'bg-amber-500' :
            passedCount > 0 ? 'bg-rose-500' : 'bg-transparent'
          }`}
          style={{ width: `${strengthPercent}%` }}
        />
      </div>

      {/* Criteria Checklist with live green/red checkmarks */}
      <ul className="space-y-1.5 pt-1">
        {criteria.map((item) => (
          <li 
            key={item.id} 
            className={`flex items-center gap-2 font-medium transition-colors ${
              item.passed ? 'text-emerald-700 font-semibold' : 'text-slate-500'
            }`}
          >
            {item.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
