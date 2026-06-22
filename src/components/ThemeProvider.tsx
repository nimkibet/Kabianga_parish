"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * ThemeProvider fetches the appropriate theme settings from Supabase based on the
 * current month and applies them as CSS variables on the document root.
 * This enables the admin to configure seasonal themes that automatically
 * activate without manual page reloads.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applyTheme = async () => {
      const month = new Date().getMonth() + 1; // 1-12
      const { data, error } = await supabase.from('theme_settings').select('*');
      if (error) {
        console.error('Failed to load theme settings:', error);
        return;
      }
      if (!data || data.length === 0) return;

      const active = data.find((t: any) => {
        const start = t.start_month;
        const end = t.end_month;
        if (start <= end) {
          return month >= start && month <= end;
        }
        // handle wrap around (e.g., start=11, end=2)
        return month >= start || month <= end;
      });
      if (!active) return;

      const root = document.documentElement;
      const set = (name: string, value: string) => root.style.setProperty(name, value);

      // Map DB columns to CSS custom properties defined in globals.css.
      set('--color-primary', active.primary_color);
      set('--color-primary-hover', active.secondary_color);
      set('--color-on-primary', active.foreground_color);
      set('--color-background', active.background_color);
      set('--color-foreground', active.foreground_color);
    };

    applyTheme();
    const interval = setInterval(applyTheme, 1000 * 60 * 60 * 24);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
