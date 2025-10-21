'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Authenticator } from '@aws-amplify/ui-react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

const ADMIN_EMAIL = 'capitalcookdc@gmail.com';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    checkIfAlreadyLoggedIn();
  }, []);

  async function checkIfAlreadyLoggedIn() {
    try {
      const user = await getCurrentUser();
      const { signInDetails } = user;
      
      if (signInDetails?.loginId === ADMIN_EMAIL) {
        // Already logged in as admin, redirect to dashboard
        router.push('/oc-admin/dashboard');
      }
    } catch (error) {
      // Not logged in, stay on login page
    }
  }

  return (
    <Box minH="100vh" bg="#161d26" py={12}>
      <Container maxW="500px">
        <VStack spacing={6} mb={8}>
          <Heading size="xl" color="#5294CF">
            🔒 Admin Portal
          </Heading>
          <Text color="gray.300" textAlign="center">
            Sign in to access the OculusCyber admin dashboard
          </Text>
          <Text color="yellow.400" textAlign="center" fontSize="sm">
            Admin access restricted to: {ADMIN_EMAIL}
          </Text>
        </VStack>

        <Box
          bg="rgba(255,255,255,0.05)"
          borderRadius="lg"
          p={8}
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Authenticator
            signUpAttributes={['email']}
            socialProviders={[]}
          >
            {({ signOut, user }) => {
              // Check if logged-in user is admin
              if (user?.signInDetails?.loginId === ADMIN_EMAIL) {
                router.push('/oc-admin/dashboard');
                return null;
              }
              
              // Not admin - show error
              return (
                <VStack spacing={4} color="white">
                  <Text color="red.400" fontWeight="bold">
                    ⚠️ Access Denied
                  </Text>
                  <Text color="gray.300" textAlign="center">
                    Your account ({user?.signInDetails?.loginId}) does not have admin privileges.
                  </Text>
                  <Text color="gray.400" fontSize="sm" textAlign="center">
                    Only {ADMIN_EMAIL} can access the admin portal.
                  </Text>
                  <button
                    onClick={signOut}
                    style={{
                      padding: '10px 20px',
                      background: '#5294CF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    Sign Out
                  </button>
                </VStack>
              );
            }}
          </Authenticator>
        </Box>

        <Text color="gray.500" textAlign="center" mt={6} fontSize="sm">
          Need help? Contact the system administrator
        </Text>
      </Container>
    </Box>
  );
}

