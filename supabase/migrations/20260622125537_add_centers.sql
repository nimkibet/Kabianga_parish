-- Migration to add Centers Table and link Jumuiyas

CREATE TABLE IF NOT EXISTS public.centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    leaders JSONB DEFAULT '[]'::jsonb, -- Array of up to 4 leaders (role, name, phone)
    images TEXT[] DEFAULT '{}'::text[], -- Array of image URLs for center gallery
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for centers" ON public.centers;
CREATE POLICY "Allow public read access for centers" ON public.centers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin write access for centers" ON public.centers;
CREATE POLICY "Allow admin write access for centers" ON public.centers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed default centers data
INSERT INTO public.centers (name, description, leaders, images)
VALUES
(
  'Kabianga Center',
  'The main center of our Catholic parish. It houses the main parish church and is where the priests reside.',
  '[]'::jsonb,
  ARRAY[]::TEXT[]
),
(
  'Kapsiya',
  'Outstation center serving the Kapsiya community.',
  '[]'::jsonb,
  ARRAY[]::TEXT[]
),
(
  'Kibingei',
  'Outstation center serving the Kibingei community.',
  '[]'::jsonb,
  ARRAY[]::TEXT[]
),
(
  'Kapkelek',
  'Outstation center serving the Kapkelek community.',
  '[]'::jsonb,
  ARRAY[]::TEXT[]
)
ON CONFLICT (name) DO NOTHING;

-- Link Jumuiyas to Centers by adding center_name column
ALTER TABLE public.jumuiyas ADD COLUMN IF NOT EXISTS center_name TEXT;

-- Update existing seed jumuiyas to reference their centers
UPDATE public.jumuiyas SET center_name = 'Kabianga Center' WHERE name IN ('St. Michael', 'St. Peter''s', 'St. Jude', 'St. Monica', 'St. Mary Mother of God Mobego');
UPDATE public.jumuiyas SET center_name = 'Kapsiya' WHERE name = 'St. Joseph''s';
UPDATE public.jumuiyas SET center_name = 'Kibingei' WHERE name IN ('St. John''s', 'St. Teresa''s');
UPDATE public.jumuiyas SET center_name = 'Kapkelek' WHERE name = 'St. Luke''s';
