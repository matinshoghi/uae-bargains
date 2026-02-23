-- Update hot_score formula: add +3 base score so new deals float to top
-- Previously: net_score = GREATEST(upvote_count - downvote_count - 1, 0)
-- New: net_score = GREATEST(upvote_count - downvote_count + 3, 0)
-- This prevents the "zero-score trap" where unvoted deals rank below old deals with 1-2 artificial upvotes

CREATE OR REPLACE FUNCTION calculate_hot_score(
  p_upvotes INTEGER,
  p_downvotes INTEGER,
  p_created_at TIMESTAMPTZ
) RETURNS FLOAT AS $$
DECLARE
  net_score FLOAT;
  hours FLOAT;
BEGIN
  net_score := GREATEST(p_upvotes - p_downvotes + 3, 0);
  hours := EXTRACT(EPOCH FROM (now() - p_created_at)) / 3600.0;
  RETURN net_score / POWER(hours + 2, 1.5);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recalculate all active deals with the new formula
UPDATE deals
SET hot_score = calculate_hot_score(upvote_count, downvote_count, created_at)
WHERE status = 'active';
