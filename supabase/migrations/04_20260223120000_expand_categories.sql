-- Expand categories to mirror Slickdeals parent categories
INSERT INTO categories (name, label, slug, icon, sort_order) VALUES
  ('home',          'Home & Garden',     'home',          'Home',       6),
  ('sports',        'Sports & Outdoors', 'sports',        'Dumbbell',   7),
  ('health-beauty', 'Health & Beauty',   'health-beauty', 'HeartPulse', 8),
  ('automotive',    'Automotive',        'automotive',    'Car',        9),
  ('office',        'Office & School',   'office',        'BookOpen',   10),
  ('toys',          'Toys & Baby',       'toys',          'Baby',       11),
  ('pets',          'Pet Supplies',      'pets',          'PawPrint',   12),
  ('video-games',   'Video Games',       'video-games',   'Gamepad2',   13),
  ('hobby',         'Hobby & Lifestyle', 'hobby',         'Sparkles',   14);
