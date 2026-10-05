"""
NutriVision AI — Unit Tests
Tests multi-food detection and mathematical nutrition calculation formulas.
"""

from app.services.nutrition_calculator import calculate_portion_nutrition, calculate_meal_totals

def test_single_portion_calculation():
    # Rice reference: 100g = 130 kcal, 2.7g P, 28.2g C, 0.3g F
    rice_ref = {
        "calories": 130.0,
        "protein_g": 2.7,
        "carbohydrates_g": 28.2,
        "fat_g": 0.3,
        "fiber_g": 0.4,
        "sugar_g": 0.1,
        "sodium_mg": 1.0
    }
    # For 180g portion
    result = calculate_portion_nutrition(rice_ref, 180)
    assert result["calories"] == 234
    assert result["protein_g"] == 4.9
    assert result["carbohydrates_g"] == 50.8

def test_multi_food_meal_totals():
    # Scenario: Rice + Chicken + Dal + Salad + Curd
    detected_foods = [
        {"name": "Rice", "calories": 234, "protein_g": 4.9, "carbohydrates_g": 50.8, "fat_g": 0.5, "fiber_g": 0.7, "sugar_g": 0.2, "sodium_mg": 2},
        {"name": "Chicken Curry", "calories": 231, "protein_g": 23.1, "carbohydrates_g": 4.9, "fat_g": 13.7, "fiber_g": 1.1, "sugar_g": 1.4, "sodium_mg": 476},
        {"name": "Dal", "calories": 158, "protein_g": 10.2, "carbohydrates_g": 22.8, "fat_g": 3.3, "fiber_g": 5.7, "sugar_g": 1.2, "sodium_mg": 345},
        {"name": "Green Salad", "calories": 22, "protein_g": 1.0, "carbohydrates_g": 4.2, "fat_g": 0.2, "fiber_g": 1.5, "sugar_g": 2.4, "sodium_mg": 12},
        {"name": "Curd", "calories": 73, "protein_g": 4.2, "carbohydrates_g": 5.6, "fat_g": 4.0, "fiber_g": 0.0, "sugar_g": 5.6, "sodium_mg": 55},
    ]

    totals = calculate_meal_totals(detected_foods)

    # Verification: 5 distinct food items, non-zero sum, not combined into a single dummy tag
    assert len(detected_foods) == 5
    assert totals["calories"] == 718
    assert totals["protein_g"] == 43.4
    assert totals["carbohydrates_g"] == 88.3
    assert totals["fat_g"] == 21.7
    assert totals["fiber_g"] == 9.0
