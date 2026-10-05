import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AcademicDisclaimerProps {
  className?: string;
}

export const AcademicDisclaimer: React.FC<AcademicDisclaimerProps> = ({ className = '' }) => {
  return (
    <div className={`rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 shadow-xs flex items-start gap-3 ${className}`}>
      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold text-amber-950">
          Academic Research Nutrition Notice
        </p>
        <p className="leading-relaxed text-amber-900 font-medium">
          “Nutrition values are estimates and may vary depending on ingredients, preparation method and portion size.”
        </p>
        <p className="leading-relaxed text-amber-800 text-[11px]">
          Estimated nutrition is based on visual multi-food recognition and reference nutritional datasets. This application is an AIML semester-credit engineering capstone project and does not claim medical accuracy or provide diagnostic advice.
        </p>
      </div>
    </div>
  );
};
