import type { SemanticBlock, SemanticDocument } from "../../semantic/types"
import { measureBlock } from "../../measurement/measure-block"
import { LAYOUT_CONSTANTS } from "../constants"
import type { LayoutRect, PositionedBlock, LayoutResult, LayoutWarning, LayoutStrategy, LayoutMetadata, LayoutContext } from "../types"
import { detectCollisions, validateBounds } from "../validation"
import { calculateMetrics } from "../metrics"
import { sortBlocksForReading, createBalancedLayout } from "./balanced"

export const codeFocusMetadata: LayoutMetadata = {
  id: "code-focus",
  name: "Code Focus",
  description: "Prioritizes code examples while keeping explanations and revision notes nearby.",
  bestFor: ["programming notes", "API references", "technical interview preparation"],
  supportsCode: true,
  supportsDenseContent: true,
}

export function createCodeFocusLayout(doc: SemanticDocument, context?: Partial<LayoutContext>): LayoutResult {
  const codeBlocks = doc.blocks.filter((b) => b.type === "code")

  // Fallback to Balanced Layout if document contains NO code blocks
  if (codeBlocks.length === 0) {
    return createBalancedLayout(doc, context)
  }

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

  const columnGap = context?.columnGap ?? LAYOUT_CONSTANTS.gaps.columnGap
  const blockGap = context?.blockGap ?? LAYOUT_CONSTANTS.gaps.blockGap

  // Find Primary Code Block (highest importance or longest code)
  const primaryCodeBlock = [...codeBlocks].sort((a, b) => {
    const impDiff = (b.importance || 3) - (a.importance || 3)
    if (impDiff !== 0) return impDiff
    const linesA = a.metadata?.codeLines || 0
    const linesB = b.metadata?.codeLines || 0
    return linesB - linesA
  })[0]

  // Split content region horizontally into 40% Support Column / 60% Code Region
  const supportWidth = Math.floor((contentRegion.width - columnGap) * 0.40)
  const codeWidth = contentRegion.width - columnGap - supportWidth

  const supportX = contentRegion.x
  const codeX = contentRegion.x + supportWidth + columnGap

  const positionedBlocks: PositionedBlock[] = []

  // 1. Position Primary Code Block in Code Region
  const codeMeasurement = measureBlock(primaryCodeBlock, { availableWidth: codeWidth })
  const codeHeight = codeMeasurement.height

  if (codeMeasurement.overflowRisk) {
    warnings.push({
      type: "BLOCK_OVERFLOW",
      blockId: primaryCodeBlock.id,
      message: `Code block is tall (${codeHeight}px).`,
    })
  }

  positionedBlocks.push({
    blockId: primaryCodeBlock.id,
    x: codeX,
    y: contentRegion.y,
    width: codeWidth,
    height: codeHeight,
    column: 1,
    span: 2,
  })

  const codeRegionBottom = contentRegion.y + codeHeight + blockGap
  let supportY = contentRegion.y

  // 2. Separate remaining supporting blocks
  const remainingBlocks = doc.blocks.filter((b) => b.id !== primaryCodeBlock.id)
  const sortedSupport = sortBlocksForReading(remainingBlocks)

  const sideBlocks: SemanticBlock[] = []
  const lowerBlocks: SemanticBlock[] = []

  // Fill supporting side column up to primary code block height (or 2-3 key blocks)
  for (const block of sortedSupport) {
    const m = measureBlock(block, { availableWidth: supportWidth })
    if (supportY + m.height <= Math.max(codeRegionBottom, contentRegion.y + 450) || sideBlocks.length < 2) {
      positionedBlocks.push({
        blockId: block.id,
        x: supportX,
        y: supportY,
        width: supportWidth,
        height: m.height,
        column: 0,
        span: 1,
      })
      supportY += m.height + blockGap
      sideBlocks.push(block)
    } else {
      lowerBlocks.push(block)
    }
  }

  const columnBottoms: number[] = [supportY, codeRegionBottom]

  // 3. Lower Region Placement for leftover supporting blocks below code & side column
  if (lowerBlocks.length > 0) {
    const lowerRegionY = Math.max(supportY, codeRegionBottom)
    const lowerColumnCount = Math.min(lowerBlocks.length, 3)
    const lowerGaps = (lowerColumnCount - 1) * columnGap
    const lowerColWidth = Math.floor((contentRegion.width - lowerGaps) / lowerColumnCount)

    const lowerBottoms: number[] = Array(lowerColumnCount).fill(lowerRegionY)

    for (const b of lowerBlocks) {
      // Find shortest column in lower region
      let targetCol = 0
      let minB = lowerBottoms[0]
      for (let c = 1; c < lowerColumnCount; c++) {
        if (lowerBottoms[c] < minB) {
          minB = lowerBottoms[c]
          targetCol = c
        }
      }

      const m = measureBlock(b, { availableWidth: lowerColWidth })
      const posX = contentRegion.x + targetCol * (lowerColWidth + columnGap)
      const posY = lowerBottoms[targetCol]

      positionedBlocks.push({
        blockId: b.id,
        x: posX,
        y: posY,
        width: lowerColWidth,
        height: m.height,
        column: targetCol,
        span: 1,
      })

      lowerBottoms[targetCol] = posY + m.height + blockGap
    }

    columnBottoms.push(...lowerBottoms)
  }

  // 4. Validation & Metrics
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
    columnCount: 2,
    columnWidth: codeWidth,
  }
}

export const codeFocusLayoutStrategy: LayoutStrategy = {
  id: "code-focus",
  metadata: codeFocusMetadata,
  createLayout: createCodeFocusLayout,
}
