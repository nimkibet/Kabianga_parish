-- Create administrators table
CREATE TABLE IF NOT EXISTS public.administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read access for administrators" ON public.administrators;
CREATE POLICY "Allow public read access for administrators" ON public.administrators FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin write access for administrators" ON public.administrators;
CREATE POLICY "Allow admin write access for administrators" ON public.administrators FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default admin profile
INSERT INTO public.administrators (id, email, name, role)
VALUES ('17ffd0c6-b5e2-418e-974f-9d7d0e2ab092', 'admin@kabiangaparish.org', 'System Administrator', 'super_admin')
ON CONFLICT (email) DO NOTHING;
