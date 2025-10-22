'use client';

import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { getCategories, type Category } from '@/lib/dynamodb';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  SimpleGrid, 
  Card, 
  CardBody, 
  Flex,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

Amplify.configure(outputs);

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const allCategories = await getCategories();
        
        // Filter root-level categories that are visible and sort by order
        const rootCategories = allCategories
          .filter((cat) => cat.parentId === 'root' && cat.isVisible !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setCategories(rootCategories);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <>
      <Navbar />
      <Box px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }}>
        <Flex gap={{ base: 4, md: 8 }} maxW="1400px" mx="auto" direction={{ base: 'column', lg: 'row' }}>
          {/* Main Content Area - 70% */}
          <Box flex="3">
            <Box 
              bg="rgba(255,255,255,0.05)" 
              borderRadius="lg" 
              p={{ base: 4, md: 6 }} 
              border="1px solid" 
              borderColor="whiteAlpha.200"
            >
              {/* Loading State */}
              {loading && (
                <Flex justify="center" align="center" minH="200px">
                  <Spinner size="xl" color="#5294CF" />
                </Flex>
              )}
              
              {/* Error State */}
              {error && (
                <Alert status="error" bg="red.900" color="white" mb={4}>
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              {/* Categories Grid */}
              {!loading && !error && (
                <>
                  {categories.length === 0 ? (
                    <Alert status="info" bg="blue.900" color="white">
                      <AlertIcon />
                      No categories available yet. Please check back soon.
                    </Alert>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 4, md: 6 }} mb={8}>
                      {categories.map((category) => (
                        <Link key={category.id} href={`/${category.slug}`} style={{ textDecoration: 'none' }}>
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
                            h="140px"
                            minH="140px"
                            maxH="140px"
                            transition="all 0.2s"
                          >
                            <CardBody p={4}>
                              <HStack mb={3} align="start">
                                <Box
                                  bg={category.color || '#5294CF'}
                                  p={2}
                                  borderRadius="md"
                                  width="40px"
                                  height="40px"
                                  minW="40px"
                                  minH="40px"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  fontSize="28px"
                                  flexShrink={0}
                                >
                                  {category.icon || '📁'}
                                </Box>
                                <VStack align="start" spacing={1} flex="1" overflow="hidden">
                                  <Heading 
                                    size="sm" 
                                    color="#5294CF" 
                                    fontWeight="600" 
                                    fontSize="14px"
                                    noOfLines={1}
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                  >
                                    {category.name}
                                  </Heading>
                                </VStack>
                              </HStack>
                              <Text 
                                fontSize="12px" 
                                color="#D5DBDB" 
                                lineHeight="1.4" 
                                mt={1}
                                noOfLines={3}
                                overflow="hidden"
                                textOverflow="ellipsis"
                              >
                                {category.description || 'No description available'}
                              </Text>
                            </CardBody>
                          </Card>
                        </Link>
                      ))}
                    </SimpleGrid>
                  )}
                </>
              )}

              {/* Bottom Tutorial Cards */}
              <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} gap={{ base: 4, md: 6 }} mt={6}>
                {[
                  { title: 'Hands-on Tutorials', subtitle: 'Get started with step-by-step tutorials to launch your first security assessment', icon: '🎯', color: '#4ECDC4', href: '#' },
                  { title: 'Security Best Practices', subtitle: 'Resources to help you accelerate threat detection and incident response', icon: '✅', color: '#45B7D1', href: '#' },
                  { title: 'Compliance Center', subtitle: 'Learn how to architect more effectively for regulatory compliance', icon: '📊', color: '#96CEB4', href: '#' },
                  { title: 'Threat Intelligence', subtitle: 'Find vetted threat indicators and guidance for proactive defense', icon: '🔍', color: '#FFEAA7', href: '/threat-intelligence' }
                ].map((item, index) => (
                  <Link key={index} href={item.href} style={{ textDecoration: 'none' }}>
                    <Card 
                      bg="#37475A"
                      border="1px solid"
                      borderColor="#4A5F7A"
                      _hover={{ 
                        bg: '#3E5266',
                        borderColor: '#5A6F8A',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s'
                      }}
                      cursor="pointer"
                      h="200px"
                      minH="200px"
                      maxH="200px"
                    >
                    <CardBody p={5}>
                      <VStack align="start" spacing={4} h="full">
                        <Box
                          bg={item.color}
                          p={3}
                          borderRadius="md"
                          width="60px"
                          height="60px"
                          minW="60px"
                          minH="60px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="40px"
                          flexShrink={0}
                        >
                          {item.icon}
                        </Box>
                        <VStack align="start" spacing={2} flex="1" overflow="hidden">
                          <Heading 
                            size="md" 
                            color="white" 
                            fontWeight="600"
                            noOfLines={1}
                          >
                            {item.title} <span style={{ fontSize: '12px' }}>🔗</span>
                          </Heading>
                          <Text 
                            fontSize="sm" 
                            color="#D5DBDB" 
                            lineHeight="1.5"
                            noOfLines={3}
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            {item.subtitle}
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                    </Card>
                  </Link>
                ))}
              </SimpleGrid>
            </Box>
          </Box>

          {/* Sidebar - 30% */}
          <Box flex="1" w={{ base: 'full', lg: 'auto' }}>
            <Box 
              bg="rgba(255,255,255,0.05)" 
              borderRadius="lg" 
              p={{ base: 4, md: 6 }} 
              border="1px solid" 
              borderColor="whiteAlpha.200"
            >
              <Heading size={{ base: 'md', md: 'lg' }} color="white" mb={6}>
                Getting started with OculusCyber
              </Heading>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="#D5DBDB" mb={6} lineHeight="1.6">
                Learn the fundamentals and start building your security posture. Find best practices to help you secure your infrastructure and get familiar with the OculusCyber CyberSec Playground.
              </Text>
              
              <VStack spacing={4} align="start">
                <Box>
                  <Text 
                    color="#5294CF" 
                    fontSize="sm" 
                    fontWeight="600" 
                    textDecoration="underline"
                    cursor="pointer"
                    _hover={{ color: 'white' }}
                  >
                    Set up your Security Infrastructure
                  </Text>
                </Box>
                <Box>
                  <Text 
                    color="#5294CF" 
                    fontSize="sm" 
                    fontWeight="600"
                    textDecoration="underline"
                    cursor="pointer"
                    _hover={{ color: 'white' }}
                  >
                    Getting Started with Application Security
                  </Text>
                </Box>
                <Box>
                  <Text 
                    color="#5294CF" 
                    fontSize="sm" 
                    fontWeight="600"
                    textDecoration="underline"
                    cursor="pointer"
                    _hover={{ color: 'white' }}
                  >
                    NIST CSF 2.0 Cybersecurity Framework
                  </Text>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Box>
    </>
  );
}
