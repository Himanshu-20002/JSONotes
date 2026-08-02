import { MEASUREMENT_CONSTANTS } from "./constants"

export interface CodeMeasurementInput {
  code: string
  availableWidth: number
}

export function measureCode(input: CodeMeasurementInput): {
  estimatedLines: number
  contentHeight: number
  totalHeight: number
} {
  const codeConst = MEASUREMENT_CONSTANTS.typography.code
  const explicitLines = input.code.split("\n")
  const numLines = explicitLines.length

  const codeLinePx = codeConst.fontSize * codeConst.lineHeight
  const contentHeight = numLines * codeLinePx

  // Code Block in renderer uses whiteSpace: "pre-wrap" with line numbers
  // Note: Code block renderer has header (37px) + padding top/bottom (28px)
  const totalHeight = contentHeight + codeConst.headerHeight + codeConst.paddingY + MEASUREMENT_CONSTANTS.safetyMarginY

  return {
    estimatedLines: numLines,
    contentHeight,
    totalHeight: Math.ceil(totalHeight),
  }
}
