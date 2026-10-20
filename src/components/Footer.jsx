import React from 'react';
import { Building2, ShieldCheck } from './icons';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">SM-DSS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                v2.6 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Structural Material Selection Decision Support Software
            </p>
          </div>
        </div>

        {/* Code compliance note */}
        <div className="text-center md:text-left text-xs text-slate-500">
          <p className="font-medium text-slate-700">
            Civil & Structural Engineering Multi-Criteria Optimization
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Compliant with ACI 318, Eurocode 2/3/5/9, AISC 360, and ASTM C1856 specifications.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-right text-xs text-slate-400 font-mono">
          <p>© 2026 SM-DSS Consortium</p>
        </div>

      </div>
    </footer>
  );
}
