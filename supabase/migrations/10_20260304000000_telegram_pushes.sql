CREATE TABLE telegram_pushes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  pushed_by UUID NOT NULL REFERENCES profiles(id),
  telegram_message_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX telegram_pushes_deal_id_idx ON telegram_pushes(deal_id);

