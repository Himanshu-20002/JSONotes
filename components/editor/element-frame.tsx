"use client"

import { useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import type { CanvasElement } from "@/lib/types"
import { useEditor } from "@/lib/store"
import { palette } from "@/lib/colors"
import { BlockRenderer } from "./block-renderer"

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w"

const HANDLES: { key: Handle; cx: number; cy: number; cursor: string }[] = [
  { key: "nw", cx: 0, cy: 0, cursor: "nwse-resize" },
  { key: "n", cx: 0.5, cy: 0, cursor: "ns-resize" },
  { key: "ne", cx: 1, cy: 0, cursor: "nesw-resize" },
  { key: "e", cx: 1, cy: 0.5, cursor: "ew-resize" },
  { key: "se", cx: 1, cy: 1, cursor: "nwse-resize" },
  { key: "s", cx: 0.5, cy: 1, cursor: "ns-resize" },
  { key: "sw", cx: 0, cy: 1, cursor: "nesw-resize" },
  { key: "w", cx: 0, cy: 0.5, cursor: "ew-resize" },
]

const MIN = 40

export function ElementFrame({ el, zoom }: { el: CanvasElement; zoom: number }) {
  const selectedIds = useEditor((s) => s.selectedIds)
  const editingId = useEditor((s) => s.editingId)
  const snap = useEditor((s) => s.snap)
  const gridSize = useEditor((s) => s.gridSize)
  const select = useEditor((s) => s.select)
  const setEditing = useEditor((s) => s.setEditing)
  const updateElementLive = useEditor((s) => s.updateElementLive)
  const updateElement = useEditor((s) => s.updateElement)
  const commit = useEditor((s) => s.commit)

  const selected = selectedIds.includes(el.id)
  const editing = editingId === el.id
  const p = palette(el.color)

  const gesture = useRef<{
    mode: "drag" | "resize" | "rotate"
    handle?: Handle
    startX: number
    startY: number
    starts: Record<string, { x: number; y: number; w: number; h: number; rotation: number }>
    cx: number
    cy: number
    startAngle: number
  } | null>(null)

  const snapVal = (v: number) => (snap ? Math.round(v / gridSize) * gridSize : Math.round(v))

  function beginDrag(e: ReactPointerEvent) {
    if (el.locked || editing) return
    e.stopPropagation()
    const additive = e.shiftKey
    let ids = selectedIds
    if (!selected) {
      select(el.id, additive)
      ids = additive ? [...selectedIds, el.id] : [el.id]
    }
    const state = useEditor.getState()
    const starts: Record<string, { x: number; y: number; w: number; h: number; rotation: number }> = {}
    for (const id of ids) {
      const target = state.project.elements.find((x) => x.id === id)
      if (target && !target.locked) starts[id] = { x: target.x, y: target.y, w: target.w, h: target.h, rotation: target.rotation }
    }
    gesture.current = { mode: "drag", startX: e.clientX, startY: e.clientY, starts, cx: 0, cy: 0, startAngle: 0 }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function beginResize(e: ReactPointerEvent, handle: Handle) {
    if (el.locked) return
    e.stopPropagation()
    if (!selected) select(el.id)
    gesture.current = {
      mode: "resize",
      handle,
      startX: e.clientX,
      startY: e.clientY,
      starts: { [el.id]: { x: el.x, y: el.y, w: el.w, h: el.h, rotation: el.rotation } },
      cx: 0,
      cy: 0,
      startAngle: 0,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function beginRotate(e: ReactPointerEvent) {
    if (el.locked) return
    e.stopPropagation()
    if (!selected) select(el.id)
    const rect = (e.currentTarget as HTMLElement).closest("[data-frame]")?.getBoundingClientRect()
    const cx = rect ? rect.left + rect.width / 2 : e.clientX
    const cy = rect ? rect.top + rect.height / 2 : e.clientY
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI)
    gesture.current = {
      mode: "rotate",
      startX: e.clientX,
      startY: e.clientY,
      starts: { [el.id]: { x: el.x, y: el.y, w: el.w, h: el.h, rotation: el.rotation } },
      cx,
      cy,
      startAngle,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onMove(e: ReactPointerEvent) {
    const g = gesture.current
    if (!g) return
    const dx = (e.clientX - g.startX) / zoom
    const dy = (e.clientY - g.startY) / zoom

    if (g.mode === "drag") {
      const base = g.starts[el.id]
      const targetX = snapVal(base.x + dx)
      const targetY = snapVal(base.y + dy)
      const adjX = targetX - base.x
      const adjY = targetY - base.y
      for (const id of Object.keys(g.starts)) {
        const s = g.starts[id]
        updateElementLive(id, { x: s.x + adjX, y: s.y + adjY })
      }
    } else if (g.mode === "resize" && g.handle) {
      const s = g.starts[el.id]
      let { x, y, w, h } = s
      const h_ = g.handle
      if (h_.includes("e")) w = Math.max(MIN, snapVal(s.w + dx))
      if (h_.includes("s")) h = Math.max(MIN, snapVal(s.h + dy))
      if (h_.includes("w")) {
        const nx = snapVal(s.x + dx)
        w = Math.max(MIN, s.w + (s.x - nx))
        x = s.x + s.w - w
      }
      if (h_.includes("n")) {
        const ny = snapVal(s.y + dy)
        h = Math.max(MIN, s.h + (s.y - ny))
        y = s.y + s.h - h
      }
      updateElementLive(el.id, { x, y, w, h })
    } else if (g.mode === "rotate") {
      const angle = Math.atan2(e.clientY - g.cy, e.clientX - g.cx) * (180 / Math.PI)
      let rotation = g.starts[el.id].rotation + (angle - g.startAngle)
      if (e.shiftKey) rotation = Math.round(rotation / 15) * 15
      updateElementLive(el.id, { rotation: Math.round(rotation) })
    }
  }

  function endGesture(e: ReactPointerEvent) {
    if (!gesture.current) return
    gesture.current = null
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    // push a single history entry for the whole gesture
    commit()
    // ensure zustand persists the finished values (no-op patch keeps identity)
    updateElement(el.id, {})
  }

  const handleSize = 10 / zoom
  const border = 1.5 / zoom

  return (
    <div
      data-frame
      onPointerDown={beginDrag}
      onPointerMove={onMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
      onDoubleClick={(e) => {
        e.stopPropagation()
        if (!el.locked) setEditing(el.id)
      }}
      style={{
        position: "absolute",
        left: el.x,
        top: el.y,
        width: el.w,
        height: el.h,
        transform: `rotate(${el.rotation}deg)`,
        transformOrigin: "center center",
        opacity: el.opacity,
        cursor: editing ? "text" : el.locked ? "default" : "move",
        touchAction: "none",
      }}
    >
      <BlockRenderer
        el={el}
        editing={editing}
        onChange={(patch) => updateElement(el.id, patch)}
        onStopEditing={() => setEditing(null)}
      />

      {selected && !editing && (
        <>
          <div
            style={{
              position: "absolute",
              inset: -border,
              border: `${border * 2}px solid ${p.accent}`,
              borderRadius: 4,
              pointerEvents: "none",
              boxShadow: `0 0 0 ${border}px rgba(0,0,0,0.15)`,
            }}
          />
          {!el.locked &&
            HANDLES.map((h) => (
              <div
                key={h.key}
                onPointerDown={(e) => beginResize(e, h.key)}
                onPointerMove={onMove}
                onPointerUp={endGesture}
                style={{
                  position: "absolute",
                  left: `calc(${h.cx * 100}% - ${handleSize / 2}px)`,
                  top: `calc(${h.cy * 100}% - ${handleSize / 2}px)`,
                  width: handleSize,
                  height: handleSize,
                  background: "#fff",
                  border: `${border}px solid ${p.accent}`,
                  borderRadius: 2,
                  cursor: h.cursor,
                  touchAction: "none",
                }}
              />
            ))}
          {!el.locked && (
            <div
              onPointerDown={beginRotate}
              onPointerMove={onMove}
              onPointerUp={endGesture}
              style={{
                position: "absolute",
                left: `calc(50% - ${handleSize / 2}px)`,
                top: -handleSize * 2.4,
                width: handleSize,
                height: handleSize,
                background: p.accent,
                borderRadius: 999,
                cursor: "grab",
                touchAction: "none",
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
