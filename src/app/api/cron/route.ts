import { NextRequest, NextResponse } from 'next/server';
import { scrapeSpecificRecalls } from '@/lib/specific-scraper';
import { saveRecalls } from '@/lib/data-storage';

export async function GET(request: NextRequest) {
  try {
    console.log('🕐 Starting hourly recall update...');
    
    // Scrape new recall data
    const recalls = await scrapeSpecificRecalls();
    
    // Save to JSON file
    await saveRecalls(recalls);
    
    console.log(`✅ Updated with ${recalls.length} recalls`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated with ${recalls.length} recalls`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in cron job:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 