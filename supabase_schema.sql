-- ============================================================
-- NutriVision AI – Supabase Schema (idempotent)
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Helper: check admin via user_metadata.role ───────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'ADMIN'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN',
    false
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references auth.users(id) on delete cascade not null unique,
  name                  text not null,
  email                 text not null,
  age                   int default 24,
  gender                text default 'Male',
  height_cm             numeric default 172,
  weight_kg             numeric default 68,
  activity_level        text default 'Moderately Active',
  dietary_preference    text default 'Non-Vegetarian',
  fitness_goal          text default 'General Health',
  daily_calorie_target  int default 2200,
  daily_protein_target  int default 90,
  daily_carbs_target    int default 260,
  daily_fat_target      int default 65,
  daily_fiber_target    int default 30,
  water_target_liters   numeric default 3.0,
  updated_at            timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = user_id);

create policy "Admins can view all profiles"
  on public.profiles for select using (public.is_admin());

-- Auto-create profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (user_id) do update
    set name = excluded.name,
        email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── food_analyses ─────────────────────────────────────────────────────────────
create table if not exists public.food_analyses (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references auth.users(id) on delete cascade not null,
  image_url            text,
  meal_type            text not null,
  meal_name            text,
  meal_description     text,
  timestamp            timestamptz default now(),
  foods                jsonb default '[]',
  totals               jsonb default '{}',
  summary              text,
  recommendations      jsonb default '[]',
  positive_observations jsonb default '[]',
  nutritional_gaps     jsonb default '[]',
  healthier_alternatives jsonb default '[]',
  notes                text,
  ai_provider          text default 'Gemini Vision',
  processing_time_ms   int
);

alter table public.food_analyses enable row level security;

drop policy if exists "Users can view their own analyses" on public.food_analyses;
drop policy if exists "Users can insert their own analyses" on public.food_analyses;
drop policy if exists "Users can update their own analyses" on public.food_analyses;
drop policy if exists "Users can delete their own analyses" on public.food_analyses;
drop policy if exists "Admins can view all analyses" on public.food_analyses;

create policy "Users can view their own analyses"
  on public.food_analyses for select using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert their own analyses"
  on public.food_analyses for insert with check (auth.uid() = user_id);

create policy "Users can update their own analyses"
  on public.food_analyses for update using (auth.uid() = user_id);

create policy "Users can delete their own analyses"
  on public.food_analyses for delete using (auth.uid() = user_id);

create policy "Admins can view all analyses"
  on public.food_analyses for select using (public.is_admin());

-- ── food_items ────────────────────────────────────────────────────────────────
create table if not exists public.food_items (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  category        text not null,
  serving_size    numeric default 100,
  serving_unit    text default 'g',
  calories        numeric not null,
  protein_g       numeric default 0,
  carbohydrates_g numeric default 0,
  fat_g           numeric default 0,
  fiber_g         numeric default 0,
  sugar_g         numeric default 0,
  sodium_mg       numeric default 0,
  is_verified     boolean default false
);

alter table public.food_items enable row level security;

drop policy if exists "Anyone can view food items" on public.food_items;
drop policy if exists "Admins can manage food items" on public.food_items;
drop policy if exists "Authenticated users can insert food items" on public.food_items;

create policy "Anyone can view food items"
  on public.food_items for select using (true);

create policy "Admins can manage food items"
  on public.food_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- ── Storage: meal-photos ──────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload meal photos" on storage.objects;
drop policy if exists "Anyone can view meal photos" on storage.objects;
drop policy if exists "Users can update own meal photos" on storage.objects;
drop policy if exists "Users can delete own meal photos" on storage.objects;

create policy "Authenticated users can upload meal photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'meal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Anyone can view meal photos"
  on storage.objects for select
  using (bucket_id = 'meal-photos');

create policy "Users can update own meal photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'meal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own meal photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'meal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_food_analyses_user_id on public.food_analyses(user_id);
create index if not exists idx_food_analyses_timestamp on public.food_analyses(timestamp desc);
create index if not exists idx_food_items_name on public.food_items(name);
create index if not exists idx_profiles_user_id on public.profiles(user_id);

-- Done. Next: run supabase_seed.sql to populate the food reference database.
