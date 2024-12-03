import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import React, { useState, useCallback } from 'react'
import { DeckGL } from '@deck.gl/react'
import { TileLayer } from '@deck.gl/geo-layers'
import { BitmapLayer } from 'deck.gl'
import { throttle } from 'lodash'

const DEFAULT_VIEWSTATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
}

const DeckGLMap = ({ viewState, onViewStateChange }) => {
  const tileLayer = new TileLayer({
    id: 'TileLayer',
    data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    minZoom: 0,
    renderSubLayers: props => {
      const { boundingBox } = props.tile
      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]],
      })
    },
    pickable: true,
  })

  return (
      <div style={{ width: '100%', height: '300px', position: 'relative' }}>
        <DeckGL
            viewState={viewState}
            controller={true}
            onViewStateChange={({ viewState }) => onViewStateChange(viewState)}
            layers={[tileLayer]}
        />
      </div>
  )
}

export const ImageBlockView = ({ node, updateAttributes }) => {
  const initialViewState = node.attrs.viewState || DEFAULT_VIEWSTATE
  const [viewState, setViewState] = useState(initialViewState)

  return (
      <NodeViewWrapper>
        <div style={{ width: '100%' }}>
          {/* Map Wrapper */}
          <div contentEditable={false}>
            <DeckGLMap viewState={viewState} onViewStateChange={setViewState} />
          </div>
          {/* Rich Text Editable Wrapper */}
          <div className="text-wrapper" >
            <NodeViewContent className="editable-text" />
          </div>

        </div>
      </NodeViewWrapper>
  )
}
