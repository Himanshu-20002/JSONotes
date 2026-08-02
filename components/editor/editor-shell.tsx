"use client"

import { useEffect, useState } from "react"
import { Toolbar } from "./toolbar"
import { LeftPanel } from "./left-panel"
import { Inspector } from "./inspector"
import { Canvas } from "./canvas"
import { ExportDialog } from "./export-dialog"
import { ImportModal } from "./import-modal"
import { useShortcuts } from "@/lib/use-shortcuts"

export function EditorShell() {
  const [mounted, setMounted] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  useShortcuts()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <Toolbar
        onExport={() => setShowExport(true)}
        onImportJSON={() => setShowImportModal(true)}
      />
      <div className="flex min-h-0 flex-1">
        <LeftPanel />
        <main className="relative min-w-0 flex-1">
          <Canvas />
        </main>
        <Inspector />
      </div>
      {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} />}
    </div>
  )
}
