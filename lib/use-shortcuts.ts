"use client"

import { useEffect } from "react"
import { useEditor } from "./store"

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return el.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

export function useShortcuts() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = useEditor.getState()
      const mod = e.metaKey || e.ctrlKey
      const typing = isTyping(e.target)

      // Undo / redo work even while inputs are focused? No — skip when typing text.
      if (mod && e.key.toLowerCase() === "z") {
        if (typing) return
        e.preventDefault()
        if (e.shiftKey) s.redo()
        else s.undo()
        return
      }
      if (mod && e.key.toLowerCase() === "y") {
        if (typing) return
        e.preventDefault()
        s.redo()
        return
      }

      if (typing) return

      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault()
        s.duplicateSelected()
        return
      }
      if (mod && e.key.toLowerCase() === "c") {
        s.copy()
        return
      }
      if (mod && e.key.toLowerCase() === "v") {
        s.paste()
        return
      }
      if (mod && e.key.toLowerCase() === "a") {
        e.preventDefault()
        s.selectMany(s.project.elements.filter((el) => !el.hidden && !el.locked).map((el) => el.id))
        return
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (s.selectedIds.length > 0) {
          e.preventDefault()
          s.deleteSelected()
        }
        return
      }

      if (e.key === "Escape") {
        if (s.editingId) s.setEditing(null)
        else s.clearSelection()
        return
      }

      // Arrow-key nudging
      const step = e.shiftKey ? 10 : 1
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        s.moveSelected(-step, 0)
        s.commit()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        s.moveSelected(step, 0)
        s.commit()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        s.moveSelected(0, -step)
        s.commit()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        s.moveSelected(0, step)
        s.commit()
      }

      // Zoom to fit
      if (e.shiftKey && e.key === "1") {
        const c = document.getElementById("canvas-viewport")
        if (c) s.zoomToFit(c.clientWidth, c.clientHeight)
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
}
