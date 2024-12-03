import { JSONContent } from "@tiptap/react";

enum EditorFormat {
  TEXT = "Text",
  HEADING = "Heading",
  IMAGE = "Image",
  TEST = "TestExtension"
}

const TipTapEditorFormat: { [key in EditorFormat]: JSONContent } = {
  [EditorFormat.TEXT]: { type: "paragraph" },
  [EditorFormat.IMAGE]: { type: "imageBlock" },
  [EditorFormat.TEST]: { type: "reactComponent" },
  [EditorFormat.HEADING]: { type: "heading", attrs: { level: 1 } }
};

export { EditorFormat, TipTapEditorFormat };
