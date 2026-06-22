-- Database schema setup for Kabianga Parish website
-- Complete Schema including Phase 2 additions

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

-- 4. Theme Settings Table
CREATE TABLE IF NOT EXISTS public.theme_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                -- e.g., "Ordinary Time", "Lent", "Easter", "Christmas"
    primary_color TEXT NOT NULL,       -- hex color string
    secondary_color TEXT NOT NULL,
    background_color TEXT NOT NULL,
    foreground_color TEXT NOT NULL,
    start_month INT NOT NULL,          -- 1-12 inclusive
    end_month INT NOT NULL,            -- 1-12 inclusive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Service Schedules Table (Mass & Confession Timetable)
CREATE TABLE IF NOT EXISTS public.service_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,               -- e.g., "First Mass (English)", "Youth Mass", "Confessions"
    day_of_week INT NOT NULL,          -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    start_time TIME NOT NULL,          -- e.g., "08:00:00"
    end_time TIME NOT NULL,            -- e.g., "10:00:00"
    details TEXT,                      -- e.g., "Holy Communion & Sermon"
    type TEXT NOT NULL DEFAULT 'Mass', -- 'Mass' or 'Confession'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Daily Readings Table (Dual-Language Readings)
CREATE TABLE IF NOT EXISTS public.daily_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    english_reading TEXT NOT NULL,     -- Full text or formatted HTML of English reading
    swahili_reading TEXT NOT NULL,     -- Full text or formatted HTML of Kiswahili reading
    english_verse TEXT,                -- E.g., "John 3:16"
    swahili_verse TEXT,                -- E.g., "Yohana 3:16"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Jumuiyas (SCC) Directory Table
CREATE TABLE IF NOT EXISTS public.jumuiyas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                -- e.g., "Mtakatifu Yuda Tadeo"
    zone TEXT NOT NULL,                -- e.g., "Central Zone"
    leader_name TEXT NOT NULL,
    leader_phone TEXT NOT NULL,
    meeting_day TEXT NOT NULL,         -- e.g., "Every Thursday at 5:00 PM"
    meeting_location TEXT,             -- e.g., "Members' houses (rotational)"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Societies Hub Table (CWA, CMA, Youth, Choir, etc.)
CREATE TABLE IF NOT EXISTS public.societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,                -- e.g., "Catholic Women Association (CWA)"
    code TEXT UNIQUE NOT NULL,         -- e.g., "cwa", "cma", "myg", "choir"
    description TEXT,
    leadership TEXT,                   -- text or format details of leaders
    meeting_pattern TEXT,              -- e.g., "First Sunday of the Month after 2nd Mass"
    announcements TEXT,                -- announcements text
    image_url TEXT,                    -- photo of society
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Prayer Requests Wall Table
CREATE TABLE IF NOT EXISTS public.prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT DEFAULT 'Anonymous',
    intention TEXT NOT NULL,
    prayers_count INT DEFAULT 0,
    is_moderated BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Giving & Progress Tracker Table (Projects & Target Contributions)
CREATE TABLE IF NOT EXISTS public.giving_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,               -- e.g., "Sanctuary Extension Fund"
    description TEXT,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    paybill_number TEXT DEFAULT '247247', -- default M-Pesa paybill
    paybill_account TEXT,              -- e.g., "SANCTUARY"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Digital Sacramental Registration Table
CREATE TABLE IF NOT EXISTS public.sacramental_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sacrament_type TEXT NOT NULL,      -- 'Baptism', 'Confirmation', 'Matrimony', 'Catechism'
    applicant_name TEXT NOT NULL,
    date_of_birth DATE,
    parent_names TEXT,                 -- For children (Baptism/Catechism)
    phone_number TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb, -- dynamic details specific to sacrament
    status TEXT DEFAULT 'pending',     -- 'pending', 'approved', 'reviewed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Digital Bulletin Archive Table
CREATE TABLE IF NOT EXISTS public.bulletin_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,               -- e.g., "Weekly Bulletin - 22nd June 2026"
    file_url TEXT NOT NULL,            -- Cloudinary PDF or image URL
    publish_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Sermon & Homily Archive Table
CREATE TABLE IF NOT EXISTS public.sermons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    preacher TEXT NOT NULL,            -- e.g., "Fr. Joseph"
    scripture_reference TEXT,          -- e.g., "Luke 15:11-32"
    summary TEXT,                      -- Homily text summary
    audio_url TEXT,                    -- Cloudinary audio file URL
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Equipment Booking Table (Asset Booking System)
CREATE TABLE IF NOT EXISTS public.equipment_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_name TEXT NOT NULL,          -- e.g., "Sound Mixer - 16 Channel", "PA Active Speaker", "Keyboard Piano"
    borrower_name TEXT NOT NULL,
    borrower_phone TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'pending',     -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES ENABLEMENT
-- ==========================================================

ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jumuiyas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giving_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacramental_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulletin_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_bookings ENABLE ROW LEVEL SECURITY;


