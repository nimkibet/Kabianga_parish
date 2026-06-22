/**
 * Liturgical Season utility
 * Calculates the Catholic Liturgical Season and corresponding hex colors
 * based on the current date or a custom date.
 */

export interface LiturgicalTheme {
  name: string;
  primary: string;      // Tailwind class colors or Hex codes
  primaryHover: string;
  background: string;
  foreground: string;
}

// Default season configurations
export const LITURGICAL_THEMES: Record<string, LiturgicalTheme> = {
  ADVENT: {
    name: 'Advent (Purple)',
    primary: '#7c3aed',      // Purple
    primaryHover: '#6d28d9',
    background: '#f8f0fc',   // Tinted light purple
    foreground: '#1e1b4b',
  },
  CHRISTMAS: {
    name: 'Christmas (White/Gold)',
    primary: '#d97706',      // Gold / Amber
    primaryHover: '#b45309',
    background: '#fffbeb',   // Tinted warm gold/amber
    foreground: '#451a03',
  },
  LENT: {
    name: 'Lent (Purple)',
    primary: '#6b21a8',      // Deep Purple
    primaryHover: '#581c87',
    background: '#f8f0fc',   // Tinted light purple
    foreground: '#1e1b4b',
  },
  EASTER: {
    name: 'Easter (White/Gold)',
    primary: '#d4af37',      // Metallic Gold
    primaryHover: '#c5a028',
    background: '#fffdf5',   // Tinted warm gold
    foreground: '#3c2a00',
  },
  ORDINARY: {
    name: 'Ordinary Time (Green)',
    primary: '#16a34a',      // Green
    primaryHover: '#15803d',
    background: '#f0fdf4',   // Tinted light green
    foreground: '#14532d',
  },
};

/**
 * Jones/Butcher Easter calculation algorithm
 * Determines Easter Sunday for a given year.
 */
export function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const month = Math.floor((h + L - 7 * m + 114) / 31);
  const day = ((h + L - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Returns the active liturgical season and theme for a given date
 */
export function getLiturgicalSeason(date: Date = new Date()): { season: string; theme: LiturgicalTheme } {
  const year = date.getFullYear();
  const time = date.getTime();

  // 1. Calculate Easter for current and surrounding years
  const easterThisYear = getEasterDate(year);
  
  // Lent starts Ash Wednesday: 46 days before Easter Sunday
  const ashWednesday = new Date(easterThisYear.getTime());
  ashWednesday.setDate(easterThisYear.getDate() - 46);
  
  // Holy Saturday is the day before Easter Sunday
  const holySaturday = new Date(easterThisYear.getTime());
  holySaturday.setDate(easterThisYear.getDate() - 1);

  // Easter season lasts 50 days (ends on Pentecost Sunday)
  const pentecost = new Date(easterThisYear.getTime());
  pentecost.setDate(easterThisYear.getDate() + 49);

  // 2. Calculate Advent
  // Advent starts on the Sunday closest to Nov 30 (can be between Nov 27 and Dec 3)
  const nov30 = new Date(year, 10, 30);
  const dayOfWeekNov30 = nov30.getDay();
  const adventStart = new Date(year, 10, 30 - dayOfWeekNov30);
  
  // Christmas starts Dec 25, runs until the Baptism of the Lord (first Sunday after Epiphany, which is Jan 6)
  const christmasStart = new Date(year, 11, 25);
  
  // Baptism of the Lord estimation: Sunday after Jan 6th
  const jan6 = new Date(year, 0, 6);
  const baptismOfTheLord = new Date(year, 0, 6 + (7 - jan6.getDay()));

  // Advent of previous year check (Christmas season of previous year ending in early Jan)
  const previousYearEaster = getEasterDate(year - 1);
  const previousYearChristmasStart = new Date(year - 1, 11, 25);
  const currentJan6 = new Date(year, 0, 6);
  const currentYearBaptismOfTheLord = new Date(year, 0, 6 + (7 - currentJan6.getDay()));

  // 3. Match dates
  if (time >= baptismOfTheLord.getTime() && time < ashWednesday.getTime()) {
    return { season: 'ORDINARY_TIME', theme: LITURGICAL_THEMES.ORDINARY };
  } else if (time >= ashWednesday.getTime() && time <= holySaturday.getTime()) {
    return { season: 'LENT', theme: LITURGICAL_THEMES.LENT };
  } else if (time >= easterThisYear.getTime() && time <= pentecost.getTime()) {
    return { season: 'EASTER', theme: LITURGICAL_THEMES.EASTER };
  } else if (time > pentecost.getTime() && time < adventStart.getTime()) {
    return { season: 'ORDINARY_TIME', theme: LITURGICAL_THEMES.ORDINARY };
  } else if (time >= adventStart.getTime() && time < christmasStart.getTime()) {
    return { season: 'ADVENT', theme: LITURGICAL_THEMES.ADVENT };
  } else if (time >= christmasStart.getTime() || time < currentYearBaptismOfTheLord.getTime()) {
    return { season: 'CHRISTMAS', theme: LITURGICAL_THEMES.CHRISTMAS };
  }

  // Fallback to Ordinary Time
  return { season: 'ORDINARY_TIME', theme: LITURGICAL_THEMES.ORDINARY };
}
