'use client';

import Link from 'next/link';
import { Card, CardBody, HStack, VStack, Heading, Text, Box } from '@chakra-ui/react';
import type { Category } from '@/lib/dynamodb';

interface CategoryCardProps {
  category: Category;
  basePath?: string;
}

export default function CategoryCard({ category, basePath = '' }: CategoryCardProps) {
  const href = `${basePath}/${category.slug}`;

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <Card 
        bg="#161d26"
        border="1px solid"
        borderColor="#4A5F7A"
        _hover={{ 
          bg: '#1A2332',
          borderColor: '#5A6F8A',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(82, 148, 207, 0.3)'
        }}
        cursor="pointer"
        h="140px"
        minH="140px"
        maxH="140px"
        transition="all 0.2s"
      >
        <CardBody p={4}>
          <HStack mb={3} align="start">
            <Box
              bg={category.color || '#5294CF'}
              p={2}
              borderRadius="md"
              width="40px"
              height="40px"
              minW="40px"
              minH="40px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="28px"
              flexShrink={0}
            >
              {category.icon || '📁'}
            </Box>
            <VStack align="start" spacing={1} flex="1" overflow="hidden">
              <Heading 
                size="sm" 
                color="#5294CF" 
                fontWeight="600" 
                fontSize="14px"
                noOfLines={1}
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {category.name}
              </Heading>
            </VStack>
          </HStack>
          <Text 
            fontSize="12px" 
            color="#D5DBDB" 
            lineHeight="1.4" 
            mt={1}
            noOfLines={3}
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {category.description || 'No description available'}
          </Text>
        </CardBody>
      </Card>
    </Link>
  );
}

