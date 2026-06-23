'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Calendar, ChevronLeft, ChevronRight, Loader2, Globe, FileText } from 'lucide-react';
import { parseLegacyReading } from '@/lib/readingsParser';

// Color Mapping for Liturgical colors to Tailwind accent classes
const colorMap: Record<string, { border: string; bg: string; text: string; accentBg: string; name: string }> = {
  green: {
    border: 'border-t-emerald-600 dark:border-t-emerald-500',
    bg: 'bg-emerald-600',
    text: 'text-emerald-700 dark:text-emerald-400',
    accentBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    name: 'Ordinary Time'
  },
  purple: {
    border: 'border-t-purple-600 dark:border-t-purple-500',
    bg: 'bg-purple-600',
    text: 'text-purple-700 dark:text-purple-400',
    accentBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    name: 'Advent / Lent'
  },
  red: {
    border: 'border-t-red-600 dark:border-t-red-500',
    bg: 'bg-red-600',
    text: 'text-red-700 dark:text-red-400',
    accentBg: 'bg-red-500/10 text-red-700 dark:text-red-300',
    name: 'Feasts of Martyrs / Passion'
  },
  white: {
    border: 'border-t-amber-400 dark:border-t-amber-300',
    bg: 'bg-amber-400',
    text: 'text-amber-700 dark:text-amber-400',
    accentBg: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
    name: 'Solemnities / Feasts / Easter / Christmas'
  }
};

