'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Heading,
  Card,
  CardBody,
  Text,
  Spinner,
  Flex,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import CategoryForm from '@/components/admin/CategoryForm';
import { getCategories, getCategoryById, updateCategory } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const id = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoryData, categoriesData] = await Promise.all([
        getCategoryById(id),
        getCategories(),
      ]);
      
      if (!categoryData) {
        setError('Category not found');
      } else {
        setCategory(categoryData);
        setCategories(categoriesData);
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load category');
      toast({
        title: 'Error Loading Category',
        description: err.message || 'Failed to load category data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Category>) => {
    try {
      await updateCategory(id, data);
      
      toast({
        title: 'Category Updated!',
        description: `Successfully updated "${data.name}"`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      
      router.push('/oc-admin/categories');
    } catch (err: any) {
      toast({
        title: 'Failed to Update Category',
        description: err.message || 'An error occurred while updating the category',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err; // Re-throw to let the form handle it
    }
  };

  const handleCancel = () => {
    router.push('/oc-admin/categories');
  };

  if (loading) {
    return (
      <AuthGuard>
        <AdminLayout>
          <Flex justify="center" py={12}>
            <Spinner size="xl" color="#5294CF" />
            <Text color="white" ml={4}>
              Loading category...
            </Text>
          </Flex>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (error || !category) {
    return (
      <AuthGuard>
        <AdminLayout>
          <Box>
            <Heading size="xl" color="white" mb={4}>
              Category Not Found
            </Heading>
            <Alert status="error" bg="red.900" color="white" mb={4}>
              <AlertIcon />
              {error || 'The category you are looking for does not exist.'}
            </Alert>
            <Text color="gray.400">
              The category may have been deleted or the URL is incorrect.
            </Text>
          </Box>
        </AdminLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AdminLayout>
        <Box maxW="800px">
          <Heading size="xl" color="white" mb={2}>
            Edit Category
          </Heading>
          <Text color="gray.400" mb={6}>
            Update category information for &quot;{category.name}&quot;
          </Text>

          <Card
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <CardBody>
              <CategoryForm
                category={category}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </CardBody>
          </Card>
        </Box>
      </AdminLayout>
    </AuthGuard>
  );
}

