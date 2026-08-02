"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BlockType, CanvasElement, ColorKey, Project, ProjectJSON, StudyNotesContent } from "./types"
import { createElement, uid } from "./blocks"
import { compileTemplateStudyNotesV1 } from "./engine/compiler"

export const CANVAS_W = 2560
export const CANVAS_H = 1440
export const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3]

const DEFAULT_STUDY_CONTENT: StudyNotesContent = {
  title: "Execution Context",
  subtitle: "The environment where JavaScript code executes and manages variables.",
  definition: "An abstract concept that holds information about the environment within which the current code is being executed.",
  concepts: [
    "Creation Phase: Memory creation for variables and functions (Hoisting).",
    "Execution Phase: Code is executed line by line and values are assigned."
  ],
  code: {
    language: "javascript",
    code: `function multiply(a, b) {\n  const result = a * b;\n  return result;\n}\n\nconst product = multiply(4, 5);\nconsole.log(product); // 20`
  },
  interview: "Explain how the Call Stack manages global and function Execution Contexts during recursion.",
  warning: "Beware of stack overflow errors caused by unbounded recursive calls!",
  memory: "Remember: 'Call Stack = LIFO' (Last In, First Out).",
  summary: [
    "Global Execution Context is created first",
    "Function Execution Context is created per invocation",
    "Contains Variable Environment & Lexical Scope"
  ],
  notes: "Quick Note: Lexical scope is determined at compile time, not run time."
}

function emptyProject(): Project {
  return {
    id: uid("proj"),
    name: "JSONotes — Execution Context",
    width: CANVAS_W,
    height: CANVAS_H,
    background: "#0a0a12",
    theme: "dark",
    layout: "desktop",
    template: "study-notes-v1",
    rawContent: DEFAULT_STUDY_CONTENT,
    elements: compileTemplateStudyNotesV1(DEFAULT_STUDY_CONTENT),
  }
}

interface Viewport {
  zoom: number
  panX: number
  panY: number
}

interface EditorState {
  project: Project
  selectedIds: string[]
  editingId: string | null
  viewport: Viewport
  showGrid: boolean
  snap: boolean
  gridSize: number
  showRulers: boolean
  clipboard: CanvasElement[]
  past: Project[]
  future: Project[]

  // element ops
  addBlock: (type: BlockType, x?: number, y?: number) => string
  addElement: (el: CanvasElement) => void
  updateElement: (id: string, patch: Partial<CanvasElement>) => void
  updateElementLive: (id: string, patch: Partial<CanvasElement>) => void
  commit: () => void
  deleteSelected: () => void
  duplicateSelected: () => void
  moveSelected: (dx: number, dy: number) => void

  // selection
  select: (id: string | null, additive?: boolean) => void
  selectMany: (ids: string[]) => void
  clearSelection: () => void
  setEditing: (id: string | null) => void

  // z-order / layers
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  reorder: (from: number, to: number) => void
  toggleLock: (id: string) => void
  toggleHidden: (id: string) => void
  renameElement: (id: string, name: string) => void

  // clipboard
  copy: () => void
  paste: () => void

  // viewport
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  zoomToFit: (containerW: number, containerH: number) => void
  setPan: (panX: number, panY: number) => void
  resetView: () => void

  // toggles & templates
  toggleGrid: () => void
  toggleSnap: () => void
  toggleRulers: () => void
  setBackground: (bg: string) => void
  setColorForSelected: (color: ColorKey) => void
  setTemplate: (templateId: string) => void

  // project & JSON engine
  newProject: () => void
  renameProject: (name: string) => void
  loadProject: (project: Project) => void
  importProjectJSON: (json: any, blocks: CanvasElement[], templateId?: string, rawContent?: StudyNotesContent) => void
  importBlocksJSON: (blocks: CanvasElement[]) => void

  // history
  undo: () => void
  redo: () => void
}

