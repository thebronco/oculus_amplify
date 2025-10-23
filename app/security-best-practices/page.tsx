'use client';

import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import Navbar from '@/components/Navbar';
import { getBestPracticesByFramework, getBestPracticesBySubcategory, type SecurityBestPractice } from '@/lib/api';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Checkbox,
  Divider,
  useColorModeValue,
  Collapse,
  Icon,
  Button,
} from '@chakra-ui/react';
import { FiShield, FiCheckSquare, FiInfo, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';

Amplify.configure(outputs);

// Framework data with subcategories
const FRAMEWORKS = [
  {
    name: 'NIST CSF 2.0',
    subcategories: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
    icon: '🛡️',
    color: '#4ECDC4'
  },
  {
    name: 'OWASP Top 10',
    subcategories: ['A01:2021 - Broken Access Control', 'A02:2021 - Cryptographic Failures', 'A03:2021 - Injection', 'A04:2021 - Insecure Design', 'A05:2021 - Security Misconfiguration', 'A06:2021 - Vulnerable Components', 'A07:2021 - Authentication Failures', 'A08:2021 - Software and Data Integrity Failures', 'A09:2021 - Security Logging and Monitoring Failures', 'A10:2021 - Server-Side Request Forgery'],
    icon: '🔒',
    color: '#45B7D1'
  },
  {
    name: 'Center for Internet Security (CIS)',
    subcategories: ['Basic CIS Controls'],
    icon: '🏛️',
    color: '#96CEB4'
  },
  {
    name: 'FedRAMP',
    subcategories: ['Access Control', 'Data Protection', 'Network Security'],
    icon: '🏛️',
    color: '#FFEAA7'
  },
  {
    name: 'Cloud Security Alliance (CSA)',
    subcategories: ['Cloud Governance', 'Cloud Data Security'],
    icon: '☁️',
    color: '#A8E6CF'
  },
  {
    name: 'MITRE ATT&CK Framework',
    subcategories: ['Initial Access', 'Execution', 'Persistence'],
    icon: '🎯',
    color: '#FFB6C1'
  },
  {
    name: 'Federal Information Security Modernization Act (FISMA)',
    subcategories: ['Information Security Program'],
    icon: '📋',
    color: '#DDA0DD'
  },
  {
    name: 'AWS Well-Architected Security Pillar',
    subcategories: ['Identity and Access Management', 'Data Protection', 'Infrastructure Protection'],
    icon: '☁️',
    color: '#F0E68C'
  }
];

// Utility function to get priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'red';
    case 'High': return 'orange';
    case 'Medium': return 'yellow';
    case 'Low': return 'green';
    default: return 'gray';
  }
};

// Utility function to get implementation effort color
const getEffortColor = (effort: string) => {
  switch (effort) {
    case 'Low': return 'green';
    case 'Medium': return 'yellow';
    case 'High': return 'orange';
    case 'Very High': return 'red';
    default: return 'gray';
  }
};

// Utility function to get business impact color
const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'Low': return 'green';
    case 'Medium': return 'yellow';
    case 'High': return 'orange';
    case 'Critical': return 'red';
    default: return 'gray';
  }
};

