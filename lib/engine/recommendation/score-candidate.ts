import type { LayoutResult, LayoutStrategy } from "../layout/types"
import type { ContentProfile, LayoutCandidateEvaluation, LayoutPreferences, RecommendationReason, ScoreBreakdown } from "./types"
import { evaluateContentFit } from "./content-fit"
import { evaluateGeometryFit, evaluateReadability } from "./geometry-fit"
import { evaluatePreferenceFit } from "./preference-fit"
import { RECOMMENDATION_WEIGHTS } from "./constants"

export function scoreCandidate(
  strategy: LayoutStrategy,
  layoutResult: LayoutResult,
  profile: ContentProfile,
  preferences?: LayoutPreferences
): LayoutCandidateEvaluation {
  const contentEval = evaluateContentFit(strategy.id, profile)
  const geomEval = evaluateGeometryFit(layoutResult)
  const readEval = evaluateReadability(layoutResult)
  const prefEval = evaluatePreferenceFit(strategy.id, profile, preferences)

  const hasCustomPref =
    preferences &&
    (preferences.density !== "auto" || preferences.priority !== "auto" || preferences.structure !== "auto")

  let baseScore = 0
  if (hasCustomPref) {
    baseScore =
      contentEval.score * 0.40 +
      geomEval.score * 0.30 +
      readEval.score * 0.20 +
      prefEval.score * 0.10
  } else {
    baseScore =
      contentEval.score * RECOMMENDATION_WEIGHTS.contentFit +
      geomEval.score * RECOMMENDATION_WEIGHTS.geometryFit +
      readEval.score * RECOMMENDATION_WEIGHTS.readability
  }

  const finalScore = Math.max(0, Math.round(baseScore - geomEval.overflowPenalty - geomEval.collisionPenalty))

  const breakdown: ScoreBreakdown = {
    contentFit: Math.round(contentEval.score),
    geometryFit: Math.round(geomEval.score),
    readability: Math.round(readEval.score),
    preferenceFit: Math.round(prefEval.score),
    overflowPenalty: geomEval.overflowPenalty,
    collisionPenalty: geomEval.collisionPenalty,
    total: finalScore,
  }

  const allReasons: RecommendationReason[] = [
    ...contentEval.reasons,
    ...geomEval.reasons,
    ...readEval.reasons,
    ...prefEval.reasons,
  ]

  return {
    layoutId: strategy.id,
    score: finalScore,
    breakdown,
    reasons: allReasons,
    layoutResult,
  }
}
