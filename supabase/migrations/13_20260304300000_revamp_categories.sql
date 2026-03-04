-- ============================================
-- Revamp categories: replace 14 old categories with 16 new ones
-- Safe migration: reassigns all deals from removed categories before deleting them
-- ============================================

BEGIN;

-- ──────────────────────────────────────────────
-- 1. INSERT brand-new categories
-- ──────────────────────────────────────────────
INSERT INTO categories (name, label, slug, icon, sort_order) VALUES
  ('computing-software', 'Computing & Software', 'computing-software', 'Monitor',        2),
  ('gaming',             'Gaming',               'gaming',             'Gamepad2',        3),
  ('entertainment',      'Entertainment',        'entertainment',      'Film',           11),
  ('education',          'Education & Learning', 'education',          'GraduationCap',  12),
  ('kids-family',        'Kids & Family',        'kids-family',        'Baby',           13),
  ('services-finance',   'Services & Finance',   'services-finance',   'CreditCard',     15),
  ('other',              'Other',                'other',              'Package',        16);

-- ──────────────────────────────────────────────
-- 2. UPDATE existing categories (rename/re-sort to match new scheme)
-- ──────────────────────────────────────────────

-- electronics: keep slug, just fix sort order
UPDATE categories SET sort_order = 1 WHERE slug = 'electronics';

-- fashion: keep slug, fix sort order
UPDATE categories SET sort_order = 4 WHERE slug = 'fashion';

-- health-beauty: keep slug, fix sort order
UPDATE categories SET sort_order = 5 WHERE slug = 'health-beauty';

-- home → home-living (rename)
UPDATE categories SET name = 'home-living', label = 'Home & Living', slug = 'home-living', sort_order = 6 WHERE slug = 'home';

-- groceries: keep slug, fix sort order
UPDATE categories SET sort_order = 7 WHERE slug = 'groceries';

-- dining: keep slug, fix sort order
UPDATE categories SET sort_order = 8 WHERE slug = 'dining';

-- travel: keep slug, fix sort order
UPDATE categories SET sort_order = 9 WHERE slug = 'travel';

-- sports → sports-outdoors (rename)
UPDATE categories SET name = 'sports-outdoors', label = 'Sports & Outdoors', slug = 'sports-outdoors', sort_order = 10 WHERE slug = 'sports';

-- automotive: keep slug, fix sort order
UPDATE categories SET sort_order = 14 WHERE slug = 'automotive';

-- ──────────────────────────────────────────────
-- 3. REASSIGN deals from categories being removed → "other"
--    This ensures no deals are orphaned or deleted
-- ──────────────────────────────────────────────

-- video-games deals → gaming
UPDATE deals SET category_id = (SELECT id FROM categories WHERE slug = 'gaming')
  WHERE category_id = (SELECT id FROM categories WHERE slug = 'video-games');

-- toys deals → kids-family
UPDATE deals SET category_id = (SELECT id FROM categories WHERE slug = 'kids-family')
  WHERE category_id = (SELECT id FROM categories WHERE slug = 'toys');

-- office deals → other
UPDATE deals SET category_id = (SELECT id FROM categories WHERE slug = 'other')
  WHERE category_id = (SELECT id FROM categories WHERE slug = 'office');

-- pets deals → other
UPDATE deals SET category_id = (SELECT id FROM categories WHERE slug = 'other')
  WHERE category_id = (SELECT id FROM categories WHERE slug = 'pets');

-- hobby deals → other
UPDATE deals SET category_id = (SELECT id FROM categories WHERE slug = 'other')
  WHERE category_id = (SELECT id FROM categories WHERE slug = 'hobby');

-- ──────────────────────────────────────────────
-- 4. DELETE removed categories (now safe — no deals reference them)
-- ──────────────────────────────────────────────
DELETE FROM categories WHERE slug IN ('video-games', 'toys', 'office', 'pets', 'hobby');

COMMIT;
