-- ============================================
-- Migration 07: Remove display_name, fix username trigger
-- ============================================
-- Simplifies the profile model to use username as the sole
-- public identity (no separate display name).
-- Updates handle_new_user() to sanitise the derived username
-- and handle uniqueness conflicts with a retry loop.
-- ============================================

-- 1. Drop the display_name column
ALTER TABLE profiles DROP COLUMN IF EXISTS display_name;

-- 2. Replace the trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  attempt INT := 0;
BEGIN
  -- Derive base username from Google preferred_username or email prefix
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(NEW.email, '@', 1)
  );

  -- Sanitize: only keep letters, numbers, hyphens, underscores
  base_username := regexp_replace(base_username, '[^a-zA-Z0-9_-]', '', 'g');

  -- Ensure minimum length of 3
  IF length(base_username) < 3 THEN
    base_username := base_username || substr(md5(random()::text), 1, 6);
  END IF;

  -- Truncate to 24 chars to leave room for numeric suffix
  base_username := left(base_username, 24);
  final_username := base_username;

  -- Retry loop: append random 4-digit suffix on conflict
  LOOP
    BEGIN
      INSERT INTO profiles (id, username, avatar_url)
      VALUES (
        NEW.id,
        final_username,
        NEW.raw_user_meta_data->>'avatar_url'
      );
      EXIT; -- success
    EXCEPTION WHEN unique_violation THEN
      attempt := attempt + 1;
      final_username := base_username || floor(random() * 9000 + 1000)::text;
      IF attempt > 10 THEN
        -- ultimate fallback
        final_username := 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8);
        INSERT INTO profiles (id, username, avatar_url)
        VALUES (
          NEW.id,
          final_username,
          NEW.raw_user_meta_data->>'avatar_url'
        );
        EXIT;
      END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
