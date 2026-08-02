import type { LayoutId } from "../layout/types"
import type { ContentProfile, RecommendationReason } from "./types"

export function evaluateContentFit(
  layoutId: LayoutId,
  profile: ContentProfile
): { score: number; reasons: RecommendationReason[] } {
  let score = 70 // Baseline neutral score
  const reasons: RecommendationReason[] = []

  switch (layoutId) {
    case "balanced": {
      if (profile.blockCount >= 3 && profile.blockCount <= 7) {
        score += 10
        reasons.push({
          code: "BALANCED_BLOCK_COUNT",
          message: "Mixed block count suits a balanced adaptive layout.",
          impact: "positive",
        })
      }
      break
    }

    case "code-focus": {
      if (profile.codeBlockCount > 0) {
        score += 25
        reasons.push({
          code: "HAS_CODE_BLOCK",
          message: "Document contains code examples.",
          impact: "positive",
        })

        // Major boost if code is substantial
        if (profile.totalCodeLines > 6 || profile.codeRatio >= 0.15) {
          score += 15
          reasons.push({
            code: "DOMINANT_CODE_CONTENT",
            message: "Substantial code snippet benefits from a dedicated wide code region.",
            impact: "positive",
          })
        }
      } else {
        score -= 50
        reasons.push({
          code: "NO_CODE_BLOCK",
          message: "No code blocks present in document.",
          impact: "negative",
        })
      }
      break
    }

    case "cheat-sheet": {
      if (profile.blockCount >= 6) {
        score += 20
        reasons.push({
          code: "HIGH_BLOCK_COUNT",
          message: "High number of blocks fits a compact Cheat Sheet dashboard.",
          impact: "positive",
        })
      }
      if (profile.totalListItems >= 6 || profile.averageDensity > 1.2) {
        score += 15
        reasons.push({
          code: "HIGH_INFORMATION_DENSITY",
          message: "Dense revision notes and list items benefit from a compact multi-column grid.",
          impact: "positive",
        })
      }
      if (profile.totalCodeLines > 25) {
        score -= 25
        reasons.push({
          code: "EXTREME_CODE_LENGTH",
          message: "Excessively long code block can disrupt compact cheat sheet grid.",
          impact: "negative",
        })
      }
      break
    }

    case "concept-grid": {
      if (profile.conceptualBlockCount >= 2) {
        score += 25
        reasons.push({
          code: "CONCEPT_HEAVY",
          message: "High ratio of definitions and concepts maps well to paired knowledge cards.",
          impact: "positive",
        })
      }
      // Penalize Concept Grid if code is present
      if (profile.codeBlockCount > 0) {
        score -= 20
        reasons.push({
          code: "CONTAINS_CODE",
          message: "Code blocks are better suited for code-optimized layouts.",
          impact: "negative",
        })
      }
      break
    }
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons,
  }
}
