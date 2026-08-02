import type { LayoutResult } from "../layout/types"
import { LAYOUT_CONSTANTS } from "../layout/constants"
import type { RecommendationReason } from "./types"

export function evaluateGeometryFit(layoutResult: LayoutResult): {
  score: number
  overflowPenalty: number
  collisionPenalty: number
  reasons: RecommendationReason[]
} {
  const reasons: RecommendationReason[] = []
  let score = 85 // Baseline geometry score
  let overflowPenalty = 0
  let collisionPenalty = 0

  // 1. Collision Penalty
  const collisionCount = layoutResult.metrics.collisionCount
  if (collisionCount > 0) {
    collisionPenalty = collisionCount * 50
    reasons.push({
      code: "COLLISION_DETECTED",
      message: `Layout contains ${collisionCount} overlapping element pair(s).`,
      impact: "negative",
    })
  }

  // 2. Overflow Penalty & Severity
  const canvasHeight = LAYOUT_CONSTANTS.canvas.height
  const maxAllowedY = canvasHeight - LAYOUT_CONSTANTS.padding.bottom
  const maxBlockBottom = Math.max(...layoutResult.blocks.map((b) => b.y + b.height), 0)

  if (maxBlockBottom > maxAllowedY) {
    const overflowPixels = maxBlockBottom - maxAllowedY
    overflowPenalty = 25 + Math.round(overflowPixels * 0.1)
    reasons.push({
      code: "CANVAS_OVERFLOW",
      message: `Layout exceeds canvas height by ${Math.round(overflowPixels)}px.`,
      impact: "negative",
    })
  }

  // 3. Canvas Area Utilization Band (Optimal target: 0.40 - 0.85)
  const ratio = layoutResult.metrics.usedAreaRatio
  if (ratio >= 0.40 && ratio <= 0.85) {
    score += 15
    reasons.push({
      code: "OPTIMAL_AREA_UTILIZATION",
      message: "Optimal canvas surface area utilization.",
      impact: "positive",
    })
  } else if (ratio < 0.25) {
    score -= 15
    reasons.push({
      code: "SPARSE_CANVAS",
      message: "Canvas layout is overly sparse with significant unused space.",
      impact: "neutral",
    })
  } else if (ratio > 0.90) {
    score -= 15
    reasons.push({
      code: "CRAMPED_CANVAS",
      message: "Canvas layout is extremely crowded.",
      impact: "negative",
    })
  }

  // 4. Column Imbalance (for symmetric layouts)
  if (layoutResult.columnCount > 1 && layoutResult.metrics.columnImbalance > 150) {
    score -= 10
    reasons.push({
      code: "HIGH_COLUMN_IMBALANCE",
      message: "Columns exhibit significant vertical length disparity.",
      impact: "neutral",
    })
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    overflowPenalty,
    collisionPenalty,
    reasons,
  }
}

export function evaluateReadability(layoutResult: LayoutResult): { score: number; reasons: RecommendationReason[] } {
  let score = 80
  const reasons: RecommendationReason[] = []

  // Check card width comfort
  const colWidth = layoutResult.columnWidth
  if (colWidth >= 600 && colWidth <= 1400) {
    score += 15
    reasons.push({
      code: "COMFORTABLE_READING_WIDTH",
      message: "Card width offers optimal line length and readability.",
      impact: "positive",
    })
  } else if (colWidth < 450) {
    score -= 15
    reasons.push({
      code: "NARROW_CARD_WIDTH",
      message: "Narrow card width forces excessive text wrapping.",
      impact: "negative",
    })
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons,
  }
}
