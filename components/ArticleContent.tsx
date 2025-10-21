'use client';

import { Box, Heading, Text, UnorderedList, OrderedList, ListItem, Code } from '@chakra-ui/react';

interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  style?: string;
  tag?: string;
  direction?: string;
  indent?: number;
  value?: number;
  [key: string]: any;
}

interface LexicalContent {
  root?: {
    children?: LexicalNode[];
  };
}

interface ArticleContentProps {
  content: string;
}

export default function ArticleContent({ content }: ArticleContentProps) {
  // Parse JSON content
  let parsedContent: LexicalContent;
  try {
    parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (error) {
    // If parsing fails, display as plain text
    return (
      <Text color="white" fontSize="md" lineHeight="1.8" whiteSpace="pre-wrap">
        {content}
      </Text>
    );
  }

  // Render Lexical nodes recursively
  const renderNode = (node: LexicalNode, index: number): JSX.Element | null => {
    if (!node) return null;

    // Text node
    if (node.type === 'text' && node.text) {
      let textContent = node.text;
      let fontWeight = 'normal';
      let fontStyle = 'normal';
      let textDecoration = 'none';

      // Check for formatting (bold, italic, underline)
      if (node.format) {
        if (node.format & 1) fontWeight = 'bold'; // Bold
        if (node.format & 2) fontStyle = 'italic'; // Italic
        if (node.format & 8) textDecoration = 'underline'; // Underline
      }

      return (
        <Text
          key={index}
          as="span"
          fontWeight={fontWeight}
          fontStyle={fontStyle}
          textDecoration={textDecoration}
        >
          {textContent}
        </Text>
      );
    }

    // Paragraph node
    if (node.type === 'paragraph') {
      return (
        <Text key={index} color="white" fontSize="md" lineHeight="1.8" mb={4}>
          {node.children?.map((child, i) => renderNode(child, i))}
        </Text>
      );
    }

    // Heading nodes
    if (node.type === 'heading') {
      const level = node.tag || 'h2';
      const sizes: Record<string, string> = {
        h1: 'xl',
        h2: 'lg',
        h3: 'md',
        h4: 'sm',
        h5: 'sm',
        h6: 'xs',
      };

      return (
        <Heading
          key={index}
          as={level as any}
          size={sizes[level] || 'md'}
          color="#5294CF"
          mb={4}
          mt={6}
        >
          {node.children?.map((child, i) => renderNode(child, i))}
        </Heading>
      );
    }

    // List nodes
    if (node.type === 'list') {
      const ListComponent = node.listType === 'number' ? OrderedList : UnorderedList;
      return (
        <ListComponent key={index} color="white" mb={4} spacing={2}>
          {node.children?.map((child, i) => renderNode(child, i))}
        </ListComponent>
      );
    }

    // List item
    if (node.type === 'listitem') {
      return (
        <ListItem key={index}>
          {node.children?.map((child, i) => renderNode(child, i))}
        </ListItem>
      );
    }

    // Code block
    if (node.type === 'code') {
      return (
        <Code
          key={index}
          display="block"
          p={4}
          mb={4}
          bg="gray.800"
          color="green.300"
          borderRadius="md"
          whiteSpace="pre-wrap"
        >
          {node.children?.map((child, i) => renderNode(child, i))}
        </Code>
      );
    }

    // Quote block
    if (node.type === 'quote') {
      return (
        <Box
          key={index}
          borderLeft="4px solid"
          borderColor="#5294CF"
          pl={4}
          py={2}
          mb={4}
          fontStyle="italic"
          color="gray.300"
        >
          {node.children?.map((child, i) => renderNode(child, i))}
        </Box>
      );
    }

    // Default: render children if they exist
    if (node.children && node.children.length > 0) {
      return (
        <Box key={index}>
          {node.children.map((child, i) => renderNode(child, i))}
        </Box>
      );
    }

    return null;
  };

  // Render the root content
  const rootChildren = parsedContent?.root?.children || [];

  if (rootChildren.length === 0) {
    return (
      <Text color="gray.400" fontSize="md">
        No content available.
      </Text>
    );
  }

  return (
    <Box>
      {rootChildren.map((node, index) => renderNode(node, index))}
    </Box>
  );
}

