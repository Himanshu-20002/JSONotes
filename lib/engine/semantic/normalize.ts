import type { StudyNotesContent } from "../../types"
import type { SemanticBlock, SemanticDocument } from "./types"
import { uid } from "../../blocks"

function estimateDensity(length: number): "low" | "medium" | "high" {
  if (length > 300) return "high"
  if (length > 100) return "medium"
  return "low"
}

export function normalizeContent(input: StudyNotesContent): SemanticDocument {
  const blocks: SemanticBlock[] = []

  // 1. Definition -> definition
  if (input.definition) {
    const isObj = typeof input.definition === "object" && input.definition !== null
    const text = isObj ? (input.definition as { text: string }).text || "" : String(input.definition)
    const title = isObj ? (input.definition as { title?: string }).title : "Definition"

    blocks.push({
      id: uid("sem_def"),
      type: "definition",
      title: title || "Definition",
      content: text,
      importance: 5,
      density: estimateDensity(text.length),
      preferredSize: "medium",
      metadata: {
        sourceField: "definition",
      },
    })
  }

  // 2. Concepts -> concept
  if (input.concepts && Array.isArray(input.concepts) && input.concepts.length > 0) {
    const rawItems = input.concepts.map((c) => (typeof c === "string" ? c : c.text || ""))
    const fullText = rawItems.join(" ")

    blocks.push({
      id: uid("sem_concept"),
      type: "concept",
      title: "Key Concepts",
      content: rawItems,
      importance: 4,
      density: estimateDensity(fullText.length),
      preferredSize: "large",
      metadata: {
        sourceField: "concepts",
        itemCount: rawItems.length,
      },
    })
  }

  // 3. Related -> related
  if (input.related && Array.isArray(input.related) && input.related.length > 0) {
    const items = input.related.map((r) => (typeof r === "string" ? r : String(r)))

    blocks.push({
      id: uid("sem_related"),
      type: "related",
      title: "Related Topics",
      content: items,
      importance: 2,
      density: "low",
      preferredSize: "small",
      metadata: {
        sourceField: "related",
        itemCount: items.length,
      },
    })
  }

  // 4. Code -> code
  if (input.code) {
    const isObj = typeof input.code === "object" && input.code !== null
    const codeText = isObj ? (input.code as { code: string }).code || "" : String(input.code)
    const language = isObj ? (input.code as { language?: string }).language || "javascript" : "javascript"
    const lineCount = codeText.split("\n").length

    blocks.push({
      id: uid("sem_code"),
      type: "code",
      title: "Code Snippet",
      content: {
        language,
        code: codeText,
      },
      importance: 5,
      density: lineCount > 15 ? "high" : lineCount > 6 ? "medium" : "low",
      preferredSize: "tall",
      metadata: {
        sourceField: "code",
        language,
        codeLines: lineCount,
      },
    })
  }

  // 5. Summary -> summary
  if (input.summary && Array.isArray(input.summary) && input.summary.length > 0) {
    const items = input.summary.map((s) => (typeof s === "string" ? s : s.text || ""))

    blocks.push({
      id: uid("sem_summary"),
      type: "summary",
      title: "Quick Revision Summary",
      content: items,
      importance: 4,
      density: estimateDensity(items.join(" ").length),
      preferredSize: "wide",
      metadata: {
        sourceField: "summary",
        itemCount: items.length,
      },
    })
  }

  // 6. Interview -> interview
  if (input.interview) {
    const isObj = typeof input.interview === "object" && input.interview !== null
    const text = isObj ? (input.interview as { text: string }).text || "" : String(input.interview)
    const title = isObj ? (input.interview as { title?: string }).title : "Interview Tip"

    blocks.push({
      id: uid("sem_interview"),
      type: "interview",
      title: title || "Interview Tip",
      content: text,
      importance: 3,
      density: estimateDensity(text.length),
      preferredSize: "medium",
      metadata: {
        sourceField: "interview",
      },
    })
  }

  // 7. Warning -> warning
  if (input.warning) {
    const isObj = typeof input.warning === "object" && input.warning !== null
    const text = isObj ? (input.warning as { text: string }).text || "" : String(input.warning)
    const title = isObj ? (input.warning as { title?: string }).title : "Common Pitfall"

    blocks.push({
      id: uid("sem_warning"),
      type: "warning",
      title: title || "Common Pitfall",
      content: text,
      importance: 4,
      density: estimateDensity(text.length),
      preferredSize: "medium",
      metadata: {
        sourceField: "warning",
      },
    })
  }

  // 8. Memory -> memory
  if (input.memory) {
    const isObj = typeof input.memory === "object" && input.memory !== null
    const text = isObj ? (input.memory as { text: string }).text || "" : String(input.memory)
    const title = isObj ? (input.memory as { title?: string }).title : "Memory Trick"

    blocks.push({
      id: uid("sem_memory"),
      type: "memory",
      title: title || "Memory Trick",
      content: text,
      importance: 3,
      density: estimateDensity(text.length),
      preferredSize: "small",
      metadata: {
        sourceField: "memory",
      },
    })
  }

  // 9. Notes -> note
  if (input.notes) {
    const text = typeof input.notes === "string" ? input.notes : String(input.notes)

    blocks.push({
      id: uid("sem_notes"),
      type: "note",
      title: "Notes",
      content: text,
      importance: 2,
      density: estimateDensity(text.length),
      preferredSize: "wide",
      metadata: {
        sourceField: "notes",
      },
    })
  }

  return {
    title: input.title,
    subtitle: input.subtitle,
    blocks,
  }
}
