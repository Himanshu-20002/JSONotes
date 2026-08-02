import type { BlockType, CanvasElement, ColorKey } from "./types"

export interface BlockDef {
  type: BlockType
  label: string
  category: "Text" | "Cards" | "Lists" | "Code & Flow" | "Elements"
  defaults: Partial<CanvasElement>
}

let counter = 0
export function uid(prefix = "el"): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}_${counter}_${Math.random().toString(36).slice(2, 7)}`
}

export const BLOCK_DEFS: BlockDef[] = [
  { type: "title", label: "Title", category: "Text", defaults: { w: 640, h: 90, text: "Main Title", fontSize: 64, color: "blue", align: "left" } },
  { type: "subtitle", label: "Subtitle", category: "Text", defaults: { w: 520, h: 60, text: "Subtitle goes here", fontSize: 34, color: "slate", align: "left" } },
  { type: "paragraph", label: "Paragraph", category: "Text", defaults: { w: 460, h: 140, text: "Write your explanation here. Double click to edit any block.", fontSize: 20, color: "slate", align: "left" } },
  { type: "quote", label: "Quote", category: "Text", defaults: { w: 460, h: 130, text: "Programs must be written for people to read.", fontSize: 24, color: "purple" } },
  { type: "badge", label: "Badge", category: "Elements", defaults: { w: 150, h: 44, text: "NEW", fontSize: 18, color: "green" } },

  { type: "sticky", label: "Sticky Note", category: "Cards", defaults: { w: 260, h: 260, text: "Quick note...", fontSize: 22, color: "yellow" } },
  { type: "definition", label: "Definition Card", category: "Cards", defaults: { w: 380, h: 200, title: "Hoisting", text: "Variables & functions are moved to the top of their scope during compilation.", fontSize: 18, color: "blue" } },
  { type: "interviewTip", label: "Interview Tip", category: "Cards", defaults: { w: 380, h: 190, title: "Interview Tip", text: "Explain the event loop with a concrete example.", fontSize: 18, color: "yellow" } },
  { type: "warning", label: "Warning Card", category: "Cards", defaults: { w: 380, h: 180, title: "Common Mistake", text: "Do not confuse == with ===.", fontSize: 18, color: "red" } },
  { type: "memoryTrick", label: "Memory Trick", category: "Cards", defaults: { w: 380, h: 180, title: "Memory Trick", text: "PEMDAS for operator precedence.", fontSize: 18, color: "pink" } },
  { type: "callout", label: "Callout", category: "Cards", defaults: { w: 420, h: 130, text: "Key takeaway of this section.", fontSize: 20, color: "cyan", icon: "info" } },
  { type: "roadmap", label: "Roadmap Card", category: "Cards", defaults: { w: 300, h: 170, title: "Step 1", text: "Learn the fundamentals.", fontSize: 18, color: "purple" } },
  { type: "mindMapNode", label: "Mind Map Node", category: "Cards", defaults: { w: 220, h: 90, text: "Concept", fontSize: 20, color: "cyan" } },

  { type: "checklist", label: "Checklist", category: "Lists", defaults: { w: 360, h: 210, title: "To Learn", color: "green", fontSize: 20, items: [] } },
  { type: "bulletList", label: "Bullet List", category: "Lists", defaults: { w: 360, h: 210, title: "Key Points", color: "slate", fontSize: 20, items: [] } },

  { type: "code", label: "Code Block", category: "Code & Flow", defaults: { w: 520, h: 260, language: "javascript", color: "slate", fontSize: 16, code: 'const closure = () => {\n  let count = 0\n  return () => ++count\n}' } },
  { type: "arrow", label: "Arrow", category: "Code & Flow", defaults: { w: 180, h: 40, color: "slate" } },

  { type: "progress", label: "Progress Bar", category: "Elements", defaults: { w: 340, h: 70, title: "Progress", progress: 60, color: "green", fontSize: 16 } },
  { type: "divider", label: "Divider", category: "Elements", defaults: { w: 400, h: 12, color: "slate" } },
  { type: "container", label: "Container", category: "Elements", defaults: { w: 500, h: 360, title: "Section", color: "slate", fontSize: 18 } },
]

const BLOCK_ALIAS_MAP: Record<string, BlockType> = {
  "title": "title",
  "subtitle": "subtitle",
  "paragraph": "paragraph",
  "definition": "definition",
  "definition-card": "definition",
  "concept": "definition",
  "concept-card": "definition",
  "warning": "warning",
  "warning-card": "warning",
  "memorytrick": "memoryTrick",
  "memory-trick": "memoryTrick",
  "interviewtip": "interviewTip",
  "interview-tip": "interviewTip",
  "code": "code",
  "code-block": "code",
  "checklist": "checklist",
  "bulletlist": "bulletList",
  "bullet-list": "bulletList",
  "sticky": "sticky",
  "sticky-note": "sticky",
  "callout": "callout",
  "roadmap": "roadmap",
  "mindmapnode": "mindMapNode",
  "mind-map-node": "mindMapNode",
  "badge": "badge",
  "progress": "progress",
  "divider": "divider",
  "container": "container",
  "arrow": "arrow",
  "quote": "quote"
}

export function normalizeBlockType(rawType: string): BlockType {
  const clean = rawType.toLowerCase().trim()
  return BLOCK_ALIAS_MAP[clean] || (rawType as BlockType)
}

const BLOCK_MAP = new Map(BLOCK_DEFS.map((b) => [b.type, b]))

export function getBlockDefaults(type: string): Partial<CanvasElement> {
  const norm = normalizeBlockType(type)
  return BLOCK_MAP.get(norm)?.defaults ?? {}
}

export function createElement(type: BlockType | string, x: number, y: number, overrides: Partial<CanvasElement> = {}): CanvasElement {
  const normType = normalizeBlockType(type)
  const def = BLOCK_MAP.get(normType)
  const d = def?.defaults ?? {}
  const base: CanvasElement = {
    id: overrides.id || uid(),
    type: normType,
    name: overrides.name || def?.label || normType,
    x: Math.round(x - (d.w ?? 300) / 2),
    y: Math.round(y - (d.h ?? 120) / 2),
    w: overrides.w ?? d.w ?? 300,
    h: overrides.h ?? d.h ?? 120,
    rotation: overrides.rotation ?? 0,
    opacity: overrides.opacity ?? 1,
    color: (overrides.color as ColorKey) || (d.color as ColorKey) || "slate",
    locked: overrides.locked ?? false,
    hidden: overrides.hidden ?? false,
    fontSize: overrides.fontSize ?? d.fontSize,
    align: overrides.align ?? d.align,
    text: overrides.text ?? d.text,
    title: overrides.title ?? d.title,
    code: overrides.code ?? d.code,
    language: overrides.language ?? d.language,
    progress: overrides.progress ?? d.progress,
    icon: overrides.icon ?? d.icon,
    items: overrides.items ? overrides.items.map((i) => ({ ...i })) : d.items ? d.items.map((i) => ({ ...i })) : undefined,
  }
  if ((normType === "checklist" || normType === "bulletList") && (!base.items || base.items.length === 0)) {
    base.items = [
      { id: uid("li"), text: "First item", checked: false },
      { id: uid("li"), text: "Second item", checked: normType === "checklist" ? true : false },
      { id: uid("li"), text: "Third item", checked: false },
    ]
  }
  return { ...base, ...overrides }
}

export function blockLabel(type: BlockType | string): string {
  const norm = normalizeBlockType(type)
  return BLOCK_MAP.get(norm)?.label ?? type
}
