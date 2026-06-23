-- 1. Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for public read and authenticated write
DROP POLICY IF EXISTS "Allow public read access for site_settings" ON public.site_settings;
CREATE POLICY "Allow public read access for site_settings" ON public.site_settings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin write access for site_settings" ON public.site_settings;
CREATE POLICY "Allow admin write access for site_settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed initial site branding settings
INSERT INTO public.site_settings (key, value) VALUES
('branding_name', 'Kabianga Catholic Parish'),
('history_content', 'St. John Paul II Kabianga Catholic Parish is a relatively young and rapidly growing parish within the Catholic Diocese of Kericho. Its emergence and growth are deeply intertwined with the educational expansion of the region.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Alter daily_readings to add structured columns
ALTER TABLE public.daily_readings 
ADD COLUMN IF NOT EXISTS first_reading_en TEXT,
ADD COLUMN IF NOT EXISTS first_reading_sw TEXT,
ADD COLUMN IF NOT EXISTS second_reading_en TEXT,
ADD COLUMN IF NOT EXISTS second_reading_sw TEXT,
ADD COLUMN IF NOT EXISTS psalm_en TEXT,
ADD COLUMN IF NOT EXISTS psalm_sw TEXT,
ADD COLUMN IF NOT EXISTS gospel_en TEXT,
ADD COLUMN IF NOT EXISTS gospel_sw TEXT,
ADD COLUMN IF NOT EXISTS liturgical_color TEXT DEFAULT 'green';
