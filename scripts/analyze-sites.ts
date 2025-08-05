import puppeteer from 'puppeteer';

const SITES_TO_ANALYZE = [
  {
    name: 'FDA',
    url: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts'
  },
  {
    name: 'CPSC',
    url: 'https://www.cpsc.gov/Recalls'
  },
  {
    name: 'NHTSA',
    url: 'https://www.nhtsa.gov/recalls'
  },
  {
    name: 'USDA',
    url: 'https://www.fsis.usda.gov/recalls-alerts'
  }
];

async function analyzeSite(name: string, url: string) {
  try {
    console.log(`\n🔍 Analyzing ${name}: ${url}`);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Get all elements that might contain recall data
    const analysis = await page.evaluate(() => {
      const results: any = {
        headings: [],
        links: [],
        containers: [],
        classes: new Set<string>()
      };
      
      // Find all headings (h1-h6)
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el, index) => {
        if (index < 10) { // Limit to first 10
          results.headings.push({
            tag: el.tagName.toLowerCase(),
            text: el.textContent?.trim().substring(0, 100),
            className: el.className,
            id: el.id
          });
        }
      });
      
      // Find all links
      document.querySelectorAll('a').forEach((el, index) => {
        if (index < 10) { // Limit to first 10
          results.links.push({
            text: el.textContent?.trim().substring(0, 100),
            href: el.href,
            className: el.className
          });
        }
      });
      
      // Find all elements with classes
      document.querySelectorAll('[class]').forEach(el => {
        el.className.split(' ').forEach(cls => {
          if (cls.length > 0) results.classes.add(cls);
        });
      });
      
      // Look for recall-related content
      const bodyText = document.body.textContent || '';
      const recallKeywords = ['recall', 'withdrawal', 'alert', 'safety', 'warning'];
      recallKeywords.forEach(keyword => {
        if (bodyText.toLowerCase().includes(keyword)) {
          results.recallKeywords = results.recallKeywords || [];
          results.recallKeywords.push(keyword);
        }
      });
      
      return results;
    });
    
    await browser.close();
    
    console.log(`   ✅ Site loaded successfully`);
    console.log(`   📊 Found ${analysis.headings.length} headings`);
    console.log(`   🔗 Found ${analysis.links.length} links`);
    console.log(`   🏷️  Found ${analysis.classes.size} unique CSS classes`);
    
    if (analysis.recallKeywords) {
      console.log(`   🎯 Found recall keywords: ${analysis.recallKeywords.join(', ')}`);
    }
    
    // Show sample headings
    console.log(`   📋 Sample headings:`);
    analysis.headings.slice(0, 3).forEach((h: any, i: number) => {
      console.log(`      ${i + 1}. <${h.tag}> ${h.text}`);
    });
    
    // Show sample links
    console.log(`   📋 Sample links:`);
    analysis.links.slice(0, 3).forEach((link: any, i: number) => {
      console.log(`      ${i + 1}. ${link.text} -> ${link.href}`);
    });
    
    // Show some CSS classes
    const classArray = Array.from(analysis.classes);
    console.log(`   📋 Sample CSS classes:`);
    classArray.slice(0, 5).forEach((cls: string, i: number) => {
      console.log(`      ${i + 1}. .${cls}`);
    });
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🔬 Analyzing Government Recall Site HTML Structure\n');
  
  for (const site of SITES_TO_ANALYZE) {
    await analyzeSite(site.name, site.url);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Look at the sample headings and links above');
  console.log('2. Identify patterns in CSS classes');
  console.log('3. Update the selectors in web-scraper.ts');
  console.log('4. Test with the new selectors');
}

main().catch(console.error); 