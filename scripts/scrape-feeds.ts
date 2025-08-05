import { scrapeAllWebsites } from '../src/lib/web-scraper';
import { saveRecalls } from '../src/lib/data-storage';

async function main() {
  console.log('🌐 Starting web scraping of government recall sites...');
  
  try {
    const recalls = await scrapeAllWebsites();
    console.log(`✅ Scraped ${recalls.length} total recalls from government sites`);
    
    if (recalls.length > 0) {
      await saveRecalls(recalls);
      console.log('💾 Saved scraped recalls to data/recalls.json');
      
      // Show sample of scraped data
      console.log('\n📋 Sample scraped recalls:');
      recalls.slice(0, 3).forEach((recall, index) => {
        console.log(`${index + 1}. ${recall.source}: ${recall.title}`);
        console.log(`   Date: ${recall.date}`);
        console.log(`   Link: ${recall.link}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No recalls were scraped. This might be due to:');
      console.log('   - Different HTML structure on the sites');
      console.log('   - Sites using JavaScript to load content');
      console.log('   - Anti-bot protection');
      console.log('   - Need to adjust CSS selectors');
    }
    
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
} 