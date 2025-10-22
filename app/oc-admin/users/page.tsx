'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Badge,
  Card,
  CardBody,
  Icon,
  Flex,
  Avatar,
} from '@chakra-ui/react';
import { FiUser, FiMail, FiClock, FiShield } from 'react-icons/fi';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { getUsers } from '@/lib/api';
import type { User } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'editor':
        return 'blue';
      case 'viewer':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
        <Box>
              <Heading size="xl" color="white" mb={2}>
            Users Management
          </Heading>
          <Text color="gray.400">
                View and manage user accounts
              </Text>
            </Box>
          </HStack>

          {/* Stats Cards */}
          <Flex gap={4} flexWrap="wrap">
            <Card
              bg="#161d26"
              border="1px solid"
              borderColor="whiteAlpha.200"
              flex="1"
              minW="200px"
            >
              <CardBody>
                <HStack spacing={4}>
                  <Icon as={FiUser} boxSize={8} color="#5294CF" />
                  <Box>
                    <Text color="gray.400" fontSize="sm">
                      Total Users
                    </Text>
                    <Text color="white" fontSize="2xl" fontWeight="bold">
                      {users.length}
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            <Card
              bg="#161d26"
              border="1px solid"
              borderColor="whiteAlpha.200"
              flex="1"
              minW="200px"
            >
              <CardBody>
                <HStack spacing={4}>
                  <Icon as={FiShield} boxSize={8} color="#e74c3c" />
                  <Box>
                    <Text color="gray.400" fontSize="sm">
                      Administrators
                    </Text>
                    <Text color="white" fontSize="2xl" fontWeight="bold">
                      {users.filter(u => u.role?.toLowerCase() === 'admin').length}
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          </Flex>

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
          ) : users.length === 0 ? (
            <Card
              bg="#161d26"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <CardBody textAlign="center" py={12}>
                <Icon as={FiUser} boxSize={12} color="gray.500" mb={4} />
                <Text color="gray.400" fontSize="lg">
                  No users found in the system
                </Text>
                <Text color="gray.500" fontSize="sm" mt={2}>
                  Users will appear here once they sign up
                </Text>
              </CardBody>
            </Card>
          ) : (
            <Box
              bg="#161d26"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderRadius="lg"
              overflow="hidden"
            >
              <Table variant="simple">
                <Thead bg="whiteAlpha.100">
                  <Tr>
                    <Th color="gray.400">User</Th>
                    <Th color="gray.400">Email</Th>
                    <Th color="gray.400">Role</Th>
                    <Th color="gray.400">Created</Th>
                    <Th color="gray.400">Last Updated</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user.id} _hover={{ bg: 'whiteAlpha.50' }}>
                      <Td>
                        <HStack spacing={3}>
                          <Avatar
                            size="sm"
                            name={user.email}
                            bg="#5294CF"
                            color="white"
                          />
                          <Box>
                            <Text color="white" fontWeight="medium">
                              {user.email.split('@')[0]}
                            </Text>
                            <Text color="gray.500" fontSize="xs">
                              ID: {user.id.substring(0, 12)}...
                            </Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={FiMail} color="gray.400" />
                          <Text color="gray.300" fontFamily="mono" fontSize="sm">
                            {user.email}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getRoleBadgeColor(user.role || 'user')}
                          fontSize="xs"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {user.role || 'USER'}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={FiClock} color="gray.400" boxSize={3} />
                          <Text color="gray.400" fontSize="sm">
                            {formatDate(user.createdAt)}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text color="gray.400" fontSize="sm">
                          {formatDate(user.updatedAt)}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          <Box
            bg="rgba(82, 148, 207, 0.1)"
            border="1px solid"
            borderColor="rgba(82, 148, 207, 0.3)"
            borderRadius="md"
            p={4}
          >
            <HStack spacing={2} color="#5294CF">
              <Icon as={FiShield} />
              <Text fontSize="sm" fontWeight="medium">
                Info:
              </Text>
            </HStack>
            <Text color="gray.400" fontSize="sm" mt={2}>
              User accounts are managed through AWS Cognito. To create or delete users,
              use the AWS Console or AWS CLI. Users shown here are synced from the DynamoDB users table.
          </Text>
        </Box>
        </VStack>
      </AdminLayout>
    </AuthGuard>
  );
}

