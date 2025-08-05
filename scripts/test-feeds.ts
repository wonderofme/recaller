import fetch from 'node-fetch';

const GOVERNMENT_FEEDS = [
  {
    name: 'FDA',
    url: 'https://www.fda.gov/AboutFDA/ContactFDA/StayInformed/RSSFeeds/RSSFeedsRecalls/rss.xml',
    alternative: 'https://www.fda.gov/about-fda/contact-fda/get-email-updates-fda/rss-feeds/recalls/rss.xml'
  },
  {
    name: 'CPSC',
    url: 'https://www.cpsc.gov/Recalls/rss.xml',
    alternative: 'https://www.cpsc.gov/Newsroom/Recalls/rss.xml'
  },
  {
    name: 'NHTSA',
    url: 'https://www.nhtsa.gov/recalls/rss.xml',
    alternative: 'https://www.nhtsa.gov/feeds/vehicle-recalls.xml'
  },
  {
    name: 'USDA',
    url: 'https://www.fsis.usda.gov/recalls-alerts/rss.xml',
    alternative: 'https://www.fsis.usda.gov/recalls-alerts/feed'
  }
];

async function testFeed(name: string, url: string) {
  try {
    console.log(`\n🔍 Testing ${name}: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.ok) {
      const text = await response.text();
      console.log(`   Content Length: ${text.length} characters`);
      console.log(`   First 200 chars: ${text.substring(0, 200)}...`);
      
      // Check if it looks like RSS/XML
      if (text.includes('<rss') || text.includes('<feed') || text.includes('<?xml')) {
        console.log(`   ✅ Looks like valid RSS/XML`);
      } else {
        console.log(`   ⚠️  Doesn't look like RSS/XML`);
      }
    } else {
      console.log(`   ❌ Failed to fetch`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('🧪 Testing Government RSS Feed URLs\n');
  
  for (const feed of GOVERNMENT_FEEDS) {
    await testFeed(feed.name, feed.url);
    await testFeed(`${feed.name} (Alternative)`, feed.alternative);
  }
  
  console.log('\n📋 Summary:');
  console.log('- Check the URLs that return 200 status codes');
  console.log('- Look for content that starts with <?xml or <rss');
  console.log('- URLs with 404/403 are likely deprecated or restricted');
}

main().catch(console.error); 