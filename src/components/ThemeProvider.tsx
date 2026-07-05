"use client";

import { useEffect, useState, useCallback } from 'react';
import { getLiturgicalSeason } from '@/lib/liturgicalSeason';

/**
 * ThemeProvider applies the correct styling (liturgical colors or clean white theme)
 * to Tailwind CSS global styling variables across the entire application.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeStyles, setThemeStyles] = useState<string>('');

  const applyTheme = useCallback(() => {
    // Helper to generate CSS variables stylesheet
    const generateStyles = (vars: Record<string, string>) => {
      const declarations = Object.entries(vars)
        .map(([name, val]) => `${name}: ${val} !important;`)
        .join('\n  ');
      return `:root {\n  ${declarations}\n}`;
    };

    // Check if user chose to bypass liturgical colors
    const isBypassed = localStorage.getItem('theme_bypass') === 'true';

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
    } else {
      // Apply calculated Liturgical Season theme dynamically
      const { season, theme } = getLiturgicalSeason(new Date());

      // Derive secondary utility colors based on active season colors
      let muted = '#f3e8ff';
      let mutedForeground = '#6b21a8';
      let border = '#ddd6fe';

      if (season === 'ORDINARY_TIME') {
        muted = '#e8f5e9';           // Soft Green
        mutedForeground = '#1b5e20'; // Dark Green
        border = '#c8e6c9';          // Light Green Border
      } else if (season === 'CHRISTMAS' || season === 'EASTER') {
        muted = '#fff8e1';           // Soft Amber
        mutedForeground = '#b78103'; // Deep Gold
        border = '#ffe082';          // Light Gold Border
      } else { // Advent or Lent (Purple)
        muted = '#f3e8ff';
        mutedForeground = '#6b21a8';
        border = '#ddd6fe';
      }

      const styles = generateStyles({
        '--color-primary': theme.primary,
        '--color-primary-hover': theme.primaryHover,
        '--color-on-primary': '#ffffff',
        '--color-background': theme.background,
        '--color-foreground': theme.foreground,
        '--background': theme.background,
        '--foreground': theme.foreground,
        '--card': '#ffffff',
        '--card-foreground': theme.foreground,
        '--color-card': '#ffffff',
        '--color-card-foreground': theme.foreground,
        '--muted': muted,
        '--color-muted': muted,
        '--muted-foreground': mutedForeground,
        '--color-muted-foreground': mutedForeground,
        '--border': border,
        '--color-border': border,
      });
      setThemeStyles(styles);
    }
  }, []);

  useEffect(() => {
    applyTheme();

    // Listen to theme-bypass events dispatched by the Navbar
    window.addEventListener('theme-bypass-changed', applyTheme);
    return () => {
      window.removeEventListener('theme-bypass-changed', applyTheme);
    };
  }, [applyTheme]);

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
