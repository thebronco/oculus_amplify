'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Spinner,
  Flex,
} from '@chakra-ui/react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import RichTextEditor from '@/components/admin/RichTextEditor';
import FileUpload from '@/components/admin/FileUpload';
import { getCategories, getArticleById, updateArticle } from '@/lib/api';
import type { Category, Article, FileAttachment } from '@/lib/types';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [author, setAuthor] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [articleData, categoriesData] = await Promise.all([
        getArticleById(id),
        getCategories(),
      ]);
      setArticle(articleData);
      setTitle(articleData.title);
      setSlug(articleData.slug);
      setCategoryId(articleData.categoryId);
      setAuthor(articleData.author);
      setExcerpt(articleData.excerpt || '');
      setContent(articleData.content);
      setAttachments(articleData.attachments || []);
      setStatus(articleData.status);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !slug || !categoryId || !author) {
      setError('Title, slug, category, and author are required');
      return;
    }

    setSaving(true);

    try {
      await updateArticle(id, {
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
      setError(err.message || 'Failed to update article');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/oc-admin/articles');
  };

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="#5294CF" />
          </Flex>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (!article) {
    return (
      <AuthGuard>
        <AdminLayout>
          <Box>
            <Heading size="xl" color="white">
              Article Not Found
            </Heading>
          </Box>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <Box maxW="1200px">
          <Heading size="xl" color="white" mb={2}>
            Edit Article
          </Heading>
          <Text color="gray.400" mb={6}>
            Update article information
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
                    </FormControl>

                    <HStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.300">Category</FormLabel>
                        <Select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
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
                        Publication Status
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
                      articleId={id}
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
                  isLoading={saving}
                  loadingText="Saving..."
                  size="lg"
                >
                  Update Article
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  isDisabled={saving}
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

