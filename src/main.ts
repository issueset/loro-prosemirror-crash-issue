import "prosekit/basic/style.css";
import "prosekit/basic/typography.css";
import "prosekit/extensions/loro/style.css";
import "./app.css";

import { LoroDoc, type AwarenessListener } from "loro-crdt";
import { CursorAwareness, type LoroDocType } from "loro-prosemirror";
import { createEditor, union } from "prosekit/core";
import { defineDoc } from "prosekit/extensions/doc";
import { defineLoro } from "prosekit/extensions/loro";
import { defineParagraph } from "prosekit/extensions/paragraph";
import { defineText } from "prosekit/extensions/text";
import { ProseKit } from "prosekit/react";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

// ============================================================================
// Extension Definition (from extension.ts)
// ============================================================================

function defineExtension(doc: LoroDocType, awareness: CursorAwareness) {
  console.debug("calling defineLoro");
  return union([
    defineDoc(),
    defineText(),
    defineParagraph(),
    defineLoro({ doc, awareness }),
  ]);
}


// ============================================================================
// EditorComponent (from editor-component.tsx)
// ============================================================================

function EditorComponent(props: {
  loro: LoroDocType;
  awareness: CursorAwareness;
}) {
  const editor = React.useMemo(() => {
    const extension = defineExtension(props.loro, props.awareness);
    return createEditor({ extension });
  }, [props.loro, props.awareness]);

  return React.createElement(
    ProseKit,
    { editor: editor },
    React.createElement(
      "div",
      {
        className:
          "box-border h-full w-full min-h-36 overflow-y-hidden overflow-x-hidden rounded-md border border-solid border-gray-200 dark:border-gray-700 shadow-sm flex flex-col bg-white dark:bg-gray-950 text-black dark:text-white",
      },
      React.createElement(
        "div",
        { className: "relative w-full flex-1 box-border overflow-y-scroll" },
        React.createElement("div", {
          ref: editor.mount,
          className:
            "ProseMirror box-border min-h-full px-[max(4rem,calc(50%-20rem))] py-8 outline-hidden outline-0 [&_span[data-mention=user]]:text-blue-500 [&_span[data-mention=tag]]:text-violet-500",
        })
      )
    )
  );
}

// ============================================================================
// useLoroDocs Hook (from editor.tsx)
// ============================================================================

function useLoroDocs() {
  const [loroState] = React.useState(() => {
    console.debug("Creating LoroDocs");
    const loroA: LoroDocType = new LoroDoc();
    const loroB: LoroDocType = new LoroDoc();

    const idA = loroA.peerIdStr;
    const idB = loroB.peerIdStr;

    const awarenessA = new CursorAwareness(idA);
    const awarenessB = new CursorAwareness(idB);

    return { loroA, loroB, idA, idB, awarenessA, awarenessB };
  });

  React.useEffect(() => {
    console.debug("Subscribing to LoroDocs");
    const { loroA, loroB, idA, idB, awarenessA, awarenessB } = loroState;
    const unsubscribeA = loroA.subscribeLocalUpdates((updates) => {
      loroB.import(updates);
    });
    const unsubscribeB = loroB.subscribeLocalUpdates((updates) => {
      loroA.import(updates);
    });
    const awarenessAListener: AwarenessListener = (_, origin) => {
      if (origin === "local") {
        awarenessB.apply(awarenessA.encode([idA]));
      }
    };
    const awarenessBListener: AwarenessListener = (_, origin) => {
      if (origin === "local") {
        awarenessA.apply(awarenessB.encode([idB]));
      }
    };
    awarenessA.addListener(awarenessAListener);
    awarenessB.addListener(awarenessBListener);
    return () => {
      console.debug("Unsubscribing from LoroDocs");
      awarenessA.removeListener(awarenessAListener);
      awarenessB.removeListener(awarenessBListener);
      unsubscribeA();
      unsubscribeB();
    };
  }, [loroState]);

  return loroState;
}

// ============================================================================
// Page Component (from editor.tsx)
// ============================================================================

function Page() {
  const { loroA, awarenessA, loroB, awarenessB } = useLoroDocs();

  return React.createElement(
    "div",
    { className: "h-full flex flex-col gap-2" },
    React.createElement(EditorComponent, {
      loro: loroA,
      awareness: awarenessA,
    }),
    React.createElement(EditorComponent, { loro: loroB, awareness: awarenessB })
  );
}

// ============================================================================
// Main Entry Point (from main.tsx)
// ============================================================================

ReactDOM.createRoot(document.getElementById("root")!).render(
  React.createElement(Page)
);
