import type { SemanticBlock } from "../semantic/types"

export interface MeasurementConstraints {
  availableWidth: number
  density?: "spacious" | "balanced" | "compact"
}

export type MeasurementWarning =
  | "TEXT_TOO_LONG"
  | "CODE_TOO_LONG"
  | "TOO_MANY_ITEMS"
  | "BLOCK_TOO_TALL"

export interface BlockMeasurement {
  width: number
  height: number
  contentHeight: number
  estimatedLines?: number
  overflowRisk: boolean
  warnings: MeasurementWarning[]
}

export interface CanvasOverflowResult {
  hasOverflow: boolean
  overflowingElementIds: string[]
  maxBottom: number
}
