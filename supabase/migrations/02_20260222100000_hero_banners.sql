CREATE TABLE hero_banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
