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
  useToast,
  Icon,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, AddIcon, ChevronDownIcon, ChevronRightIcon, ViewIcon, ViewOffIcon, DragHandleIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { FiFileText, FiFolderPlus, FiList, FiMove } from 'react-icons/fi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import CategoryForm from '@/components/admin/CategoryForm';
import { getCategories, deleteCategory, getArticles, createCategory, toggleCategoryVisibility, updateCategory } from '@/lib/api';
import type { Category, Article } from '@/lib/types';

// Extended category type with children for tree structure
interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

// Drag Handle Component
interface DragHandleProps {
  categoryId: string;
}

function DragHandle({ categoryId }: DragHandleProps) {
  const { attributes, listeners } = useSortable({ id: categoryId });

  return (
    <Box
      {...attributes}
      {...listeners}
      cursor="grab"
      _active={{ cursor: 'grabbing' }}
      color="gray.500"
      _hover={{ color: '#5294CF' }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={2}
      title="Drag to reorder"
    >
      <Icon as={DragHandleIcon} boxSize={4} />
    </Box>
  );
}

// Sortable Row Component
interface SortableRowProps {
  category: CategoryWithChildren & { displayLevel: number };
  children: React.ReactNode;
}

function SortableRow({ category, children }: SortableRowProps) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? 'rgba(82, 148, 207, 0.1)' : category.displayLevel === 0 ? 'rgba(255, 255, 255, 0.05)' : undefined,
  };

  return (
    <Tr ref={setNodeRef} style={style} _hover={{ bg: 'whiteAlpha.50' }}>
      {children}
    </Tr>
  );
}