export default function DailyReadings() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [language, setLanguage] = useState<'english' | 'swahili'>('english');
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load persisted language from session
  useEffect(() => {
    const storedLang = localStorage.getItem('readings_language') as 'english' | 'swahili';
    if (storedLang === 'english' || storedLang === 'swahili') {
      setLanguage(storedLang);
    }
  }, []);

  useEffect(() => {
    fetchReading();
  }, [selectedDate]);

  const handleLanguageChange = (lang: 'english' | 'swahili') => {
    setLanguage(lang);
    localStorage.setItem('readings_language', lang);
  };

  const fetchReading = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/readings?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error(`Failed to load readings: ${response.statusText}`);
      }
      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setReading(resJson.data);
      } else {
        setReading(null);
      }
    } catch (err: any) {
      console.error('Error fetching readings:', err.message || err);
      setReading(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Helper to extract structured sections with legacy fallback
  const getStructuredSections = () => {
    if (!reading) return null;
    
    const isEnglish = language === 'english';
    const firstReading = isEnglish ? reading.first_reading_en : reading.first_reading_sw;
    const secondReading = isEnglish ? reading.second_reading_en : reading.second_reading_sw;
    const psalm = isEnglish ? reading.psalm_en : reading.psalm_sw;
    const gospel = isEnglish ? reading.gospel_en : reading.gospel_sw;
    
    // If structured columns are empty, fall back to parsing legacy string format
    if (!firstReading && !psalm && !gospel) {
      const rawText = isEnglish ? reading.english_reading : reading.swahili_reading;
      const legacy = parseLegacyReading(rawText);
      return {
        firstReading: legacy.firstReading,
        firstReadingVerse: legacy.firstReadingVerse || (isEnglish ? 'First Reading' : 'Somo la Kwanza'),
        secondReading: legacy.secondReading,
        secondReadingVerse: legacy.secondReadingVerse || (isEnglish ? 'Second Reading' : 'Somo la Pili'),
        psalm: legacy.psalm,
        psalmVerse: legacy.psalmVerse || (isEnglish ? 'Responsorial Psalm' : 'Zaburi ya Kujibu'),
        gospel: legacy.gospel,
        gospelVerse: legacy.gospelVerse || (isEnglish ? 'Gospel' : 'Injili')
      };
    }
    
    return {
      firstReading: firstReading || '',
      firstReadingVerse: isEnglish ? 'First Reading' : 'Somo la Kwanza',
      secondReading: secondReading || '',
      secondReadingVerse: isEnglish ? 'Second Reading' : 'Somo la Pili',
      psalm: psalm || '',
      psalmVerse: isEnglish ? 'Responsorial Psalm' : 'Zaburi ya Kujibu',
      gospel: gospel || '',
      gospelVerse: isEnglish ? 'Gospel' : 'Injili'
    };
  };

  const sections = getStructuredSections();
  const currentLiturgicalColor = reading?.liturgical_color || 'green';
  const colorTheme = colorMap[currentLiturgicalColor] || colorMap.green;

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-1 pb-16">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="inline-block text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Liturgical Word
        </span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Daily Readings</h1>
        <p className="text-xs text-muted-foreground">Soma Masomo ya Leo / Read Today's Scriptures</p>
      </div>

      {/* Date Navigation & Controls */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-4">
        
        {/* Date Selector Row */}
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="touch-target p-2 rounded-xl bg-muted text-foreground/80 hover:bg-border active:scale-95 transition-all flex items-center justify-center border border-border/50"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 text-center font-bold text-sm text-foreground flex items-center justify-center space-x-1.5 py-1 px-3 bg-muted/30 rounded-xl border border-border/20">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{formatDate(selectedDate)}</span>
          </div>

          <button
            onClick={handleNextDay}
            className="touch-target p-2 rounded-xl bg-muted text-foreground/80 hover:bg-border active:scale-95 transition-all flex items-center justify-center border border-border/50"
            aria-label="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Date Picker Manual */}
        <div className="flex items-center space-x-3 bg-muted/40 p-2 rounded-xl border border-border/30">
          <label htmlFor="date-manual" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Choose Date:</label>
          <input
            id="date-manual"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 bg-transparent border-0 text-xs font-bold text-foreground focus:ring-0 p-1 cursor-pointer"
          />
        </div>

        {/* Language Switches */}
        <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl">
          <button
            onClick={() => handleLanguageChange('english')}
            className={`touch-target py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              language === 'english'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>English Readings</span>
          </button>
          <button
            onClick={() => handleLanguageChange('swahili')}
            className={`touch-target py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              language === 'swahili'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Masomo ya Kiswahili</span>
          </button>
        </div>
      </div>

      {/* Readings Display Card with Top Color Border */}
      <div className={`bg-card border-x border-b border-t-8 ${colorTheme.border} border-border rounded-2xl shadow-md p-6 sm:p-8 min-h-[300px] flex flex-col justify-between transition-all duration-300`}>
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-semibold">Loading scriptures...</p>
          </div>
        ) : reading ? (
          <div className="space-y-8 animate-fade-in flex-1">
            
            {/* Reading Title / Verse header & Color indicator */}
            <div className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${colorTheme.accentBg}`}>
                  {colorTheme.name}
                </span>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">
                  {language === 'english' ? reading.english_verse : reading.swahili_verse}
                </h2>
              </div>
            </div>

            {/* Reading Content - Structured Sections */}
            {sections && (
              <div className="space-y-8 max-w-none text-foreground/90 font-sans text-sm sm:text-base">
                
                {/* First Reading */}
                {sections.firstReading && (
                  <div className="space-y-3 pl-4 border-l-4 border-primary/20">
                    <h3 className={`text-base font-extrabold tracking-wide flex items-center justify-between ${colorTheme.text}`}>
                      <span>{sections.firstReadingVerse}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary/5 border border-primary/10`}>
                        {language === 'english' ? 'First Reading' : 'Somo la Kwanza'}
                      </span>
                    </h3>
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {sections.firstReading}
                    </p>
                  </div>
                )}

                {/* Second Reading */}
                {sections.secondReading && (
                  <div className="space-y-3 pl-4 border-l-4 border-primary/20 pt-2">
                    <h3 className={`text-base font-extrabold tracking-wide flex items-center justify-between ${colorTheme.text}`}>
                      <span>{sections.secondReadingVerse}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary/5 border border-primary/10`}>
                        {language === 'english' ? 'Second Reading' : 'Somo la Pili'}
                      </span>
                    </h3>
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {sections.secondReading}
                    </p>
                  </div>
                )}

                {/* Responsorial Psalm */}
                {sections.psalm && (
                  <div className="space-y-3 pl-4 border-l-4 border-primary/20 pt-2">
                    <h3 className={`text-base font-extrabold tracking-wide flex items-center justify-between ${colorTheme.text}`}>
                      <span>{sections.psalmVerse}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary/5 border border-primary/10`}>
                        {language === 'english' ? 'Responsorial Psalm' : 'Zaburi ya Kujibu'}
                      </span>
                    </h3>
                    <p className="text-foreground/80 italic leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {sections.psalm}
                    </p>
                  </div>
                )}

                {/* Gospel */}
                {sections.gospel && (
                  <div className="space-y-3 pl-4 border-l-4 border-primary/20 pt-2">
                    <h3 className={`text-base font-extrabold tracking-wide flex items-center justify-between ${colorTheme.text}`}>
                      <span>{sections.gospelVerse}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-primary/5 border border-primary/10`}>
                        {language === 'english' ? 'Gospel' : 'Injili'}
                      </span>
                    </h3>
                    <p className="text-foreground/80 font-medium leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {sections.gospel}
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-16 px-4">
            <FileText className="w-12 h-12 text-muted-foreground" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-foreground">
                {language === 'english' ? 'No Readings Scheduled' : 'Masomo Hayajapangiwa'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-normal">
                {language === 'english' 
                  ? 'There are no scripture readings recorded for this day yet. Please check back later or check with the parish office.' 
                  : 'Hakuna masomo ya Biblia yaliyorekodiwa kwa siku hii bado. Tafadhali angalia baadaye au wasiliana na ofisi ya parokia.'}
              </p>
            </div>
          </div>
        )}

        {/* Footer Note */}
        {reading && (
          <div className="border-t border-border/60 pt-4 mt-8 flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
            <span>Kabianga Catholic Parish Liturgical Board</span>
            <span>Date: {selectedDate}</span>
          </div>
        )}
      </div>

    </div>
  );
}
