#!/usr/bin/env tsx

import { parse } from 'csv-parse/sync';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SecurityBestPractice } from '../lib/types';

// Configuration
const TABLE_NAME = 'oc-dynamodb-best-practices-amplify';
const CSV_FILE_PATH = join(process.cwd(), 'bestpractices_data', 'security-best-practices.csv');
const AWS_REGION = 'us-east-1';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// CSV Headers mapping
const CSV_HEADERS = {
  id: 'id',
  framework: 'framework',
  subcategory: 'subcategory',
  best_practice_checklist_item: 'best_practice_checklist_item',
  description: 'description',
  priority: 'priority',
  category: 'category',
  implementation_effort: 'implementation_effort',
  business_impact: 'business_impact',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

/**
 * Parse CSV file and return array of best practice records
 */
function parseCSV(): SecurityBestPractice[] {
  try {
    console.log(`📖 Reading CSV file: ${CSV_FILE_PATH}`);
    const csvContent = readFileSync(CSV_FILE_PATH, 'utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`📊 Found ${records.length} records in CSV`);

    return records.map((record: any, index: number) => {
      const now = new Date().toISOString();
      
      return {
        id: record[CSV_HEADERS.id] || `bp-${Date.now()}-${index}`,
        framework: record[CSV_HEADERS.framework] || '',
        subcategory: record[CSV_HEADERS.subcategory] || '',
        best_practice_checklist_item: record[CSV_HEADERS.best_practice_checklist_item] || '',
        description: record[CSV_HEADERS.description] || '',
        priority: record[CSV_HEADERS.priority] || 'Medium',
        category: record[CSV_HEADERS.category] || '',
        implementation_effort: record[CSV_HEADERS.implementation_effort] || 'Medium',
        business_impact: record[CSV_HEADERS.business_impact] || 'Medium',
        createdAt: record[CSV_HEADERS.createdAt] || now,
        updatedAt: record[CSV_HEADERS.updatedAt] || now
      };
    });
  } catch (error) {
    console.error('❌ Error parsing CSV:', error);
    throw error;
  }
}

/**
 * Check if best practice exists in DynamoDB
 */
async function bestPracticeExists(id: string): Promise<boolean> {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { 
        id
      }
    });
    
    const response = await docClient.send(command);
    return !!response.Item;
  } catch (error) {
    console.error(`❌ Error checking if best practice ${id} exists:`, error);
    return false;
  }
}

/**
 * Upsert best practice to DynamoDB
 */
async function upsertBestPractice(bestPractice: SecurityBestPractice): Promise<'created' | 'updated' | 'failed'> {
  try {
    const exists = await bestPracticeExists(bestPractice.id);
    
    if (exists) {
      // Update existing record
      bestPractice.updatedAt = new Date().toISOString();
    }
    
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: bestPractice
    });
    
    await docClient.send(command);
    return exists ? 'updated' : 'created';
  } catch (error) {
    console.error(`❌ Error upserting best practice ${bestPractice.id}:`, error);
    return 'failed';
  }
}

/**
 * Process best practices in batches with progress tracking
 */
async function processBestPractices(bestPractices: SecurityBestPractice[]): Promise<void> {
  const batchSize = 25; // DynamoDB batch write limit
  let processed = 0;
  let created = 0;
  let updated = 0;
  let failed = 0;

  console.log(`🚀 Starting import of ${bestPractices.length} best practices...`);

  for (let i = 0; i < bestPractices.length; i += batchSize) {
    const batch = bestPractices.slice(i, i + batchSize);
    
    // Process batch concurrently
    const promises = batch.map(async (bestPractice) => {
      const result = await upsertBestPractice(bestPractice);
      processed++;
      
      if (result === 'created') created++;
      else if (result === 'updated') updated++;
      else if (result === 'failed') failed++;
      
      // Progress indicator
      if (processed % 10 === 0 || processed === bestPractices.length) {
        console.log(`📈 Progress: ${processed}/${bestPractices.length} (${Math.round(processed/bestPractices.length*100)}%)`);
      }
    });
    
    await Promise.all(promises);
  }

  console.log('\n✅ Import completed!');
  console.log(`📊 Summary:`);
  console.log(`   • Total processed: ${processed}`);
  console.log(`   • Created: ${created}`);
  console.log(`   • Updated: ${updated}`);
  console.log(`   • Failed: ${failed}`);
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    console.log('🔧 Security Best Practices Import Script');
    console.log('========================================');
    
    // Parse CSV
    const bestPractices = parseCSV();
    
    if (bestPractices.length === 0) {
      console.log('⚠️  No best practices found in CSV file');
      return;
    }
    
    // Process best practices
    await processBestPractices(bestPractices);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
