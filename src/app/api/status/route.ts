import { NextResponse } from 'next/server';
import { loadRecalls, getLastUpdated } from '@/lib/data-storage';

export async function GET() {
  try {
    const recalls = await loadRecalls();
    const lastUpdated = await getLastUpdated();
    
    return NextResponse.json({
      success: true,
      recallsCount: recalls.length,
      lastUpdated: lastUpdated,
      status: 'operational',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting status:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 