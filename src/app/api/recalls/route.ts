import { NextResponse } from 'next/server';
import { loadRecalls, getLastUpdated } from '@/lib/data-storage';

export async function GET() {
  try {
    const recalls = await loadRecalls();
    const lastUpdated = await getLastUpdated();
    
    return NextResponse.json({
      recalls,
      lastUpdated,
      count: recalls.length
    });
  } catch (error) {
    console.error('Error loading recalls:', error);
    return NextResponse.json(
      { error: 'Failed to load recalls' },
      { status: 500 }
    );
  }
} 