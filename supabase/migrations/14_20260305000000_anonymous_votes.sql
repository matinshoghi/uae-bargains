-- Anonymous votes: allows non-authenticated users to vote on deals
-- Kept separate from `votes` for clean separation and easy rollback

CREATE TABLE anonymous_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id TEXT NOT NULL,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (1, -1)),
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (anon_id, deal_id)
);

CREATE INDEX idx_anonymous_votes_deal ON anonymous_votes(deal_id);
CREATE INDEX idx_anonymous_votes_anon ON anonymous_votes(anon_id);
CREATE INDEX idx_anonymous_votes_ip_day ON anonymous_votes(ip_address, created_at);

-- RLS
ALTER TABLE anonymous_votes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous (anon role) to insert, update, delete their own rows
CREATE POLICY "anon_insert" ON anonymous_votes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select" ON anonymous_votes FOR SELECT TO anon USING (true);
CREATE POLICY "anon_update" ON anonymous_votes FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete" ON anonymous_votes FOR DELETE TO anon USING (true);

-- Authenticated users can also read/write (for merge on signup)
CREATE POLICY "auth_all" ON anonymous_votes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role bypasses RLS automatically

-- Trigger to update deal vote counts when anonymous votes change
CREATE OR REPLACE FUNCTION update_deal_anon_vote_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 1 THEN
      UPDATE deals SET upvote_count = upvote_count + 1 WHERE id = NEW.deal_id;
    ELSE
      UPDATE deals SET downvote_count = downvote_count + 1 WHERE id = NEW.deal_id;
    END IF;
    -- Recalculate hot_score
    UPDATE deals SET hot_score = calculate_hot_score(upvote_count, downvote_count, created_at)
    WHERE id = NEW.deal_id;
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Vote direction changed
    IF OLD.vote_type = 1 THEN
      UPDATE deals SET upvote_count = upvote_count - 1 WHERE id = OLD.deal_id;
    ELSE
      UPDATE deals SET downvote_count = downvote_count - 1 WHERE id = OLD.deal_id;
    END IF;
    IF NEW.vote_type = 1 THEN
      UPDATE deals SET upvote_count = upvote_count + 1 WHERE id = NEW.deal_id;
    ELSE
      UPDATE deals SET downvote_count = downvote_count + 1 WHERE id = NEW.deal_id;
    END IF;
    UPDATE deals SET hot_score = calculate_hot_score(upvote_count, downvote_count, created_at)
    WHERE id = NEW.deal_id;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 1 THEN
      UPDATE deals SET upvote_count = upvote_count - 1 WHERE id = OLD.deal_id;
    ELSE
      UPDATE deals SET downvote_count = downvote_count - 1 WHERE id = OLD.deal_id;
    END IF;
    UPDATE deals SET hot_score = calculate_hot_score(upvote_count, downvote_count, created_at)
    WHERE id = OLD.deal_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_anonymous_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON anonymous_votes
  FOR EACH ROW EXECUTE FUNCTION update_deal_anon_vote_counts();
