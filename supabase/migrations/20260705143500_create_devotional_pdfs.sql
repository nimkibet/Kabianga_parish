-- Create devotional_pdfs table
CREATE TABLE IF NOT EXISTS public.devotional_pdfs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.devotional_pdfs ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read access for devotional_pdfs" ON public.devotional_pdfs;
CREATE POLICY "Allow public read access for devotional_pdfs" ON public.devotional_pdfs FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin write access for devotional_pdfs" ON public.devotional_pdfs;
CREATE POLICY "Allow admin write access for devotional_pdfs" ON public.devotional_pdfs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed initial records
INSERT INTO public.devotional_pdfs (title, description, file_url, size)
VALUES
('Guide to Praying the Holy Rosary (English)', 'Step-by-step Dominican Rosary guide customized for the parish.', '/devotionals/rosary_guide_english.pdf', '280 KB'),
('Mwongozo wa Kusali Rozari Takatifu (Kiswahili)', 'Mwongozo kamili wa kusali Rozari Takatifu ya Bikira Maria kwa Kiswahili.', '/devotionals/rosary_guide_swahili.pdf', '150 KB'),
('Chaplet of St. Michael (English)', 'Prayers and salutations for the Chaplet of St. Michael customized for the parish.', '/devotionals/chaplet_st_michael.pdf', '190 KB'),
('Chaplet of the Seven Sorrows (English)', 'Meditations on the Seven Sorrows of Mary customized for the parish.', '/devotionals/chaplet_seven_sorrows.pdf', '290 KB');
