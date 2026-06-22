-- Database schema setup for Kabianga Parish website

-- 1. Carousel Slides Table
CREATE TABLE IF NOT EXISTS public.carousel_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    quote TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Church History Entries Table
CREATE TABLE IF NOT EXISTS public.history_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    year INT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Photo Gallery Table
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption TEXT,
    category TEXT DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carousel_slides
CREATE POLICY "Allow public read access for carousel_slides" 
ON public.carousel_slides 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow admin write access for carousel_slides" 
ON public.carousel_slides 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- RLS Policies for history_entries
CREATE POLICY "Allow public read access for history_entries" 
ON public.history_entries 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow admin write access for history_entries" 
ON public.history_entries 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- RLS Policies for gallery_images
CREATE POLICY "Allow public read access for gallery_images" 
ON public.gallery_images 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow admin write access for gallery_images" 
ON public.gallery_images 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
