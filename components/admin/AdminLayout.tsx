'use client';

import { signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  HStack,
  Icon,
  Text,
  Divider,
} from '@chakra-ui/react';
import { FiHome, FiFolder, FiFileText, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut();
      router.push('/oc-admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  const navItems = [
    { href: '/oc-admin/dashboard', icon: FiHome, label: 'Dashboard' },
    { href: '/oc-admin/categories', icon: FiFolder, label: 'Categories' },
    { href: '/oc-admin/articles', icon: FiFileText, label: 'Articles' },
    { href: '/oc-admin/users', icon: FiUsers, label: 'Users' },
    { href: '/oc-admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <Flex minH="100vh" bg="#161d26">
      {/* Sidebar */}
      <Box
        w="250px"
        bg="#1A2332"
        borderRight="1px solid"
        borderColor="whiteAlpha.200"
        p={6}
      >
        {/* Logo/Title */}
        <Link href="/">
          <Heading size="md" color="#5294CF" mb={8} cursor="pointer">
            🔒 OculusCyber
          </Heading>
        </Link>

        {/* Navigation */}
        <VStack spacing={2} align="stretch">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <HStack
                p={3}
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: 'whiteAlpha.100' }}
                color="gray.300"
                transition="all 0.2s"
              >
                <Icon as={item.icon} boxSize={5} />
                <Text fontSize="sm" fontWeight="500">
                  {item.label}
                </Text>
              </HStack>
            </Link>
          ))}
        </VStack>

        <Divider my={6} borderColor="whiteAlpha.200" />

        {/* Sign Out Button */}
        <Button
          leftIcon={<FiLogOut />}
          variant="ghost"
          color="gray.400"
          w="full"
          justifyContent="flex-start"
          onClick={handleSignOut}
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
        >
          Sign Out
        </Button>

        {/* View Public Site Link */}
        <Link href="/" target="_blank">
          <Button
            variant="ghost"
            color="gray.400"
            w="full"
            justifyContent="flex-start"
            mt={2}
            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
          >
            🌐 View Public Site
          </Button>
        </Link>
      </Box>

      {/* Main Content */}
      <Box flex="1" p={8} overflowY="auto">
        {children}
      </Box>
    </Flex>
  );
}

