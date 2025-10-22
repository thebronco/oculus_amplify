// API functions for DynamoDB CRUD operations
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  ScanCommand, 
  GetCommand, 
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Category, Article } from './types';

const TABLES = {
  CATEGORIES: 'oc-dynamodb-categories-amplify',
  ARTICLES: 'oc-dynamodb-articles-amplify',
  USERS: 'oc-dynamodb-users-amplify',
};

const REGION = 'us-east-1';

// Get DynamoDB client with current auth session
async function getDynamoDBClient(): Promise<DynamoDBDocumentClient> {
  const session = await fetchAuthSession();
  const credentials = session.credentials;

  if (!credentials) {
    throw new Error('No credentials available');
  }

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

// ===== CATEGORIES =====

export async function getCategories(): Promise<Category[]> {
  try {
    const client = await getDynamoDBClient();
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

