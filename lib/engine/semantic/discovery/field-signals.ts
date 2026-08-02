import type { DiscoveredField, FieldSignals, ValueType } from "./types"
import { normalizeKey } from "./key-normalizer"
import { detectCodeSyntax } from "./code-detection"

export function extractFieldSignals(key: string, value: unknown, valueType: ValueType): FieldSignals {
  const keyTokens = normalizeKey(key)

  let characterCount = 0
  let wordCount = 0
  let lineCount = 0
  let itemCount = 0
  let averageItemLength = 0

  let strContent = ""
  if (typeof value === "string") {
    strContent = value
    characterCount = value.length
    wordCount = value.trim().split(/\s+/).filter(Boolean).length
    lineCount = value.split("\n").length
  } else if (Array.isArray(value)) {
    itemCount = value.length
    let totalChars = 0
    value.forEach((item) => {
      if (typeof item === "string") totalChars += item.length
      else if (typeof item === "object" && item !== null) totalChars += JSON.stringify(item).length
    })
    characterCount = totalChars
    averageItemLength = itemCount > 0 ? totalChars / itemCount : 0
  } else if (typeof value === "object" && value !== null) {
    strContent = JSON.stringify(value)
    characterCount = strContent.length
  }

  const codeEval = detectCodeSyntax(strContent)

  const isScalar = valueType === "string" || valueType === "number" || valueType === "boolean"
  const isListLike = valueType === "string-array" || valueType === "number-array" || valueType === "mixed-array"
  const isObjectLike = valueType === "object" || valueType === "object-array"

  const looksLikeShortLabel = isScalar && wordCount > 0 && wordCount <= 5
  const looksLikeSentence = isScalar && wordCount > 5 && wordCount <= 25
  const looksLikeParagraph = isScalar && wordCount > 25

  return {
    keyTokens,
    characterCount,
    wordCount,
    lineCount,
    itemCount,
    averageItemLength,
    isScalar,
    isListLike,
    isObjectLike,
    looksLikeShortLabel,
    looksLikeSentence,
    looksLikeParagraph,
    containsCodeSyntax: codeEval.isCode,
    codeConfidence: codeEval.confidence,
  }
}
