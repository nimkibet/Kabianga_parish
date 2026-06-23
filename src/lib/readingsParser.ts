/**
 * Parsers and utility functions for Daily Mass Readings
 */

export interface ParsedReadings {
  firstReading: string;
  firstReadingVerse: string;
  secondReading: string;
  secondReadingVerse: string;
  psalm: string;
  psalmVerse: string;
  alleluia: string;
  alleluiaVerse: string;
  gospel: string;
  gospelVerse: string;
  liturgicalColor: string;
}

/**
 * Parses USCCB Markdown daily readings into structured sections
 */
export function parseUSCCBMarkdown(md: string): ParsedReadings {
  if (!md) {
    return {
      firstReading: '', firstReadingVerse: '',
      secondReading: '', secondReadingVerse: '',
      psalm: '', psalmVerse: '',
      alleluia: '', alleluiaVerse: '',
      gospel: '', gospelVerse: '',
      liturgicalColor: 'green'
    };
  }

  const normalized = md.replace(/\r\n/g, '\n');
  const parts = normalized.split(/###\s+/);
  
  let firstReading = '';
  let secondReading = '';
  let psalm = '';
  let alleluia = '';
  let gospel = '';
  let firstReadingVerse = '';
  let secondReadingVerse = '';
  let psalmVerse = '';
  let alleluiaVerse = '';
  let gospelVerse = '';
  let liturgicalColor = 'green';

  // Determine liturgical color from text cues
  const textLower = normalized.toLowerCase();
  if (textLower.includes('ordinary time') || textLower.includes('kinyume cha kawaida')) {
    liturgicalColor = 'green';
  } else if (textLower.includes('lent') || textLower.includes('advent') || textLower.includes('kwaresima') || textLower.includes('ujio wa bwana')) {
    liturgicalColor = 'purple';
  } else if (textLower.includes('easter') || textLower.includes('christmas') || textLower.includes('solemnity') || textLower.includes('pasaka') || textLower.includes('noeli')) {
    liturgicalColor = 'white';
  } else if (textLower.includes('martyr') || textLower.includes('passion') || textLower.includes('kufia dini')) {
    liturgicalColor = 'red';
  }

  for (const part of parts) {
    const lines = part.split('\n');
    if (lines.length === 0) continue;
    
    const header = lines[0].trim().toLowerCase();
    const contentLines = lines.slice(1);
    
    let verse = '';
    const textLines: string[] = [];
    
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i].trim();
      if (!line) continue;
      
      if (line.startsWith('[') && line.includes('](')) {
        verse = line.substring(line.indexOf('[') + 1, line.indexOf(']')).trim();
      } else {
        textLines.push(contentLines[i]);
      }
    }
    
    const contentText = textLines.join('\n').trim();
    
    if (header.includes('reading 1') || header.includes('reading i') || header.startsWith('reading\n')) {
      firstReading = contentText;
      firstReadingVerse = verse || 'Reading I';
    } else if (header.includes('reading 2') || header.includes('reading ii')) {
      secondReading = contentText;
      secondReadingVerse = verse || 'Reading II';
    } else if (header.includes('responsorial psalm') || header.includes('psalm')) {
      psalm = contentText;
      psalmVerse = verse || 'Responsorial Psalm';
    } else if (header.includes('alleluia') || header.includes('gospel acclamation') || header.includes('sequence')) {
      alleluia = contentText;
      alleluiaVerse = verse || 'Alleluia';
    } else if (header.includes('gospel')) {
      gospel = contentText;
      gospelVerse = verse || 'Gospel';
    }
  }

  return {
    firstReading,
    firstReadingVerse,
    secondReading,
    secondReadingVerse,
    psalm,
    psalmVerse,
    alleluia,
    alleluiaVerse,
    gospel,
    gospelVerse,
    liturgicalColor
  };
}

/**
 * Parses Swahili readings from Mkatoliki Leo HTML
 */
