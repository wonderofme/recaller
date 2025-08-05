import { NextRequest, NextResponse } from 'next/server';
import { scrapeSpecificRecalls } from '@/lib/specific-scraper';
import { saveRecalls } from '@/lib/data-storage';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual update triggered...');
    
    // Scrape new recall data
    const recalls = await scrapeSpecificRecalls();
    
    // Save to JSON file
    await saveRecalls(recalls);
    
    console.log(`✅ Manual update completed with ${recalls.length} recalls`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated with ${recalls.length} recalls`,
      recallsCount: recalls.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error in manual update:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 