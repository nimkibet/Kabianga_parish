-- Add image_url column to daily_readings table
ALTER TABLE public.daily_readings ADD COLUMN IF NOT EXISTS image_url TEXT;
