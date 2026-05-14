-- Migration: Product listing flow columns + storage bucket
-- Date: 2026-05-14

BEGIN;

-- ============================================
-- 1. ADD MISSING COLUMNS TO PRODUCTS TABLE
-- ============================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS verification_video_url TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS saves_count INTEGER DEFAULT 0;

-- ============================================
-- 2. UPDATE CONDITION CONSTRAINT
--    Old values: 'new','like_new','good','fair','poor'
--    New values also include 'mint','excellent','very_good'
--    to match vendor app UI
-- ============================================

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_condition_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_condition_check
  CHECK (condition IN (
    'new', 'like_new', 'good', 'fair', 'poor',
    'mint', 'excellent', 'very_good'
  ));

-- ============================================
-- 3. PRODUCT-PHOTOS STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-photos',
  'product-photos',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access
DROP POLICY IF EXISTS "Product photos publicly readable" ON storage.objects;
CREATE POLICY "Product photos publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-photos');

-- Vendors can upload to their own folder (first path segment = user id)
DROP POLICY IF EXISTS "Vendors can upload product photos" ON storage.objects;
CREATE POLICY "Vendors can upload product photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-photos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Vendors can delete their own photos
DROP POLICY IF EXISTS "Vendors can delete own product photos" ON storage.objects;
CREATE POLICY "Vendors can delete own product photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-photos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

COMMIT;
