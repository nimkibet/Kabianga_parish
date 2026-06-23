import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseUSCCBMarkdown, parseSwahiliReadings, parseLegacyReading, formatToLegacyString } from '@/lib/readingsParser';

function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '...')
    .replace(/&#160;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();
}

function parseUniversalisHtml(html: string): { verse: string; text: string } {
  const textsIndex = html.indexOf('<div id="texts">');
  if (textsIndex === -1) return { verse: '', text: '' };
  
  const textsHtml = html.substring(textsIndex);
  const parts = textsHtml.split('<hr class="shortrule"/>');
  
  let resultText = '';
  let firstReadingVerse = '';
  let gospelVerse = '';
  
  for (const part of parts) {
    const headerMatch = part.match(/<th align="left">(.*?)<\/th>/i);
    const verseMatch = part.match(/<th align="right">(.*?)<\/th>/i);
    
    if (headerMatch && verseMatch) {
      const header = cleanHtml(headerMatch[1]);
      const verse = cleanHtml(verseMatch[1]);
      
      if (header.toLowerCase().includes('first reading')) {
        firstReadingVerse = verse;
      } else if (header.toLowerCase().includes('gospel') && !header.toLowerCase().includes('acclamation')) {
        gospelVerse = verse;
      }
      
      resultText += `\n\n=== ${header} (${verse}) ===\n`;
    }
    
    // Match paragraphs and verses
    const divs = part.match(/<div class="(p|v|vi|gb)">(.*?)<\/div>/gi) || [];
    for (const div of divs) {
      const content = div.replace(/<[^>]*>/g, '');
      resultText += cleanHtml(content) + '\n';
    }
  }
  
  const englishVerse = firstReadingVerse && gospelVerse 
    ? `${firstReadingVerse} & ${gospelVerse}` 
    : firstReadingVerse || gospelVerse || 'Daily Mass Readings';
    
  return { verse: englishVerse, text: resultText.trim() };
}

