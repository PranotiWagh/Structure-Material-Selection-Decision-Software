import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info } from './icons';

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
  };

  const borders = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-950",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    info: "border-blue-200 bg-blue-50 text-blue-950",
    error: "border-rose-200 bg-rose-50 text-rose-950"
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${borders[toast.type] || borders.info}`}>
        {icons[toast.type] || icons.info}
        <p className="text-sm font-semibold">{toast.message}</p>
      </div>
    </div>
  );
}