export function parseSwahiliReadings(html: string): Omit<ParsedReadings, 'liturgicalColor'> {
  const cleanHtml = (txt: string) => {
    if (!txt) return '';
    return txt
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Capture each section: title, verse reference, and ALL paragraphs that follow before the next section
  // Strategy: split by reading_title spans and parse each block
  const blockRegex = /<span class="reading_title">([\s\S]*?)<\/span>\s*<h3 class="reading">([\s\S]*?)<\/h3>([\s\S]*?)(?=<span class="reading_title">|<div class="entity_footer">|$)/gi;
  
  let match;
  let firstReading = '';
  let firstReadingVerse = '';
  let secondReading = '';
  let secondReadingVerse = '';
  let psalm = '';
  let psalmVerse = '';
  let alleluia = '';
  let alleluiaVerse = '';
  let gospel = '';
  let gospelVerse = '';
  
  while ((match = blockRegex.exec(html)) !== null) {
    const title = cleanHtml(match[1]);
    const verse = cleanHtml(match[2]);
    // Extract all <p> text from the block body (match[3])
    const bodyHtml = match[3];
    const allParas = [...bodyHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(pm => cleanHtml(pm[1]))
      .filter(t => t.length > 0)
      .join('\n');
    const content = allParas || cleanHtml(bodyHtml);
    
    const titleLower = title.toLowerCase();
    if (titleLower.includes('somo la 1') || titleLower.includes('somo la kwanza')) {
      firstReading = content;
      firstReadingVerse = verse;
    } else if (titleLower.includes('somo la 2') || titleLower.includes('somo la pili')) {
      secondReading = content;
      secondReadingVerse = verse;
    } else if (
      titleLower.includes('wimbo wa katikati') ||
      titleLower.includes('wimbo') ||
      titleLower.includes('zaburi')
    ) {
      // Responsorial Psalm (Wimbo wa Katikati)
      psalm = content;
      psalmVerse = verse;
    } else if (
      titleLower.includes('shangilio') ||
      titleLower.includes('aleluya') ||
      titleLower.includes('gospel acclamation')
    ) {
      // Alleluia verse (Shangilio)
      alleluia = content;
      alleluiaVerse = verse;
    } else if (titleLower.includes('injili')) {
      gospel = content;
      gospelVerse = verse;
    }
  }

  // Backup parser for structure changes
  if (!firstReading && !gospel) {
    const divRegex = /<div class="readings">([\s\S]*?)<\/div>/gi;
    let divMatch;
    while ((divMatch = divRegex.exec(html)) !== null) {
      const innerHtml = divMatch[1];
      const titleMatch = innerHtml.match(/<span class="reading_title">([\s\S]*?)<\/span>/i);
      const verseMatch = innerHtml.match(/<h3 class="reading">([\s\S]*?)<\/h3>/i);
      const allPMatches = [...innerHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
      
      if (titleMatch && verseMatch && allPMatches.length > 0) {
        const title = cleanHtml(titleMatch[1]);
        const verse = cleanHtml(verseMatch[1]);
        const content = allPMatches.map(pm => cleanHtml(pm[1])).filter(t => t).join('\n');
        
        const titleLower = title.toLowerCase();
        if (titleLower.includes('somo la 1') || titleLower.includes('somo la kwanza')) {
          firstReading = content;
          firstReadingVerse = verse;
        } else if (titleLower.includes('somo la 2') || titleLower.includes('somo la pili')) {
          secondReading = content;
          secondReadingVerse = verse;
        } else if (titleLower.includes('wimbo wa katikati') || titleLower.includes('wimbo') || titleLower.includes('zaburi')) {
          psalm = content;
          psalmVerse = verse;
        } else if (titleLower.includes('shangilio') || titleLower.includes('aleluya')) {
          alleluia = content;
          alleluiaVerse = verse;
        } else if (titleLower.includes('injili')) {
          gospel = content;
          gospelVerse = verse;
        }
      }
    }
  }

  return {
    firstReading,
    firstReadingVerse,
    secondReading,
    secondReadingVerse,
    psalm,
    psalmVerse,
    alleluia,
    alleluiaVerse,
    gospel,
    gospelVerse
  };
}

/**
 * Parses legacy/raw reading columns (saved with === Title (Verse) === headers)
 */
export function parseLegacyReading(text: string): Omit<ParsedReadings, 'liturgicalColor'> {
  if (!text) {
    return {
      firstReading: '', firstReadingVerse: '',
      secondReading: '', secondReadingVerse: '',
      psalm: '', psalmVerse: '',
      alleluia: '', alleluiaVerse: '',
      gospel: '', gospelVerse: ''
    };
  }
  
  const sections = text.split('===');
  let firstReading = '';
  let firstReadingVerse = '';
  let secondReading = '';
  let secondReadingVerse = '';
  let psalm = '';
  let psalmVerse = '';
  let alleluia = '';
  let alleluiaVerse = '';
  let gospel = '';
  let gospelVerse = '';
  
  for (let i = 1; i < sections.length; i += 2) {
    const titleAndVerse = sections[i].trim();
    const content = sections[i+1] ? sections[i+1].trim() : '';
    
    const titleLower = titleAndVerse.toLowerCase();
    const verseMatch = titleAndVerse.match(/\(([^)]+)\)/);
    const verse = verseMatch ? verseMatch[1].trim() : '';
    
    if (titleLower.includes('reading 1') || titleLower.includes('somo la 1') || titleLower.includes('somo la kwanza')) {
      firstReading = content;
      firstReadingVerse = verse || 'Reading 1';
    } else if (titleLower.includes('reading 2') || titleLower.includes('somo la 2') || titleLower.includes('somo la pili')) {
      secondReading = content;
      secondReadingVerse = verse || 'Reading 2';
    } else if (titleLower.includes('psalm') || titleLower.includes('zaburi') || titleLower.includes('wimbo wa katikati') || titleLower.includes('wimbo')) {
      psalm = content;
      psalmVerse = verse || 'Responsorial Psalm';
    } else if (titleLower.includes('alleluia') || titleLower.includes('shangilio') || titleLower.includes('aleluya') || titleLower.includes('gospel acclamation')) {
      alleluia = content;
      alleluiaVerse = verse || 'Alleluia';
    } else if (titleLower.includes('gospel') || titleLower.includes('injili')) {
      gospel = content;
      gospelVerse = verse || 'Gospel';
    }
  }

  return {
    firstReading,
    firstReadingVerse,
    secondReading,
    secondReadingVerse,
    psalm,
    psalmVerse,
    alleluia,
    alleluiaVerse,
    gospel,
    gospelVerse
  };
}

/**
 * Combines parsed components back into the legacy format for backwards compatibility caching
 */
export function formatToLegacyString(parsed: Omit<ParsedReadings, 'liturgicalColor'>): string {
  let result = '';
  if (parsed.firstReading) {
    result += `=== Reading 1 (${parsed.firstReadingVerse}) ===\n${parsed.firstReading}\n\n`;
  }
  if (parsed.secondReading) {
    result += `=== Reading 2 (${parsed.secondReadingVerse}) ===\n${parsed.secondReading}\n\n`;
  }
  if (parsed.psalm) {
    result += `=== Responsorial Psalm (${parsed.psalmVerse}) ===\n${parsed.psalm}\n\n`;
  }
  if (parsed.alleluia) {
    result += `=== Alleluia (${parsed.alleluiaVerse}) ===\n${parsed.alleluia}\n\n`;
  }
  if (parsed.gospel) {
    result += `=== Gospel (${parsed.gospelVerse}) ===\n${parsed.gospel}\n\n`;
  }
  return result.trim();
}
