# NutriVision AI – Intelligent Nutrition Analyzer from Food Images

[![AIML Capstone Project](https://img.shields.io/badge/Project-AIML%20Semester%20Credit-emerald)](https://github.com)
[![Architecture](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20FastAPI%20%2F%20Express%20%7C%20Postgres-blue)](https://github.com)
[![Vision AI](https://img.shields.io/badge/AI-Multimodal%20Computer%20Vision-teal)](https://github.com)

**NutriVision AI** is a full-stack, production-grade academic web application engineered for college semester-credit evaluation. It uses multimodal computer vision and reference nutritional databases to detect multiple food items in complex meal photos, estimate volumetric serving portions in grams, and compute authoritative individual and meal-total macronutrients.

> **Key Academic Contribution:**
> *“An AI-assisted computer vision system that analyzes food images, identifies multiple food items, estimates serving portions, retrieves nutritional information, calculates complete meal nutrition, and provides personalized general nutrition insights.”*

---

## 1. System Architecture

```text
Food Image (Upload / Camera)
         │
         ▼
Image Preprocessing (Normalization, Resolution & Aspect Ratio)
         │
         ▼
Multimodal Vision AI / Neural CV Classifier
         │
         ▼
Multi-Food Atomic Detection (e.g. Rice + Chicken + Dal + Salad + Curd)
         │
         ▼
Portion Volume Estimation (Grams per detected item)
         │
         ▼
Reference Nutrition Database Query (Per 100g lookup)
         │
         ▼
Portion Nutrition Calculation [portion = per_100g * grams / 100]
         │
         ▼
Complete Meal Totals Calculation (Calories, P, C, F, Fiber, Sugar, Na)
         │
         ▼
Personalized Health Recommendation & Gap Analysis Engine
         │
         ▼
PostgreSQL / Persistent Database Storage & Visual Analytics
```

---

## 2. Core Features

1. **Multi-Food Recognition (Core AI Feature):**
   - Segments multiple distinct food items from a single plate photo (e.g., Rice, Dal, Chicken Curry, Green Salad, and Curd).
   - Prevents generic single-label classification (e.g. will *never* return just "Indian food").
2. **Volumetric Serving Estimation:**
   - Estimates individual item portion weights in grams with confidence scores.
3. **Interactive Manual Correction:**
   - Modify portion grams using dynamic sliders with instant recalculation.
   - Swap identified food items from the verified nutrition database.
   - Remove misclassified items or add unclassified side dishes.
4. **Nutrition Rules & Recommendation Engine:**
   - Evaluates protein adequacy, fiber density, and sodium load.
   - Generates tailored positive observations, nutritional gaps, and healthier alternatives aligned with user goals (Muscle Gain, Weight Management, etc.).
5. **Dashboard & Longitudinal Analytics:**
   - Daily target progress bars (Calories, Protein, Carbs, Fat, Fiber).
   - Recharts weekly calorie bar chart with goal reference lines.
   - 7-day and 30-day multi-macro trend lines and caloric macronutrient distribution.
6. **Administrative Console (`/admin`):**
   - Full CRUD operations on reference food items (calories and nutrients per 100g).
   - User account tracking and meal log inspection.
   - AI provider latency and diagnostic status.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts.
- **Backend Runtime:** Full-Stack Express with Vite middleware + Python FastAPI companion.
- **AI / Computer Vision:** Multimodal Vision AI (`@google/genai` / Gemini 2.5 Flash) with fallback Neural CV food decomposition engine.
- **Database:** PostgreSQL / Persistent schema store.
- **Authentication:** JWT Bearer tokens, bcrypt password hashing, Role-Based Access Control (`USER` and `ADMIN`).

---

## 4. Quick Start & Evaluation Credentials

### Academic Evaluation Accounts
For instant testing without registration, the system is seeded with:

| Role | Email | Password |
|---|---|---|
| **Student User** | `user@nutrivision.ai` | `User@123` |
| **Faculty / Admin** | `admin@nutrivision.ai` | `Admin@123` |

*(You can also use the 1-Click login buttons on the Sign In modal).*

---

## 5. Local Setup & Running

### Prerequisites
- Node.js >= 18.0.0
- Python >= 3.10 (optional for Python companion)
- Docker & Docker Compose (optional)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/nutrivision-ai.git
cd nutrivision-ai

# Install frontend & server dependencies
npm install
```

### 2. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
Edit `.env` to configure variables:
```ini
PORT=3000
JWT_SECRET=nutrivision-secure-jwt-academic-secret-key-2025
GEMINI_API_KEY=your_gemini_api_key_here  # Optional for live Gemini vision
```

### 3. Run Full-Stack Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running with Docker Compose
```bash
docker-compose up --build
```

### 5. Running Python Backend Tests
```bash
cd backend
pip install -r requirements.txt
pytest tests/
```

---

## 6. API Reference

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Register new user |
| `/api/auth/login` | POST | Public | Authenticate user & return JWT |
| `/api/auth/me` | GET | User | Get current profile & credentials |
| `/api/profile` | GET / PUT | User | Manage biometric metrics & goals |
| `/api/analysis/upload` | POST | User | Upload food photo |
| `/api/analysis/analyze`| POST | User | Run multi-food AI vision pipeline |
| `/api/analysis/:id` | GET / PUT / DELETE | User | Retrieve / modify / delete meal |
| `/api/analysis/:id/foods/:food_id` | PUT / DELETE | User | Update portion grams or remove food |
| `/api/analysis/:id/foods` | POST | User | Add missing food to meal |
| `/api/history` | GET | User | Search and filter previous meals |
| `/api/analytics/weekly`| GET | User | 7-day and 30-day macro trends |
| `/api/foods` | GET | Public | Search reference food database |
| `/api/admin/statistics`| GET | Admin | System metrics & AI health |
| `/api/admin/foods` | POST / PUT / DELETE | Admin | Manage reference food items |

---

## 7. Academic Research Disclaimer

> **Important Accuracy Notice:**
> Estimated nutrition is based on visual multi-food recognition and reference nutritional datasets. Actual values may vary depending on recipe formulations, preparation methods, cooking oils, and density variations. This application is an engineering capstone and is not intended for clinical diagnosis or medical prescription.
