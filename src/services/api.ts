/**
 * NutriVision AI – Frontend service layer
 * Supabase Auth/DB/Storage + Google Gemini Vision (browser)
 */

import { supabase } from '../lib/supabase.js';
import {
  User,
  UserProfile,
  FoodItem,
  FoodAnalysis,
  DailyNutritionSummary,
  WeeklyAnalyticsData,
  AdminStatistics,
  MealType,
  UserRole,
} from '../types/index.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function resolveRole(meta: Record<string, unknown> | undefined): UserRole {
  const role = (meta?.role as string) || 'USER';
  return role === 'ADMIN' ? 'ADMIN' : 'USER';
}

function toUser(u: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  created_at: string;
}, profile?: UserProfile | null): User {
  const name =
    (u.user_metadata?.name as string) ||
    (u.email ? u.email.split('@')[0] : 'User');
  return {
    id: u.id,
    email: u.email || '',
    name,
    role: resolveRole(u.app_metadata) === 'ADMIN'
      ? 'ADMIN'
      : resolveRole(u.user_metadata),
    profile: profile || undefined,
    created_at: u.created_at,
  };
}

// ── Gemini Vision AI ──────────────────────────────────────────────────────────

const GEMINI_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

/** Prefer stable flash models; fall back if unavailable for this API key. */
const GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function callGemini(parts: GeminiPart[]): Promise<{ text: string; model: string }> {
  if (!GEMINI_KEY || GEMINI_KEY.includes('your-gemini')) {
    throw new Error(
      'Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your .env file and restart the dev server.'
    );
  }

  let lastError = 'All Gemini models failed';

  for (const model of GEMINI_MODELS) {
    for (const withThinkingOff of [true, false]) {
      try {
        const generationConfig: Record<string, unknown> = {
          temperature: 0.1,
          topP: 0.85,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        };
        if (withThinkingOff) {
          generationConfig.thinkingConfig = { thinkingBudget: 0 };
        }

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig,
            }),
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg = data?.error?.message || `HTTP ${res.status}`;
          if (res.status === 404 || res.status === 503 || /thinking/i.test(msg)) {
            lastError = msg;
            continue;
          }
          throw new Error(msg);
        }

        const text =
          data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
        if (!text) {
          lastError = 'Empty response from Gemini';
          continue;
        }
        return { text, model };
      } catch (err: any) {
        lastError = err?.message || String(err);
        continue;
      }
    }
  }

  throw new Error(lastError);
}

function stripBase64Prefix(base64: string): { data: string; mimeType: string } {
  const match = base64.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: 'image/jpeg', data: base64 };
}

async function urlToInlineData(url: string): Promise<{ mimeType: string; data: string }> {
  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error('Could not fetch meal image');
  const blob = await imgRes.blob();
  const b64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(blob);
  });
  return stripBase64Prefix(b64);
}