-- 1. Carousel Slides Policies
DROP POLICY IF EXISTS "Allow public read access for carousel_slides" ON public.carousel_slides;
CREATE POLICY "Allow public read access for carousel_slides" ON public.carousel_slides FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for carousel_slides" ON public.carousel_slides;
CREATE POLICY "Allow admin write access for carousel_slides" ON public.carousel_slides FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. History Entries Policies
DROP POLICY IF EXISTS "Allow public read access for history_entries" ON public.history_entries;
CREATE POLICY "Allow public read access for history_entries" ON public.history_entries FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for history_entries" ON public.history_entries;
CREATE POLICY "Allow admin write access for history_entries" ON public.history_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Gallery Images Policies
DROP POLICY IF EXISTS "Allow public read access for gallery_images" ON public.gallery_images;
CREATE POLICY "Allow public read access for gallery_images" ON public.gallery_images FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for gallery_images" ON public.gallery_images;
CREATE POLICY "Allow admin write access for gallery_images" ON public.gallery_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Theme Settings Policies
DROP POLICY IF EXISTS "Allow public read access for theme_settings" ON public.theme_settings;
CREATE POLICY "Allow public read access for theme_settings" ON public.theme_settings FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for theme_settings" ON public.theme_settings;
CREATE POLICY "Allow admin write access for theme_settings" ON public.theme_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Service Schedules Policies
DROP POLICY IF EXISTS "Allow public read access for service_schedules" ON public.service_schedules;
CREATE POLICY "Allow public read access for service_schedules" ON public.service_schedules FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for service_schedules" ON public.service_schedules;
CREATE POLICY "Allow admin write access for service_schedules" ON public.service_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Daily Readings Policies
DROP POLICY IF EXISTS "Allow public read access for daily_readings" ON public.daily_readings;
CREATE POLICY "Allow public read access for daily_readings" ON public.daily_readings FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for daily_readings" ON public.daily_readings;
CREATE POLICY "Allow admin write access for daily_readings" ON public.daily_readings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Jumuiyas Policies
DROP POLICY IF EXISTS "Allow public read access for jumuiyas" ON public.jumuiyas;
CREATE POLICY "Allow public read access for jumuiyas" ON public.jumuiyas FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for jumuiyas" ON public.jumuiyas;
CREATE POLICY "Allow admin write access for jumuiyas" ON public.jumuiyas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Societies Policies
DROP POLICY IF EXISTS "Allow public read access for societies" ON public.societies;
CREATE POLICY "Allow public read access for societies" ON public.societies FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for societies" ON public.societies;
CREATE POLICY "Allow admin write access for societies" ON public.societies FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Prayer Requests Policies
DROP POLICY IF EXISTS "Allow public read access for prayer_requests" ON public.prayer_requests;
CREATE POLICY "Allow public read access for prayer_requests" ON public.prayer_requests FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert for prayer_requests" ON public.prayer_requests;
CREATE POLICY "Allow public insert for prayer_requests" ON public.prayer_requests FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update for prayer_requests" ON public.prayer_requests;
CREATE POLICY "Allow public update for prayer_requests" ON public.prayer_requests FOR UPDATE TO public USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow admin write access for prayer_requests" ON public.prayer_requests;
CREATE POLICY "Allow admin write access for prayer_requests" ON public.prayer_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. Giving Projects Policies
DROP POLICY IF EXISTS "Allow public read access for giving_projects" ON public.giving_projects;
CREATE POLICY "Allow public read access for giving_projects" ON public.giving_projects FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for giving_projects" ON public.giving_projects;
CREATE POLICY "Allow admin write access for giving_projects" ON public.giving_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11. Sacramental Registrations Policies
DROP POLICY IF EXISTS "Allow public insert for registrations" ON public.sacramental_registrations;
CREATE POLICY "Allow public insert for registrations" ON public.sacramental_registrations FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow admin all access for registrations" ON public.sacramental_registrations;
CREATE POLICY "Allow admin all access for registrations" ON public.sacramental_registrations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12. Bulletin Archives Policies
DROP POLICY IF EXISTS "Allow public read access for bulletin_archives" ON public.bulletin_archives;
CREATE POLICY "Allow public read access for bulletin_archives" ON public.bulletin_archives FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for bulletin_archives" ON public.bulletin_archives;
CREATE POLICY "Allow admin write access for bulletin_archives" ON public.bulletin_archives FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 13. Sermons Policies
DROP POLICY IF EXISTS "Allow public read access for sermons" ON public.sermons;
CREATE POLICY "Allow public read access for sermons" ON public.sermons FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow admin write access for sermons" ON public.sermons;
CREATE POLICY "Allow admin write access for sermons" ON public.sermons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 14. Equipment Bookings Policies
DROP POLICY IF EXISTS "Allow public read access for bookings" ON public.equipment_bookings;
CREATE POLICY "Allow public read access for bookings" ON public.equipment_bookings FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert for bookings" ON public.equipment_bookings;
CREATE POLICY "Allow public insert for bookings" ON public.equipment_bookings FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow admin all access for bookings" ON public.equipment_bookings;
CREATE POLICY "Allow admin all access for bookings" ON public.equipment_bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ==========================================================
-- SEED DATA (TEMPLATES FOR QUICK START)
-- ==========================================================

