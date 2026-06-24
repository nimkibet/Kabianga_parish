import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseUSCCBMarkdown, parseSwahiliReadings, parseLegacyReading, formatToLegacyString } from '@/lib/readingsParser';

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#8230;/g, '...')
    .replace(/&#160;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

/**
 * Parses Universalis mass HTML into fully structured English readings.
 * Returns clean text with no links, copyright, or page furniture.
 */
function parseUniversalisStructured(html: string): {
  firstReading: string; firstReadingVerse: string;
  secondReading: string; secondReadingVerse: string;
  psalm: string; psalmVerse: string;
  alleluia: string; alleluiaVerse: string;
  gospel: string; gospelVerse: string;
  liturgicalColor: string;
} {
  const empty = { firstReading: '', firstReadingVerse: '', secondReading: '', secondReadingVerse: '',
    psalm: '', psalmVerse: '', alleluia: '', alleluiaVerse: '', gospel: '', gospelVerse: '', liturgicalColor: 'green' };

  // Find texts div only — everything inside it is readings, nothing else
  const textsStart = html.indexOf('id="texts"');
  const textsEnd   = html.indexOf('<div id="footer"', textsStart);
  if (textsStart === -1) return empty;
  const textsHtml = html.substring(textsStart, textsEnd > 0 ? textsEnd : undefined);

  // Determine liturgical color from surrounding HTML cues
  const htmlLower = html.toLowerCase();
  let liturgicalColor = 'green';
  if (htmlLower.includes('ordinary time')) liturgicalColor = 'green';
  else if (htmlLower.includes('lent') || htmlLower.includes('advent')) liturgicalColor = 'purple';
  else if (htmlLower.includes('easter') || htmlLower.includes('christmas') || htmlLower.includes('solemnity')) liturgicalColor = 'white';
  else if (htmlLower.includes('martyr') || htmlLower.includes('passion sunday')) liturgicalColor = 'red';

  // Split by section dividers
  const sections = textsHtml.split('<hr class="shortrule"/>');

  // Helper: clean a section's div content into readable plain text.
  // Skips copyright notices, attribution lines, and other boilerplate.
  const SKIP_PATTERNS = /copyright|universalis|scripture readings from|hodder|grail|lectionary for mass|roman missal|icel|all rights reserved|used with permission/i;
  const extractContent = (sectionHtml: string): string => {
    const divs = [...sectionHtml.matchAll(/<div class="(p|v|vi|gb|sp)">(.*?)<\/div>/gi)];
    return divs
      .map(m => decodeHtmlEntities(m[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()))
      .filter(t => t.length > 0 && !SKIP_PATTERNS.test(t))
      .join('\n');
  };

  const cleanTh = (html: string) =>
    decodeHtmlEntities(html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());

  let firstReading = '', firstReadingVerse = '';
  let secondReading = '', secondReadingVerse = '';
  let psalm = '', psalmVerse = '';
  let alleluia = '', alleluiaVerse = '';
  let gospel = '', gospelVerse = '';

  for (const section of sections) {
    const leftMatch  = section.match(/<th align="left">(.*?)<\/th>/i);
    const rightMatch = section.match(/<th align="right">(.*?)<\/th>/i);
    if (!leftMatch) continue;

    const header = cleanTh(leftMatch[1]).toLowerCase();
    const verse  = rightMatch ? cleanTh(rightMatch[1]) : '';
    const content = extractContent(section);
    if (!content) continue;

    if (header.includes('first reading') || header === 'reading') {
      firstReading = content + '\n\nThe word of the Lord.\nThanks be to God.';
      firstReadingVerse = verse;
    } else if (header.includes('second reading')) {
      secondReading = content + '\n\nThe word of the Lord.\nThanks be to God.';
      secondReadingVerse = verse;
    } else if (header.includes('psalm')) {
      psalm = content;
      psalmVerse = verse;
    } else if (header.includes('acclamation') || header.includes('alleluia') || header.includes('sequence')) {
      alleluia = content;
      alleluiaVerse = verse;
    } else if (header.includes('gospel') && !header.includes('acclamation')) {
      gospel = content + '\n\nThe Gospel of the Lord.\nPraise to you, Lord Jesus Christ.';
      gospelVerse = verse;
    }
  }

  return { firstReading, firstReadingVerse, secondReading, secondReadingVerse,
    psalm, psalmVerse, alleluia, alleluiaVerse, gospel, gospelVerse, liturgicalColor };
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


// Helper to fetch and cache a reading for a specific date
export async function scrapeAndCache(targetDateStr: string, targetDateObj: Date) {
  const year = targetDateObj.getUTCFullYear();
  const month = String(targetDateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(targetDateObj.getUTCDate()).padStart(2, '0');

  // 1. Scrape English readings — Universalis is primary (USCCB blocks server-side requests)
  let englishVerse = 'Daily Mass Readings';
  let englishReading = '';
  let parsedEn: any = { firstReading: '', firstReadingVerse: '', secondReading: '', secondReadingVerse: '',
    psalm: '', psalmVerse: '', alleluia: '', alleluiaVerse: '', gospel: '', gospelVerse: '', liturgicalColor: 'green' };

  try {
    const dateFormatted = `${year}${month}${day}`;
    const universalisUrl = `https://universalis.com/${dateFormatted}/mass.htm`;
    console.log(`[Readings Scraper] Fetching English readings from Universalis: ${universalisUrl}`);

    const response = await fetch(universalisUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' }
    });

    if (response.ok) {
      const html = await response.text();
      parsedEn = parseUniversalisStructured(html);
      englishReading = formatToLegacyString(parsedEn);
      englishVerse = parsedEn.firstReadingVerse && parsedEn.gospelVerse
        ? `${parsedEn.firstReadingVerse} & ${parsedEn.gospelVerse}`
        : parsedEn.firstReadingVerse || parsedEn.gospelVerse || 'Daily Mass Readings';
    } else {
      console.warn(`[Readings Scraper] Universalis returned ${response.status}`);
    }
  } catch (err: any) {
    console.error('[Readings Scraper] Failed to fetch English readings from Universalis:', err.message);
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
