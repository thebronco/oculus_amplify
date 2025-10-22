'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $createParagraphNode,
  $getNodeByKey,
} from 'lexical';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $getNearestNodeOfType } from '@lexical/utils';
import { Box, HStack, Button, Select, Divider, Tooltip } from '@chakra-ui/react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaCode,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaUndo,
  FaRedo,
} from 'react-icons/fa';

const LowPriority = 1;

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  return (
    <Box
      p={2}
      borderBottom="1px solid"
      borderColor="whiteAlpha.300"
      bg="whiteAlpha.50"
    >
      <HStack spacing={2} flexWrap="wrap">
        {/* Undo/Redo */}
        <Tooltip label="Undo" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaUndo />
          </Button>
        </Tooltip>
        <Tooltip label="Redo" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaRedo />
          </Button>
        </Tooltip>

        <Divider orientation="vertical" height="24px" borderColor="whiteAlpha.300" />

        {/* Block Type Dropdown */}
        <Select
          size="sm"
          value={blockType}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'paragraph') formatParagraph();
            else if (value === 'h1') formatHeading('h1');
            else if (value === 'h2') formatHeading('h2');
            else if (value === 'h3') formatHeading('h3');
            else if (value === 'quote') formatQuote();
          }}
          bg="whiteAlpha.100"
          color="white"
          border="1px solid"
          borderColor="whiteAlpha.300"
          width="140px"
        >
          <option value="paragraph" style={{ background: '#161d26' }}>Normal</option>
          <option value="h1" style={{ background: '#161d26' }}>Heading 1</option>
          <option value="h2" style={{ background: '#161d26' }}>Heading 2</option>
          <option value="h3" style={{ background: '#161d26' }}>Heading 3</option>
          <option value="quote" style={{ background: '#161d26' }}>Quote</option>
        </Select>

        <Divider orientation="vertical" height="24px" borderColor="whiteAlpha.300" />

        {/* Text Format Buttons */}
        <Tooltip label="Bold" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            bg={isBold ? 'whiteAlpha.300' : 'transparent'}
            onClick={() => formatText('bold')}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaBold />
          </Button>
        </Tooltip>

        <Tooltip label="Italic" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            bg={isItalic ? 'whiteAlpha.300' : 'transparent'}
            onClick={() => formatText('italic')}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaItalic />
          </Button>
        </Tooltip>

        <Tooltip label="Underline" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            bg={isUnderline ? 'whiteAlpha.300' : 'transparent'}
            onClick={() => formatText('underline')}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaUnderline />
          </Button>
        </Tooltip>

        <Tooltip label="Strikethrough" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            bg={isStrikethrough ? 'whiteAlpha.300' : 'transparent'}
            onClick={() => formatText('strikethrough')}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaStrikethrough />
          </Button>
        </Tooltip>

        <Tooltip label="Inline Code" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            bg={isCode ? 'whiteAlpha.300' : 'transparent'}
            onClick={() => formatText('code')}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaCode />
          </Button>
        </Tooltip>

        <Divider orientation="vertical" height="24px" borderColor="whiteAlpha.300" />

        {/* List Buttons */}
        <Tooltip label="Bullet List" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            bg={blockType === 'ul' ? 'whiteAlpha.300' : 'transparent'}
            onClick={formatBulletList}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaListUl />
          </Button>
        </Tooltip>

        <Tooltip label="Numbered List" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            bg={blockType === 'ol' ? 'whiteAlpha.300' : 'transparent'}
            onClick={formatNumberedList}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaListOl />
          </Button>
        </Tooltip>

        <Divider orientation="vertical" height="24px" borderColor="whiteAlpha.300" />

        {/* Alignment Buttons */}
        <Tooltip label="Align Left" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            onClick={() => formatAlignment('left')}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaAlignLeft />
          </Button>
        </Tooltip>

        <Tooltip label="Align Center" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            onClick={() => formatAlignment('center')}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaAlignCenter />
          </Button>
        </Tooltip>

        <Tooltip label="Align Right" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            onClick={() => formatAlignment('right')}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaAlignRight />
          </Button>
        </Tooltip>

        <Tooltip label="Justify" placement="top">
          <Button
            size="sm"
            variant="ghost"
            color="white"
            onClick={() => formatAlignment('justify')}
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            <FaAlignJustify />
          </Button>
        </Tooltip>
      </HStack>
    </Box>
  );
}

