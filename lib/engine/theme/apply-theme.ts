import type { CanvasElement } from "../../types"
import type { ThemeId } from "./types"
import { resolveSemanticStyle } from "./semantic-style"

export function applyThemeToElement(
  element: CanvasElement,
  themeId: ThemeId = "vibrant",
  preserveManualOverrides = true
): CanvasElement {
  // If block was manually recolored by the user, preserve manual override
  if (preserveManualOverrides && element.content?._manualColorOverride) {
    return element
  }

  const blockType = (element.type || "note") as any
  const dummyBlock = { id: element.id, type: blockType, content: element.content, importance: 3 } as any
  const style = resolveSemanticStyle(dummyBlock, themeId)

  return {
    ...element,
    color: style.bg as any,
    content: {
      ...(element.content || {}),
      _themeId: themeId,
      _resolvedStyle: style,
    },
  }
}

export function applyThemeToElements(
  elements: CanvasElement[],
  themeId: ThemeId = "vibrant",
  preserveManualOverrides = true
): CanvasElement[] {
  return elements.map((el) => applyThemeToElement(el, themeId, preserveManualOverrides))
}
