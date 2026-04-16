-- migrate:up

INSERT INTO foods
  (user_id, category_id, type_id, name, calories_per_unit, protein_per_unit, carbs_per_unit, fat_per_unit, unit_label)
SELECT
  1,
  fc.id,
  ft.id,
  v.name,
  v.calories,
  v.protein,
  v.carbs,
  v.fat,
  v.unit_label
FROM (VALUES
  ('Chicken Breast',  'Meat',        'Whole Food',      165,  31.0,  0.0,  3.6, '100g'),
  ('Brown Rice',      'Grains',      'Whole Food',       216,   5.0, 45.0,  1.8, '100g cooked'),
  ('Banana',          'Fruit',       'Whole Food',        89,   1.1, 23.0,  0.3, 'medium (118g)'),
  ('Greek Yoghurt',   'Dairy',       'Semi-Processed',    97,   9.0,  3.6,  5.0, '100g'),
  ('Broccoli',        'Vegetable',   'Whole Food',        34,   2.8,  6.6,  0.4, '100g'),
  ('Almonds',         'Nuts & Seeds','Whole Food',       579,  21.0, 22.0, 50.0, '100g'),
  ('Salmon Fillet',   'Seafood',     'Whole Food',       208,  20.0,  0.0, 13.0, '100g'),
  ('Whole Milk',      'Dairy',       'Whole Food',        61,   3.2,  4.8,  3.3, '100ml'),
  ('Lentils',         'Legumes',     'Whole Food',       116,   9.0, 20.0,  0.4, '100g cooked'),
  ('Potato Chips',    'Snacks',      'Processed',        536,   7.0, 53.0, 35.0, '100g'),
  ('Oat Porridge',    'Grains',      'Semi-Processed',    71,   2.5, 12.0,  1.4, '100g cooked'),
  ('Egg (whole)',     'Meat',        'Whole Food',       155,  13.0,  1.1, 11.0, '100g (≈2 eggs)'),
  ('Avocado',         'Fruit',       'Whole Food',       160,   2.0,  9.0, 15.0, '100g'),
  ('Protein Bar',     'Snacks',      'Processed',        380,  25.0, 40.0, 10.0, 'per bar (65g)'),
  ('Black Beans',     'Legumes',     'Whole Food',       132,   8.9, 24.0,  0.5, '100g cooked')
) AS v(name, category, type, calories, protein, carbs, fat, unit_label)
JOIN food_categories fc ON fc.name = v.category
JOIN food_types      ft ON ft.name = v.type;

-- migrate:down
