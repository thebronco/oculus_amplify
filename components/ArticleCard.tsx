'use client';

import Link from 'next/link';
import { Card, CardBody, VStack, Heading, Text, HStack, Box } from '@chakra-ui/react';
import type { Article } from '@/lib/dynamodb';

interface ArticleCardProps {
  article: Article;
  basePath: string;
}

// Helper function to extract plain text from Lexical JSON
function extractTextPreview(content: string): string {
  try {
    const parsed = JSON.parse(content);
    const extractText = (node: any): string => {
      if (!node) return '';
      
      if (node.type === 'text' && node.text) {
        return node.text;
      }
      
      if (node.children && Array.isArray(node.children)) {
        return node.children.map(extractText).join(' ');
      }
      
      return '';
    };
    
    const rootChildren = parsed?.root?.children || [];
    const fullText = rootChildren.map(extractText).join(' ').trim();
    
    return fullText.length > 150 ? fullText.substring(0, 150) + '...' : fullText || 'Click to read more...';
  } catch (error) {
    // If parsing fails, just show first 150 chars
    return content.substring(0, 150) + '...';
  }
}

export default function ArticleCard({ article, basePath }: ArticleCardProps) {
  const href = `${basePath}/${article.slug}`;

  // Format date
  const formattedDate = article.createdAt 
    ? new Date(article.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '';

  return (
    <Link href={href} style={{ textDecoration: 'none', height: '100%' }}>
      <Card 
        bg="#161d26"
        border="1px solid"
        borderColor="#4A5F7A"
        _hover={{ 
          bg: '#1A2332',
          borderColor: '#5A6F8A',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(82, 148, 207, 0.3)'
        }}
        cursor="pointer"
        transition="all 0.2s"
        h="100%"
        minH="200px"
        maxH="200px"
      >
        <CardBody p={4} h="100%" display="flex" flexDirection="column">
          <VStack align="start" spacing={2} h="100%" justify="space-between">
            <Box w="100%">
              <Heading 
                size="md" 
                color="#5294CF" 
                fontWeight="600"
                noOfLines={2}
                mb={2}
              >
                {article.title}
              </Heading>
              
              {article.content && (
                <Text 
                  fontSize="sm" 
                  color="#D5DBDB" 
                  lineHeight="1.5"
                  noOfLines={3}
                >
                  {extractTextPreview(article.content)}
                </Text>
              )}
            </Box>

            <HStack spacing={3} fontSize="xs" color="gray.400" mt="auto">
              {article.author && (
                <>
                  <Text noOfLines={1}>By {article.author}</Text>
                  {formattedDate && <Text>•</Text>}
                </>
              )}
              {formattedDate && <Text>{formattedDate}</Text>}
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Link>
  );
}

