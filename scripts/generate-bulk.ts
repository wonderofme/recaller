import { generateBulkRecalls } from '../src/lib/bulk-scraper';
import { saveRecalls } from '../src/lib/data-storage';

async function main() {
  try {
    console.log('🎯 Starting bulk recall generation...');
    
    const recalls = await generateBulkRecalls();
    
    console.log(`✅ Generated ${recalls.length} specific recalls`);
    console.log('📊 Sample recalls:');
    
    // Show first 5 recalls as examples
    recalls.slice(0, 5).forEach((recall, index) => {
      console.log(`\n${index + 1}. ${recall.title}`);
      console.log(`   Product: ${recall.productName}`);
      console.log(`   Manufacturer: ${recall.manufacturer}`);
      console.log(`   Reason: ${recall.recallReason}`);
      console.log(`   Source: ${recall.source}`);
    });
    
    await saveRecalls(recalls);
    console.log('\n💾 Saved all recalls to data file');
    
  } catch (error) {
    console.error('❌ Error generating bulk recalls:', error);
  }
}

main(); 