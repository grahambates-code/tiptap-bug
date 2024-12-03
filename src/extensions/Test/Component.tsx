import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React, { useState, useEffect } from "react";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer } from "deck.gl";
import { DeckGL } from "@deck.gl/react";
import { Box, Button, Popover, PopoverTrigger, PopoverContent, PopoverBody } from "@chakra-ui/react";
import Highlight from "@tiptap/extension-highlight";

const DeckGLMap = ({ viewState, onViewStateChange }) => {
    const tileLayer = new TileLayer({
        id: "TileLayer",
        data: "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        maxZoom: 19,
        minZoom: 0,
        renderSubLayers: (props) => {
            const { boundingBox } = props.tile;
            return new BitmapLayer(props, {
                data: undefined,
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
        <div style={{ width: "100%", height: "300px", position: "relative" }}>
            <DeckGL
                viewState={viewState}
                controller={true}
                onViewStateChange={({ viewState }) => onViewStateChange(viewState)}
                layers={[tileLayer]}
            />
        </div>
    );
};

export default ({ node, updateAttributes, editor }) => {
    const [viewState, setViewState] = useState(
        node.attrs.viewState || {
            longitude: 0,
            latitude: 0,
            zoom: 2,
            pitch: 0,
            bearing: 0,
        }
    );
    const [buttonVisible, setButtonVisible] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = editor.state.selection;

            if (selection.empty) {
                setButtonVisible(false);
                return;
            }

            const editorBounds = editor.view.dom.getBoundingClientRect();
            const startCoords = editor.view.coordsAtPos(selection.from);
            const endCoords = editor.view.coordsAtPos(selection.to);

            const buttonLeft =
                (startCoords.left + endCoords.left) / 2 - editorBounds.left;
            const buttonTop = startCoords.top - editorBounds.top - 30;

            setButtonPosition({ top: buttonTop, left: buttonLeft });
            setButtonVisible(true);
        };

        editor.on("selectionUpdate", handleSelectionChange);

        return () => {
            editor.off("selectionUpdate", handleSelectionChange);
        };
    }, [editor]);

    const handleInsertCoordinates = () => {
        const selection = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(
            selection.from,
            selection.to,
            " "
        );

        if (selectedText) {
            // Apply highlight mark only if text is inside the map component
            editor
                .chain()
                .focus()
                .setMark("highlight", { color: "yellow" })
                .run();

            setButtonVisible(false);
        }
    };

    const handleGoTo = () => {
        // Functionality to handle the "Go to" option
        setViewState((prevState) => ({
            ...prevState,
            zoom: 10, // Change to a zoomed view
        }));
    };

    return (
        <NodeViewWrapper className="react-component" style={{ position: "relative" }}>
            <DeckGLMap viewState={viewState} onViewStateChange={setViewState} />

            {/* Floating Button */}
            {buttonVisible && (
                <Box
                    position="absolute"
                    top={`${buttonPosition.top}px`}
                    left={`${buttonPosition.left}px`}
                    transform="translate(-50%, -100%)"
                    zIndex="10"
                >
                    <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={handleInsertCoordinates}
                        boxShadow="md"
                    >
                        Link to Map
                    </Button>
                </Box>
            )}

            {/* Hover Popover for Highlighted Text */}
            <NodeViewContent
                as="div"
                onMouseOver={(e) => {
                    if (e.target.style.backgroundColor === "yellow") {
                        e.target.dataset.popoverVisible = true;
                    }
                }}
            >
                {editor.state.doc.content.content.map((node, index) => (
                    <Popover key={index} trigger="hover">
                        <PopoverTrigger>
              <span
                  style={{
                      backgroundColor: node.marks?.find((mark) => mark.type.name === "highlight")
                          ? "yellow"
                          : "inherit",
                      cursor: "pointer",
                  }}
              >
                {node.text || ""}
              </span>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverBody>
                                <Button colorScheme="blue" size="sm" onClick={handleGoTo}>
                                    Go to
                                </Button>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                ))}
            </NodeViewContent>
        </NodeViewWrapper>
    );
};
