-- ============================================================
-- Phase 2: Coupon community features
-- User submissions, feedback, success rates, auto-expiry
-- ============================================================

-- ── Extend coupons table ────────────────────────────────────
ALTER TABLE coupons
  ADD COLUMN submitted_by UUID REFERENCES profiles(id),
  ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('pending','approved','rejected')),
  ADD COLUMN moderation_note TEXT,
  ADD COLUMN success_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN fail_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_coupons_moderation ON coupons(moderation_status);

-- ── Coupon feedback table ───────────────────────────────────
CREATE TABLE coupon_feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  anon_id     TEXT NOT NULL,
  ip_address  TEXT,
  worked      BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX coupon_feedback_unique ON coupon_feedback(coupon_id, anon_id);
CREATE INDEX idx_coupon_feedback_coupon ON coupon_feedback(coupon_id);

-- RLS
ALTER TABLE coupon_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read feedback"  ON coupon_feedback FOR SELECT USING (true);
CREATE POLICY "Public insert feedback" ON coupon_feedback FOR INSERT WITH CHECK (true);

-- ── Trigger: sync success/fail counts on coupons ────────────
CREATE OR REPLACE FUNCTION update_coupon_feedback_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.worked THEN
      UPDATE coupons SET success_count = success_count + 1 WHERE id = NEW.coupon_id;
    ELSE
      UPDATE coupons SET fail_count = fail_count + 1 WHERE id = NEW.coupon_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.worked THEN
      UPDATE coupons SET success_count = greatest(success_count - 1, 0) WHERE id = OLD.coupon_id;
    ELSE
      UPDATE coupons SET fail_count = greatest(fail_count - 1, 0) WHERE id = OLD.coupon_id;
    END IF;
  END IF;
  RETURN coalesce(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coupon_feedback_counts
  AFTER INSERT OR DELETE ON coupon_feedback
  FOR EACH ROW EXECUTE FUNCTION update_coupon_feedback_counts();
