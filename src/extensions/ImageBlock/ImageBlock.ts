import { ReactNodeViewRenderer } from '@tiptap/react'
import { mergeAttributes, Range } from '@tiptap/core'

import { ImageBlockView } from './components/ImageBlockView'
import { Image } from '../Image'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: { src: string }) => ReturnType
      setImageBlockAt: (attributes: { src: string; pos: number | Range }) => ReturnType
      setImageBlockAlign: (align: 'left' | 'center' | 'right') => ReturnType
      setImageBlockWidth: (width: number) => ReturnType
      setImageBlockViewState: (viewState: any) => ReturnType
    }
  }
}

export const ImageBlock = Image.extend({
  name: 'imageBlock',

  group: 'block',
  defining: true,
  isolating: true,
  content: 'inline*', // Allows editable inline content

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({
          src: attributes.src,
        }),
      },
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('data-width'),
        renderHTML: attributes => ({
          'data-width': attributes.width,
        }),
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align'),
        renderHTML: attributes => ({
          'data-align': attributes.align,
        }),
      },
      alt: {
        default: undefined,
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => ({
          alt: attributes.alt,
        }),
      },
      viewState: {
        default: {
          longitude: 0,
          latitude: 0,
          zoom: 2,
          pitch: 0,
          bearing: 0,
        },
        parseHTML: element => {
          const viewState = element.getAttribute('data-view-state')
          return viewState ? JSON.parse(viewState) : { longitude: 0, latitude: 0, zoom: 2, pitch: 0, bearing: 0 }
        },
        renderHTML: attributes => ({
          'data-view-state': JSON.stringify(attributes.viewState),
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="imageBlock"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'imageBlock' }),
      ['div', { class: 'map-wrapper' }], // Map container
      ['div', { class: 'text-wrapper' }, 0], // Editable text content
    ]
  },

  addCommands() {
    return {
      setImageBlock:
        attrs =>
          ({ commands }) => {
            return commands.insertContent({ type: 'imageBlock', attrs: { src: attrs.src } })
          },

      setImageBlockAt:
        attrs =>
          ({ commands }) => {
            return commands.insertContentAt(attrs.pos, { type: 'imageBlock', attrs: { src: attrs.src } })
          },

      setImageBlockAlign:
        align =>
          ({ commands }) =>
            commands.updateAttributes('imageBlock', { align }),

      setImageBlockWidth:
        width =>
          ({ commands }) =>
            commands.updateAttributes('imageBlock', { width: `${Math.max(0, Math.min(100, width))}%` }),

      setImageBlockViewState:
        viewState =>
          ({ commands }) =>
            commands.updateAttributes('imageBlock', { viewState }),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView)
  },
})



export default ImageBlock
