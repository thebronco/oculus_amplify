import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AISecurityFramework } from '../lib/types';

// Configuration
const TABLE_NAME = 'oc-dynamodb-ai-security-amplify';
const CSV_FILE_PATH = join(process.cwd(), 'ai_security_data', 'ai-security-frameworks.csv');

// AWS DynamoDB Client
const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// CSV Headers mapping
const CSV_HEADERS = {
  id: 'id',
  framework: 'framework',
  subcategory: 'subcategory',
  ai_security_control: 'ai_security_control',
  description: 'description',
  priority: 'priority',
  category: 'category',
  implementation_effort: 'implementation_effort',
  business_impact: 'business_impact',
  threat_vector: 'threat_vector',
  mitigation_strategy: 'mitigation_strategy',
  compliance_requirement: 'compliance_requirement'
};

/**
 * Parse CSV file and return array of AI security framework objects
 */
function parseCSV(filePath: string): AISecurityFramework[] {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      quote: '"',
      escape: '"',
    });

    return records.map((record: any) => {
      const aiSecurityFramework: AISecurityFramework = {
        id: record[CSV_HEADERS.id] || '',
        framework: record[CSV_HEADERS.framework] || '',
        subcategory: record[CSV_HEADERS.subcategory] || '',
        ai_security_control: record[CSV_HEADERS.ai_security_control] || '',
        description: record[CSV_HEADERS.description] || '',
        priority: record[CSV_HEADERS.priority] as 'Critical' | 'High' | 'Medium' | 'Low' || 'Medium',
        category: record[CSV_HEADERS.category] || '',
        implementation_effort: record[CSV_HEADERS.implementation_effort] as 'Low' | 'Medium' | 'High' | 'Very High' || 'Medium',
        business_impact: record[CSV_HEADERS.business_impact] as 'Low' | 'Medium' | 'High' | 'Critical' || 'Medium',
        threat_vector: record[CSV_HEADERS.threat_vector] || '',
        mitigation_strategy: record[CSV_HEADERS.mitigation_strategy] || '',
        compliance_requirement: record[CSV_HEADERS.compliance_requirement] || '',
        createdAt: record.createdAt || new Date().toISOString(),
        updatedAt: record.updatedAt || new Date().toISOString(),
      };

      return aiSecurityFramework;
    });
  } catch (error) {
    console.error('❌ Error parsing CSV file:', error);
    throw error;
  }
}

/**
 * Check if AI security framework exists in DynamoDB
 */
async function aiSecurityFrameworkExists(id: string): Promise<boolean> {
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
    console.error(`❌ Error checking if AI security framework ${id} exists:`, error);
    return false;
  }
}

/**
 * Upsert AI security framework to DynamoDB
 */
async function upsertAISecurityFramework(aiSecurityFramework: AISecurityFramework): Promise<'created' | 'updated' | 'failed'> {
  try {
    const exists = await aiSecurityFrameworkExists(aiSecurityFramework.id);
    
    if (exists) {
      // Update existing record
      aiSecurityFramework.updatedAt = new Date().toISOString();
    } else {
      aiSecurityFramework.createdAt = new Date().toISOString();
      aiSecurityFramework.updatedAt = new Date().toISOString();
    }
    
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: aiSecurityFramework
    });

    await docClient.send(command);
    return exists ? 'updated' : 'created';
  } catch (error) {
    console.error(`❌ Error upserting AI security framework ${aiSecurityFramework.id}:`, error);
    return 'failed';
  }
}

/**
 * Process AI security frameworks and import to DynamoDB
 */
async function processAISecurityFrameworks() {
  try {
    console.log('🚀 Starting AI Security Frameworks import...');
    console.log(`📁 Reading CSV file: ${CSV_FILE_PATH}`);
    
    const aiSecurityFrameworks = parseCSV(CSV_FILE_PATH);
    console.log(`📊 Found ${aiSecurityFrameworks.length} AI security frameworks to process`);

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < aiSecurityFrameworks.length; i++) {
      const aiSecurityFramework = aiSecurityFrameworks[i];
      
      try {
        const result = await upsertAISecurityFramework(aiSecurityFramework);
        
        if (result === 'created') {
          created++;
        } else if (result === 'updated') {
          updated++;
        } else {
          failed++;
        }

        // Progress indicator
        if ((i + 1) % 10 === 0 || i === aiSecurityFrameworks.length - 1) {
          console.log(`📈 Progress: ${i + 1}/${aiSecurityFrameworks.length} (${Math.round(((i + 1) / aiSecurityFrameworks.length) * 100)}%)`);
        }
      } catch (error) {
        console.error(`❌ Failed to process AI security framework ${aiSecurityFramework.id}:`, error);
        failed++;
      }
    }

    console.log('\n✅ Import completed!');
    console.log('📊 Summary:');
    console.log(`   • Total processed: ${aiSecurityFrameworks.length}`);
    console.log(`   • Created: ${created}`);
    console.log(`   • Updated: ${updated}`);
    console.log(`   • Failed: ${failed}`);
  } catch (error) {
    console.error('❌ Error processing AI security frameworks:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await processAISecurityFrameworks();
    console.log('🎉 AI Security Frameworks import completed successfully!');
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

main();
