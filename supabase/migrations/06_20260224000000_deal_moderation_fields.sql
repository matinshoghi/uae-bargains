-- Add moderation metadata to deals
-- removed_by: 'admin' or 'author' to distinguish who removed the deal
-- removal_reason: optional reason when admin removes a deal
ALTER TABLE deals ADD COLUMN removed_by text;
ALTER TABLE deals ADD COLUMN removal_reason text;
