'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Switch,
  Icon,
  useToast,
  Divider,
  Badge,
  SimpleGrid,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FiSettings, FiShield, FiGlobe, FiDatabase, FiClock, FiExternalLink, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { getCurrentUser, updatePassword } from 'aws-amplify/auth';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

export default function SettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();
  
  // Password change state
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Site settings state (these would normally be stored in DynamoDB or similar)
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'OculusCyber Knowledge Base',
    siteDescription: 'A comprehensive knowledge base for cybersecurity resources and guides',
    maintenanceMode: false,
    allowRegistration: true,
  });

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would save these to DynamoDB or Parameter Store
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error Saving Settings',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all password fields.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'New password and confirm password must match.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword({ oldPassword, newPassword });
      
      toast({
        title: 'Password Changed Successfully!',
        description: 'Your password has been updated.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      // Clear form and close modal
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onPasswordModalClose();
    } catch (error: any) {
      let errorMessage = 'Failed to change password.';
      
      if (error.message.includes('Incorrect username or password')) {
        errorMessage = 'Current password is incorrect.';
      } else if (error.message.includes('password')) {
        errorMessage = error.message;
      }

      toast({
        title: 'Password Change Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AuthGuard>
      <AdminLayout>
        <VStack align="stretch" spacing={6}>
        <Box>
            <Heading size="xl" color="white" mb={2}>
            Settings
          </Heading>
          <Text color="gray.400">
              Manage system configuration and preferences
            </Text>
          </Box>

          {/* System Information */}
          <Card
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <CardHeader>
              <HStack spacing={2}>
                <Icon as={FiDatabase} color="#5294CF" boxSize={5} />
                <Heading size="md" color="white">
                  System Information
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Environment
                  </Text>
                  <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                    Production
                  </Badge>
                </Box>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    AWS Region
                  </Text>
                  <Text color="white" fontWeight="medium">
                    us-east-1
                  </Text>
                </Box>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Backend Service
                  </Text>
                  <Text color="white" fontWeight="medium">
                    AWS Amplify Gen 2
                  </Text>
                </Box>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Database
                  </Text>
                  <Text color="white" fontWeight="medium">
                    DynamoDB
                  </Text>
                </Box>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Authentication
                  </Text>
                  <Text color="white" fontWeight="medium">
                    AWS Cognito
                  </Text>
                </Box>
                <Box>
                  <Text color="gray.400" fontSize="sm" mb={1}>
                    Deployment
                  </Text>
                  <HStack spacing={2}>
                    <Icon as={FiClock} color="gray.400" boxSize={3} />
                    <Text color="gray.300" fontSize="sm">
                      {new Date().toLocaleDateString()}
                    </Text>
                  </HStack>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Site Settings */}
          <Card
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <CardHeader>
              <HStack spacing={2}>
                <Icon as={FiGlobe} color="#5294CF" boxSize={5} />
                <Heading size="md" color="white">
                  Site Configuration
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel color="gray.300">Site Name</FormLabel>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _hover={{ borderColor: '#5294CF' }}
                    _focus={{ borderColor: '#5294CF', boxShadow: '0 0 0 1px #5294CF' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300">Site Description</FormLabel>
                  <Textarea
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    color="white"
                    rows={3}
                    _hover={{ borderColor: '#5294CF' }}
                    _focus={{ borderColor: '#5294CF', boxShadow: '0 0 0 1px #5294CF' }}
                  />
                </FormControl>

                <Divider borderColor="whiteAlpha.200" />

                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <FormLabel color="gray.300" mb={1}>
                      Maintenance Mode
                    </FormLabel>
                    <Text color="gray.500" fontSize="sm">
                      Temporarily disable public access to the site
                    </Text>
                  </Box>
                  <Switch
                    isChecked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                    colorScheme="orange"
                    size="lg"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <FormLabel color="gray.300" mb={1}>
                      Allow User Registration
                    </FormLabel>
                    <Text color="gray.500" fontSize="sm">
                      Enable new users to create accounts
                    </Text>
                  </Box>
                  <Switch
                    isChecked={settings.allowRegistration}
                    onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                    colorScheme="blue"
                    size="lg"
                  />
                </FormControl>

                <Button
                  colorScheme="blue"
                  bg="#5294CF"
                  _hover={{ bg: '#74B9FF' }}
                  onClick={handleSaveSettings}
                  isLoading={loading}
                  loadingText="Saving..."
                  size="lg"
                  leftIcon={<Icon as={FiSettings} />}
                >
                  Save Settings
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Admin Profile */}
          <Card
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <CardHeader>
              <HStack spacing={2}>
                <Icon as={FiShield} color="#5294CF" boxSize={5} />
                <Heading size="md" color="white">
                  Admin Profile
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text color="gray.400" fontSize="sm" mb={1}>
                      Email Address
                    </Text>
                    <Text color="white" fontWeight="medium">
                      {currentUser?.signInDetails?.loginId || 'capitalcookdc@gmail.com'}
                    </Text>
                  </Box>
                  <Badge colorScheme="red" fontSize="sm" px={3} py={1}>
                    ADMIN
                  </Badge>
                </Flex>

                <Divider borderColor="whiteAlpha.200" />

                <Box>
                  <Text color="gray.400" fontSize="sm" mb={3}>
                    Account Management
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <Button
                      w="full"
                      variant="outline"
                      colorScheme="blue"
                      borderColor="#5294CF"
                      color="#5294CF"
                      _hover={{ bg: 'rgba(82, 148, 207, 0.1)' }}
                      leftIcon={<Icon as={FiLock} />}
                      onClick={onPasswordModalOpen}
                    >
                      Change Password
                    </Button>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Links */}
          <Card
            bg="#161d26"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <CardHeader>
              <HStack spacing={2}>
                <Icon as={FiGlobe} color="#5294CF" boxSize={5} />
                <Heading size="md" color="white">
                  External Resources
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                <Button
                  as="a"
                  href="https://console.aws.amazon.com/dynamodb"
                  target="_blank"
                  variant="outline"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  rightIcon={<Icon as={FiExternalLink} />}
                  justifyContent="space-between"
                >
                  DynamoDB Console
                </Button>
                <Button
                  as="a"
                  href="https://console.aws.amazon.com/cognito"
                  target="_blank"
                  variant="outline"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  rightIcon={<Icon as={FiExternalLink} />}
                  justifyContent="space-between"
                >
                  Cognito Console
                </Button>
                <Button
                  as="a"
                  href="https://console.aws.amazon.com/amplify"
                  target="_blank"
                  variant="outline"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  rightIcon={<Icon as={FiExternalLink} />}
                  justifyContent="space-between"
                >
                  Amplify Console
                </Button>
                <Button
                  as="a"
                  href="https://docs.amplify.aws"
                  target="_blank"
                  variant="outline"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  rightIcon={<Icon as={FiExternalLink} />}
                  justifyContent="space-between"
                >
                  Amplify Documentation
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Info Note */}
          <Box
            bg="rgba(82, 148, 207, 0.1)"
            border="1px solid"
            borderColor="rgba(82, 148, 207, 0.3)"
            borderRadius="md"
            p={4}
          >
            <HStack spacing={2} color="#5294CF">
              <Icon as={FiSettings} />
              <Text fontSize="sm" fontWeight="medium">
                Note:
              </Text>
            </HStack>
            <Text color="gray.400" fontSize="sm" mt={2}>
              Settings marked as saved are stored locally for demonstration. In a production environment,
              these would be persisted to AWS Systems Manager Parameter Store or a dedicated settings table in DynamoDB.
          </Text>
        </Box>
        </VStack>

        {/* Change Password Modal */}
        <Modal isOpen={isPasswordModalOpen} onClose={onPasswordModalClose} size="md">
          <ModalOverlay />
          <ModalContent bg="#161d26" border="1px solid" borderColor="whiteAlpha.200">
            <ModalHeader color="white">
              <HStack spacing={2}>
                <Icon as={FiLock} color="#5294CF" />
                <Text>Change Password</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gray.300">Current Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                      _hover={{ borderColor: '#5294CF' }}
                      _focus={{ borderColor: '#5294CF', boxShadow: '0 0 0 1px #5294CF' }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showOldPassword ? 'Hide password' : 'Show password'}
                        icon={<Icon as={showOldPassword ? FiEyeOff : FiEye} />}
                        variant="ghost"
                        color="gray.400"
                        size="sm"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">New Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 characters)"
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                      _hover={{ borderColor: '#5294CF' }}
                      _focus={{ borderColor: '#5294CF', boxShadow: '0 0 0 1px #5294CF' }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        icon={<Icon as={showNewPassword ? FiEyeOff : FiEye} />}
                        variant="ghost"
                        color="gray.400"
                        size="sm"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <Text color="gray.500" fontSize="xs" mt={1}>
                    Password must be at least 8 characters long
                  </Text>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">Confirm New Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                      _hover={{ borderColor: '#5294CF' }}
                      _focus={{ borderColor: '#5294CF', boxShadow: '0 0 0 1px #5294CF' }}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        icon={<Icon as={showConfirmPassword ? FiEyeOff : FiEye} />}
                        variant="ghost"
                        color="gray.400"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={() => {
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  onPasswordModalClose();
                }}
                isDisabled={passwordLoading}
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                bg="#5294CF"
                _hover={{ bg: '#74B9FF' }}
                onClick={handlePasswordChange}
                isLoading={passwordLoading}
                loadingText="Changing..."
                leftIcon={<Icon as={FiLock} />}
              >
                Change Password
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AdminLayout>
    </AuthGuard>
  );
}

