"use client"

import { useEffect, useRef, useState } from "react"
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react"
import { useEditor } from "@/lib/store"
import { ElementFrame } from "./element-frame"

const RULER = 22

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const project = useEditor((s) => s.project)
  const viewport = useEditor((s) => s.viewport)
  const showGrid = useEditor((s) => s.showGrid)
  const gridSize = useEditor((s) => s.gridSize)
  const showRulers = useEditor((s) => s.showRulers)
  const setPan = useEditor((s) => s.setPan)
  const setZoom = useEditor((s) => s.setZoom)
  const clearSelection = useEditor((s) => s.clearSelection)
  const zoomToFit = useEditor((s) => s.zoomToFit)

  const [spaceDown, setSpaceDown] = useState(false)
  const pan = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null)

  // Fit on first mount
  useEffect(() => {
    const el = containerRef.current
    if (el) zoomToFit(el.clientWidth, el.clientHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target as HTMLElement)?.isContentEditable) setSpaceDown(true)
    }
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceDown(false)
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [])

  function onBackgroundPointerDown(e: ReactPointerEvent) {
    const isPan = spaceDown || e.button === 1
    pan.current = { x: e.clientX, y: e.clientY, px: viewport.panX, py: viewport.panY, moved: false }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    pan.current.moved = false
    ;(pan.current as any).isPan = isPan
  }

  function onBackgroundPointerMove(e: ReactPointerEvent) {
    const p = pan.current
    if (!p) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) p.moved = true
    if ((p as any).isPan) setPan(p.px + dx, p.py + dy)
  }

  function onBackgroundPointerUp(e: ReactPointerEvent) {
    const p = pan.current
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    if (p && !p.moved && !(p as any).isPan) clearSelection()
    pan.current = null
  }

  function onWheel(e: ReactWheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
      const newZoom = Math.min(3, Math.max(0.1, viewport.zoom * factor))
      const wx = (mx - viewport.panX) / viewport.zoom
      const wy = (my - viewport.panY) / viewport.zoom
      setPan(mx - wx * newZoom, my - wy * newZoom)
      setZoom(newZoom)
    } else {
      setPan(viewport.panX - e.deltaX, viewport.panY - e.deltaY)
    }
  }

  const { zoom, panX, panY } = viewport
  const visible = project.elements.filter((el) => !el.hidden)

  return (
    <div
      ref={containerRef}
      id="canvas-viewport"
      onWheel={onWheel}
      onPointerDown={onBackgroundPointerDown}
      onPointerMove={onBackgroundPointerMove}
      onPointerUp={onBackgroundPointerUp}
      className="relative h-full w-full overflow-hidden bg-[#07070c]"
      style={{ cursor: spaceDown ? "grab" : "default" }}
    >
      {/* dotted backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Artboard */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        <div
          id="wallpaper-artboard"
          style={{
            position: "relative",
            width: project.width,
            height: project.height,
            background: project.background,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 40px 120px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          {showGrid && (
            <div
              data-export-ignore
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}
          {visible.map((el) => (
            <ElementFrame key={el.id} el={el} zoom={zoom} />
          ))}
        </div>
      </div>

      {/* Rulers */}
      {showRulers && <Rulers zoom={zoom} panX={panX} panY={panY} width={project.width} height={project.height} />}

      {/* Empty state */}
      {project.elements.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-full bg-white/5 px-4 py-2 text-sm text-muted-foreground">
            Add blocks from the left panel or load a template to begin
          </p>
        </div>
      )}
    </div>
  )
}

function Rulers({
  zoom,
  panX,
  panY,
  width,
  height,
}: {
  zoom: number
  panX: number
  panY: number
  width: number
  height: number
}) {
  const step = zoom < 0.3 ? 500 : zoom < 0.7 ? 200 : 100
  const hMarks: number[] = []
  for (let x = 0; x <= width; x += step) hMarks.push(x)
  const vMarks: number[] = []
  for (let y = 0; y <= height; y += step) vMarks.push(y)

  return (
    <>
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 border-b border-white/10 bg-[#0d0d16]/90 text-[9px] text-muted-foreground"
        style={{ height: RULER, right: 0, paddingLeft: RULER }}
      >
        {hMarks.map((x) => (
          <div key={x} className="absolute top-0 h-full border-l border-white/15 pl-1" style={{ left: RULER + panX + x * zoom }}>
            {x}
          </div>
        ))}
      </div>
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 border-r border-white/10 bg-[#0d0d16]/90 text-[9px] text-muted-foreground"
        style={{ width: RULER, bottom: 0, paddingTop: RULER }}
      >
        {vMarks.map((y) => (
          <div key={y} className="absolute left-0 w-full border-t border-white/15 pl-1" style={{ top: RULER + panY + y * zoom }}>
            {y}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute left-0 top-0 z-20 bg-[#0d0d16]" style={{ width: RULER, height: RULER }} />
    </>
  )
}
