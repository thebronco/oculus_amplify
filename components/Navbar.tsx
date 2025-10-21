'use client';

import { Box, Flex, Heading, Button, HStack, IconButton, useDisclosure } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import Link from 'next/link';

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box 
      bg="rgba(22, 29, 38, 0.95)" 
      px={{ base: 4, md: 8 }} 
      py={4}
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
      position="sticky"
      top={0}
      zIndex={1000}
      backdropFilter="blur(10px)"
    >
      <Flex maxW="1400px" mx="auto" align="center" justify="space-between">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Heading 
            size={{ base: 'md', md: 'lg' }} 
            color="#5294CF"
            cursor="pointer"
            _hover={{ color: '#74B9FF' }}
            transition="color 0.2s"
          >
            🔒 OculusCyber
          </Heading>
        </Link>

        {/* Desktop Navigation */}
        <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Box
              color="#D5DBDB"
              fontSize="sm"
              fontWeight="500"
              cursor="pointer"
              _hover={{ color: '#5294CF' }}
              transition="color 0.2s"
            >
              Home
            </Box>
          </Link>
          <Link href="/oc-admin/login" style={{ textDecoration: 'none' }}>
            <Button
              size="sm"
              bg="#5294CF"
              color="white"
              _hover={{ bg: '#74B9FF' }}
            >
              Admin Portal
            </Button>
          </Link>
        </HStack>

        {/* Mobile Menu Button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onToggle}
          icon={isOpen ? <CloseIcon boxSize={3} /> : <HamburgerIcon boxSize={5} />}
          variant="ghost"
          aria-label="Toggle Navigation"
          color="white"
        />
      </Flex>

      {/* Mobile Navigation */}
      {isOpen && (
        <Box pb={4} display={{ md: 'none' }} mt={4}>
          <Flex direction="column" gap={4}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box
                color="#D5DBDB"
                fontSize="sm"
                fontWeight="500"
                cursor="pointer"
                _hover={{ color: '#5294CF' }}
              >
                Home
              </Box>
            </Link>
            <Link href="/oc-admin/login" style={{ textDecoration: 'none' }}>
              <Button
                size="sm"
                bg="#5294CF"
                color="white"
                _hover={{ bg: '#74B9FF' }}
                width="full"
              >
                Admin Portal
              </Button>
            </Link>
          </Flex>
        </Box>
      )}
    </Box>
  );
}

