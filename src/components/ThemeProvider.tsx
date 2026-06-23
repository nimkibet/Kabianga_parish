"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getLiturgicalSeason } from '@/lib/liturgicalSeason';

interface DbTheme {
  primary_color: string;
  secondary_color: string;
  background_color: string;
  foreground_color: string;
  start_month: number;
  end_month: number;
}

/**
 * ThemeProvider fetches the appropriate theme settings from Supabase, or
 * falls back to the automated local Liturgical Calendar calculation engine
 * based on the current date, applying colors dynamically to global Tailwind CSS variables.
 * It also supports a user bypass to default back to a clean default white theme.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeStyles, setThemeStyles] = useState<string>('');

  const applyTheme = useCallback(async () => {
    const isBypassed = localStorage.getItem('theme_bypass') === 'true';

    // Helper to generate CSS variables stylesheet
    const generateStyles = (vars: Record<string, string>) => {
      const declarations = Object.entries(vars)
        .map(([name, val]) => `${name}: ${val} !important;`)
        .join('\n  ');
      return `:root {\n  ${declarations}\n}`;
    };

    if (isBypassed) {
      // Apply Clean Default Light Mode (White background, standard purple primary)
      const styles = generateStyles({
        '--color-primary': '#7c3aed',
        '--color-primary-hover': '#6d28d9',
        '--color-on-primary': '#ffffff',
        '--color-background': '#ffffff',
        '--color-foreground': '#1e1b4b',
        '--background': '#ffffff',
        '--foreground': '#1e1b4b',
        '--card': '#ffffff',
        '--card-foreground': '#1e1b4b',
        '--color-card': '#ffffff',
        '--color-card-foreground': '#1e1b4b',
        '--muted': '#f3e8ff',
        '--color-muted': '#f3e8ff',
        '--muted-foreground': '#6b21a8',
        '--color-muted-foreground': '#6b21a8',
        '--border': '#ddd6fe',
        '--color-border': '#ddd6fe',
      });
      setThemeStyles(styles);
      return;
    }

    const month = new Date().getMonth() + 1; // 1-12

    try {
      const { data, error } = await supabase.from('theme_settings').select('*');
      
      if (!error && data && data.length > 0) {
        const active = (data as DbTheme[]).find((t) => {
          const start = t.start_month;
          const end = t.end_month;
          if (start <= end) {
            return month >= start && month <= end;
          }
          return month >= start || month <= end;
        });

        if (active) {
          const styles = generateStyles({
            '--color-primary': active.primary_color,
            '--color-primary-hover': active.secondary_color,
            '--color-on-primary': active.foreground_color,
            '--color-background': active.background_color,
            '--color-foreground': active.foreground_color,
            '--background': active.background_color,
            '--foreground': active.foreground_color,
            // Ensure card and borders also follow the active theme to avoid white overrides
            '--card': active.background_color,
            '--color-card': active.background_color,
            '--card-foreground': active.foreground_color,
            '--color-card-foreground': active.foreground_color,
            '--border': active.secondary_color + '20', // subtle transparent primary
            '--color-border': active.secondary_color + '20',
          });
          setThemeStyles(styles);
          return;
        }
      }
    } catch (dbErr) {
      console.warn('Failed to query Supabase themes:', dbErr);
    }

    // Fallback local Liturgical engine
    const { theme } = getLiturgicalSeason();
    const styles = generateStyles({
      '--color-primary': theme.primary,
      '--color-primary-hover': theme.primaryHover,
      '--color-on-primary': '#ffffff',
      '--color-background': theme.background,
      '--color-foreground': theme.foreground,
      '--background': theme.background,
      '--foreground': theme.foreground,
      // Cascade to card variables to prevent default white cards
      '--card': theme.background,
      '--color-card': theme.background,
      '--card-foreground': theme.foreground,
      '--color-card-foreground': theme.foreground,
      '--border': theme.primaryHover + '20',
      '--color-border': theme.primaryHover + '20',
    });
    setThemeStyles(styles);
  }, []);

  useEffect(() => {
    // Schedule initial application on next tick to avoid synchronous setState inside render loop
    const initialTimer = setTimeout(() => {
      applyTheme();
    }, 0);

    // Listen to custom bypass toggle events
    const handleBypassChange = () => {
      applyTheme();
    };

    window.addEventListener('theme-bypass-changed', handleBypassChange);
    const interval = setInterval(applyTheme, 1000 * 60 * 60 * 24);
    
    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('theme-bypass-changed', handleBypassChange);
      clearInterval(interval);
    };
  }, [applyTheme]);

  return (
    <>
      {themeStyles && (
        <style id="dynamic-theme-overrides" dangerouslySetInnerHTML={{ __html: themeStyles }} />
      )}
      {children}
    </>
  );
}
