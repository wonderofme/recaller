import Parser from 'rss-parser';
import { format, parseISO } from 'date-fns';

export interface RecallItem {
  id: string;
  title: string;
  link: string;
  date: string;
  source: string;
  description?: string;
  category?: string;
}

export interface FeedSource {
  name: string;
  url: string;
  category: string;
}

export const FEED_SOURCES: FeedSource[] = [
  {
    name: 'Test Feed 1',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    category: 'News'
  },
  {
    name: 'Test Feed 2',
    url: 'https://feeds.npr.org/1001/rss.xml',
    category: 'News'
  }
];

const parser = new Parser({
  customFields: {
    item: [
      ['category', 'category'],
      ['description', 'description']
    ]
  }
});

export async function fetchRSSFeed(source: FeedSource): Promise<RecallItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    
    return feed.items.map((item, index) => {
      let dateStr = format(new Date(), 'yyyy-MM-dd');
      
      if (item.pubDate) {
        try {
          dateStr = format(parseISO(item.pubDate), 'yyyy-MM-dd');
        } catch (error) {
          console.warn(`Invalid date format for item: ${item.title}, using current date`);
        }
      }
      
      return {
        id: `${source.name.toLowerCase()}-${Date.now()}-${index}`,
        title: item.title || 'No Title',
        link: item.link || '',
        date: dateStr,
        source: source.name,
        description: item.description || item.contentSnippet || '',
        category: source.category
      };
    });
  } catch (error) {
    console.error(`Error fetching ${source.name} feed:`, error);
    return [];
  }
}

export async function fetchAllFeeds(): Promise<RecallItem[]> {
  const allRecalls: RecallItem[] = [];
  
  for (const source of FEED_SOURCES) {
    try {
      const recalls = await fetchRSSFeed(source);
      allRecalls.push(...recalls);
    } catch (error) {
      console.error(`Failed to fetch ${source.name} feed:`, error);
    }
  }
  
  // Sort by date (newest first)
  return allRecalls.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
} 