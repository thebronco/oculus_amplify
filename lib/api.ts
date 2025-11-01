// API functions for DynamoDB CRUD operations
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Category, Article, Vulnerability, ComplianceChecklist, SecurityBestPractice, AISecurityFramework } from './types';

// Re-export types for external use
export type { AISecurityFramework, ComplianceChecklist, SecurityBestPractice };

const REGION = 'us-east-1';

const TABLES = {
  CATEGORIES: 'oc-dynamodb-categories-amplify',
  ARTICLES: 'oc-dynamodb-articles-amplify',
  USERS: 'oc-dynamodb-users-amplify',
  VULNERABILITIES: 'oc-dynamodb-vulnerabilities-amplify',
  COMPLIANCE: 'oc-dynamodb-compliance-amplify',
  BEST_PRACTICES: 'oc-dynamodb-best-practices-amplify',
  AI_SECURITY: 'oc-dynamodb-ai-security-amplify',
};

// Get DynamoDB client with current auth session
async function getDynamoDBClient() {
  const session = await fetchAuthSession();
  const credentials = session.credentials;

  if (!credentials) {
    throw new Error('No credentials available');
  }

  // Dynamic imports to avoid bundling issues
  const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
  const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');

  const client = new DynamoDBClient({
    region: REGION,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  return DynamoDBDocumentClient.from(client);
}

// Helper function to get DynamoDB commands
async function getDynamoDBCommands() {
  const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = await import('@aws-sdk/lib-dynamodb');
  return { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand };
}

// ===== CATEGORIES =====

export async function getCategories(): Promise<Category[]> {
  try {
    const client = await getDynamoDBClient();
    const { ScanCommand } = await getDynamoDBCommands();
    const command = new ScanCommand({
      TableName: TABLES.CATEGORIES,
    });
    const response = await client.send(command);
    return (response.Items || []) as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const client = await getDynamoDBClient();
    const { GetCommand } = await getDynamoDBCommands();
    const command = new GetCommand({
      TableName: TABLES.CATEGORIES,
      Key: { id },
    });
    const response = await client.send(command);
    return (response.Item as Category) || null;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}

export async function createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  try {
    const client = await getDynamoDBClient();
    const now = new Date().toISOString();
    const id = `cat-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const category: Category = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const { PutCommand } = await getDynamoDBCommands();
    const command = new PutCommand({
      TableName: TABLES.CATEGORIES,
      Item: category,
    });

    await client.send(command);
    return category;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  try {
    const client = await getDynamoDBClient();
    const now = new Date().toISOString();

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    updateExpressions.push(`#updatedAt = :updatedAt`);
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    const { UpdateCommand } = await getDynamoDBCommands();
    const command = new UpdateCommand({
      TableName: TABLES.CATEGORIES,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const response = await client.send(command);
    return response.Attributes as Category;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const client = await getDynamoDBClient();
    const { DeleteCommand } = await getDynamoDBCommands();
    const command = new DeleteCommand({
      TableName: TABLES.CATEGORIES,
      Key: { id },
    });
    await client.send(command);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function toggleCategoryVisibility(id: string, isVisible: boolean): Promise<void> {
  try {
    await updateCategory(id, { isVisible });
  } catch (error) {
    console.error('Error toggling category visibility:', error);
    throw error;
  }
}

// ===== ARTICLES =====

export async function getArticles(): Promise<Article[]> {
  try {
    const client = await getDynamoDBClient();
    const { ScanCommand } = await getDynamoDBCommands();
    const command = new ScanCommand({
      TableName: TABLES.ARTICLES,
    });
    const response = await client.send(command);
    return (response.Items || []) as Article[];
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
}

export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const client = await getDynamoDBClient();
    const { GetCommand } = await getDynamoDBCommands();
    const command = new GetCommand({
      TableName: TABLES.ARTICLES,
      Key: { id },
    });
    const response = await client.send(command);
    return (response.Item as Article) || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
}

export async function createArticle(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<Article> {
  try {
    const client = await getDynamoDBClient();
    const now = new Date().toISOString();
    const id = `art-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const article: Article = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    console.log('Creating article with data:', {
      id,
      title: article.title,
      slug: article.slug,
      categoryIds: article.categoryIds,
      status: article.status,
    });

    const { PutCommand } = await getDynamoDBCommands();
    const command = new PutCommand({
      TableName: TABLES.ARTICLES,
      Item: article,
    });

    await client.send(command);
    
    console.log('Article created successfully:', id);
    return article;
  } catch (error: any) {
    console.error('Error creating article:', error);
    console.error('Article data:', data);
    
    // Provide more detailed error message
    const errorMessage = error?.message || 'Unknown error occurred while creating article';
    const errorDetails = error?.name || error?.code || 'Unknown error type';
    
    throw new Error(`${errorMessage} (${errorDetails})`);
  }
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article> {
  try {
    const client = await getDynamoDBClient();
    const now = new Date().toISOString();

    // Build update expression - only include defined values
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && value !== undefined && value !== null) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Ensure we have at least the updatedAt field
    updateExpressions.push(`#updatedAt = :updatedAt`);
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    // Validate that we have something to update
    if (updateExpressions.length === 1) {
      // Only updatedAt - this means no actual data changes
      console.warn('No data to update for article:', id);
    }

    const { UpdateCommand } = await getDynamoDBCommands();
    const command = new UpdateCommand({
      TableName: TABLES.ARTICLES,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    console.log('Updating article:', id, 'with data:', data);
    const response = await client.send(command);
    
    if (!response.Attributes) {
      throw new Error('Update succeeded but no attributes returned');
    }
    
    console.log('Article updated successfully:', response.Attributes);
    return response.Attributes as Article;
  } catch (error: any) {
    console.error('Error updating article:', error);
    console.error('Article ID:', id);
    console.error('Update data:', data);
    
    // Provide more detailed error message
    const errorMessage = error?.message || 'Unknown error occurred while updating article';
    const errorDetails = error?.name || error?.code || 'Unknown error type';
    
    throw new Error(`${errorMessage} (${errorDetails})`);
  }
}

export async function deleteArticle(id: string): Promise<void> {
  try {
    const client = await getDynamoDBClient();
    const { DeleteCommand } = await getDynamoDBCommands();
    const command = new DeleteCommand({
      TableName: TABLES.ARTICLES,
      Key: { id },
    });
    await client.send(command);
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
}

// ===== USERS =====

export async function getUsers(): Promise<any[]> {
  try {
    const client = await getDynamoDBClient();
    const { ScanCommand } = await getDynamoDBCommands();
    const command = new ScanCommand({
      TableName: TABLES.USERS,
    });
    const response = await client.send(command);
    return (response.Items || []) as any[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<any | null> {
  try {
    const client = await getDynamoDBClient();
    const { GetCommand } = await getDynamoDBCommands();
    const command = new GetCommand({
      TableName: TABLES.USERS,
      Key: { id },
    });
    const response = await client.send(command);
    return response.Item || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// ===== VULNERABILITIES =====

export interface VulnerabilityFilters {
  cveId?: string;
  vendor?: string;
  dateFrom?: string;
  dateTo?: string;
  ransomwareCampaign?: string;
  limit?: number;
  lastEvaluatedKey?: any;
}

export async function getVulnerabilities(filters: VulnerabilityFilters = {}): Promise<{
  items: Vulnerability[];
  lastEvaluatedKey?: any;
  count: number;
}> {
  try {
    const client = await getDynamoDBClient();
    
    // Build filter expression (excluding vendor for client-side filtering)
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};
    
    if (filters.cveId) {
      filterExpressions.push('contains(cveID, :cveId)');
      expressionAttributeValues[':cveId'] = filters.cveId;
    }
    
    // Note: Vendor filtering is done client-side for case-insensitive search
    // if (filters.vendor) {
    //   filterExpressions.push('contains(vendorname, :vendor)');
    //   expressionAttributeValues[':vendor'] = filters.vendor;
    // }
    
    if (filters.dateFrom) {
      filterExpressions.push('dateAdded >= :dateFrom');
      expressionAttributeValues[':dateFrom'] = filters.dateFrom;
    }
    
    if (filters.dateTo) {
      filterExpressions.push('dateAdded <= :dateTo');
      expressionAttributeValues[':dateTo'] = filters.dateTo;
    }
    
    if (filters.ransomwareCampaign) {
      filterExpressions.push('contains(knownRansomwareCampaignUse, :ransomwareCampaign)');
      expressionAttributeValues[':ransomwareCampaign'] = filters.ransomwareCampaign;
    }
    
    const { ScanCommand } = await getDynamoDBCommands();
    const command = new ScanCommand({
      TableName: TABLES.VULNERABILITIES,
      FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: filters.limit || 50,
      ExclusiveStartKey: filters.lastEvaluatedKey,
    });
    
    const response = await client.send(command);
    let items = (response.Items || []) as Vulnerability[];
    
    // Apply client-side vendor filtering for case-insensitive search
    if (filters.vendor) {
      const vendorLower = filters.vendor.toLowerCase();
      items = items.filter(item => 
        item.vendorname?.toLowerCase().includes(vendorLower) ||
        item.vendorproduct?.toLowerCase().includes(vendorLower)
      );
    }
    
    return {
      items,
      lastEvaluatedKey: response.LastEvaluatedKey,
      count: response.Count || 0,
    };
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error);
    throw error;
  }
}

export async function getVulnerabilityById(cveId: string): Promise<Vulnerability | null> {
  try {
    const client = await getDynamoDBClient();
    const { GetCommand } = await getDynamoDBCommands();
    const command = new GetCommand({
      TableName: TABLES.VULNERABILITIES,
      Key: { cveID: cveId },
    });
    const response = await client.send(command);
    return response.Item as Vulnerability || null;
  } catch (error) {
    console.error('Error fetching vulnerability:', error);
    throw error;
  }
}

export async function getVulnerabilitiesTotalCount(filters: VulnerabilityFilters = {}): Promise<number> {
  try {
    const client = await getDynamoDBClient();
    
    // Build filter expression (excluding vendor for client-side filtering)
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};
    
    if (filters.cveId) {
      filterExpressions.push('contains(cveID, :cveId)');
      expressionAttributeValues[':cveId'] = filters.cveId;
    }
    
    // Note: Vendor filtering is done client-side for case-insensitive search
    // if (filters.vendor) {
    //   filterExpressions.push('contains(vendorname, :vendor)');
    //   expressionAttributeValues[':vendor'] = filters.vendor;
    // }
    
    if (filters.dateFrom) {
      filterExpressions.push('dateAdded >= :dateFrom');
      expressionAttributeValues[':dateFrom'] = filters.dateFrom;
    }
    
    if (filters.dateTo) {
      filterExpressions.push('dateAdded <= :dateTo');
      expressionAttributeValues[':dateTo'] = filters.dateTo;
    }
    
    if (filters.ransomwareCampaign) {
      filterExpressions.push('contains(knownRansomwareCampaignUse, :ransomwareCampaign)');
      expressionAttributeValues[':ransomwareCampaign'] = filters.ransomwareCampaign;
    }
    
    // If vendor filter is applied, we need to fetch all items and filter client-side
    if (filters.vendor) {
      const { ScanCommand } = await getDynamoDBCommands();
    const command = new ScanCommand({
        TableName: TABLES.VULNERABILITIES,
        FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      });
      
      const response = await client.send(command);
      const items = (response.Items || []) as Vulnerability[];
      
      // Apply client-side vendor filtering for case-insensitive search
      const vendorLower = filters.vendor.toLowerCase();
      const filteredItems = items.filter(item => 
        item.vendorname?.toLowerCase().includes(vendorLower) ||
        item.vendorproduct?.toLowerCase().includes(vendorLower)
      );
      
      return filteredItems.length;
    } else {
      // Use ScanCommand with Select: 'COUNT' to get total count
      const { ScanCommand } = await getDynamoDBCommands();
    const command = new ScanCommand({
        TableName: TABLES.VULNERABILITIES,
        FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
        Select: 'COUNT',
      });
      
      const response = await client.send(command);
      return response.Count || 0;
    }
  } catch (error) {
    console.error('Error fetching vulnerabilities total count:', error);
    throw error;
  }
}

// ===== COMPLIANCE CHECKLIST =====

export interface ComplianceFilters {
  control?: string;
  category?: string;
  compliance_standard?: string;
  priority?: string;
  status?: string;
  control_type?: string;
  implementation_effort?: string;
  business_impact?: string;
  limit?: number;
  lastEvaluatedKey?: any;
}

export async function getComplianceChecklist(filters: ComplianceFilters = {}): Promise<{
  items: ComplianceChecklist[];
  lastEvaluatedKey?: any;
  count: number;
}> {
  try {
    const client = await getDynamoDBClient();
    
    // Build filter expression
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};
    
    if (filters.control) {
      filterExpressions.push('contains(#control, :control)');
      expressionAttributeNames['#control'] = 'control';
      expressionAttributeValues[':control'] = filters.control;
    }
    
    if (filters.category) {
      filterExpressions.push('contains(category, :category)');
      expressionAttributeValues[':category'] = filters.category;
    }
    
    if (filters.compliance_standard) {
      filterExpressions.push('contains(compliance_standard, :compliance_standard)');
      expressionAttributeValues[':compliance_standard'] = filters.compliance_standard;
    }
    
    if (filters.priority) {
      filterExpressions.push('priority = :priority');
      expressionAttributeValues[':priority'] = filters.priority;
    }
    
    if (filters.status) {
      filterExpressions.push('status = :status');
      expressionAttributeValues[':status'] = filters.status;
    }
    
    
    const { ScanCommand } = await getDynamoDBCommands();
    const command = new ScanCommand({
      TableName: TABLES.COMPLIANCE,
      FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: filters.limit || 50,
      ExclusiveStartKey: filters.lastEvaluatedKey,
    });
    
    const response = await client.send(command);
    const items = (response.Items || []) as ComplianceChecklist[];
    
    return {
      items,
      lastEvaluatedKey: response.LastEvaluatedKey,
      count: response.Count || 0,
    };
  } catch (error) {
    console.error('Error fetching compliance checklist:', error);
    throw error;
  }
}

export async function getComplianceChecklistById(id: string): Promise<ComplianceChecklist | null> {
  try {
    const client = await getDynamoDBClient();
    const { GetCommand } = await getDynamoDBCommands();
    const command = new GetCommand({
      TableName: TABLES.COMPLIANCE,
      Key: { id },
    });
    const response = await client.send(command);
    return response.Item as ComplianceChecklist || null;
  } catch (error) {
    console.error('Error fetching compliance item:', error);
    throw error;
  }
}

export async function createComplianceChecklist(data: Omit<ComplianceChecklist, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComplianceChecklist> {
  try {
    const client = await getDynamoDBClient();
    const now = new Date().toISOString();
    const id = `comp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const complianceItem: ComplianceChecklist = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const { PutCommand } = await getDynamoDBCommands();
    const command = new PutCommand({
      TableName: TABLES.COMPLIANCE,
      Item: complianceItem,
    });

    await client.send(command);
    return complianceItem;
  } catch (error) {
    console.error('Error creating compliance item:', error);
    throw error;
  }
}

export async function updateComplianceChecklist(id: string, data: Partial<ComplianceChecklist>): Promise<ComplianceChecklist> {
  try {
    const client = await getDynamoDBClient();
    const now = new Date().toISOString();

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    updateExpressions.push(`#updatedAt = :updatedAt`);
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    const { UpdateCommand } = await getDynamoDBCommands();
    const command = new UpdateCommand({
      TableName: TABLES.COMPLIANCE,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const response = await client.send(command);
    return response.Attributes as ComplianceChecklist;
  } catch (error) {
    console.error('Error updating compliance item:', error);
    throw error;
  }
}

export async function deleteComplianceChecklist(id: string): Promise<void> {
  try {
    const client = await getDynamoDBClient();
    const { DeleteCommand } = await getDynamoDBCommands();
    const command = new DeleteCommand({
      TableName: TABLES.COMPLIANCE,
      Key: { id },
    });
    await client.send(command);
  } catch (error) {
    console.error('Error deleting compliance item:', error);
    throw error;
  }
}

export async function getComplianceChecklistTotalCount(filters: ComplianceFilters = {}): Promise<number> {
  try {
    const client = await getDynamoDBClient();
    
    // Build filter expression
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};
    
    if (filters.control) {
      filterExpressions.push('contains(#control, :control)');
      expressionAttributeNames['#control'] = 'control';
      expressionAttributeValues[':control'] = filters.control;
    }
    
    if (filters.category) {
      filterExpressions.push('contains(category, :category)');
      expressionAttributeValues[':category'] = filters.category;
    }
    
    if (filters.compliance_standard) {
      filterExpressions.push('contains(compliance_standard, :compliance_standard)');
      expressionAttributeValues[':compliance_standard'] = filters.compliance_standard;
    }
    
    if (filters.priority) {
      filterExpressions.push('priority = :priority');
      expressionAttributeValues[':priority'] = filters.priority;
    }
    
    if (filters.status) {
      filterExpressions.push('status = :status');
      expressionAttributeValues[':status'] = filters.status;
    }
    
    
    const { ScanCommand } = await getDynamoDBCommands();
    const command = new ScanCommand({
      TableName: TABLES.COMPLIANCE,
      FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Select: 'COUNT',
    });
    
    const response = await client.send(command);
    return response.Count || 0;
  } catch (error) {
    console.error('Error fetching compliance checklist total count:', error);
    throw error;
  }
}

// ===== SECURITY BEST PRACTICES =====

export interface BestPracticeFilters {
  framework?: string;
  subcategory?: string;
  priority?: string;
  category?: string;
  implementation_effort?: string;
  business_impact?: string;
  limit?: number;
  lastEvaluatedKey?: any;
}

export async function getBestPractices(filters: BestPracticeFilters = {}): Promise<{
  items: SecurityBestPractice[];
  lastEvaluatedKey?: any;
  count: number;
}> {
  try {
    const client = await getDynamoDBClient();
    
    // Build filter expression
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};
    
    if (filters.framework) {
      filterExpressions.push('framework = :framework');
      expressionAttributeValues[':framework'] = filters.framework;
    }
    
    if (filters.subcategory) {
      filterExpressions.push('subcategory = :subcategory');
      expressionAttributeValues[':subcategory'] = filters.subcategory;
    }
    
    if (filters.priority) {
      filterExpressions.push('priority = :priority');
      expressionAttributeValues[':priority'] = filters.priority;
    }
    
    if (filters.category) {
      filterExpressions.push('category = :category');
      expressionAttributeValues[':category'] = filters.category;
    }
    
    if (filters.implementation_effort) {
      filterExpressions.push('implementation_effort = :implementation_effort');
      expressionAttributeValues[':implementation_effort'] = filters.implementation_effort;
    }
    
    if (filters.business_impact) {
      filterExpressions.push('business_impact = :business_impact');
      expressionAttributeValues[':business_impact'] = filters.business_impact;
    }
    
    const { ScanCommand } = await getDynamoDBCommands();
    const command = new ScanCommand({
      TableName: TABLES.BEST_PRACTICES,
      FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: filters.limit || 100,
      ExclusiveStartKey: filters.lastEvaluatedKey,
    });

    const response = await client.send(command);
    
    return {
      items: (response.Items as SecurityBestPractice[]) || [],
      lastEvaluatedKey: response.LastEvaluatedKey,
      count: response.Count || 0,
    };
  } catch (error) {
    console.error('Error fetching best practices:', error);
    throw error;
  }
}

export async function getBestPracticesByFramework(framework: string): Promise<SecurityBestPractice[]> {
  try {
    const client = await getDynamoDBClient();
    const { ScanCommand } = await getDynamoDBCommands();
    
    const command = new ScanCommand({
      TableName: TABLES.BEST_PRACTICES,
      FilterExpression: 'framework = :framework',
      ExpressionAttributeValues: {
        ':framework': framework,
      },
    });

    const response = await client.send(command);
    return (response.Items as SecurityBestPractice[]) || [];
  } catch (error) {
    console.error('Error fetching best practices by framework:', error);
    throw error;
  }
}

export async function getBestPracticesBySubcategory(framework: string, subcategory: string): Promise<SecurityBestPractice[]> {
  try {
    const client = await getDynamoDBClient();
    const { ScanCommand } = await getDynamoDBCommands();
    
    const command = new ScanCommand({
      TableName: TABLES.BEST_PRACTICES,
      FilterExpression: 'framework = :framework AND subcategory = :subcategory',
      ExpressionAttributeValues: {
        ':framework': framework,
        ':subcategory': subcategory,
      },
    });

    const response = await client.send(command);
    return (response.Items as SecurityBestPractice[]) || [];
  } catch (error) {
    console.error('Error fetching best practices by subcategory:', error);
    throw error;
  }
}

// ===== AI SECURITY FRAMEWORKS =====

export interface AISecurityFilters {
  framework?: string;
  subcategory?: string;
  priority?: string;
  category?: string;
  implementation_effort?: string;
  business_impact?: string;
  threat_vector?: string;
  limit?: number;
  lastEvaluatedKey?: any;
}

export async function getAISecurityFrameworks(filters: AISecurityFilters = {}): Promise<{
  items: AISecurityFramework[];
  lastEvaluatedKey?: any;
  count: number;
}> {
  try {
    const client = await getDynamoDBClient();
    const { ScanCommand } = await getDynamoDBCommands();

    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.framework) {
      filterExpressions.push('framework = :framework');
      expressionAttributeValues[':framework'] = filters.framework;
    }
    if (filters.subcategory) {
      filterExpressions.push('subcategory = :subcategory');
      expressionAttributeValues[':subcategory'] = filters.subcategory;
    }
    if (filters.priority) {
      filterExpressions.push('priority = :priority');
      expressionAttributeValues[':priority'] = filters.priority;
    }
    if (filters.category) {
      filterExpressions.push('category = :category');
      expressionAttributeValues[':category'] = filters.category;
    }
    if (filters.implementation_effort) {
      filterExpressions.push('implementation_effort = :implementation_effort');
      expressionAttributeValues[':implementation_effort'] = filters.implementation_effort;
    }
    if (filters.business_impact) {
      filterExpressions.push('business_impact = :business_impact');
      expressionAttributeValues[':business_impact'] = filters.business_impact;
    }
    if (filters.threat_vector) {
      filterExpressions.push('contains(threat_vector, :threat_vector)');
      expressionAttributeValues[':threat_vector'] = filters.threat_vector;
    }

    const command = new ScanCommand({
      TableName: TABLES.AI_SECURITY,
      FilterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: filters.limit || 50,
      ExclusiveStartKey: filters.lastEvaluatedKey,
    });

    const response = await client.send(command);
    return {
      items: (response.Items as AISecurityFramework[]) || [],
      lastEvaluatedKey: response.LastEvaluatedKey,
      count: response.Count || 0,
    };
  } catch (error) {
    console.error('Error fetching AI security frameworks:', error);
    throw error;
  }
}

export async function getAISecurityFrameworksByFramework(framework: string): Promise<AISecurityFramework[]> {
  try {
    const client = await getDynamoDBClient();
    const { ScanCommand } = await getDynamoDBCommands();
    
    const command = new ScanCommand({
      TableName: TABLES.AI_SECURITY,
      FilterExpression: 'framework = :framework',
      ExpressionAttributeValues: {
        ':framework': framework,
      },
    });

    const response = await client.send(command);
    return (response.Items as AISecurityFramework[]) || [];
  } catch (error) {
    console.error('Error fetching AI security frameworks by framework:', error);
    throw error;
  }
}

export async function getAISecurityFrameworksBySubcategory(framework: string, subcategory: string): Promise<AISecurityFramework[]> {
  try {
    const client = await getDynamoDBClient();
    const { ScanCommand } = await getDynamoDBCommands();
    
    const command = new ScanCommand({
      TableName: TABLES.AI_SECURITY,
      FilterExpression: 'framework = :framework AND subcategory = :subcategory',
      ExpressionAttributeValues: {
        ':framework': framework,
        ':subcategory': subcategory,
      },
    });

    const response = await client.send(command);
    return (response.Items as AISecurityFramework[]) || [];
  } catch (error) {
    console.error('Error fetching AI security frameworks by subcategory:', error);
    throw error;
  }
}

