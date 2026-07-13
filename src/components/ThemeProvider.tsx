"use client";

import { useEffect, useState } from 'react';
import { getLiturgicalSeason, LITURGICAL_THEMES } from '@/lib/liturgicalSeason';
import { supabase } from '@/lib/supabase';

/**
 * ThemeProvider applies the correct styling (liturgical colors determined by today's Daily Reading)
 * to Tailwind CSS global styling variables across the entire application.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeStyles, setThemeStyles] = useState<string>('');

  useEffect(() => {
    // Helper to generate CSS variables stylesheet
    const generateStyles = (color: string) => {
      let theme = LITURGICAL_THEMES.ORDINARY;
      let muted = '#e8f5e9';
      let mutedForeground = '#1b5e20';
      let border = '#c8e6c9';

      if (color === 'purple') {
        theme = LITURGICAL_THEMES.LENT;
        muted = '#f3e8ff';
        mutedForeground = '#6b21a8';
        border = '#ddd6fe';
      } else if (color === 'white') {
        theme = LITURGICAL_THEMES.EASTER;
        muted = '#fff8e1';
        mutedForeground = '#b78103';
        border = '#ffe082';
      } else if (color === 'red') {
        theme = LITURGICAL_THEMES.RED;
        muted = '#fef2f2';
        mutedForeground = '#991b1b';
        border = '#fca5a5';
      } else { // green
        theme = LITURGICAL_THEMES.ORDINARY;
        muted = '#e8f5e9';
        mutedForeground = '#1b5e20';
        border = '#c8e6c9';
      }

      const declarations = [
        ['--color-primary', theme.primary],
        ['--color-primary-hover', theme.primaryHover],
        ['--color-on-primary', '#ffffff'],
        ['--color-background', theme.background],
        ['--color-foreground', theme.foreground],
        ['--background', theme.background],
        ['--foreground', theme.foreground],
        ['--card', '#ffffff'],
        ['--card-foreground', theme.foreground],
        ['--color-card', '#ffffff'],
        ['--color-card-foreground', theme.foreground],
        ['--muted', muted],
        ['--color-muted', muted],
        ['--muted-foreground', mutedForeground],
        ['--color-muted-foreground', mutedForeground],
        ['--border', border],
        ['--color-border', border],
      ].map(([name, val]) => `${name}: ${val} !important;`).join('\n  ');

      return `:root {\n  ${declarations}\n}`;
    };

    // 1. Initial color based on static liturgical calendar calculation
    const { season } = getLiturgicalSeason(new Date());
    let initialColor = 'green';
    if (season === 'LENT' || season === 'ADVENT') initialColor = 'purple';
    else if (season === 'EASTER' || season === 'CHRISTMAS') initialColor = 'white';

    setThemeStyles(generateStyles(initialColor));

    // 2. Fetch active liturgical theme color check with admin override support
    async function fetchColor() {
      try {
        // Query theme override from database
        const { data: overrideData, error: overrideError } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'theme_color_override')
          .maybeSingle();

        if (!overrideError && overrideData && overrideData.value && overrideData.value !== 'auto') {
          setThemeStyles(generateStyles(overrideData.value));
          return;
        }

        // Fallback to dynamic daily reading color
        const options = { timeZone: 'Africa/Nairobi', year: 'numeric' as const, month: '2-digit' as const, day: '2-digit' as const };
        const formatter = new Intl.DateTimeFormat('en-CA', options);
        const todayStr = formatter.format(new Date()); // YYYY-MM-DD
        
        const response = await fetch(`/api/readings?date=${todayStr}`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data?.liturgical_color) {
            setThemeStyles(generateStyles(res.data.liturgical_color));
          }
        }
      } catch (err) {
        console.warn('Could not load today’s dynamic liturgical color:', err);
      }
    }
    fetchColor();
  }, []);

  return (
    <>
      {themeStyles && (
        <style id="dynamic-theme-overrides" dangerouslySetInnerHTML={{ __html: themeStyles }} />
      )}
      <div className="transition-colors duration-500 min-h-screen flex flex-col">
        {children}
      </div>
    </>
  );
}
