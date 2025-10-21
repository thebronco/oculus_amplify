'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Textarea,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { getCategories, getArticleById, updateArticle } from '@/lib/api';
import type { Category, Article } from '@/lib/types';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const articleId = params.id as string;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categoryId: '',
    content: '',
    status: 'draft' as 'draft' | 'published',
    author: 'Admin',
    attachments: '',
  });

  useEffect(() => {
    fetchData();
  }, [articleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [article, categoriesData] = await Promise.all([
        getArticleById(articleId),
        getCategories(),
      ]);
      
      if (!article) {
        throw new Error('Article not found');
      }

      setFormData({
        title: article.title,
        slug: article.slug,
        categoryId: article.categoryId,
        content: article.content,
        status: article.status,
        author: article.author,
        attachments: article.attachments || '',
      });
      
      setCategories(categoriesData);
    } catch (err: any) {
      toast({
        title: 'Error Loading Article',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/oc-admin/articles');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.categoryId) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in title and select a category',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);
    try {
      await updateArticle(articleId, formData);

      toast({
        title: 'Article Updated!',
        description: `Successfully updated "${formData.title}"`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      router.push('/oc-admin/articles');
    } catch (error: any) {
      toast({
        title: 'Failed to Update Article',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <Box textAlign="center" py={12}>
            <Spinner size="xl" color="#5294CF" />
            <Text color="gray.400" mt={4}>Loading article...</Text>
          </Box>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <Box maxW="900px">
          <Heading size="xl" color="white" mb={2}>
            Edit Article
          </Heading>
          <Text color="gray.400" mb={6}>
            Update article content
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
                  <Input
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="e.g., how-to-configure-iptables"
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    fontFamily="mono"
                  />
                  <FormHelperText color="gray.500">
                    Used in URLs. Changing this will break existing links.
                  </FormHelperText>
                </FormControl>

                {/* Category */}
                <FormControl isRequired>
                  <FormLabel color="white">Category</FormLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                  >
                    {categories
                      .filter(c => c.parentId === 'root')
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                          style={{ background: '#161d26' }}
                        >
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                  </Select>
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
                  <Textarea
                    value={(() => {
                      try {
                        const parsed = JSON.parse(formData.content);
                        // Extract text from Lexical JSON
                        const extractText = (node: any): string => {
                          if (!node) return '';
                          if (node.type === 'text' && node.text) return node.text;
                          if (node.children && Array.isArray(node.children)) {
                            return node.children.map(extractText).join('\n');
                          }
                          return '';
                        };
                        const rootChildren = parsed?.root?.children || [];
                        return rootChildren.map(extractText).join('\n').trim();
                      } catch {
                        return formData.content;
                      }
                    })()}
                    onChange={(e) => {
                      const text = e.target.value;
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
                                  text: text,
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
                      handleChange('content', JSON.stringify(lexicalContent));
                    }}
                    placeholder="Write your article content here..."
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    rows={15}
                    fontFamily="inherit"
                  />
                  <FormHelperText color="gray.500">
                    Simple text editor. Formatting preserved in Lexical JSON format.
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
                    isLoading={saving}
                    loadingText="Saving..."
                    size="lg"
                    flex={1}
                  >
                    Update Article
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    color="white"
                    onClick={() => router.push('/oc-admin/articles')}
                    isDisabled={saving}
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

