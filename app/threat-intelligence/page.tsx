'use client';

import { useState, useEffect, useCallback } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import Navbar from '@/components/Navbar';
import { getVulnerabilities, getVulnerabilitiesTotalCount, type VulnerabilityFilters } from '@/lib/api';
import { type Vulnerability } from '@/lib/types';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Tooltip,
  Flex,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
  Skeleton,
  SkeletonText,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FiSearch, FiFilter, FiExternalLink, FiInfo } from 'react-icons/fi';

Amplify.configure(outputs);

// Utility function to truncate text
const truncateText = (text: string, maxLength: number = 15): string => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
};

// Utility function to format date
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Loading skeleton component
const TableSkeleton = () => (
  <TableContainer>
    <Table variant="simple" size="sm">
      <Thead>
        <Tr>
          <Th><Skeleton height="20px" /></Th>
          <Th><Skeleton height="20px" /></Th>
          <Th><Skeleton height="20px" /></Th>
          <Th><Skeleton height="20px" /></Th>
          <Th><Skeleton height="20px" /></Th>
          <Th><Skeleton height="20px" /></Th>
          <Th><Skeleton height="20px" /></Th>
          <Th><Skeleton height="20px" /></Th>
          <Th><Skeleton height="20px" /></Th>
          <Th><Skeleton height="20px" /></Th>
        </Tr>
      </Thead>
      <Tbody>
        {Array.from({ length: 10 }).map((_, i) => (
          <Tr key={i}>
            <Td><Skeleton height="16px" /></Td>
            <Td><Skeleton height="16px" /></Td>
            <Td><Skeleton height="16px" /></Td>
            <Td><Skeleton height="16px" /></Td>
            <Td><Skeleton height="16px" /></Td>
            <Td><Skeleton height="16px" /></Td>
            <Td><Skeleton height="16px" /></Td>
            <Td><Skeleton height="16px" /></Td>
            <Td><Skeleton height="16px" /></Td>
            <Td><Skeleton height="16px" /></Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </TableContainer>
);

export default function ThreatIntelligencePage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  
  // Column width state - optimized for no horizontal scroll
  const [columnWidths, setColumnWidths] = useState({
    cveID: 100,
    vendorname: 120,
    vulnerabilityName: 150,
    dateAdded: 90,
    shortDescription: 180,
    requiredAction: 150,
    dueDate: 90,
    knownRansomwareCampaignUse: 110,
    notes: 120,
    cwes: 70,
  });
  
  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<VulnerabilityFilters>({
    limit: 50,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [ransomwareToggle, setRansomwareToggle] = useState(false);
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null);

  // Sorting function

  // Handle column resize
  const handleMouseDown = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingColumn(column);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizingColumn) return;
    
    const deltaX = e.movementX;
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: Math.max(60, prev[resizingColumn as keyof typeof prev] + deltaX)
    }));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizingColumn(null);
  };

  // Add event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, resizingColumn]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        cveId: searchTerm || undefined,
        vendor: vendorFilter || undefined,
        ransomwareCampaign: ransomwareToggle ? 'Known' : undefined,
        lastEvaluatedKey: undefined, // Reset pagination when filters change
      }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, vendorFilter, ransomwareToggle]);

  // Fetch vulnerabilities
  const fetchVulnerabilities = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setVulnerabilities([]);
        setLastEvaluatedKey(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const result = await getVulnerabilities({
        ...filters,
        lastEvaluatedKey: reset ? undefined : lastEvaluatedKey,
      });

      // Get total count (only on reset to avoid unnecessary API calls)
      if (reset) {
        const totalCountResult = await getVulnerabilitiesTotalCount(filters);
        setTotalCount(totalCountResult);
      }

      if (reset) {
        setVulnerabilities(result.items);
      } else {
        setVulnerabilities(prev => [...prev, ...result.items]);
      }

      setLastEvaluatedKey(result.lastEvaluatedKey);
      setHasMore(!!result.lastEvaluatedKey);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch vulnerabilities:', err);
      setError('Failed to load vulnerabilities. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load vulnerabilities',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, lastEvaluatedKey, toast]);

  // Initial load
  useEffect(() => {
    fetchVulnerabilities(true);
  }, [filters]);

  // Load more function
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchVulnerabilities(false);
    }
  };

  // Handle vulnerability click
  const handleVulnerabilityClick = (vuln: Vulnerability) => {
    setSelectedVulnerability(vuln);
    onOpen();
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setVendorFilter('');
    setRansomwareToggle(false);
  };

  return (
    <>
      <Navbar />
      <Box px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }}>
        <VStack spacing={6} align="stretch" maxW="1400px" mx="auto">
          {/* Header with Filters */}
          <HStack spacing={6} align="start" justify="space-between">
            {/* Left side - Header Info */}
            <Box>
              <HStack mb={2}>
                <Box
                  bg="#FFEAA7"
                  p={3}
                  borderRadius="md"
                  width="60px"
                  height="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="32px"
                >
                  🔍
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="xl" color="white">
                    Threat Intelligence
                  </Heading>
                  <Text color="#D5DBDB" fontSize="lg">
                    CISA Known Exploitable Vulnerabilities
                  </Text>
                </VStack>
              </HStack>
              <Text color="#A0AEC0" fontSize="sm">
                Find vetted threat indicators and guidance for proactive defense
              </Text>
            </Box>

            {/* Right side - Filters */}
            <VStack spacing={3} align="stretch" minW="400px" pt={2}>
              <HStack spacing={4} wrap="wrap" align="center">
                <InputGroup w="180px" minW="150px">
                  <InputLeftElement>
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by CVE ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg="#2D3748"
                    borderColor="#4A5F7A"
                    color="white"
                    _placeholder={{ color: 'gray.400' }}
                    _focus={{ borderColor: '#5294CF' }}
                    size="sm"
                  />
                </InputGroup>

                <Input
                  placeholder="Filter by vendor..."
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  bg="#2D3748"
                  borderColor="#4A5F7A"
                  color="white"
                  _placeholder={{ color: 'gray.400' }}
                  _focus={{ borderColor: '#5294CF' }}
                  w="180px"
                  minW="150px"
                  size="sm"
                />
              </HStack>

              <FormControl display="flex" alignItems="center" w="fit-content">
                <FormLabel htmlFor="ransomware-toggle" mb="0" color="gray.300" fontSize="sm" whiteSpace="nowrap">
                  Known Ransomware
                </FormLabel>
                <Switch
                  id="ransomware-toggle"
                  isChecked={ransomwareToggle}
                  onChange={(e) => setRansomwareToggle(e.target.checked)}
                  colorScheme="blue"
                  size="md"
                  sx={{
                    '& .chakra-switch__track': {
                      bg: ransomwareToggle ? '#3182CE' : '#4A5568',
                      _checked: {
                        bg: '#3182CE',
                      },
                    },
                    '& .chakra-switch__thumb': {
                      bg: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      _checked: {
                        transform: 'translateX(20px)',
                      },
                    },
                  }}
                />
              </FormControl>
            </VStack>
          </HStack>

          {/* Results Summary */}
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <Text color="#A0AEC0" fontSize="sm">
                {loading ? 'Loading...' : `${totalCount} vulnerabilities found`}
              </Text>
            </HStack>
            {vulnerabilities.length > 0 && (
              <Badge colorScheme="blue" variant="subtle">
                {vulnerabilities.length} displayed of {totalCount} total
              </Badge>
            )}
          </HStack>

          {/* Error State */}
          {error && (
            <Alert status="error" bg="red.900" color="white">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Table */}
          <Box
            bg="rgba(255,255,255,0.05)"
            borderRadius="lg"
            p={4}
            border="1px solid"
            borderColor="whiteAlpha.200"
            overflow="hidden"
            css={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              '-ms-overflow-style': 'none',
              'scrollbar-width': 'none',
            }}
          >
            {loading ? (
              <TableSkeleton />
            ) : vulnerabilities.length === 0 ? (
              <Alert status="info" bg="blue.900" color="white">
                <AlertIcon />
                No vulnerabilities found matching your criteria.
              </Alert>
            ) : (
              <TableContainer maxH="600px" overflowY="auto" css={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                '-ms-overflow-style': 'none',
                'scrollbar-width': 'none',
              }}>
                <Table variant="simple" size="sm" w="100%">
                  <Thead position="sticky" top={0} bg="#2D3748" zIndex={1}>
                    <Tr>
                      <Th 
                        color="white" 
                        fontSize="xs" 
                        fontWeight="600" 
                        w={`${columnWidths.cveID}px`}
                        position="relative"
                      >
                        <HStack justify="space-between">
                          <Text>CVE</Text>
                          <Box
                            w="4px"
                            h="full"
                            bg="transparent"
                            _hover={{ bg: '#5294CF' }}
                            cursor="col-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'cveID')}
                            position="absolute"
                            right="0"
                            top="0"
                          />
                        </HStack>
                      </Th>
                      <Th 
                        color="white" 
                        fontSize="xs" 
                        fontWeight="600" 
                        w={`${columnWidths.vendorname}px`}
                        position="relative"
                      >
                        <HStack justify="space-between">
                          <Text>Vendor</Text>
                          <Box
                            w="4px"
                            h="full"
                            bg="transparent"
                            _hover={{ bg: '#5294CF' }}
                            cursor="col-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'vendorname')}
                            position="absolute"
                            right="0"
                            top="0"
                          />
                        </HStack>
                      </Th>
                      <Th 
                        color="white" 
                        fontSize="xs" 
                        fontWeight="600" 
                        w={`${columnWidths.vulnerabilityName}px`}
                        position="relative"
                      >
                        <HStack justify="space-between">
                          <Text>Vuln</Text>
                          <Box
                            w="4px"
                            h="full"
                            bg="transparent"
                            _hover={{ bg: '#5294CF' }}
                            cursor="col-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'vulnerabilityName')}
                            position="absolute"
                            right="0"
                            top="0"
                          />
                        </HStack>
                      </Th>
                      <Th 
                        color="white" 
                        fontSize="xs" 
                        fontWeight="600" 
                        w={`${columnWidths.dateAdded}px`}
                        position="relative"
                      >
                        <HStack justify="space-between">
                          <Text>Added</Text>
                          <Box
                            w="4px"
                            h="full"
                            bg="transparent"
                            _hover={{ bg: '#5294CF' }}
                            cursor="col-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'dateAdded')}
                            position="absolute"
                            right="0"
                            top="0"
                          />
                        </HStack>
                      </Th>
                      <Th 
                        color="white" 
                        fontSize="xs" 
                        fontWeight="600" 
                        w={`${columnWidths.shortDescription}px`}
                        position="relative"
                      >
                        <HStack justify="space-between">
                          <Text>Desc</Text>
                          <Box
                            w="4px"
                            h="full"
                            bg="transparent"
                            _hover={{ bg: '#5294CF' }}
                            cursor="col-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'shortDescription')}
                            position="absolute"
                            right="0"
                            top="0"
                          />
                        </HStack>
                      </Th>
                      <Th 
                        color="white" 
                        fontSize="xs" 
                        fontWeight="600" 
                        w={`${columnWidths.requiredAction}px`}
                        position="relative"
                      >
                        <HStack justify="space-between">
                          <Text>Action</Text>
                          <Box
                            w="4px"
                            h="full"
                            bg="transparent"
                            _hover={{ bg: '#5294CF' }}
                            cursor="col-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'requiredAction')}
                            position="absolute"
                            right="0"
                            top="0"
                          />
                        </HStack>
                      </Th>
                      <Th 
                        color="white" 
                        fontSize="xs" 
                        fontWeight="600" 
                        w={`${columnWidths.dueDate}px`}
                        position="relative"
                      >
                        <HStack justify="space-between">
                          <Text>Due</Text>
                          <Box
                            w="4px"
                            h="full"
                            bg="transparent"
                            _hover={{ bg: '#5294CF' }}
                            cursor="col-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'dueDate')}
                            position="absolute"
                            right="0"
                            top="0"
                          />
                        </HStack>
                      </Th>
                      <Th 
                        color="white" 
                        fontSize="xs" 
                        fontWeight="600" 
                        w={`${columnWidths.knownRansomwareCampaignUse}px`}
                        position="relative"
                      >
                        <HStack justify="space-between">
                          <Text>Ransom</Text>
                          <Box
                            w="4px"
                            h="full"
                            bg="transparent"
                            _hover={{ bg: '#5294CF' }}
                            cursor="col-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'knownRansomwareCampaignUse')}
                            position="absolute"
                            right="0"
                            top="0"
                          />
                        </HStack>
                      </Th>
                      <Th 
                        color="white" 
                        fontSize="xs" 
                        fontWeight="600" 
                        w={`${columnWidths.notes}px`}
                        position="relative"
                      >
                        <HStack justify="space-between">
                          <Text>Notes</Text>
                          <Box
                            w="4px"
                            h="full"
                            bg="transparent"
                            _hover={{ bg: '#5294CF' }}
                            cursor="col-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'notes')}
                            position="absolute"
                            right="0"
                            top="0"
                          />
                        </HStack>
                      </Th>
                      <Th 
                        color="white" 
                        fontSize="xs" 
                        fontWeight="600" 
                        w={`${columnWidths.cwes}px`}
                        position="relative"
                      >
                        <HStack justify="space-between">
                          <Text>CWEs</Text>
                          <Box
                            w="4px"
                            h="full"
                            bg="transparent"
                            _hover={{ bg: '#5294CF' }}
                            cursor="col-resize"
                            onMouseDown={(e) => handleMouseDown(e, 'cwes')}
                            position="absolute"
                            right="0"
                            top="0"
                          />
                        </HStack>
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vulnerabilities.map((vuln) => (
                      <Tr
                        key={vuln.cveID}
                        _hover={{ bg: 'whiteAlpha.50' }}
                        cursor="pointer"
                        onClick={() => handleVulnerabilityClick(vuln)}
                      >
                        <Td w={`${columnWidths.cveID}px`}>
                          <Tooltip label={vuln.cveID} hasArrow>
                            <HStack>
                              <Text color="#5294CF" fontWeight="600" fontSize="xs">
                                {truncateText(vuln.cveID, 15)}
                              </Text>
                              <Icon as={FiExternalLink} color="gray.400" boxSize={3} />
                            </HStack>
                          </Tooltip>
                        </Td>
                        <Td w={`${columnWidths.vendorname}px`}>
                          <Tooltip label={`${vuln.vendorname} - ${vuln.vendorproduct}`} hasArrow>
                            <VStack align="start" spacing={0}>
                              <Text color="white" fontSize="xs" fontWeight="500" noOfLines={1}>
                                {truncateText(vuln.vendorname, 15)}
                              </Text>
                              <Text color="gray.400" fontSize="xs" noOfLines={1}>
                                {truncateText(vuln.vendorproduct, 15)}
                              </Text>
                            </VStack>
                          </Tooltip>
                        </Td>
                        <Td w={`${columnWidths.vulnerabilityName}px`}>
                          <Tooltip label={vuln.vulnerabilityName} hasArrow>
                            <Text color="white" fontSize="xs" noOfLines={1}>
                              {truncateText(vuln.vulnerabilityName, 15)}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td w={`${columnWidths.dateAdded}px`}>
                          <Tooltip label={formatDate(vuln.dateAdded)} hasArrow>
                            <Text color="gray.300" fontSize="xs">
                              {truncateText(formatDate(vuln.dateAdded), 15)}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td w={`${columnWidths.shortDescription}px`}>
                          <Tooltip label={vuln.shortDescription} hasArrow>
                            <Text color="gray.300" fontSize="xs" noOfLines={1}>
                              {truncateText(vuln.shortDescription, 15)}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td w={`${columnWidths.requiredAction}px`}>
                          <Tooltip label={vuln.requiredAction} hasArrow>
                            <Text color="gray.300" fontSize="xs" noOfLines={1}>
                              {truncateText(vuln.requiredAction, 15)}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td w={`${columnWidths.dueDate}px`}>
                          <Tooltip label={formatDate(vuln.dueDate)} hasArrow>
                            <Text color="gray.300" fontSize="xs">
                              {truncateText(formatDate(vuln.dueDate), 15)}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td w={`${columnWidths.knownRansomwareCampaignUse}px`}>
                          <Tooltip label={vuln.knownRansomwareCampaignUse} hasArrow>
                            <Badge
                              colorScheme={vuln.knownRansomwareCampaignUse === 'Unknown' ? 'gray' : 'red'}
                              variant="subtle"
                              fontSize="xs"
                            >
                              {truncateText(vuln.knownRansomwareCampaignUse, 15)}
                            </Badge>
                          </Tooltip>
                        </Td>
                        <Td w={`${columnWidths.notes}px`}>
                          <Tooltip label={vuln.notes || 'N/A'} hasArrow>
                            <Text color="gray.300" fontSize="xs" noOfLines={1}>
                              {truncateText(vuln.notes || 'N/A', 15)}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td w={`${columnWidths.cwes}px`}>
                          <Tooltip label={vuln.cwes || 'N/A'} hasArrow>
                            <Text color="gray.300" fontSize="xs">
                              {truncateText(vuln.cwes || '', 15)}
                            </Text>
                          </Tooltip>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}

            {/* Load More Button */}
            {hasMore && !loading && (
              <Flex justify="center" mt={4}>
                <Button
                  onClick={loadMore}
                  isLoading={loadingMore}
                  loadingText="Loading more..."
                  colorScheme="blue"
                  variant="outline"
                  size="sm"
                >
                  Load More
                </Button>
              </Flex>
            )}
          </Box>
        </VStack>
      </Box>

      {/* Vulnerability Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="#2D3748" color="white">
          <ModalHeader>
            <HStack>
              <Icon as={FiInfo} color="#5294CF" />
              <Text>Vulnerability Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedVulnerability && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text color="#5294CF" fontWeight="600" fontSize="lg">
                    {selectedVulnerability.cveID}
                  </Text>
                  <Text color="white" fontSize="md" fontWeight="500">
                    {selectedVulnerability.vulnerabilityName}
                  </Text>
                </Box>

                <Divider />

                <VStack spacing={3} align="stretch">
                  <Box>
                    <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                      Vendor & Product
                    </Text>
                    <Text color="white" fontSize="sm">
                      {selectedVulnerability.vendorname} - {selectedVulnerability.vendorproduct}
                    </Text>
                  </Box>

                  <Box>
                    <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                      Description
                    </Text>
                    <Text color="white" fontSize="sm">
                      {selectedVulnerability.shortDescription}
                    </Text>
                  </Box>

                  <Box>
                    <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                      Required Action
                    </Text>
                    <Text color="white" fontSize="sm">
                      {selectedVulnerability.requiredAction}
                    </Text>
                  </Box>

                  <HStack spacing={6}>
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        Date Added
                      </Text>
                      <Text color="white" fontSize="sm">
                        {formatDate(selectedVulnerability.dateAdded)}
                      </Text>
                    </Box>
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        Due Date
                      </Text>
                      <Text color="white" fontSize="sm">
                        {formatDate(selectedVulnerability.dueDate)}
                      </Text>
                    </Box>
                  </HStack>

                  {selectedVulnerability.notes && (
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        Notes
                      </Text>
                      <Text color="white" fontSize="sm">
                        {selectedVulnerability.notes}
                      </Text>
                    </Box>
                  )}

                  <HStack spacing={6}>
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        Ransomware Campaign
                      </Text>
                      <Badge
                        colorScheme={selectedVulnerability.knownRansomwareCampaignUse === 'Unknown' ? 'gray' : 'red'}
                        variant="subtle"
                      >
                        {selectedVulnerability.knownRansomwareCampaignUse}
                      </Badge>
                    </Box>
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        CWE
                      </Text>
                      <Text color="white" fontSize="sm">
                        {selectedVulnerability.cwes}
                      </Text>
                    </Box>
                  </HStack>
                </VStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