-- Seed default Liturgical Seasons
INSERT INTO public.theme_settings (name, primary_color, secondary_color, background_color, foreground_color, start_month, end_month)
VALUES
('Ordinary Time (Green)', '#16a34a', '#15803d', '#fafdfb', '#14532d', 6, 11)
ON CONFLICT DO NOTHING;

INSERT INTO public.theme_settings (name, primary_color, secondary_color, background_color, foreground_color, start_month, end_month)
VALUES
('Advent & Lent (Purple)', '#7c3aed', '#6d28d9', '#faf5ff', '#1e1b4b', 12, 5)
ON CONFLICT DO NOTHING;

-- Seed Sunday Service schedules
INSERT INTO public.service_schedules (title, day_of_week, start_time, end_time, details, type)
VALUES
('English Service', 0, '08:00:00', '10:00:00', 'Holy Communion & Sermon', 'Mass'),
('Kiswahili Service', 0, '10:30:00', '12:30:00', 'Ibada ya Asubuhi na Mahubiri', 'Mass'),
('Youth & Young Adults Service', 0, '14:00:00', '16:00:00', 'Praise, Worship & Topical Discussion', 'Mass'),
('Confessions (Saturday)', 6, '15:00:00', '17:00:00', 'Reconciliation Service', 'Confession')
ON CONFLICT DO NOTHING;

-- Seed default Societies
INSERT INTO public.societies (name, code, description, leadership, meeting_pattern, announcements)
VALUES
('Catholic Women Association (CWA)', 'cwa', 'CWA is a movement of Catholic lay women in the parish aimed at deepening spiritual growth, christian family life values, and supporting church development.', 'Chairlady: Mrs. Beatrice Kosgei, Secretary: Mrs. Grace Chepkemoi', 'Meets on the 1st Sunday of every month after the Kiswahili Mass.', 'Our annual parish charity drive for orphans is scheduled for next month. Please check CWA WhatsApp group for contribution details.'),
('Catholic Men Association (CMA)', 'cma', 'CMA provides spiritual guidance and encourages lay men to take active roles in the church, family life, and parish mentorship.', 'Chairman: Mr. John Langat, Secretary: Mr. Philip Bett', 'Meets on the 2nd Sunday of every month after the English Mass.', 'Gentlemen, registration for the upcoming Diocese Men Pilgrimage is ongoing. The fee is KSh 1,500.'),
('Youth Group', 'myg', 'The parish youth group brings together high schoolers, college students, and young professionals for spiritual growth, fellowship, and parish activities.', 'Youth Leader: Gideon Kiprotich, Secretary: Mercy Chepngeno', 'Meets every Sunday from 2:00 PM to 4:00 PM during Youth Service.', 'Youth bonfire night details will be announced this Sunday. Prepare your talents!'),
('Parish Choir', 'choir', 'The choir leads the congregation in praise, worship, and liturgical hymns during parish services.', 'Choirmaster: Mr. David Cheruiyot, Secretary: Ms. Stella Chepkoech', 'Practice sessions: Saturdays 2:00 PM - 5:00 PM & Wednesdays 5:00 PM - 7:00 PM.', 'Members are reminded that we have a joint choir rehearsal with Kericho Cathedral Choir this coming Saturday.')
ON CONFLICT DO NOTHING;

-- Seed default Jumuiyas (SCCs)
INSERT INTO public.jumuiyas (name, zone, leader_name, leader_phone, meeting_day, meeting_location)
VALUES
('Mtakatifu Yuda Tadeo', 'Kabianga Central', 'Mr. Peter Mutai', '0712345678', 'Every Thursday at 5:00 PM', 'Rotational (Member Homes)'),
('Mtakatifu Rita wa Kasia', 'Chepnyogaa Zone', 'Mrs. Ann Chepkoech', '0723456789', 'Every Wednesday at 4:30 PM', 'Chepnyogaa Local Church Hall'),
('Mtakatifu Pio wa Pietrelcina', 'Kapkatet Road Zone', 'Mr. Stephen Sang', '0734567890', 'Every Friday at 5:30 PM', 'Rotational (Member Homes)')
ON CONFLICT DO NOTHING;

-- Seed default Giving Project
INSERT INTO public.giving_projects (title, description, target_amount, current_amount, paybill_number, paybill_account)
VALUES
('Church Sanctuary Tiling Project', 'Financing the installation of modern terrazzo tiles across the entire church main sanctuary floor to replace the old concrete slab.', 1200000, 450000, '247247', 'TILESPARISH')
ON CONFLICT DO NOTHING;
