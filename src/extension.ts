import type { CursorAwareness, LoroDocType } from "loro-prosemirror";
import { union } from "prosekit/core";
import { defineDoc } from "prosekit/extensions/doc";
import { defineLoro } from "prosekit/extensions/loro";
import { defineParagraph } from "prosekit/extensions/paragraph";
import { defineText } from "prosekit/extensions/text";

export function defineExtension(doc: LoroDocType, awareness: CursorAwareness) {
  console.debug("calling defineLoro");
  return union([
    defineDoc(),
    defineText(),
    defineParagraph(),
    defineLoro({ doc, awareness }),
  ]);
}

export type EditorExtension = ReturnType<typeof defineExtension>;