export default function CategoriesPage() {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [newCategoryParentId, setNewCategoryParentId] = useState<string | null>(null);
  const [moveCategoryId, setMoveCategoryId] = useState<string | null>(null);
  const [moveToParentId, setMoveToParentId] = useState<string>('root');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isNewCategoryOpen, onOpen: onNewCategoryOpen, onClose: onNewCategoryClose } = useDisclosure();
  const { isOpen: isArticlesOpen, onOpen: onArticlesOpen, onClose: onArticlesClose } = useDisclosure();
  const { isOpen: isMoveOpen, onOpen: onMoveOpen, onClose: onMoveClose } = useDisclosure();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      toast({
        title: 'Error Loading Data',
        description: err.message || 'Failed to load categories',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
      return article.status === 'published';
    }).length;
  };

  // Build tree structure
  const buildCategoryTree = (): CategoryWithChildren[] => {
    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];
    
    // Create a map of all categories with children array
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
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
    const sortCategories = (cats: CategoryWithChildren[]) => {
      // Separate visible and hidden categories
      const visibleCategories = cats.filter(cat => cat.isVisible !== false);
      const hiddenCategories = cats.filter(cat => cat.isVisible === false);
      
      // Sort visible categories by order
      visibleCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Sort hidden categories by order (preserving their relative order)
      hiddenCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Combine: visible first, then hidden
      const sortedCats = [...visibleCategories, ...hiddenCategories];
      
      // Recursively sort children
      sortedCats.forEach(cat => {
        if (cat.children && cat.children.length > 0) {
          sortCategories(cat.children);
        }
      });
      
      // Replace the original array with sorted categories
      cats.length = 0;
      cats.push(...sortedCats);
    };
    
    sortCategories(rootCategories);
    return rootCategories;
  };

  // Flatten tree for rendering (respecting collapsed state)
  const flattenTree = (tree: CategoryWithChildren[], level = 0): (CategoryWithChildren & { displayLevel: number })[] => {
    let result: (CategoryWithChildren & { displayLevel: number })[] = [];
    
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
      toast({
        title: 'Category Deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setDeleteId(null);
    } catch (err: any) {
      toast({
        title: 'Error Deleting Category',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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

  const openMoveModal = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    setMoveCategoryId(categoryId);
    setMoveToParentId(category?.parentId || 'root');
    onMoveOpen();
  };

  const handleCreateCategory = async (data: Partial<Category>) => {
    try {
      await createCategory(data as any);
      
      // Refresh the list
      await fetchData();
      
      // If it's a subcategory, expand the parent to show it
      if (newCategoryParentId) {
        const newCollapsed = new Set(collapsedCategories);
        newCollapsed.delete(newCategoryParentId);
        setCollapsedCategories(newCollapsed);
      }
      
      toast({
        title: 'Category Created!',
        description: `Successfully created "${data.name}"`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      
      onNewCategoryClose();
      setNewCategoryParentId(null);
    } catch (error: any) {
      toast({
        title: 'Failed to Create Category',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancelCreateCategory = () => {
    onNewCategoryClose();
    setNewCategoryParentId(null);
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

  const handleToggleVisibility = async (categoryId: string, currentVisibility: boolean) => {
    try {
      const newVisibility = !currentVisibility;
      await toggleCategoryVisibility(categoryId, newVisibility);
      
      // Update local state
      setCategories(categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, isVisible: newVisibility }
          : cat
      ));
      
      toast({
        title: newVisibility ? 'Category Visible' : 'Category Hidden',
        description: newVisibility 
          ? 'This category is now visible on the public site'
          : 'This category is now hidden from the public site',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Update Visibility',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown Category';
  };

  const getCategoryArticles = (categoryId: string): Article[] => {
    return articles
      .filter(article => article.categoryId === categoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getAvailableParentsForMove = (categoryId: string): Category[] => {
    // Get all descendants of the category being moved
    const descendants = new Set<string>();
    const findDescendants = (parentId: string) => {
      descendants.add(parentId);
      categories
        .filter(c => c.parentId === parentId)
        .forEach(c => findDescendants(c.id));
    };
    
    findDescendants(categoryId);
    
    // Filter out the category itself and all its descendants
    return categories.filter(c => !descendants.has(c.id));
  };

  const handleMoveCategory = async () => {
    if (!moveCategoryId) return;

    try {
      await updateCategory(moveCategoryId, { parentId: moveToParentId });
      
      // Refresh data to show new hierarchy
      await fetchData();
      
      const movedCategory = categories.find(c => c.id === moveCategoryId);
      const newParent = moveToParentId === 'root' ? 'Root' : categories.find(c => c.id === moveToParentId)?.name || 'Unknown';
      
      toast({
        title: 'Category Moved!',
        description: `"${movedCategory?.name}" moved to "${newParent}"`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      
      onMoveClose();
      setMoveCategoryId(null);
      setMoveToParentId('root');
    } catch (error: any) {
      toast({
        title: 'Failed to Move Category',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Get the flat list of categories at the same level
    const activeCategory = flatCategories.find(c => c.id === active.id);
    const overCategory = flatCategories.find(c => c.id === over.id);

    if (!activeCategory || !overCategory) return;

    // Only allow reordering within the same parent
    if (activeCategory.parentId !== overCategory.parentId) {
      toast({
        title: 'Cannot Reorder',
        description: 'You can only reorder categories within the same level.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Find all siblings (categories with the same parent)
    const siblings = categories.filter(c => c.parentId === activeCategory.parentId);
    const oldIndex = siblings.findIndex(c => c.id === active.id);
    const newIndex = siblings.findIndex(c => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the siblings array
    const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);

    // Update order values for all reordered siblings
    try {
      // Update order in local state first for immediate feedback
      const updatedCategories = categories.map(cat => {
        const siblingIndex = reorderedSiblings.findIndex(s => s.id === cat.id);
        if (siblingIndex !== -1) {
          return { ...cat, order: siblingIndex };
        }
        return cat;
      });
      setCategories(updatedCategories);

      // Update order in database
      await Promise.all(
        reorderedSiblings.map((sibling, index) =>
          updateCategory(sibling.id, { order: index })
        )
      );

      toast({
        title: 'Order Updated',
        description: 'Category order has been saved.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Update Order',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      // Revert on error
      await fetchData();
    }
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
              onClick={() => openNewCategoryModal(null)}
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Table variant="simple">
                  <Thead bg="whiteAlpha.100">
                    <Tr>
                      <Th color="gray.400" width="50px"></Th>
                      <Th color="gray.400">Category Hierarchy</Th>
                      <Th color="gray.400">Slug</Th>
                      <Th color="gray.400">Level</Th>
                      <Th color="gray.400">Order</Th>
                      <Th color="gray.400">Actions</Th>
                    </Tr>
                  </Thead>
                  <SortableContext
                    items={flatCategories.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Tbody>
                      {flatCategories.map((category) => (
                        <SortableRow key={category.id} category={category}>
                          <Td>
                            <DragHandle categoryId={category.id} />
                          </Td>
                          <Td>
                        <HStack spacing={2} pl={category.displayLevel * 6}>
                          {/* Collapse/Expand button for categories with children */}
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
                              {category.isVisible === false && (
                                <Badge colorScheme="red" fontSize="xs" variant="solid">
                                  🚫 HIDDEN
                                </Badge>
                              )}
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
                          {category.displayLevel}
                        </Badge>
                      </Td>
                      <Td color="gray.400">{category.order}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Create subcategory"
                            icon={<FiFolderPlus />}
                            size="sm"
                            colorScheme="purple"
                            variant="ghost"
                            onClick={() => openNewCategoryModal(category.id)}
                            title="Create subcategory"
                          />
                          <IconButton
                            aria-label="Create article"
                            icon={<FiFileText />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => router.push(`/oc-admin/articles/new?category=${category.id}`)}
                            title="Create article in this category"
                          />
                          <IconButton
                            aria-label="View articles"
                            icon={<FiList />}
                            size="sm"
                            colorScheme="cyan"
                            variant="ghost"
                            onClick={() => openArticlesModal(category.id)}
                            title="View all articles in this category"
                          />
                          <IconButton
                            aria-label="Toggle visibility"
                            icon={category.isVisible !== false ? <ViewIcon /> : <ViewOffIcon />}
                            size="sm"
                            colorScheme={category.isVisible !== false ? "green" : "orange"}
                            variant={category.isVisible !== false ? "ghost" : "solid"}
                            onClick={() => handleToggleVisibility(category.id, category.isVisible !== false)}
                            title={category.isVisible !== false ? "Hide from public" : "Show on public"}
                          />
                          <IconButton
                            aria-label="Move category"
                            icon={<FiMove />}
                            size="sm"
                            colorScheme="purple"
                            variant="ghost"
                            onClick={() => openMoveModal(category.id)}
                            title="Move to another category"
                          />
                          <IconButton
                            aria-label="Edit category"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => router.push(`/oc-admin/categories/${category.id}`)}
                            title="Edit category details"
                          />
                          <IconButton
                            aria-label="Delete category"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => openDeleteModal(category.id)}
                            title="Delete category"
                          />
                        </HStack>
                      </Td>
                        </SortableRow>
                      ))}
                    </Tbody>
                  </SortableContext>
                </Table>
              </DndContext>
            </Box>
          )}

          <HStack color="gray.500" fontSize="sm" spacing={4}>
            <Text>Total: {categories.length} categories</Text>
            <Text>•</Text>
            <Text>Root: {categoryTree.length} categories</Text>
            <Text>•</Text>
            <Text>Subcategories: {categories.length - categoryTree.length}</Text>
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
                <Box textAlign="center" py={8}>
                  <Text color="gray.400" mb={2}>
                    No articles in this category yet.
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Create your first article to get started!
                  </Text>
                </Box>
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
                            <Badge
                              colorScheme={article.status === 'published' ? 'green' : 'orange'}
                              fontSize="xs"
                            >
                              {article.status === 'published' ? 'Published' : 'Draft'}
                            </Badge>
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
                            leftIcon={<EditIcon />}
                            onClick={() => {
                              router.push(`/oc-admin/articles/${article.id}`);
                              onArticlesClose();
                            }}
                          >
                            Edit
                          </Button>
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
                bg="#00B894"
                _hover={{ bg: '#00CEC9' }}
                leftIcon={<FiFileText />}
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

        {/* Move Category Modal */}
        <Modal isOpen={isMoveOpen} onClose={onMoveClose} size="md">
          <ModalOverlay />
          <ModalContent bg="#161d26" border="1px solid" borderColor="whiteAlpha.200">
            <ModalHeader color="white">
              <HStack spacing={2}>
                <Icon as={FiMove} color="#5294CF" />
                <Text>Move Category</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody pb={6}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text color="gray.300" mb={2}>
                    Move <Text as="span" color="white" fontWeight="bold">&quot;{moveCategoryId && getCategoryName(moveCategoryId)}&quot;</Text> to:
                  </Text>
                </Box>

                <FormControl>
                  <FormLabel color="gray.300">New Parent Category</FormLabel>
                  <Select
                    value={moveToParentId}
                    onChange={(e) => setMoveToParentId(e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _hover={{ borderColor: '#5294CF' }}
                    _focus={{ borderColor: '#5294CF', boxShadow: '0 0 0 1px #5294CF' }}
                  >
                    <option value="root" style={{ background: '#161d26', color: 'white' }}>
                      📁 Root (Top Level)
                    </option>
                    {moveCategoryId && getAvailableParentsForMove(moveCategoryId).map((cat) => (
                      <option
                        key={cat.id}
                        value={cat.id}
                        style={{ background: '#161d26', color: 'white' }}
                      >
                        {cat.parentId === 'root' ? '' : '  └─ '}
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </Select>
                  <Text color="gray.500" fontSize="xs" mt={2}>
                    Note: You cannot move a category under itself or its subcategories
                  </Text>
                </FormControl>

                <Alert status="info" bg="rgba(82, 148, 207, 0.1)" border="1px solid" borderColor="rgba(82, 148, 207, 0.3)">
                  <AlertIcon color="#5294CF" />
                  <VStack align="start" spacing={0}>
                    <Text color="gray.300" fontSize="sm">
                      This will update the category hierarchy.
                    </Text>
                    <Text color="gray.400" fontSize="xs">
                      All subcategories will move with it.
                    </Text>
                  </VStack>
                </Alert>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={() => {
                  onMoveClose();
                  setMoveCategoryId(null);
                  setMoveToParentId('root');
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                bg="#6C5CE7"
                _hover={{ bg: '#A29BFE' }}
                leftIcon={<ArrowForwardIcon />}
                onClick={handleMoveCategory}
              >
                Move Category
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AdminLayout>
    </AuthGuard>
  );
}

