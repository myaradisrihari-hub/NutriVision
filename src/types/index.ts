// Core Domain Types for NutriVision AI

export type UserRole = 'USER' | 'ADMIN';

export type ActivityLevel =
  | 'Sedentary'
  | 'Lightly Active'
  | 'Moderately Active'
  | 'Very Active'
  | 'Extremely Active';

export type DietaryPreference =
  | 'Vegetarian'
  | 'Non-Vegetarian'
  | 'Vegan'
  | 'Eggetarian'
  | 'Other';

export type FitnessGoal =
  | 'General Health'
  | 'Weight Management'
  | 'Muscle Gain'
  | 'Strength'
  | 'Endurance';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  dietary_preference: DietaryPreference;
  fitness_goal: FitnessGoal;
  daily_calorie_target: number;
  daily_protein_target: number;
  daily_carbs_target: number;
  daily_fat_target: number;
  daily_fiber_target: number;
  water_target_liters: number;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile?: UserProfile;
  created_at: string;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  serving_size: number; // e.g. 100
  serving_unit: string; // e.g. "g"
  calories: number; // per 100g
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  is_verified?: boolean;
}

export interface DetectedFood {
  id: string;
  analysis_id?: string;
  food_item_id?: string;
  name: string;
  description?: string;
  category?: string;
  confidence: number; // 0.0 - 1.0
  estimated_portion_grams: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  nutrition_status?: 'verified' | 'estimated' | 'unavailable';
  is_manual_edit?: boolean;
  visible?: boolean;
}

export interface MealTotals {
  calories: number;
  protein_g: number;
  carbohydrates_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
}

export interface FoodAnalysis {
  id: string;
  user_id: string;
  image_url: string;
  meal_type: MealType;
  meal_name?: string;
  meal_description?: string;
  timestamp: string;
  foods: DetectedFood[];
  totals: MealTotals;
  summary: string;
  recommendations: string[];
  positive_observations?: string[];
  nutritional_gaps?: string[];
  healthier_alternatives?: string[];
  notes?: string;
  ai_provider?: string;
  processing_time_ms?: number;
}

export interface DailyNutritionSummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  meal_count: number;
  calorie_target: number;
  protein_target: number;
}

export interface WeeklyAnalyticsData {
  days: {
    date: string;
    day_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }[];
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  macro_percentages: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface AdminStatistics {
  total_users: number;
  total_analyses: number;
  total_food_items: number;
  analyses_today: number;
  avg_meal_calories: number;
  popular_detected_foods: { name: string; count: number }[];
  ai_provider_status: {
    provider: string;
    status: 'ONLINE' | 'STANDBY' | 'DEMO';
    latency_ms: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}
