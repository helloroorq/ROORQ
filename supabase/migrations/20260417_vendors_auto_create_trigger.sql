-- Auto-create vendors row when a new auth user signs up.
-- Reads full_name and phone from user metadata set during signUp().
-- ON CONFLICT DO NOTHING ensures re-runs are safe.

CREATE OR REPLACE FUNCTION public.handle_new_vendor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.vendors (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_vendor ON auth.users;
CREATE TRIGGER on_auth_user_created_vendor
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_vendor();
