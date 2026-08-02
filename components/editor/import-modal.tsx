"use client"

import { useState } from "react"
import { useEditor } from "@/lib/store"
import { parsePastedJSON } from "@/lib/export"
import {
  normalizeContent,
  analyzeContent,
  recommendLayout,
  getAvailableLayouts,
  compileTemplateStudyNotesV1,
} from "@/lib/engine"
import type {
  SemanticDocument,
  ContentAnalysis,
  RecommendationResult,
  LayoutId,
  LayoutPreferences,
} from "@/lib/engine"
import {
  X,
  FileJson,
  CheckCircle,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  ArrowLeft,
  Wand2,
  Check,
} from "lucide-react"

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

type ImportStep = "input" | "recommendation"

export function ImportModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<ImportStep>("input")
  const [jsonText, setJsonText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Recommendation & Analysis state
  const [rawParsedData, setRawParsedData] = useState<any>(null)
  const [semDoc, setSemDoc] = useState<SemanticDocument | null>(null)
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null)

  // Layout selection & User preferences
  const [selectedLayout, setSelectedLayout] = useState<LayoutId>("balanced")
  const [hasManualSelection, setHasManualSelection] = useState(false)
  const [preferences, setPreferences] = useState<LayoutPreferences>({
    density: "auto",
    priority: "auto",
    structure: "auto",
  })

  const importProjectJSON = useEditor((s) => s.importProjectJSON)
  const importBlocksJSON = useEditor((s) => s.importBlocksJSON)

  // Handle Step 1: Parse & Analyze Content
  function handleAnalyze() {
    setError(null)
    setSuccess(null)
    if (!jsonText.trim()) {
      setError("Please paste a JSON configuration.")
      return
    }

    try {
      const parsed = parsePastedJSON(jsonText)

      // Custom elements bypass recommendation and import directly
      if (parsed.type === "project" || parsed.type === "blocks") {
        if (parsed.type === "project") {
          importProjectJSON(parsed.data, parsed.blocks)
        } else {
          importBlocksJSON(parsed.blocks)
        }
        setSuccess("Successfully loaded custom canvas blocks!")
        setTimeout(onClose, 600)
        return
      }

      // Semantic document normalization & recommendation
      const rawContent = parsed.rawContent || parsed.data
      const doc = normalizeContent(rawContent)
      const contentAnalysis = analyzeContent(doc)
      const recResult = recommendLayout(doc, contentAnalysis, { preferences })

      setRawParsedData(parsed.data)
      setSemDoc(doc)
      setAnalysis(contentAnalysis)
      setRecommendation(recResult)

      setSelectedLayout(recResult.recommendedLayout)
      setHasManualSelection(false)
      setStep("recommendation")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse JSON.")
    }
  }

  // Handle Preference Change and Re-evaluate Recommendation
  function handlePreferenceChange(updatedPrefs: LayoutPreferences) {
    setPreferences(updatedPrefs)
    if (semDoc && analysis) {
      const newRec = recommendLayout(semDoc, analysis, { preferences: updatedPrefs })
      setRecommendation(newRec)
      if (!hasManualSelection) {
        setSelectedLayout(newRec.recommendedLayout)
      }
    }
  }

  // Handle Step 2: Final Generation with Selected Strategy
  function handleGenerate() {
    if (!semDoc || !rawParsedData) return
    const content = rawParsedData.content || rawParsedData
    const compiledBlocks = compileTemplateStudyNotesV1(content, { layout: selectedLayout })

    importProjectJSON(rawParsedData, compiledBlocks, rawParsedData.template || "study-notes-v1", content)
    setSuccess(`Successfully generated notes using '${selectedLayout}' layout!`)
    setTimeout(onClose, 600)
  }

  const availableLayouts = getAvailableLayouts()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close modal background"
        className="absolute inset-0 bg-background/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass relative flex w-full max-w-3xl flex-col rounded-2xl border border-border p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <FileJson className="size-5 text-primary" />
            {step === "input" ? "Import Study Notes JSON" : "Intelligent Layout Recommendation"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {step === "input" ? (
          <>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste pure content JSON. Our engine analyzes content structure and recommends the optimal visual layout.
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
                onClick={handleAnalyze}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Wand2 className="size-4" />
                Analyze Content
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-xs text-muted-foreground">
              Review layout match scores or select a custom strategy before generating your visual notes.
            </p>

            {/* Recommendation Winner Highlight */}
            {recommendation && (
              <div className="mt-3 rounded-xl border border-primary/40 bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Recommended
                    </span>
                    <h3 className="text-sm font-bold text-foreground">
                      {availableLayouts.find((l) => l.id === recommendation.recommendedLayout)?.name} Strategy
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-foreground">
                      Match: {recommendation.candidates.find((c) => c.layoutId === recommendation.recommendedLayout)?.score}/100
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                      Confidence: {recommendation.confidence >= 75 ? "High" : recommendation.confidence >= 55 ? "Good" : "Low"}
                    </span>
                  </div>
                </div>
                <ul className="mt-2.5 space-y-1 text-xs text-muted-foreground">
                  {recommendation.reasons.map((r, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-primary" /> {r.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* User Layout Preferences Controls */}
            <div className="mt-4 rounded-xl border border-border bg-black/20 p-3.5">
              <span className="text-xs font-medium text-foreground">Customize Recommendation Preferences:</span>
              <div className="mt-2.5 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-muted-foreground">Density</label>
                  <select
                    value={preferences.density}
                    onChange={(e) =>
                      handlePreferenceChange({ ...preferences, density: e.target.value as any })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="auto">Auto (Engine Decides)</option>
                    <option value="compact">Compact (Fit More)</option>
                    <option value="comfortable">Comfortable (Breathing Room)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Priority</label>
                  <select
                    value={preferences.priority}
                    onChange={(e) =>
                      handlePreferenceChange({ ...preferences, priority: e.target.value as any })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="auto">Auto</option>
                    <option value="readability">Readability Focus</option>
                    <option value="fit-more">Fit Maximum Content</option>
                    <option value="code">Prioritize Code Region</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Structure</label>
                  <select
                    value={preferences.structure}
                    onChange={(e) =>
                      handlePreferenceChange({ ...preferences, structure: e.target.value as any })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="auto">Auto</option>
                    <option value="balanced">Flexible Balanced</option>
                    <option value="grid">Structured Card Grid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Layout Strategy Candidates Grid */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {availableLayouts.map((meta) => {
                const evalData = recommendation?.candidates.find((c) => c.layoutId === meta.id)
                const isSelected = selectedLayout === meta.id
                const isRecommended = recommendation?.recommendedLayout === meta.id

                return (
                  <button
                    key={meta.id}
                    onClick={() => {
                      setSelectedLayout(meta.id)
                      setHasManualSelection(true)
                    }}
                    className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{meta.name}</span>
                      <div className="flex items-center gap-1.5">
                        {isRecommended && (
                          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                            Rec
                          </span>
                        )}
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          {evalData?.score || 0}/100
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{meta.description}</p>
                  </button>
                )
              })}
            </div>

            {success && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs text-emerald-400">
                <CheckCircle className="size-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <button
                onClick={() => setStep("input")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Back to Edit
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Generate Notes ({availableLayouts.find((l) => l.id === selectedLayout)?.name})
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
