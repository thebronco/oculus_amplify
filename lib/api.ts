// API functions for DynamoDB CRUD operations
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Category, Article, Vulnerability } from './types';

const REGION = 'us-east-1';

const TABLES = {
  CATEGORIES: 'oc-dynamodb-categories-amplify',
  ARTICLES: 'oc-dynamodb-articles-amplify',
  USERS: 'oc-dynamodb-users-amplify',
  VULNERABILITIES: 'oc-dynamodb-vulnerabilities-amplify',
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
  const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = await import('@aws-sdk/lib-dynamodb');
  return { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand };
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

    const { PutCommand } = await getDynamoDBCommands();
    const command = new PutCommand({
      TableName: TABLES.ARTICLES,
      Item: article,
    });

    await client.send(command);
    return article;
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article> {
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
      TableName: TABLES.ARTICLES,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const response = await client.send(command);
    return response.Attributes as Article;
  } catch (error) {
    console.error('Error updating article:', error);
    throw error;
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

