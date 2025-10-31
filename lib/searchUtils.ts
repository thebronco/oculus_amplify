import type { Article } from './types';

/**
 * Extracts all searchable plain text from Lexical JSON content
 * @param content - Lexical JSON string
 * @returns Plain text extracted from the content
 */
export function extractSearchableText(content: string): string {
  try {
    const parsed = JSON.parse(content);
    
    const extractText = (node: any): string => {
      if (!node) return '';
      
      // Extract text from text nodes
      if (node.type === 'text' && node.text) {
        return node.text;
      }
      
      // Handle code blocks - extract text but preserve structure
      if (node.type === 'code') {
        if (node.children && Array.isArray(node.children)) {
          return node.children.map((child: any) => {
            if (child.type === 'text' && child.text) {
              return child.text;
            }
            if (child.type === 'linebreak') {
              return ' ';
            }
            if (child.type === 'paragraph' && child.children) {
              return child.children.map(extractText).join(' ');
            }
            return extractText(child);
          }).join(' ');
        }
        return '';
      }
      
      // Recursively extract from children
      if (node.children && Array.isArray(node.children)) {
        return node.children.map(extractText).join(' ');
      }
      
      return '';
    };
    
    const rootChildren = parsed?.root?.children || [];
    const fullText = rootChildren.map(extractText).join(' ').trim();
    
    // Normalize whitespace
    return fullText.replace(/\s+/g, ' ') || '';
  } catch (error) {
    // If parsing fails, return first 1000 chars of raw content as fallback
    return typeof content === 'string' ? content.substring(0, 1000).replace(/\s+/g, ' ') : '';
  }
}

/**
 * Searches articles by query string, matching against title and content
 * @param articles - Array of articles to search
 * @param query - Search query string
 * @returns Filtered array of articles that match the query
 */
export function searchArticles(articles: Article[], query: string): Article[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);

  if (queryWords.length === 0) {
    return [];
  }

  return articles
    .map(article => {
      // Extract searchable text from content
      const searchableContent = extractSearchableText(article.content || '');
      const normalizedContent = searchableContent.toLowerCase();
      const normalizedTitle = (article.title || '').toLowerCase();

      // Check if all query words appear in title or content
      const matches = queryWords.every(word => 
        normalizedTitle.includes(word) || normalizedContent.includes(word)
      );

      if (!matches) {
        return null;
      }

      // Calculate relevance score (simple: more title matches = higher score)
      let score = 0;
      queryWords.forEach(word => {
        if (normalizedTitle.includes(word)) {
          score += 10; // Title matches are more important
        }
        if (normalizedContent.includes(word)) {
          score += 1; // Content matches
        }
      });

      return { article, score };
    })
    .filter((item): item is { article: Article; score: number } => item !== null)
    .sort((a, b) => b.score - a.score) // Sort by relevance
    .map(item => item.article)
    .slice(0, 15); // Limit to top 15 results
}

