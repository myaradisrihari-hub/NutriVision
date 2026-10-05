import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { WeeklyAnalyticsData } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  Activity,
  Flame,
  CheckCircle2,
  Info,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { profile } = useAuth();
  const [timeRange, setTimeRange] = useState<7 | 30>(7);
  const [analytics, setAnalytics] = useState<WeeklyAnalyticsData | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const calorieTarget = profile?.daily_calorie_target || 2200;
  const proteinTarget = profile?.daily_protein_target || 90;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [data, recs] = await Promise.all([
          api.getWeeklyAnalytics(timeRange),
          api.getRecommendations(),
        ]);
        setAnalytics(data);
        setRecommendations(recs.recommendations || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [timeRange]);

  const macroPieData = analytics?.macro_percentages
    ? [
        { name: 'Protein', value: analytics.macro_percentages.protein, color: '#2563eb' },
        { name: 'Carbs', value: analytics.macro_percentages.carbs, color: '#f59e0b' },
        { name: 'Fat', value: analytics.macro_percentages.fat, color: '#e11d48' },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nutrition Analytics</h1>
          <p className="text-xs text-slate-500">
            Longitudinal trend evaluation of calorie targets and macronutrient consistency
          </p>
        </div>

        {/* 7 Days vs 30 Days Toggle */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              timeRange === 7 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              timeRange === 30 ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 30 Days
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Daily Avg Calories</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {analytics?.averages?.calories || 0} <span className="text-xs font-semibold text-slate-500">kcal</span>
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">Target: {calorieTarget} kcal</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Daily Avg Protein</span>
          <p className="text-2xl font-extrabold text-blue-900 mt-1">
            {analytics?.averages?.protein || 0} <span className="text-xs font-semibold">g</span>
          </p>
          <span className="text-[10px] text-blue-600 font-semibold">Target: {proteinTarget} g</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Daily Avg Carbs</span>
          <p className="text-2xl font-extrabold text-amber-900 mt-1">
            {analytics?.averages?.carbs || 0} <span className="text-xs font-semibold">g</span>
          </p>
          <span className="text-[10px] text-amber-600 font-semibold">Energy Source</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Daily Avg Fiber</span>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">
            {analytics?.averages?.fiber || 0} <span className="text-xs font-semibold">g</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Digestive Quality</span>
        </div>
      </div>

      {/* CHART 1: DAILY CALORIE BAR CHART WITH TARGET REFERENCE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Daily Calorie Intake vs Target</h2>
          <p className="text-xs text-slate-500">Green reference line marks your recommended {calorieTarget} kcal daily ceiling</p>
        </div>

        <div className="h-72 w-full">
          {analytics?.days ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.days} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey={timeRange === 7 ? 'day_name' : 'date'} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(val: any) => [`${val} kcal`, 'Calories']}
                />
                <ReferenceLine y={calorieTarget} stroke="#059669" strokeDasharray="4 4" label={{ value: 'Target', fill: '#059669', fontSize: 11 }} />
                <Bar dataKey="calories" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
          )}
        </div>
      </div>

      {/* CHART 2: MULTI-MACRO TRENDS (PROTEIN, CARBS, FAT, FIBER) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Macronutrient Trends (Grams)</h2>
          <p className="text-xs text-slate-500">Track balance between Protein (Blue), Carbs (Amber), Fat (Rose), and Fiber (Green)</p>
        </div>

        <div className="h-80 w-full">
          {analytics?.days ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.days} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey={timeRange === 7 ? 'day_name' : 'date'} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(val: any, name: any) => [`${val}g`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="protein" name="Protein (g)" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="carbs" name="Carbohydrates (g)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="fat" name="Fat (g)" stroke="#e11d48" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="fiber" name="Fiber (g)" stroke="#059669" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading chart...</div>
          )}
        </div>
      </div>

      {/* MACRO BREAKDOWN & RECOMMENDATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Caloric Macro Ratio */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Macronutrient Calorie Ratio</h2>
            <p className="text-xs text-slate-500">Average energy contribution over past {timeRange} days</p>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {macroPieData.map((entry, index) => (
                    <Cell key={`slice-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`${val}%`, 'Calories']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50/60">
              <span className="text-[10px] font-bold text-blue-700 block">Protein</span>
              <span className="text-sm font-extrabold text-blue-900">{analytics?.macro_percentages?.protein || 0}%</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50/60">
              <span className="text-[10px] font-bold text-amber-700 block">Carbs</span>
              <span className="text-sm font-extrabold text-amber-900">{analytics?.macro_percentages?.carbs || 0}%</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-50/60">
              <span className="text-[10px] font-bold text-rose-700 block">Fat</span>
              <span className="text-sm font-extrabold text-rose-900">{analytics?.macro_percentages?.fat || 0}%</span>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Tailored Nutrition Advice</h2>
              <p className="text-xs text-slate-500">Based on your {profile?.fitness_goal || 'General Health'} target</p>
            </div>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                    rec.priority === 'High' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {rec.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
