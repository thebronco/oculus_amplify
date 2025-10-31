import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { fetchAuthSession } from 'aws-amplify/auth';

// Table names for existing DynamoDB tables
export const TABLES = {
  CATEGORIES: 'oc-dynamodb-categories-amplify',
  ARTICLES: 'oc-dynamodb-articles-amplify',
  USERS: 'oc-dynamodb-users-amplify',
};

// Get DynamoDB client with current credentials
async function getDynamoDBClient() {
  try {
    const session = await fetchAuthSession();
    const credentials = session.credentials;

    if (!credentials) {
      throw new Error('No credentials available');
    }

    const client = new DynamoDBClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });

    return DynamoDBDocumentClient.from(client);
  } catch (error) {
    console.error('Error getting DynamoDB client:', error);
    throw error;
  }
}

// Category type definition
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId: string;
  order?: number;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Article type definition
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  status: string;
  author: string;
  attachments?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Fetch all categories from existing table
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

// Fetch categories by parentId
export async function getCategoriesByParentId(parentId: string): Promise<Category[]> {
  try {
    const client = await getDynamoDBClient();
    
    // If there's a GSI on parentId, use Query, otherwise use Scan with filter
    const command = new ScanCommand({
      TableName: TABLES.CATEGORIES,
      FilterExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': parentId,
      },
    });

    const response = await client.send(command);
    return (response.Items || []) as Category[];
  } catch (error) {
    console.error('Error fetching categories by parentId:', error);
    throw error;
  }
}

// Fetch all articles from existing table
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

// Fetch articles by categoryId - supports both categoryIds array and legacy categoryId
export async function getArticlesByCategoryId(categoryId: string): Promise<Article[]> {
  try {
    const client = await getDynamoDBClient();
    
    // Fetch all articles and filter client-side to support both categoryIds and categoryId
    const command = new ScanCommand({
      TableName: TABLES.ARTICLES,
    });

    const response = await client.send(command);
    const allArticles = (response.Items || []) as Article[];
    
    // Filter articles that belong to this category
    const filteredArticles = allArticles.filter((article) => {
      // Check if article has categoryIds array and it contains the categoryId
      if (article.categoryIds && Array.isArray(article.categoryIds)) {
        return article.categoryIds.includes(categoryId);
      }
      // Fallback to legacy categoryId for backward compatibility
      return article.categoryId === categoryId;
    });
    
    return filteredArticles;
  } catch (error) {
    console.error('Error fetching articles by categoryId:', error);
    throw error;
  }
}

// Fetch a single category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const client = await getDynamoDBClient();
    
    const command = new ScanCommand({
      TableName: TABLES.CATEGORIES,
      FilterExpression: 'slug = :slug',
      ExpressionAttributeValues: {
        ':slug': slug,
      },
    });

    const response = await client.send(command);
    const items = (response.Items || []) as Category[];
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    throw error;
  }
}

// Fetch subcategories (alias for better readability)
export async function getSubcategories(parentId: string): Promise<Category[]> {
  return getCategoriesByParentId(parentId);
}

// Fetch a single article by slug and categoryId - supports both categoryIds array and legacy categoryId
export async function getArticleBySlug(slug: string, categoryId: string): Promise<Article | null> {
  try {
    const client = await getDynamoDBClient();
    
    // Fetch all articles matching the slug and filter client-side to support both categoryIds and categoryId
    const command = new ScanCommand({
      TableName: TABLES.ARTICLES,
      FilterExpression: 'slug = :slug',
      ExpressionAttributeValues: {
        ':slug': slug,
      },
    });

    const response = await client.send(command);
    const items = (response.Items || []) as Article[];
    
    // Find article that belongs to this category
    const article = items.find((article) => {
      // Check if article has categoryIds array and it contains the categoryId
      if (article.categoryIds && Array.isArray(article.categoryIds)) {
        return article.categoryIds.includes(categoryId);
      }
      // Fallback to legacy categoryId for backward compatibility
      return article.categoryId === categoryId;
    });
    
    return article || null;
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    throw error;
  }
}

