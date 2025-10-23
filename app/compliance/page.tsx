'use client';

import { useState, useEffect, useCallback } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import Navbar from '@/components/Navbar';
import { getComplianceChecklist, getComplianceChecklistTotalCount, type ComplianceFilters } from '@/lib/api';
import { type ComplianceChecklist } from '@/lib/types';
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
import { FiSearch, FiFilter, FiExternalLink, FiInfo, FiCheckCircle, FiClock, FiXCircle, FiAlertCircle } from 'react-icons/fi';

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
          </Tr>
        ))}
      </Tbody>
    </Table>
  </TableContainer>
);

export default function CompliancePage() {
  const [complianceItems, setComplianceItems] = useState<ComplianceChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState<ComplianceFilters>({
    limit: 50,
  });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<ComplianceChecklist | null>(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        category: categoryFilter || undefined,
        compliance_standard: frameworkFilter || undefined,
        lastEvaluatedKey: undefined, // Reset pagination when filters change
      }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [categoryFilter, frameworkFilter]);

  // Fetch compliance items
  const fetchComplianceItems = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setComplianceItems([]);
        setLastEvaluatedKey(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const result = await getComplianceChecklist({
        ...filters,
        lastEvaluatedKey: reset ? undefined : lastEvaluatedKey,
      });

      // Get total count (only on reset to avoid unnecessary API calls)
      if (reset) {
        const totalCountResult = await getComplianceChecklistTotalCount(filters);
        setTotalCount(totalCountResult);
      }

      if (reset) {
        setComplianceItems(result.items);
      } else {
        setComplianceItems(prev => [...prev, ...result.items]);
      }

      setLastEvaluatedKey(result.lastEvaluatedKey);
      setHasMore(!!result.lastEvaluatedKey);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch compliance items:', err);
      setError('Failed to load compliance items. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to load compliance items',
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
    fetchComplianceItems(true);
  }, [filters]);

  // Load more function
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchComplianceItems(false);
    }
  };

  // Handle item click
  const handleItemClick = (item: ComplianceChecklist) => {
    setSelectedItem(item);
    onOpen();
  };

  // Clear filters
  const clearFilters = () => {
    setCategoryFilter('');
    setFrameworkFilter('');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'In Progress': return 'blue';
      case 'Failed': return 'red';
      case 'Not Started': return 'gray';
      default: return 'gray';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'red';
      case 'High': return 'orange';
      case 'Medium': return 'yellow';
      case 'Low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <>
      <Navbar />
      <Box px={{ base: 4, md: 8 }} py={{ base: 4, md: 6 }}>
        <Box 
          bg="rgba(255,255,255,0.05)" 
          borderRadius="lg" 
          p={{ base: 4, md: 6 }} 
          border="1px solid" 
          borderColor="whiteAlpha.200"
          maxW="1400px" 
          mx="auto"
        >
          <VStack spacing={6} align="stretch">
          {/* Header with Filters */}
          <HStack spacing={6} align="start" justify="space-between">
            {/* Left side - Header Info */}
            <Box>
              <HStack mb={2}>
                <Box
                  bg="#96CEB4"
                  p={3}
                  borderRadius="md"
                  width="60px"
                  height="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="32px"
                >
                  📊
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="xl" color="white">
                    Compliance Center
                  </Heading>
                  <Text color="#D5DBDB" fontSize="lg">
                    Regulatory Compliance Framework
                  </Text>
                </VStack>
              </HStack>
              <Text color="#A0AEC0" fontSize="sm">
                Track and manage security compliance requirements across frameworks
              </Text>
            </Box>

            {/* Right side - Filters */}
            <VStack spacing={3} align="stretch" minW="400px" pt={2}>
              <HStack spacing={4} wrap="wrap" align="center">
                <Select
                  placeholder="Compliance Type"
                  value={frameworkFilter}
                  onChange={(e) => setFrameworkFilter(e.target.value)}
                  bg="#2D3748"
                  borderColor="#4A5F7A"
                  color="white"
                  _focus={{ borderColor: '#5294CF' }}
                  _hover={{ borderColor: '#5294CF' }}
                  w="180px"
                  size="sm"
                  sx={{
                    '& option': {
                      bg: '#2D3748',
                      color: 'white',
                    },
                    '&:focus option': {
                      bg: '#2D3748',
                      color: 'white',
                    }
                  }}
                >
                  <option value="NIST CSF">NIST CSF</option>
                  <option value="SOC 2 Type 2">SOC 2 Type 2</option>
                  <option value="HITRUST">HITRUST</option>
                  <option value="ISO 27001">ISO 27001</option>
                  <option value="PCI DSS">PCI DSS</option>
                </Select>

                <Select
                  placeholder="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  bg="#2D3748"
                  borderColor="#4A5F7A"
                  color="white"
                  _focus={{ borderColor: '#5294CF' }}
                  _hover={{ borderColor: '#5294CF' }}
                  w="180px"
                  size="sm"
                  sx={{
                    '& option': {
                      bg: '#2D3748',
                      color: 'white',
                    },
                    '&:focus option': {
                      bg: '#2D3748',
                      color: 'white',
                    }
                  }}
                >
                  <option value="Access Management">Access Management</option>
                  <option value="Data Protection">Data Protection</option>
                  <option value="Network Security">Network Security</option>
                  <option value="Vulnerability Management">Vulnerability Management</option>
                  <option value="Incident Response">Incident Response</option>
                  <option value="Physical Security">Physical Security</option>
                  <option value="Business Continuity">Business Continuity</option>
                  <option value="Human Resources Security">Human Resources Security</option>
                  <option value="Asset Management">Asset Management</option>
                  <option value="Monitoring & Detection">Monitoring & Detection</option>
                </Select>

                <Button
                  size="sm"
                  variant="ghost"
                  color="#5294CF"
                  onClick={clearFilters}
                  _hover={{ bg: 'whiteAlpha.100' }}
                  fontSize="sm"
                >
                  Clear All
                </Button>
              </HStack>
            </VStack>
          </HStack>

          {/* Results Summary */}
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <Text color="#A0AEC0" fontSize="sm">
                {loading ? 'Loading...' : `${totalCount} compliance items found`}
              </Text>
            </HStack>
            {complianceItems.length > 0 && (
              <Badge colorScheme="blue" variant="subtle">
                {complianceItems.length} displayed of {totalCount} total
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
            ) : complianceItems.length === 0 ? (
              <Alert status="info" bg="blue.900" color="white">
                <AlertIcon />
                No compliance items found matching your criteria.
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
                      <Th color="white" fontSize="xs" fontWeight="600">Control</Th>
                      <Th color="white" fontSize="xs" fontWeight="600">Category</Th>
                      <Th color="white" fontSize="xs" fontWeight="600">Standard</Th>
                      <Th color="white" fontSize="xs" fontWeight="600">Priority</Th>
                      <Th color="white" fontSize="xs" fontWeight="600">Status</Th>
                      <Th color="white" fontSize="xs" fontWeight="600">Type</Th>
                      <Th color="white" fontSize="xs" fontWeight="600">Effort</Th>
                      <Th color="white" fontSize="xs" fontWeight="600">Impact</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {complianceItems.map((item) => (
                      <Tr
                        key={item.id}
                        _hover={{ bg: 'whiteAlpha.50' }}
                        cursor="pointer"
                        onClick={() => handleItemClick(item)}
                      >
                        <Td>
                          <Tooltip label={item.control} hasArrow>
                            <Text color="white" fontSize="xs" fontWeight="500" noOfLines={1}>
                              {truncateText(item.control, 20)}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td>
                          <Tooltip label={item.category} hasArrow>
                            <Text color="gray.300" fontSize="xs" noOfLines={1}>
                              {truncateText(item.category, 15)}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td>
                          <Tooltip label={item.compliance_standard} hasArrow>
                            <Text color="#5294CF" fontSize="xs" fontWeight="500">
                              {truncateText(item.compliance_standard, 12)}
                            </Text>
                          </Tooltip>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getPriorityColor(item.priority)}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {item.priority}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(item.status)}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {item.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Text color="gray.300" fontSize="xs">
                            {item.control_type}
                          </Text>
                        </Td>
                        <Td>
                          <Text color="gray.300" fontSize="xs">
                            {item.implementation_effort}
                          </Text>
                        </Td>
                        <Td>
                          <Text color="gray.300" fontSize="xs">
                            {item.business_impact}
                          </Text>
                        </Td>
                        <Td>
                          <Icon as={FiExternalLink} color="gray.400" boxSize={3} />
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

      {/* Compliance Item Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="#2D3748" color="white">
          <ModalHeader>
            <HStack>
              <Icon as={FiInfo} color="#5294CF" />
              <Text>Compliance Item Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedItem && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text color="#5294CF" fontWeight="600" fontSize="lg">
                    {selectedItem.control}
                  </Text>
                  <Text color="white" fontSize="md" fontWeight="500">
                    {selectedItem.description}
                  </Text>
                </Box>

                <Divider />

                <VStack spacing={3} align="stretch">
                  <HStack spacing={6}>
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        Category
                      </Text>
                      <Text color="white" fontSize="sm">
                        {selectedItem.category}
                      </Text>
                    </Box>
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        Compliance Standard
                      </Text>
                      <Text color="white" fontSize="sm">
                        {selectedItem.compliance_standard}
                      </Text>
                    </Box>
                  </HStack>

                  <HStack spacing={6}>
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        Priority
                      </Text>
                      <Badge
                        colorScheme={getPriorityColor(selectedItem.priority)}
                        variant="subtle"
                      >
                        {selectedItem.priority}
                      </Badge>
                    </Box>
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        Status
                      </Text>
                      <Badge
                        colorScheme={getStatusColor(selectedItem.status)}
                        variant="subtle"
                      >
                        {selectedItem.status}
                      </Badge>
                    </Box>
                  </HStack>

                  <HStack spacing={6}>
                  </HStack>

                  {selectedItem.evidence && (
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        Evidence
                      </Text>
                      <Text color="white" fontSize="sm">
                        {selectedItem.evidence}
                      </Text>
                    </Box>
                  )}

                  {selectedItem.notes && (
                    <Box>
                      <Text color="#5294CF" fontSize="sm" fontWeight="600" mb={1}>
                        Notes
                      </Text>
                      <Text color="white" fontSize="sm">
                        {selectedItem.notes}
                      </Text>
                    </Box>
                  )}
                </VStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
        </Box>
    </>
  );
}
