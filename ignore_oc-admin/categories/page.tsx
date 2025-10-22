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
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiFileText, FiList, FiFolderPlus } from 'react-icons/fi';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import CategoryForm from '@/components/admin/CategoryForm';
import { getCategories, deleteCategory, getArticles, deleteArticle, createCategory } from '@/lib/api';
import type { Category, Article } from '@/lib/types';
import { useToast } from '@chakra-ui/react';

export default function CategoriesPage() {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newCategoryParentId, setNewCategoryParentId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isArticlesOpen, onOpen: onArticlesOpen, onClose: onArticlesClose } = useDisclosure();
  const { isOpen: isDeleteArticleOpen, onOpen: onDeleteArticleOpen, onClose: onDeleteArticleClose } = useDisclosure();
  const { isOpen: isNewCategoryOpen, onOpen: onNewCategoryOpen, onClose: onNewCategoryClose } = useDisclosure();

  useEffect(() => {
    fetchData();
  }, []);

  // Collapse all root categories by default when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      const rootCategories = categories.filter(cat => cat.parentId === 'root' || !cat.parentId);
      const rootIds = rootCategories.map(cat => cat.id);
      setCollapsedCategories(new Set(rootIds));
    }
  }, [categories.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, articlesData] = await Promise.all([
        getCategories(),
        getArticles(),
      ]);
      setCategories(categoriesData);
      setArticles(articlesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Count articles for a category
  const getArticleCount = (categoryId: string): number => {
    return articles.filter(article => article.categoryId === categoryId).length;
  };

  // Count published articles for a category
  const getPublishedArticleCount = (categoryId: string): number => {
    return articles.filter(article => {
      if (article.categoryId !== categoryId) return false;
      
      // Prioritize 'status' field over legacy 'published' field
      if (article.status !== undefined && article.status !== null) {
        return article.status === 'published';
      }
      // Fall back to legacy published field only if status doesn't exist
      return article.published === true;
    }).length;
  };

  // Build tree structure
  const buildCategoryTree = (): Category[] => {
    const categoryMap = new Map<string, Category & { children: Category[] }>();
    const rootCategories: Category[] = [];
    
    // Create a map of all categories with children array
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] as Category[] });
    });
    
    // Build the tree
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      
      if (cat.parentId === 'root' || !cat.parentId) {
        rootCategories.push(category);
      } else {
        const parent = categoryMap.get(cat.parentId);
        if (parent && parent.children) {
          parent.children.push(category);
        }
      }
    });
    
    // Sort root categories and their children
    const sortCategories = (cats: Category[]) => {
      cats.sort((a, b) => (a.order || 0) - (b.order || 0));
      cats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          sortCategories(cat.children);
        }
      });
    };
    
    sortCategories(rootCategories);
    return rootCategories;
  };

  // Flatten tree for rendering (respecting collapsed state)
  const flattenTree = (tree: Category[], level = 0): (Category & { displayLevel: number })[] => {
    let result: (Category & { displayLevel: number })[] = [];
    
    tree.forEach(category => {
      result.push({ ...category, displayLevel: level });
      
      // Only show children if the parent is not collapsed
      const isCollapsed = collapsedCategories.has(category.id);
      if (category.children && category.children.length > 0 && !isCollapsed) {
        result = result.concat(flattenTree(category.children, level + 1));
      }
    });
    
    return result;
  };

  const categoryTree = buildCategoryTree();
  const flatCategories = flattenTree(categoryTree);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteCategory(deleteId);
      setCategories(categories.filter(c => c.id !== deleteId));
      onClose();
      setDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
      onClose();
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    onOpen();
  };

  const openArticlesModal = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    onArticlesOpen();
  };

  const openNewCategoryModal = (parentId: string | null = null) => {
    setNewCategoryParentId(parentId);
    onNewCategoryOpen();
  };

  const handleCreateCategory = async (data: Partial<Category>) => {
    try {
      await createCategory(data);
      
      // Refresh the list
      await fetchData();
      
      // If it's a subcategory, expand the parent to show it
      if (newCategoryParentId) {
        const newCollapsed = new Set(collapsedCategories);
        newCollapsed.delete(newCategoryParentId);
        setCollapsedCategories(newCollapsed);
      }
      
      // Show success toast
      const parentCategory = newCategoryParentId 
        ? categories.find(c => c.id === newCategoryParentId)
        : null;
      
      toast({
        title: parentCategory ? 'Subcategory Created!' : 'Category Created!',
        description: parentCategory 
          ? `Successfully created "${data.name}" under "${parentCategory.name}"`
          : `Successfully created "${data.name}"`,
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
      
      // Close modal and clear state
      onNewCategoryClose();
      setNewCategoryParentId(null);
    } catch (error: any) {
      // Show error toast
      toast({
        title: 'Failed to Create Category',
        description: error.message || 'An error occurred while creating the category',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleCancelCreateCategory = () => {
    onNewCategoryClose();
    setNewCategoryParentId(null);
  };

  const openDeleteArticleModal = (articleId: string) => {
    setDeleteArticleId(articleId);
    onDeleteArticleOpen();
  };

  const toggleCategory = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  const handleDeleteArticle = async () => {
    if (!deleteArticleId) return;

    try {
      await deleteArticle(deleteArticleId);
      setArticles(articles.filter(a => a.id !== deleteArticleId));
      onDeleteArticleClose();
      setDeleteArticleId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete article');
      onDeleteArticleClose();
    }
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Root';
  };

  const getCategoryArticles = (categoryId: string): Article[] => {
    return articles
      .filter(article => article.categoryId === categoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
            <Box>
              <Heading size="xl" color="white" mb={2}>
                Categories
              </Heading>
              <Text color="gray.400">
                Manage your content categories and hierarchy
              </Text>
            </Box>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              bg="#5294CF"
              _hover={{ bg: '#74B9FF' }}
              onClick={() => router.push('/oc-admin/categories/new')}
            >
              New Category
            </Button>
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
                    <Th color="gray.400">Category Hierarchy</Th>
                    <Th color="gray.400">Slug</Th>
                    <Th color="gray.400">Level</Th>
                    <Th color="gray.400">Order</Th>
                    <Th color="gray.400">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {flatCategories.map((category) => (
                    <Tr 
                      key={category.id} 
                      _hover={{ bg: 'whiteAlpha.50' }}
                      bg={category.displayLevel === 0 ? 'whiteAlpha.50' : 'transparent'}
                    >
                      <Td>
                        <HStack spacing={2} pl={category.displayLevel * 6}>
                          {/* Tree connector lines */}
                          {category.displayLevel > 0 && (
                            <Box
                              w="2px"
                              h="full"
                              bg="whiteAlpha.300"
                              position="absolute"
                              left={`${category.displayLevel * 24 - 8}px`}
                            />
                          )}
                          
                          {/* Collapse/Expand button for level 0 categories */}
                          {category.displayLevel === 0 && (
                            <>
                              {category.children && category.children.length > 0 ? (
                                <IconButton
                                  aria-label={collapsedCategories.has(category.id) ? "Expand" : "Collapse"}
                                  icon={collapsedCategories.has(category.id) ? <ChevronRightIcon /> : <ChevronDownIcon />}
                                  size="xs"
                                  variant="ghost"
                                  color="gray.400"
                                  onClick={() => toggleCategory(category.id)}
                                  _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                                />
                              ) : (
                                <Box w="24px" h="24px" />
                              )}
                            </>
                          )}
                          
                          {/* Icon */}
                          <Box
                            bg={category.color}
                            p={2}
                            borderRadius="md"
                            minW="36px"
                            minH="36px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize={category.displayLevel === 0 ? "20px" : "16px"}
                            flexShrink={0}
                          >
                            {category.icon}
                          </Box>
                          
                          {/* Name with hierarchy indicator */}
                          <VStack align="start" spacing={0}>
                            <HStack spacing={2}>
                              {category.displayLevel > 0 && (
                                <Text color="gray.500" fontSize="xs">
                                  {'└─'}
                                </Text>
                              )}
                              <Text 
                                color="white" 
                                fontWeight={category.displayLevel === 0 ? "bold" : "medium"}
                                fontSize={category.displayLevel === 0 ? "md" : "sm"}
                              >
                                {category.name}
                              </Text>
                              {category.children && category.children.length > 0 && (
                                <Badge colorScheme="purple" fontSize="xs">
                                  {category.children.length} SUB
                                </Badge>
                              )}
                              {(() => {
                                const totalCount = getArticleCount(category.id);
                                const publishedCount = getPublishedArticleCount(category.id);
                                const draftCount = totalCount - publishedCount;

                                if (totalCount === 0) {
                                  return (
                                    <Badge colorScheme="gray" fontSize="xs" variant="outline">
                                      0 articles
                                    </Badge>
                                  );
                                }

                                return (
                                  <>
                                    <Badge colorScheme="green" fontSize="xs">
                                      {publishedCount} published
                                    </Badge>
                                    {draftCount > 0 && (
                                      <Badge colorScheme="orange" fontSize="xs" variant="outline">
                                        {draftCount} draft{draftCount > 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </>
                                );
                              })()}
                            </HStack>
                            {category.description && category.displayLevel === 0 && (
                              <Text color="gray.500" fontSize="xs" noOfLines={1}>
                                {category.description}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Td>
                      <Td color="gray.400" fontFamily="mono" fontSize="sm">
                        {category.slug}
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={category.displayLevel === 0 ? "purple" : "blue"}
                          variant={category.displayLevel === 0 ? "solid" : "subtle"}
                        >
                          {category.level}
                        </Badge>
                      </Td>
                      <Td color="gray.400">{category.order}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Create subcategory under this category"
                            icon={<FiFolderPlus />}
                            size="sm"
                            colorScheme="purple"
                            variant="ghost"
                            onClick={() => openNewCategoryModal(category.id)}
                            title="Create subcategory under this category"
                          />
                          <IconButton
                            aria-label="Create article in this category"
                            icon={<FiFileText />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => router.push(`/oc-admin/articles/new?category=${category.id}`)}
                            title="Create article in this category"
                          />
                          <IconButton
                            aria-label="View articles in this category"
                            icon={<FiList />}
                            size="sm"
                            colorScheme="cyan"
                            variant="ghost"
                            onClick={() => openArticlesModal(category.id)}
                            title="View all articles in this category"
                          />
                          <IconButton
                            aria-label="Edit category"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => router.push(`/oc-admin/categories/${category.id}`)}
                          />
                          <IconButton
                            aria-label="Delete category"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => openDeleteModal(category.id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          <HStack color="gray.500" fontSize="sm" spacing={4}>
            <Text>
              Total: {categories.length} categories
            </Text>
            <Text>•</Text>
            <Text>
              Root: {categoryTree.length} categories
            </Text>
            <Text>•</Text>
            <Text>
              Subcategories: {categories.length - categoryTree.length}
            </Text>
          </HStack>
        </VStack>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent bg="#161d26" border="1px solid" borderColor="whiteAlpha.200">
            <ModalHeader color="white">Delete Category</ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody>
              <Text color="gray.300">
                Are you sure you want to delete this category? This action cannot be undone.
              </Text>
              <Alert status="warning" mt={4} bg="orange.900" color="white">
                <AlertIcon />
                All subcategories and articles will also be affected!
              </Alert>
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

        {/* Articles List Modal */}
        <Modal isOpen={isArticlesOpen} onClose={onArticlesClose} size="xl">
          <ModalOverlay />
          <ModalContent bg="#161d26" border="1px solid" borderColor="whiteAlpha.200">
            <ModalHeader color="white">
              Articles in &quot;{selectedCategoryId && getCategoryName(selectedCategoryId)}&quot;
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody pb={6}>
              {selectedCategoryId && getCategoryArticles(selectedCategoryId).length === 0 ? (
                <Text color="gray.400" textAlign="center" py={8}>
                  No articles in this category yet.
                </Text>
              ) : (
                <VStack spacing={3} align="stretch">
                  {selectedCategoryId && getCategoryArticles(selectedCategoryId).map((article) => (
                    <Box
                      key={article.id}
                      p={4}
                      bg="whiteAlpha.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      _hover={{ bg: 'whiteAlpha.100' }}
                      transition="all 0.2s"
                    >
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex={1}>
                          <Text color="white" fontWeight="medium">
                            {article.title}
                          </Text>
                          <HStack spacing={2}>
                            {(() => {
                              // Prioritize 'status' field over legacy 'published' field
                              let isPublished = false;
                              
                              if (article.status !== undefined && article.status !== null) {
                                // If status field exists, use it (it's the source of truth)
                                isPublished = article.status === 'published';
                              } else {
                                // Fall back to legacy published field only if status doesn't exist
                                isPublished = article.published === true;
                              }
                              
                              return (
                                <Badge
                                  colorScheme={isPublished ? 'green' : 'orange'}
                                  fontSize="xs"
                                >
                                  {isPublished ? 'Published' : 'Draft'}
                                </Badge>
                              );
                            })()}
                            <Text color="gray.500" fontSize="xs">
                              by {article.author}
                            </Text>
                            <Text color="gray.600" fontSize="xs">
                              •
                            </Text>
                            <Text color="gray.500" fontSize="xs">
                              {new Date(article.createdAt).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </VStack>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => {
                              router.push(`/oc-admin/articles/${article.id}`);
                              onArticlesClose();
                            }}
                          >
                            Edit
                          </Button>
                          <IconButton
                            aria-label="Delete article"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => openDeleteArticleModal(article.id)}
                          />
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="green"
                onClick={() => {
                  router.push(`/oc-admin/articles/new?category=${selectedCategoryId}`);
                  onArticlesClose();
                }}
                mr={3}
              >
                Create New Article
              </Button>
              <Button variant="ghost" onClick={onArticlesClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Article Confirmation Modal */}
        <Modal isOpen={isDeleteArticleOpen} onClose={onDeleteArticleClose}>
          <ModalOverlay />
          <ModalContent bg="#161d26" border="1px solid" borderColor="whiteAlpha.200">
            <ModalHeader color="white">Delete Article</ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody>
              <Text color="gray.300">
                Are you sure you want to delete this article? This action cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteArticleClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteArticle}>
                Delete Article
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* New Category/Subcategory Modal */}
        <Modal isOpen={isNewCategoryOpen} onClose={handleCancelCreateCategory} size="xl">
          <ModalOverlay />
          <ModalContent bg="#161d26" border="1px solid" borderColor="whiteAlpha.200">
            <ModalHeader color="white">
              {newCategoryParentId 
                ? `Create Subcategory under "${categories.find(c => c.id === newCategoryParentId)?.name || ''}"`
                : 'Create New Category'
              }
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody pb={6}>
              <CategoryForm
                categories={categories}
                onSubmit={handleCreateCategory}
                onCancel={handleCancelCreateCategory}
                defaultParentId={newCategoryParentId || undefined}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </AdminLayout>
    </AuthGuard>
  );
}

