"use client";

import { useEffect, useState, useCallback } from 'react';

/**
 * ThemeProvider applies a clean default white theme (white background, purple primary)
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
  }, []);

  useEffect(() => {
    applyTheme();
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
