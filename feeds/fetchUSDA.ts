import { fetchRSSFeed, FEED_SOURCES } from '../src/lib/rss-parser';

export async function fetchUSDAFeed() {
  const usdaSource = FEED_SOURCES.find(source => source.name === 'USDA');
  if (!usdaSource) {
    throw new Error('USDA source not found');
  }
  
  return await fetchRSSFeed(usdaSource);
} 