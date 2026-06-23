-- ============================================================
-- Run this SQL once in: Supabase Dashboard → SQL Editor → New Query
-- This creates the missing tables on the REMOTE Supabase database.
-- ============================================================

-- 1. Create administrators table (stores admin profiles linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for administrators" ON public.administrators;
CREATE POLICY "Allow public read access for administrators"
  ON public.administrators FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin write access for administrators" ON public.administrators;
CREATE POLICY "Allow admin write access for administrators"
  ON public.administrators FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Seed the default System Administrator profile
INSERT INTO public.administrators (id, email, name, role)
VALUES ('17ffd0c6-b5e2-418e-974f-9d7d0e2ab092', 'admin@kabiangaparish.org', 'System Administrator', 'super_admin')
ON CONFLICT (email) DO UPDATE SET
  id   = EXCLUDED.id,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- 3. Create site_settings table (stores dynamic branding/content)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for site_settings" ON public.site_settings;
CREATE POLICY "Allow public read access for site_settings"
  ON public.site_settings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin write access for site_settings" ON public.site_settings;
CREATE POLICY "Allow admin write access for site_settings"
  ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Seed initial site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('branding_name',    'Kabianga Catholic Parish'),
  ('history_content',  'St. John Paul II Kabianga Catholic Parish is a relatively young and rapidly growing parish within the Catholic Diocese of Kericho. Its emergence and growth are deeply intertwined with the educational expansion of the region.'),
  ('welcome_text',     'Welcome to Kabianga Catholic Parish'),
  ('contact_email',    'info@kabiangaparish.org'),
  ('contact_phone',    '+254 700 000 000'),
  ('contact_address',  'Kabianga, Kericho County, Kenya'),
  ('office_hours',     'Monday–Friday: 8am–5pm')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Verify with:
-- SELECT * FROM public.administrators;
-- SELECT * FROM public.site_settings;
