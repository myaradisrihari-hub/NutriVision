from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="USER", nullable=False)  # USER, ADMIN
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    analyses = relationship("FoodAnalysis", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    age = Column(Integer, default=25)
    gender = Column(String, default="Male")
    height_cm = Column(Float, default=172.0)
    weight_kg = Column(Float, default=68.0)
    activity_level = Column(String, default="Moderately Active")
    dietary_preference = Column(String, default="Non-Vegetarian")
    fitness_goal = Column(String, default="General Health")
    daily_calorie_target = Column(Integer, default=2200)
    daily_protein_target = Column(Integer, default=90)
    daily_carbs_target = Column(Integer, default=260)
    daily_fat_target = Column(Integer, default=65)
    daily_fiber_target = Column(Integer, default=30)
    water_target_liters = Column(Float, default=3.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    serving_size = Column(Float, default=100.0)
    serving_unit = Column(String, default="g")
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbohydrates_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)
    fiber_g = Column(Float, default=0.0)
    sugar_g = Column(Float, default=0.0)
    sodium_mg = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=True)


class FoodAnalysis(Base):
    __tablename__ = "food_analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    meal_type = Column(String, default="Lunch")
    meal_name = Column(String, nullable=True)
    image_url = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    total_calories = Column(Integer, default=0)
    total_protein = Column(Float, default=0.0)
    total_carbs = Column(Float, default=0.0)
    total_fat = Column(Float, default=0.0)
    total_fiber = Column(Float, default=0.0)
    total_sugar = Column(Float, default=0.0)
    total_sodium = Column(Float, default=0.0)
    summary = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    ai_provider = Column(String, default="Gemini Multimodal Vision AI")

    user = relationship("User", back_populates="analyses")
    detected_foods = relationship("DetectedFood", back_populates="analysis", cascade="all, delete-orphan")


class DetectedFood(Base):
    __tablename__ = "detected_foods"

    id = Column(String, primary_key=True, default=generate_uuid)
    analysis_id = Column(String, ForeignKey("food_analyses.id"), nullable=False, index=True)
    food_item_id = Column(String, ForeignKey("food_items.id"), nullable=True)
    name = Column(String, nullable=False)
    confidence = Column(Float, default=0.90)
    estimated_portion_grams = Column(Float, nullable=False)
    unit = Column(String, default="g")
    calories = Column(Integer, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbohydrates_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)
    fiber_g = Column(Float, default=0.0)
    sugar_g = Column(Float, default=0.0)
    sodium_mg = Column(Float, default=0.0)
    is_manual_edit = Column(Boolean, default=False)

    analysis = relationship("FoodAnalysis", back_populates="detected_foods")
