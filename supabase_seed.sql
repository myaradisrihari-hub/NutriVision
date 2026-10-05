-- ============================================================
-- NutriVision AI – Food Items Seed Data
-- Run AFTER supabase_schema.sql in Supabase SQL Editor
-- Values are per 100g (standard nutrition reference)
-- ============================================================

-- Clear and reseed (safe for development / academic demos)
truncate table public.food_items restart identity cascade;

insert into public.food_items
  (name, category, serving_size, serving_unit, calories, protein_g, carbohydrates_g, fat_g, fiber_g, sugar_g, sodium_mg, is_verified)
values
  -- Grains & Staples
  ('Cooked White Rice', 'Grain', 100, 'g', 130, 2.7, 28.2, 0.3, 0.4, 0.1, 1, true),
  ('Cooked Brown Rice', 'Grain', 100, 'g', 112, 2.3, 23.5, 0.9, 1.8, 0.4, 5, true),
  ('Chapati / Roti', 'Grain', 100, 'g', 297, 11.0, 46.0, 7.5, 4.9, 1.2, 400, true),
  ('Naan Bread', 'Grain', 100, 'g', 310, 9.0, 50.0, 8.0, 2.0, 3.0, 480, true),
  ('Idli', 'Grain', 100, 'g', 120, 4.0, 22.0, 0.5, 1.5, 0.5, 250, true),
  ('Dosa (Plain)', 'Grain', 100, 'g', 168, 4.0, 28.0, 4.5, 1.2, 0.8, 280, true),
  ('Masala Dosa', 'Grain', 100, 'g', 195, 4.5, 30.0, 6.5, 2.0, 1.5, 320, true),
  ('Poha', 'Grain', 100, 'g', 150, 3.0, 28.0, 3.5, 1.5, 1.0, 350, true),
  ('Upma', 'Grain', 100, 'g', 145, 3.5, 24.0, 4.0, 2.0, 1.0, 400, true),
  ('Pasta (Cooked)', 'Grain', 100, 'g', 131, 5.0, 25.0, 1.1, 1.8, 0.6, 1, true),
  ('White Bread', 'Grain', 100, 'g', 265, 9.0, 49.0, 3.2, 2.7, 5.0, 490, true),
  ('Quinoa (Cooked)', 'Grain', 100, 'g', 120, 4.4, 21.3, 1.9, 2.8, 0.9, 7, true),

  -- Proteins
  ('Chicken Breast (Grilled)', 'Protein', 100, 'g', 165, 31.0, 0.0, 3.6, 0.0, 0.0, 74, true),
  ('Chicken Curry', 'Protein', 100, 'g', 180, 14.0, 6.0, 11.0, 1.5, 2.0, 450, true),
  ('Egg (Boiled)', 'Protein', 100, 'g', 155, 13.0, 1.1, 11.0, 0.0, 1.1, 124, true),
  ('Egg Omelette', 'Protein', 100, 'g', 180, 12.0, 1.5, 14.0, 0.0, 1.0, 200, true),
  ('Paneer', 'Protein', 100, 'g', 265, 18.0, 1.2, 20.8, 0.0, 0.5, 20, true),
  ('Paneer Butter Masala', 'Protein', 100, 'g', 220, 10.0, 8.0, 17.0, 1.5, 4.0, 480, true),
  ('Dal (Cooked Lentils)', 'Protein', 100, 'g', 116, 9.0, 20.0, 0.4, 8.0, 1.8, 5, true),
  ('Dal Tadka', 'Protein', 100, 'g', 140, 8.5, 16.0, 5.0, 5.0, 1.5, 380, true),
  ('Chickpeas (Cooked)', 'Protein', 100, 'g', 164, 8.9, 27.4, 2.6, 7.6, 4.8, 7, true),
  ('Chole / Chickpea Curry', 'Protein', 100, 'g', 160, 7.0, 18.0, 7.0, 5.0, 3.0, 420, true),
  ('Fish (Grilled)', 'Protein', 100, 'g', 150, 26.0, 0.0, 5.0, 0.0, 0.0, 80, true),
  ('Fish Curry', 'Protein', 100, 'g', 140, 16.0, 4.0, 7.0, 0.8, 1.5, 400, true),
  ('Mutton Curry', 'Protein', 100, 'g', 210, 18.0, 4.0, 14.0, 0.5, 1.5, 450, true),
  ('Tofu', 'Protein', 100, 'g', 76, 8.0, 1.9, 4.8, 0.3, 0.6, 7, true),
  ('Greek Yogurt (Plain)', 'Protein', 100, 'g', 97, 9.0, 3.6, 5.0, 0.0, 3.6, 36, true),
  ('Curd / Dahi', 'Protein', 100, 'g', 60, 3.5, 4.5, 3.0, 0.0, 4.5, 40, true),

  -- Vegetables
  ('Mixed Salad', 'Vegetable', 100, 'g', 25, 1.5, 4.0, 0.3, 2.0, 2.0, 15, true),
  ('Cucumber', 'Vegetable', 100, 'g', 15, 0.7, 3.6, 0.1, 0.5, 1.7, 2, true),
  ('Tomato', 'Vegetable', 100, 'g', 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, true),
  ('Spinach (Cooked)', 'Vegetable', 100, 'g', 23, 2.9, 3.6, 0.3, 2.2, 0.4, 70, true),
  ('Broccoli', 'Vegetable', 100, 'g', 34, 2.8, 7.0, 0.4, 2.6, 1.7, 33, true),
  ('Potato (Boiled)', 'Vegetable', 100, 'g', 87, 1.9, 20.0, 0.1, 1.8, 0.9, 5, true),
  ('Aloo Gobi', 'Vegetable', 100, 'g', 110, 2.5, 14.0, 5.5, 3.0, 2.5, 350, true),
  ('Palak Paneer', 'Vegetable', 100, 'g', 180, 10.0, 6.0, 13.0, 2.0, 2.0, 400, true),
  ('Mixed Vegetable Curry', 'Vegetable', 100, 'g', 95, 2.5, 10.0, 5.0, 3.0, 3.0, 380, true),
  ('Sambar', 'Vegetable', 100, 'g', 70, 3.5, 10.0, 2.0, 3.0, 2.0, 400, true),
  ('Coconut Chutney', 'Condiment', 100, 'g', 180, 2.5, 8.0, 16.0, 3.0, 3.0, 300, true),
  ('Green Salad with Dressing', 'Vegetable', 100, 'g', 80, 1.5, 5.0, 6.0, 2.0, 2.5, 200, true),

  -- Fruits
  ('Apple', 'Fruit', 100, 'g', 52, 0.3, 14.0, 0.2, 2.4, 10.0, 1, true),
  ('Banana', 'Fruit', 100, 'g', 89, 1.1, 23.0, 0.3, 2.6, 12.0, 1, true),
  ('Orange', 'Fruit', 100, 'g', 47, 0.9, 12.0, 0.1, 2.4, 9.0, 0, true),
  ('Grapes', 'Fruit', 100, 'g', 69, 0.7, 18.0, 0.2, 0.9, 16.0, 2, true),
  ('Mango', 'Fruit', 100, 'g', 60, 0.8, 15.0, 0.4, 1.6, 14.0, 1, true),
  ('Watermelon', 'Fruit', 100, 'g', 30, 0.6, 8.0, 0.2, 0.4, 6.0, 1, true),
  ('Papaya', 'Fruit', 100, 'g', 43, 0.5, 11.0, 0.3, 1.7, 8.0, 3, true),
  ('Mixed Fruit Plate', 'Fruit', 100, 'g', 55, 0.7, 13.0, 0.3, 2.0, 10.0, 2, true),

  -- Fast Food / Western
  ('Pizza (Cheese)', 'Fast Food', 100, 'g', 266, 11.0, 33.0, 10.0, 2.3, 3.6, 598, true),
  ('Pizza Slice (Pepperoni)', 'Fast Food', 100, 'g', 280, 12.0, 32.0, 12.0, 2.0, 3.5, 650, true),
  ('Hamburger', 'Fast Food', 100, 'g', 295, 17.0, 24.0, 14.0, 1.5, 4.0, 480, true),
  ('Cheeseburger', 'Fast Food', 100, 'g', 303, 16.0, 28.0, 14.0, 1.3, 5.0, 550, true),
  ('French Fries', 'Fast Food', 100, 'g', 312, 3.4, 41.0, 15.0, 3.8, 0.3, 210, true),
  ('Fried Chicken', 'Fast Food', 100, 'g', 280, 20.0, 12.0, 17.0, 0.5, 0.5, 650, true),
  ('Hot Dog', 'Fast Food', 100, 'g', 290, 10.0, 18.0, 20.0, 0.8, 3.0, 800, true),
  ('Sandwich (Veg)', 'Fast Food', 100, 'g', 220, 8.0, 30.0, 8.0, 3.0, 4.0, 450, true),
  ('Biryani (Chicken)', 'Grain', 100, 'g', 180, 10.0, 22.0, 6.5, 1.5, 1.5, 400, true),
  ('Biryani (Veg)', 'Grain', 100, 'g', 160, 4.0, 25.0, 5.5, 2.0, 2.0, 380, true),

  -- Snacks & Sweets
  ('Samosa', 'Snack', 100, 'g', 262, 5.0, 28.0, 15.0, 3.0, 2.0, 400, true),
  ('Pakora', 'Snack', 100, 'g', 280, 6.0, 25.0, 18.0, 3.0, 2.0, 450, true),
  ('Vada', 'Snack', 100, 'g', 250, 6.0, 28.0, 13.0, 4.0, 1.5, 400, true),
  ('Chocolate Cake', 'Dessert', 100, 'g', 370, 5.0, 50.0, 17.0, 2.0, 35.0, 300, true),
  ('Ice Cream (Vanilla)', 'Dessert', 100, 'g', 207, 3.5, 24.0, 11.0, 0.7, 21.0, 80, true),
  ('Gulab Jamun', 'Dessert', 100, 'g', 300, 4.0, 45.0, 12.0, 0.5, 40.0, 50, true),
  ('Kheer', 'Dessert', 100, 'g', 140, 3.5, 22.0, 4.5, 0.2, 18.0, 40, true),

  -- Beverages (per 100ml approx)
  ('Soft Drink / Cola', 'Beverage', 100, 'ml', 42, 0.0, 10.6, 0.0, 0.0, 10.6, 4, true),
  ('Fresh Orange Juice', 'Beverage', 100, 'ml', 45, 0.7, 10.4, 0.2, 0.2, 8.0, 1, true),
  ('Lassi (Sweet)', 'Beverage', 100, 'ml', 80, 3.0, 12.0, 2.5, 0.0, 11.0, 40, true),
  ('Milk (Whole)', 'Beverage', 100, 'ml', 61, 3.2, 4.8, 3.3, 0.0, 5.0, 40, true),
  ('Black Coffee', 'Beverage', 100, 'ml', 2, 0.1, 0.0, 0.0, 0.0, 0.0, 2, true),
  ('Masala Chai with Milk', 'Beverage', 100, 'ml', 45, 1.5, 6.0, 1.8, 0.0, 5.5, 20, true),

  -- Condiments
  ('Tomato Ketchup', 'Condiment', 100, 'g', 112, 1.0, 27.0, 0.1, 0.3, 22.0, 900, true),
  ('Mayonnaise', 'Condiment', 100, 'g', 680, 1.0, 0.6, 75.0, 0.0, 0.6, 635, true),
  ('Pickle (Indian)', 'Condiment', 100, 'g', 120, 1.5, 10.0, 8.0, 2.0, 5.0, 1200, true),
  ('Butter', 'Condiment', 100, 'g', 717, 0.9, 0.1, 81.0, 0.0, 0.1, 11, true),
  ('Ghee', 'Condiment', 100, 'g', 900, 0.0, 0.0, 100.0, 0.0, 0.0, 0, true),
  ('Olive Oil', 'Condiment', 100, 'g', 884, 0.0, 0.0, 100.0, 0.0, 0.0, 2, true);

-- Optional: promote a user to ADMIN (replace email after they register)
-- update auth.users
-- set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"ADMIN"}'::jsonb
-- where email = 'your-admin@email.com';
