import { useCallback } from "react";

/**
 * Wraps the current text selection inside a container in a <mark> element,
 * mimicking the highlighter behavior students use on real reading passages.
 * Uses the native Selection/Range API — no external library needed.
 */
export function useTextHighlighter(containerRef: React.RefObject<HTMLElement | null>) {
  const highlightSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!containerRef.current?.contains(range.commonAncestorContainer)) return;

    const mark = document.createElement("mark");
    mark.className = "bg-warning/40 rounded-sm";

    try {
      range.surroundContents(mark);
      selection.removeAllRanges();
    } catch {
      // Selection spans multiple elements (surroundContents can't handle
      // partial-node ranges) — skip silently rather than corrupt the DOM.
    }
  }, [containerRef]);

  return { highlightSelection };
}
