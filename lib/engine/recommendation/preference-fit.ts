import type { LayoutId } from "../layout/types"
import type { ContentProfile, LayoutPreferences, RecommendationReason } from "./types"

export function evaluatePreferenceFit(
  layoutId: LayoutId,
  profile: ContentProfile,
  preferences?: LayoutPreferences
): { score: number; reasons: RecommendationReason[] } {
  let score = 70
  const reasons: RecommendationReason[] = []

  if (!preferences) {
    return { score, reasons }
  }

  // 1. Density Preference
  if (preferences.density === "compact") {
    if (layoutId === "cheat-sheet") {
      score += 20
      reasons.push({
        code: "PREF_DENSITY_COMPACT",
        message: "Matches user preference for compact information density.",
        impact: "positive",
      })
    }
  } else if (preferences.density === "comfortable") {
    if (layoutId === "concept-grid" || layoutId === "balanced") {
      score += 15
      reasons.push({
        code: "PREF_DENSITY_COMFORTABLE",
        message: "Matches user preference for comfortable card spacing.",
        impact: "positive",
      })
    }
  }

  // 2. Priority Preference
  if (preferences.priority === "code" && profile.codeBlockCount > 0) {
    if (layoutId === "code-focus") {
      score += 25
      reasons.push({
        code: "PREF_PRIORITY_CODE",
        message: "Matches user preference for code region prioritization.",
        impact: "positive",
      })
    }
  } else if (preferences.priority === "fit-more") {
    if (layoutId === "cheat-sheet") {
      score += 20
      reasons.push({
        code: "PREF_PRIORITY_FIT_MORE",
        message: "Matches user preference to fit maximum content on canvas.",
        impact: "positive",
      })
    }
  } else if (preferences.priority === "readability") {
    if (layoutId === "concept-grid" || layoutId === "balanced") {
      score += 15
      reasons.push({
        code: "PREF_PRIORITY_READABILITY",
        message: "Matches user preference for optimal text readability.",
        impact: "positive",
      })
    }
  }

  // 3. Structure Preference
  if (preferences.structure === "grid") {
    if (layoutId === "concept-grid" || layoutId === "cheat-sheet") {
      score += 15
      reasons.push({
        code: "PREF_STRUCTURE_GRID",
        message: "Matches user preference for structured card alignment.",
        impact: "positive",
      })
    }
  } else if (preferences.structure === "balanced") {
    if (layoutId === "balanced") {
      score += 15
      reasons.push({
        code: "PREF_STRUCTURE_BALANCED",
        message: "Matches user preference for flexible balanced layout.",
        impact: "positive",
      })
    }
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons,
  }
}
