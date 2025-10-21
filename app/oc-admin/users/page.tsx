'use client';

import { Box, Heading, Text } from '@chakra-ui/react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';

export default function UsersPage() {
  return (
    <AuthGuard>
      <AdminLayout>
        <Box>
          <Heading size="xl" color="white" mb={4}>
            Users Management
          </Heading>
          <Text color="gray.400">
            User management interface coming soon...
          </Text>
        </Box>
      </AdminLayout>
    </AuthGuard>
  );
}