export default function SecurityBestPracticesPage() {
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [bestPractices, setBestPractices] = useState<SecurityBestPractice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  // Load best practices when framework or subcategory changes
  useEffect(() => {
    if (selectedFramework && selectedSubcategory) {
      loadBestPractices(selectedFramework, selectedSubcategory);
    } else if (selectedFramework) {
      loadBestPractices(selectedFramework);
    } else {
      setBestPractices([]);
    }
    // Clear all checkboxes when framework or subcategory changes
    setCheckedItems(new Set());
    setCollapsedItems(new Set());
  }, [selectedFramework, selectedSubcategory]);

  const loadBestPractices = async (framework: string, subcategory?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let practices: SecurityBestPractice[];
      if (subcategory) {
        practices = await getBestPracticesBySubcategory(framework, subcategory);
      } else {
        practices = await getBestPracticesByFramework(framework);
      }
      
      setBestPractices(practices);
    } catch (err) {
      console.error('Failed to load best practices:', err);
      setError('Failed to load best practices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFrameworkSelect = (framework: string) => {
    setSelectedFramework(framework);
    setSelectedSubcategory('');
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
  };

  const handleCheckboxChange = (practiceId: string) => {
    setCheckedItems(prev => {
      const newChecked = new Set(prev);
      if (newChecked.has(practiceId)) {
        newChecked.delete(practiceId);
        setCollapsedItems(prevCollapsed => {
          const newCollapsed = new Set(prevCollapsed);
          newCollapsed.delete(practiceId);
          return newCollapsed;
        });
      } else {
        newChecked.add(practiceId);
        setCollapsedItems(prevCollapsed => {
          const newCollapsed = new Set(prevCollapsed);
          newCollapsed.add(practiceId);
          return newCollapsed;
        });
      }
      return newChecked;
    });
  };

  const selectedFrameworkData = FRAMEWORKS.find(f => f.name === selectedFramework);

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
            {/* Header */}
            <Box>
              <HStack mb={2}>
                <Box
                  bg="#4ECDC4"
                  p={3}
                  borderRadius="md"
                  width="60px"
                  height="60px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="32px"
                >
                  🛡️
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="xl" color="white">
                    Security Best Practices
                  </Heading>
                  <Text color="#D5DBDB" fontSize="lg">
                    Framework-Based Security Guidelines
                  </Text>
                </VStack>
              </HStack>
              <Text color="#A0AEC0" fontSize="sm">
                Explore security best practices organized by industry frameworks and standards
              </Text>
            </Box>

            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
              {/* Left Navigation Pane */}
              <Box w={{ base: 'full', lg: '300px' }} flexShrink={0}>
                <VStack spacing={2} align="stretch">
                  <Text color="white" fontWeight="600" fontSize="sm" mb={2}>
                    Security Frameworks
                  </Text>
                  {FRAMEWORKS.map((framework) => (
                    <Box key={framework.name}>
                      <Box
                        bg={selectedFramework === framework.name ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255,255,255,0.05)'}
                        border={selectedFramework === framework.name ? '1px solid #4ECDC4' : '1px solid rgba(255,255,255,0.1)'}
                        borderRadius="md"
                        p={3}
                        cursor="pointer"
                        onClick={() => handleFrameworkSelect(framework.name)}
                        _hover={{ bg: 'rgba(78, 205, 196, 0.1)' }}
                        transition="all 0.2s"
                      >
                        <HStack spacing={3}>
                          <Text fontSize="20px">{framework.icon}</Text>
                          <VStack align="start" spacing={0} flex="1">
                            <Text color="white" fontSize="sm" fontWeight="500" noOfLines={1}>
                              {framework.name}
                            </Text>
                            <Text color="gray.400" fontSize="xs">
                              {framework.subcategories.length} subcategories
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>

                      {/* Subcategories */}
                      {selectedFramework === framework.name && (
                        <VStack spacing={1} align="stretch" mt={2} ml={4}>
                          {framework.subcategories.map((subcategory) => (
                            <Box
                              key={subcategory}
                              bg={selectedSubcategory === subcategory ? 'rgba(78, 205, 196, 0.15)' : 'rgba(255,255,255,0.03)'}
                              border={selectedSubcategory === subcategory ? '1px solid #4ECDC4' : '1px solid rgba(255,255,255,0.05)'}
                              borderRadius="sm"
                              p={2}
                              cursor="pointer"
                              onClick={() => handleSubcategorySelect(subcategory)}
                              _hover={{ bg: 'rgba(78, 205, 196, 0.08)' }}
                              transition="all 0.2s"
                            >
                              <Text color="gray.300" fontSize="xs" noOfLines={1}>
                                {subcategory}
                              </Text>
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Right Main Content Area */}
              <Box flex="1">
                {loading && (
                  <Flex justify="center" align="center" minH="200px">
                    <Spinner size="xl" color="#4ECDC4" />
                  </Flex>
                )}

                {error && (
                  <Alert status="error" bg="red.900" color="white" mb={4}>
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                {!loading && !error && bestPractices.length === 0 && selectedFramework && (
                  <Alert status="info" bg="blue.900" color="white">
                    <AlertIcon />
                    No best practices found for the selected framework{selectedSubcategory ? ` and subcategory` : ''}.
                  </Alert>
                )}

                {!loading && !error && bestPractices.length > 0 && (
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color="white">
                          {selectedFramework}
                          {selectedSubcategory && ` - ${selectedSubcategory}`}
                        </Heading>
                        <Text color="gray.400" fontSize="sm">
                          {bestPractices.length} best practice{bestPractices.length !== 1 ? 's' : ''} found
                        </Text>
                      </VStack>
                    </HStack>

                    <Divider borderColor="whiteAlpha.200" />

                    {/* Best Practices List */}
                    <VStack spacing={4} align="stretch">
                      {bestPractices.map((practice, index) => {
                        const isChecked = checkedItems.has(practice.id);
                        const isCollapsed = collapsedItems.has(practice.id);
                        
                        return (
                          <Box
                            key={practice.id}
                            bg={isChecked ? "rgba(34, 197, 94, 0.1)" : "rgba(255,255,255,0.03)"}
                            border={isChecked ? "1px solid #22C55E" : "1px solid rgba(255,255,255,0.1)"}
                            borderRadius="md"
                            p={4}
                            transition="all 0.3s ease"
                            transform={isCollapsed ? "scale(0.98)" : "scale(1)"}
                            opacity={isCollapsed ? 0.7 : 1}
                          >
                            <VStack spacing={3} align="stretch">
                              {/* Checkbox and Title */}
                              <HStack spacing={3} align="start">
                                <Box position="relative">
                                  <Checkbox
                                    size="lg"
                                    colorScheme="green"
                                    isChecked={isChecked}
                                    onChange={() => handleCheckboxChange(practice.id)}
                                    sx={{
                                      '& .chakra-checkbox__control': {
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '6px',
                                        border: isChecked ? '2px solid #22C55E' : '2px solid #4A5568',
                                        bg: isChecked ? '#22C55E' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        _hover: {
                                          borderColor: isChecked ? '#16A34A' : '#6B7280',
                                          transform: 'scale(1.05)',
                                        },
                                        _checked: {
                                          bg: '#22C55E',
                                          borderColor: '#22C55E',
                                        }
                                      },
                                      '& .chakra-checkbox__icon': {
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                      }
                                    }}
                                  />
                                  {isChecked && (
                                    <Icon
                                      as={FiCheck}
                                      position="absolute"
                                      top="50%"
                                      left="50%"
                                      transform="translate(-50%, -50%)"
                                      color="white"
                                      fontSize="12px"
                                      pointerEvents="none"
                                    />
                                  )}
                                </Box>
                                <VStack align="start" spacing={2} flex="1">
                                  <Text 
                                    color={isChecked ? "#22C55E" : "white"} 
                                    fontSize="md" 
                                    fontWeight={isChecked ? "600" : "500"} 
                                    lineHeight="1.4"
                                    textDecoration={isChecked ? "line-through" : "none"}
                                    opacity={isCollapsed ? 0.8 : 1}
                                  >
                                    {practice.best_practice_checklist_item}
                                  </Text>
                                  <Collapse in={!isCollapsed} animateOpacity>
                                    <Text color="gray.300" fontSize="sm" lineHeight="1.5">
                                      {practice.description}
                                    </Text>
                                  </Collapse>
                                </VStack>
                              </HStack>

                              {/* Metadata - Only show when not collapsed */}
                              <Collapse in={!isCollapsed} animateOpacity>
                                <HStack spacing={3} wrap="wrap">
                                  <HStack spacing={1}>
                                    <Text color="gray.400" fontSize="xs" fontWeight="500">
                                      Priority:
                                    </Text>
                                    <Badge
                                      colorScheme={getPriorityColor(practice.priority)}
                                      variant="subtle"
                                      fontSize="xs"
                                    >
                                      {practice.priority}
                                    </Badge>
                                  </HStack>
                                  <HStack spacing={1}>
                                    <Text color="gray.400" fontSize="xs" fontWeight="500">
                                      Effort:
                                    </Text>
                                    <Badge
                                      colorScheme={getEffortColor(practice.implementation_effort)}
                                      variant="subtle"
                                      fontSize="xs"
                                    >
                                      {practice.implementation_effort}
                                    </Badge>
                                  </HStack>
                                  <HStack spacing={1}>
                                    <Text color="gray.400" fontSize="xs" fontWeight="500">
                                      Impact:
                                    </Text>
                                    <Badge
                                      colorScheme={getImpactColor(practice.business_impact)}
                                      variant="subtle"
                                      fontSize="xs"
                                    >
                                      {practice.business_impact}
                                    </Badge>
                                  </HStack>
                                  <HStack spacing={1}>
                                    <Text color="gray.400" fontSize="xs" fontWeight="500">
                                      Category:
                                    </Text>
                                    <Badge
                                      colorScheme="blue"
                                      variant="outline"
                                      fontSize="xs"
                                    >
                                      {practice.category}
                                    </Badge>
                                  </HStack>
                                </HStack>
                              </Collapse>

                              {/* Progress indicator for checked items */}
                              {isChecked && (
                                <HStack spacing={2} color="#22C55E" fontSize="xs" fontWeight="500">
                                  <Icon as={FiCheck} />
                                  <Text>Completed</Text>
                                </HStack>
                              )}
                            </VStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  </VStack>
                )}

                {!loading && !error && !selectedFramework && (
                  <Flex justify="center" align="center" minH="300px">
                    <VStack spacing={4} align="center">
                      <Box
                        bg="rgba(78, 205, 196, 0.1)"
                        p={6}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="48px"
                      >
                        🛡️
                      </Box>
                      <VStack spacing={2} align="center">
                        <Text color="white" fontSize="lg" fontWeight="500">
                          Select a Security Framework
                        </Text>
                        <Text color="gray.400" fontSize="sm" textAlign="center">
                          Choose a framework from the left panel to explore security best practices
                        </Text>
                      </VStack>
                    </VStack>
                  </Flex>
                )}
              </Box>
            </Flex>
          </VStack>
        </Box>
      </Box>
    </>
  );
}
