import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getLiturgicalSeason } from '@/lib/liturgicalSeason';

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

function getSwahiliUrl(html: string, date: Date): string | null {
  const months = [
    'januari', 'februari', 'machi', 'aprili', 'mei', 'juni',
    'julai', 'agosti', 'septemba', 'oktoba', 'novemba', 'desemba'
  ];
  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  const year = date.getFullYear();
  
  // Try matching with date string like: "juni-22-2026"
  const dateSlug = `${monthName}-${dayNum}-${year}`;
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  let targetDateStr = dateParam;
  if (!targetDateStr) {
    // Default to today in Kenya local time
    const options = { timeZone: 'Africa/Nairobi', year: 'numeric' as const, month: '2-digit' as const, day: '2-digit' as const };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    targetDateStr = formatter.format(new Date()); // YYYY-MM-DD
  }
  
  const targetDateObj = new Date(targetDateStr);
  const year = targetDateObj.getFullYear();
  const month = String(targetDateObj.getMonth() + 1).padStart(2, '0');
  const day = String(targetDateObj.getDate()).padStart(2, '0');
  const dateFormattedYYYYMMDD = `${year}${month}${day}`;
  
  try {
    // 1. Query Supabase cache first
    const { data: cachedReading, error: queryError } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('date', targetDateStr)
      .maybeSingle();
      
    if (cachedReading) {
      return NextResponse.json({ success: true, cached: true, data: cachedReading });
    }
    
    // 2. Not cached: scrape English readings from Universalis
    let englishVerse = 'Daily Mass Readings';
    let englishReading = '';
    
    try {
      const universalisUrl = `https://universalis.com/${dateFormattedYYYYMMDD}/mass.htm`;
      const response = await fetch(universalisUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        next: { revalidate: 3600 }
      });
      if (response.ok) {
        const html = await response.text();
        const parsed = parseUniversalisHtml(html);
        if (parsed.text) {
          englishReading = parsed.text;
          englishVerse = parsed.verse;
        }
      }
    } catch (engErr) {
      console.error('Failed to scrape English readings:', engErr);
    }
    
    // 3. Scrape Swahili readings from Mkatoliki Leo
    let swahiliVerse = 'Masomo ya Misa';
    let swahiliReading = '';
    
    try {
      // First, fetch the readings list page to find the post link
      const listUrl = 'https://mkatolikileo.com/masomo-ya-misa';
      const listResponse = await fetch(listUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        next: { revalidate: 3600 }
      });
      
      if (listResponse.ok) {
        const listHtml = await listResponse.text();
        const postUrl = getSwahiliUrl(listHtml, targetDateObj);
        
        if (postUrl) {
          // Fetch the individual post
          const postResponse = await fetch(postUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
          });
          
          if (postResponse.ok) {
            const postHtml = await postResponse.text();
            const parsed = parseSwahiliHtml(postHtml);
            if (parsed.text) {
              swahiliReading = parsed.text;
              swahiliVerse = parsed.verse;
            }
          }
        }
      }
    } catch (swaErr) {
      console.error('Failed to scrape Swahili readings:', swaErr);
    }
    
    // 4. Fallback if both scrapers failed to extract text
    if (!englishReading && !swahiliReading) {
      return NextResponse.json({ 
        success: false, 
        message: 'No readings available in database and scraper failed to load on-demand.' 
      }, { status: 404 });
    }
    
    // Fill basic placeholders if only one succeeded
    if (!englishReading) {
      englishReading = 'English readings are unavailable for this date. Please consult the liturgical calendar.';
      englishVerse = 'Mass Readings';
    }
    if (!swahiliReading) {
      swahiliReading = 'Masomo ya Kiswahili hayapatikani kwa tarehe hii. Tafadhali wasiliana na ofisi ya parokia.';
      swahiliVerse = 'Masomo ya Misa';
    }
    
    // 5. Save/cache the scraped reading into Supabase so it's instant next time!
    const newRecord = {
      date: targetDateStr,
      english_reading: englishReading,
      swahili_reading: swahiliReading,
      english_verse: englishVerse,
      swahili_verse: swahiliVerse
    };
    
    const { data: insertedData, error: insertError } = await supabase
      .from('daily_readings')
      .insert(newRecord)
      .select()
      .single();
      
    if (insertError) {
      console.warn('Failed to cache daily reading in Supabase:', insertError.message);
      // Return the record even if database insertion failed (e.g. key conflict due to concurrency)
      return NextResponse.json({ success: true, cached: false, data: newRecord });
    }
    
    return NextResponse.json({ success: true, cached: false, data: insertedData });
    
  } catch (err: any) {
    console.error('API Error in readings route:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
