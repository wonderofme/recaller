import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { RecallItem } from './rss-parser';

export interface SpecificRecallItem extends RecallItem {
  productName?: string;
  recallReason?: string;
  affectedModels?: string;
  recallDate?: string;
  actionRequired?: string;
  manufacturer?: string;
}

export const SPECIFIC_SCRAPING_SOURCES = [
  {
    name: 'FDA',
    baseUrl: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
    category: 'Food & Drugs',
    // FDA has specific recall pages with detailed info
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        // Look for links that contain recall details - be more specific
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          // Only include links that are likely to be actual recall announcements
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/withdrawals/') || 
               href.includes('/alerts/') ||
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('withdrawal') ||
               text.includes('alert') ||
               text.includes('safety'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 5); // Remove duplicates, limit to 5
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      // Look for actual recall content, not generic page descriptions
      const title = $('h1, h2, h3').first().text().trim();
      
      // Try to find specific recall information in the content
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      // Look for paragraphs that contain recall-specific keywords
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('withdrawal') || 
        p.toLowerCase().includes('alert') ||
        p.toLowerCase().includes('product') ||
        p.toLowerCase().includes('company')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      // Extract product name from strong/b tags or from content
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        // Look for product mentions in the text
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      // Filter out generic product names
      if (productName && (
        productName.toLowerCase().includes('safety commission') ||
        productName.toLowerCase().includes('dating') ||
        productName.toLowerCase().includes('commission') ||
        productName.toLowerCase().includes('2026 report') ||
        productName.toLowerCase().includes('1200 new jersey')
      )) {
        productName = '';
      }
      
      // Extract manufacturer/company
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      // Filter out generic manufacturer names
      if (manufacturer && (
        manufacturer.toLowerCase().includes('operating status') ||
        manufacturer.toLowerCase().includes('recalls…') ||
        manufacturer.toLowerCase().includes('company') ||
        manufacturer.toLowerCase().includes('document.getelementbyid')
      )) {
        manufacturer = '';
      }
      
      // Extract recall reason
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'FDA Recall Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'CPSC',
    baseUrl: 'https://www.cpsc.gov/Recalls',
    category: 'Consumer Products',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('product'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 5);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('product') ||
        p.toLowerCase().includes('consumer')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'CPSC Recall Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'NHTSA',
    baseUrl: 'https://www.nhtsa.gov/recalls',
    category: 'Vehicles',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/vehicle/') ||
               text.includes('recall') ||
               text.includes('vehicle') ||
               text.includes('safety'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 5);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const vehicleParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('vehicle') || 
        p.toLowerCase().includes('model') ||
        p.toLowerCase().includes('make') ||
        p.toLowerCase().includes('year') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('defect')
      );
      
      const description = vehicleParagraphs[0] || paragraphs[0] || '';
      
      let vehicleInfo = '';
      const vehicleMatch = allText.match(/(\d{4}[-\s]\w+[-\s]\w+)/i);
      if (vehicleMatch) {
        vehicleInfo = vehicleMatch[1];
      } else {
        const vehicleParagraph = paragraphs.find((p: string) => 
          p.toLowerCase().includes('vehicle') || 
          p.toLowerCase().includes('model')
        );
        vehicleInfo = vehicleParagraph || '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('defect') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'NHTSA Vehicle Recall',
        description,
        productName: vehicleInfo,
        recallReason,
        link: url
      };
    }
  },
  {
    name: 'USDA',
    baseUrl: 'https://www.fsis.usda.gov/recalls-alerts',
    category: 'Food Safety',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/alerts/') ||
               text.includes('recall') ||
               text.includes('alert') ||
               text.includes('food'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 5);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('alert') ||
        p.toLowerCase().includes('food') ||
        p.toLowerCase().includes('safety')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'USDA Food Recall Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'EPA',
    baseUrl: 'https://www.epa.gov/recalls',
    category: 'Environmental',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/alerts/') ||
               text.includes('recall') ||
               text.includes('environmental') ||
               text.includes('safety'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('environmental') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('chemical')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'EPA Environmental Recall Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'FTC',
    baseUrl: 'https://www.ftc.gov/news-events/topics/consumer-alerts',
    category: 'Consumer Protection',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/alerts/') || 
               href.includes('/recalls/') ||
               text.includes('recall') ||
               text.includes('alert') ||
               text.includes('consumer'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('alert') ||
        p.toLowerCase().includes('consumer') ||
        p.toLowerCase().includes('safety')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'FTC Consumer Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Toyota',
    baseUrl: 'https://www.toyota.com/recalls',
    category: 'Vehicles',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('vehicle'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('vehicle') ||
        p.toLowerCase().includes('toyota')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'Toyota';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Toyota Vehicle Recall',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Honda',
    baseUrl: 'https://www.honda.com/recalls',
    category: 'Vehicles',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('vehicle'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('vehicle') ||
        p.toLowerCase().includes('honda')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'Honda';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Honda Vehicle Recall',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Walmart',
    baseUrl: 'https://www.walmart.com/recalls',
    category: 'Retail',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('product'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('product') ||
        p.toLowerCase().includes('walmart')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'Walmart';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Walmart Product Recall',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Consumer Reports',
    baseUrl: 'https://www.consumerreports.org/recalls',
    category: 'Consumer News',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('product'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('product') ||
        p.toLowerCase().includes('consumer')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Consumer Reports Recall Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Ford',
    baseUrl: 'https://www.ford.com/support/recalls',
    category: 'Vehicles',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('vehicle'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('vehicle') ||
        p.toLowerCase().includes('ford')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'Ford';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Ford Vehicle Recall',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'General Motors',
    baseUrl: 'https://www.gm.com/recalls',
    category: 'Vehicles',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('vehicle'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('vehicle') ||
        p.toLowerCase().includes('gm')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'General Motors';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'GM Vehicle Recall',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Target',
    baseUrl: 'https://www.target.com/recalls',
    category: 'Retail',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('product'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('product') ||
        p.toLowerCase().includes('target')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'Target';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Target Product Recall',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Amazon',
    baseUrl: 'https://www.amazon.com/recalls',
    category: 'Retail',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('product'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('product') ||
        p.toLowerCase().includes('amazon')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'Amazon';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Amazon Product Recall',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Home Depot',
    baseUrl: 'https://www.homedepot.com/recalls',
    category: 'Retail',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('product'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('product') ||
        p.toLowerCase().includes('home depot')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'Home Depot';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Home Depot Product Recall',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Consumer Affairs',
    baseUrl: 'https://www.consumeraffairs.com/recalls',
    category: 'Consumer News',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/safety/') ||
               text.includes('recall') ||
               text.includes('safety') ||
               text.includes('product'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('product') ||
        p.toLowerCase().includes('consumer')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Consumer Affairs Recall Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Better Business Bureau',
    baseUrl: 'https://www.bbb.org/recalls',
    category: 'Consumer News',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/alerts/') ||
               text.includes('recall') ||
               text.includes('alert') ||
               text.includes('consumer'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('alert') ||
        p.toLowerCase().includes('consumer') ||
        p.toLowerCase().includes('safety')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'BBB Consumer Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Food Safety News',
    baseUrl: 'https://www.foodsafetynews.com/tag/recalls',
    category: 'Food Safety',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/recalls/') || 
               href.includes('/food/') ||
               text.includes('recall') ||
               text.includes('food') ||
               text.includes('safety'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('food') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('contamination')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Food Safety News Recall Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'DOT',
    baseUrl: 'https://www.transportation.gov/',
    category: 'Transportation',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/safety/') || 
               href.includes('/recalls/') || 
               text.includes('safety') ||
               text.includes('recall'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('transportation')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'DOT Safety Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'ATF',
    baseUrl: 'https://www.atf.gov/',
    category: 'Firearms',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/safety/') || 
               href.includes('/recalls/') || 
               text.includes('safety') ||
               text.includes('recall'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('firearm')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'ATF Safety Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'USCG',
    baseUrl: 'https://www.uscg.mil/',
    category: 'Marine Safety',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/safety/') || 
               href.includes('/recalls/') || 
               text.includes('safety') ||
               text.includes('recall'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('marine')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = $('strong:contains("Company"), b:contains("Company")').first().text().trim();
      if (!manufacturer) {
        const companyMatch = allText.match(/company[:\s]+([^.\n]+)/i);
        manufacturer = companyMatch ? companyMatch[1].trim() : '';
      }
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'USCG Safety Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Tesla',
    baseUrl: 'https://www.tesla.com/',
    category: 'Vehicles',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/support/') || 
               href.includes('/safety/') || 
               text.includes('safety') ||
               text.includes('recall'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('tesla')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'Tesla';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Tesla Safety Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'BMW',
    baseUrl: 'https://www.bmwusa.com/',
    category: 'Vehicles',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/support/') || 
               href.includes('/safety/') || 
               text.includes('safety') ||
               text.includes('recall'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('bmw')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'BMW';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'BMW Safety Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Mercedes-Benz',
    baseUrl: 'https://www.mbusa.com/',
    category: 'Vehicles',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/support/') || 
               href.includes('/safety/') || 
               text.includes('safety') ||
               text.includes('recall'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('mercedes')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'Mercedes-Benz';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Mercedes-Benz Safety Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  },
  {
    name: 'Apple',
    baseUrl: 'https://support.apple.com/',
    category: 'Electronics',
    findRecallLinks: async (page: any) => {
      return await page.evaluate(() => {
        const links: string[] = [];
        document.querySelectorAll('a').forEach(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLAnchorElement).textContent?.toLowerCase() || '';
          
          if (href && 
              (href.includes('/safety/') || 
               href.includes('/recall/') || 
               text.includes('safety') ||
               text.includes('recall'))) {
            links.push(href);
          }
        });
        return [...new Set(links)].slice(0, 3);
      });
    },
    extractRecallDetails: ($: any, url: string) => {
      const title = $('h1, h2, h3').first().text().trim();
      const allText = $('body').text();
      const paragraphs = $('p').map((i: number, el: any) => $(el).text().trim()).get();
      
      const recallParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('recall') || 
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('apple') ||
        p.toLowerCase().includes('iphone')
      );
      
      const description = recallParagraphs[0] || paragraphs[0] || '';
      
      let productName = $('strong:contains("Product"), b:contains("Product")').first().text().trim();
      if (!productName) {
        const productMatch = allText.match(/product[:\s]+([^.\n]+)/i);
        productName = productMatch ? productMatch[1].trim() : '';
      }
      
      let manufacturer = 'Apple';
      
      let recallReason = '';
      const reasonParagraphs = paragraphs.filter((p: string) => 
        p.toLowerCase().includes('because') || 
        p.toLowerCase().includes('reason') ||
        p.toLowerCase().includes('safety') ||
        p.toLowerCase().includes('risk')
      );
      recallReason = reasonParagraphs[0] || '';
      
      return {
        title: title || 'Apple Safety Alert',
        description,
        productName,
        recallReason,
        manufacturer,
        link: url
      };
    }
  }
];

export async function scrapeSpecificRecalls(): Promise<SpecificRecallItem[]> {
  const allRecalls: SpecificRecallItem[] = [];
  
  for (const source of SPECIFIC_SCRAPING_SOURCES) {
    try {
      console.log(`🔍 Finding specific recalls for ${source.name}...`);
      
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to the base page
      await page.goto(source.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Find individual recall page links
      const recallLinks = await source.findRecallLinks(page);
      console.log(`   Found ${recallLinks.length} recall links for ${source.name}`);
      
      // Scrape each individual recall page
      for (let i = 0; i < Math.min(recallLinks.length, 3); i++) {
        const recallUrl = recallLinks[i];
        try {
          console.log(`   Scraping recall ${i + 1}: ${recallUrl}`);
          
          await page.goto(recallUrl, { waitUntil: 'networkidle2', timeout: 15000 });
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const content = await page.content();
          const $ = cheerio.load(content);
          
          const details = source.extractRecallDetails($, recallUrl);
          
                     // Accept more content for SEO - focus on quantity and searchable terms
           if (details.title && 
               details.title.length > 5 && 
               !details.title.toLowerCase().includes('robot or human') &&
               !details.title.toLowerCase().includes('javascript:void') &&
               !details.title.toLowerCase().includes('page not found') &&
               details.description.length > 20) {
            allRecalls.push({
              id: `${source.name.toLowerCase()}-specific-${Date.now()}-${i}`,
              title: details.title,
              link: recallUrl,
              date: new Date().toISOString().split('T')[0],
              source: source.name,
              description: details.description,
              category: source.category,
              productName: details.productName,
              recallReason: details.recallReason,
              manufacturer: details.manufacturer
            });
          }
          
        } catch (error) {
          console.log(`     ❌ Error scraping individual recall: ${error.message}`);
        }
      }
      
      await browser.close();
      
    } catch (error) {
      console.error(`❌ Error scraping ${source.name}:`, error);
    }
  }
  
  return allRecalls.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
} 