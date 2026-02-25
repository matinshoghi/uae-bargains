ALTER TABLE hero_banners
  ADD COLUMN banner_type TEXT NOT NULL DEFAULT 'image',
  ADD COLUMN title TEXT,
  ADD COLUMN subtitle TEXT,
  ADD COLUMN button_text TEXT,
  ADD COLUMN button_url TEXT;

ALTER TABLE hero_banners
  ADD CONSTRAINT chk_dynamic_fields
  CHECK (
    banner_type = 'image'
    OR (banner_type = 'dynamic' AND title IS NOT NULL)
  );
