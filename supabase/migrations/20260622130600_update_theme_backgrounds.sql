-- Update background colors for seeded themes to have a nice visible tint
UPDATE public.theme_settings
SET background_color = '#f0fdf4'
WHERE name = 'Ordinary Time (Green)';

UPDATE public.theme_settings
SET background_color = '#f8f0fc'
WHERE name = 'Advent & Lent (Purple)';
