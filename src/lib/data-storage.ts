import fs from 'fs';
import path from 'path';
import { RecallItem } from './rss-parser';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'recalls.json');

export async function saveRecalls(recalls: RecallItem[]): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save with timestamp
    const data = {
      lastUpdated: new Date().toISOString(),
      recalls: recalls
    };
    
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    console.log(`Saved ${recalls.length} recalls to ${DATA_FILE_PATH}`);
  } catch (error) {
    console.error('Error saving recalls:', error);
    throw error;
  }
}

export async function loadRecalls(): Promise<RecallItem[]> {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return [];
    }
    
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    return data.recalls || [];
  } catch (error) {
    console.error('Error loading recalls:', error);
    return [];
  }
}

export async function getLastUpdated(): Promise<string | null> {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, 'utf-8'));
    return data.lastUpdated || null;
  } catch (error) {
    console.error('Error getting last updated:', error);
    return null;
  }
} 