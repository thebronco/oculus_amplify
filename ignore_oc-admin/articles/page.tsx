'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Badge,
  Input,
  Select,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon, ViewIcon } from '@chakra-ui/icons';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { getArticles, getCategories, deleteArticle } from '@/lib/api';
import type { Article, Category } from '@/lib/types';

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchTerm, categoryFilter, articles]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [articlesData, categoriesData] = await Promise.all([
        getArticles(),
        getCategories(),
      ]);
      setArticles(articlesData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(term) ||
          article.slug.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((article) => article.categoryId === categoryFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredArticles(filtered);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteArticle(deleteId);
      setArticles(articles.filter((a) => a.id !== deleteId));
      onClose();
      setDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete article');
      onClose();
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    onOpen();
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
            <Box>
              <Heading size="xl" color="white" mb={2}>
                Articles
              </Heading>
              <Text color="gray.400">
                Manage your content articles
              </Text>
            </Box>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              bg="#5294CF"
              _hover={{ bg: '#74B9FF' }}
              onClick={() => router.push('/oc-admin/articles/new')}
            >
              New Article
            </Button>
          </HStack>

          {/* Filters */}
          <HStack spacing={4}>
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.300"
              color="white"
              _placeholder={{ color: 'gray.500' }}
              maxW="300px"
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.300"
              color="white"
              maxW="200px"
            >
              <option value="all" style={{ background: '#161d26' }}>
                All Categories
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} style={{ background: '#161d26' }}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </HStack>

          {error && (
            <Alert status="error" bg="red.900" color="white">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {loading ? (
            <Box textAlign="center" py={12}>
              <Spinner size="xl" color="#5294CF" />
            </Box>
          ) : (
            <Box
              bg="#161d26"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderRadius="lg"
              overflow="hidden"
            >
              <Table variant="simple">
                <Thead bg="whiteAlpha.100">
                  <Tr>
                    <Th color="gray.400">Title</Th>
                    <Th color="gray.400">Category</Th>
                    <Th color="gray.400">Author</Th>
                    <Th color="gray.400">Status</Th>
                    <Th color="gray.400">Date</Th>
                    <Th color="gray.400">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredArticles.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={8} color="gray.500">
                        No articles found
                      </Td>
                    </Tr>
                  ) : (
                    filteredArticles.map((article) => (
                      <Tr key={article.id} _hover={{ bg: 'whiteAlpha.50' }}>
                        <Td color="white" fontWeight="medium">
                          {article.title}
                        </Td>
                        <Td>
                          <Badge colorScheme="purple">
                            {getCategoryName(article.categoryId)}
                          </Badge>
                        </Td>
                        <Td color="gray.400" fontSize="sm">
                          {article.author}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              article.status === 'published' ? 'green' : 'yellow'
                            }
                          >
                            {article.status}
                          </Badge>
                        </Td>
                        <Td color="gray.400" fontSize="sm">
                          {formatDate(article.createdAt)}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="View article"
                              icon={<ViewIcon />}
                              size="sm"
                              colorScheme="green"
                              variant="ghost"
                              onClick={() => router.push(`/${article.slug}`)}
                            />
                            <IconButton
                              aria-label="Edit article"
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() =>
                                router.push(`/oc-admin/articles/${article.id}`)
                              }
                            />
                            <IconButton
                              aria-label="Delete article"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => openDeleteModal(article.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          )}

          <Text color="gray.500" fontSize="sm">
            Showing {filteredArticles.length} of {articles.length} articles
          </Text>
        </VStack>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <ModalHeader color="white">Delete Article</ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody>
              <Text color="gray.300">
                Are you sure you want to delete this article? This action cannot be
                undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AdminLayout>
    </AuthGuard>
  );
}

