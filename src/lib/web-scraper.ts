import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { RecallItem } from './rss-parser';

export interface ScrapingSource {
  name: string;
  url: string;
  category: string;
  selectors: {
    container: string;
    title: string;
    link: string;
    date?: string;
    description?: string;
  };
}

export const SCRAPING_SOURCES: ScrapingSource[] = [
  {
    name: 'FDA',
    url: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
    category: 'Food & Drugs',
    selectors: {
      container: 'article, .recall-item, .alert-item, .content-item',
      title: 'h1, h2, h3, h4, .title, .headline',
      link: 'a[href*="recall"], a[href*="alert"], a[href*="safety"]',
      date: '.date, .published-date, .timestamp',
      description: '.description, .summary, .content, p'
    }
  },
  {
    name: 'CPSC',
    url: 'https://www.cpsc.gov/Recalls',
    category: 'Consumer Products',
    selectors: {
      container: 'article, .recall-item, .alert-item, .content-item',
      title: 'h1, h2, h3, h4, .title, .headline',
      link: 'a[href*="recall"], a[href*="alert"], a[href*="safety"]',
      date: '.date, .published-date, .timestamp',
      description: '.description, .summary, .content, p'
    }
  },
  {
    name: 'NHTSA',
    url: 'https://www.nhtsa.gov/recalls',
    category: 'Vehicles',
    selectors: {
      container: 'article, .recall-item, .alert-item, .content-item',
      title: 'h1, h2, h3, h4, .title, .headline',
      link: 'a[href*="recall"], a[href*="alert"], a[href*="safety"]',
      date: '.date, .published-date, .timestamp',
      description: '.description, .summary, .content, p'
    }
  },
  {
    name: 'USDA',
    url: 'https://www.fsis.usda.gov/recalls-alerts',
    category: 'Food Safety',
    selectors: {
      container: 'article, .recall-item, .alert-item, .content-item',
      title: 'h1, h2, h3, h4, .title, .headline',
      link: 'a[href*="recall"], a[href*="alert"], a[href*="safety"]',
      date: '.date, .published-date, .timestamp',
      description: '.description, .summary, .content, p'
    }
  }
];

export async function scrapeWebsite(source: ScrapingSource): Promise<RecallItem[]> {
  try {
    console.log(`🌐 Scraping ${source.name} from ${source.url}`);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the page
    await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get the page content
    const content = await page.content();
    const $ = cheerio.load(content);
    
    const recalls: RecallItem[] = [];
    
    // Try multiple approaches to find recall content
    const selectors = [
      source.selectors.container,
      'article',
      '.content',
      '.main-content',
      '.recall',
      '.alert'
    ];
    
    for (const selector of selectors) {
      $(selector).each((index, element) => {
        const $element = $(element);
        
        // Try multiple title selectors
        const titleSelectors = source.selectors.title.split(', ');
        let title = '';
        for (const titleSelector of titleSelectors) {
          title = $element.find(titleSelector).first().text().trim();
          if (title) break;
        }
        
        // Try multiple link selectors
        const linkSelectors = source.selectors.link.split(', ');
        let link = '';
        for (const linkSelector of linkSelectors) {
          const linkElement = $element.find(linkSelector).first();
          link = linkElement.attr('href') || '';
          if (link) break;
        }
        
        // If no specific link found, look for any link in the element
        if (!link) {
          const anyLink = $element.find('a').first();
          link = anyLink.attr('href') || '';
        }
        
        const fullLink = link.startsWith('http') ? link : `${new URL(source.url).origin}${link}`;
        
        // Try to find date
        const dateSelectors = (source.selectors.date || '.date').split(', ');
        let date = '';
        for (const dateSelector of dateSelectors) {
          date = $element.find(dateSelector).first().text().trim();
          if (date) break;
        }
        if (!date) {
          date = new Date().toISOString().split('T')[0];
        }
        
        // Try to find description
        const descSelectors = (source.selectors.description || '.description').split(', ');
        let description = '';
        for (const descSelector of descSelectors) {
          description = $element.find(descSelector).first().text().trim();
          if (description) break;
        }
        
        // Only add if we have a title and it contains recall-related keywords
        if (title && (title.toLowerCase().includes('recall') || 
                     title.toLowerCase().includes('alert') || 
                     title.toLowerCase().includes('safety') ||
                     link.includes('recall') ||
                     link.includes('alert'))) {
          recalls.push({
            id: `${source.name.toLowerCase()}-scraped-${Date.now()}-${index}`,
            title,
            link: fullLink,
            date,
            source: source.name,
            description,
            category: source.category
          });
        }
      });
      
      // If we found recalls, break out of the selector loop
      if (recalls.length > 0) break;
    }
    
    await browser.close();
    
    console.log(`✅ Scraped ${recalls.length} recalls from ${source.name}`);
    return recalls;
    
  } catch (error) {
    console.error(`❌ Error scraping ${source.name}:`, error);
    return [];
  }
}

export async function scrapeAllWebsites(): Promise<RecallItem[]> {
  const allRecalls: RecallItem[] = [];
  
  for (const source of SCRAPING_SOURCES) {
    try {
      const recalls = await scrapeWebsite(source);
      allRecalls.push(...recalls);
    } catch (error) {
      console.error(`Failed to scrape ${source.name}:`, error);
    }
  }
  
  // Sort by date (newest first)
  return allRecalls.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
} 