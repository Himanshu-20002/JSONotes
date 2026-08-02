import type { DiscoveredField, ValueType } from "./types"
import { MAX_DISCOVERY_DEPTH, MAX_DISCOVERED_FIELDS, MAX_ARRAY_ITEMS } from "./constants"
import { normalizeKey } from "./key-normalizer"
import { extractFieldSignals } from "./field-signals"

function determineValueType(val: unknown): ValueType {
  if (val === null || val === undefined) return "unknown"
  if (typeof val === "string") return "string"
  if (typeof val === "number") return "number"
  if (typeof val === "boolean") return "boolean"

  if (Array.isArray(val)) {
    if (val.length === 0) return "unknown"
    const allStrings = val.every((item) => typeof item === "string")
    if (allStrings) return "string-array"
    const allNumbers = val.every((item) => typeof item === "number")
    if (allNumbers) return "number-array"
    const allObjects = val.every((item) => typeof item === "object" && item !== null)
    if (allObjects) return "object-array"
    return "mixed-array"
  }

  if (typeof val === "object") return "object"

  return "unknown"
}

export function discoverFields(
  obj: unknown,
  consumedPaths: Set<string>,
  depth = 0,
  pathPrefix = "",
  parentKey?: string
): DiscoveredField[] {
  const fields: DiscoveredField[] = []
  if (!obj || typeof obj !== "object" || depth >= MAX_DISCOVERY_DEPTH) return fields

  const entries = Object.entries(obj)
  for (const [key, value] of entries) {
    if (fields.length >= MAX_DISCOVERED_FIELDS) break

    // Ignore empty/null values
    if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
      continue
    }

    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key
    if (consumedPaths.has(currentPath) || consumedPaths.has(key)) continue

    const valueType = determineValueType(value)

    // Recurse into nested objects if not a direct object-array
    if (valueType === "object" && depth + 1 < MAX_DISCOVERY_DEPTH) {
      const childFields = discoverFields(value, consumedPaths, depth + 1, currentPath, key)
      fields.push(...childFields)
      continue
    }

    const normalizedKeyTokens = normalizeKey(key)
    const normalizedKeyStr = normalizedKeyTokens.join("-")
    const signals = extractFieldSignals(key, value, valueType)

    fields.push({
      path: currentPath,
      key,
      normalizedKey: normalizedKeyStr,
      value,
      valueType,
      depth,
      parentKey,
      signals,
    })
  }

  return fields
}
