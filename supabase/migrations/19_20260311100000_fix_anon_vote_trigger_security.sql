-- Fix: update_deal_anon_vote_counts() was missing SECURITY DEFINER.
-- The deals RLS policy only allows the deal owner to UPDATE their own deal,
-- so when the anon role triggered this function, the UPDATE deals SET upvote_count
-- was silently blocked by RLS — votes were saved but counts never changed.

CREATE OR REPLACE FUNCTION update_deal_anon_vote_counts() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 1 THEN
      UPDATE deals SET upvote_count = upvote_count + 1 WHERE id = NEW.deal_id;
    ELSE
      UPDATE deals SET downvote_count = downvote_count + 1 WHERE id = NEW.deal_id;
    END IF;
    UPDATE deals SET hot_score = calculate_hot_score(upvote_count, downvote_count, created_at)
    WHERE id = NEW.deal_id;
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Resync all deal vote counts to fix any past miscounts from the broken trigger
UPDATE deals SET
  upvote_count = (
    SELECT count(*) FROM votes WHERE votes.deal_id = deals.id AND votes.vote_type = 1
  ) + (
    SELECT count(*) FROM anonymous_votes WHERE anonymous_votes.deal_id = deals.id AND anonymous_votes.vote_type = 1
  ),
  downvote_count = (
    SELECT count(*) FROM votes WHERE votes.deal_id = deals.id AND votes.vote_type = -1
  ) + (
    SELECT count(*) FROM anonymous_votes WHERE anonymous_votes.deal_id = deals.id AND anonymous_votes.vote_type = -1
  );

-- Recalculate hot scores after fixing counts
UPDATE deals SET hot_score = calculate_hot_score(upvote_count, downvote_count, created_at);
