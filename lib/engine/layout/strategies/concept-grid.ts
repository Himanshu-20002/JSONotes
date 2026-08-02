import type { SemanticBlock, SemanticDocument } from "../../semantic/types"
import { measureBlock } from "../../measurement/measure-block"
import { LAYOUT_CONSTANTS } from "../constants"
import type { LayoutRect, PositionedBlock, LayoutResult, LayoutWarning, LayoutStrategy, LayoutMetadata, LayoutContext } from "../types"
import { detectCollisions, validateBounds } from "../validation"
import { calculateMetrics } from "../metrics"

export const conceptGridMetadata: LayoutMetadata = {
  id: "concept-grid",
  name: "Concept Grid",
  description: "A structured card grid designed for concepts, definitions and related knowledge.",
  bestFor: ["concept learning", "definitions", "topic summaries", "visual study notes"],
  supportsCode: true,
  supportsDenseContent: false,
}

export function createConceptGridLayout(doc: SemanticDocument, context?: Partial<LayoutContext>): LayoutResult {
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

  // Concept Grid prefers structured 2-column layout (or 1 for minimal content)
  const count = doc.blocks.length
  const columnCount = count <= 1 ? 1 : 2
  const columnGap = context?.columnGap ?? LAYOUT_CONSTANTS.gaps.columnGap
  const blockGap = context?.blockGap ?? LAYOUT_CONSTANTS.gaps.blockGap
  const totalGaps = (columnCount - 1) * columnGap
  const columnWidth = Math.floor((contentRegion.width - totalGaps) / columnCount)

  const positionedBlocks: PositionedBlock[] = []
  let currentY = contentRegion.y

  // Sort blocks emphasizing foundational conceptual hierarchy
  const conceptualRolePriority: Record<string, number> = {
    definition: 10,
    concept: 9,
    summary: 8,
    memory: 7,
    warning: 6,
    interview: 5,
    related: 4,
    code: 3,
    note: 2,
  }

  const remainingBlocks = [...doc.blocks].sort((a, b) => {
    const roleA = conceptualRolePriority[a.type] || 1
    const roleB = conceptualRolePriority[b.type] || 1
    const roleDiff = roleB - roleA
    if (roleDiff !== 0) return roleDiff
    return (b.importance || 3) - (a.importance || 3)
  })

  // Row Planner Loop
  while (remainingBlocks.length > 0) {
    if (columnCount === 1) {
      const block = remainingBlocks.shift()!
      const m = measureBlock(block, { availableWidth: columnWidth })
      positionedBlocks.push({
        blockId: block.id,
        x: contentRegion.x,
        y: currentY,
        width: columnWidth,
        height: m.height,
        column: 0,
        span: 1,
      })
      currentY += m.height + blockGap
      continue
    }

    const nextBlock = remainingBlocks[0]

    // Check if next block requires full row (large code or wide block)
    const isWideBlock =
      nextBlock.preferredSize === "wide" ||
      (nextBlock.type === "code" && nextBlock.metadata?.codeLines && nextBlock.metadata.codeLines > 15)

    if (isWideBlock) {
      remainingBlocks.shift()
      const fullWidth = columnWidth * 2 + columnGap
      const m = measureBlock(nextBlock, { availableWidth: fullWidth })
      positionedBlocks.push({
        blockId: nextBlock.id,
        x: contentRegion.x,
        y: currentY,
        width: fullWidth,
        height: m.height,
        column: 0,
        span: 2,
      })
      currentY += m.height + blockGap
      continue
    }

    // Take up to 2 complementary blocks for current row
    const rowBlocks: SemanticBlock[] = [remainingBlocks.shift()!]
    if (remainingBlocks.length > 0) {
      const secondBlock = remainingBlocks[0]
      const secondIsWide =
        secondBlock.preferredSize === "wide" ||
        (secondBlock.type === "code" && secondBlock.metadata?.codeLines && secondBlock.metadata.codeLines > 15)

      if (!secondIsWide) {
        rowBlocks.push(remainingBlocks.shift()!)
      }
    }

    // Measure row blocks and compute max row height
    let maxRowHeight = 0
    rowBlocks.forEach((b, colIdx) => {
      const m = measureBlock(b, { availableWidth: columnWidth })
      if (m.height > maxRowHeight) maxRowHeight = m.height
      if (m.overflowRisk) {
        warnings.push({
          type: "BLOCK_OVERFLOW",
          blockId: b.id,
          message: `Block '${b.type}' is very tall (${m.height}px).`,
        })
      }

      const posX = contentRegion.x + colIdx * (columnWidth + columnGap)
      positionedBlocks.push({
        blockId: b.id,
        x: posX,
        y: currentY,
        width: columnWidth,
        height: m.height,
        column: colIdx,
        span: 1,
      })
    })

    // Advance row by max card height in the row
    currentY += maxRowHeight + blockGap
  }

  const columnBottoms = [currentY, currentY]

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

export const conceptGridLayoutStrategy: LayoutStrategy = {
  id: "concept-grid",
  metadata: conceptGridMetadata,
  createLayout: createConceptGridLayout,
}
