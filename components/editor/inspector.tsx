"use client"

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Copy,
  Lock,
  Trash2,
  Unlock,
} from "lucide-react"
import { useEditor } from "@/lib/store"
import { COLOR_KEYS, palette } from "@/lib/colors"
import type { CanvasElement, ColorKey } from "@/lib/types"
import { cn } from "@/lib/utils"

export function Inspector() {
  const elements = useEditor((s) => s.project.elements)
  const selectedIds = useEditor((s) => s.selectedIds)
  const project = useEditor((s) => s.project)
  const updateElement = useEditor((s) => s.updateElement)
  const setColorForSelected = useEditor((s) => s.setColorForSelected)
  const setBackground = useEditor((s) => s.setBackground)
  const bringToFront = useEditor((s) => s.bringToFront)
  const sendToBack = useEditor((s) => s.sendToBack)
  const bringForward = useEditor((s) => s.bringForward)
  const sendBackward = useEditor((s) => s.sendBackward)
  const toggleLock = useEditor((s) => s.toggleLock)
  const duplicateSelected = useEditor((s) => s.duplicateSelected)
  const deleteSelected = useEditor((s) => s.deleteSelected)
  const gridSize = useEditor((s) => s.gridSize)

  const selected = elements.filter((e) => selectedIds.includes(e.id))
  const el = selected[0]

  return (
    <div className="glass editor-scroll flex h-full w-72 flex-col overflow-y-auto border-l border-white/10">
      {!el ? (
        <div className="flex flex-col gap-5 p-4">
          <Section title="Canvas">
            <Row label="Size">
              <span className="text-sm text-muted-foreground">
                {project.width} × {project.height}
              </span>
            </Row>
            <Row label="Background">
              <ColorInput value={project.background} onChange={setBackground} />
            </Row>
            <Row label="Grid size">
              <span className="text-sm text-muted-foreground">{gridSize}px</span>
            </Row>
          </Section>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            Select an element to edit its properties. Double-click any block to edit its text.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-4">
          <div>
            <p className="text-sm font-semibold">{el.name}</p>
            <p className="text-xs text-muted-foreground">
              {selected.length > 1 ? `${selected.length} elements selected` : el.type}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex gap-1.5">
            <IconBtn title="Duplicate" onClick={duplicateSelected}>
              <Copy size={15} />
            </IconBtn>
            <IconBtn title={el.locked ? "Unlock" : "Lock"} onClick={() => toggleLock(el.id)} active={el.locked}>
              {el.locked ? <Lock size={15} /> : <Unlock size={15} />}
            </IconBtn>
            <IconBtn title="Delete" danger onClick={deleteSelected}>
              <Trash2 size={15} />
            </IconBtn>
          </div>

          {/* Color */}
          <Section title="Color">
            <div className="grid grid-cols-9 gap-1.5">
              {COLOR_KEYS.map((key) => (
                <ColorSwatch
                  key={key}
                  colorKey={key}
                  active={selected.every((s) => s.color === key)}
                  onClick={() => setColorForSelected(key)}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{palette(el.color).meaning}</p>
          </Section>

          {selected.length === 1 && (
            <>
              {/* Position & size */}
              <Section title="Transform">
                <div className="grid grid-cols-2 gap-2">
                  <NumField label="X" value={Math.round(el.x)} onChange={(v) => updateElement(el.id, { x: v })} />
                  <NumField label="Y" value={Math.round(el.y)} onChange={(v) => updateElement(el.id, { y: v })} />
                  <NumField label="W" value={Math.round(el.w)} min={20} onChange={(v) => updateElement(el.id, { w: v })} />
                  <NumField label="H" value={Math.round(el.h)} min={20} onChange={(v) => updateElement(el.id, { h: v })} />
                </div>
                <Row label="Rotation">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={el.rotation}
                      onChange={(e) => updateElement(el.id, { rotation: Number(e.target.value) })}
                      className="w-28 accent-foreground"
                    />
                    <span className="w-10 text-right text-xs text-muted-foreground">{el.rotation}°</span>
                  </div>
                </Row>
                <Row label="Opacity">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={el.opacity}
                      onChange={(e) => updateElement(el.id, { opacity: Number(e.target.value) })}
                      className="w-28 accent-foreground"
                    />
                    <span className="w-10 text-right text-xs text-muted-foreground">{Math.round(el.opacity * 100)}%</span>
                  </div>
                </Row>
              </Section>

              {/* Text options */}
              {el.fontSize !== undefined && (
                <Section title="Typography">
                  <Row label="Font size">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={10}
                        max={140}
                        value={el.fontSize}
                        onChange={(e) => updateElement(el.id, { fontSize: Number(e.target.value) })}
                        className="w-24 accent-foreground"
                      />
                      <span className="w-8 text-right text-xs text-muted-foreground">{el.fontSize}</span>
                    </div>
                  </Row>
                  {supportsAlign(el) && (
                    <Row label="Align">
                      <div className="flex gap-1">
                        {(["left", "center", "right"] as const).map((a) => (
                          <IconBtn key={a} title={a} active={el.align === a} onClick={() => updateElement(el.id, { align: a })}>
                            {a === "left" ? <AlignLeft size={14} /> : a === "center" ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                          </IconBtn>
                        ))}
                      </div>
                    </Row>
                  )}
                </Section>
              )}

              {el.type === "progress" && (
                <Section title="Progress">
                  <Row label="Value">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={el.progress ?? 0}
                        onChange={(e) => updateElement(el.id, { progress: Number(e.target.value) })}
                        className="w-24 accent-foreground"
                      />
                      <span className="w-8 text-right text-xs text-muted-foreground">{el.progress ?? 0}%</span>
                    </div>
                  </Row>
                </Section>
              )}

              {el.type === "code" && (
                <Section title="Code">
                  <Row label="Language">
                    <input
                      value={el.language ?? ""}
                      onChange={(e) => updateElement(el.id, { language: e.target.value })}
                      className="h-7 w-28 rounded-md border border-white/10 bg-black/30 px-2 text-xs outline-none"
                    />
                  </Row>
                </Section>
              )}
            </>
          )}

          {/* Arrange */}
          <Section title="Arrange">
            <div className="grid grid-cols-4 gap-1.5">
              <IconBtn title="Bring to front" onClick={() => bringToFront(el.id)}>
                <ArrowUpToLine size={15} />
              </IconBtn>
              <IconBtn title="Forward" onClick={() => bringForward(el.id)}>
                <ArrowUp size={15} />
              </IconBtn>
              <IconBtn title="Backward" onClick={() => sendBackward(el.id)}>
                <ArrowDown size={15} />
              </IconBtn>
              <IconBtn title="Send to back" onClick={() => sendToBack(el.id)}>
                <ArrowDownToLine size={15} />
              </IconBtn>
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}

function supportsAlign(el: CanvasElement) {
  return el.type === "title" || el.type === "subtitle" || el.type === "paragraph"
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground/80">{label}</span>
      {children}
    </div>
  )
}

function NumField({
  label,
  value,
  onChange,
  min,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
}) {
  return (
    <label className="flex items-center gap-1.5 rounded-md border border-white/10 bg-black/30 px-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          onChange(min !== undefined ? Math.max(min, n) : n)
        }}
        className="h-7 w-full bg-transparent text-xs outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
    </label>
  )
}

function IconBtn({
  children,
  onClick,
  title,
  active,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-8 flex-1 items-center justify-center rounded-lg border transition-colors",
        active
          ? "border-white/30 bg-white/15 text-foreground"
          : danger
            ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
            : "border-white/10 bg-white/[0.03] text-foreground/80 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  )
}

function ColorSwatch({ colorKey, active, onClick }: { colorKey: ColorKey; active: boolean; onClick: () => void }) {
  const p = palette(colorKey)
  return (
    <button
      title={`${p.label} — ${p.meaning}`}
      onClick={onClick}
      className={cn("h-6 w-6 rounded-md border transition-transform hover:scale-110", active ? "ring-2 ring-white ring-offset-2 ring-offset-transparent" : "")}
      style={{ background: p.border, borderColor: p.accent }}
    />
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 cursor-pointer rounded border border-white/10 bg-transparent"
      />
      <span className="text-xs text-muted-foreground">{value}</span>
    </div>
  )
}
