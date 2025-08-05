import { fetchRSSFeed, FEED_SOURCES } from '../src/lib/rss-parser';

export async function fetchCPSCFeed() {
  const cpscSource = FEED_SOURCES.find(source => source.name === 'CPSC');
  if (!cpscSource) {
    throw new Error('CPSC source not found');
  }
  
  return await fetchRSSFeed(cpscSource);
} 