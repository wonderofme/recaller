import fetch from 'node-fetch';

const ALTERNATIVE_SOURCES = [
  // FDA alternatives
  {
    name: 'FDA Recalls (Alternative 1)',
    url: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts',
    type: 'Web scraping needed'
  },
  {
    name: 'FDA Recalls (Alternative 2)', 
    url: 'https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/recalls',
    type: 'Web scraping needed'
  },
  
  // CPSC alternatives
  {
    name: 'CPSC Recalls (Alternative 1)',
    url: 'https://www.cpsc.gov/Recalls',
    type: 'Web scraping needed'
  },
  
  // NHTSA alternatives
  {
    name: 'NHTSA Recalls (Alternative 1)',
    url: 'https://www.nhtsa.gov/recalls',
    type: 'Web scraping needed'
  },
  
  // USDA alternatives
  {
    name: 'USDA Recalls (Alternative 1)',
    url: 'https://www.fsis.usda.gov/recalls-alerts',
    type: 'Web scraping needed'
  },
  
  // Third-party aggregators
  {
    name: 'Recalls.gov (Federal)',
    url: 'https://www.recalls.gov',
    type: 'Federal aggregator'
  },
  {
    name: 'USA.gov Recalls',
    url: 'https://www.usa.gov/recalls',
    type: 'Federal aggregator'
  }
];

async function testAlternative(name: string, url: string, type: string) {
  try {
    console.log(`\n🔍 Testing ${name}: ${url}`);
    console.log(`   Type: ${type}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.ok) {
      console.log(`   ✅ Accessible - could be scraped`);
    } else {
      console.log(`   ❌ Not accessible`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🔬 Researching Alternative Government Recall Data Sources\n');
  
  for (const source of ALTERNATIVE_SOURCES) {
    await testAlternative(source.name, source.url, source.type);
  }
  
  console.log('\n📋 Recommendations:');
  console.log('1. Web scraping: Use tools like Puppeteer to scrape recall pages');
  console.log('2. API alternatives: Some agencies provide JSON APIs instead of RSS');
  console.log('3. Third-party aggregators: Use existing services that already aggregate this data');
  console.log('4. Manual curation: For now, use working RSS feeds and add government recalls manually');
}

main().catch(console.error); 