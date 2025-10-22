'use client';

import { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from 'lexical';
import { Box } from '@chakra-ui/react';
import ToolbarPlugin from './ToolbarPlugin';

interface LexicalEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

// Plugin to load initial content
function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (content) {
      try {
        const editorState = editor.parseEditorState(content);
        editor.setEditorState(editorState);
      } catch (error) {
        console.error('Failed to parse initial content:', error);
        // If parsing fails, set plain text
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(content));
          root.append(paragraph);
        });
      }
    }
  }, []);

  return null;
}

export default function LexicalEditor({ initialContent = '', onChange }: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'ArticleEditor',
    theme: {
      paragraph: 'editor-paragraph',
      text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
        strikethrough: 'editor-text-strikethrough',
        code: 'editor-text-code',
      },
      heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
        h3: 'editor-heading-h3',
      },
      list: {
        ol: 'editor-list-ol',
        ul: 'editor-list-ul',
        listitem: 'editor-listitem',
      },
      quote: 'editor-quote',
      code: 'editor-code',
      link: 'editor-link',
    },
    onError: (error: Error) => {
      console.error('Lexical Error:', error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      LinkNode,
    ],
  };

  const handleChange = (editorState: EditorState) => {
    const json = JSON.stringify(editorState.toJSON());
    onChange(json);
  };

  return (
    <Box>
      <LexicalComposer initialConfig={initialConfig}>
        <Box
          border="1px solid"
          borderColor="whiteAlpha.300"
          borderRadius="md"
          bg="whiteAlpha.100"
          overflow="hidden"
        >
          <ToolbarPlugin />
          <Box position="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  style={{
                    minHeight: '400px',
                    padding: '16px',
                    outline: 'none',
                    color: 'white',
                    fontSize: '16px',
                    lineHeight: '1.6',
                  }}
                />
              }
              placeholder={
                <Box
                  position="absolute"
                  top="16px"
                  left="16px"
                  color="gray.500"
                  pointerEvents="none"
                >
                  Start writing your article here...
                </Box>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </Box>
        </Box>
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        <InitialContentPlugin content={initialContent} />
      </LexicalComposer>

      <style jsx global>{`
        .editor-paragraph {
          margin: 0 0 12px 0;
        }
        .editor-text-bold {
          font-weight: bold;
        }
        .editor-text-italic {
          font-style: italic;
        }
        .editor-text-underline {
          text-decoration: underline;
        }
        .editor-text-strikethrough {
          text-decoration: line-through;
        }
        .editor-text-code {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .editor-heading-h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 20px 0 12px 0;
        }
        .editor-heading-h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 16px 0 12px 0;
        }
        .editor-heading-h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 14px 0 12px 0;
        }
        .editor-list-ol {
          padding-left: 24px;
          margin: 8px 0;
        }
        .editor-list-ul {
          padding-left: 24px;
          margin: 8px 0;
        }
        .editor-listitem {
          margin: 4px 0;
        }
        .editor-quote {
          border-left: 4px solid rgba(255, 255, 255, 0.3);
          padding-left: 16px;
          margin: 12px 0;
          font-style: italic;
          color: rgba(255, 255, 255, 0.8);
        }
        .editor-code {
          background-color: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          margin: 12px 0;
          overflow-x: auto;
        }
        .editor-link {
          color: #5294CF;
          text-decoration: underline;
        }
      `}</style>
    </Box>
  );
}

