import type { CanvasElement, StudyNotesContent } from "../types"
import { createElement, uid } from "../blocks"
import { normalizeContent } from "./semantic/normalize"
import { analyzeContent } from "./semantic/analyze"
import type { SemanticBlock, SemanticDocument } from "./semantic/types"
import { getLayoutStrategy } from "./layout/registry"
import type { LayoutId, PositionedBlock } from "./layout/types"
import type { ThemeId } from "./theme/types"
import { resolveSemanticStyle } from "./theme/semantic-style"
import { applyThemeToElement } from "./theme/apply-theme"

export interface CompileOptions {
  layout?: LayoutId | string
  theme?: ThemeId | string
}

/**
 * Internal helper mapping a SemanticBlock & PositionedBlock into a CanvasElement with theme styling
 */
function semanticBlockToCanvasElement(block: SemanticBlock, pos: PositionedBlock, themeId: ThemeId = "vibrant"): CanvasElement {
  const normType = block.type
  let blockType = "definition"

  switch (normType) {
    case "definition":
      blockType = "definition"
      break
    case "concept":
      blockType = "definition"
      break
    case "related":
      blockType = "bulletList"
      break
    case "code":
      blockType = "code"
      break
    case "summary":
      blockType = "checklist"
      break
    case "interview":
      blockType = "interviewTip"
      break
    case "warning":
      blockType = "warning"
      break
    case "memory":
      blockType = "memoryTrick"
      break
    case "note":
    default:
      blockType = "sticky"
      break
  }

  const baseProps = {
    id: uid(normType),
    x: pos.x,
    y: pos.y,
    w: pos.width,
    h: pos.height,
    fontSize: normType === "code" ? 16 : 18,
  }

  let element: CanvasElement

  if (normType === "code") {
    const codeObj = block.content as { language?: string; code: string }
    element = createElement("code", 0, 0, {
      ...baseProps,
      language: codeObj?.language || "javascript",
      code: typeof codeObj === "object" && codeObj !== null ? codeObj.code : String(block.content),
    })
  } else if (normType === "summary" || normType === "related") {
    const items = Array.isArray(block.content) ? block.content.map(String) : [String(block.content)]
    element = createElement(normType === "summary" ? "checklist" : "bulletList", 0, 0, {
      ...baseProps,
      title: block.title,
      items: items.map((t, i) => ({ id: uid(`item_${i}`), text: t, checked: false })),
    })
  } else if (normType === "concept") {
    const items = Array.isArray(block.content) ? block.content.map(String) : [String(block.content)]
    element = createElement("definition", 0, 0, {
      ...baseProps,
      title: block.title || "Key Concepts",
      text: `• ${items.join("\n\n• ")}`,
    })
  } else {
    element = createElement(blockType as any, 0, 0, {
      ...baseProps,
      title: block.title,
      text: String(block.content),
    })
  }

  return applyThemeToElement(element, themeId)
}

/**
 * Strategy Architecture & Theme Engine Compiler
 */
export function compileTemplateStudyNotesV1(content: StudyNotesContent, options?: CompileOptions): CanvasElement[] {
  const selectedTheme = (options?.theme as ThemeId) || "vibrant"

  // 1. Normalize input into SemanticDocument
  const semDoc: SemanticDocument = normalizeContent(content)

  // 2. Analyze content heuristics
  const analysis = analyzeContent(semDoc)

  // 3. Resolve requested LayoutStrategy via Registry (Defaults to 'balanced' strategy)
  const strategy = getLayoutStrategy(options?.layout)

  // 4. Plan layout geometry using resolved Strategy
  const layoutResult = strategy.createLayout(semDoc, { analysis })

  const elements: CanvasElement[] = []

  // Top Area: Header Title & Subtitle
  if (semDoc.title) {
    elements.push(
      createElement("title", 0, 0, {
        id: uid("title"),
        x: 160,
        y: 100,
        w: 1200,
        h: 90,
        text: semDoc.title,
        fontSize: 64,
      })
    )
  }

  if (semDoc.subtitle) {
    elements.push(
      createElement("subtitle", 0, 0, {
        id: uid("subtitle"),
        x: 160,
        y: 200,
        w: 1200,
        h: 50,
        text: semDoc.subtitle,
        fontSize: 28,
      })
    )
  }

  // Map positioned blocks into CanvasElements styled by Theme Engine
  for (const posBlock of layoutResult.blocks) {
    const semBlock = semDoc.blocks.find((b) => b.id === posBlock.blockId)
    if (semBlock) {
      elements.push(semanticBlockToCanvasElement(semBlock, posBlock, selectedTheme))
    }
  }

  return elements
}

export function compileTemplate(templateId: string, content: StudyNotesContent, options?: CompileOptions): CanvasElement[] {
  switch (templateId) {
    case "study-notes-v1":
    default:
      return compileTemplateStudyNotesV1(content, options)
  }
}
