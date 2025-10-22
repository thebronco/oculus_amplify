'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Heading,
  Card,
  CardBody,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Alert,
  AlertIcon,
  HStack,
  Switch,
} from '@chakra-ui/react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import RichTextEditor from '@/components/admin/RichTextEditor';
import FileUpload from '@/components/admin/FileUpload';
import { getCategories, createArticle } from '@/lib/api';
import type { Category, FileAttachment } from '@/lib/types';

export default function NewArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [author, setAuthor] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    
    // Set default author from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setAuthor(userData.username || 'Admin');
    }
    
    // Pre-select category from query parameter
    const categoryFromQuery = searchParams.get('category');
    if (categoryFromQuery) {
      setCategoryId(categoryFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    // Auto-generate slug from title
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !slug || !categoryId || !author) {
      setError('Title, slug, category, and author are required');
      return;
    }

    setLoading(true);

    try {
      await createArticle({
        title,
        slug,
        categoryId,
        author,
        excerpt,
        content,
        attachments,
        status,
      });
      router.push('/oc-admin/articles');
    } catch (err: any) {
      setError(err.message || 'Failed to create article');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/oc-admin/articles');
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <Box maxW="1200px">
          <Heading size="xl" color="white" mb={2}>
            New Article
          </Heading>
          <Text color="gray.400" mb={6}>
            Create a new article
            {searchParams.get('category') && categories.length > 0 && (
              <Text as="span" color="green.400" ml={2}>
                (Category pre-selected from: {categories.find(c => c.id === categoryId)?.name})
              </Text>
            )}
          </Text>

          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              {error && (
                <Alert status="error" bg="red.900" color="white">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <Card
                bg="#161d26"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel color="gray.300">Title</FormLabel>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Article Title"
                        size="lg"
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        color="white"
                        _placeholder={{ color: 'gray.500' }}
                        _hover={{ borderColor: 'whiteAlpha.400' }}
                        _focus={{
                          borderColor: '#5294CF',
                          boxShadow: '0 0 0 1px #5294CF',
                        }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.300">Slug</FormLabel>
                      <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="article-url-slug"
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        color="white"
                        _placeholder={{ color: 'gray.500' }}
                        _hover={{ borderColor: 'whiteAlpha.400' }}
                        _focus={{
                          borderColor: '#5294CF',
                          boxShadow: '0 0 0 1px #5294CF',
                        }}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Auto-generated from title
                      </Text>
                    </FormControl>

                    <HStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.300">Category</FormLabel>
                        <Select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          placeholder="Select category"
                          bg="whiteAlpha.100"
                          border="1px solid"
                          borderColor="whiteAlpha.300"
                          color="white"
                          _hover={{ borderColor: 'whiteAlpha.400' }}
                          _focus={{
                            borderColor: '#5294CF',
                            boxShadow: '0 0 0 1px #5294CF',
                          }}
                        >
                          {categories.map((cat) => (
                            <option
                              key={cat.id}
                              value={cat.id}
                              style={{ background: '#161d26' }}
                            >
                              {'  '.repeat(cat.level)} {cat.name}
                            </option>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.300">Author</FormLabel>
                        <Input
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          placeholder="Author Name"
                          bg="whiteAlpha.100"
                          border="1px solid"
                          borderColor="whiteAlpha.300"
                          color="white"
                          _placeholder={{ color: 'gray.500' }}
                          _hover={{ borderColor: 'whiteAlpha.400' }}
                          _focus={{
                            borderColor: '#5294CF',
                            boxShadow: '0 0 0 1px #5294CF',
                          }}
                        />
                      </FormControl>
                    </HStack>

                    <FormControl>
                      <FormLabel color="gray.300">Excerpt</FormLabel>
                      <Textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief summary (shown in article lists)"
                        rows={3}
                        bg="whiteAlpha.100"
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        color="white"
                        _placeholder={{ color: 'gray.500' }}
                        _hover={{ borderColor: 'whiteAlpha.400' }}
                        _focus={{
                          borderColor: '#5294CF',
                          boxShadow: '0 0 0 1px #5294CF',
                        }}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel color="gray.300" mb="0">
                        Publish immediately
                      </FormLabel>
                      <Switch
                        colorScheme="blue"
                        isChecked={status === 'published'}
                        onChange={(e) =>
                          setStatus(e.target.checked ? 'published' : 'draft')
                        }
                      />
                      <Text color="gray.500" ml={3} fontSize="sm">
                        {status === 'published' ? 'Published' : 'Draft'}
                      </Text>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="#161d26"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <CardBody>
                  <FormControl>
                    <FormLabel color="gray.300" mb={3}>
                      Content
                    </FormLabel>
                    <RichTextEditor
                      initialValue={content}
                      onChange={setContent}
                    />
                  </FormControl>
                </CardBody>
              </Card>

              <Card
                bg="#161d26"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <CardBody>
                  <FormControl>
                    <FormLabel color="gray.300" mb={3}>
                      File Attachments
                    </FormLabel>
                    <FileUpload
                      attachments={attachments}
                      onAttachmentsChange={setAttachments}
                    />
                  </FormControl>
                </CardBody>
              </Card>

              <HStack spacing={3}>
                <Button
                  type="submit"
                  colorScheme="blue"
                  bg="#5294CF"
                  _hover={{ bg: '#74B9FF' }}
                  isLoading={loading}
                  loadingText="Creating..."
                  size="lg"
                >
                  Create Article
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  isDisabled={loading}
                  size="lg"
                >
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      </AdminLayout>
    </AuthGuard>
  );
}

