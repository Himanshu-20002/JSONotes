import type { PositionedBlock, LayoutMetrics, LayoutRect } from "./types"
import { LAYOUT_CONSTANTS } from "./constants"

export function detectCollisions(blocks: PositionedBlock[]): Array<{ a: string; b: string }> {
  const collisions: Array<{ a: string; b: string }> = []
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const b1 = blocks[i]
      const b2 = blocks[j]

      // Standard non-inclusive bounding box collision check
      const overlapsX = b1.x < b2.x + b2.width && b1.x + b1.width > b2.x
      const overlapsY = b1.y < b2.y + b2.height && b1.y + b1.height > b2.y

      if (overlapsX && overlapsY) {
        collisions.push({ a: b1.blockId, b: b2.blockId })
      }
    }
  }
  return collisions
}

export function validateBounds(
  blocks: PositionedBlock[],
  contentRegion: LayoutRect,
  canvasHeight: number = LAYOUT_CONSTANTS.canvas.height
): { overflowingIds: string[]; maxBottom: number } {
  const overflowingIds: string[] = []
  let maxBottom = 0

  const threshold = canvasHeight - LAYOUT_CONSTANTS.padding.bottom

  for (const b of blocks) {
    const bottom = b.y + b.height
    if (bottom > maxBottom) {
      maxBottom = bottom
    }
    if (bottom > threshold) {
      overflowingIds.push(b.blockId)
    }
  }

  return { overflowingIds, maxBottom }
}
