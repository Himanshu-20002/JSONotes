import type { SemanticBlock, SemanticDocument } from "../../semantic/types"
import { measureBlock } from "../../measurement/measure-block"
import { LAYOUT_CONSTANTS } from "../constants"
import type { LayoutRect, PositionedBlock, LayoutResult, LayoutWarning, LayoutStrategy, LayoutMetadata, LayoutContext } from "../types"
import { detectCollisions, validateBounds } from "../validation"
import { calculateMetrics } from "../metrics"
import { sortBlocksForReading } from "./balanced"

export const cheatSheetMetadata: LayoutMetadata = {
  id: "cheat-sheet",
  name: "Cheat Sheet",
  description: "A compact information-dense layout optimized for quick scanning and revision.",
  bestFor: ["revision notes", "interview preparation", "quick reference", "many short facts"],
  supportsCode: true,
  supportsDenseContent: true,
}

export function createCheatSheetLayout(doc: SemanticDocument, context?: Partial<LayoutContext>): LayoutResult {
  const warnings: LayoutWarning[] = []

  const totalUsableWidth = LAYOUT_CONSTANTS.canvas.width - LAYOUT_CONSTANTS.padding.left - LAYOUT_CONSTANTS.padding.right
  const startY = LAYOUT_CONSTANTS.header.contentStartY
  const maxUsableHeight = LAYOUT_CONSTANTS.canvas.height - startY - LAYOUT_CONSTANTS.padding.bottom

  const contentRegion: LayoutRect = context?.contentRegion || {
    x: LAYOUT_CONSTANTS.padding.left,
    y: startY,
    width: totalUsableWidth,
    height: maxUsableHeight,
  }

  // Cheat Sheet prefers 3 columns for 4+ blocks, 2 columns for 1-3 blocks
  const count = doc.blocks.length
  const columnCount = count <= 3 ? Math.min(count, 2) : 3
  const columnGap = context?.columnGap ?? LAYOUT_CONSTANTS.gaps.columnGap
  const blockGap = context?.blockGap ?? LAYOUT_CONSTANTS.gaps.blockGap
  const totalGaps = (columnCount - 1) * columnGap
  const columnWidth = Math.floor((contentRegion.width - totalGaps) / columnCount)

  const columnBottoms: number[] = Array(columnCount).fill(contentRegion.y)
  const positionedBlocks: PositionedBlock[] = []

  // Scan-friendly semantic role ordering priority
  const cheatSheetRolePriority: Record<string, number> = {
    definition: 10,
    concept: 9,
    summary: 8,
    code: 7,
    warning: 6,
    interview: 5,
    memory: 4,
    related: 3,
    note: 2,
  }

  const orderedBlocks = [...doc.blocks].sort((a, b) => {
    const roleA = cheatSheetRolePriority[a.type] || 1
    const roleB = cheatSheetRolePriority[b.type] || 1
    const roleDiff = roleB - roleA
    if (roleDiff !== 0) return roleDiff
    return (b.importance || 3) - (a.importance || 3)
  })

  for (const block of orderedBlocks) {
    // Cheat Sheet favors span 1 unless code/summary is unusually large
    let span: 1 | 2 = 1
    if (columnCount >= 2) {
      if (block.type === "code" && block.metadata?.codeLines && block.metadata.codeLines > 25) {
        span = 2
      } else if (block.type === "summary" && block.metadata?.itemCount && block.metadata.itemCount >= 8) {
        span = 2
      }
    }

    const effectiveSpan = Math.min(span, columnCount)
    const blockWidth = effectiveSpan === 1 ? columnWidth : columnWidth * effectiveSpan + columnGap * (effectiveSpan - 1)
    const measurement = measureBlock(block, { availableWidth: blockWidth })
    const blockHeight = measurement.height

    if (measurement.overflowRisk) {
      warnings.push({
        type: "BLOCK_OVERFLOW",
        blockId: block.id,
        message: `Block '${block.type}' is very tall (${blockHeight}px).`,
      })
    }

    if (effectiveSpan === 1) {
      // Find shortest column
      let targetCol = 0
      let minBottom = columnBottoms[0]
      for (let c = 1; c < columnCount; c++) {
        if (columnBottoms[c] < minBottom) {
          minBottom = columnBottoms[c]
          targetCol = c
        }
      }
      const placementY = columnBottoms[targetCol]
      const posX = contentRegion.x + targetCol * (columnWidth + columnGap)

      positionedBlocks.push({
        blockId: block.id,
        x: posX,
        y: placementY,
        width: blockWidth,
        height: blockHeight,
        column: targetCol,
        span: 1,
      })

      columnBottoms[targetCol] = placementY + blockHeight + blockGap
    } else {
      let bestStartCol = 0
      let minSpanY = Infinity
      for (let c = 0; c <= columnCount - effectiveSpan; c++) {
        let maxY = 0
        for (let s = 0; s < effectiveSpan; s++) {
          if (columnBottoms[c + s] > maxY) {
            maxY = columnBottoms[c + s]
          }
        }
        if (maxY < minSpanY) {
          minSpanY = maxY
          bestStartCol = c
        }
      }

      const targetCol = bestStartCol
      const placementY = minSpanY
      const posX = contentRegion.x + targetCol * (columnWidth + columnGap)

      positionedBlocks.push({
        blockId: block.id,
        x: posX,
        y: placementY,
        width: blockWidth,
        height: blockHeight,
        column: targetCol,
        span: effectiveSpan as 1 | 2,
      })

      const newBottom = placementY + blockHeight + blockGap
      for (let s = 0; s < effectiveSpan; s++) {
        columnBottoms[targetCol + s] = newBottom
      }
    }
  }

  const collisions = detectCollisions(positionedBlocks)
  for (const c of collisions) {
    warnings.push({
      type: "COLLISION",
      blockId: c.a,
      message: `Collision detected between blocks ${c.a} and ${c.b}`,
    })
  }

  const { overflowingIds } = validateBounds(positionedBlocks, contentRegion)
  if (overflowingIds.length > 0) {
    warnings.push({
      type: "CANVAS_OVERFLOW",
      message: `${overflowingIds.length} block(s) exceed canvas bottom bound.`,
    })
  }

  const metrics = calculateMetrics(
    positionedBlocks,
    columnBottoms,
    contentRegion,
    collisions.length,
    overflowingIds.length
  )

  return {
    blocks: positionedBlocks,
    warnings,
    metrics,
    hasOverflow: overflowingIds.length > 0,
    columnCount,
    columnWidth,
  }
}

export const cheatSheetLayoutStrategy: LayoutStrategy = {
  id: "cheat-sheet",
  metadata: cheatSheetMetadata,
  createLayout: createCheatSheetLayout,
}
