'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { login } from '@/lib/api';
import { setAuthToken, setUserData } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      
      if (response.token && response.user) {
        // Store token and user data
        setAuthToken(response.token);
        setUserData(response.user);
        
        // Redirect to dashboard
        router.push('/oc-admin/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="#0F1419" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md">
        <Box
          bg="#161d26"
          p={8}
          borderRadius="lg"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <VStack spacing={6} align="stretch">
            <VStack spacing={2}>
              <Heading size="xl" color="#5294CF">
                OculusCyber
              </Heading>
              <Text color="gray.400" fontSize="lg">
                Admin Panel Login
              </Text>
            </VStack>

            {error && (
              <Alert status="error" bg="red.900" color="white">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gray.300">Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@oculuscyber.com"
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    color="white"
                    _placeholder={{ color: 'gray.500' }}
                    _hover={{ borderColor: 'whiteAlpha.400' }}
                    _focus={{ borderColor: '#5294CF', boxShadow: '0 0 0 1px #5294CF' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => setShowPassword(!showPassword)}
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
                  size="lg"
                  isLoading={loading}
                  loadingText="Logging in..."
                >
                  Login
                </Button>
              </VStack>
            </form>

          </VStack>
        </Box>

        <Text color="gray.600" textAlign="center" mt={4} fontSize="sm">
          © 2025 OculusCyber. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}

