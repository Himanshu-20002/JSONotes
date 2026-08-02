"use client"

import { useEditor } from "@/lib/store"
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3x3,
  Magnet,
  Download,
  Layers,
  Trash2,
  Copy,
  FileCode2,
  LayoutTemplate,
} from "lucide-react"

function IconButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`flex size-8 items-center justify-center rounded-md transition-colors disabled:opacity-30 ${
        active
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

const Divider = () => <div className="mx-1 h-5 w-px bg-border" />

function fit() {
  const el = document.getElementById("canvas-viewport")
  if (el) useEditor.getState().zoomToFit(el.clientWidth, el.clientHeight)
}

export function Toolbar({
  onExport,
  onImportJSON,
}: {
  onExport: () => void
  onImportJSON: () => void
}) {
  const project = useEditor((s) => s.project)
  const setTemplate = useEditor((s) => s.setTemplate)
  const renameProject = useEditor((s) => s.renameProject)
  const undo = useEditor((s) => s.undo)
  const redo = useEditor((s) => s.redo)
  const canUndo = useEditor((s) => s.past.length > 0)
  const canRedo = useEditor((s) => s.future.length > 0)
  const zoom = useEditor((s) => s.viewport.zoom)
  const zoomIn = useEditor((s) => s.zoomIn)
  const zoomOut = useEditor((s) => s.zoomOut)
  const showGrid = useEditor((s) => s.showGrid)
  const toggleGrid = useEditor((s) => s.toggleGrid)
  const snap = useEditor((s) => s.snap)
  const toggleSnap = useEditor((s) => s.toggleSnap)
  const selectedIds = useEditor((s) => s.selectedIds)
  const deleteSelected = useEditor((s) => s.deleteSelected)
  const duplicateSelected = useEditor((s) => s.duplicateSelected)

  const hasSelection = selectedIds.length > 0

  return (
    <header className="glass z-30 flex h-14 items-center justify-between gap-3 border-b border-border px-3">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold text-xs tracking-tighter">
          JN
        </div>
        <div className="flex flex-col mr-1">
          <span className="text-xs font-bold tracking-wider text-primary leading-tight">JSONotes</span>
          <span className="text-[9px] text-muted-foreground leading-none">Visual Notes</span>
        </div>
        <input
          value={project.name}
          onChange={(e) => renameProject(e.target.value)}
          className="w-48 rounded-md bg-transparent px-2 py-1 text-sm font-medium text-foreground outline-none hover:bg-muted focus:bg-muted"
          aria-label="Document name"
        />

        <div className="ml-2 flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          <LayoutTemplate className="ml-1.5 size-3.5 text-primary" />
          <select
            value={project.template || "study-notes-v1"}
            onChange={(e) => setTemplate(e.target.value)}
            className="bg-transparent py-1 pr-2 text-xs font-semibold text-foreground outline-none cursor-pointer"
          >
            <option value="study-notes-v1" className="bg-popover text-popover-foreground">study-notes-v1 (Default)</option>
            <option value="custom" className="bg-popover text-popover-foreground">Custom Layout</option>
          </select>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          <span className="ml-1.5 text-xs">🎨</span>
          <select
            value={project.themeId || "vibrant"}
            onChange={(e) => useEditor.getState().setThemeId(e.target.value)}
            className="bg-transparent py-1 pr-2 text-xs font-semibold text-foreground outline-none cursor-pointer"
          >
            <option value="vibrant" className="bg-popover text-popover-foreground">Vibrant Theme</option>
            <option value="minimal" className="bg-popover text-popover-foreground">Minimal Theme</option>
            <option value="midnight" className="bg-popover text-popover-foreground">Midnight Theme</option>
            <option value="paper" className="bg-popover text-popover-foreground">Paper Theme</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <IconButton title="Undo (Cmd+Z)" onClick={undo} disabled={!canUndo}>
          <Undo2 className="size-4" />
        </IconButton>
        <IconButton title="Redo (Cmd+Shift+Z)" onClick={redo} disabled={!canRedo}>
          <Redo2 className="size-4" />
        </IconButton>

        <Divider />

        <IconButton title="Duplicate (Cmd+D)" onClick={duplicateSelected} disabled={!hasSelection}>
          <Copy className="size-4" />
        </IconButton>
        <IconButton title="Delete (Del)" onClick={deleteSelected} disabled={!hasSelection}>
          <Trash2 className="size-4" />
        </IconButton>

        <Divider />

        <IconButton title="Toggle grid" onClick={toggleGrid} active={showGrid}>
          <Grid3x3 className="size-4" />
        </IconButton>
        <IconButton title="Snap to grid" onClick={toggleSnap} active={snap}>
          <Magnet className="size-4" />
        </IconButton>

        <Divider />

        <IconButton title="Zoom out" onClick={zoomOut}>
          <ZoomOut className="size-4" />
        </IconButton>
        <button
          onClick={fit}
          className="min-w-14 rounded-md px-2 py-1 text-center text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Zoom to fit"
        >
          {Math.round(zoom * 100)}%
        </button>
        <IconButton title="Zoom in" onClick={zoomIn}>
          <ZoomIn className="size-4" />
        </IconButton>
        <IconButton title="Zoom to fit (Shift+1)" onClick={fit}>
          <Maximize className="size-4" />
        </IconButton>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onImportJSON}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:border-primary/50"
        >
          <FileCode2 className="size-3.5 text-primary" />
          Import JSON
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Download className="size-3.5" />
          Export
        </button>
      </div>
    </header>
  )
}
