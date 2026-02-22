-- Allow deals and comments to remain after account deletion (anonymized as [deleted])
ALTER TABLE deals ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;
