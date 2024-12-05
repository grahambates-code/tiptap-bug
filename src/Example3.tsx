import React, { useState } from 'react';
import { useEditor, EditorContent, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node } from '@tiptap/core';
import { Mark } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from 'deck.gl';
import { Box, Button, VStack } from '@chakra-ui/react';

// Define the ViewStateMark
const ViewStateMark = Mark.create({
    name: 'viewState',

    addAttributes() {
        return {
            viewState: {
                default: null, // Stores the serialized viewState
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-view-state]',
                getAttrs: (node) => ({
                    viewState: node.getAttribute('data-view-state'),
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            {
                ...HTMLAttributes,
                'data-view-state': HTMLAttributes.viewState,
                style: 'background-color: yellow; cursor: pointer;',
            },
            0,
        ];
    },

    addCommands() {
        return {
            setViewStateMark: (viewState) => ({ commands }) => {
                return commands.setMark(this.name, { viewState: JSON.stringify(viewState) });
            },
        };
    },
});

// Define the CustomNode
const CustomNode = Node.create({
    name: 'customNode',

    group: 'block',

    content: 'inline*', // Allow inline editable content within the node

    draggable: true, // Enable drag-and-drop

    parseHTML() {
        return [{ tag: 'customNode' }];
    },

    renderHTML() {
        return ['customNode', 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CustomNodeView);
    },
});

// React Component for CustomNodeView
const CustomNodeView = ({ editor, node }) => {
    const [viewState, setViewState] = useState({
        longitude: -122.4,
        latitude: 37.74,
        zoom: 11,
        pitch: 0,
        bearing: 0,
    });

    const markSelectedTextWithViewState = () => {
        if (editor && editor.state.selection) {
            editor.chain().focus().setViewStateMark(viewState).run();
        }
    };

    const applyViewStateToMap = (viewState) => {
        setViewState(JSON.parse(viewState));
    };

    return (
        <NodeViewWrapper
            className="custom-node-wrapper"
            style={{
                border: '1px solid #ddd',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
            }}
        >
            {/* Map Container */}
            <Box position="relative" h="200px" w="100%" mb="2" borderRadius="8px" overflow="hidden">
                <DeckGL
                    viewState={viewState}
                    onViewStateChange={({ viewState }) => setViewState(viewState)}
                    layers={[
                        new TileLayer({
                            id: 'TileLayer',
                            data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            maxZoom: 19,
                            minZoom: 0,
                            renderSubLayers: (props) => {
                                const { boundingBox } = props.tile;

                                return new BitmapLayer(props, {
                                    data: null,
                                    image: props.data,
                                    bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]],
                                });
                            },
                            pickable: true,
                        }),
                    ]}
                    controller={true}
                />
            </Box>

            {/* Button to Mark Text */}
            <Button size="sm" colorScheme="blue" onClick={markSelectedTextWithViewState}>
                Mark Selected Text with ViewState
            </Button>

            {/* Editable Content */}
            <NodeViewContent
                className="content"
                onClick={(e) => {
                    const viewState = e.target.getAttribute('data-view-state');
                    if (viewState) applyViewStateToMap(viewState);
                }}
                style={{
                    display: 'block',
                    width: '100%',
                    borderTop: '1px solid #ddd',
                    padding: '5px',
                    fontSize: '14px',
                }}
            />
        </NodeViewWrapper>
    );
};

// Main Editor Component
const EditorWithCustomNodes = () => {
    const editor = useEditor({
        extensions: [StarterKit, ViewStateMark, CustomNode],
        content: `
      <customNode>
        <p>Select this <span data-view-state='{"longitude":-73.9857,"latitude":40.7484,"zoom":14}'>text</span> to zoom to the Empire State Building.</p>
      </customNode>
    `,
    });

    const addCustomNode = () => {
        if (!editor) return;
        editor.chain().focus().insertContent({
            type: 'customNode',
            content: [
                { type: 'text', text: 'Select this ' },
                {
                    type: 'text',
                    marks: [
                        {
                            type: 'viewState',
                            attrs: {
                                viewState: JSON.stringify({
                                    longitude: -118.2437,
                                    latitude: 34.0522,
                                    zoom: 12,
                                }),
                            },
                        },
                    ],
                    text: 'text',
                },
                { type: 'text', text: ' to zoom to Los Angeles.' },
            ],
        }).run();
    };

    return (
        <VStack align="stretch" spacing="4">
            {/* Add Custom Node Button */}
            <Box>
                <Button size="sm" colorScheme="teal" onClick={addCustomNode}>
                    Add Custom Node with Map
                </Button>
            </Box>

            {/* Editor Content */}
            <Box
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                p="4"
                bg="gray.50"
                minH="200px"
            >
                <EditorContent editor={editor} />
            </Box>
        </VStack>
    );
};

export default EditorWithCustomNodes;
