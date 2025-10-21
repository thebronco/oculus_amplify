'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  VStack,
  Text,
  Spinner,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { FiFolder, FiFileText, FiUsers, FiActivity } from 'react-icons/fi';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { getCategories, getArticles } from '@/lib/dynamodb';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    categories: 0,
    articles: 0,
    published: 0,
    drafts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [categories, articles] = await Promise.all([
        getCategories(),
        getArticles(),
      ]);

      const published = articles.filter(a => a.status === 'published').length;
      const drafts = articles.filter(a => a.status === 'draft').length;

      setStats({
        categories: categories.length,
        articles: articles.length,
        published,
        drafts,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      label: 'Total Categories',
      value: stats.categories,
      icon: FiFolder,
      color: '#5294CF',
      helpText: 'All category levels',
    },
    {
      label: 'Total Articles',
      value: stats.articles,
      icon: FiFileText,
      color: '#00B894',
      helpText: 'Published and drafts',
    },
    {
      label: 'Published Articles',
      value: stats.published,
      icon: FiActivity,
      color: '#00CEC9',
      helpText: 'Live on website',
    },
    {
      label: 'Draft Articles',
      value: stats.drafts,
      icon: FiUsers,
      color: '#FDCB6E',
      helpText: 'Not yet published',
    },
  ];

  return (
    <AuthGuard>
      <AdminLayout>
        <VStack align="stretch" spacing={6}>
          <Box>
            <Heading size="xl" color="white" mb={2}>
              Dashboard
            </Heading>
            <Text color="gray.400">
              Welcome back, Admin!
            </Text>
          </Box>

          {loading ? (
            <Flex justify="center" py={12}>
              <Spinner size="xl" color="#5294CF" />
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {statCards.map((stat) => (
                <Card
                  key={stat.label}
                  bg="#161d26"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{
                    borderColor: stat.color,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s',
                  }}
                >
                  <CardBody>
                    <Stat>
                      <Flex justify="space-between" align="start" mb={2}>
                        <StatLabel color="gray.400" fontSize="sm">
                          {stat.label}
                        </StatLabel>
                        <Icon as={stat.icon} color={stat.color} boxSize={6} />
                      </Flex>
                      <StatNumber color="white" fontSize="3xl">
                        {stat.value}
                      </StatNumber>
                      <StatHelpText color="gray.500" fontSize="xs">
                        {stat.helpText}
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card
              bg="#161d26"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <CardBody>
                <Heading size="md" color="white" mb={4}>
                  Quick Actions
                </Heading>
                <VStack align="stretch" spacing={2}>
                  <Box
                    as="a"
                    href="/oc-admin/articles"
                    p={3}
                    bg="whiteAlpha.100"
                    borderRadius="md"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    color="white"
                  >
                    ✏️ Manage Articles
                  </Box>
                  <Box
                    as="a"
                    href="/oc-admin/categories"
                    p={3}
                    bg="whiteAlpha.100"
                    borderRadius="md"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    color="white"
                  >
                    📁 Manage Categories
                  </Box>
                  <Box
                    as="a"
                    href="/"
                    target="_blank"
                    p={3}
                    bg="whiteAlpha.100"
                    borderRadius="md"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    color="white"
                  >
                    🌐 View Public Site
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            <Card
              bg="#161d26"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <CardBody>
                <Heading size="md" color="white" mb={4}>
                  System Info
                </Heading>
                <VStack align="stretch" spacing={3} color="gray.400" fontSize="sm">
                  <Flex justify="space-between">
                    <Text>Your Role:</Text>
                    <Text color="white" fontWeight="bold">
                      Administrator
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Account:</Text>
                    <Text color="white">capitalcookdc@gmail.com</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Status:</Text>
                    <Text color="green.400">● Active</Text>
                  </Flex>
                  <Box pt={3} borderTop="1px solid" borderColor="whiteAlpha.200">
                    <Text fontSize="xs" color="gray.500">
                      Last login: {new Date().toLocaleString()}
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
      </AdminLayout>
    </AuthGuard>
  );
}

