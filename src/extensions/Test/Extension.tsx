import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import Component from './Component.jsx';

export default Node.create({
    name: 'reactComponent',

    group: 'block',

    content: 'inline*',

    addAttributes() {
        return {
            toggleState: {
                default: 'option1', // Default value for the toggle
            },
            viewState: {
                default: {
                    longitude: 0,
                    latitude: 0,
                    zoom: 2,
                    pitch: 0,
                    bearing: 0,
                }, // Default map view state
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'react-component',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['react-component', mergeAttributes(HTMLAttributes), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(Component);
    },
});
