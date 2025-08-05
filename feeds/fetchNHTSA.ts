import { fetchRSSFeed, FEED_SOURCES } from '../src/lib/rss-parser';

export async function fetchNHTSAFeed() {
  const nhtsaSource = FEED_SOURCES.find(source => source.name === 'NHTSA');
  if (!nhtsaSource) {
    throw new Error('NHTSA source not found');
  }
  
  return await fetchRSSFeed(nhtsaSource);
} 