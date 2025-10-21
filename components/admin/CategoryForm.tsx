'use client';

import { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  HStack,
  FormHelperText,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Grid,
  Text,
} from '@chakra-ui/react';
import type { Category } from '@/lib/types';

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
  onSubmit: (data: Partial<Category>) => Promise<void>;
  onCancel: () => void;
  defaultParentId?: string;
}

// Common emoji icons for categories
const ICON_OPTIONS = [
  '🔒', '🛡️', '🔐', '🔑', '🌐', '💻', '🖥️', '📱',
  '☁️', '🌩️', '⚡', '🔥', '💾', '📊', '📈', '📉',
  '🎯', '🎨', '🎭', '🎪', '🎬', '🎮', '🎲', '🎰',
  '📁', '📂', '📄', '📃', '📋', '📊', '📈', '📉',
  '🔧', '🔨', '⚙️', '🛠️', '⚡', '🔌', '💡', '🔦',
  '🚀', '🛰️', '🌍', '🌎', '🌏', '🗺️', '🧭', '📡',
];

// Color options for icon background
const COLOR_OPTIONS = [
  { value: '#5294CF', label: 'Blue' },
  { value: '#00B894', label: 'Green' },
  { value: '#FDCB6E', label: 'Yellow' },
  { value: '#E17055', label: 'Orange' },
  { value: '#D63031', label: 'Red' },
  { value: '#6C5CE7', label: 'Purple' },
  { value: '#00CEC9', label: 'Cyan' },
  { value: '#FD79A8', label: 'Pink' },
  { value: '#74B9FF', label: 'Light Blue' },
  { value: '#A29BFE', label: 'Lavender' },
];

export default function CategoryForm({
  category,
  categories,
  onSubmit,
  onCancel,
  defaultParentId,
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || '📁',
    color: category?.color || '#5294CF',
    parentId: category?.parentId || defaultParentId || 'root',
    order: category?.order || 0,
    isVisible: category?.isVisible !== false,
  });
  const [loading, setLoading] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (!category && formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, formData.slug, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Filter out current category and its descendants from parent options
  const getAvailableParents = () => {
    if (!category) return categories;
    
    const descendants = new Set<string>();
    const findDescendants = (parentId: string) => {
      descendants.add(parentId);
      categories
        .filter((c) => c.parentId === parentId)
        .forEach((c) => findDescendants(c.id));
    };
    
    findDescendants(category.id);
    return categories.filter((c) => !descendants.has(c.id));
  };

  const availableParents = getAvailableParents();

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Name */}
        <FormControl isRequired>
          <FormLabel color="white">Category Name</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Network Security"
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.300"
            color="white"
            _placeholder={{ color: 'gray.500' }}
          />
        </FormControl>

        {/* Slug */}
        <FormControl isRequired>
          <FormLabel color="white">URL Slug</FormLabel>
          <Input
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="e.g., network-security"
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.300"
            color="white"
            _placeholder={{ color: 'gray.500' }}
            fontFamily="mono"
          />
          <FormHelperText color="gray.500">
            Used in URLs. Auto-generated from name.
          </FormHelperText>
        </FormControl>

        {/* Description */}
        <FormControl>
          <FormLabel color="white">Description</FormLabel>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of this category..."
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.300"
            color="white"
            _placeholder={{ color: 'gray.500' }}
            rows={3}
          />
        </FormControl>

        {/* Icon and Color */}
        <Grid templateColumns="1fr 1fr" gap={4}>
          <FormControl>
            <FormLabel color="white">Icon</FormLabel>
            <Select
              value={formData.icon}
              onChange={(e) => handleChange('icon', e.target.value)}
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.300"
              color="white"
            >
              {ICON_OPTIONS.map((icon) => (
                <option
                  key={icon}
                  value={icon}
                  style={{ background: '#161d26' }}
                >
                  {icon} {icon}
                </option>
              ))}
            </Select>
            <Box
              mt={2}
              p={3}
              bg={formData.color}
              borderRadius="md"
              textAlign="center"
              fontSize="2xl"
            >
              {formData.icon}
            </Box>
          </FormControl>

          <FormControl>
            <FormLabel color="white">Icon Color</FormLabel>
            <Select
              value={formData.color}
              onChange={(e) => handleChange('color', e.target.value)}
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.300"
              color="white"
            >
              {COLOR_OPTIONS.map((color) => (
                <option
                  key={color.value}
                  value={color.value}
                  style={{ background: '#161d26' }}
                >
                  {color.label}
                </option>
              ))}
            </Select>
            <FormHelperText color="gray.500">
              Background color for icon
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Parent Category */}
        <FormControl>
          <FormLabel color="white">Parent Category</FormLabel>
          <Select
            value={formData.parentId}
            onChange={(e) => handleChange('parentId', e.target.value)}
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.300"
            color="white"
          >
            <option value="root" style={{ background: '#161d26' }}>
              Root (Top Level)
            </option>
            {availableParents
              .filter((c) => c.parentId === 'root')
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                  style={{ background: '#161d26' }}
                >
                  {cat.icon} {cat.name}
                </option>
              ))}
          </Select>
          <FormHelperText color="gray.500">
            {formData.parentId === 'root'
              ? 'Will appear on homepage'
              : 'Will appear as subcategory'}
          </FormHelperText>
        </FormControl>

        {/* Order and Visibility */}
        <Grid templateColumns="1fr 1fr" gap={4}>
          <FormControl>
            <FormLabel color="white">Sort Order</FormLabel>
            <NumberInput
              value={formData.order}
              onChange={(_, value) => handleChange('order', value)}
              min={0}
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.300"
            >
              <NumberInputField color="white" />
              <NumberInputStepper>
                <NumberIncrementStepper color="white" />
                <NumberDecrementStepper color="white" />
              </NumberInputStepper>
            </NumberInput>
            <FormHelperText color="gray.500">
              Lower numbers appear first
            </FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel color="white">Visibility</FormLabel>
            <HStack spacing={3} mt={2}>
              <Switch
                isChecked={formData.isVisible}
                onChange={(e) => handleChange('isVisible', e.target.checked)}
                colorScheme="green"
                size="lg"
              />
              <Text color={formData.isVisible ? 'green.400' : 'gray.500'}>
                {formData.isVisible ? 'Visible on public site' : 'Hidden from public'}
              </Text>
            </HStack>
          </FormControl>
        </Grid>

        {/* Action Buttons */}
        <HStack spacing={4} pt={4}>
          <Button
            type="submit"
            colorScheme="blue"
            bg="#5294CF"
            _hover={{ bg: '#74B9FF' }}
            isLoading={loading}
            loadingText="Saving..."
            flex={1}
          >
            {category ? 'Update Category' : 'Create Category'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            color="white"
            onClick={onCancel}
            isDisabled={loading}
          >
            Cancel
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}

