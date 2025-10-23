#!/usr/bin/env tsx

import { parse } from 'csv-parse/sync';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ComplianceChecklist } from '../lib/types';

// Configuration
const TABLE_NAME = 'oc-dynamodb-compliance-amplify';
const CSV_FILE_PATH = join(process.cwd(), 'compl_data', 'compliance-seed-data.csv');
const AWS_REGION = 'us-east-1';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// CSV Headers mapping
const CSV_HEADERS = {
  id: 'id',
  control: 'control',
  description: 'description',
  category: 'category',
  compliance_standard: 'compliance_standard',
  priority: 'priority',
  status: 'status',
  control_type: 'control_type',
  implementation_effort: 'implementation_effort',
  business_impact: 'business_impact',
  evidence: 'evidence',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

/**
 * Parse CSV file and return array of compliance records
 */
function parseCSV(): ComplianceChecklist[] {
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
        id: record[CSV_HEADERS.id] || `comp-${Date.now()}-${index}`,
        control: record[CSV_HEADERS.control] || '',
        description: record[CSV_HEADERS.description] || '',
        category: record[CSV_HEADERS.category] || '',
        compliance_standard: record[CSV_HEADERS.compliance_standard] || '',
        priority: record[CSV_HEADERS.priority] || 'Medium',
        status: record[CSV_HEADERS.status] || 'General Requirement',
        control_type: record[CSV_HEADERS.control_type] || 'Technical',
        implementation_effort: record[CSV_HEADERS.implementation_effort] || 'Medium',
        business_impact: record[CSV_HEADERS.business_impact] || 'Medium',
        evidence: record[CSV_HEADERS.evidence] || '',
        notes: record[CSV_HEADERS.notes] || undefined,
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
 * Check if compliance item exists in DynamoDB
 */
async function complianceItemExists(control: string, compliance_standard: string): Promise<boolean> {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { 
        control,
        compliance_standard 
      }
    });
    
    const response = await docClient.send(command);
    return !!response.Item;
  } catch (error) {
    console.error(`❌ Error checking if compliance item ${control} exists:`, error);
    return false;
  }
}

/**
 * Upsert compliance item to DynamoDB
 */
async function upsertComplianceItem(complianceItem: ComplianceChecklist): Promise<'created' | 'updated' | 'failed'> {
  try {
    const exists = await complianceItemExists(complianceItem.control, complianceItem.compliance_standard);
    
    if (exists) {
      // Update existing record
      complianceItem.updatedAt = new Date().toISOString();
    }
    
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: complianceItem
    });
    
    await docClient.send(command);
    return exists ? 'updated' : 'created';
  } catch (error) {
    console.error(`❌ Error upserting compliance item ${complianceItem.control}:`, error);
    return 'failed';
  }
}

/**
 * Process compliance items in batches with progress tracking
 */
async function processComplianceItems(complianceItems: ComplianceChecklist[]): Promise<void> {
  const batchSize = 25; // DynamoDB batch write limit
  let processed = 0;
  let created = 0;
  let updated = 0;
  let failed = 0;

  console.log(`🚀 Starting import of ${complianceItems.length} compliance items...`);

  for (let i = 0; i < complianceItems.length; i += batchSize) {
    const batch = complianceItems.slice(i, i + batchSize);
    
    // Process batch concurrently
    const promises = batch.map(async (complianceItem) => {
      const result = await upsertComplianceItem(complianceItem);
      processed++;
      
      if (result === 'created') created++;
      else if (result === 'updated') updated++;
      else if (result === 'failed') failed++;
      
      // Progress indicator
      if (processed % 10 === 0 || processed === complianceItems.length) {
        console.log(`📈 Progress: ${processed}/${complianceItems.length} (${Math.round(processed/complianceItems.length*100)}%)`);
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
    console.log('🔧 Compliance Data Import Script');
    console.log('==================================');
    
    // Parse CSV
    const complianceItems = parseCSV();
    
    if (complianceItems.length === 0) {
      console.log('⚠️  No compliance items found in CSV file');
      return;
    }
    
    // Process compliance items
    await processComplianceItems(complianceItems);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
