'use client';

import Link from 'next/link';
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

interface BreadcrumbSegment {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
}

export default function Breadcrumbs({ segments }: BreadcrumbsProps) {
  return (
    <Box mb={6}>
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
        fontSize="sm"
      >
        {/* Home breadcrumb */}
        <BreadcrumbItem>
          <Link href="/" passHref>
            <BreadcrumbLink
              color="#5294CF"
              _hover={{ color: '#74B9FF', textDecoration: 'underline' }}
            >
              Home
            </BreadcrumbLink>
          </Link>
        </BreadcrumbItem>

        {/* Dynamic breadcrumbs */}
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          
          return (
            <BreadcrumbItem key={segment.href} isCurrentPage={isLast}>
              {isLast ? (
                <BreadcrumbLink color="gray.400" cursor="default">
                  {segment.name}
                </BreadcrumbLink>
              ) : (
                <Link href={segment.href} passHref>
                  <BreadcrumbLink
                    color="#5294CF"
                    _hover={{ color: '#74B9FF', textDecoration: 'underline' }}
                  >
                    {segment.name}
                  </BreadcrumbLink>
                </Link>
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </Box>
  );
}

