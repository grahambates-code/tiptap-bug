import React, { useState } from 'react'
import { useEditor, EditorContent, NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Node } from '@tiptap/core'
import { Mark } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

// Define the italic mark with a custom `data-value` attribute
const ItalicMark = Mark.create({
    name: 'italic',

    addAttributes() {
        return {
            value: {
                default: null, // Store the button value here
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'em',
                getAttrs: (node) => ({ value: node.getAttribute('data-value') }),
            },
            {
                tag: 'i',
                getAttrs: (node) => ({ value: node.getAttribute('data-value') }),
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['em', { ...HTMLAttributes }, 0]
    },

    addCommands() {
        return {
            toggleItalicWithValue: (value) => ({ commands }) => {
                return commands.toggleMark(this.name, { value })
            },
        }
    },
})

// Define a custom node with ReactNodeViewRenderer
const CustomNode = Node.create({
    name: 'customNode',

    group: 'block',

    content: 'inline*',

    draggable: true, // Make the node draggable

    parseHTML() {
        return [{ tag: 'customNode' }]
    },

    renderHTML() {
        return ['customNode', 0]
    },

    addNodeView() {
        return ReactNodeViewRenderer(CustomNodeView)
    },

    // addKeyboardShortcuts() {
    //     return {
    //         Enter: ({ editor }) => {
    //             // Insert a new paragraph when pressing Enter
    //             return editor.chain().focus().insertParagraph().run()
    //         },
    //     }
    // },
})

// The React component for the NodeView
const CustomNodeView = () => {
    const [count, setCount] = useState(0)

    const incrementCount = () => {
        setCount(count + 1)
    }

    return (
        <NodeViewWrapper
            className="react-node"
            style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}
        >
            <div style={{ marginBottom: '10px' }}>
                <button onClick={incrementCount}>
                    React Node Button (Clicked {count} times)
                </button>
            </div>
            <NodeViewContent className="content" />
        </NodeViewWrapper>
    )
}

// Main App component
const App = () => {
    const editor = useEditor({
        extensions: [StarterKit, ItalicMark, CustomNode],
        content: `
      <p>This is a sample editor.</p>
      <customNode>Editable <strong>content</strong> here</customNode>
      <p>Another paragraph.</p>
    `,
        editorProps: {
            handleClickOn(view, pos, node, nodePos, event) {
                const { doc, schema } = view.state
                const markType = schema.marks.italic
                const $pos = doc.resolve(pos)

                // Check for marks at the current position
                const marks = $pos.marks()
                const italicMark = marks.find((mark) => mark.type === markType)

                if (italicMark && italicMark.attrs.value) {
                    alert(`The button value was ${italicMark.attrs.value} when this selection was made.`)
                }

                return false
            },
        },
        onUpdate: ({ editor }) => {
            const { state } = editor
            const firstNode = state.doc.firstChild
            const lastNode = state.doc.lastChild

            editor.chain().focus()

            // Ensure the first node is a paragraph
            if (firstNode.type.name !== 'paragraph') {
                editor.chain().insertContentAt(0, { type: 'paragraph' }).run()
            }

            // Ensure the last node is a paragraph
            if (lastNode.type.name !== 'paragraph') {
                editor.chain().insertContentAt(state.doc.content.size, { type: 'paragraph' }).run()
            }
        },
    })

    const toggleItalicWithValue = () => {
        if (editor) {
            const customNodes = document.querySelectorAll('.react-node')
            const lastNode = customNodes[customNodes.length - 1]
            if (lastNode) {
                const button = lastNode.querySelector('button')
                const count = button?.textContent.match(/Clicked (\d+) times/)?.[1] || 0
                editor.chain().focus().toggleItalicWithValue(count).run()
            }
        }
    }

    const addReactNode = () => {
        if (editor) {
            editor.chain().focus().insertContent({
                type: 'customNode',
                content: [{ type: 'text', text: 'New React Node' }],
            }).run()
        }
    }

    return (
        <div>
            <h1>Custom Node Editor</h1>
            <div style={{ marginBottom: '10px' }}>
                <button onClick={toggleItalicWithValue} style={{ marginRight: '10px' }}>
                    Mark Selected Text as Italic with Button Value
                </button>
                <button onClick={addReactNode}>Add React Node</button>
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}

export default App