function constructSwahiliUrl(date: Date): string {
  const days = ['jumapili', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
  const months = [
    'januari', 'februari', 'machi', 'aprili', 'mei', 'juni',
    'julai', 'agosti', 'septemba', 'oktoba', 'novemba', 'desemba'
  ];
  
  // Use UTC to align dates properly.
  // targetDateObj is created as UTC midnight when parsed from YYYY-MM-DD.
  const refDate = new Date(Date.UTC(2026, 5, 22)); // June 22, 2026
  const targetDateUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  
  const diffTime = targetDateUTC.getTime() - refDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const refId = 3824;
  const targetId = refId + diffDays;
  
  const dayName = days[targetDateUTC.getUTCDay()];
  const monthName = months[targetDateUTC.getUTCMonth()];
  const dayNum = targetDateUTC.getUTCDate();
  const year = targetDateUTC.getUTCFullYear();
  
  return `https://mkatolikileo.com/masomo-ya-misa/${targetId}/${dayName}-${monthName}-${dayNum}-${year}`;
}

function getSwahiliUrl(html: string, date: Date): string | null {
  const months = [
    'januari', 'februari', 'machi', 'aprili', 'mei', 'juni',
    'julai', 'agosti', 'septemba', 'oktoba', 'novemba', 'desemba'
  ];
  const monthName = months[date.getUTCMonth()];
  const dayNum = date.getUTCDate();
  const year = date.getUTCFullYear();
  
  const regex = new RegExp(`href="([^"]*masomo-ya-misa/[^"]*${monthName}[^"]*${dayNum}[^"]*${year}[^"]*)"`, 'i');
  const match = html.match(regex);
  if (match) {
    return match[1];
  }
  
  // Fallback match
  const fallbackRegex = new RegExp(`href="([^"]*masomo-ya-misa/[^"]*${monthName}[^"]*${dayNum}[^"]*)"`, 'i');
  const fallbackMatch = html.match(fallbackRegex);
  if (fallbackMatch) {
    return fallbackMatch[1];
  }
  
  return null;
}

function parseSwahiliHtml(html: string): { verse: string; text: string } {
  const regex = /<span class="reading_title">([\s\S]*?)<\/span>\s*<h3 class="reading">([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  
  let match;
  let resultText = '';
  let firstReadingVerse = '';
  let gospelVerse = '';
  
  while ((match = regex.exec(html)) !== null) {
    const title = cleanHtml(match[1]);
    const verse = cleanHtml(match[2]);
    const content = cleanHtml(match[3]);
    
    if (title.toLowerCase().includes('somo la 1') || title.toLowerCase().includes('somo la kwanza')) {
      firstReadingVerse = verse;
    } else if (title.toLowerCase().includes('injili')) {
      gospelVerse = verse;
    }
    
    resultText += `\n\n=== ${title} (${verse}) ===\n${content}\n`;
  }
  
  // Backup parser in case of structure drift
  if (!resultText) {
    const divRegex = /<div class="readings">([\s\S]*?)<\/div>/gi;
    let divMatch;
    while ((divMatch = divRegex.exec(html)) !== null) {
      const innerHtml = divMatch[1];
      const titleMatch = innerHtml.match(/<span class="reading_title">([\s\S]*?)<\/span>/i);
      const verseMatch = innerHtml.match(/<h3 class="reading">([\s\S]*?)<\/h3>/i);
      const pMatch = innerHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
      
      if (titleMatch && verseMatch && pMatch) {
        const title = cleanHtml(titleMatch[1]);
        const verse = cleanHtml(verseMatch[1]);
        const content = cleanHtml(pMatch[1]);
        
        if (title.toLowerCase().includes('somo la 1') || title.toLowerCase().includes('somo la kwanza')) {
          firstReadingVerse = verse;
        } else if (title.toLowerCase().includes('injili')) {
          gospelVerse = verse;
        }
        
        resultText += `\n\n=== ${title} (${verse}) ===\n${content}\n`;
      }
    }
  }
  
  const swahiliVerse = firstReadingVerse && gospelVerse 
    ? `${firstReadingVerse} na ${gospelVerse}` 
    : firstReadingVerse || gospelVerse || 'Masomo ya Misa';
    
  return { verse: swahiliVerse, text: resultText.trim() };
}

// Helper to fetch and cache a reading for a specific date
export async function scrapeAndCache(targetDateStr: string, targetDateObj: Date) {
  const year = targetDateObj.getUTCFullYear();
  const month = String(targetDateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(targetDateObj.getUTCDate()).padStart(2, '0');

  // 1. Scrape English readings
  let englishVerse = 'Daily Mass Readings';
  let englishReading = '';
  let parsedEn: any = { firstReading: '', firstReadingVerse: '', secondReading: '', secondReadingVerse: '', psalm: '', psalmVerse: '', gospel: '', gospelVerse: '', liturgicalColor: 'green' };

  // Try USCCB Markdown (highly reliable)
  try {
    const MM = String(targetDateObj.getUTCMonth() + 1).padStart(2, '0');
    const DD = String(targetDateObj.getUTCDate()).padStart(2, '0');
    const YY = String(targetDateObj.getUTCFullYear() % 100).padStart(2, '0');
    const usccbUrl = `https://bible.usccb.org/bible/readings/${MM}${DD}${YY}.cfm.md`;
    
    console.log(`[Readings Scraper] Fetching USCCB readings in Markdown: ${usccbUrl}`);
    const response = await fetch(usccbUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });

    if (response.ok) {
      const md = await response.text();
      parsedEn = parseUSCCBMarkdown(md);
      englishReading = formatToLegacyString(parsedEn);
      englishVerse = parsedEn.firstReadingVerse && parsedEn.gospelVerse
        ? `${parsedEn.firstReadingVerse} & ${parsedEn.gospelVerse}`
        : parsedEn.firstReadingVerse || parsedEn.gospelVerse || 'Daily Mass Readings';
    }
  } catch (err: any) {
    console.warn('[Readings Scraper] USCCB fetch failed, trying Universalis fallback:', err.message);
    
    // Universalis HTML fallback
    try {
      const dateFormattedYYYYMMDD = `${year}${month}${day}`;
      const universalisUrl = `https://universalis.com/${dateFormattedYYYYMMDD}/mass.htm`;
      const response = await fetch(universalisUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });
      if (response.ok) {
        const html = await response.text();
        const parsed = parseUniversalisHtml(html);
        if (parsed.text) {
          englishReading = parsed.text;
          englishVerse = parsed.verse;
          const legacyParsed = parseLegacyReading(englishReading);
          parsedEn = {
            ...legacyParsed,
            liturgicalColor: html.toLowerCase().includes('ordinary time') ? 'green' : html.toLowerCase().includes('lent') || html.toLowerCase().includes('advent') ? 'purple' : 'white'
          };
        }
      }
    } catch (engErr: any) {
      console.error('Failed to scrape English readings from Universalis:', engErr.message);
    }
  }

  // 2. Scrape Swahili readings from Mkatoliki Leo
  let swahiliVerse = 'Masomo ya Misa';
  let swahiliReading = '';
  let parsedSw: any = { firstReading: '', firstReadingVerse: '', secondReading: '', secondReadingVerse: '', psalm: '', psalmVerse: '', alleluia: '', alleluiaVerse: '', gospel: '', gospelVerse: '' };

  try {
    const swahiliUrl = constructSwahiliUrl(targetDateObj);
    console.log(`[Readings Scraper] Scraping Swahili readings from: ${swahiliUrl}`);
    const postResponse = await fetch(swahiliUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    
    let fetchedOk = false;
    if (postResponse.ok) {
      const postHtml = await postResponse.text();
      parsedSw = parseSwahiliReadings(postHtml);
      swahiliReading = formatToLegacyString(parsedSw);
      swahiliVerse = parsedSw.firstReadingVerse && parsedSw.gospelVerse
        ? `${parsedSw.firstReadingVerse} na ${parsedSw.gospelVerse}`
        : parsedSw.firstReadingVerse || parsedSw.gospelVerse || 'Masomo ya Misa';
      fetchedOk = true;
    }
    
    // Fallback to scraping list page if direct predicted URL did not work
    if (!fetchedOk) {
      console.log(`[Readings Scraper] Direct Swahili fetch failed. Falling back to list page parsing...`);
      const listUrl = 'https://mkatolikileo.com/masomo-ya-misa';
      const listResponse = await fetch(listUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });
      
      if (listResponse.ok) {
        const listHtml = await listResponse.text();
        const postUrl = getSwahiliUrl(listHtml, targetDateObj);
        
        if (postUrl) {
          const fallbackPostResponse = await fetch(postUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
          });
          
          if (fallbackPostResponse.ok) {
            const postHtml = await fallbackPostResponse.text();
            parsedSw = parseSwahiliReadings(postHtml);
            swahiliReading = formatToLegacyString(parsedSw);
            swahiliVerse = parsedSw.firstReadingVerse && parsedSw.gospelVerse
              ? `${parsedSw.firstReadingVerse} na ${parsedSw.gospelVerse}`
              : parsedSw.firstReadingVerse || parsedSw.gospelVerse || 'Masomo ya Misa';
          }
        }
      }
    }
  } catch (swaErr: any) {
    console.error(`Failed to scrape Swahili readings for ${targetDateStr}:`, swaErr.message);
  }
  
  // Fail if both scrapers returned absolutely nothing
  if (!englishReading && !swahiliReading) {
    throw new Error(`Scrapers failed to load readings for ${targetDateStr}.`);
  }
  
  // Fallbacks if only one language succeeded
  if (!englishReading) {
    englishReading = 'English readings are unavailable for this date. Please consult the liturgical calendar.';
    englishVerse = 'Mass Readings';
  }
  if (!swahiliReading) {
    swahiliReading = 'Masomo ya Kiswahili hayapatikani kwa tarehe hii. Tafadhali wasiliana na ofisi ya parokia.';
    swahiliVerse = 'Masomo ya Misa';
  }
  
  // Save/cache the record in Supabase using the exact remote database schema
  const contentEnWithColor = `[color:${parsedEn.liturgicalColor || 'green'}]\n${englishReading}`;
  
  const toInsert = {
    reading_date: targetDateStr,
    title_en: englishVerse,
    content_en: contentEnWithColor,
    title_sw: swahiliVerse,
    content_sw: swahiliReading
  };
  
  const formattedRecord = {
    reading_date: targetDateStr,
    english_reading: englishReading,
    swahili_reading: swahiliReading,
    english_verse: englishVerse,
    swahili_verse: swahiliVerse,
    first_reading_en: parsedEn.firstReading,
    first_reading_sw: parsedSw.firstReading,
    second_reading_en: parsedEn.secondReading,
    second_reading_sw: parsedSw.secondReading,
    psalm_en: parsedEn.psalm,
    psalm_sw: parsedSw.psalm,
    alleluia_en: parsedEn.alleluia || '',
    alleluia_verse_en: parsedEn.alleluiaVerse || '',
    alleluia_sw: parsedSw.alleluia || '',
    alleluia_verse_sw: parsedSw.alleluiaVerse || '',
    gospel_en: parsedEn.gospel,
    gospel_sw: parsedSw.gospel,
    liturgical_color: parsedEn.liturgicalColor || 'green'
  };

  const { data: insertedData, error: insertError } = await supabase
    .from('daily_readings')
    .insert(toInsert)
    .select()
    .single();
    
  if (insertError) {
    console.warn(`Failed to cache daily reading for ${targetDateStr} in Supabase:`, insertError.message);
    return formattedRecord;
  }
  
  return {
    ...formattedRecord,
    id: insertedData.id
  };
}

// Background worker to preload readings for the next 7 days
export async function preloadNextWeek(startDateStr: string) {
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  const startDayObj = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  
  for (let i = 1; i <= 7; i++) {
    const futureDateObj = new Date(startDayObj.getTime());
    futureDateObj.setUTCDate(startDayObj.getUTCDate() + i);
    
    const year = futureDateObj.getUTCFullYear();
    const month = String(futureDateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(futureDateObj.getUTCDate()).padStart(2, '0');
    const futureDateStr = `${year}-${month}-${day}`;
    
    try {
      // Check if already in cache
      const { data: cached } = await supabase
        .from('daily_readings')
        .select('id')
        .eq('reading_date', futureDateStr)
        .maybeSingle();
        
      if (!cached) {
        console.log(`[Readings Background Preload] Pre-caching reading for ${futureDateStr}...`);
        await scrapeAndCache(futureDateStr, futureDateObj);
        console.log(`[Readings Background Preload] Successfully cached ${futureDateStr}.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Readings Background Preload] Failed to pre-cache ${futureDateStr}:`, msg);
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  let targetDateStr = dateParam;
  if (!targetDateStr) {
    const options = { timeZone: 'Africa/Nairobi', year: 'numeric' as const, month: '2-digit' as const, day: '2-digit' as const };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    targetDateStr = formatter.format(new Date()); // YYYY-MM-DD
  }
  
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDateObj = new Date(Date.UTC(year, month - 1, day));
  
  try {
    // 1. Query Supabase cache first using correct column 'reading_date'
    const { data: cachedReading, error: queryError } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('reading_date', targetDateStr)
      .maybeSingle();
      
    if (queryError) {
      console.warn('Supabase query error:', queryError.message);
    }
      
    if (cachedReading) {
      // Decode liturgical color and clean content
      let liturgicalColor = 'green';
      let englishReading = cachedReading.content_en || '';
      if (englishReading.startsWith('[color:')) {
        const colorEnd = englishReading.indexOf(']');
        liturgicalColor = englishReading.substring(7, colorEnd);
        englishReading = englishReading.substring(colorEnd + 1).trim();
      }

      // Parse structured sections
      const parsedEn = parseLegacyReading(englishReading);
      const parsedSw = parseLegacyReading(cachedReading.content_sw || '');

      const formattedReading = {
        id: cachedReading.id,
        reading_date: cachedReading.reading_date,
        english_reading: englishReading,
        swahili_reading: cachedReading.content_sw || '',
        english_verse: cachedReading.title_en || '',
        swahili_verse: cachedReading.title_sw || '',
        first_reading_en: parsedEn.firstReading,
        first_reading_sw: parsedSw.firstReading,
        second_reading_en: parsedEn.secondReading,
        second_reading_sw: parsedSw.secondReading,
        psalm_en: parsedEn.psalm,
        psalm_sw: parsedSw.psalm,
        alleluia_en: parsedEn.alleluia || '',
        alleluia_verse_en: parsedEn.alleluiaVerse || '',
        alleluia_sw: parsedSw.alleluia || '',
        alleluia_verse_sw: parsedSw.alleluiaVerse || '',
        gospel_en: parsedEn.gospel,
        gospel_sw: parsedSw.gospel,
        liturgical_color: liturgicalColor
      };

      // OPTIMIZATION: Check if the day + 7 reading is already cached.
      // If it is, we don't trigger the background preload worker.
      const future7Obj = new Date(targetDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
      const future7Year = future7Obj.getUTCFullYear();
      const future7Month = String(future7Obj.getUTCMonth() + 1).padStart(2, '0');
      const future7Day = String(future7Obj.getUTCDate()).padStart(2, '0');
      const future7Str = `${future7Year}-${future7Month}-${future7Day}`;
      
      const { data: hasFutureReading } = await supabase
        .from('daily_readings')
        .select('id')
        .eq('reading_date', future7Str)
        .maybeSingle();
        
      if (!hasFutureReading) {
        // Trigger background preloader for the next 7 days (non-blocking)
        setTimeout(() => {
          preloadNextWeek(targetDateStr).catch(err => {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('Background preloader error:', msg);
          });
        }, 0);
      }
      
      return NextResponse.json({ success: true, cached: true, data: formattedReading });
    }
    
    // 2. Not cached: scrape on-demand
    console.log(`Reading not cached. Scraping on-demand for ${targetDateStr}...`);
    const newRecord = await scrapeAndCache(targetDateStr, targetDateObj);
    
    // Trigger background preloader for the next 7 days (non-blocking)
    setTimeout(() => {
      preloadNextWeek(targetDateStr).catch(err => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Background preloader error:', msg);
      });
    }, 0);
    
    return NextResponse.json({ success: true, cached: false, data: newRecord });
    
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('API Error in readings route:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 404 });
  }
}
