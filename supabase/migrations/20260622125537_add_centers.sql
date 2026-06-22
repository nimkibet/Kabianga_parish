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
  'St. Peter''s Kabianga Central',
  'The Parish Cathedral Center and headquarters. Located adjacent to Kabianga University, St. Peter''s serves as the administrative heart of the parish and hosts the largest community services.',
  '[
    {"role": "Catechist", "name": "Mr. Joseph Ngetich", "phone": "0711122233"},
    {"role": "Chairman", "name": "Mr. Charles Langat", "phone": "0722233344"},
    {"role": "Secretary", "name": "Mrs. Hellen Kirui", "phone": "0733344455"},
    {"role": "Treasurer", "name": "Mr. David Koech", "phone": "0744455566"}
  ]'::jsonb,
  ARRAY[
    'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=600'
  ]
),
(
  'St. Augustine Kiptere',
  'Located in Kiptere center, St. Augustine is the second oldest outstation center. It is active in local community programs and runs a dedicated youth guidance initiative.',
  '[
    {"role": "Catechist", "name": "Mr. Bernard Rono", "phone": "0712345670"},
    {"role": "Chairman", "name": "Mr. Philip Mutai", "phone": "0723456781"},
    {"role": "Secretary", "name": "Ms. Susan Chepngetich", "phone": "0734567892"},
    {"role": "Treasurer", "name": "Mrs. Ann Chepkoech", "phone": "0745678903"}
  ]'::jsonb,
  ARRAY[
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600'
  ]
),
(
  'St. Rita Chepnyogaa',
  'A vibrant agricultural community outstation church in Chepnyogaa zone. It hosts active CWA and choir groupings and runs rotational home prayer services.',
  '[
    {"role": "Catechist", "name": "Mr. Silas Kiprono", "phone": "0719876543"},
    {"role": "Chairman", "name": "Mr. Stephen Sang", "phone": "0728765432"},
    {"role": "Secretary", "name": "Mrs. Grace Bett", "phone": "0737654321"},
    {"role": "Treasurer", "name": "Mr. Alfred Kiprotich", "phone": "0746543210"}
  ]'::jsonb,
  ARRAY[
    'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&q=80&w=600'
  ]
),
(
  'St. Padre Pio Kapkatet Road',
  'Our newest outstation center situated along the Kapkatet Road highway, serving the growing local population with weekly services and community development meetings.',
  '[
    {"role": "Catechist", "name": "Mr. Peter Bett", "phone": "0715566778"},
    {"role": "Chairman", "name": "Mr. John Langat", "phone": "0726677889"},
    {"role": "Secretary", "name": "Mrs. Beatrice Kosgei", "phone": "0737788990"},
    {"role": "Treasurer", "name": "Mr. Gideon Kiprotich", "phone": "0748899001"}
  ]'::jsonb,
  ARRAY[
    'https://images.unsplash.com/photo-1526976729451-9922bc9a680b?auto=format&fit=crop&q=80&w=600'
  ]
)
ON CONFLICT (name) DO NOTHING;

-- Link Jumuiyas to Centers by adding center_name column
ALTER TABLE public.jumuiyas ADD COLUMN IF NOT EXISTS center_name TEXT;

-- Update existing seed jumuiyas to reference their centers
UPDATE public.jumuiyas SET center_name = 'St. Peter''s Kabianga Central' WHERE name = 'Mtakatifu Yuda Tadeo';
UPDATE public.jumuiyas SET center_name = 'St. Rita Chepnyogaa' WHERE name = 'Mtakatifu Rita wa Kasia';
UPDATE public.jumuiyas SET center_name = 'St. Padre Pio Kapkatet Road' WHERE name = 'Mtakatifu Pio wa Pietrelcina';
