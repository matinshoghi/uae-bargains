-- ============================================================
-- Drop the unused affiliate_base_url column from stores
-- ============================================================
ALTER TABLE stores DROP COLUMN IF EXISTS affiliate_base_url;

-- ============================================================
-- Create store-logos storage bucket (public)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-logos', 'store-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public reads on store-logos
CREATE POLICY "Public read store logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-logos');

-- Allow service role (admin) to manage store logos
CREATE POLICY "Admin manage store logos"
  ON storage.objects FOR ALL
  USING (bucket_id = 'store-logos')
  WITH CHECK (bucket_id = 'store-logos');
