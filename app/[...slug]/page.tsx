'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import Navbar from '@/components/Navbar';
import Breadcrumbs from '@/components/Breadcrumbs';
import CategoryCard from '@/components/CategoryCard';
import ArticleCard from '@/components/ArticleCard';
import ArticleContent from '@/components/ArticleContent';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Container,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Divider,
} from '@chakra-ui/react';
import {
  getCategoryBySlug,
  getSubcategories,
  getArticlesByCategoryId,
  getArticleBySlug,
  type Category,
  type Article,
} from '@/lib/dynamodb';

Amplify.configure(outputs);

interface BreadcrumbSegment {
  name: string;
  href: string;
}

export default function DynamicPage() {
  const params = useParams();
  const slugArray = (params.slug as string[]) || [];
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbSegment[]>([]);
  const [isArticlePage, setIsArticlePage] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        if (!slugArray || slugArray.length === 0) {
          setError('Page not found');
          setLoading(false);
          return;
        }

        // Build the category hierarchy path
        const categoryPath: Category[] = [];
        let currentPath = '';
        
        // Walk through slugs to build category path
        for (let i = 0; i < slugArray.length; i++) {
          const slug = slugArray[i];
          const category = await getCategoryBySlug(slug);
          
          if (category) {
            categoryPath.push(category);
            currentPath += `/${slug}`;
          } else {
            // Not a category, might be an article
            break;
          }
        }

        if (categoryPath.length === 0) {
          setError('Page not found');
          setLoading(false);
          return;
        }

        const lastCategory = categoryPath[categoryPath.length - 1];
        const lastSlug = slugArray[slugArray.length - 1];
        
        // Check if the last slug is an article
        if (lastSlug !== lastCategory.slug) {
          // Try to find article
          const article = await getArticleBySlug(lastSlug, lastCategory.id);
          
          if (article && article.status === 'published') {
            // This is an article page
            setIsArticlePage(true);
            setCurrentArticle(article);
            setCurrentCategory(lastCategory);
            
            // Build breadcrumbs including the article
            const breadcrumbSegments: BreadcrumbSegment[] = [];
            let path = '';
            
            for (const cat of categoryPath) {
              path += `/${cat.slug}`;
              breadcrumbSegments.push({
                name: cat.name,
                href: path,
              });
            }
            
            breadcrumbSegments.push({
              name: article.title,
              href: `${path}/${article.slug}`,
            });
            
            setBreadcrumbs(breadcrumbSegments);
          } else {
            setError('Article not found or not published');
          }
        } else {
          // This is a category page
          setIsArticlePage(false);
          setCurrentCategory(lastCategory);
          
          // Fetch subcategories that are visible
          const subs = await getSubcategories(lastCategory.id);
          const visibleSubs = subs
            .filter(cat => cat.isVisible !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          setSubcategories(visibleSubs);
          
          // Fetch published articles in this category
          const arts = await getArticlesByCategoryId(lastCategory.id);
          const publishedArts = arts
            .filter(art => art.status === 'published')
            .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
          setArticles(publishedArts);
          
          // Build breadcrumbs
          const breadcrumbSegments: BreadcrumbSegment[] = [];
          let path = '';
          
          for (const cat of categoryPath) {
            path += `/${cat.slug}`;
            breadcrumbSegments.push({
              name: cat.name,
              href: path,
            });
          }
          
          setBreadcrumbs(breadcrumbSegments);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load page. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (slugArray && slugArray.length > 0) {
      fetchData();
    }
  }, [slugArray.join('/')]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxW="1400px" py={8}>
          <Flex justify="center" align="center" minH="400px">
            <Spinner size="xl" color="#5294CF" />
          </Flex>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container maxW="1400px" py={8}>
          <Alert status="error" bg="red.900" color="white">
            <AlertIcon />
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  // Render Article Page
  if (isArticlePage && currentArticle) {
    return (
      <>
        <Navbar />
        <Container maxW="1000px" py={8}>
          <Breadcrumbs segments={breadcrumbs} />
          
          <Box
            bg="rgba(255,255,255,0.05)"
            borderRadius="lg"
            p={8}
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <Heading as="h1" size="2xl" color="#5294CF" mb={4}>
              {currentArticle.title}
            </Heading>
            
            <Flex gap={4} fontSize="sm" color="gray.400" mb={6}>
              <Text>By {currentArticle.author}</Text>
              <Text>•</Text>
              <Text>
                {new Date(currentArticle.createdAt || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </Flex>
            
            <Divider borderColor="whiteAlpha.300" mb={6} />
            
            {/* Article Content - Rendered from Lexical JSON */}
            <ArticleContent content={currentArticle.content} />

            {/* Attachments section - if needed */}
            {currentArticle.attachments && (
              <>
                <Divider borderColor="whiteAlpha.300" my={8} />
                <Heading as="h3" size="md" color="#5294CF" mb={4}>
                  📎 Attachments
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  Attachments feature coming soon...
                </Text>
              </>
            )}
          </Box>
        </Container>
      </>
    );
  }

  // Render Category Page
  const basePath = breadcrumbs.length > 0 
    ? breadcrumbs[breadcrumbs.length - 1].href 
    : '';

  return (
    <>
      <Navbar />
      <Container maxW="1400px" py={8}>
        <Breadcrumbs segments={breadcrumbs} />
        
        <Box
          bg="rgba(255,255,255,0.05)"
          borderRadius="lg"
          p={8}
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          {/* Show subcategories */}
          {subcategories.length > 0 && (
            <Box mb={articles.length > 0 ? 8 : 0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {subcategories.map(subcat => (
                  <CategoryCard
                    key={subcat.id}
                    category={subcat}
                    basePath={basePath}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Show articles */}
          {articles.length > 0 && (
            <Box>
              <Heading size="md" color="#5294CF" mb={4}>
                Articles
              </Heading>
              <SimpleGrid 
                columns={{ base: 1, md: 2 }} 
                gap={4}
                alignItems="stretch"
              >
                {articles.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    basePath={basePath}
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Empty state */}
          {subcategories.length === 0 && articles.length === 0 && (
            <Alert status="info" bg="blue.900" color="white">
              <AlertIcon />
              No content available yet. Check back soon!
            </Alert>
          )}
        </Box>
      </Container>
    </>
  );
}

