"use client"

import { useState } from "react"
import { useEditor } from "@/lib/store"
import { parsePastedJSON } from "@/lib/export"
import { X, FileJson, CheckCircle, AlertCircle, Sparkles, LayoutGrid } from "lucide-react"

const SAMPLE_TEMPLATE_NOTES = `{
  "theme": "dark",
  "layout": "desktop",
  "template": "study-notes-v1",
  "content": {
    "title": "Execution Context",
    "subtitle": "The environment where JavaScript code executes.",
    "definition": "An abstract concept holding information about the environment in which code runs.",
    "concepts": [
      "Creation Phase: Memory creation for variables & functions.",
      "Execution Phase: Code is executed line by line."
    ],
    "code": {
      "language": "javascript",
      "code": "function multiply(a, b) {\\n  const res = a * b;\\n  return res;\\n}\\nconst ans = multiply(4, 5);\\nconsole.log(ans);"
    },
    "interview": "Explain how the Call Stack manages global and function Execution Contexts.",
    "warning": "Avoid recursive calls without base conditions to prevent Stack Overflow!",
    "memory": "Remember: Call Stack = LIFO (Last In, First Out).",
    "summary": [
      "Global Execution Context is created first",
      "Function Execution Context per call",
      "Manages Variable Environment & Lexical Scope"
    ],
    "notes": "Lexical scope is established during compilation, not execution.",
    "related": [
      "Scope Chain",
      "Closures",
      "Call Stack"
    ]
  }
}`

const SAMPLE_CONTENT_ONLY = `{
  "content": {
    "title": "React Re-rendering Engine",
    "subtitle": "How Virtual DOM & Fiber reconciliation work.",
    "definition": "Re-rendering is the process where React calls components to determine UI changes.",
    "concepts": [
      "Render Phase: Computes Virtual DOM diffs.",
      "Commit Phase: Applies changes to the real DOM."
    ],
    "code": {
      "language": "typescript",
      "code": "const [count, setCount] = useState(0);\\nuseCallback(() => {\\n  console.log(count);\\n}, [count]);"
    },
    "interview": "Why do primitive state updates skip rendering if values match Object.is?",
    "warning": "Do not mutate state directly; always pass a new object or array instance!",
    "memory": "Remember: State triggers Render, Effect runs after Commit.",
    "summary": [
      "Virtual DOM diffing with reconciliation",
      "Batching state updates for performance"
    ]
  }
}`

export function ImportModal({ onClose }: { onClose: () => void }) {
  const [jsonText, setJsonText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const importProjectJSON = useEditor((s) => s.importProjectJSON)
  const importBlocksJSON = useEditor((s) => s.importBlocksJSON)

  function handleImport() {
    setError(null)
    setSuccess(null)
    if (!jsonText.trim()) {
      setError("Please paste a JSON configuration.")
      return
    }

    try {
      const parsed = parsePastedJSON(jsonText)
      if (parsed.type === "template") {
        importProjectJSON(parsed.data, parsed.blocks, parsed.templateId, parsed.rawContent)
        setSuccess(`Successfully rendered ${parsed.templateId} study wallpaper!`)
      } else if (parsed.type === "project") {
        importProjectJSON(parsed.data, parsed.blocks)
        setSuccess("Successfully loaded wallpaper project JSON!")
      } else {
        importBlocksJSON(parsed.blocks)
        setSuccess("Successfully loaded content blocks!")
      }
      setTimeout(() => {
        onClose()
      }, 600)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse JSON.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close modal background"
        className="absolute inset-0 bg-background/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass relative flex w-full max-w-2xl flex-col rounded-2xl border border-border p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <FileJson className="size-5 text-primary" />
            Import Study Notes JSON
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Paste pure content JSON (no x, y, width or height required). The template engine automatically positions every section into professional slots.
        </p>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Presets:</span>
          <button
            onClick={() => { setJsonText(SAMPLE_TEMPLATE_NOTES); setError(null) }}
            className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
          >
            <LayoutGrid className="size-3.5 text-primary" /> study-notes-v1 Payload
          </button>
          <button
            onClick={() => { setJsonText(SAMPLE_CONTENT_ONLY); setError(null) }}
            className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Sparkles className="size-3.5 text-cyan-400" /> Pure Content JSON
          </button>
        </div>

        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={`{\n  "template": "study-notes-v1",\n  "content": {\n    "title": "topic",\n    "definition": "...",\n    "code": "..."\n  }\n}`}
          spellCheck={false}
          className="mt-3 h-72 w-full resize-none rounded-xl border border-border bg-black/40 p-4 font-mono text-xs text-foreground outline-none focus:border-primary"
        />

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/15 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs text-emerald-400">
            <CheckCircle className="size-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Render Wallpaper
          </button>
        </div>
      </div>
    </div>
  )
}
