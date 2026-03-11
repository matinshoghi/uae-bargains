-- Deal Status Management: expired_reason, community reporting, auto-expiration

-- 1. Add expired_reason to deals (why the deal is expired)
-- Values: 'manual', 'out_of_stock', 'community', 'auto', 'admin'
ALTER TABLE deals ADD COLUMN expired_reason text DEFAULT NULL;

-- 2. Denormalized community report count (same pattern as upvote_count)
ALTER TABLE deals ADD COLUMN expire_report_count smallint NOT NULL DEFAULT 0;

-- 3. Track who reported a deal as expired (prevents duplicates, enables threshold)
CREATE TABLE deal_expire_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(deal_id, user_id)
);

CREATE INDEX idx_deal_expire_reports_deal ON deal_expire_reports(deal_id);

-- 4. RLS policies
ALTER TABLE deal_expire_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report deals as expired"
  ON deal_expire_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see own reports"
  ON deal_expire_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin/service role can delete reports (for reactivation cleanup)
CREATE POLICY "Service role can delete reports"
  ON deal_expire_reports FOR DELETE
  TO service_role
  USING (true);

-- 5. RPC for atomic report + increment
CREATE OR REPLACE FUNCTION increment_expire_report(p_deal_id uuid, p_user_id uuid)
RETURNS smallint AS $$
DECLARE
  new_count smallint;
BEGIN
  INSERT INTO deal_expire_reports (deal_id, user_id) VALUES (p_deal_id, p_user_id);
  UPDATE deals SET expire_report_count = expire_report_count + 1
  WHERE id = p_deal_id
  RETURNING expire_report_count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
