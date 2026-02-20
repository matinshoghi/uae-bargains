-- ============================================
-- Check if cron jobs are already set up
-- Run these queries in Supabase SQL Editor
-- ============================================

-- 1. List all existing cron jobs
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
ORDER BY jobid;

-- 2. Check specifically for the two required jobs
SELECT 
  jobid,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname IN ('recalculate-hot-scores', 'expire-deals');

-- 3. Check if pg_cron extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- ============================================
-- If jobs don't exist, run these to create them:
-- ============================================

-- Recalculate hot scores every 15 minutes
SELECT cron.schedule(
  'recalculate-hot-scores',
  '*/15 * * * *',
  $$
  UPDATE deals
  SET hot_score = calculate_hot_score(upvote_count, downvote_count, created_at)
  WHERE status = 'active'
  $$
);

-- Expire deals every hour
SELECT cron.schedule(
  'expire-deals',
  '0 * * * *',
  $$
  UPDATE deals
  SET status = 'expired'
  WHERE expires_at < now()
    AND status = 'active'
  $$
);

-- ============================================
-- To remove a cron job (if needed):
-- ============================================
-- SELECT cron.unschedule('recalculate-hot-scores');
-- SELECT cron.unschedule('expire-deals');
