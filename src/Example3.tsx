import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, NodeViewWrapper, NodeViewContent, NodeViewRendererProps } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Node } from '@tiptap/core';
import { Mark } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from 'deck.gl';
import { background, Box, Button, VStack } from '@chakra-ui/react';

const ViewStateMark = Mark.create({
    name: 'viewState',

    addAttributes() {
        return {
            viewState: {
                default: null,
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


const CustomNode = Node.create({
    name: 'customNode',

    group: 'block',

    content: 'inline*',

    draggable: true,

    parseHTML() {
        return [{ tag: 'customNode' }];
    },

    renderHTML() {
        return ['customNode', 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer((props: NodeViewRendererProps) => (
            <CustomNodeView {...props} setShowPopup={props.setShowPopup} />
        ));
    },
});

// React Component for CustomNodeView
const CustomNodeView = ({ editor, node, setShowPopup }) => {
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
                marginTop: '15px',
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
            <Button size="sm" colorScheme="blue" style={{ marginBottom: 8 }} onClick={markSelectedTextWithViewState}>
                Mark Selected Text with ViewState
            </Button>

            {/* Editable Content */}
            <NodeViewContent
                className="content"
                onClick={(e: any) => {
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

    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const preventSlash = useRef<boolean>(false);

    const editor = useEditor({
        extensions: [StarterKit, ViewStateMark, CustomNode],
        content: `...`,
        editorProps: {
            handleKeyDown: (view, event) => {
              if (event.key === 'Enter') {
                const { $from } = view.state.selection;
                const parentNode = $from.parent;
                
                if (parentNode.type.name === 'customNode') {
                  const parentOffset = $from.parentOffset; 
                  const nodeSize = parentNode.content.size;
                  
                  if (parentOffset >= nodeSize) {
                    return false;
                  } else {
                    event.preventDefault();
                    view.dispatch(view.state.tr.insertText('\n'));
                    return true;
                  }
                }
              }
              return false;
            },
          },
        onUpdate: ({ editor }) => {
            const { from } = editor.state.selection;
            const text = editor.state.doc.textBetween(from - 1, from);
            
            const pos = editor.state.selection.$from.pos;
            const node = editor.state.doc.nodeAt(pos);
            const parentNode = editor.state.doc.resolve(pos).parent;
            
            const isCustomNode = node?.type.name === 'customNode' || parentNode?.type.name === 'customNode';
            preventSlash.current = isCustomNode;
          
            if (text === '/' && !preventSlash.current) {
              const coords = editor.view.coordsAtPos(from);
              setPopupPosition({
                top: coords.top + 40 + window.scrollY,
                left: coords.left,
              });
              setShowPopup(true);
            } else {
              setShowPopup(false);
            }
          },
    });

    const handlePopupSelect = (option: any) => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        editor.chain().focus().deleteRange({ from: to - 1, to }).run();
        addCustomNode(option);
        setShowPopup(false);
    };

    const addCustomNode = (type: string) => {
        if (!editor) return;

        let content;
        switch (type) {
            case 'text':
                content = {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'paragraph' }],
                };
                break;
            case 'map':
                content = {
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
                };
                break;
            case 'heading':
                content = {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text: 'Heading' }],
                };
                break;
            default:
                content = {
                    type: 'paragraph',
                    content: [{ type: 'text', text: ' ' }],
                };
                break;
        }
        editor.chain().focus().insertContent(content).run();
    };
    return (
        <VStack align="stretch" spacing="4">
            {showPopup && (
                <Box position="absolute" style={{ top: popupPosition.top, left: popupPosition.left, zIndex: 99, padding: 10, background: 'white', border: 'solid 1px #e7e0e0', borderRadius: 6 }}>
                    <Box style={{ display: 'inline-grid', gap: 8 }}>
                        <Button
                            background='white'
                            border='solid 1px #e7e0e0'
                            transition='background 0.3s'
                            _hover={{
                                background: '#119bd1',
                                color: 'white',
                                borderColor: 'white'
                            }}
                            onClick={() => { handlePopupSelect('text') }}
                        >
                            Text
                        </Button>
                        <Button
                            background='white'
                            border='solid 1px #e7e0e0'
                            transition='background 0.3s'
                            _hover={{
                                background: '#119bd1',
                                color: 'white',
                                borderColor: 'white'
                            }}
                            onClick={() => { handlePopupSelect('heading') }}>Heading</Button>
                        <Button
                            background='white'
                            border='solid 1px #e7e0e0'
                            transition='background 0.3s'
                            _hover={{
                                background: '#119bd1',
                                color: 'white',
                                borderColor: 'white'
                            }}
                            onClick={(() => { handlePopupSelect('map') })}>Map</Button>
                    </Box>
                </Box>
            )
            }
            <Box style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isDisabled={!editor.can().chain().focus().toggleBold().run()}
                    colorScheme={editor.isActive("bold") ? "blue" : "gray"}
                    size="sm"
                    style={{ marginRight: 10 }}
                >
                    Bold
                </Button>
                <Button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isDisabled={!editor.can().chain().focus().toggleItalic().run()}
                    colorScheme={editor.isActive("italic") ? "blue" : "gray"}
                    size="sm"
                    style={{ marginRight: 10 }}
                >
                    Italic
                </Button>
                <Button
                    onClick={() => editor.chain().focus().undo().run()}
                    isDisabled={!editor.can().chain().focus().undo().run()}
                    colorScheme="gray"
                    size="sm" style={{ marginRight: 10 }}
                >
                    Undo
                </Button>
                <Button
                    onClick={() => editor.chain().focus().redo().run()}
                    isDisabled={!editor.can().chain().focus().redo().run()}
                    colorScheme="gray"
                    size="sm" style={{ marginRight: 10 }}
                >
                    Redo
                </Button>
            </Box>

            {/* Editor Content */}
            <Box
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                p="4"
                bg="gray.50"
                minH="20px"
                width="750px"
            >
                <EditorContent editor={editor} style={{ width: '100%' }} />
            </Box>
        </VStack >
    );
};

export default EditorWithCustomNodes;
