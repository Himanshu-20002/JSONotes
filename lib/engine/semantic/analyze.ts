import type { ContentAnalysis, SemanticDocument } from "./types"

export function analyzeContent(doc: SemanticDocument): ContentAnalysis {
  let totalCharacters = 0
  let codeBlocks = 0
  let codeLines = 0
  let conceptCount = 0
  let listItems = 0
  let warningCount = 0

  if (doc.title) totalCharacters += doc.title.length
  if (doc.subtitle) totalCharacters += doc.subtitle.length

  for (const block of doc.blocks) {
    if (block.type === "code") {
      codeBlocks++
      const codeMeta = block.metadata?.codeLines
      if (codeMeta) {
        codeLines += codeMeta
      } else if (typeof block.content === "object" && block.content !== null) {
        const codeText = (block.content as { code?: string }).code || ""
        codeLines += codeText.split("\n").length
        totalCharacters += codeText.length
      } else if (typeof block.content === "string") {
        codeLines += block.content.split("\n").length
        totalCharacters += block.content.length
      }
    } else if (block.type === "concept") {
      conceptCount++
      if (Array.isArray(block.content)) {
        listItems += block.content.length
        totalCharacters += block.content.join("").length
      }
    } else if (block.type === "summary" || block.type === "related") {
      if (Array.isArray(block.content)) {
        listItems += block.content.length
        totalCharacters += block.content.join("").length
      }
    } else if (block.type === "warning") {
      warningCount++
      if (typeof block.content === "string") {
        totalCharacters += block.content.length
      }
    } else {
      if (typeof block.content === "string") {
        totalCharacters += block.content.length
      }
    }
  }

  // Determine dominant content
  let dominantContent: "code" | "concept" | "list" | "mixed" = "mixed"
  if (codeBlocks > 0 && codeLines > 10) {
    dominantContent = "code"
  } else if (conceptCount >= 2) {
    dominantContent = "concept"
  } else if (listItems >= 5) {
    dominantContent = "list"
  }

  // Determine density heuristic
  let density: "low" | "medium" | "high" | "extreme" = "low"
  if (totalCharacters > 1200 || codeLines > 25) {
    density = "extreme"
  } else if (totalCharacters > 600 || codeLines > 12) {
    density = "high"
  } else if (totalCharacters > 250) {
    density = "medium"
  }

  return {
    blockCount: doc.blocks.length,
    totalCharacters,
    codeBlocks,
    codeLines,
    conceptCount,
    listItems,
    warningCount,
    dominantContent,
    density,
  }
}
