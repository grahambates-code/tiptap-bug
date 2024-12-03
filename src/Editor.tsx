import React, { useState } from "react";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Box, Button, Flex, VStack, Text } from "@chakra-ui/react";
import { TypeSuggestion } from "./extensions/block-type-suggestion";
import { ImageBlock } from "./extensions/ImageBlock";
import TestExtension from "./extensions/Test/Extension";
import Highlight from "@tiptap/extension-highlight";


interface MenuBarProps {
    editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
    if (!editor) {
        return null;
    }

    return (
        <Flex gap={2} wrap="wrap" mb={4}>
            <Button
                onClick={() => editor.chain().focus().toggleBold().run()}
                isDisabled={!editor.can().chain().focus().toggleBold().run()}
                colorScheme={editor.isActive("bold") ? "blue" : "gray"}
                size="sm"
            >
                Bold
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isDisabled={!editor.can().chain().focus().toggleItalic().run()}
                colorScheme={editor.isActive("italic") ? "blue" : "gray"}
                size="sm"
            >
                Italic
            </Button>
            <Button
                onClick={() => editor.chain().focus().undo().run()}
                isDisabled={!editor.can().chain().focus().undo().run()}
                colorScheme="gray"
                size="sm"
            >
                Undo
            </Button>
            <Button
                onClick={() => editor.chain().focus().redo().run()}
                isDisabled={!editor.can().chain().focus().redo().run()}
                colorScheme="gray"
                size="sm"
            >
                Redo
            </Button>
        </Flex>
    );
};

export const DemoEditor = () => {
    const [editorContent, setEditorContent] = useState({});
    const editor = useEditor({
        extensions: [StarterKit, TypeSuggestion, ImageBlock, TestExtension,   Highlight.configure({
            multicolor: true, // Allows multiple colors for highlights
        })],
        content: `
      <p>
        Isn’t that great? 
      </p>
      
       <p>
        Isn’t that great? 
      </p>
      
    `,
        onUpdate: ({ editor }) => {
            setEditorContent(editor.getJSON());
        },
    });

    return (
        <Flex position="relative">
            {/* Debug Panel */}
            <Box
                position="fixed"
                top={0}
                left={0}
                width="300px"
                height="100vh"
                bg="white"
                visibility={'hidden'}
                color="black"
                p={4}
                borderRight="1px solid"
                borderColor="gray.200"
                overflowY="auto"
                boxShadow="md"
            >
                <Text fontSize="lg" mb={4} fontWeight="bold">
                    Debug Panel
                </Text>
                <Box
                    as="pre"
                    fontSize="sm"
                    whiteSpace="pre-wrap"
                >
                    {JSON.stringify(editorContent, null, 2)}
                </Box>
            </Box>

            {/* Editor */}
            <Box   flex={1}   width={'100vw'}>
                <MenuBar editor={editor} />
                <Box
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="white"
                    boxShadow="sm"


                >
                    <EditorContent editor={editor} />
                </Box>
            </Box>
        </Flex>
    );
};
