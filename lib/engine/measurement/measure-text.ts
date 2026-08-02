import { MEASUREMENT_CONSTANTS } from "./constants"

export interface TextMeasurementInput {
  text: string
  availableWidth: number
  fontSize?: number
  lineHeight?: number
  charWidthFactor?: number
  paddingX?: number
  paddingY?: number
  titleHeight?: number
}

export function measureText(input: TextMeasurementInput): {
  estimatedLines: number
  contentHeight: number
  totalHeight: number
} {
  const fontSize = input.fontSize ?? MEASUREMENT_CONSTANTS.typography.body.fontSize
  const lineHeight = input.lineHeight ?? MEASUREMENT_CONSTANTS.typography.body.lineHeight
  const charWidthFactor = input.charWidthFactor ?? MEASUREMENT_CONSTANTS.typography.body.charWidthFactor
  const paddingX = input.paddingX ?? MEASUREMENT_CONSTANTS.card.paddingX
  const paddingY = input.paddingY ?? MEASUREMENT_CONSTANTS.card.paddingY
  const titleHeight = input.titleHeight ?? 0

  const usableWidth = Math.max(50, input.availableWidth - paddingX - MEASUREMENT_CONSTANTS.card.borderWidth)
  const approxCharWidth = fontSize * charWidthFactor
  const charsPerLine = Math.max(10, Math.floor(usableWidth / approxCharWidth))

  const explicitLines = input.text.split("\n")
  let totalWrappedLines = 0

  for (const line of explicitLines) {
    if (line.trim().length === 0) {
      totalWrappedLines += 1
      continue
    }

    const words = line.split(" ")
    let currentLineLength = 0

    for (const word of words) {
      // Long word handling (URLs / identifier strings)
      let wordLen = word.length
      while (wordLen > charsPerLine) {
        totalWrappedLines += 1
        wordLen -= charsPerLine
        currentLineLength = 0
      }

      if (currentLineLength + wordLen + (currentLineLength > 0 ? 1 : 0) > charsPerLine) {
        totalWrappedLines += 1
        currentLineLength = wordLen
      } else {
        currentLineLength += wordLen + (currentLineLength > 0 ? 1 : 0)
      }
    }

    if (currentLineLength > 0) {
      totalWrappedLines += 1
    }
  }

  const linePx = fontSize * lineHeight
  const contentHeight = totalWrappedLines * linePx
  const totalHeight = contentHeight + paddingY + titleHeight + MEASUREMENT_CONSTANTS.safetyMarginY

  return {
    estimatedLines: totalWrappedLines,
    contentHeight,
    totalHeight: Math.ceil(totalHeight),
  }
}
