CREATE TABLE seed_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seed_accounts ENABLE ROW LEVEL SECURITY;
-- No RLS policies = only accessible via service_role key
