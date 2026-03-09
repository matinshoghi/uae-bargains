-- ============================================================
-- Stores table
-- ============================================================
CREATE TABLE stores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  website_url TEXT,
  affiliate_network  TEXT,
  affiliate_base_url TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Coupons table
-- ============================================================
CREATE TABLE coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code            TEXT,
  title           TEXT NOT NULL,
  description     TEXT,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage','flat','bogo','free_shipping','other')),
  discount_value  TEXT,
  min_purchase    TEXT,
  url             TEXT,
  affiliate_url   TEXT,
  expires_at      TIMESTAMPTZ,
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  click_count     INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_stores_slug       ON stores (slug);
CREATE INDEX idx_stores_is_active  ON stores (is_active);
CREATE INDEX idx_coupons_store_id  ON coupons (store_id);
CREATE INDEX idx_coupons_status    ON coupons (status);
CREATE INDEX idx_coupons_expires   ON coupons (expires_at);
CREATE INDEX idx_coupons_featured  ON coupons (is_featured) WHERE is_featured = true;

-- ============================================================
-- RLS — public read, admin writes via service role
-- ============================================================
ALTER TABLE stores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read stores"  ON stores  FOR SELECT USING (true);
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);

-- ============================================================
-- updated_at triggers (reuse handle_updated_at if it exists)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at'
  ) THEN
    CREATE FUNCTION handle_updated_at()
    RETURNS TRIGGER AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;
  END IF;
END
$$;

CREATE TRIGGER set_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- Atomic click counter
-- ============================================================
CREATE OR REPLACE FUNCTION increment_coupon_click(coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons SET click_count = click_count + 1 WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql;
