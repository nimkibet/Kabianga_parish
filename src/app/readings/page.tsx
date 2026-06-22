'use client';

import { useState, useEffect } from 'react';

import { BookOpen, Calendar, ChevronLeft, ChevronRight, Loader2, Globe, FileText } from 'lucide-react';

export default function DailyReadings() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    // format as YYYY-MM-DD local time
    return today.toISOString().split('T')[0];
  });
  
  const [language, setLanguage] = useState<'english' | 'swahili'>('english');
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReading();
  }, [selectedDate]);

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

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-1 pb-16">
      
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
            onClick={() => setLanguage('english')}
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
            onClick={() => setLanguage('swahili')}
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

      {/* Readings Display Card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8 min-h-[300px] flex flex-col justify-between">
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-semibold">Loading scriptures...</p>
          </div>
        ) : reading ? (
          <div className="space-y-6 animate-fade-in flex-1">
            
            {/* Reading Title / Verse header */}
            <div className="border-b border-border/80 pb-4 space-y-1.5">
              <span className="inline-block text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded uppercase tracking-wider">
                {language === 'english' ? 'Daily Verse' : 'Fungu la Siku'}
              </span>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {language === 'english' ? reading.english_verse : reading.swahili_verse}
              </h2>
            </div>

            {/* Reading Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-sans text-sm sm:text-base whitespace-pre-line">
              {language === 'english' ? reading.english_reading : reading.swahili_reading}
            </div>

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
            <span>Kabianga Parish Liturgical Board</span>
            <span>Date: {selectedDate}</span>
          </div>
        )}
      </div>

    </div>
  );
}
