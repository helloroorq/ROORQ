-- Add vendor onboarding columns to public.users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS dob              text,
  ADD COLUMN IF NOT EXISTS aadhaar_verified boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS address_line1    text,
  ADD COLUMN IF NOT EXISTS address_line2    text,
  ADD COLUMN IF NOT EXISTS city             text,
  ADD COLUMN IF NOT EXISTS state            text,
  ADD COLUMN IF NOT EXISTS pincode          text,
  ADD COLUMN IF NOT EXISTS gst_number       text,
  ADD COLUMN IF NOT EXISTS instagram        text,
  ADD COLUMN IF NOT EXISTS bio              text,
  ADD COLUMN IF NOT EXISTS sell_tags        text[]       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS upi_id           text,
  ADD COLUMN IF NOT EXISTS setup_complete   boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avatar_url       text;

-- Allow 'vendor' as a valid role
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role = ANY (ARRAY['customer','vendor','admin','super_admin']));
