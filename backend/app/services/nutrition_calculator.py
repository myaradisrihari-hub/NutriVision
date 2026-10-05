"""
NutriVision AI — Python Nutrition Calculation Engine
Fulfills Section 17: portion nutrition = nutrition per 100g * portion_grams / 100
"""

from typing import List, Dict, Any

def calculate_portion_nutrition(per_100g: Dict[str, float], portion_grams: float) -> Dict[str, Any]:
    factor = max(1.0, portion_grams) / 100.0
    return {
        "estimated_portion_grams": round(portion_grams, 1),
        "calories": round(per_100g.get("calories", 0.0) * factor),
        "protein_g": round(per_100g.get("protein_g", 0.0) * factor, 1),
        "carbohydrates_g": round(per_100g.get("carbohydrates_g", 0.0) * factor, 1),
        "fat_g": round(per_100g.get("fat_g", 0.0) * factor, 1),
        "fiber_g": round(per_100g.get("fiber_g", 0.0) * factor, 1),
        "sugar_g": round(per_100g.get("sugar_g", 0.0) * factor, 1),
        "sodium_mg": round(per_100g.get("sodium_mg", 0.0) * factor),
    }

def calculate_meal_totals(foods: List[Dict[str, Any]]) -> Dict[str, Any]:
    calories = sum(f.get("calories", 0) for f in foods)
    protein = round(sum(f.get("protein_g", 0.0) for f in foods), 1)
    carbs = round(sum(f.get("carbohydrates_g", 0.0) for f in foods), 1)
    fat = round(sum(f.get("fat_g", 0.0) for f in foods), 1)
    fiber = round(sum(f.get("fiber_g", 0.0) for f in foods), 1)
    sugar = round(sum(f.get("sugar_g", 0.0) for f in foods), 1)
    sodium = round(sum(f.get("sodium_mg", 0.0) for f in foods))

    return {
        "calories": calories,
        "protein_g": protein,
        "carbohydrates_g": carbs,
        "fat_g": fat,
        "fiber_g": fiber,
        "sugar_g": sugar,
        "sodium_mg": sodium,
    }
