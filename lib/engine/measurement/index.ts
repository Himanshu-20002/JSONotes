import type { CanvasElement } from "../../types"
import type { CanvasOverflowResult } from "./types"

export function detectCanvasOverflow(
  elements: CanvasElement[],
  canvasHeight: number = 1440,
  bottomPadding: number = 40
): CanvasOverflowResult {
  const threshold = canvasHeight - bottomPadding
  const overflowingElementIds: string[] = []
  let maxBottom = 0

  for (const el of elements) {
    if (el.hidden) continue
    const bottom = el.y + el.h
    if (bottom > maxBottom) {
      maxBottom = bottom
    }
    if (bottom > threshold) {
      overflowingElementIds.push(el.id)
    }
  }

  return {
    hasOverflow: overflowingElementIds.length > 0,
    overflowingElementIds,
    maxBottom,
  }
}

export * from "./types"
export * from "./constants"
export * from "./measure-text"
export * from "./measure-list"
export * from "./measure-code"
export * from "./measure-block"
