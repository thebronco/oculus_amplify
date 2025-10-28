'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from 'aws-amplify/auth';
import { Box, Spinner, Flex } from '@chakra-ui/react';

const ADMIN_EMAIL = 'capitalcookdc@gmail.com';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Add a small delay to ensure Amplify is fully configured
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const user = await getCurrentUser();
      const { signInDetails } = user;
      
      // Check if user email matches admin email
      if (signInDetails?.loginId === ADMIN_EMAIL) {
        setIsAuthorized(true);
      } else {
        // Not authorized - redirect to login
        router.push('/oc-admin/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Not authenticated - redirect to login
      router.push('/oc-admin/login');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="#161d26">
        <Spinner size="xl" color="#5294CF" />
      </Flex>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

