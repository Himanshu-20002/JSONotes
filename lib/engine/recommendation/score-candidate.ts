import type { LayoutResult, LayoutStrategy } from "../layout/types"
import type { ContentProfile, LayoutCandidateEvaluation, RecommendationReason, ScoreBreakdown } from "./types"
import { evaluateContentFit } from "./content-fit"
import { evaluateGeometryFit, evaluateReadability } from "./geometry-fit"
import { RECOMMENDATION_WEIGHTS } from "./constants"

export function scoreCandidate(
  strategy: LayoutStrategy,
  layoutResult: LayoutResult,
  profile: ContentProfile
): LayoutCandidateEvaluation {
  const contentEval = evaluateContentFit(strategy.id, profile)
  const geomEval = evaluateGeometryFit(layoutResult)
  const readEval = evaluateReadability(layoutResult)

  const baseScore =
    contentEval.score * RECOMMENDATION_WEIGHTS.contentFit +
    geomEval.score * RECOMMENDATION_WEIGHTS.geometryFit +
    readEval.score * RECOMMENDATION_WEIGHTS.readability

  const finalScore = Math.max(0, Math.round(baseScore - geomEval.overflowPenalty - geomEval.collisionPenalty))

  const breakdown: ScoreBreakdown = {
    contentFit: Math.round(contentEval.score),
    geometryFit: Math.round(geomEval.score),
    readability: Math.round(readEval.score),
    overflowPenalty: geomEval.overflowPenalty,
    collisionPenalty: geomEval.collisionPenalty,
    total: finalScore,
  }

  const allReasons: RecommendationReason[] = [
    ...contentEval.reasons,
    ...geomEval.reasons,
    ...readEval.reasons,
  ]

  return {
    layoutId: strategy.id,
    score: finalScore,
    breakdown,
    reasons: allReasons,
    layoutResult,
  }
}
