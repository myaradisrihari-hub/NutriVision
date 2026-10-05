import React from 'react';
import {
  ScanLine,
  Layers,
  Activity,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  ArrowRight,
  TrendingUp,
  Database,
  Flame,
  PieChart,
  Scale,
  BrainCircuit,
  Sliders,
} from 'lucide-react';
import { AcademicDisclaimer } from '../components/AcademicDisclaimer.js';

interface LandingPageProps {
  onStartAnalyze: () => void;
  onExploreFeatures: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAnalyze,
  onExploreFeatures,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-10 sm:pt-14 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(13,148,136,0.1),transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gemini Vision · Supabase · Nutrition AI</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold tracking-[0.2em] uppercase text-emerald-700">NutriVision AI</p>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                  Photograph a meal.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                    Get accurate nutrition.
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Upload a food photo and NutriVision identifies every item on the plate, estimates portions in grams, and returns calories, protein, carbs, fat, fiber, and sodium with clinical-grade AI vision.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onStartAnalyze}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Analyze Your Food</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={onExploreFeatures}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Features</span>
                </button>
              </div>

              {/* Mini Highlights */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/70">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">Multi-Food</p>
                  <p className="text-xs text-slate-500 font-medium">Atomic segmentation</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">Portion (g)</p>
                  <p className="text-xs text-slate-500 font-medium">Volumetric estimation</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">100% Real</p>
                  <p className="text-xs text-slate-500 font-medium">Live full-stack engine</p>
                </div>
              </div>
            </div>

            {/* Right Card: Multi-Food Detection Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="relative h-56 bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80"
                    alt="Traditional Indian Thali with multiple food components"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 px-2 py-0.5 rounded">
                        Multi-Food Vision Active
                      </span>
                      <p className="text-sm font-semibold mt-1">Multi-Item Indian Thali Plate</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">5 Foods Recognized</span>
                    <span className="text-emerald-700 font-bold">Total: 735 kcal</span>
                  </div>

                  {/* Detected Foods list */}
                  <div className="space-y-2">
                    {[
                      { name: 'Rice (Cooked White)', grams: '180g', conf: '95%', cals: '234 kcal', p: '4.9g' },
                      { name: 'Chicken Curry', grams: '140g', conf: '92%', cals: '231 kcal', p: '23.1g' },
                      { name: 'Dal (Yellow Moong)', grams: '150g', conf: '91%', cals: '158 kcal', p: '10.2g' },
                      { name: 'Green Salad', grams: '100g', conf: '88%', cals: '22 kcal', p: '1.0g' },
                      { name: 'Curd / Yogurt', grams: '120g', conf: '94%', cals: '73 kcal', p: '4.2g' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 text-xs border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <span className="text-[11px] text-slate-600">({item.grams})</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-slate-600 font-medium">{item.p} P</span>
                          <span className="font-bold text-slate-900">{item.cals}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={onStartAnalyze}
                    className="w-full py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Test This Detection Workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Disclaimer Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AcademicDisclaimer />
      </div>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-2.5 py-1 rounded-md">
            Pipeline Architecture
          </span>
          <h2 className="text-3xl font-bold text-slate-900">How NutriVision AI Works</h2>
          <p className="text-sm text-slate-600">
            A 5-stage multimodal computer vision and nutritional inference pipeline engineered for multi-component meals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            {
              step: '01',
              title: 'Image Capture',
              desc: 'Upload, capture via camera, or choose a meal photo in JPG, PNG, or WEBP.',
              icon: ScanLine,
            },
            {
              step: '02',
              title: 'Multi-Food AI',
              desc: 'Multimodal vision detects individual items rather than generic meal tags.',
              icon: Layers,
            },
            {
              step: '03',
              title: 'Portion Grams',
              desc: 'Estimates serving weight in grams per item with confidence ratings.',
              icon: Scale,
            },
            {
              step: '04',
              title: 'DB Calculation',
              desc: 'Computes exact calories, protein, carbs, fat, fiber, and sodium per 100g.',
              icon: Database,
            },
            {
              step: '05',
              title: 'Smart Insights',
              desc: 'Generates meal summaries, gap analysis, and tailored health suggestions.',
              icon: Sparkles,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 bg-white rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600 font-mono">{item.step}</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. MULTI-FOOD DETECTION SHOWCASE */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">
              Core AIML Contribution
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              True Multi-Food Detection, Not Generic Classification
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Standard food vision classifiers output a single label like “curry” or “dinner”. NutriVision AI decomposes complex plates into atomic constituents so each item receives its own weight and nutritional breakdown.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Atomic Recognition</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Separates staple grains (Rice, Roti) from protein curries (Chicken, Dal, Paneer), fermented dairy (Curd), and raw salads on a single plate.
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Interactive User Corrections</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Users can fine-tune portion weights with sliders, swap incorrectly classified foods, or add missing side items. All totals recompute in real time.
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Dynamic Recommendation Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates protein sufficiency, dietary fiber density, sodium load, and suggests healthier culinary alternatives tailored to user fitness goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES & TRACKING CAPABILITIES */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-2.5 py-1 rounded-md">
            Features
          </span>
          <h2 className="text-3xl font-bold text-slate-900">Comprehensive Nutrition Management</h2>
          <p className="text-sm text-slate-600">
            From image upload to daily calorie trend tracking and administrative food management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Multi-Food Recognition',
              desc: 'Identifies rice, lentils, curries, meats, breads, and condiments on the same dish.',
              icon: ScanLine,
            },
            {
              title: 'Portion & Grams Scaler',
              desc: 'Dynamic portion sliders automatically recalculate calories and grams across all macros.',
              icon: Scale,
            },
            {
              title: 'Daily & Weekly Trends',
              desc: 'Interactive Recharts visualizations showing calorie targets, macro splits, and consistency.',
              icon: TrendingUp,
            },
            {
              title: 'Indian & Global Cuisine DB',
              desc: 'Pre-populated with 40+ authentic dishes including Biryani, Dosa, Idli, Dal, Paneer, and Roti.',
              icon: Database,
            },
            {
              title: 'Personalized Daily Targets',
              desc: 'Harris-Benedict BMR & TDEE calculation based on age, gender, height, weight, and fitness goal.',
              icon: Activity,
            },
            {
              title: 'Admin Management Panel',
              desc: 'Manage nutrition database entries, review user activity logs, and monitor AI latency.',
              icon: ShieldCheck,
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Evaluation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Experience Intelligent Food Recognition Now
          </h2>

          <p className="max-w-xl mx-auto text-emerald-100 text-sm leading-relaxed">
            Upload your own food photo or test our multi-food Indian Thali preset with instant portion estimation and complete macro breakdown.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartAnalyze}
              className="px-6 py-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <ScanLine className="w-4 h-4 text-emerald-600" />
              <span>Analyze Food Now</span>
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="px-6 py-3 rounded-xl bg-emerald-800/60 hover:bg-emerald-800 text-white font-bold text-sm border border-emerald-400/40 transition-colors cursor-pointer"
            >
              Faculty / Student Sign In
            </button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-slate-200 pt-8 text-xs text-slate-500 text-center max-w-7xl mx-auto px-4 space-y-2">
        <p className="font-semibold text-slate-700">
          NutriVision AI — Intelligent Nutrition Analyzer from Food Images
        </p>
        <p>
          AIML Semester-Credit Capstone Project. Built with React, TypeScript, Tailwind CSS, Express, and Multimodal Vision AI.
        </p>
      </footer>
    </div>
  );
};
