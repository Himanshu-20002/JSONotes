import type { SemanticBlock } from "../semantic/types"
import { MEASUREMENT_CONSTANTS } from "./constants"
import { measureText } from "./measure-text"
import { measureList } from "./measure-list"
import { measureCode } from "./measure-code"
import type { BlockMeasurement, MeasurementConstraints, MeasurementWarning } from "./types"

export function measureBlock(
  block: SemanticBlock,
  constraints: MeasurementConstraints
): BlockMeasurement {
  const width = constraints.availableWidth
  const warnings: MeasurementWarning[] = []
  let calculatedHeight = 0
  let contentHeight = 0
  let estimatedLines = 1
  let minHeight = 140
  let softMax = 500

  switch (block.type) {
    case "definition": {
      minHeight = MEASUREMENT_CONSTANTS.minHeights.definition
      softMax = MEASUREMENT_CONSTANTS.softMaxHeights.text
      const textVal = String(block.content)

      const titleRes = measureText({
        text: block.title || "Definition",
        availableWidth: width,
        fontSize: MEASUREMENT_CONSTANTS.typography.title.fontSize,
        lineHeight: MEASUREMENT_CONSTANTS.typography.title.lineHeight,
        paddingX: 0,
        paddingY: 0,
      })

      const bodyRes = measureText({
        text: textVal,
        availableWidth: width,
        fontSize: MEASUREMENT_CONSTANTS.typography.body.fontSize,
        lineHeight: MEASUREMENT_CONSTANTS.typography.body.lineHeight,
      })

      contentHeight = bodyRes.contentHeight + titleRes.contentHeight
      calculatedHeight = bodyRes.totalHeight + titleRes.contentHeight
      estimatedLines = bodyRes.estimatedLines
      break
    }

    case "concept": {
      minHeight = MEASUREMENT_CONSTANTS.minHeights.concept
      softMax = MEASUREMENT_CONSTANTS.softMaxHeights.list
      const items = Array.isArray(block.content) ? block.content.map(String) : [String(block.content)]

      const listRes = measureList({
        items,
        availableWidth: width,
        hasTitle: true,
        titleText: block.title || "Key Concepts",
      })

      contentHeight = listRes.contentHeight
      calculatedHeight = listRes.totalHeight
      estimatedLines = listRes.estimatedLines
      if (items.length > 8) warnings.push("TOO_MANY_ITEMS")
      break
    }

    case "related": {
      minHeight = MEASUREMENT_CONSTANTS.minHeights.related
      softMax = MEASUREMENT_CONSTANTS.softMaxHeights.list
      const items = Array.isArray(block.content) ? block.content.map(String) : [String(block.content)]

      const listRes = measureList({
        items,
        availableWidth: width,
        hasTitle: true,
        titleText: block.title || "Related Topics",
      })

      contentHeight = listRes.contentHeight
      calculatedHeight = listRes.totalHeight
      estimatedLines = listRes.estimatedLines
      if (items.length > 8) warnings.push("TOO_MANY_ITEMS")
      break
    }

    case "summary": {
      minHeight = MEASUREMENT_CONSTANTS.minHeights.summary
      softMax = MEASUREMENT_CONSTANTS.softMaxHeights.list
      const items = Array.isArray(block.content) ? block.content.map(String) : [String(block.content)]

      const listRes = measureList({
        items,
        availableWidth: width,
        hasTitle: true,
        titleText: block.title || "Quick Revision Summary",
      })

      contentHeight = listRes.contentHeight
      calculatedHeight = listRes.totalHeight
      estimatedLines = listRes.estimatedLines
      if (items.length > 8) warnings.push("TOO_MANY_ITEMS")
      break
    }

    case "code": {
      minHeight = MEASUREMENT_CONSTANTS.minHeights.code
      softMax = MEASUREMENT_CONSTANTS.softMaxHeights.code
      const codeObj = block.content as { language?: string; code: string }
      const codeText = typeof codeObj === "object" && codeObj !== null ? codeObj.code || "" : String(block.content)

      const codeRes = measureCode({
        code: codeText,
        availableWidth: width,
      })

      contentHeight = codeRes.contentHeight
      calculatedHeight = codeRes.totalHeight
      estimatedLines = codeRes.estimatedLines
      if (estimatedLines > 25) warnings.push("CODE_TOO_LONG")
      break
    }

    case "interview":
    case "warning":
    case "memory": {
      minHeight = MEASUREMENT_CONSTANTS.minHeights[block.type as keyof typeof MEASUREMENT_CONSTANTS.minHeights] ?? 140
      softMax = MEASUREMENT_CONSTANTS.softMaxHeights.text
      const textVal = String(block.content)

      const titleRes = measureText({
        text: block.title || "Heading",
        availableWidth: width,
        fontSize: MEASUREMENT_CONSTANTS.typography.title.fontSize,
        lineHeight: MEASUREMENT_CONSTANTS.typography.title.lineHeight,
        paddingX: 0,
        paddingY: 0,
      })

      const bodyRes = measureText({
        text: textVal,
        availableWidth: width,
        fontSize: MEASUREMENT_CONSTANTS.typography.body.fontSize,
        lineHeight: MEASUREMENT_CONSTANTS.typography.body.lineHeight,
      })

      contentHeight = bodyRes.contentHeight + titleRes.contentHeight
      calculatedHeight = bodyRes.totalHeight + titleRes.contentHeight
      estimatedLines = bodyRes.estimatedLines
      break
    }

    case "note":
    default: {
      minHeight = MEASUREMENT_CONSTANTS.minHeights.note
      softMax = MEASUREMENT_CONSTANTS.softMaxHeights.text
      const textVal = String(block.content)

      const bodyRes = measureText({
        text: textVal,
        availableWidth: width,
        fontSize: MEASUREMENT_CONSTANTS.typography.sticky.fontSize,
        lineHeight: MEASUREMENT_CONSTANTS.typography.sticky.lineHeight,
        paddingX: MEASUREMENT_CONSTANTS.typography.sticky.paddingX,
        paddingY: MEASUREMENT_CONSTANTS.typography.sticky.paddingY,
      })

      contentHeight = bodyRes.contentHeight
      calculatedHeight = bodyRes.totalHeight
      estimatedLines = bodyRes.estimatedLines
      break
    }
  }

  // Enforce minimum height constraint
  const finalHeight = Math.max(minHeight, calculatedHeight)

  let overflowRisk = false
  if (finalHeight > softMax) {
    overflowRisk = true
    warnings.push("BLOCK_TOO_TALL")
  }

  return {
    width,
    height: finalHeight,
    contentHeight,
    estimatedLines,
    overflowRisk,
    warnings,
  }
}
