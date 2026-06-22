"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getLiturgicalSeason } from '@/lib/liturgicalSeason';

/**
 * ThemeProvider fetches the appropriate theme settings from Supabase, or
 * falls back to the automated local Liturgical Calendar calculation engine
 * based on the current date, applying colors dynamically to global Tailwind CSS variables.
 * It also supports a user bypass to default back to a clean default white theme.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [bypass, setBypass] = useState(false);

  useEffect(() => {
    // Check initial bypass state
    const storedBypass = localStorage.getItem('theme_bypass') === 'true';
    setBypass(storedBypass);

    const applyTheme = async () => {
      const isBypassed = localStorage.getItem('theme_bypass') === 'true';
      const root = document.documentElement;
      const setVar = (name: string, value: string) => root.style.setProperty(name, value);

      if (isBypassed) {
        // Apply Clean Default Light Mode (White background, standard purple primary)
        setVar('--color-primary', '#7c3aed');
        setVar('--color-primary-hover', '#6d28d9');
        setVar('--color-on-primary', '#ffffff');
        setVar('--color-background', '#ffffff');
        setVar('--color-foreground', '#1e1b4b');
        setVar('--background', '#ffffff');
        setVar('--foreground', '#1e1b4b');
        setVar('--card', '#ffffff');
        setVar('--card-foreground', '#1e1b4b');
        setVar('--muted', '#f3e8ff');
        setVar('--muted-foreground', '#6b21a8');
        setVar('--border', '#ddd6fe');
        return;
      }

      const month = new Date().getMonth() + 1; // 1-12

      try {
        const { data, error } = await supabase.from('theme_settings').select('*');
        
        if (!error && data && data.length > 0) {
          const active = data.find((t: any) => {
            const start = t.start_month;
            const end = t.end_month;
            if (start <= end) {
              return month >= start && month <= end;
            }
            return month >= start || month <= end;
          });

          if (active) {
            setVar('--color-primary', active.primary_color);
            setVar('--color-primary-hover', active.secondary_color);
            setVar('--color-on-primary', active.foreground_color);
            setVar('--color-background', active.background_color);
            setVar('--color-foreground', active.foreground_color);
            setVar('--background', active.background_color);
            setVar('--foreground', active.foreground_color);
            return;
          }
        }
      } catch (dbErr) {
        console.warn('Failed to query Supabase themes:', dbErr);
      }

      // Fallback local Liturgical engine
      const { theme } = getLiturgicalSeason();
      setVar('--color-primary', theme.primary);
      setVar('--color-primary-hover', theme.primaryHover);
      setVar('--color-on-primary', '#ffffff');
      setVar('--color-background', theme.background);
      setVar('--color-foreground', theme.foreground);
      setVar('--background', theme.background);
      setVar('--foreground', theme.foreground);
    };

    applyTheme();

    // Listen to custom bypass toggle events
    const handleBypassChange = () => {
      applyTheme();
      setBypass(localStorage.getItem('theme_bypass') === 'true');
    };

    window.addEventListener('theme-bypass-changed', handleBypassChange);
    const interval = setInterval(applyTheme, 1000 * 60 * 60 * 24);
    
    return () => {
      window.removeEventListener('theme-bypass-changed', handleBypassChange);
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
}
