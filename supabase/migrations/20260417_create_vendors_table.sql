-- ── 1. Remove vendor columns incorrectly added to users ──────────────────
ALTER TABLE public.users
  DROP COLUMN IF EXISTS dob,
  DROP COLUMN IF EXISTS aadhaar_verified,
  DROP COLUMN IF EXISTS address_line1,
  DROP COLUMN IF EXISTS address_line2,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS state,
  DROP COLUMN IF EXISTS pincode,
  DROP COLUMN IF EXISTS gst_number,
  DROP COLUMN IF EXISTS instagram,
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS sell_tags,
  DROP COLUMN IF EXISTS upi_id,
  DROP COLUMN IF EXISTS setup_complete,
  DROP COLUMN IF EXISTS avatar_url;

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check
  CHECK (role = ANY (ARRAY['customer','admin','super_admin']));


-- ── 2. Create vendors table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendors (
  -- Identity — matches auth.users 1:1
  id                uuid          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- From signup
  full_name         text          NOT NULL DEFAULT '',
  email             text,
  phone             text,

  -- Step 0: KYC
  dob               text,                              -- DD/MM/YYYY
  aadhaar_verified  boolean       NOT NULL DEFAULT false,

  -- Step 1: Address
  address_line1     text,
  address_line2     text,
  city              text,
  state             text,
  pincode           text,
  whatsapp_number   text,
  gst_number        text,                              -- optional

  -- Step 2: Shop identity
  store_name        text,
  store_slug        text          UNIQUE,              -- auto-generated
  instagram         text,
  bio               text,
  sell_tags         text[]        NOT NULL DEFAULT '{}',

  -- Step 3: Payout
  upi_id            text,

  -- Platform / admin fields
  setup_complete    boolean       NOT NULL DEFAULT false,
  vendor_verified   boolean       NOT NULL DEFAULT false,
  commission_rate   numeric(5,2)  NOT NULL DEFAULT 20.00,
  avatar_url        text,

  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);


-- ── 3. Auto-update updated_at ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.vendors_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendors_updated_at ON public.vendors;
CREATE TRIGGER vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.vendors_set_updated_at();


-- ── 4. Auto-generate store_slug from store_name ───────────────────────────
CREATE OR REPLACE FUNCTION public.vendors_generate_slug()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  base_slug  text;
  final_slug text;
  counter    int := 0;
BEGIN
  IF NEW.store_name IS NOT NULL AND (NEW.store_slug IS NULL OR NEW.store_slug = '') THEN
    base_slug  := lower(regexp_replace(trim(NEW.store_name), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug  := trim(both '-' from base_slug);
    final_slug := base_slug;
    WHILE EXISTS (
      SELECT 1 FROM public.vendors WHERE store_slug = final_slug AND id != NEW.id
    ) LOOP
      counter    := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.store_slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS vendors_slug_trigger ON public.vendors;
CREATE TRIGGER vendors_slug_trigger
  BEFORE INSERT OR UPDATE OF store_name ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.vendors_generate_slug();


-- ── 5. RLS — no recursion, no self-joins on users ────────────────────────
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vendor_select_own"
  ON public.vendors FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "vendor_insert_own"
  ON public.vendors FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "vendor_update_own"
  ON public.vendors FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
