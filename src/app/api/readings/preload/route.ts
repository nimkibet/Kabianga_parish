import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { scrapeAndCache } from '../route';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate that the user is an admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized access' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user || !user.email) {
      return NextResponse.json({ success: false, message: 'Invalid session credentials' }, { status: 401 });
    }

    // Verify caller is in the administrators table
    const { data: callerProfile, error: callerError } = await supabase
      .from('administrators')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (callerError || !callerProfile) {
      return NextResponse.json({ success: false, message: 'Access denied: Administrator privileges required' }, { status: 403 });
    }

    // 2. Perform the preload for the next 7 days starting today
    const options = { timeZone: 'Africa/Nairobi', year: 'numeric' as const, month: '2-digit' as const, day: '2-digit' as const };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const startDateStr = formatter.format(new Date()); // YYYY-MM-DD
    
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    const startDayObj = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    
    const results: Array<{ date: string; status: 'cached' | 'preloaded' | 'failed'; error?: string }> = [];
    
    for (let i = 0; i <= 7; i++) {
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
          
        if (cached) {
          results.push({ date: futureDateStr, status: 'cached' });
        } else {
          console.log(`[Manual readings preload] Pre-caching reading for ${futureDateStr}...`);
          await scrapeAndCache(futureDateStr, futureDateObj);
          results.push({ date: futureDateStr, status: 'preloaded' });
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error(`[Manual readings preload] Failed for ${futureDateStr}:`, errMsg);
        results.push({ date: futureDateStr, status: 'failed', error: errMsg });
      }
    }
    
    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[Readings Preload API Error]:', errMsg);
    return NextResponse.json({ success: false, message: errMsg || 'Internal server error' }, { status: 500 });
  }
}
