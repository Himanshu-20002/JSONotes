import { MEASUREMENT_CONSTANTS } from "./constants"
import { measureText } from "./measure-text"

export interface ListMeasurementInput {
  items: string[]
  availableWidth: number
  hasTitle?: boolean
  titleText?: string
}

export function measureList(input: ListMeasurementInput): {
  estimatedLines: number
  contentHeight: number
  totalHeight: number
} {
  const { items, availableWidth, hasTitle = true, titleText } = input
  const listConst = MEASUREMENT_CONSTANTS.typography.list
  const cardConst = MEASUREMENT_CONSTANTS.card

  const itemUsableWidth = Math.max(
    50,
    availableWidth - cardConst.paddingX - listConst.bulletWidth - cardConst.borderWidth
  )

  let totalLines = 0
  let itemsContentHeight = 0

  for (const item of items) {
    const itemRes = measureText({
      text: item,
      availableWidth: itemUsableWidth + cardConst.paddingX,
      fontSize: listConst.fontSize,
      lineHeight: listConst.lineHeight,
      charWidthFactor: listConst.charWidthFactor,
      paddingX: 0,
      paddingY: 0,
    })
    totalLines += itemRes.estimatedLines
    itemsContentHeight += itemRes.contentHeight
  }

  const gapHeight = Math.max(0, items.length - 1) * listConst.itemGap
  let headerHeight = hasTitle ? cardConst.titleHeaderHeight + cardConst.titleHeaderGap : 0

  if (titleText) {
    const titleRes = measureText({
      text: titleText,
      availableWidth: Math.max(50, availableWidth - cardConst.paddingX),
      fontSize: MEASUREMENT_CONSTANTS.typography.title.fontSize,
      lineHeight: MEASUREMENT_CONSTANTS.typography.title.lineHeight,
      paddingX: 0,
      paddingY: 0,
    })
    headerHeight = titleRes.contentHeight + cardConst.titleHeaderGap
  }

  const contentHeight = itemsContentHeight + gapHeight
  const totalHeight = contentHeight + headerHeight + cardConst.paddingY + MEASUREMENT_CONSTANTS.safetyMarginY

  return {
    estimatedLines: totalLines,
    contentHeight,
    totalHeight: Math.ceil(totalHeight),
  }
}
