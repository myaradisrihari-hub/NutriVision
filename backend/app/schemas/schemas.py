from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    confirm_password: Optional[str] = None

class UserResponse(UserBase):
    id: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    name: str
    age: int = 25
    gender: str = "Male"
    height_cm: float = 172.0
    weight_kg: float = 68.0
    activity_level: str = "Moderately Active"
    dietary_preference: str = "Non-Vegetarian"
    fitness_goal: str = "General Health"
    daily_calorie_target: int = 2200
    daily_protein_target: int = 90
    daily_carbs_target: int = 260
    daily_fat_target: int = 65
    daily_fiber_target: int = 30
    water_target_liters: float = 3.0

class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    class Config:
        from_attributes = True

class DetectedFoodSchema(BaseModel):
    id: Optional[str] = None
    name: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    estimated_portion_grams: float = Field(..., gt=0)
    unit: str = "g"
    calories: int
    protein_g: float
    carbohydrates_g: float
    fat_g: float
    fiber_g: float = 0.0
    sugar_g: float = 0.0
    sodium_mg: float = 0.0
    is_manual_edit: bool = False
    class Config:
        from_attributes = True

class MealTotalsSchema(BaseModel):
    calories: int
    protein_g: float
    carbohydrates_g: float
    fat_g: float
    fiber_g: float
    sugar_g: float
    sodium_mg: float

class FoodAnalysisResponse(BaseModel):
    id: str
    user_id: str
    meal_type: str
    meal_name: Optional[str] = None
    image_url: str
    timestamp: datetime
    foods: List[DetectedFoodSchema]
    totals: MealTotalsSchema
    summary: str
    recommendations: List[str]
    positive_observations: Optional[List[str]] = None
    nutritional_gaps: Optional[List[str]] = None
    healthier_alternatives: Optional[List[str]] = None
    notes: Optional[str] = None
    ai_provider: Optional[str] = None
    class Config:
        from_attributes = True

class FoodItemSchema(BaseModel):
    id: str
    name: str
    category: str
    serving_size: float = 100.0
    serving_unit: str = "g"
    calories: float
    protein_g: float
    carbohydrates_g: float
    fat_g: float
    fiber_g: float = 0.0
    sugar_g: float = 0.0
    sodium_mg: float = 0.0
    is_verified: bool = True
    class Config:
        from_attributes = True
