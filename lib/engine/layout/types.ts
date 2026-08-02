import type { ContentAnalysis, SemanticDocument } from "../semantic/types"

export type LayoutId = "balanced" | "code-focus" | "cheat-sheet" | "concept-grid"

export interface LayoutRect {
  x: number
  y: number
  width: number
  height: number
}

export interface PositionedBlock {
  blockId: string
  x: number
  y: number
  width: number
  height: number
  column: number
  span: 1 | 2 | 3
}

export type LayoutWarningType =
  | "CANVAS_OVERFLOW"
  | "BLOCK_OVERFLOW"
  | "COLLISION"
  | "INSUFFICIENT_SPACE"
  | "UNBALANCED_COLUMNS"

export interface LayoutWarning {
  type: LayoutWarningType
  blockId?: string
  message: string
}

export interface LayoutMetrics {
  usedHeight: number
  usedAreaRatio: number
  columnImbalance: number
  overflowCount: number
  collisionCount: number
}

export interface LayoutResult {
  blocks: PositionedBlock[]
  warnings: LayoutWarning[]
  metrics: LayoutMetrics
  hasOverflow: boolean
  columnCount: number
  columnWidth: number
}

export interface LayoutMetadata {
  id: LayoutId
  name: string
  description: string
  bestFor: string[]
  supportsCode: boolean
  supportsDenseContent: boolean
}

export interface LayoutContext {
  canvas: {
    width: number
    height: number
  }
  contentRegion: LayoutRect
  analysis: ContentAnalysis
  blockGap: number
  columnGap: number
}

export interface LayoutStrategy {
  id: LayoutId
  metadata: LayoutMetadata
  createLayout(document: SemanticDocument, context?: Partial<LayoutContext>): LayoutResult
}
