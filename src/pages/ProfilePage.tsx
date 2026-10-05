import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  UserProfile,
  ActivityLevel,
  DietaryPreference,
  FitnessGoal,
} from '../types/index.js';
import { AcademicDisclaimer } from '../components/AcademicDisclaimer.js';
import {
  User as UserIcon,
  Calculator,
  Save,
  CheckCircle2,
  Sparkles,
  Scale,
  Activity,
  Heart,
  Droplet,
  Info,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useAuth();

  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age || 24);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(profile?.gender || 'Male');
  const [heightCm, setHeightCm] = useState(profile?.height_cm || 172);
  const [weightKg, setWeightKg] = useState(profile?.weight_kg || 68);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile?.activity_level || 'Moderately Active'
  );
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(
    profile?.dietary_preference || 'Non-Vegetarian'
  );
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(
    profile?.fitness_goal || 'General Health'
  );

  // Targets
  const [calorieTarget, setCalorieTarget] = useState(profile?.daily_calorie_target || 2200);
  const [proteinTarget, setProteinTarget] = useState(profile?.daily_protein_target || 90);
  const [carbsTarget, setCarbsTarget] = useState(profile?.daily_carbs_target || 260);
  const [fatTarget, setFatTarget] = useState(profile?.daily_fat_target || 65);
  const [fiberTarget, setFiberTarget] = useState(profile?.daily_fiber_target || 30);
  const [waterTarget, setWaterTarget] = useState(profile?.water_target_liters || 3.0);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Automated BMR / TDEE Calculation based on Mifflin-St Jeor Equation
  const calculateTargets = () => {
    // BMR formula
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === 'Male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity multiplier
    const activityMultipliers: Record<ActivityLevel, number> = {
      'Sedentary': 1.2,
      'Lightly Active': 1.375,
      'Moderately Active': 1.55,
      'Very Active': 1.725,
      'Extremely Active': 1.9,
    };

    let tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

    // Goal adjustments
    let protein = 1.2 * weightKg;
    if (fitnessGoal === 'Muscle Gain') {
      tdee += 300;
      protein = 1.8 * weightKg;
    } else if (fitnessGoal === 'Weight Management') {
      tdee -= 400;
      protein = 1.5 * weightKg;
    } else if (fitnessGoal === 'Strength' || fitnessGoal === 'Endurance') {
      protein = 1.6 * weightKg;
    }

    tdee = Math.max(1400, Math.round(tdee));
    protein = Math.round(protein);

    // Fat: ~25% of calories (9 kcal/g)
    const fat = Math.round((tdee * 0.25) / 9);

    // Remaining calories for Carbs (4 kcal/g)
    const remainingCalories = tdee - (protein * 4 + fat * 9);
    const carbs = Math.max(100, Math.round(remainingCalories / 4));

    setCalorieTarget(tdee);
    setProteinTarget(protein);
    setCarbsTarget(carbs);
    setFatTarget(fat);
    setFiberTarget(32);
    setWaterTarget(Number(((weightKg * 35) / 1000).toFixed(1)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile({
        name,
        age: Number(age),
        gender,
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        activity_level: activityLevel,
        dietary_preference: dietaryPreference,
        fitness_goal: fitnessGoal,
        daily_calorie_target: Number(calorieTarget),
        daily_protein_target: Number(proteinTarget),
        daily_carbs_target: Number(carbsTarget),
        daily_fat_target: Number(fatTarget),
        daily_fiber_target: Number(fiberTarget),
        water_target_liters: Number(waterTarget),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Profile & Nutrition Targets</h1>
          <p className="text-xs text-slate-500">Configure your biometric data and daily dietary objectives</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile Saved Successfully!</span>
          </div>
        )}
      </div>

      <AcademicDisclaimer />

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: BIOMETRIC ATTRIBUTES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <UserIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900">Biometric Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Age (Years)</label>
              <input
                type="number"
                min="10"
                max="120"
                value={age}
                onChange={e => setAge(parseInt(e.target.value, 10))}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  min="80"
                  max="250"
                  value={heightCm}
                  onChange={e => setHeightCm(parseInt(e.target.value, 10))}
                  className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={weightKg}
                  onChange={e => setWeightKg(parseFloat(e.target.value))}
                  className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Activity Level</label>
              <select
                value={activityLevel}
                onChange={e => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Sedentary">Sedentary (Little or no exercise)</option>
                <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
                <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                <option value="Very Active">Very Active (6-7 days/week)</option>
                <option value="Extremely Active">Extremely Active (Heavy training)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dietary Preference</label>
              <select
                value={dietaryPreference}
                onChange={e => setDietaryPreference(e.target.value as DietaryPreference)}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Eggetarian">Eggetarian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={e => setFitnessGoal(e.target.value as FitnessGoal)}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              >
                <option value="General Health">General Health</option>
                <option value="Weight Management">Weight Management</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Strength">Strength</option>
                <option value="Endurance">Endurance</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: DAILY TARGETS & CALCULATOR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Daily Nutritional Targets</h2>
                <p className="text-xs text-slate-500">Benchmark goals used on your dashboard and meal evaluation</p>
              </div>
            </div>

            <button
              type="button"
              onClick={calculateTargets}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auto-Calculate (Mifflin-St Jeor)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Calories (kcal)</label>
              <input
                type="number"
                min="800"
                max="6000"
                value={calorieTarget}
                onChange={e => setCalorieTarget(parseInt(e.target.value, 10))}
                className="w-full py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Protein (g)</label>
              <input
                type="number"
                min="20"
                max="400"
                value={proteinTarget}
                onChange={e => setProteinTarget(parseInt(e.target.value, 10))}
                className="w-full py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-blue-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Carbohydrates (g)</label>
              <input
                type="number"
                min="20"
                max="800"
                value={carbsTarget}
                onChange={e => setCarbsTarget(parseInt(e.target.value, 10))}
                className="w-full py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fats (g)</label>
              <input
                type="number"
                min="10"
                max="250"
                value={fatTarget}
                onChange={e => setFatTarget(parseInt(e.target.value, 10))}
                className="w-full py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-rose-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary Fiber (g)</label>
              <input
                type="number"
                min="10"
                max="80"
                value={fiberTarget}
                onChange={e => setFiberTarget(parseInt(e.target.value, 10))}
                className="w-full py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Water Target (Liters)</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="8.0"
                value={waterTarget}
                onChange={e => setWaterTarget(parseFloat(e.target.value))}
                className="w-full py-2 px-3 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-cyan-700"
              />
            </div>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile & Target Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