export const useEditor = create<EditorState>()(
  persist(
    (set) => ({
      project: emptyProject(),
      selectedIds: [],
      editingId: null,
      viewport: { zoom: 0.4, panX: 80, panY: 80 },
      showGrid: true,
      snap: true,
      gridSize: 20,
      showRulers: true,
      clipboard: [],
      past: [],
      future: [],

      addBlock: (type, x, y) => {
        const el = createElement(type, x ?? 400, y ?? 300)
        set((s) => ({
          past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
          future: [],
          project: { ...s.project, elements: [...s.project.elements, el] },
          selectedIds: [el.id],
        }))
        return el.id
      },

      addElement: (el) =>
        set((s) => ({
          past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
          future: [],
          project: { ...s.project, elements: [...s.project.elements, el] },
          selectedIds: [el.id],
        })),

      updateElement: (id, patch) =>
        set((s) => ({
          past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
          future: [],
          project: {
            ...s.project,
            elements: s.project.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),

      updateElementLive: (id, patch) =>
        set((s) => ({
          project: {
            ...s.project,
            elements: s.project.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),

      commit: () =>
        set((s) => ({
          past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
          future: [],
        })),

      deleteSelected: () =>
        set((s) => {
          const ids = new Set(s.selectedIds)
          const removable = s.project.elements.filter((e) => ids.has(e.id) && !e.locked).map((e) => e.id)
          const rem = new Set(removable)
          return {
            past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
            future: [],
            project: { ...s.project, elements: s.project.elements.filter((e) => !rem.has(e.id)) },
            selectedIds: [],
            editingId: null,
          }
        }),

      duplicateSelected: () =>
        set((s) => {
          const ids = new Set(s.selectedIds)
          const clones = s.project.elements
            .filter((e) => ids.has(e.id))
            .map((e) => ({ ...JSON.parse(JSON.stringify(e)), id: uid(), x: e.x + 30, y: e.y + 30 }))
          if (clones.length === 0) return {}
          return {
            past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
            future: [],
            project: { ...s.project, elements: [...s.project.elements, ...clones] },
            selectedIds: clones.map((c) => c.id),
          }
        }),

      moveSelected: (dx, dy) =>
        set((s) => {
          const ids = new Set(s.selectedIds)
          return {
            project: {
              ...s.project,
              elements: s.project.elements.map((e) =>
                ids.has(e.id) && !e.locked ? { ...e, x: e.x + dx, y: e.y + dy } : e,
              ),
            },
          }
        }),

      select: (id, additive) =>
        set((s) => {
          if (id === null) return { selectedIds: [], editingId: null }
          if (additive) {
            const has = s.selectedIds.includes(id)
            return { selectedIds: has ? s.selectedIds.filter((x) => x !== id) : [...s.selectedIds, id] }
          }
          return { selectedIds: [id] }
        }),

      selectMany: (ids) => set({ selectedIds: ids }),
      clearSelection: () => set({ selectedIds: [], editingId: null }),
      setEditing: (id) => set({ editingId: id }),

      bringToFront: (id) =>
        set((s) => {
          const el = s.project.elements.find((e) => e.id === id)
          if (!el) return {}
          return {
            past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
            future: [],
            project: { ...s.project, elements: [...s.project.elements.filter((e) => e.id !== id), el] },
          }
        }),

      sendToBack: (id) =>
        set((s) => {
          const el = s.project.elements.find((e) => e.id === id)
          if (!el) return {}
          return {
            past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
            future: [],
            project: { ...s.project, elements: [el, ...s.project.elements.filter((e) => e.id !== id)] },
          }
        }),

      bringForward: (id) =>
        set((s) => {
          const els = [...s.project.elements]
          const i = els.findIndex((e) => e.id === id)
          if (i < 0 || i === els.length - 1) return {}
          ;[els[i], els[i + 1]] = [els[i + 1], els[i]]
          return { project: { ...s.project, elements: els } }
        }),

      sendBackward: (id) =>
        set((s) => {
          const els = [...s.project.elements]
          const i = els.findIndex((e) => e.id === id)
          if (i <= 0) return {}
          ;[els[i], els[i - 1]] = [els[i - 1], els[i]]
          return { project: { ...s.project, elements: els } }
        }),

      reorder: (from, to) =>
        set((s) => {
          const els = [...s.project.elements]
          const [moved] = els.splice(from, 1)
          els.splice(to, 0, moved)
          return { project: { ...s.project, elements: els } }
        }),

      toggleLock: (id) =>
        set((s) => ({
          project: {
            ...s.project,
            elements: s.project.elements.map((e) => (e.id === id ? { ...e, locked: !e.locked } : e)),
          },
        })),

      toggleHidden: (id) =>
        set((s) => ({
          project: {
            ...s.project,
            elements: s.project.elements.map((e) => (e.id === id ? { ...e, hidden: !e.hidden } : e)),
          },
        })),

      renameElement: (id, name) =>
        set((s) => ({
          project: {
            ...s.project,
            elements: s.project.elements.map((e) => (e.id === id ? { ...e, name } : e)),
          },
        })),

      copy: () =>
        set((s) => {
          const ids = new Set(s.selectedIds)
          return { clipboard: s.project.elements.filter((e) => ids.has(e.id)).map((e) => JSON.parse(JSON.stringify(e))) }
        }),

      paste: () =>
        set((s) => {
          if (s.clipboard.length === 0) return {}
          const clones = s.clipboard.map((e) => ({ ...JSON.parse(JSON.stringify(e)), id: uid(), x: e.x + 40, y: e.y + 40 }))
          return {
            past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
            future: [],
            project: { ...s.project, elements: [...s.project.elements, ...clones] },
            selectedIds: clones.map((c) => c.id),
          }
        }),

      setZoom: (zoom) => set((s) => ({ viewport: { ...s.viewport, zoom: Math.min(3, Math.max(0.1, zoom)) } })),
      zoomIn: () =>
        set((s) => {
          const next = ZOOM_LEVELS.find((z) => z > s.viewport.zoom + 0.001) ?? 3
          return { viewport: { ...s.viewport, zoom: next } }
        }),
      zoomOut: () =>
        set((s) => {
          const rev = [...ZOOM_LEVELS].reverse()
          const next = rev.find((z) => z < s.viewport.zoom - 0.001) ?? 0.25
          return { viewport: { ...s.viewport, zoom: next } }
        }),
      zoomToFit: (containerW, containerH) =>
        set((s) => {
          const pad = 80
          const zoom = Math.min((containerW - s.project.width * 1) / s.project.width, (containerH - pad * 2) / s.project.height)
          const z = Math.max(0.1, Math.min(3, zoom))
          return {
            viewport: {
              zoom: z,
              panX: (containerW - s.project.width * z) / 2,
              panY: (containerH - s.project.height * z) / 2,
            },
          }
        }),
      setPan: (panX, panY) => set((s) => ({ viewport: { ...s.viewport, panX, panY } })),
      resetView: () => set({ viewport: { zoom: 0.4, panX: 80, panY: 80 } }),

      toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
      toggleSnap: () => set((s) => ({ snap: !s.snap })),
      toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),
      setBackground: (bg) => set((s) => ({ project: { ...s.project, background: bg } })),

      setColorForSelected: (color) =>
        set((s) => {
          const ids = new Set(s.selectedIds)
          return {
            past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
            future: [],
            project: {
              ...s.project,
              elements: s.project.elements.map((e) => (ids.has(e.id) ? { ...e, color } : e)),
            },
          }
        }),

      setTemplate: (templateId) =>
        set((s) => ({
          project: {
            ...s.project,
            template: templateId,
          },
        })),

      newProject: () => set({ project: emptyProject(), selectedIds: [], editingId: null, past: [], future: [] }),
      renameProject: (name) => set((s) => ({ project: { ...s.project, name } })),
      loadProject: (project) => set({ project, selectedIds: [], editingId: null, past: [], future: [] }),

      importProjectJSON: (json, blocks, templateId, rawContent) =>
        set((s) => ({
          past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
          future: [],
          project: {
            ...s.project,
            name: rawContent?.title ? `${rawContent.title} Study Wallpaper` : s.project.name,
            theme: json.theme ?? s.project.theme ?? "dark",
            layout: json.layout ?? s.project.layout ?? "desktop",
            template: templateId || json.template || "study-notes-v1",
            rawContent: rawContent || json.content || s.project.rawContent,
            elements: blocks,
          },
          selectedIds: [],
          editingId: null,
        })),

      importBlocksJSON: (blocks) =>
        set((s) => ({
          past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
          future: [],
          project: {
            ...s.project,
            elements: blocks,
          },
          selectedIds: [],
          editingId: null,
        })),

      undo: () =>
        set((s) => {
          if (s.past.length === 0) return {}
          const previous = s.past[s.past.length - 1]
          return {
            project: previous,
            past: s.past.slice(0, -1),
            future: [JSON.parse(JSON.stringify(s.project)), ...s.future].slice(0, 50),
            selectedIds: [],
            editingId: null,
          }
        }),

      redo: () =>
        set((s) => {
          if (s.future.length === 0) return {}
          const next = s.future[0]
          return {
            project: next,
            future: s.future.slice(1),
            past: [...s.past, JSON.parse(JSON.stringify(s.project))].slice(-50),
            selectedIds: [],
            editingId: null,
          }
        }),
    }),
    {
      name: "wallpaper-notes-editor",
      partialize: (s) => ({
        project: s.project,
        showGrid: s.showGrid,
        snap: s.snap,
        showRulers: s.showRulers,
      }),
    },
  ),
)
