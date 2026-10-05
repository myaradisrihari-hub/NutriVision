import React, { useState, useEffect } from 'react';
import {
  DetectedFood,
  FoodAnalysis,
  FoodItem,
  MealTotals,
} from '../types/index.js';
import { api } from '../services/api.js';
import { AcademicDisclaimer } from '../components/AcademicDisclaimer.js';
import {
  CheckCircle2,
  Trash2,
  Edit2,
  PlusCircle,
  Sparkles,
  ArrowLeft,
  Printer,
  Scale,
  Activity,
  Layers,
  Search,
  Check,
  X,
  AlertTriangle,
  Lightbulb,
  Info,
  HelpCircle,
} from 'lucide-react';

interface AnalysisResultPageProps {
  analysisId: string;
  initialAnalysis?: FoodAnalysis;
  onBack: () => void;
  onAnalyzeAnother: () => void;
}

export const AnalysisResultPage: React.FC<AnalysisResultPageProps> = ({
  analysisId,
  initialAnalysis,
  onBack,
  onAnalyzeAnother,
}) => {
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(initialAnalysis || null);
  const [loading, setLoading] = useState(!initialAnalysis);
  const [error, setError] = useState<string | null>(null);

  // Editing state for individual food items
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editGrams, setEditGrams] = useState<number>(100);
  const [editName, setEditName] = useState<string>('');

  // Add missing food modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [customFoodName, setCustomFoodName] = useState('');
  const [availableFoods, setAvailableFoods] = useState<FoodItem[]>([]);
  const [addGrams, setAddGrams] = useState<number>(100);
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalysis() {
      if (!analysisId) return;
      try {
        setLoading(true);
        const data = await api.getAnalysis(analysisId);
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load meal analysis.');
      } finally {
        setLoading(false);
      }
    }

    if (!analysis || analysis.id !== analysisId) {
      loadAnalysis();
    }
  }, [analysisId]);

  useEffect(() => {
    async function loadFoodDB() {
      try {
        const items = await api.getFoods();
        setAvailableFoods(items);
      } catch (err) {
        console.warn('Could not load food DB for search:', err);
      }
    }
    loadFoodDB();
  }, []);

  const handleStartEdit = (food: DetectedFood) => {
    setEditingFoodId(food.id);
    setEditGrams(food.estimated_portion_grams);
    setEditName(food.name);
  };

  const getLiveEditPreview = (currentFood: DetectedFood) => {
    const safeGrams = Math.max(1, editGrams);
    const query = editName.trim().toLowerCase();
    const factor = safeGrams / 100;

    // Search in available reference foods
    const exact = availableFoods.find(f => f.name.toLowerCase() === query);
    const partial = availableFoods.find(
      f => f.name.toLowerCase().includes(query) || (query.length > 2 && query.includes(f.name.toLowerCase().split(' ')[0]))
    );
    const matched = exact || partial;

    if (matched) {
      return {
        name: matched.name,
        category: matched.category,
        calories: Math.round(matched.calories * factor),
        protein_g: Number((matched.protein_g * factor).toFixed(1)),
        carbohydrates_g: Number((matched.carbohydrates_g * factor).toFixed(1)),
        fat_g: Number((matched.fat_g * factor).toFixed(1)),
        status: 'verified' as const,
        source: `Verified DB: ${matched.name}`,
      };
    }

    // If query has changed from currentFood name and not in database
    if (query !== currentFood.name.toLowerCase()) {
      return {
        name: editName.trim(),
        category: 'Custom / Unlisted Food',
        calories: 0,
        protein_g: 0,
        carbohydrates_g: 0,
        fat_g: 0,
        status: 'unavailable' as const,
        source: 'Unlisted item (will be estimated or marked unavailable)',
      };
    }

    // Same food, scaled portion
    const oldGrams = Math.max(1, currentFood.estimated_portion_grams || 100);
    const ratio = safeGrams / oldGrams;
    return {
      name: currentFood.name,
      category: currentFood.category || 'Estimated',
      calories: Math.round(currentFood.calories * ratio),
      protein_g: Number((currentFood.protein_g * ratio).toFixed(1)),
      carbohydrates_g: Number((currentFood.carbohydrates_g * ratio).toFixed(1)),
      fat_g: Number((currentFood.fat_g * ratio).toFixed(1)),
      status: currentFood.nutrition_status,
      source: currentFood.food_item_id ? 'Verified Reference' : 'Visual Vision Estimate',
    };
  };

  const handleSaveEdit = async (foodId: string) => {
    if (!analysis) return;
    if (editGrams <= 0) {
      alert('Portion grams must be greater than zero.');
      return;
    }
    if (!editName.trim()) {
      alert('Food name cannot be empty.');
      return;
    }

    try {
      setIsUpdating(true);
      const updated = await api.updateDetectedFood(analysis.id, foodId, editGrams, editName.trim());
      setAnalysis(updated);
      setEditingFoodId(null);
      showToast('Food updated and meal nutrition recalculated!');
    } catch (err: any) {
      alert(err.message || 'Failed to update food item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveFood = async (foodId: string) => {
    if (!analysis) return;
    if (analysis.foods.length <= 1) {
      if (!confirm('This is the only food in the meal. Are you sure you want to remove it?')) {
        return;
      }
    }

    try {
      setIsUpdating(true);
      const updated = await api.removeDetectedFood(analysis.id, foodId);
      setAnalysis(updated);
      showToast('Item removed and totals recalculated.');
    } catch (err: any) {
      alert(err.message || 'Failed to remove food item');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMissingFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysis || !customFoodName.trim()) {
      alert('Please enter a food name.');
      return;
    }

    try {
      setIsUpdating(true);
      const updated = await api.addDetectedFood(analysis.id, customFoodName.trim(), addGrams);
      setAnalysis(updated);
      setAddModalOpen(false);
      setCustomFoodName('');
      setAddGrams(100);
      showToast(`Added ${customFoodName} to meal!`);
    } catch (err: any) {
      alert(err.message || 'Failed to add food item');
    } finally {
      setIsUpdating(false);
    }
  };

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered food suggestions for free-text input
  const suggestions = customFoodName.trim()
    ? availableFoods.filter(f => f.name.toLowerCase().includes(customFoodName.toLowerCase())).slice(0, 4)
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading open-ended meal analysis...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Analysis Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Unable to retrieve this meal record.'}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { totals, foods } = analysis;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 print:p-0">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {analysis.meal_name || analysis.meal_description || 'Meal Analysis Report'}
              </h1>
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                {analysis.meal_type}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyzed {new Date(analysis.timestamp).toLocaleDateString()} at{' '}
              {new Date(analysis.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
              <span className="font-medium text-slate-700">{analysis.ai_provider || 'Open-Ended Vision AI'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onAnalyzeAnother}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Analyze Another Meal</span>
          </button>
        </div>
      </div>

      <AcademicDisclaimer />

      {/* Grid: Meal Image & Complete Meal Nutrition Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Meal Image Preview & Detection Overview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="relative h-72 sm:h-80 bg-slate-900">
              <img
                src={analysis.image_url}
                alt={analysis.meal_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 px-2 py-0.5 rounded">
                    {foods.length} Distinct Food Items Detected
                  </span>
                  <p className="text-xs text-slate-200">
                    Open-Ended Scan across plate components
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Vision Engine:</span>
              <span className="font-mono text-slate-700">{analysis.ai_provider || 'Multimodal AI'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Complete Meal Nutrition Cards */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase">
                  Aggregated Totals
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">Complete Meal Nutrition</h2>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-emerald-600">{totals.calories}</span>
                <span className="text-xs font-bold text-slate-500 block">Total kcal</span>
              </div>
            </div>

            {/* Core Macronutrient Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Protein</span>
                <p className="text-2xl font-extrabold text-blue-900 mt-1">{totals.protein_g} <span className="text-xs font-semibold">g</span></p>
                <span className="text-[10px] text-blue-600">{Math.round((totals.protein_g * 4 / Math.max(1, totals.calories)) * 100)}% of calories</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Carbs</span>
                <p className="text-2xl font-extrabold text-amber-900 mt-1">{totals.carbohydrates_g} <span className="text-xs font-semibold">g</span></p>
                <span className="text-[10px] text-amber-600">{Math.round((totals.carbohydrates_g * 4 / Math.max(1, totals.calories)) * 100)}% of calories</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Fat</span>
                <p className="text-2xl font-extrabold text-rose-900 mt-1">{totals.fat_g} <span className="text-xs font-semibold">g</span></p>
                <span className="text-[10px] text-rose-600">{Math.round((totals.fat_g * 9 / Math.max(1, totals.calories)) * 100)}% of calories</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Fiber</span>
                <p className="text-2xl font-extrabold text-emerald-900 mt-1">{totals.fiber_g} <span className="text-xs font-semibold">g</span></p>
                <span className="text-[10px] text-emerald-600">Digestive Quality</span>
              </div>
            </div>

            {/* Micronutrient Details */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Sugar:</span>
                <span className="font-bold text-slate-900">{totals.sugar_g} g</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Sodium:</span>
                <span className="font-bold text-slate-900">{totals.sodium_mg} mg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Food Estimation Notice */}
      <div className="rounded-xl border border-amber-200/90 bg-amber-50/80 p-3.5 text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-950">
            Intelligent Dynamic Nutrition Calculation
          </p>
          <p className="text-amber-900 font-medium">
            “Nutrition values are estimates and may vary depending on ingredients, preparation method and portion size.”
          </p>
          <p className="text-amber-800 text-[11px]">
            Each detected food item is calculated individually from its specific reference values and scaled to estimated portion weight. Changing food items triggers fresh nutritional lookup.
          </p>
        </div>
      </div>

      {/* DYNAMIC FOOD RESULT CARDS & OPEN-ENDED CORRECTIONS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">Food Items Detected in Plate</h2>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                {foods.length} items
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Open-ended multimodal detections. Adjust portion weights, edit names, or add missing foods.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Add Missing Food</span>
          </button>
        </div>

        {/* Dynamic Cards: Render whatever foods the AI detected */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {foods.map((food) => {
            const isEditing = editingFoodId === food.id;
            const isLowConfidence = (food.confidence || 0.9) < 0.70;
            const isUnavailable = food.nutrition_status === 'unavailable';
            const isEstimated = food.nutrition_status === 'estimated';

            return (
              <div
                key={food.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header of Food Card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900">{food.name}</h3>
                      {food.is_manual_edit && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-100">
                          Custom Edit
                        </span>
                      )}
                      {isLowConfidence && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Low Confidence ({Math.round((food.confidence || 0.5) * 100)}%)</span>
                        </span>
                      )}
                    </div>

                    {food.description && (
                      <p className="text-xs text-slate-500 italic line-clamp-1">{food.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {food.estimated_portion_grams} {food.unit || 'g'} estimated
                      </span>
                      <span>•</span>
                      <span>{Math.round((food.confidence || 0.9) * 100)}% confidence</span>
                      <span>•</span>
                      {isUnavailable ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                          Nutrition Unavailable
                        </span>
                      ) : isEstimated ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                          Estimated Nutrition
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          Verified Reference
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(food)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Edit name or portion"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveFood(food.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove food"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Editing Controls */}
                {isEditing ? (() => {
                  const preview = getLiveEditPreview(food);
                  return (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-emerald-200 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Food Name (Select from database or enter custom name)
                          </label>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {preview.status === 'verified' ? '✓ Verified Reference' : '⚡ Dynamic Lookup'}
                          </span>
                        </div>
                        <input
                          type="text"
                          list="available-foods-datalist"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          placeholder="Search food item (e.g. Rice, Chicken Curry, Dal, Apple)..."
                          className="w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-slate-700">
                            Serving Weight in Grams
                          </label>
                          <span className="text-[10px] text-slate-500">
                            Dynamically recalculates all nutrients
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="10"
                            max="600"
                            step="5"
                            value={editGrams}
                            onChange={e => setEditGrams(parseInt(e.target.value, 10))}
                            className="flex-1 accent-emerald-600 cursor-pointer"
                          />
                          <div className="w-20 relative">
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              value={editGrams}
                              onChange={e => setEditGrams(Math.max(1, parseInt(e.target.value, 10) || 1))}
                              className="w-full py-1 px-2 text-xs font-bold text-center border border-slate-300 rounded-lg bg-white"
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600">g</span>
                        </div>
                      </div>

                      {/* Live Calculated Nutrition Preview */}
                      <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Live Calculated Nutrition ({editGrams}g):</span>
                          </span>
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            {preview.source}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5 text-center">
                          <div className="p-1 rounded bg-slate-50 border border-slate-100">
                            <span className="text-[9px] text-slate-500 uppercase block font-semibold">Calories</span>
                            <span className="text-xs font-extrabold text-slate-900">{preview.calories} kcal</span>
                          </div>
                          <div className="p-1 rounded bg-blue-50/60 border border-blue-100">
                            <span className="text-[9px] text-blue-700 uppercase block font-semibold">Protein</span>
                            <span className="text-xs font-bold text-blue-800">{preview.protein_g}g</span>
                          </div>
                          <div className="p-1 rounded bg-amber-50/60 border border-amber-100">
                            <span className="text-[9px] text-amber-700 uppercase block font-semibold">Carbs</span>
                            <span className="text-xs font-bold text-amber-800">{preview.carbohydrates_g}g</span>
                          </div>
                          <div className="p-1 rounded bg-rose-50/60 border border-rose-100">
                            <span className="text-[9px] text-rose-700 uppercase block font-semibold">Fat</span>
                            <span className="text-xs font-bold text-rose-800">{preview.fat_g}g</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingFoodId(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(food.id)}
                          disabled={isUpdating}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Update & Recalculate</span>
                        </button>
                      </div>
                    </div>
                  );
                })() : isUnavailable ? (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center justify-between">
                    <span className="italic">Nutrition information unavailable for this item.</span>
                    <button
                      onClick={() => handleStartEdit(food)}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Edit Details
                    </button>
                  </div>
                ) : (
                  /* Macro breakdown grid for this item */
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Calories</span>
                      <span className="text-xs font-extrabold text-slate-900">{food.calories} kcal</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Protein</span>
                      <span className="text-xs font-bold text-blue-700">{food.protein_g}g</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Carbs</span>
                      <span className="text-xs font-bold text-amber-700">{food.carbohydrates_g}g</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Fat</span>
                      <span className="text-xs font-bold text-rose-700">{food.fat_g}g</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 20 & 21: NUTRITION SUMMARY & RECOMMENDATIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Nutritional Assessment & Recommendations</h2>
            <p className="text-xs text-slate-500">Automated insights formulated across all recognized plate items</p>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed font-medium">
          {analysis.summary}
        </div>

        {/* Positive observations & gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Positive Observations</span>
            </h3>
            <ul className="space-y-2">
              {(analysis.positive_observations || [
                'Diverse components supporting micronutrient variety.',
              ]).map((obs, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Nutritional Considerations & Gaps</span>
            </h3>
            <ul className="space-y-2">
              {(analysis.nutritional_gaps || [
                'Review dietary fiber and hydration alongside this meal.',
              ]).map((gap, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations & Healthier Alternatives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>Practical Recommendations</span>
            </h3>
            <div className="space-y-2">
              {(analysis.recommendations || ['Stay well-hydrated throughout the day.']).map((rec, idx) => (
                <p key={idx} className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {rec}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Healthier Culinary Alternatives</span>
            </h3>
            <div className="space-y-2">
              {(analysis.healthier_alternatives || [
                'Opt for whole grain bases and minimally processed seasonings when possible.',
              ]).map((alt, idx) => (
                <p key={idx} className="text-xs text-slate-600 bg-teal-50/40 p-2.5 rounded-lg border border-teal-100/60">
                  {alt}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD MISSING FOOD ITEM (FREE-TEXT ENTRY) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Missing Food to Meal</h3>
                <p className="text-xs text-slate-500">Type any food or dish name (free-text)</p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMissingFood} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Food Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="available-foods-datalist"
                    value={customFoodName}
                    onChange={e => setCustomFoodName(e.target.value)}
                    placeholder="e.g. Avocado Toast, Pepperoni Pizza, Samosa, Soup..."
                    className="w-full py-2.5 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-medium"
                  />
                </div>

                {/* Suggestions if typed */}
                {suggestions.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-slate-600 self-center">Suggestions:</span>
                    {suggestions.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setCustomFoodName(s.name)}
                        className="text-[10px] bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Portion Weight (grams)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="600"
                    step="5"
                    value={addGrams}
                    onChange={e => setAddGrams(parseInt(e.target.value, 10))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={addGrams}
                      onChange={e => setAddGrams(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full py-1.5 px-2 text-xs font-bold text-center border border-slate-200 rounded-lg"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">g</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add to Meal & Recalculate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Autocomplete datalist for available verified reference foods */}
      <datalist id="available-foods-datalist">
        {availableFoods.map(f => (
          <option key={f.id} value={f.name}>
            {f.category} — {f.calories} kcal/100g (P: {f.protein_g}g, C: {f.carbohydrates_g}g, F: {f.fat_g}g)
          </option>
        ))}
      </datalist>
    </div>
  );
};
