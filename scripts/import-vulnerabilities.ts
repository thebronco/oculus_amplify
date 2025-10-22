#!/usr/bin/env tsx

import { parse } from 'csv-parse/sync';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Vulnerability } from '../lib/types';

// Configuration
const TABLE_NAME = 'oc-dynamodb-vulnerabilities-amplify'; // Following existing naming pattern
const CSV_FILE_PATH = join(process.cwd(), 'vuln_data', 'known_exploited_vulnerabilities.csv');
const AWS_REGION = 'us-east-1';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// CSV Headers mapping
const CSV_HEADERS = {
  cveID: 'cveID',
  vendorname: 'vendorname', 
  vendorproduct: 'vendorproduct',
  vulnerabilityName: 'vulnerabilityName',
  dateAdded: 'dateAdded',
  shortDescription: 'shortDescription',
  requiredAction: 'requiredAction',
  dueDate: 'dueDate',
  knownRansomwareCampaignUse: 'knownRansomwareCampaignUse',
  notes: 'notes',
  cwes: 'cwes'
};

/**
 * Parse CSV file and return array of vulnerability records
 */
function parseCSV(): Vulnerability[] {
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
        cveID: record[CSV_HEADERS.cveID] || `unknown-${index}`,
        vendorname: record[CSV_HEADERS.vendorname] || '',
        vendorproduct: record[CSV_HEADERS.vendorproduct] || '',
        vulnerabilityName: record[CSV_HEADERS.vulnerabilityName] || '',
        dateAdded: record[CSV_HEADERS.dateAdded] || '',
        shortDescription: record[CSV_HEADERS.shortDescription] || '',
        requiredAction: record[CSV_HEADERS.requiredAction] || '',
        dueDate: record[CSV_HEADERS.dueDate] || '',
        knownRansomwareCampaignUse: record[CSV_HEADERS.knownRansomwareCampaignUse] || '',
        notes: record[CSV_HEADERS.notes] || undefined,
        cwes: record[CSV_HEADERS.cwes] || undefined,
        createdAt: now,
        updatedAt: now
      };
    });
  } catch (error) {
    console.error('❌ Error parsing CSV:', error);
    throw error;
  }
}

/**
 * Check if vulnerability exists in DynamoDB
 */
async function vulnerabilityExists(cveID: string): Promise<boolean> {
  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { cveID }
    });
    
    const response = await docClient.send(command);
    return !!response.Item;
  } catch (error) {
    console.error(`❌ Error checking if vulnerability ${cveID} exists:`, error);
    return false;
  }
}

/**
 * Upsert vulnerability to DynamoDB
 */
async function upsertVulnerability(vulnerability: Vulnerability): Promise<'created' | 'updated' | 'failed'> {
  try {
    const exists = await vulnerabilityExists(vulnerability.cveID);
    
    if (exists) {
      // Update existing record
      vulnerability.updatedAt = new Date().toISOString();
    }
    
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: vulnerability
    });
    
    await docClient.send(command);
    return exists ? 'updated' : 'created';
  } catch (error) {
    console.error(`❌ Error upserting vulnerability ${vulnerability.cveID}:`, error);
    return 'failed';
  }
}

/**
 * Process vulnerabilities in batches with progress tracking
 */
async function processVulnerabilities(vulnerabilities: Vulnerability[]): Promise<void> {
  const batchSize = 25; // DynamoDB batch write limit
  let processed = 0;
  let created = 0;
  let updated = 0;
  let failed = 0;

  console.log(`🚀 Starting import of ${vulnerabilities.length} vulnerabilities...`);

  for (let i = 0; i < vulnerabilities.length; i += batchSize) {
    const batch = vulnerabilities.slice(i, i + batchSize);
    
    // Process batch concurrently
    const promises = batch.map(async (vulnerability) => {
      const result = await upsertVulnerability(vulnerability);
      processed++;
      
      if (result === 'created') created++;
      else if (result === 'updated') updated++;
      else if (result === 'failed') failed++;
      
      // Progress indicator
      if (processed % 100 === 0 || processed === vulnerabilities.length) {
        console.log(`📈 Progress: ${processed}/${vulnerabilities.length} (${Math.round(processed/vulnerabilities.length*100)}%)`);
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
    console.log('🔧 Vulnerability Data Import Script');
    console.log('=====================================');
    
    // Parse CSV
    const vulnerabilities = parseCSV();
    
    if (vulnerabilities.length === 0) {
      console.log('⚠️  No vulnerabilities found in CSV file');
      return;
    }
    
    // Process vulnerabilities
    await processVulnerabilities(vulnerabilities);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
