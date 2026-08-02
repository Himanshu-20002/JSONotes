"use client"

import { useState } from "react"
import { useEditor } from "@/lib/store"
import {
  exportWallpaper,
  exportProjectJSON,
  exportContentJSON,
  RESOLUTIONS,
  type ExportFormat,
} from "@/lib/export"
import { Download, X, Loader2, ImageIcon, FileJson, Layers } from "lucide-react"

const FORMATS: { label: string; value: ExportFormat; note: string }[] = [
  { label: "SVG", value: "svg", note: "Primary format: Vector, infinitely crisp" },
  { label: "PNG", value: "png", note: "High-resolution raster output" },
  { label: "JPEG", value: "jpeg", note: "Compressed image file" },
]

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const project = useEditor((s) => s.project)
  const [format, setFormat] = useState<ExportFormat>("svg")
  const [resIndex, setResIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    setBusy(true)
    setError(null)
    try {
      await exportWallpaper(project, format, RESOLUTIONS[resIndex])
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close export dialog"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass relative w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ImageIcon className="size-5 text-primary" />
            Export Wallpaper
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  title={f.note}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    format === f.value
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {format !== "svg" && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Resolution
              </label>
              <div className="grid grid-cols-2 gap-2">
                {RESOLUTIONS.map((r, i) => (
                  <button
                    key={r.label}
                    onClick={() => setResIndex(i)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                      resIndex === i
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <button
            onClick={run}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {busy ? "Exporting…" : `Export ${format.toUpperCase()}`}
          </button>

          <div className="border-t border-border pt-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              JSON Serialization
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  exportProjectJSON(project)
                  onClose()
                }}
                disabled={busy}
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground disabled:opacity-60"
              >
                <FileJson className="size-4 text-primary" /> Project JSON
              </button>
              <button
                onClick={() => {
                  exportContentJSON(project)
                  onClose()
                }}
                disabled={busy}
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground disabled:opacity-60"
              >
                <Layers className="size-4 text-cyan-400" /> Content JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
