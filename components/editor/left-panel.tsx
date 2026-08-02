"use client"

import { useMemo, useState } from "react"
import {
  AlignLeft,
  ArrowRight,
  Box,
  CheckSquare,
  ChevronRight,
  Code2,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  LayoutTemplate,
  List,
  Lock,
  Minus,
  Quote,
  Search,
  Shapes,
  StickyNote,
  Tag,
  Trash2,
  Type,
  Unlock,
} from "lucide-react"
import type { BlockType } from "@/lib/types"
import { BLOCK_DEFS } from "@/lib/blocks"
import { TEMPLATES } from "@/lib/templates"
import { useEditor } from "@/lib/store"
import { cn } from "@/lib/utils"

type Tab = "blocks" | "templates" | "layers"

const BLOCK_ICONS: Partial<Record<BlockType, typeof Type>> = {
  title: Type,
  subtitle: Type,
  paragraph: AlignLeft,
  quote: Quote,
  badge: Tag,
  sticky: StickyNote,
  definition: Box,
  interviewTip: Box,
  warning: Box,
  memoryTrick: Box,
  callout: Box,
  roadmap: Box,
  mindMapNode: Shapes,
  checklist: CheckSquare,
  bulletList: List,
  code: Code2,
  arrow: ArrowRight,
  progress: Box,
  divider: Minus,
  container: Box,
}

export function LeftPanel() {
  const [tab, setTab] = useState<Tab>("blocks")
  const [query, setQuery] = useState("")

  const addBlock = useEditor((s) => s.addBlock)
  const viewport = useEditor((s) => s.viewport)

  function addCentered(type: BlockType) {
    const container = document.getElementById("canvas-viewport")
    const rect = container?.getBoundingClientRect()
    const cx = rect ? (rect.width / 2 - viewport.panX) / viewport.zoom : 1280
    const cy = rect ? (rect.height / 2 - viewport.panY) / viewport.zoom : 720
    const jitter = (Math.random() - 0.5) * 80
    addBlock(type, cx + jitter, cy + jitter)
  }

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = BLOCK_DEFS.filter((b) => !q || b.label.toLowerCase().includes(q) || b.type.toLowerCase().includes(q))
    const map = new Map<string, typeof BLOCK_DEFS>()
    for (const b of filtered) {
      if (!map.has(b.category)) map.set(b.category, [])
      map.get(b.category)!.push(b)
    }
    return Array.from(map.entries())
  }, [query])

  return (
    <div className="glass flex h-full w-72 flex-col border-r border-white/10">
      {/* Tabs */}
      <div className="flex gap-1 p-2">
        <TabButton active={tab === "blocks"} onClick={() => setTab("blocks")} icon={<Shapes size={15} />} label="Blocks" />
        <TabButton active={tab === "templates"} onClick={() => setTab("templates")} icon={<LayoutTemplate size={15} />} label="Templates" />
        <TabButton active={tab === "layers"} onClick={() => setTab("layers")} icon={<Layers size={15} />} label="Layers" />
      </div>

      {tab === "blocks" && (
        <>
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5">
              <Search size={14} className="text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blocks"
                className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="editor-scroll flex-1 overflow-y-auto px-3 pb-4">
            {grouped.map(([category, blocks]) => (
              <div key={category} className="mb-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{category}</p>
                <div className="grid grid-cols-2 gap-2">
                  {blocks.map((b) => {
                    const Icon = BLOCK_ICONS[b.type] ?? Box
                    return (
                      <button
                        key={b.type}
                        onClick={() => addCentered(b.type)}
                        className="group flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-all hover:border-white/25 hover:bg-white/[0.07]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-foreground/80 group-hover:text-foreground">
                          <Icon size={16} />
                        </span>
                        <span className="text-xs font-medium leading-tight">{b.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {grouped.length === 0 && <p className="mt-6 text-center text-sm text-muted-foreground">No blocks found</p>}
          </div>
        </>
      )}

      {tab === "templates" && <TemplatesTab />}
      {tab === "layers" && <LayersTab />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function TemplatesTab() {
  const loadProject = useEditor((s) => s.loadProject)
  const project = useEditor((s) => s.project)

  function apply(id: string) {
    const t = TEMPLATES.find((x) => x.id === id)
    if (!t) return
    loadProject({
      id: project.id,
      name: t.name + " Notes",
      width: project.width,
      height: project.height,
      background: "#0a0a12",
      theme: project.theme || "dark",
      layout: project.layout || "desktop",
      template: t.id,
      elements: t.build(),
    })
  }

  return (
    <div className="editor-scroll flex-1 overflow-y-auto px-3 pb-4">
      <p className="mb-2 px-1 text-[11px] text-muted-foreground">
        Templates replace the current canvas with a starter layout.
      </p>
      <div className="flex flex-col gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => apply(t.id)}
            className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition-all hover:border-white/25 hover:bg-white/[0.07]"
          >
            <div>
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  )
}

function LayersTab() {
  const elements = useEditor((s) => s.project.elements)
  const selectedIds = useEditor((s) => s.selectedIds)
  const select = useEditor((s) => s.select)
  const toggleHidden = useEditor((s) => s.toggleHidden)
  const toggleLock = useEditor((s) => s.toggleLock)
  const reorder = useEditor((s) => s.reorder)
  const renameElement = useEditor((s) => s.renameElement)
  const deleteSelected = useEditor((s) => s.deleteSelected)

  const [drag, setDrag] = useState<number | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)

  // top of list = front-most (end of array)
  const ordered = elements.map((el, i) => ({ el, i })).reverse()

  return (
    <div className="editor-scroll flex-1 overflow-y-auto px-2 pb-4">
      {ordered.length === 0 && <p className="mt-6 text-center text-sm text-muted-foreground">No layers yet</p>}
      <div className="flex flex-col gap-0.5">
        {ordered.map(({ el, i }) => {
          const active = selectedIds.includes(el.id)
          return (
            <div
              key={el.id}
              draggable
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (drag !== null && drag !== i) reorder(drag, i)
                setDrag(null)
              }}
              onClick={(e) => select(el.id, e.shiftKey)}
              className={cn(
                "group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                active ? "bg-white/12 text-foreground" : "text-foreground/80 hover:bg-white/5",
              )}
            >
              <GripVertical size={14} className="shrink-0 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100" />
              {editingName === el.id ? (
                <input
                  autoFocus
                  defaultValue={el.name}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    renameElement(el.id, e.target.value || el.name)
                    setEditingName(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur()
                  }}
                  className="h-6 min-w-0 flex-1 rounded bg-black/30 px-1.5 text-xs outline-none"
                />
              ) : (
                <span
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setEditingName(el.id)
                  }}
                  className={cn("min-w-0 flex-1 truncate", el.hidden && "opacity-40")}
                >
                  {el.name}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLock(el.id)
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                title={el.locked ? "Unlock" : "Lock"}
              >
                {el.locked ? <Lock size={13} /> : <Unlock size={13} className="opacity-0 group-hover:opacity-100" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleHidden(el.id)
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                title={el.hidden ? "Show" : "Hide"}
              >
                {el.hidden ? <EyeOff size={13} /> : <Eye size={13} className="opacity-0 group-hover:opacity-100" />}
              </button>
            </div>
          )
        })}
      </div>
      {selectedIds.length > 0 && (
        <button
          onClick={() => deleteSelected()}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 py-1.5 text-xs text-destructive hover:bg-destructive/20"
        >
          <Trash2 size={13} /> Delete selected
        </button>
      )}
    </div>
  )
}
