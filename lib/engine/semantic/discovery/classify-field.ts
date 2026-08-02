import type { SemanticBlockType } from "../types"
import type { DiscoveredField, FieldClassification } from "./types"
import { SEMANTIC_ALIASES } from "./aliases"
import { CONFIDENCE_THRESHOLDS } from "./constants"

export function classifyField(field: DiscoveredField): FieldClassification {
  const { signals, normalizedKey, valueType } = field
  const keyTokens = signals.keyTokens

  const scores: Record<SemanticBlockType, number> = {
    definition: 0,
    concept: 0,
    code: 0,
    summary: 0,
    warning: 0,
    interview: 0,
    memory: 0,
    related: 0,
    note: 0,
    generic: 0.4, // Base generic threshold fallback
  }

  const reasonsMap: Record<SemanticBlockType, string[]> = {
    definition: [],
    concept: [],
    code: [],
    summary: [],
    warning: [],
    interview: [],
    memory: [],
    related: [],
    note: [],
    generic: ["Fallback for generic informational content."],
  }

  // 1. Alias Match Scoring
  for (const [type, aliases] of Object.entries(SEMANTIC_ALIASES)) {
    const semType = type as SemanticBlockType
    for (const token of keyTokens) {
      if (aliases.includes(token) || aliases.includes(normalizedKey)) {
        scores[semType] += 0.55
        reasonsMap[semType].push(`Key token '${token}' matched alias dictionary for ${semType}.`)
      }
    }
  }

  // 2. Code Detection Scoring
  if (signals.containsCodeSyntax || signals.codeConfidence > 0.5) {
    scores.code += signals.codeConfidence * 0.6
    reasonsMap.code.push(`Contains code syntax (confidence: ${Math.round(signals.codeConfidence * 100)}%).`)
  }

  // 3. Shape & Length Compatibility Scoring
  if (signals.isListLike) {
    scores.concept += 0.25
    reasonsMap.concept.push("Value is a string list.")
    scores.summary += 0.2
    reasonsMap.summary.push("Value is a list format.")
    scores.related += 0.15
  }

  if (signals.looksLikeSentence || signals.looksLikeParagraph) {
    scores.definition += 0.2
    reasonsMap.definition.push("Value is an explanatory prose string.")
  }

  // 4. Resolve Highest Scoring Semantic Candidate
  let bestType: SemanticBlockType = "generic"
  let bestScore = 0

  for (const [t, s] of Object.entries(scores)) {
    if (s > bestScore) {
      bestScore = s
      bestType = t as SemanticBlockType
    }
  }

  const confidence = Math.min(1.0, Math.round(bestScore * 100) / 100)
  const isMatch = confidence >= CONFIDENCE_THRESHOLDS.acceptable && bestType !== "generic"

  return {
    semanticType: isMatch ? bestType : "generic",
    confidence: isMatch ? confidence : 0.5,
    reasons: isMatch ? reasonsMap[bestType] : reasonsMap.generic,
  }
}
