'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Badge,
  Input,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, EditIcon } from '@chakra-ui/icons';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { getUsers, deleteUser, createUser } from '@/lib/api';
import type { User } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  
  // Create user form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('editor');
  const [creating, setCreating] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteUser(deleteId);
      setUsers(users.filter((u) => u.id !== deleteId));
      onDeleteClose();
      setDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      onDeleteClose();
    }
  };

  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    onDeleteOpen();
  };

  const handleCreateUser = async () => {
    setError('');

    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }

    setCreating(true);

    try {
      await createUser({
        username,
        email,
        password,
        role,
      });
      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('editor');
      onCreateClose();
      // Refresh users list
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
            <Box>
              <Heading size="xl" color="white" mb={2}>
                Users
              </Heading>
              <Text color="gray.400">
                Manage user accounts and permissions
              </Text>
            </Box>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              bg="#5294CF"
              _hover={{ bg: '#74B9FF' }}
              onClick={onCreateOpen}
            >
              New User
            </Button>
          </HStack>

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
                    <Th color="gray.400">Username</Th>
                    <Th color="gray.400">Email</Th>
                    <Th color="gray.400">Role</Th>
                    <Th color="gray.400">Created</Th>
                    <Th color="gray.400">Last Login</Th>
                    <Th color="gray.400">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={8} color="gray.500">
                        No users found
                      </Td>
                    </Tr>
                  ) : (
                    users.map((user) => (
                      <Tr key={user.id} _hover={{ bg: 'whiteAlpha.50' }}>
                        <Td color="white" fontWeight="medium">
                          {user.username}
                        </Td>
                        <Td color="gray.400">{user.email}</Td>
                        <Td>
                          <Badge
                            colorScheme={user.role === 'admin' ? 'purple' : 'blue'}
                          >
                            {user.role}
                          </Badge>
                        </Td>
                        <Td color="gray.400" fontSize="sm">
                          {formatDate(user.createdAt)}
                        </Td>
                        <Td color="gray.400" fontSize="sm">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Delete user"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => openDeleteModal(user.id)}
                              isDisabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          )}

          <Text color="gray.500" fontSize="sm">
            Total: {users.length} users
          </Text>
        </VStack>

        {/* Create User Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
          <ModalOverlay />
          <ModalContent
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <ModalHeader color="white">Create New User</ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody>
              <VStack spacing={4}>
                {error && (
                  <Alert status="error" bg="red.900" color="white" fontSize="sm">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <FormControl isRequired>
                  <FormLabel color="gray.300">Username</FormLabel>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300">Role</FormLabel>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'editor')}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                  >
                    <option value="editor" style={{ background: '#161d26' }}>
                      Editor
                    </option>
                    <option value="admin" style={{ background: '#161d26' }}>
                      Admin
                    </option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                bg="#5294CF"
                _hover={{ bg: '#74B9FF' }}
                onClick={handleCreateUser}
                isLoading={creating}
              >
                Create User
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <ModalHeader color="white">Delete User</ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody>
              <Text color="gray.300">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AdminLayout>
    </AuthGuard>
  );
}

