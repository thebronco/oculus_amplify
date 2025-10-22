'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Card,
  CardBody,
  Text,
} from '@chakra-ui/react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import CategoryForm from '@/components/admin/CategoryForm';
import { getCategories, createCategory } from '@/lib/api';
import type { Category } from '@/lib/types';

export default function NewCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSubmit = async (data: Partial<Category>) => {
    await createCategory(data);
    router.push('/oc-admin/categories');
  };

  const handleCancel = () => {
    router.push('/oc-admin/categories');
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <Box maxW="800px">
          <Heading size="xl" color="white" mb={2}>
            New Category
          </Heading>
          <Text color="gray.400" mb={6}>
            Create a new content category
          </Text>

          <Card
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <CardBody>
              <CategoryForm
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

