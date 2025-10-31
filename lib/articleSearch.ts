import { getArticles } from './dynamodb';
import type { Article } from './types';

const CACHE_KEY = 'oculus_search_cache';
const CACHE_TIMESTAMP_KEY = 'oculus_search_cache_timestamp';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

interface CachedArticles {
  articles: Article[];
  timestamp: number;
}

/**
 * Fetches all published articles from DynamoDB
 * @returns Array of published articles
 */
async function fetchPublishedArticles(): Promise<Article[]> {
  try {
    const allArticles = await getArticles();
    // Filter only published articles
    return allArticles.filter(article => article.status === 'published');
  } catch (error) {
    console.error('Error fetching published articles:', error);
    throw error;
  }
}

/**
 * Gets cached articles from localStorage
 * @returns Cached articles data or null if not found/invalid
 */
function getCachedArticles(): CachedArticles | null {
  if (typeof window === 'undefined') {
    return null; // Server-side: no localStorage
  }

  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cachedData || !cachedTimestamp) {
      return null;
    }

    const timestamp = parseInt(cachedTimestamp, 10);
    const now = Date.now();

    // Check if cache is expired (older than 1 hour)
    if (now - timestamp > CACHE_DURATION) {
      // Clear expired cache
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }

    return {
      articles: JSON.parse(cachedData),
      timestamp,
    };
  } catch (error) {
    console.error('Error reading cache:', error);
    // Clear corrupted cache
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    return null;
  }
}

/**
 * Saves articles to localStorage cache
 * @param articles - Array of articles to cache
 */
function setCachedArticles(articles: Article[]): void {
  if (typeof window === 'undefined') {
    return; // Server-side: no localStorage
  }

  try {
    const timestamp = Date.now();
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error saving cache:', error);
    // Handle quota exceeded errors gracefully
  }
}

/**
 * Fetches and caches published articles
 * Uses cache if available and not expired, otherwise fetches from DynamoDB
 * @returns Promise resolving to array of published articles
 */
export async function fetchAndCacheArticles(): Promise<Article[]> {
  // Check cache first
  const cached = getCachedArticles();
  if (cached) {
    return cached.articles;
  }

  // Cache miss or expired - fetch from DynamoDB
  const articles = await fetchPublishedArticles();
  
  // Save to cache
  setCachedArticles(articles);
  
  return articles;
}

/**
 * Gets searchable articles (cached or fresh)
 * This is the main entry point for search functionality
 * @returns Promise resolving to array of published articles
 */
export async function getSearchableArticles(): Promise<Article[]> {
  return fetchAndCacheArticles();
}

/**
 * Clears the article cache (useful for manual refresh)
 */
export function clearArticleCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  }
}

