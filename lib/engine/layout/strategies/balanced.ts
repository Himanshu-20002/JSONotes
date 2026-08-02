import type { SemanticBlock, SemanticDocument } from "../../semantic/types"
import type { ContentAnalysis } from "../../semantic/types"
import { measureBlock } from "../../measurement/measure-block"
import { LAYOUT_CONSTANTS } from "../constants"
import type { LayoutRect, PositionedBlock, LayoutResult, LayoutWarning, LayoutStrategy, LayoutMetadata, LayoutContext } from "../types"
import { detectCollisions, validateBounds } from "../validation"
import { calculateMetrics } from "../metrics"

export const balancedMetadata: LayoutMetadata = {
  id: "balanced",
  name: "Balanced",
  description: "Distributes mixed content across a balanced adaptive grid.",
  bestFor: ["mixed notes", "general study notes", "definitions and summaries"],
  supportsCode: true,
  supportsDenseContent: true,
}

function chooseColumnCount(doc: SemanticDocument, analysis?: ContentAnalysis): number {
  const count = doc.blocks.length
  if (count <= 2) return Math.min(count, 2)
  if (count <= 5) return 2
  return 3
}

function isFeatureBlock(block: SemanticBlock): boolean {
  if (block.importance === 5 && (block.preferredSize === "wide" || block.preferredSize === "large" || block.preferredSize === "tall")) {
    return true
  }
  if (block.type === "code" && block.metadata?.codeLines && block.metadata.codeLines > 12) {
    return true
  }
  if (block.type === "summary" && block.metadata?.itemCount && block.metadata.itemCount >= 5) {
    return true
  }
  return false
}

function determineSpan(block: SemanticBlock, columnCount: number, featureCount: number): 1 | 2 | 3 {
  if (columnCount === 1) return 1
  if (isFeatureBlock(block) && featureCount <= 2) {
    if (columnCount >= 2) return 2
  }
  if (block.preferredSize === "wide" && columnCount >= 2) {
    return 2
  }
  return 1
}

export function sortBlocksForReading(blocks: SemanticBlock[]): SemanticBlock[] {
  const rolePriority: Record<string, number> = {
    definition: 10,
    concept: 9,
    code: 8,
    summary: 7,
    interview: 6,
    warning: 5,
    memory: 4,
    related: 3,
    note: 2,
  }

  return [...blocks].sort((a, b) => {
    const impDiff = (b.importance || 3) - (a.importance || 3)
    if (impDiff !== 0) return impDiff

    const roleA = rolePriority[a.type] || 1
    const roleB = rolePriority[b.type] || 1
    const roleDiff = roleB - roleA
    if (roleDiff !== 0) return roleDiff

    return a.id.localeCompare(b.id)
  })
}

export function createBalancedLayout(doc: SemanticDocument, context?: Partial<LayoutContext>): LayoutResult {
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

  const columnCount = chooseColumnCount(doc, context?.analysis)
  const columnGap = context?.columnGap ?? LAYOUT_CONSTANTS.gaps.columnGap
  const blockGap = context?.blockGap ?? LAYOUT_CONSTANTS.gaps.blockGap
  const totalGaps = (columnCount - 1) * columnGap
  const columnWidth = Math.floor((contentRegion.width - totalGaps) / columnCount)

  const columnBottoms: number[] = Array(columnCount).fill(contentRegion.y)
  const positionedBlocks: PositionedBlock[] = []
  let featureCount = 0

  const orderedBlocks = sortBlocksForReading(doc.blocks)

  for (let index = 0; index < orderedBlocks.length; index++) {
    const block = orderedBlocks[index]
    const span = determineSpan(block, columnCount, featureCount)
    if (span > 1) featureCount++

    const blockWidth = span === 1 ? columnWidth : columnWidth * span + columnGap * (span - 1)
    const measurement = measureBlock(block, { availableWidth: blockWidth })
    const blockHeight = measurement.height

    if (measurement.overflowRisk) {
      warnings.push({
        type: "BLOCK_OVERFLOW",
        blockId: block.id,
        message: `Block '${block.type}' is very tall (${blockHeight}px).`,
      })
    }

    let targetCol = 0
    let placementY = contentRegion.y

    if (span === 1) {
      let minBottom = columnBottoms[0]
      for (let c = 1; c < columnCount; c++) {
        if (columnBottoms[c] < minBottom) {
          minBottom = columnBottoms[c]
          targetCol = c
        }
      }
      placementY = columnBottoms[targetCol]
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
      const effectiveSpan = Math.min(span, columnCount)
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

      targetCol = bestStartCol
      placementY = minSpanY
      const posX = contentRegion.x + targetCol * (columnWidth + columnGap)

      positionedBlocks.push({
        blockId: block.id,
        x: posX,
        y: placementY,
        width: blockWidth,
        height: blockHeight,
        column: targetCol,
        span: effectiveSpan as 1 | 2 | 3,
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

export const balancedLayoutStrategy: LayoutStrategy = {
  id: "balanced",
  metadata: balancedMetadata,
  createLayout: createBalancedLayout,
}
