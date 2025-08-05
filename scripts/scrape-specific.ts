import { scrapeSpecificRecalls } from '../src/lib/specific-scraper';
import { saveRecalls } from '../src/lib/data-storage';

async function main() {
  console.log('🎯 Starting specific recall scraping...');
  
  try {
    const recalls = await scrapeSpecificRecalls();
    console.log(`✅ Scraped ${recalls.length} specific recalls with detailed information`);
    
    if (recalls.length > 0) {
      await saveRecalls(recalls);
      console.log('💾 Saved specific recalls to data/recalls.json');
      
      // Show detailed sample of scraped data
      console.log('\n📋 Sample specific recalls:');
      recalls.slice(0, 3).forEach((recall, index) => {
        console.log(`${index + 1}. ${recall.source}: ${recall.title}`);
        if (recall.productName) {
          console.log(`   Product: ${recall.productName}`);
        }
        if (recall.recallReason) {
          console.log(`   Reason: ${recall.recallReason.substring(0, 100)}...`);
        }
        if (recall.manufacturer) {
          console.log(`   Manufacturer: ${recall.manufacturer}`);
        }
        console.log(`   Link: ${recall.link}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No specific recalls were scraped. This might be due to:');
      console.log('   - Government sites using different page structures');
      console.log('   - Need to adjust link finding logic');
      console.log('   - Sites requiring authentication or special access');
    }
    
  } catch (error) {
    console.error('❌ Error during specific scraping:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
} 