-- ============================================================
-- Add slug column to deals for SEO-friendly URLs
-- Backfill existing deals with slugs generated from titles
-- ============================================================

-- ── Add slug column ─────────────────────────────────────────
ALTER TABLE deals ADD COLUMN slug TEXT UNIQUE;

-- ── Backfill existing deals ─────────────────────────────────
-- Generate slugs from titles: lowercase, hyphens, strip special chars, max 80 chars
UPDATE deals
SET slug = left(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        lower(title),
        '[^a-z0-9\s-]', '', 'g'   -- strip non-alphanumeric
      ),
      '[\s-]+', '-', 'g'          -- collapse whitespace/hyphens
    ),
    '^-+|-+$', '', 'g'            -- trim leading/trailing hyphens
  ),
  80
);

-- Handle any duplicate slugs by appending row number
WITH dupes AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) AS rn
  FROM deals
  WHERE slug IN (SELECT slug FROM deals GROUP BY slug HAVING COUNT(*) > 1)
)
UPDATE deals
SET slug = deals.slug || '-' || dupes.rn
FROM dupes
WHERE deals.id = dupes.id AND dupes.rn > 1;

-- Handle any null/empty slugs (edge case)
UPDATE deals SET slug = 'deal-' || left(id::text, 8) WHERE slug IS NULL OR slug = '';

-- ── Make slug NOT NULL now that all rows have values ────────
ALTER TABLE deals ALTER COLUMN slug SET NOT NULL;

-- ── Index for fast lookups ──────────────────────────────────
CREATE INDEX idx_deals_slug ON deals(slug);
