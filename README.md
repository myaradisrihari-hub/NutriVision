# NutriVision AI

Photograph a meal → detect every food item → get accurate calories & macros.

**Stack:** React 19 + Vite + TypeScript + Tailwind CSS · **BaaS:** Supabase (Auth, Postgres, Storage) · **AI:** Google Gemini Vision

---

## Quick start

1. **Install & run**
   ```bash
   npm install
   npm run dev
   ```

2. **Configure `.env`** (copy from `.env.example`)
   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```
   > `VITE_SUPABASE_URL` must be the **project root URL** — do **not** append `/rest/v1/`.

3. **Set up Supabase** (Dashboard → SQL Editor), run in order:
   1. [`supabase_schema.sql`](./supabase_schema.sql) — tables, RLS, storage, profile trigger
   2. [`supabase_seed.sql`](./supabase_seed.sql) — food nutrition reference data
   3. (Optional) [`supabase_make_admin.sql`](./supabase_make_admin.sql) — promote a user to ADMIN

4. **Auth tip for demos:** Supabase → Authentication → Providers → Email → disable **Confirm email** so Sign Up logs users in immediately.

5. Open the app → **Sign Up** → **Analyze Meal** → upload a food photo.

---

## Features

- Email/password **Sign Up** and **Sign In** (Supabase Auth)
- Gemini Vision multi-food detection with portion grams + macros
- Meal history, daily targets, weekly analytics
- Editable portions / add / remove foods after analysis
- Profile goals (calories, protein, etc.)
- Admin panel (when user metadata `role` = `ADMIN`)

---

## SQL files

| File | Purpose |
|------|---------|
| `supabase_schema.sql` | Schema + RLS + storage bucket + auto profile on signup |
| `supabase_seed.sql` | ~70 reference foods (per 100g) |
| `supabase_make_admin.sql` | Set `role: ADMIN` on an existing auth user |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local Vite server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |

---

## Notes

- Nutrition values are AI estimates for education/personal tracking — not medical advice.
- Gemini model cascade: `gemini-3.8-flash` → `3.6` → `3.5` → `flash-latest`.
- Meal photos are stored in the public `meal-photos` Storage bucket under `{userId}/`.
