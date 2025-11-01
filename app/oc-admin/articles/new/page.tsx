'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  HStack,
  FormHelperText,
  Switch,
  Text,
  useToast,
  Spinner,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import LexicalEditor from '@/components/admin/LexicalEditor';
import { getCategories, createArticle } from '@/lib/api';
import { buildCategoryCheckboxes } from '@/lib/categoryUtils';
import type { Category } from '@/lib/types';

function NewArticleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categoryIds: [] as string[],
    content: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Start writing your article here...","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
    status: 'draft' as 'draft' | 'published',
    author: 'Admin',
    attachments: '',
  });

  // Helper function to generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update categoryIds when categories are loaded and we have a category param
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.length > 0) {
      // Verify the category exists before setting it
      const categoryExists = categories.find(cat => cat.id === categoryParam);
      if (categoryExists && !formData.categoryIds.includes(categoryParam)) {
        setFormData(prev => ({ 
          ...prev, 
          categoryIds: [...prev.categoryIds, categoryParam] 
        }));
      }
    }
  }, [categories, searchParams, formData.categoryIds]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !slugManuallyEdited) {
      const slug = generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, slugManuallyEdited]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegenerateSlug = () => {
    if (formData.title) {
      const slug = generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug }));
      setSlugManuallyEdited(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submitted, current formData:', formData);
    
    if (!formData.title || formData.categoryIds.length === 0) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in title and select at least one category',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.slug || formData.slug.trim() === '') {
      toast({
        title: 'Missing Slug',
        description: 'Please provide a URL slug for the article',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting article creation:', {
        formData: {
          title: formData.title,
          slug: formData.slug,
          categoryIds: formData.categoryIds,
          status: formData.status,
          author: formData.author,
          contentLength: formData.content?.length || 0,
        },
      });

      // Convert simple text content to Lexical JSON if needed
      let contentToSave = formData.content;
      
      // If it's not valid JSON, wrap it in Lexical format
      try {
        JSON.parse(contentToSave);
      } catch {
        const lexicalContent = {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: contentToSave,
                    type: "text",
                    version: 1
                  }
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1
              }
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1
          }
        };
        contentToSave = JSON.stringify(lexicalContent);
      }

      const createdArticle = await createArticle({
        ...formData,
        content: contentToSave,
      });

      console.log('Article creation response:', createdArticle);

      toast({
        title: 'Article Created!',
        description: `Successfully created "${formData.title}"`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      // Small delay before redirect to ensure toast is visible
      setTimeout(() => {
        router.push('/oc-admin/articles');
      }, 500);
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      console.error('Error details:', {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        stack: error?.stack,
      });
      
      toast({
        title: 'Failed to Create Article',
        description: error?.message || 'An unexpected error occurred. Please check the browser console for details.',
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <Box maxW="900px">
          <Heading size="xl" color="white" mb={2}>
            New Article
          </Heading>
          <Text color="gray.400" mb={6}>
            Create a new content article
          </Text>

          <Box
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="lg"
            p={6}
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Title */}
                <FormControl isRequired>
                  <FormLabel color="white">Article Title</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., How to Configure IPTables"
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    size="lg"
                  />
                </FormControl>

                {/* Slug */}
                <FormControl isRequired>
                  <FormLabel color="white">URL Slug</FormLabel>
                  <InputGroup>
                    <Input
                      value={formData.slug}
                      onChange={(e) => {
                        setSlugManuallyEdited(true);
                        handleChange('slug', e.target.value);
                      }}
                      placeholder="e.g., how-to-configure-iptables"
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.300"
                      color="white"
                      _placeholder={{ color: 'gray.500' }}
                      fontFamily="mono"
                      pr="50px"
                    />
                    <InputRightElement width="50px">
                      <IconButton
                        aria-label="Regenerate slug"
                        icon={<RepeatIcon />}
                        size="sm"
                        variant="ghost"
                        color="gray.400"
                        _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
                        onClick={handleRegenerateSlug}
                        isDisabled={!formData.title}
                        title="Regenerate slug from title"
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormHelperText color="gray.500">
                    Used in URLs. Auto-generated from title. Click the refresh icon to regenerate.
                  </FormHelperText>
                </FormControl>

                {/* Categories */}
                <FormControl isRequired>
                  <FormLabel color="white">Categories</FormLabel>
                  <Box
                    bg="whiteAlpha.50"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    borderRadius="md"
                    p={4}
                    maxH="300px"
                    overflowY="auto"
                  >
                    {categories.length > 0 ? (
                      buildCategoryCheckboxes(
                        categories,
                        formData.categoryIds,
                        (categoryId, checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              categoryIds: [...prev.categoryIds, categoryId]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              categoryIds: prev.categoryIds.filter(id => id !== categoryId)
                            }));
                          }
                        }
                      )
                    ) : (
                      <Text color="gray.400">Loading categories...</Text>
                    )}
                  </Box>
                  <FormHelperText color="gray.500">
                    Select one or more categories for this article
                  </FormHelperText>
                </FormControl>

                {/* Author */}
                <FormControl isRequired>
                  <FormLabel color="white">Author</FormLabel>
                  <Input
                    value={formData.author}
                    onChange={(e) => handleChange('author', e.target.value)}
                    placeholder="Author name"
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                  />
                </FormControl>

                {/* Content */}
                <FormControl isRequired>
                  <FormLabel color="white">Content</FormLabel>
                  <LexicalEditor
                    initialContent={formData.content}
                    onChange={(content) => handleChange('content', content)}
                  />
                  <FormHelperText color="gray.500">
                    Rich text editor with formatting support (bold, italic, headings, lists, etc.)
                  </FormHelperText>
                </FormControl>

                {/* Status */}
                <FormControl>
                  <FormLabel color="white">Publish Status</FormLabel>
                  <HStack spacing={3}>
                    <Switch
                      isChecked={formData.status === 'published'}
                      onChange={(e) =>
                        handleChange('status', e.target.checked ? 'published' : 'draft')
                      }
                      colorScheme="green"
                      size="lg"
                    />
                    <Text
                      color={formData.status === 'published' ? 'green.400' : 'orange.400'}
                      fontWeight="medium"
                    >
                      {formData.status === 'published' ? 'Published (Visible on site)' : 'Draft (Not visible)'}
                    </Text>
                  </HStack>
                </FormControl>

                {/* Action Buttons */}
                <HStack spacing={4} pt={4}>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    bg="#5294CF"
                    _hover={{ bg: '#74B9FF' }}
                    isLoading={loading}
                    loadingText="Creating..."
                    size="lg"
                    flex={1}
                    onClick={(e) => {
                      // Ensure form submission is handled correctly
                      const form = e.currentTarget.closest('form');
                      if (form && !form.checkValidity()) {
                        e.preventDefault();
                        form.reportValidity();
                      }
                    }}
                  >
                    Create Article
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    color="white"
                    onClick={() => router.push('/oc-admin/articles')}
                    isDisabled={loading}
                    size="lg"
                  >
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            </form>
          </Box>
        </Box>
      </AdminLayout>
    </AuthGuard>
  );
}

export default function NewArticlePage() {
  return (
    <Suspense fallback={
      <Box minH="100vh" bg="#0f1419" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="#5294CF" />
      </Box>
    }>
      <NewArticleForm />
    </Suspense>
  );
}

