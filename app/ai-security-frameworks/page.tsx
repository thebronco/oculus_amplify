'use client';

import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import Navbar from '@/components/Navbar';
import { getAISecurityFrameworksByFramework, getAISecurityFrameworksBySubcategory, type AISecurityFramework } from '@/lib/api';
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

// AI Security Framework data with subcategories
const AI_FRAMEWORKS = [
  {
    name: 'OWASP Top 10 for LLM Applications',
    subcategories: [
      'LLM01:2025 Prompt Injection',
      'LLM02:2025 Sensitive Information Disclosure',
      'LLM03:2025 Supply Chain',
      'LLM04:2025 Data and Model Poisoning',
      'LLM05:2025 Improper Output Handling',
      'LLM06:2025 Excessive Agency',
      'LLM07:2025 System Prompt Leakage',
      'LLM08:2025 Vector and Embedding Weaknesses',
      'LLM09:2025 Misinformation',
      'LLM10:2025 Unbounded Consumption'
    ],
    icon: '🤖',
    color: '#4ECDC4',
    description: 'Top 10 risks and mitigations for LLM applications'
  },
  {
    name: 'CSA MAESTRO Agentic AI',
    subcategories: [
      'Agent Security',
      'Multi-Agent Coordination',
      'Autonomous Decision Making',
      'Agent Communication Security'
    ],
    icon: '🎭',
    color: '#45B7D1',
    description: 'Multi-Agent Environment Security Threat Risk and Outcome framework'
  },
  {
    name: 'NIST AI RMF',
    subcategories: [
      'Govern',
      'Map',
      'Measure',
      'Manage'
    ],
    icon: '🏛️',
    color: '#96CEB4',
    description: 'AI Risk Management Framework'
  },
  {
    name: 'MITRE ATLAS',
    subcategories: [
      'Adversarial Tactics',
      'Attack Patterns',
      'Defense Strategies'
    ],
    icon: '🎯',
    color: '#FFEAA7',
    description: 'Adversarial Threat Landscape for AI Systems'
  },
  {
    name: 'Anthropic Responsible Scaling Policy',
    subcategories: [
      'Capability Scaling',
      'Safety Measures',
      'Risk Assessment'
    ],
    icon: '⚖️',
    color: '#A8E6CF',
    description: 'Responsible Scaling Policy for AI Safety'
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

export default function AISecurityFrameworksPage() {
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [aiSecurityFrameworks, setAiSecurityFrameworks] = useState<AISecurityFramework[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  // Load AI security frameworks when framework or subcategory changes
  useEffect(() => {
    if (selectedFramework && selectedSubcategory) {
      loadAISecurityFrameworks(selectedFramework, selectedSubcategory);
    } else if (selectedFramework) {
      loadAISecurityFrameworks(selectedFramework);
    } else {
      setAiSecurityFrameworks([]);
    }
    // Clear all checkboxes when framework or subcategory changes
    setCheckedItems(new Set());
    setCollapsedItems(new Set());
  }, [selectedFramework, selectedSubcategory]);

  const loadAISecurityFrameworks = async (framework: string, subcategory?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let frameworks: AISecurityFramework[];
      if (subcategory) {
        frameworks = await getAISecurityFrameworksBySubcategory(framework, subcategory);
      } else {
        frameworks = await getAISecurityFrameworksByFramework(framework);
      }
      
      setAiSecurityFrameworks(frameworks);
    } catch (err) {
      console.error('Failed to load AI security frameworks:', err);
      setError('Failed to load AI security frameworks. Please try again later.');
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

  const handleCheckboxChange = (frameworkId: string) => {
    setCheckedItems(prev => {
      const newChecked = new Set(prev);
      if (newChecked.has(frameworkId)) {
        newChecked.delete(frameworkId);
        setCollapsedItems(prevCollapsed => {
          const newCollapsed = new Set(prevCollapsed);
          newCollapsed.delete(frameworkId);
          return newCollapsed;
        });
      } else {
        newChecked.add(frameworkId);
        setCollapsedItems(prevCollapsed => {
          const newCollapsed = new Set(prevCollapsed);
          newCollapsed.add(frameworkId);
          return newCollapsed;
        });
      }
      return newChecked;
    });
  };

  const selectedFrameworkData = AI_FRAMEWORKS.find(f => f.name === selectedFramework);

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
                  🤖
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="xl" color="white">
                    AI Security Frameworks
                  </Heading>
                  <Text color="#D5DBDB" fontSize="lg">
                    Comprehensive AI Security Guidelines
                  </Text>
                </VStack>
              </HStack>
              <Text color="#A0AEC0" fontSize="sm">
                Explore AI security controls and best practices from leading frameworks and standards
              </Text>
            </Box>

            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
              {/* Left Navigation Pane */}
              <Box w={{ base: 'full', lg: '300px' }} flexShrink={0}>
                <VStack spacing={2} align="stretch">
                  <Text color="white" fontWeight="600" fontSize="sm" mb={2}>
                    AI Security Frameworks
                  </Text>
                  {AI_FRAMEWORKS.map((framework) => (
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
                              {framework.subcategories.length} categories
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

                {!loading && !error && aiSecurityFrameworks.length === 0 && selectedFramework && (
                  <Alert status="info" bg="blue.900" color="white">
                    <AlertIcon />
                    No AI security controls found for the selected framework{selectedSubcategory ? ` and subcategory` : ''}.
                  </Alert>
                )}

                {!loading && !error && aiSecurityFrameworks.length > 0 && (
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color="white">
                          {selectedFramework}
                          {selectedSubcategory && ` - ${selectedSubcategory}`}
                        </Heading>
                        <Text color="gray.400" fontSize="sm">
                          {aiSecurityFrameworks.length} security control{aiSecurityFrameworks.length !== 1 ? 's' : ''} found
                        </Text>
                      </VStack>
                    </HStack>

                    <Divider borderColor="whiteAlpha.200" />

                    {/* AI Security Controls List */}
                    <VStack spacing={4} align="stretch">
                      {aiSecurityFrameworks.map((framework, index) => {
                        const isChecked = checkedItems.has(framework.id);
                        const isCollapsed = collapsedItems.has(framework.id);
                        
                        return (
                          <Box
                            key={framework.id}
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
                                    onChange={() => handleCheckboxChange(framework.id)}
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
                                    {framework.ai_security_control}
                                  </Text>
                                  <Collapse in={!isCollapsed} animateOpacity>
                                    <Text color="gray.300" fontSize="sm" lineHeight="1.5">
                                      {framework.description}
                                    </Text>
                                  </Collapse>
                                </VStack>
                              </HStack>

                              {/* Metadata - Only show when not collapsed */}
                              <Collapse in={!isCollapsed} animateOpacity>
                                <VStack spacing={3} align="stretch">
                                  <HStack spacing={3} wrap="wrap">
                                    <HStack spacing={1}>
                                      <Text color="gray.400" fontSize="xs" fontWeight="500">
                                        Priority:
                                      </Text>
                                      <Badge
                                        colorScheme={getPriorityColor(framework.priority)}
                                        variant="subtle"
                                        fontSize="xs"
                                      >
                                        {framework.priority}
                                      </Badge>
                                    </HStack>
                                    <HStack spacing={1}>
                                      <Text color="gray.400" fontSize="xs" fontWeight="500">
                                        Effort:
                                      </Text>
                                      <Badge
                                        colorScheme={getEffortColor(framework.implementation_effort)}
                                        variant="subtle"
                                        fontSize="xs"
                                      >
                                        {framework.implementation_effort}
                                      </Badge>
                                    </HStack>
                                    <HStack spacing={1}>
                                      <Text color="gray.400" fontSize="xs" fontWeight="500">
                                        Impact:
                                      </Text>
                                      <Badge
                                        colorScheme={getImpactColor(framework.business_impact)}
                                        variant="subtle"
                                        fontSize="xs"
                                      >
                                        {framework.business_impact}
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
                                        {framework.category}
                                      </Badge>
                                    </HStack>
                                  </HStack>

                                  {/* Additional AI-specific information */}
                                  <VStack spacing={2} align="stretch">
                                    <HStack spacing={4}>
                                      <Box flex="1">
                                        <Text color="#5294CF" fontSize="xs" fontWeight="600" mb={1}>
                                          Threat Vector
                                        </Text>
                                        <Text color="gray.300" fontSize="xs">
                                          {framework.threat_vector}
                                        </Text>
                                      </Box>
                                      <Box flex="1">
                                        <Text color="#5294CF" fontSize="xs" fontWeight="600" mb={1}>
                                          Compliance
                                        </Text>
                                        <Text color="gray.300" fontSize="xs">
                                          {framework.compliance_requirement}
                                        </Text>
                                      </Box>
                                    </HStack>
                                    <Box>
                                      <Text color="#5294CF" fontSize="xs" fontWeight="600" mb={1}>
                                        Mitigation Strategy
                                      </Text>
                                      <Text color="gray.300" fontSize="xs">
                                        {framework.mitigation_strategy}
                                      </Text>
                                    </Box>
                                  </VStack>
                                </VStack>
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
                        🤖
                      </Box>
                      <VStack spacing={2} align="center">
                        <Text color="white" fontSize="lg" fontWeight="500">
                          Select an AI Security Framework
                        </Text>
                        <Text color="gray.400" fontSize="sm" textAlign="center">
                          Choose a framework from the left panel to explore AI security controls and best practices
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
