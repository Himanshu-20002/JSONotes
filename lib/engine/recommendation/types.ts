import type { LayoutId, LayoutResult } from "../layout/types"

export interface ContentProfile {
  blockCount: number
  codeBlockCount: number
  totalCodeLines: number
  codeRatio: number
  listBlockCount: number
  totalListItems: number
  conceptualBlockCount: number
  highImportanceBlockCount: number
  averageDensity: number
}

export interface LayoutPreferences {
  density: "auto" | "compact" | "comfortable"
  priority: "auto" | "readability" | "fit-more" | "code"
  structure: "auto" | "balanced" | "grid"
}

export interface ScoreBreakdown {
  contentFit: number
  geometryFit: number
  readability: number
  preferenceFit?: number
  overflowPenalty: number
  collisionPenalty: number
  total: number
}

export interface RecommendationReason {
  code: string
  message: string
  impact: "positive" | "negative" | "neutral"
}

export interface LayoutCandidateEvaluation {
  layoutId: LayoutId
  score: number
  breakdown: ScoreBreakdown
  reasons: RecommendationReason[]
  layoutResult: LayoutResult
}

export interface RecommendationResult {
  recommendedLayout: LayoutId
  confidence: number // 0 to 100
  candidates: LayoutCandidateEvaluation[]
  reasons: RecommendationReason[]
}
