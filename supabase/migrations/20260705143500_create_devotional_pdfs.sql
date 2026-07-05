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
('Guide to Praying the Holy Rosary (English)', 'Step-by-step Dominican Rosary script with prayers, meditations, and diagrams.', 'https://www.usccb.org/prayer-and-worship/prayers-and-devotions/rosaries/upload/how-to-pray-the-rosary.pdf', '1.2 MB'),
('Mwongozo wa Kusali Rozari Takatifu (Kiswahili)', 'Jinsi ya kusali Rozari Takatifu ya Bikira Maria hatua kwa hatua kwa lugha ya Kiswahili.', 'https://catholicreadings.org/wp-content/uploads/2024/05/Rozari-Takatifu-Swahili-Prayer-Book.pdf', '850 KB');
