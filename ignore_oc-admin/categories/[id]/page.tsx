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
} from '@chakra-ui/react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import CategoryForm from '@/components/admin/CategoryForm';
import { getCategories, getCategoryById, updateCategory } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [categoryData, categoriesData] = await Promise.all([
        getCategoryById(id),
        getCategories(),
      ]);
      setCategory(categoryData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Category>) => {
    await updateCategory(id, data);
    router.push('/oc-admin/categories');
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
          </Flex>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (!category) {
    return (
      <AuthGuard>
        <AdminLayout>
          <Box>
            <Heading size="xl" color="white">Category Not Found</Heading>
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
            Update category information
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