async function analyzeImageWithGemini(
  imageBase64OrUrl: string,
  mealType: MealType,
  userNotes?: string,
  visualHints?: {
    detectedDish?: string;
    dominantColors?: string[];
    dominantHueCategory?: string;
  }
): Promise<Omit<FoodAnalysis, 'id' | 'user_id' | 'timestamp'> & { _model?: string }> {
  const parts: GeminiPart[] = [];

  const hints = [
    visualHints?.detectedDish ? `Visual dish hint (may be approximate): ${visualHints.detectedDish}` : '',
    visualHints?.dominantColors?.length
      ? `Dominant colors: ${visualHints.dominantColors.join(', ')}`
      : '',
    visualHints?.dominantHueCategory
      ? `Hue category: ${visualHints.dominantHueCategory}`
      : '',
    userNotes ? `User notes about this meal: ${userNotes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = `You are an expert clinical nutritionist and computer-vision food analyst.
Analyze this ${mealType} meal photograph with maximum accuracy.

${hints ? `Context:\n${hints}\n` : ''}
RULES FOR HIGH ACCURACY:
1. Identify EVERY distinct edible item visible (main dishes, sides, sauces, garnishes, drinks, breads).
2. Estimate portion weight in grams using plate size, utensils, and relative volume. Prefer realistic adult serving sizes.
3. Nutrition values MUST be for the estimated portion (NOT per 100g). Use USDA / IFCT-style reference values.
4. Do not invent foods that are not visible. If uncertain, lower confidence and note it in description.
5. Separate mixed plates into components (e.g. rice, curry, dal, salad, pickle, raita) instead of one vague "thali".
6. Round macros sensibly (calories integer; protein/carbs/fat/fiber/sugar to 1 decimal; sodium integer).
7. confidence is 0.0–1.0 for identification certainty.

Respond with ONLY valid JSON matching this schema (no markdown):
{
  "meal_name": "string",
  "meal_description": "string",
  "foods": [
    {
      "id": "food_1",
      "name": "string",
      "description": "string",
      "category": "Grain|Protein|Vegetable|Fruit|Dairy|Fast Food|Snack|Dessert|Beverage|Condiment|Other",
      "confidence": 0.92,
      "estimated_portion_grams": 150,
      "unit": "g",
      "calories": 210,
      "protein_g": 8.0,
      "carbohydrates_g": 42.0,
      "fat_g": 3.0,
      "fiber_g": 2.0,
      "sugar_g": 1.0,
      "sodium_mg": 220,
      "nutrition_status": "estimated"
    }
  ],
  "summary": "2-3 sentence nutritional assessment",
  "recommendations": ["...", "...", "..."],
  "positive_observations": ["...", "..."],
  "nutritional_gaps": ["...", "..."],
  "healthier_alternatives": ["..."]
}`;

  parts.push({ text: prompt });

  if (imageBase64OrUrl.startsWith('data:') || !imageBase64OrUrl.startsWith('http')) {
    const { data, mimeType } = stripBase64Prefix(imageBase64OrUrl);
    parts.push({ inlineData: { mimeType, data } });
  } else {
    try {
      const inline = await urlToInlineData(imageBase64OrUrl);
      parts.push({ inlineData: inline });
    } catch {
      throw new Error('Could not load the meal image for analysis. Try uploading the file directly.');
    }
  }

  const { text: raw, model } = await callGemini(parts);

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Could not parse AI nutrition response. Please try again.');
    parsed = JSON.parse(jsonMatch[0]);
  }

  const foods = (parsed.foods || []).map((f: any, i: number) => ({
    id: f.id || `food_${i + 1}`,
    name: f.name || `Food ${i + 1}`,
    description: f.description || '',
    category: f.category || 'Other',
    confidence: typeof f.confidence === 'number' ? Math.min(1, Math.max(0, f.confidence)) : 0.7,
    estimated_portion_grams: Number(f.estimated_portion_grams) || 100,
    unit: f.unit || 'g',
    calories: Math.round(Number(f.calories) || 0),
    protein_g: Math.round((Number(f.protein_g) || 0) * 10) / 10,
    carbohydrates_g: Math.round((Number(f.carbohydrates_g) || 0) * 10) / 10,
    fat_g: Math.round((Number(f.fat_g) || 0) * 10) / 10,
    fiber_g: Math.round((Number(f.fiber_g) || 0) * 10) / 10,
    sugar_g: Math.round((Number(f.sugar_g) || 0) * 10) / 10,
    sodium_mg: Math.round(Number(f.sodium_mg) || 0),
    nutrition_status: f.nutrition_status || 'estimated',
    visible: true,
  }));

  if (foods.length === 0) {
    throw new Error('No food items were detected. Try a clearer, well-lit photo of the full plate.');
  }

  const totals = computeTotals(foods);

  return {
    image_url: imageBase64OrUrl,
    meal_type: mealType,
    meal_name: parsed.meal_name || 'Analyzed Meal',
    meal_description: parsed.meal_description || '',
    foods,
    totals,
    summary: parsed.summary || '',
    recommendations: parsed.recommendations || [],
    positive_observations: parsed.positive_observations || [],
    nutritional_gaps: parsed.nutritional_gaps || [],
    healthier_alternatives: parsed.healthier_alternatives || [],
    ai_provider: model,
    _model: model,
  };
}

async function ensureProfile(userId: string, name: string, email: string): Promise<UserProfile | null> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return existing as UserProfile;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        name,
        email,
        age: 24,
        gender: 'Male',
        height_cm: 172,
        weight_kg: 68,
        activity_level: 'Moderately Active',
        dietary_preference: 'Non-Vegetarian',
        fitness_goal: 'General Health',
        daily_calorie_target: 2200,
        daily_protein_target: 90,
        daily_carbs_target: 260,
        daily_fat_target: 65,
        daily_fiber_target: 30,
        water_target_liters: 3.0,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .maybeSingle();

  if (error) {
    console.warn('Profile upsert warning:', error.message);
    return null;
  }
  return data as UserProfile;
}

// ── API surface ───────────────────────────────────────────────────────────────

export const api = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(error.message);
    const u = data.user!;
    const profile = await ensureProfile(
      u.id,
      u.user_metadata?.name || email.split('@')[0],
      u.email!
    );
    return {
      token: data.session!.access_token,
      user: toUser(u, profile),
    };
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<{ token: string; user: User; needsEmailConfirmation?: boolean }> {
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const email = data.email.trim().toLowerCase();
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: { name: data.name.trim(), role: 'USER' },
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error('Registration failed. Please try again.');

    const u = authData.user;
    const needsEmailConfirmation = !authData.session;

    // Profile is also created by DB trigger; upsert here when session exists
    let profile: UserProfile | null = null;
    if (authData.session) {
      profile = await ensureProfile(u.id, data.name.trim(), email);
    }

    return {
      token: authData.session?.access_token || '',
      needsEmailConfirmation,
      user: toUser(
        { ...u, user_metadata: { ...u.user_metadata, name: data.name.trim() } },
        profile
      ),
    };
  },

  async getMe(): Promise<{ user: User }> {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error('Not authenticated');
    const u = data.user;
    const profile = await ensureProfile(
      u.id,
      u.user_metadata?.name || u.email!.split('@')[0],
      u.email!
    );
    return { user: toUser(u, profile) };
  },

  async getProfile(): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (error) throw new Error(error.message);
    return data as UserProfile;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { id, user_id, ...safe } = updates as any;
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...safe, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as UserProfile;
  },

  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('meal-photos').upload(filename, file);
    if (error) throw new Error(error.message);
    const { data: urlData } = supabase.storage.from('meal-photos').getPublicUrl(filename);
    return { url: urlData.publicUrl, filename };
  },

  async analyzeMeal(payload: {
    imageBase64?: string;
    imageUrl?: string;
    mealType: MealType;
    userNotes?: string;
    filename?: string;
    visualAnalysis?: {
      detectedDish?: string;
      dominantColors?: string[];
      dominantHueCategory?: string;
    };
  }): Promise<FoodAnalysis> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const imageSource = payload.imageBase64 || payload.imageUrl || '';
    if (!imageSource) throw new Error('No image provided');

    const start = Date.now();
    const result = await analyzeImageWithGemini(
      imageSource,
      payload.mealType,
      payload.userNotes,
      payload.visualAnalysis
    );

    let finalImageUrl = result.image_url;
    if (payload.imageBase64 && !payload.imageUrl) {
      try {
        const { mimeType, data: b64data } = stripBase64Prefix(payload.imageBase64);
        const ext = (mimeType.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
        const filename = `${user.id}/${Date.now()}.${ext}`;
        const binary = Uint8Array.from(atob(b64data), (c) => c.charCodeAt(0));
        const blob = new Blob([binary], { type: mimeType });
        const { error } = await supabase.storage.from('meal-photos').upload(filename, blob, {
          contentType: mimeType,
          upsert: false,
        });
        if (!error) {
          const { data: urlData } = supabase.storage.from('meal-photos').getPublicUrl(filename);
          finalImageUrl = urlData.publicUrl;
        }
      } catch {
        // Keep original if upload fails
      }
    } else if (payload.imageUrl) {
      finalImageUrl = payload.imageUrl;
    }

    const { _model, ...analysisFields } = result as any;
    const analysis: Omit<FoodAnalysis, 'id'> = {
      ...analysisFields,
      image_url: finalImageUrl,
      user_id: user.id,
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now() - start,
      notes: payload.userNotes || null,
    };

    const { data: saved, error } = await supabase
      .from('food_analyses')
      .insert(analysis)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return saved as FoodAnalysis;
  },

  async getAnalysis(id: string): Promise<FoodAnalysis> {
    const { data, error } = await supabase
      .from('food_analyses')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as FoodAnalysis;
  },

  async updateAnalysis(id: string, updates: Partial<FoodAnalysis>): Promise<FoodAnalysis> {
    const { data, error } = await supabase
      .from('food_analyses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as FoodAnalysis;
  },

  async deleteAnalysis(id: string): Promise<{ success: boolean }> {
    const { error } = await supabase.from('food_analyses').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async updateDetectedFood(
    analysisId: string,
    foodId: string,
    portionGrams: number,
    name?: string
  ): Promise<FoodAnalysis> {
    const analysis = await api.getAnalysis(analysisId);
    const foods = analysis.foods.map((f) => {
      if (f.id !== foodId) return f;
      const base = f.estimated_portion_grams || 100;
      const ratio = portionGrams / base;
      return {
        ...f,
        ...(name ? { name } : {}),
        estimated_portion_grams: portionGrams,
        calories: Math.round(f.calories * ratio),
        protein_g: Math.round(f.protein_g * ratio * 10) / 10,
        carbohydrates_g: Math.round(f.carbohydrates_g * ratio * 10) / 10,
        fat_g: Math.round(f.fat_g * ratio * 10) / 10,
        fiber_g: Math.round(f.fiber_g * ratio * 10) / 10,
        sugar_g: Math.round(f.sugar_g * ratio * 10) / 10,
        sodium_mg: Math.round(f.sodium_mg * ratio),
        is_manual_edit: true,
      };
    });
    return api.updateAnalysis(analysisId, { foods, totals: computeTotals(foods) });
  },

  async removeDetectedFood(analysisId: string, foodId: string): Promise<FoodAnalysis> {
    const analysis = await api.getAnalysis(analysisId);
    const foods = analysis.foods.filter((f) => f.id !== foodId);
    return api.updateAnalysis(analysisId, { foods, totals: computeTotals(foods) });
  },

  async addDetectedFood(
    analysisId: string,
    foodName: string,
    portionGrams: number,
    customNutrients?: {
      calories?: number;
      protein_g?: number;
      carbohydrates_g?: number;
      fat_g?: number;
    }
  ): Promise<FoodAnalysis> {
    const analysis = await api.getAnalysis(analysisId);

    // Prefer DB nutrition scaled to portion
    let nutrients = {
      calories: customNutrients?.calories || 0,
      protein_g: customNutrients?.protein_g || 0,
      carbohydrates_g: customNutrients?.carbohydrates_g || 0,
      fat_g: customNutrients?.fat_g || 0,
      fiber_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
      category: 'Other',
    };

    if (!customNutrients?.calories) {
      const lookup = await api.lookupNutrition(foodName, portionGrams);
      if (lookup.resolved) {
        nutrients = {
          calories: lookup.resolved.calories,
          protein_g: lookup.resolved.protein_g,
          carbohydrates_g: lookup.resolved.carbohydrates_g,
          fat_g: lookup.resolved.fat_g,
          fiber_g: lookup.resolved.fiber_g,
          sugar_g: lookup.resolved.sugar_g,
          sodium_mg: lookup.resolved.sodium_mg,
          category: lookup.resolved.category || 'Other',
        };
      }
    }

    const newFood = {
      id: `food_${Date.now()}`,
      name: foodName,
      category: nutrients.category,
      confidence: 1.0,
      estimated_portion_grams: portionGrams,
      unit: 'g',
      calories: nutrients.calories,
      protein_g: nutrients.protein_g,
      carbohydrates_g: nutrients.carbohydrates_g,
      fat_g: nutrients.fat_g,
      fiber_g: nutrients.fiber_g,
      sugar_g: nutrients.sugar_g,
      sodium_mg: nutrients.sodium_mg,
      nutrition_status: 'estimated' as const,
      is_manual_edit: true,
      visible: true,
    };
    const foods = [...analysis.foods, newFood];
    return api.updateAnalysis(analysisId, { foods, totals: computeTotals(foods) });
  },

  async getHistory(params?: { search?: string; meal_type?: string }): Promise<FoodAnalysis[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('food_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (params?.meal_type) query = query.eq('meal_type', params.meal_type);
    if (params?.search) query = query.ilike('meal_name', `%${params.search}%`);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as FoodAnalysis[];
  },

  async getHistoryItem(id: string): Promise<FoodAnalysis> {
    return api.getAnalysis(id);
  },

  async deleteHistoryItem(id: string): Promise<{ success: boolean }> {
    return api.deleteAnalysis(id);
  },

  async getFoods(search?: string, category?: string): Promise<FoodItem[]> {
    let query = supabase.from('food_items').select('*').limit(50);
    if (search) query = query.ilike('name', `%${search}%`);
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []) as FoodItem[];
  },

  async lookupNutrition(
    foodName: string,
    grams = 100
  ): Promise<{
    query: string;
    grams: number;
    db_match: FoodItem | null;
    resolved: {
      id: string;
      name: string;
      category: string;
      calories: number;
      protein_g: number;
      carbohydrates_g: number;
      fat_g: number;
      fiber_g: number;
      sugar_g: number;
      sodium_mg: number;
    } | null;
  }> {
    const { data } = await supabase
      .from('food_items')
      .select('*')
      .ilike('name', `%${foodName}%`)
      .limit(1)
      .maybeSingle();

    if (!data) {
      return { query: foodName, grams, db_match: null, resolved: null };
    }

    const scale = grams / (Number(data.serving_size) || 100);
    return {
      query: foodName,
      grams,
      db_match: data as FoodItem,
      resolved: {
        id: data.id,
        name: data.name,
        category: data.category,
        calories: Math.round(Number(data.calories) * scale),
        protein_g: Math.round(Number(data.protein_g) * scale * 10) / 10,
        carbohydrates_g: Math.round(Number(data.carbohydrates_g) * scale * 10) / 10,
        fat_g: Math.round(Number(data.fat_g) * scale * 10) / 10,
        fiber_g: Math.round(Number(data.fiber_g) * scale * 10) / 10,
        sugar_g: Math.round(Number(data.sugar_g) * scale * 10) / 10,
        sodium_mg: Math.round(Number(data.sodium_mg) * scale),
      },
    };
  },

  async getDailyAnalytics(): Promise<DailyNutritionSummary[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const profile = await api.getProfile().catch(() => null);
    const { data, error } = await supabase
      .from('food_analyses')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', daysAgoStr(30))
      .order('timestamp', { ascending: true });

    if (error) throw new Error(error.message);
    return aggregateDailySummaries(data || [], profile);
  },

  async getWeeklyAnalytics(days = 7): Promise<WeeklyAnalyticsData> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('food_analyses')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', daysAgoStr(days))
      .order('timestamp', { ascending: true });

    if (error) throw new Error(error.message);
    return buildWeeklyData(data || [], days);
  },

  async getRecommendations(): Promise<{
    user_goal: string;
    dietary_preference: string;
    recommendations: {
      title: string;
      category: string;
      description: string;
      priority: 'High' | 'Medium' | 'Low';
    }[];
  }> {
    const profile = await api.getProfile().catch(() => null);
    const goal = profile?.fitness_goal || 'General Health';
    const diet = profile?.dietary_preference || 'Non-Vegetarian';
    return {
      user_goal: goal,
      dietary_preference: diet,
      recommendations: getStaticRecommendations(goal, diet),
    };
  },

  async getAdminStats(): Promise<AdminStatistics> {
    const [
      { count: total_users },
      { count: total_analyses },
      { count: total_food_items },
      { data: recent },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('food_analyses').select('*', { count: 'exact', head: true }),
      supabase.from('food_items').select('*', { count: 'exact', head: true }),
      supabase.from('food_analyses').select('totals, foods').limit(200),
    ]);

    const { count: analyses_today } = await supabase
      .from('food_analyses')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', todayStr());

    const rows = recent || [];
    const avgCal =
      rows.length > 0
        ? Math.round(
            rows.reduce((s: number, r: any) => s + (r.totals?.calories || 0), 0) / rows.length
          )
        : 0;

    const foodCounts: Record<string, number> = {};
    rows.forEach((r: any) => {
      (r.foods || []).forEach((f: any) => {
        if (f?.name) foodCounts[f.name] = (foodCounts[f.name] || 0) + 1;
      });
    });
    const popular = Object.entries(foodCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      total_users: total_users || 0,
      total_analyses: total_analyses || 0,
      total_food_items: total_food_items || 0,
      analyses_today: analyses_today || 0,
      avg_meal_calories: avgCal,
      popular_detected_foods: popular,
      ai_provider_status: {
        provider: GEMINI_MODELS[0],
        status: GEMINI_KEY && !GEMINI_KEY.includes('your-gemini') ? 'ONLINE' : 'DEMO',
        latency_ms: 0,
      },
    };
  },

  async getAdminUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map((p: any) => ({
      id: p.user_id,
      email: p.email,
      name: p.name,
      role: 'USER' as const,
      created_at: p.updated_at || new Date().toISOString(),
    }));
  },

  async getAdminAnalyses(): Promise<FoodAnalysis[]> {
    const { data, error } = await supabase
      .from('food_analyses')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data || []) as FoodAnalysis[];
  },

  async createAdminFood(item: Omit<FoodItem, 'id'>): Promise<FoodItem> {
    const { data, error } = await supabase.from('food_items').insert(item).select().single();
    if (error) throw new Error(error.message);
    return data as FoodItem;
  },

  async updateAdminFood(id: string, updates: Partial<FoodItem>): Promise<FoodItem> {
    const { data, error } = await supabase
      .from('food_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as FoodItem;
  },

  async deleteAdminFood(id: string): Promise<{ success: boolean }> {
    const { error } = await supabase.from('food_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async getAISettings(): Promise<{ configured: boolean; provider: string }> {
    return {
      configured: !!GEMINI_KEY && !GEMINI_KEY.includes('your-gemini'),
      provider: 'Gemini Vision',
    };
  },

  async setAISettings(_apiKey: string): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message:
        'API keys are configured via VITE_GEMINI_API_KEY in the project .env file. Update it and restart the server.',
    };
  },
};

// ── Local helpers ─────────────────────────────────────────────────────────────

function computeTotals(foods: FoodAnalysis['foods']) {
  return foods.reduce(
    (acc, f) => ({
      calories: Math.round(acc.calories + (f.calories || 0)),
      protein_g: Math.round((acc.protein_g + (f.protein_g || 0)) * 10) / 10,
      carbohydrates_g: Math.round((acc.carbohydrates_g + (f.carbohydrates_g || 0)) * 10) / 10,
      fat_g: Math.round((acc.fat_g + (f.fat_g || 0)) * 10) / 10,
      fiber_g: Math.round((acc.fiber_g + (f.fiber_g || 0)) * 10) / 10,
      sugar_g: Math.round((acc.sugar_g + (f.sugar_g || 0)) * 10) / 10,
      sodium_mg: Math.round(acc.sodium_mg + (f.sodium_mg || 0)),
    }),
    { calories: 0, protein_g: 0, carbohydrates_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0 }
  );
}

function aggregateDailySummaries(
  rows: any[],
  profile: UserProfile | null
): DailyNutritionSummary[] {
  const byDate: Record<string, DailyNutritionSummary> = {};
  rows.forEach((r) => {
    const date = (r.timestamp || '').split('T')[0];
    if (!date) return;
    if (!byDate[date]) {
      byDate[date] = {
        date,
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        total_fiber: 0,
        meal_count: 0,
        calorie_target: profile?.daily_calorie_target || 2200,
        protein_target: profile?.daily_protein_target || 90,
      };
    }
    const s = byDate[date];
    s.total_calories += r.totals?.calories || 0;
    s.total_protein += r.totals?.protein_g || 0;
    s.total_carbs += r.totals?.carbohydrates_g || 0;
    s.total_fat += r.totals?.fat_g || 0;
    s.total_fiber += r.totals?.fiber_g || 0;
    s.meal_count++;
  });
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

function buildWeeklyData(rows: any[], days: number): WeeklyAnalyticsData {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const map: Record<
    string,
    { calories: number; protein: number; carbs: number; fat: number; fiber: number }
  > = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map[d.toISOString().split('T')[0]] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  }

  rows.forEach((r) => {
    const date = (r.timestamp || '').split('T')[0];
    if (map[date]) {
      map[date].calories += r.totals?.calories || 0;
      map[date].protein += r.totals?.protein_g || 0;
      map[date].carbs += r.totals?.carbohydrates_g || 0;
      map[date].fat += r.totals?.fat_g || 0;
      map[date].fiber += r.totals?.fiber_g || 0;
    }
  });

  const dayEntries = Object.entries(map).map(([date, vals]) => ({
    date,
    day_name: dayNames[new Date(date + 'T12:00:00').getDay()],
    ...vals,
  }));

  const n = dayEntries.length || 1;
  const totals = dayEntries.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein: acc.protein + d.protein,
      carbs: acc.carbs + d.carbs,
      fat: acc.fat + d.fat,
      fiber: acc.fiber + d.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const avgCalories = totals.calories / n;
  const proteinCal = (totals.protein / n) * 4;
  const carbsCal = (totals.carbs / n) * 4;
  const fatCal = (totals.fat / n) * 9;
  const totalMacroCal = proteinCal + carbsCal + fatCal || 1;

  return {
    days: dayEntries,
    averages: {
      calories: Math.round(avgCalories),
      protein: Math.round(totals.protein / n),
      carbs: Math.round(totals.carbs / n),
      fat: Math.round(totals.fat / n),
      fiber: Math.round(totals.fiber / n),
    },
    macro_percentages: {
      protein: Math.round((proteinCal / totalMacroCal) * 100),
      carbs: Math.round((carbsCal / totalMacroCal) * 100),
      fat: Math.round((fatCal / totalMacroCal) * 100),
    },
  };
}

function getStaticRecommendations(goal: string, diet: string) {
  const base = [
    {
      title: 'Stay Hydrated',
      category: 'Hydration',
      description: 'Aim for 2.5–3 L of water daily. Proper hydration aids digestion and metabolism.',
      priority: 'High' as const,
    },
    {
      title: 'Eat More Vegetables',
      category: 'Micronutrients',
      description:
        'Include at least 3 different colored vegetables per day for a full micronutrient spectrum.',
      priority: 'High' as const,
    },
    {
      title: 'Prioritize Whole Foods',
      category: 'Food Quality',
      description:
        'Choose minimally processed foods to maximize fiber, vitamins, and minerals.',
      priority: 'Medium' as const,
    },
  ];

  if (goal === 'Muscle Gain' || goal === 'Strength') {
    base.push({
      title: 'Boost Protein Intake',
      category: 'Protein',
      description: 'Target 1.6–2.2 g of protein per kg of body weight to support muscle synthesis.',
      priority: 'High' as const,
    });
  }
  if (goal === 'Weight Management') {
    base.push({
      title: 'Create a Caloric Deficit',
      category: 'Calorie Management',
      description: 'Aim for 300–500 kcal below your TDEE to lose weight sustainably.',
      priority: 'High' as const,
    });
  }
  if (diet === 'Vegetarian' || diet === 'Vegan') {
    base.push({
      title: 'Monitor Vitamin B12',
      category: 'Micronutrients',
      description: 'Supplement with B12 if following a plant-based diet to prevent deficiency.',
      priority: 'Medium' as const,
    });
  }

  return base;
}
