'use client';

import { useState, useEffect } from 'react';
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
  Textarea,
  useToast,
} from '@chakra-ui/react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { getCategories, createArticle } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function NewArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categoryId: searchParams.get('category') || '',
    content: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Start writing your article here...","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
    status: 'draft' as 'draft' | 'published',
    author: 'Admin',
    attachments: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, formData.slug]);

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

    setLoading(true);
    try {
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

      await createArticle({
        ...formData,
        content: contentToSave,
      });

      toast({
        title: 'Article Created!',
        description: `Successfully created "${formData.title}"`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      router.push('/oc-admin/articles');
    } catch (error: any) {
      toast({
        title: 'Failed to Create Article',
        description: error.message,
        status: 'error',
        duration: 5000,
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
                    Used in URLs. Auto-generated from title.
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
                    placeholder="Select a category"
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
                        const text = parsed.root?.children?.[0]?.children?.[0]?.text || '';
                        return text;
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
                    Simple text editor. Formatting will be preserved in Lexical JSON format.
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

