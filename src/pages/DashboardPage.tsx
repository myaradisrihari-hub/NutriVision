import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { FoodAnalysis, WeeklyAnalyticsData } from '../types/index.js';
import {
  ScanLine,
  Flame,
  Activity,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface DashboardPageProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, profile } = useAuth();
  const [recentMeals, setRecentMeals] = useState<FoodAnalysis[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [meals, weekly] = await Promise.all([
          api.getHistory(),
          api.getWeeklyAnalytics(7),
        ]);
        setRecentMeals(meals);
        setWeeklyData(weekly);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Compute today's totals
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayMeals = recentMeals.filter(m => m.timestamp.startsWith(todayDateStr));

  const todayCalories = todayMeals.reduce((s, m) => s + (m.totals?.calories || 0), 0);
  const todayProtein = Number(todayMeals.reduce((s, m) => s + (m.totals?.protein_g || 0), 0).toFixed(1));
  const todayCarbs = Number(todayMeals.reduce((s, m) => s + (m.totals?.carbohydrates_g || 0), 0).toFixed(1));
  const todayFat = Number(todayMeals.reduce((s, m) => s + (m.totals?.fat_g || 0), 0).toFixed(1));
  const todayFiber = Number(todayMeals.reduce((s, m) => s + (m.totals?.fiber_g || 0), 0).toFixed(1));

  // Targets from profile or defaults
  const calorieTarget = profile?.daily_calorie_target || 2200;
  const proteinTarget = profile?.daily_protein_target || 90;
  const carbsTarget = profile?.daily_carbs_target || 260;
  const fatTarget = profile?.daily_fat_target || 65;
  const fiberTarget = profile?.daily_fiber_target || 30;

  const caloriePct = Math.min(100, Math.round((todayCalories / calorieTarget) * 100));
  const proteinPct = Math.min(100, Math.round((todayProtein / proteinTarget) * 100));
  const carbsPct = Math.min(100, Math.round((todayCarbs / carbsTarget) * 100));
  const fatPct = Math.min(100, Math.round((todayFat / fatTarget) * 100));
  const fiberPct = Math.min(100, Math.round((todayFiber / fiberTarget) * 100));

  // Macro pie data
  const macroPieData = [
    { name: 'Protein', value: todayProtein * 4 || 1, color: '#2563eb' },
    { name: 'Carbs', value: todayCarbs * 4 || 1, color: '#f59e0b' },
    { name: 'Fat', value: todayFat * 9 || 1, color: '#e11d48' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Gathering your nutrition dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Welcome & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good day, {user?.name?.split(' ')[0]}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {profile?.fitness_goal || 'General Health'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {todayMeals.length > 0
              ? `You have logged ${todayMeals.length} meal${todayMeals.length > 1 ? 's' : ''} today. Keep up the balance!`
              : 'No meals logged yet today. Snap your first plate to monitor nutrition.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('analyze')}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
        >
          <ScanLine className="w-4 h-4" />
          <span>Quick Analyze Meal</span>
        </button>
      </div>

      {/* TODAY'S TARGET PROGRESS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Calories Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Today's Calories</span>
            <Flame className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{todayCalories}</span>
            <span className="text-xs text-slate-500">/ {calorieTarget} kcal</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${caloriePct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 font-medium">
              <span>{caloriePct}% of daily goal</span>
              <span>{Math.max(0, calorieTarget - todayCalories)} kcal left</span>
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Protein</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-900">{todayProtein}</span>
            <span className="text-xs text-slate-500">/ {proteinTarget} g</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 font-medium">
              <span>{proteinPct}% target</span>
              <span>{Math.max(0, Math.round(proteinTarget - todayProtein))}g left</span>
            </div>
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Carbohydrates</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">{todayCarbs}</span>
            <span className="text-xs text-slate-500">/ {carbsTarget} g</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${carbsPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 font-medium">
              <span>{carbsPct}% target</span>
              <span>{Math.max(0, Math.round(carbsTarget - todayCarbs))}g left</span>
            </div>
          </div>
        </div>

        {/* Fat Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Healthy Fats</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-900">{todayFat}</span>
            <span className="text-xs text-slate-500">/ {fatTarget} g</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${fatPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 font-medium">
              <span>{fatPct}% target</span>
              <span>{Math.max(0, Math.round(fatTarget - todayFat))}g left</span>
            </div>
          </div>
        </div>

        {/* Fiber Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Dietary Fiber</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{todayFiber}</span>
            <span className="text-xs text-slate-500">/ {fiberTarget} g</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${fiberPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 font-medium">
              <span>{fiberPct}% target</span>
              <span>{Math.max(0, Math.round(fiberTarget - todayFiber))}g left</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS ROW: 7-DAY CALORIE INTAKE & MACRO DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Calorie Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Weekly Calorie Intake Trend</h2>
              <p className="text-xs text-slate-500">Daily energy consumption vs your {calorieTarget} kcal target</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Detailed Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            {weeklyData?.days ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData.days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day_name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(val: any) => [`${val} kcal`, 'Calories']}
                  />
                  <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                    {weeklyData.days.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.calories >= calorieTarget ? '#059669' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No weekly data recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Macronutrient Distribution */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Today's Macro Split</h2>
            <p className="text-xs text-slate-500">Caloric ratio from P / C / F</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            {todayCalories > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {macroPieData.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any, name: any) => [`${Math.round(Number(val))} kcal`, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">
                Log a meal to see today's macronutrient ratio
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div>
              <span className="text-[10px] font-bold text-blue-700 block">Protein</span>
              <span className="text-xs font-extrabold text-slate-900">{todayProtein}g</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 block">Carbs</span>
              <span className="text-xs font-extrabold text-slate-900">{todayCarbs}g</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-700 block">Fat</span>
              <span className="text-xs font-extrabold text-slate-900">{todayFat}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT MEALS & EMPTY STATE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Recent Analyzed Meals</h2>
            <p className="text-xs text-slate-500">Click any meal to review detected items or fine-tune portions</p>
          </div>

          {recentMeals.length > 0 && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentMeals.length === 0 ? (
          /* Empty state as mandated by Section 10 */
          <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ScanLine className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No meals analyzed yet.</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Snap or upload a photo of your food to unlock multi-food detection, portion weights, and macro analytics.
              </p>
            </div>
            <button
              onClick={() => onNavigate('analyze')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Analyze Your First Meal</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentMeals.slice(0, 6).map(meal => (
              <div
                key={meal.id}
                onClick={() => onNavigate('analysis-detail', { analysisId: meal.id, analysis: meal })}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col"
              >
                <div className="relative h-44 bg-slate-900">
                  <img
                    src={meal.image_url}
                    alt={meal.meal_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                    {meal.meal_type}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white font-mono text-xs font-bold">
                    {meal.totals?.calories} kcal
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {meal.meal_name}
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      {new Date(meal.timestamp).toLocaleDateString()} • {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Food badges */}
                  <div className="flex flex-wrap gap-1">
                    {meal.foods.slice(0, 4).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {f.name.split(' ')[0]} ({f.estimated_portion_grams}g)
                      </span>
                    ))}
                    {meal.foods.length > 4 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        +{meal.foods.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-blue-700">{meal.totals?.protein_g}g Protein</span>
                    <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Review <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
