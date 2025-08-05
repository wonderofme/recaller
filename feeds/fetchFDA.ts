import { fetchRSSFeed, FEED_SOURCES } from '../src/lib/rss-parser';

export async function fetchFDAFeed() {
  const fdaSource = FEED_SOURCES.find(source => source.name === 'FDA');
  if (!fdaSource) {
    throw new Error('FDA source not found');
  }
  
  return await fetchRSSFeed(fdaSource);
} 