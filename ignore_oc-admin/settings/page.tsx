'use client';

import { useState, FormEvent } from 'react';
import {
  Box,
  Heading,
  VStack,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  Divider,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { getUserData } from '@/lib/auth';
import { changePassword } from '@/lib/api';

export default function SettingsPage() {
  const user = getUserData();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <VStack align="stretch" spacing={6}>
          <Box>
            <Heading size="xl" color="white" mb={2}>
              Settings
            </Heading>
            <Text color="gray.400">
              Manage your account settings and preferences
            </Text>
          </Box>

          <Card
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
            maxW="600px"
          >
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Heading size="md" color="white" mb={4}>
                    Account Information
                  </Heading>
                  <VStack align="stretch" spacing={3} color="gray.400">
                    <Box>
                      <Text fontSize="sm" color="gray.500">Email</Text>
                      <Text color="white">{user?.email || 'Not logged in'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">Role</Text>
                      <Text color="white">{user?.role || 'N/A'}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">User ID</Text>
                      <Text color="white" fontSize="sm">{user?.id || 'N/A'}</Text>
                    </Box>
                  </VStack>
                </Box>

                <Divider borderColor="whiteAlpha.200" />

                <Box>
                  <Heading size="md" color="white" mb={4}>
                    Change Password
                  </Heading>

                  {success && (
                    <Alert status="success" bg="green.900" color="white" mb={4}>
                      <AlertIcon />
                      {success}
                    </Alert>
                  )}

                  {error && (
                    <Alert status="error" bg="red.900" color="white" mb={4}>
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  <form onSubmit={handlePasswordChange}>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel color="gray.300">Current Password</FormLabel>
                        <InputGroup>
                          <Input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            bg="whiteAlpha.100"
                            border="1px solid"
                            borderColor="whiteAlpha.300"
                            color="white"
                            _placeholder={{ color: 'gray.500' }}
                            _hover={{ borderColor: 'whiteAlpha.400' }}
                            _focus={{ borderColor: '#5294CF', boxShadow: '0 0 0 1px #5294CF' }}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                              icon={showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />}
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              variant="ghost"
                              color="gray.400"
                              _hover={{ color: 'white' }}
                              size="sm"
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.300">New Password</FormLabel>
                        <InputGroup>
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 8 characters)"
                            bg="whiteAlpha.100"
                            border="1px solid"
                            borderColor="whiteAlpha.300"
                            color="white"
                            _placeholder={{ color: 'gray.500' }}
                            _hover={{ borderColor: 'whiteAlpha.400' }}
                            _focus={{ borderColor: '#5294CF', boxShadow: '0 0 0 1px #5294CF' }}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                              icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              variant="ghost"
                              color="gray.400"
                              _hover={{ color: 'white' }}
                              size="sm"
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="gray.300">Confirm New Password</FormLabel>
                        <InputGroup>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            bg="whiteAlpha.100"
                            border="1px solid"
                            borderColor="whiteAlpha.300"
                            color="white"
                            _placeholder={{ color: 'gray.500' }}
                            _hover={{ borderColor: 'whiteAlpha.400' }}
                            _focus={{ borderColor: '#5294CF', boxShadow: '0 0 0 1px #5294CF' }}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                              icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              variant="ghost"
                              color="gray.400"
                              _hover={{ color: 'white' }}
                              size="sm"
                            />
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>

                      <Button
                        type="submit"
                        colorScheme="blue"
                        bg="#5294CF"
                        _hover={{ bg: '#74B9FF' }}
                        width="full"
                        isLoading={loading}
                        loadingText="Changing password..."
                      >
                        Change Password
                      </Button>
                    </VStack>
                  </form>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
            maxW="600px"
          >
            <CardBody>
              <Heading size="md" color="white" mb={4}>
                Site Configuration
              </Heading>
              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>API Endpoint</Text>
                  <Text color="white" fontSize="sm" fontFamily="mono">
                    {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>Environment</Text>
                  <Text color="white">Development</Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </AdminLayout>
    </AuthGuard>
  );
}

