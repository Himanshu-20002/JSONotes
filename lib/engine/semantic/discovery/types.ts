import type { SemanticBlockType } from "../types"

export type ValueType =
  | "string"
  | "number"
  | "boolean"
  | "string-array"
  | "number-array"
  | "object"
  | "object-array"
  | "mixed-array"
  | "unknown"

export interface FieldSignals {
  keyTokens: string[]
  characterCount: number
  wordCount: number
  lineCount: number
  itemCount: number
  averageItemLength: number
  isScalar: boolean
  isListLike: boolean
  isObjectLike: boolean
  looksLikeShortLabel: boolean
  looksLikeSentence: boolean
  looksLikeParagraph: boolean
  containsCodeSyntax: boolean
  codeConfidence: number
}

export interface DiscoveredField {
  path: string
  key: string
  normalizedKey: string
  value: unknown
  valueType: ValueType
  depth: number
  parentKey?: string
  signals: FieldSignals
}

export interface FieldClassification {
  semanticType: SemanticBlockType
  confidence: number
  reasons: string[]
}

export interface CodeDetectionResult {
  isCode: boolean
  confidence: number
  language?: string
  reasons: string[]
}
