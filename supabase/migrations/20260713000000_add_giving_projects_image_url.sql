-- Add image_url column to giving_projects table
ALTER TABLE public.giving_projects ADD COLUMN IF NOT EXISTS image_url TEXT;
