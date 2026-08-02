import type { SemanticDocument, ContentAnalysis } from "../semantic/types"
import { getAvailableLayouts, getLayoutStrategy } from "../layout/registry"
import type { LayoutCandidateEvaluation, ContentProfile, RecommendationResult, RecommendationReason, LayoutPreferences } from "./types"
import { scoreCandidate } from "./score-candidate"

function buildContentProfile(doc: SemanticDocument, analysis?: ContentAnalysis): ContentProfile {
  const blockCount = doc.blocks.length
  const codeBlocks = doc.blocks.filter((b) => b.type === "code")
  const codeBlockCount = codeBlocks.length

  let totalCodeLines = 0
  codeBlocks.forEach((b) => {
    if (b.metadata?.codeLines) totalCodeLines += b.metadata.codeLines
  })

  const listBlocks = doc.blocks.filter((b) => b.type === "concept" || b.type === "summary" || b.type === "related")
  let totalListItems = 0
  listBlocks.forEach((b) => {
    if (Array.isArray(b.content)) totalListItems += b.content.length
  })

  const conceptualBlockCount = doc.blocks.filter(
    (b) => b.type === "definition" || b.type === "concept" || b.type === "summary"
  ).length

  const highImportanceBlockCount = doc.blocks.filter((b) => (b.importance || 3) >= 4).length

  return {
    blockCount,
    codeBlockCount,
    totalCodeLines,
    codeRatio: blockCount > 0 ? codeBlockCount / blockCount : 0,
    listBlockCount: listBlocks.length,
    totalListItems,
    conceptualBlockCount,
    highImportanceBlockCount,
    averageDensity: analysis?.density === "high" || analysis?.density === "extreme" ? 1.5 : 1.0,
  }
}

export function recommendLayout(
  doc: SemanticDocument,
  analysis?: ContentAnalysis,
  options?: { preferences?: LayoutPreferences }
): RecommendationResult {
  const profile = buildContentProfile(doc, analysis)
  const availableLayouts = getAvailableLayouts()
  const candidateEvaluations: LayoutCandidateEvaluation[] = []

  // 1. Candidate Generation & Evaluation across all registered strategies
  for (const meta of availableLayouts) {
    const strategy = getLayoutStrategy(meta.id)
    const layoutResult = strategy.createLayout(doc, { analysis })
    const candidateEval = scoreCandidate(strategy, layoutResult, profile, options?.preferences)
    candidateEvaluations.push(candidateEval)
  }

  // 2. Deterministic Tie-Breaking & Ranking
  candidateEvaluations.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (a.breakdown.collisionPenalty !== b.breakdown.collisionPenalty)
      return a.breakdown.collisionPenalty - b.breakdown.collisionPenalty
    if (a.breakdown.overflowPenalty !== b.breakdown.overflowPenalty)
      return a.breakdown.overflowPenalty - b.breakdown.overflowPenalty
    if (b.breakdown.readability !== a.breakdown.readability)
      return b.breakdown.readability - a.breakdown.readability
    if (b.breakdown.contentFit !== a.breakdown.contentFit)
      return b.breakdown.contentFit - a.breakdown.contentFit
    return a.layoutId.localeCompare(b.layoutId)
  })

  const winner = candidateEvaluations[0]
  const runnerUp = candidateEvaluations[1]

  // 3. Deterministic Confidence Calculation (winner vs runner-up separation)
  let confidence = 50
  if (runnerUp) {
    const gap = winner.score - runnerUp.score
    confidence = Math.min(100, Math.max(10, Math.round(50 + gap * 2.5)))
  } else {
    confidence = 95
  }

  const winnerReasons: RecommendationReason[] = winner.reasons.filter((r) => r.impact === "positive").slice(0, 3)
  if (winnerReasons.length === 0) {
    winnerReasons.push({
      code: "DEFAULT_BALANCED_WINNER",
      message: "Layout provides clean geometric fit and balanced structure.",
      impact: "neutral",
    })
  }

  return {
    recommendedLayout: winner.layoutId,
    confidence,
    candidates: candidateEvaluations,
    reasons: winnerReasons,
  }
}
