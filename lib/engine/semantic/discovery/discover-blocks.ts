import type { SemanticBlock, SemanticBlockType } from "../types"
import type { DiscoveredField } from "./types"
import { discoverFields } from "./flatten"
import { classifyField } from "./classify-field"
import { humanizeKey } from "./key-normalizer"
import { TITLE_ALIASES, SUBTITLE_ALIASES } from "./aliases"

function generateBlockId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`
}

function formatObjectContent(val: unknown): string {
  if (typeof val !== "object" || val === null) return String(val)
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === "object" ? formatObjectContent(item) : String(item)))
      .join("\n")
  }
  return Object.entries(val)
    .map(([k, v]) => `${humanizeKey(k)}: ${v}`)
    .join("\n")
}

export function discoverSemanticBlocks(
  rawJson: unknown,
  consumedPaths: Set<string>
): { title?: string; subtitle?: string; blocks: SemanticBlock[] } {
  const discovered = discoverFields(rawJson, consumedPaths)
  const blocks: SemanticBlock[] = []

  let discoveredTitle: string | undefined
  let discoveredSubtitle: string | undefined

  for (const field of discovered) {
    const keyLower = field.key.toLowerCase()

    // Title Discovery
    if (!discoveredTitle && TITLE_ALIASES.includes(keyLower) && typeof field.value === "string") {
      discoveredTitle = field.value
      consumedPaths.add(field.path)
      continue
    }

    // Subtitle Discovery
    if (!discoveredSubtitle && SUBTITLE_ALIASES.includes(keyLower) && typeof field.value === "string") {
      discoveredSubtitle = field.value
      consumedPaths.add(field.path)
      continue
    }

    // Classify Field
    const classification = classifyField(field)
    const blockTitle = humanizeKey(field.key)
    let content: unknown = field.value

    // Format Object & Array-of-Objects cleanly without [object Object]
    if (field.valueType === "object" || field.valueType === "object-array") {
      content = formatObjectContent(field.value)
    }

    const block: SemanticBlock = {
      id: generateBlockId(classification.semanticType),
      type: classification.semanticType,
      title: blockTitle,
      content,
      importance: classification.semanticType === "definition" || classification.semanticType === "code" ? 5 : 3,
      density: field.signals.characterCount > 200 ? "high" : "medium",
      preferredSize: field.signals.lineCount > 10 ? "tall" : "medium",
      metadata: {
        sourceField: field.key,
        sourcePath: field.path,
        inferred: true,
        inferenceConfidence: classification.confidence,
        inferenceReasons: classification.reasons,
        itemCount: field.signals.itemCount,
        codeLines: field.signals.lineCount,
      },
    }

    blocks.push(block)
    consumedPaths.add(field.path)
  }

  return {
    title: discoveredTitle,
    subtitle: discoveredSubtitle,
    blocks,
  }
}
