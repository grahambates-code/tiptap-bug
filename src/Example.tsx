import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Mark } from '@tiptap/core';
import { DeckGL } from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

// Define the CustomMark extension directly in the component
const CustomMark = Mark.create({
    name: 'customMark',

    addAttributes() {
        return {
            viewState: {
                default: null, // This holds the serialized viewState
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-viewstate]', // Ensures spans with data-viewstate are recognized
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            {
                ...HTMLAttributes,
                'data-viewstate': HTMLAttributes.viewState, // Properly set the data-viewstate attribute
                style:
                    'background-color: yellow; color: black; cursor: pointer; text-decoration: underline;',
            },
            0,
        ];
    },

    addCommands() {
        return {
            setCustomMark:
                (viewState) =>
                    ({ chain }) => {
                        return chain()
                            .setMark(this.name, { viewState: JSON.stringify(viewState) })
                            .run();
                    },
            unsetCustomMark:
                () =>
                    ({ chain }) => {
                        return chain().unsetMark(this.name).run();
                    },
        };
    },
});

const TiptapEditorWithMap = () => {
    const [viewState, setViewState] = useState({
        longitude: -122.4,
        latitude: 37.74,
        zoom: 12,
        pitch: 0,
        bearing: 0,
    });

    // Initialize the editor with CustomMark extension
    const editor = useEditor({
        extensions: [StarterKit, CustomMark],
        content: '<p>Select some text to link a ViewState...</p>',
    });

    // Handle clicks on the yellow links
    const handleSpanClick = (event) => {
        const target = event.target;

        // Check if the clicked element has the "data-viewstate" attribute
        if (target.tagName === 'SPAN' && target.getAttribute('data-viewstate')) {
            console.log('Yellow link clicked:', target);
            try {
                const linkedViewState = JSON.parse(target.getAttribute('data-viewstate'));
                console.log('Restoring ViewState:', linkedViewState);
                setViewState({...linkedViewState, transitionDuration : 200});
            } catch (error) {
                console.error('Failed to parse ViewState:', error);
            }
        } else {
            console.log('Click event did not target a yellow link');
        }
    };

    // Attach the click handler to the editor container
    useEffect(() => {
        const container = document.querySelector('.ProseMirror'); // Tiptap editor container
        if (container) {
            console.log('Attaching click event listener to ProseMirror');
            container.addEventListener('click', handleSpanClick);
        }

        return () => {
            if (container) {
                console.log('Removing click event listener from ProseMirror');
                container.removeEventListener('click', handleSpanClick);
            }
        };
    }, []);

    // Insert a ViewState into the selected text
    const insertViewState = () => {
        if (!editor) return;

        const serializedViewState = JSON.stringify(viewState);

        // Wrap the selected text in a span with the ViewState as a data attribute
        editor
            .chain()
            .focus()
            .setCustomMark(viewState) // Use the custom mark to associate the ViewState
            .run();

        console.log('Inserted ViewState:', serializedViewState);
    };

    const tileLayer = new TileLayer({
        id: 'TileLayer',
        data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        maxZoom: 19,
        minZoom: 0,
        renderSubLayers: (props) => {
            const { boundingBox } = props.tile;

            return new BitmapLayer(props, {
                data: null,
                image: props.data,
                bounds: [
                    boundingBox[0][0],
                    boundingBox[0][1],
                    boundingBox[1][0],
                    boundingBox[1][1],
                ],
            });
        },
        pickable: true,
    });

    return (
        <div style={{ position: 'relative', height: '100vh' }}>
            <DeckGL
                layers={[tileLayer]}
                viewState={viewState}
                onViewStateChange={(viewState) => setViewState(viewState.viewState)}
                controller={true}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    zIndex: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '10px',
                    borderRadius: '5px',
                    width: '300px',
                }}
            >
                {editor && (
                    <div style={{ marginBottom: '1rem' }}>
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            style={{ marginRight: '5px' }}
                        >
                            Bold
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            style={{ marginRight: '5px' }}
                        >
                            Italic
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            style={{ marginRight: '5px' }}
                        >
                            Bullet List
                        </button>
                        <button
                            onClick={insertViewState}
                            style={{
                                marginLeft: '10px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                padding: '5px 10px',
                            }}
                        >
                            Save ViewState
                        </button>
                    </div>
                )}
                <EditorContent
                    editor={editor}
                    style={{
                        border: '1px solid #ccc',
                        padding: '10px',
                        borderRadius: '5px',
                    }}
                />
            </div>
        </div>
    );
};

export default TiptapEditorWithMap;
