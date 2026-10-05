import React from 'react';
import { ScanLine } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white">
            <ScanLine className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">NutriVision AI</p>
            <p className="text-[11px] text-slate-500">AI meal analysis · Supabase · Gemini Vision</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 text-center sm:text-right max-w-md">
          Nutritional estimates are AI-assisted references for education and personal tracking — not medical advice.
        </p>
      </div>
    </footer>
  );
};
