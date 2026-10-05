import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { AdminStatistics, FoodItem, User, FoodAnalysis } from '../types/index.js';
import {
  ShieldAlert,
  Users,
  Database,
  ScanLine,
  Activity,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Sparkles,
  Server,
  Cpu,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'foods' | 'users' | 'analyses' | 'system'>('foods');
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analyses, setAnalyses] = useState<FoodAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  // Food search & filter
  const [foodSearch, setFoodSearch] = useState('');
  const [foodCategory, setFoodCategory] = useState('All');

  // Food add/edit modal
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [foodForm, setFoodForm] = useState({
    name: '',
    category: 'Grains',
    calories: 100,
    protein_g: 5,
    carbohydrates_g: 20,
    fat_g: 2,
    fiber_g: 2,
    sugar_g: 1,
    sodium_mg: 100,
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [s, f, u, a] = await Promise.all([
        api.getAdminStats(),
        api.getFoods(),
        api.getAdminUsers(),
        api.getAdminAnalyses(),
      ]);
      setStats(s);
      setFoods(f);
      setUsers(u);
      setAnalyses(a);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenAdd = () => {
    setIsAddMode(true);
    setEditingFood(null);
    setFoodForm({
      name: '',
      category: 'Grains',
      calories: 120,
      protein_g: 4,
      carbohydrates_g: 22,
      fat_g: 2,
      fiber_g: 2,
      sugar_g: 1,
      sodium_mg: 100,
    });
  };

  const handleOpenEdit = (food: FoodItem) => {
    setIsAddMode(false);
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      category: food.category,
      calories: food.calories,
      protein_g: food.protein_g,
      carbohydrates_g: food.carbohydrates_g,
      fat_g: food.fat_g,
      fiber_g: food.fiber_g,
      sugar_g: food.sugar_g,
      sodium_mg: food.sodium_mg,
    });
  };

  const handleSaveFoodForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAddMode) {
        const created = await api.createAdminFood({
          ...foodForm,
          serving_size: 100,
          serving_unit: 'g',
        });
        setFoods(prev => [created, ...prev]);
      } else if (editingFood) {
        const updated = await api.updateAdminFood(editingFood.id, foodForm);
        setFoods(prev => prev.map(f => (f.id === updated.id ? updated : f)));
      }
      setIsAddMode(false);
      setEditingFood(null);
      // Refresh stats
      const s = await api.getAdminStats();
      setStats(s);
    } catch (err: any) {
      alert(err.message || 'Error saving food');
    }
  };

  const handleDeleteFood = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food item from the database?')) return;
    try {
      await api.deleteAdminFood(id);
      setFoods(prev => prev.filter(f => f.id !== id));
      const s = await api.getAdminStats();
      setStats(s);
    } catch (err: any) {
      alert(err.message || 'Error deleting food item');
    }
  };

  const filteredFoods = foods.filter(f => {
    const matchQuery =
      f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(foodSearch.toLowerCase());
    const matchCat = foodCategory === 'All' || f.category.toLowerCase() === foodCategory.toLowerCase();
    return matchQuery && matchCat;
  });

  const categories = ['All', ...Array.from(new Set(foods.map(f => f.category)))];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Loading admin console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin & Faculty Console</h1>
          <p className="text-xs text-slate-500">
            NutriVision AI system governance, food dataset curator, and evaluation logs
          </p>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.total_users || 0}</p>
          <span className="text-[10px] text-slate-400">Active accounts</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Total Meals Analyzed</span>
            <ScanLine className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.total_analyses || 0}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">
            +{stats?.analyses_today || 0} analyzed today
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Food Database Items</span>
            <Database className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.total_food_items || 0}</p>
          <span className="text-[10px] text-slate-400">Nutritional references</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Avg Meal Calories</span>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats?.avg_meal_calories || 0}</p>
          <span className="text-[10px] text-slate-400">kcal per meal</span>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-xs">
        <button
          onClick={() => setActiveTab('foods')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'foods' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Food Database ({foods.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'users' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('analyses')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'analyses' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All System Analyses ({analyses.length})
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'system' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          AI Pipeline & Diagnostics
        </button>
      </div>

      {/* TAB 1: FOOD DATABASE MANAGEMENT */}
      {activeTab === 'foods' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={foodSearch}
                  onChange={e => setFoodSearch(e.target.value)}
                  placeholder="Search food item..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <select
                value={foodCategory}
                onChange={e => setFoodCategory(e.target.value)}
                className="py-1.5 px-3 text-xs border border-slate-200 rounded-lg bg-white"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Food Item</span>
            </button>
          </div>

          {/* Foods Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Calories / 100g</th>
                  <th className="py-2.5 px-3">Protein</th>
                  <th className="py-2.5 px-3">Carbs</th>
                  <th className="py-2.5 px-3">Fat</th>
                  <th className="py-2.5 px-3">Fiber</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFoods.slice(0, 30).map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-800">{f.name}</td>
                    <td className="py-2 px-3 text-slate-500">{f.category}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">{f.calories} kcal</td>
                    <td className="py-2 px-3 text-blue-700 font-semibold">{f.protein_g}g</td>
                    <td className="py-2 px-3 text-amber-700">{f.carbohydrates_g}g</td>
                    <td className="py-2 px-3 text-rose-700">{f.fat_g}g</td>
                    <td className="py-2 px-3 text-emerald-700">{f.fiber_g}g</td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(f)}
                          className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFood(f.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Registered Accounts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Fitness Goal</th>
                  <th className="py-2.5 px-3">Daily Calorie Target</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-800">{u.name}</td>
                    <td className="py-2 px-3 text-slate-600">{u.email}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{u.profile?.fitness_goal || 'General Health'}</td>
                    <td className="py-2 px-3 font-semibold text-emerald-700">
                      {u.profile?.daily_calorie_target || 2000} kcal
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ALL SYSTEM ANALYSES */}
      {activeTab === 'analyses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">System-wide Meal Analysis Logs</h2>
          <div className="space-y-3">
            {analyses.map(a => (
              <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={a.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-slate-900">{a.meal_name}</p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(a.timestamp).toLocaleString()} • {a.foods.length} foods detected
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-700">{a.totals?.calories} kcal</p>
                  <p className="text-[10px] text-slate-500">{a.ai_provider}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM & AI DIAGNOSTICS */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Server className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">AI Vision Architecture & Health</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Primary AI Engine</h3>
              <p className="text-sm font-semibold text-slate-900">{stats?.ai_provider_status?.provider}</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">{stats?.ai_provider_status?.status}</span>
                <span className="text-xs text-slate-400">• Latency ~{stats?.ai_provider_status?.latency_ms} ms</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Most Recognized Foods</h3>
              <div className="flex flex-wrap gap-1.5">
                {(stats?.popular_detected_foods || []).map((p, i) => (
                  <span key={i} className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    {p.name} ({p.count})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FOOD ITEM */}
      {(isAddMode || editingFood) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {isAddMode ? 'Add New Food Item' : `Edit Food Item: ${editingFood?.name}`}
              </h3>
              <button
                onClick={() => { setIsAddMode(false); setEditingFood(null); }}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFoodForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Food Name</label>
                  <input
                    type="text"
                    required
                    value={foodForm.name}
                    onChange={e => setFoodForm({ ...foodForm, name: e.target.value })}
                    className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={foodForm.category}
                    onChange={e => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Calories / 100g</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={foodForm.calories}
                    onChange={e => setFoodForm({ ...foodForm, calories: parseFloat(e.target.value) || 0 })}
                    className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={foodForm.protein_g}
                    onChange={e => setFoodForm({ ...foodForm, protein_g: parseFloat(e.target.value) || 0 })}
                    className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Carbohydrates (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={foodForm.carbohydrates_g}
                    onChange={e => setFoodForm({ ...foodForm, carbohydrates_g: parseFloat(e.target.value) || 0 })}
                    className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={foodForm.fat_g}
                    onChange={e => setFoodForm({ ...foodForm, fat_g: parseFloat(e.target.value) || 0 })}
                    className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={foodForm.fiber_g}
                    onChange={e => setFoodForm({ ...foodForm, fiber_g: parseFloat(e.target.value) || 0 })}
                    className="w-full py-1.5 px-3 text-xs border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsAddMode(false); setEditingFood(null); }}
                  className="px-3.5 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  {isAddMode ? 'Add to Database' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
