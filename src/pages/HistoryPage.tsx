import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { FoodAnalysis } from '../types/index.js';
import {
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  Flame,
  Activity,
  AlertTriangle,
  PlusCircle,
  ScanLine,
} from 'lucide-react';

interface HistoryPageProps {
  onSelectMeal: (meal: FoodAnalysis) => void;
  onNavigateAnalyze: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectMeal, onNavigateAnalyze }) => {
  const [meals, setMeals] = useState<FoodAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory({
        search: search.trim() || undefined,
        meal_type: mealTypeFilter !== 'All' ? mealTypeFilter : undefined,
      });
      setMeals(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [mealTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteHistoryItem(id);
      setMeals(prev => prev.filter(m => m.id !== id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Meal History</h1>
          <p className="text-xs text-slate-500">Track and review all previous automated multi-food analyses</p>
        </div>

        <button
          onClick={onNavigateAnalyze}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ScanLine className="w-4 h-4" />
          <span>Analyze New Meal</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by meal name or food item (e.g. Rice, Dal, Chicken)..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
          </span>
          <select
            value={mealTypeFilter}
            onChange={e => setMealTypeFilter(e.target.value)}
            className="py-1.5 px-3 text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Meals</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
        </div>
      </div>

      {/* Meal List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Retrieving meal records...</p>
        </div>
      ) : meals.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No meal records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your search terms or upload a new food image to build your diary.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map(meal => (
            <div
              key={meal.id}
              onClick={() => onSelectMeal(meal)}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={meal.image_url}
                  alt={meal.meal_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {meal.meal_name}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {meal.meal_type}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {new Date(meal.timestamp).toLocaleDateString()} at{' '}
                    {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {meal.foods.map((f, i) => (
                      <span key={i} className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.2 rounded border border-slate-100">
                        {f.name.split(' ')[0]} ({f.estimated_portion_grams}g)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nutrition summary & delete button */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <p className="text-base font-extrabold text-slate-900">{meal.totals?.calories} kcal</p>
                  <p className="text-xs text-blue-700 font-semibold">{meal.totals?.protein_g}g Protein</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={e => handleDelete(meal.id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <span className="p-2 rounded-lg text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
