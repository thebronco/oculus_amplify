'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
  Text,
  Flex,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';
import { getSearchableArticles } from '@/lib/articleSearch';
import { searchArticles } from '@/lib/searchUtils';
import { getCategories } from '@/lib/dynamodb';
import type { Article, Category } from '@/lib/types';
import { extractSearchableText } from '@/lib/searchUtils';

const DEBOUNCE_DELAY = 400; // 400ms debounce delay
const MAX_RESULTS = 10;

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch articles and categories on mount
  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      try {
        const [articlesData, categoriesData] = await Promise.all([
          getSearchableArticles(),
          getCategories(),
        ]);
        setArticles(articlesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error initializing search:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  // Perform search with debouncing
  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const searchResults = searchArticles(articles, searchQuery);
      setResults(searchResults.slice(0, MAX_RESULTS));
      setIsSearching(false);
    },
    [articles]
  );

  // Debounce search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query);
      }, DEBOUNCE_DELAY);
    } else {
      setResults([]);
      setIsSearching(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, performSearch]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get category slug for an article
  const getCategorySlug = (article: Article): string | null => {
    const categoryId = article.categoryIds?.[0] || article.categoryId;
    if (!categoryId) return null;

    const category = categories.find((c) => c.id === categoryId);
    return category?.slug || null;
  };

  // Navigate to article
  const handleArticleClick = (article: Article) => {
    const categorySlug = getCategorySlug(article);
    if (categorySlug) {
      router.push(`/${categorySlug}/${article.slug}`);
      setShowResults(false);
      setQuery('');
    }
  };

  // Get preview text from article content
  const getPreviewText = (article: Article): string => {
    const text = extractSearchableText(article.content || '');
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <Box ref={searchBoxRef} position="relative" width="100%">
      <InputGroup>
        <Input
          placeholder="Search articles..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => {
            if (results.length > 0 || query.trim()) {
              setShowResults(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowResults(false);
              setQuery('');
            } else if (e.key === 'Enter' && results.length > 0) {
              handleArticleClick(results[0]);
            }
          }}
          bg="rgba(255, 255, 255, 0.1)"
          borderColor="whiteAlpha.300"
          color="white"
          _placeholder={{ color: 'gray.400' }}
          _hover={{ borderColor: 'whiteAlpha.400' }}
          _focus={{
            borderColor: '#5294CF',
            boxShadow: '0 0 0 1px #5294CF',
          }}
          pr="80px"
        />
        <InputRightElement width="80px">
          <HStack spacing={1}>
            {isSearching && (
              <Spinner size="sm" color="#5294CF" speed="0.8s" />
            )}
            {query && (
              <IconButton
                aria-label="Clear search"
                icon={<CloseIcon boxSize={3} />}
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setShowResults(false);
                }}
                color="gray.400"
                _hover={{ color: 'white' }}
              />
            )}
            {!isSearching && (
              <SearchIcon color="gray.400" boxSize={4} />
            )}
          </HStack>
        </InputRightElement>
      </InputGroup>

      {/* Search Results Dropdown */}
      {showResults && (query.trim() || results.length > 0) && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={2}
          bg="#161d26"
          border="1px solid"
          borderColor="whiteAlpha.300"
          borderRadius="md"
          boxShadow="0 4px 12px rgba(0, 0, 0, 0.3)"
          zIndex={1000}
          maxH="400px"
          overflowY="auto"
        >
          {isLoading ? (
            <Flex justify="center" align="center" p={4}>
              <Spinner size="sm" color="#5294CF" />
              <Text color="gray.400" ml={2} fontSize="sm">
                Loading...
              </Text>
            </Flex>
          ) : query.trim() && isSearching ? (
            <Flex justify="center" align="center" p={4}>
              <Spinner size="sm" color="#5294CF" />
              <Text color="gray.400" ml={2} fontSize="sm">
                Searching...
              </Text>
            </Flex>
          ) : results.length === 0 && query.trim() ? (
            <Box p={4}>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                No articles found matching &quot;{query}&quot;
              </Text>
            </Box>
          ) : results.length > 0 ? (
            <VStack spacing={0} align="stretch" p={2}>
              {results.map((article, index) => {
                const categorySlug = getCategorySlug(article);
                const previewText = getPreviewText(article);

                return (
                  <Box
                    key={article.id}
                    p={3}
                    cursor="pointer"
                    borderRadius="md"
                    _hover={{
                      bg: 'rgba(82, 148, 207, 0.15)',
                    }}
                    onClick={() => handleArticleClick(article)}
                    borderBottom={
                      index < results.length - 1
                        ? '1px solid'
                        : 'none'
                    }
                    borderColor="whiteAlpha.100"
                  >
                    <Flex direction="column" gap={1}>
                      <Text
                        color="#5294CF"
                        fontSize="sm"
                        fontWeight="600"
                        noOfLines={1}
                      >
                        {article.title}
                      </Text>
                      {previewText && (
                        <Text
                          color="gray.400"
                          fontSize="xs"
                          noOfLines={2}
                          lineHeight="1.4"
                        >
                          {previewText}
                        </Text>
                      )}
                      <HStack spacing={2} mt={1}>
                        {article.author && (
                          <Text color="gray.500" fontSize="xs">
                            By {article.author}
                          </Text>
                        )}
                        {categorySlug && (
                          <>
                            {article.author && (
                              <Text color="gray.600" fontSize="xs">
                                •
                              </Text>
                            )}
                            <Text color="gray.500" fontSize="xs">
                              {categories.find((c) => c.slug === categorySlug)?.name || 'Article'}
                            </Text>
                          </>
                        )}
                      </HStack>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          ) : null}
        </Box>
      )}
    </Box>
  );
}

