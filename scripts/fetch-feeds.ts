import { fetchAllFeeds } from '../src/lib/rss-parser';
import { saveRecalls } from '../src/lib/data-storage';

async function main() {
  console.log('Starting feed fetch...');
  
  try {
    const recalls = await fetchAllFeeds();
    console.log(`Fetched ${recalls.length} recalls from all sources`);
    
    await saveRecalls(recalls);
    console.log('Feed fetch completed successfully');
  } catch (error) {
    console.error('Error during feed fetch:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
} 