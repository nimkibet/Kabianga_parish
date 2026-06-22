"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getLiturgicalSeason } from '@/lib/liturgicalSeason';

/**
 * ThemeProvider fetches the appropriate theme settings from Supabase, or
 * falls back to the automated local Liturgical Calendar calculation engine
 * based on the current date, applying colors dynamically to global Tailwind CSS variables.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applyTheme = async () => {
      const month = new Date().getMonth() + 1; // 1-12
      const root = document.documentElement;
      const setVar = (name: string, value: string) => root.style.setProperty(name, value);

      try {
        const { data, error } = await supabase.from('theme_settings').select('*');
        
        if (!error && data && data.length > 0) {
          // 1. Try to find a matching custom theme from Supabase database
          const active = data.find((t: any) => {
            const start = t.start_month;
            const end = t.end_month;
            if (start <= end) {
              return month >= start && month <= end;
            }
            // handle wrap around (e.g., start=11, end=2)
            return month >= start || month <= end;
          });

          if (active) {
            setVar('--color-primary', active.primary_color);
            setVar('--color-primary-hover', active.secondary_color);
            setVar('--color-on-primary', active.foreground_color);
            setVar('--color-background', active.background_color);
            setVar('--color-foreground', active.foreground_color);
            return; // Successfully applied database theme
          }
        }
      } catch (dbErr) {
        console.warn('Failed to query Supabase themes, falling back to local liturgical engine:', dbErr);
      }

      // 2. Fallback: Run the local Liturgical Season Engine
      const { theme } = getLiturgicalSeason();
      setVar('--color-primary', theme.primary);
      setVar('--color-primary-hover', theme.primaryHover);
      setVar('--color-on-primary', '#ffffff');
      setVar('--color-background', theme.background);
      setVar('--color-foreground', theme.foreground);
    };

    applyTheme();
    // Re-evaluate theme once a day
    const interval = setInterval(applyTheme, 1000 * 60 * 60 * 24);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
