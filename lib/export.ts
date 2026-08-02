import { toPng, toJpeg, toSvg } from "html-to-image"
import { CANVAS_W, CANVAS_H } from "./store"
import type { Project, ProjectJSON, CanvasElement, StudyNotesContent } from "./types"
import { createElement, normalizeBlockType, getBlockDefaults } from "./blocks"
import { compileTemplate, compileTemplateStudyNotesV1 } from "./engine/compiler"

export type ExportFormat = "png" | "jpeg" | "svg"

export interface Resolution {
  label: string
  width: number
  height: number
}

export const RESOLUTIONS: Resolution[] = [
  { label: "2560 × 1440 (QHD)", width: 2560, height: 1440 },
  { label: "3840 × 2160 (4K)", width: 3840, height: 2160 },
  { label: "5120 × 2880 (5K)", width: 5120, height: 2880 },
  { label: "7680 × 4320 (8K)", width: 7680, height: 4320 },
]

const ARTBOARD_ID = "wallpaper-artboard"

function baseOptions(bg: string, pixelRatio: number) {
  return {
    pixelRatio,
    backgroundColor: bg,
    width: CANVAS_W,
    height: CANVAS_H,
    cacheBust: true,
    style: {
      transform: "none",
      transformOrigin: "0 0",
      margin: "0",
    },
    filter: (node: HTMLElement) => !(node?.dataset && node.dataset.exportIgnore !== undefined),
  }
}

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement("a")
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function sanitize(name: string) {
  return name.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "") || "wallpaper"
}

// Serializes project to JSON model. In Template mode, exports raw content without absolute positions.
export function serializeProjectJSON(project: Project): ProjectJSON {
  if (project.template && project.template !== "custom" && project.rawContent) {
    return {
      theme: project.theme || "dark",
      layout: project.layout || "desktop",
      template: project.template,
      content: project.rawContent,
    }
  }

  return {
    theme: project.theme || "dark",
    layout: project.layout || "desktop",
    template: project.template || "custom",
    content: {
      blocks: project.elements,
    },
  }
}

export function serializeContentJSON(project: Project): any {
  if (project.template && project.template !== "custom" && project.rawContent) {
    return {
      template: project.template,
      content: project.rawContent,
    }
  }

  return {
    blocks: project.elements,
  }
}

export async function exportWallpaper(
  project: Project,
  format: ExportFormat,
  resolution: Resolution,
): Promise<void> {
  const node = document.getElementById(ARTBOARD_ID)
  if (!node) throw new Error("Artboard not found")

  const pixelRatio = resolution.width / CANVAS_W
  const opts = baseOptions(project.background, pixelRatio)
  const filename = `${sanitize(project.name)}-${resolution.width}x${resolution.height}`

  if (format === "svg") {
    const url = await toSvg(node, opts)
    triggerDownload(url, `${filename}.svg`)
  } else if (format === "png") {
    const url = await toPng(node, opts)
    triggerDownload(url, `${filename}.png`)
  } else if (format === "jpeg") {
    const url = await toJpeg(node, { ...opts, quality: 0.96 })
    triggerDownload(url, `${filename}.jpg`)
  }
}

export function exportProjectJSON(project: Project) {
  const data = serializeProjectJSON(project)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `${sanitize(project.name)}.project.json`)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportContentJSON(project: Project) {
  const data = serializeContentJSON(project)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `${sanitize(project.name)}.content.json`)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Auto Layout Engine for freeform blocks missing coordinates
 */
export function applyAutoLayout(rawBlocks: Partial<CanvasElement>[]): CanvasElement[] {
  const PADDING_X = 160
  const PADDING_Y = 120
  const MAX_WIDTH = CANVAS_W - PADDING_X * 2
  const GAP_X = 30
  const GAP_Y = 30

  const blocks: CanvasElement[] = rawBlocks.map((b) => {
    const normType = normalizeBlockType(b.type || "paragraph")
    const defaults = getBlockDefaults(normType)
    const initialized = createElement(normType, 0, 0, b)
    return {
      ...initialized,
      w: b.w ?? defaults.w ?? initialized.w ?? 380,
      h: b.h ?? defaults.h ?? initialized.h ?? 180,
    }
  })

  const titles = blocks.filter((b) => b.type === "title")
  const subtitles = blocks.filter((b) => b.type === "subtitle")
  const bodyBlocks = blocks.filter((b) => b.type !== "title" && b.type !== "subtitle")

  let currentY = PADDING_Y

  titles.forEach((t) => {
    if (t.x === undefined || t.y === undefined || (t.x === 0 && t.y === 0)) {
      t.x = PADDING_X
      t.y = currentY
    }
    currentY = Math.max(currentY, t.y + t.h + 20)
  })

  subtitles.forEach((s) => {
    if (s.x === undefined || s.y === undefined || (s.x === 0 && s.y === 0)) {
      s.x = PADDING_X
      s.y = currentY
    }
    currentY = Math.max(currentY, s.y + s.h + 40)
  })

  let currentX = PADDING_X
  let rowMaxH = 0

  bodyBlocks.forEach((b) => {
    if (b.x !== undefined && b.y !== undefined && (b.x !== 0 || b.y !== 0)) {
      return
    }

    if (currentX + b.w > PADDING_X + MAX_WIDTH && currentX > PADDING_X) {
      currentX = PADDING_X
      currentY += rowMaxH + GAP_Y
      rowMaxH = 0
    }

    b.x = currentX
    b.y = currentY

    currentX += b.w + GAP_X
    rowMaxH = Math.max(rowMaxH, b.h)
  })

  return blocks
}

/**
 * Universal JSON parser that handles both Template Payload (e.g. study-notes-v1)
 * and Canvas Blocks Payload.
 */
export function parsePastedJSON(text: string): {
  type: "template" | "project" | "blocks"
  templateId: string
  rawContent?: StudyNotesContent
  data: any
  blocks: CanvasElement[]
} {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON structure. Expected a JSON object or array.")
  }

  // 1. Check if Template Payload (e.g. template: "study-notes-v1" or contains key-value study fields)
  const templateId = parsed.template || (parsed.content?.title || parsed.title ? "study-notes-v1" : null)
  const content = parsed.content || parsed

  if (templateId && !Array.isArray(content.blocks) && !Array.isArray(parsed.blocks) && !Array.isArray(parsed)) {
    const rawContent: StudyNotesContent = content
    const compiledBlocks = compileTemplate(templateId, rawContent)

    return {
      type: "template",
      templateId,
      rawContent,
      data: parsed,
      blocks: compiledBlocks,
    }
  }

  // 2. Otherwise handle freeform block arrays
  let rawBlocks: Partial<CanvasElement>[] = []
  let resultType: "project" | "blocks" = "project"

  if (Array.isArray(parsed)) {
    rawBlocks = parsed
    resultType = "blocks"
  } else if (parsed.content && typeof parsed.content === "object" && Array.isArray(parsed.content.blocks)) {
    rawBlocks = parsed.content.blocks
  } else if (Array.isArray(parsed.blocks)) {
    rawBlocks = parsed.blocks
  } else if (Array.isArray(parsed.elements)) {
    rawBlocks = parsed.elements
  } else {
    // Default fallback to study-notes-v1 template if object keys are provided
    const compiled = compileTemplate("study-notes-v1", parsed)
    return {
      type: "template",
      templateId: "study-notes-v1",
      rawContent: parsed,
      data: parsed,
      blocks: compiled,
    }
  }

  const processedBlocks = applyAutoLayout(rawBlocks)

  return {
    type: resultType,
    templateId: "custom",
    data: parsed,
    blocks: processedBlocks,
  }
}
