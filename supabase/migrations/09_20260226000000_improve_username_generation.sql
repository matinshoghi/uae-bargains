-- ============================================
-- Migration 09: Improve username generation & display name for Google OAuth
-- ============================================
-- 1. Google OAuth provides full_name / name (e.g. "Pouya Jafari")
--    but NOT preferred_username. Derive usernames from the real name,
--    producing "pouya-jafari" instead of "pouyajafari121".
-- 2. Set the Supabase auth display_name to Google's full_name so
--    the dashboard column shows the real name, not "user 0".
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  attempt INT := 0;
BEGIN
  -- Derive base username: prefer Google name fields, fall back to email prefix
  base_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1)
  );

  -- Lowercase
  base_username := lower(base_username);

  -- Replace spaces with hyphens ("pouya jafari" -> "pouya-jafari")
  base_username := regexp_replace(base_username, '\s+', '-', 'g');

  -- Strip everything except letters, numbers, hyphens, underscores
  base_username := regexp_replace(base_username, '[^a-z0-9_-]', '', 'g');

  -- Collapse consecutive hyphens
  base_username := regexp_replace(base_username, '-{2,}', '-', 'g');

  -- Trim leading/trailing hyphens
  base_username := TRIM(BOTH '-' FROM base_username);

  -- Ensure minimum length of 3
  IF length(base_username) < 3 THEN
    base_username := base_username || substr(md5(random()::text), 1, 6);
  END IF;

  -- Truncate to 24 chars to leave room for numeric suffix
  base_username := left(base_username, 24);
  final_username := base_username;

  -- Set Supabase auth display_name to Google's full_name if available
  IF NEW.raw_user_meta_data->>'full_name' IS NOT NULL
     AND TRIM(NEW.raw_user_meta_data->>'full_name') <> '' THEN
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
      'display_name', TRIM(NEW.raw_user_meta_data->>'full_name')
    )
    WHERE id = NEW.id;
  END IF;

  -- Retry loop: append random 4-digit suffix on conflict
  LOOP
    BEGIN
      INSERT INTO public.profiles (id, username, avatar_url, reputation, is_admin)
      VALUES (
        NEW.id,
        final_username,
        NEW.raw_user_meta_data->>'avatar_url',
        0,
        false
      );
      EXIT; -- success
    EXCEPTION WHEN unique_violation THEN
      attempt := attempt + 1;
      final_username := base_username || floor(random() * 9000 + 1000)::text;
      IF attempt > 10 THEN
        final_username := 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8);
        INSERT INTO public.profiles (id, username, avatar_url, reputation, is_admin)
        VALUES (
          NEW.id,
          final_username,
          NEW.raw_user_meta_data->>'avatar_url',
          0,
          false
        );
        EXIT;
      END IF;
    END;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
