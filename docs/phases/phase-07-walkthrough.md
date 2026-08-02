# JSONotes — Phase 7: Recommendation UX + User Layout Preferences Walkthrough

## Overview
In **Phase 7**, we connected the **Layout Recommendation Engine** to the user interface by introducing a 2-stage **Analyze-Before-Generate** import workflow in `components/editor/import-modal.tsx` and adding **Preference-Aware Re-Ranking** in `lib/engine/recommendation/`.

---

## 🏗 User Flow & State Architecture

```
                       ┌─────────────────────────────────┐
                       │          JSON / Markdown        │
                       └─────────────────────────────────┘
                                        │
                                        ▼
                                ┌───────────────┐
                                │ Analyze Input │
                                └───────────────┘
                                        │
                                        ▼
                       ┌─────────────────────────────────┐
                       │    recommendLayout(doc, opts)   │
                       └─────────────────────────────────┘
                                        │
                                        ▼
                       ┌─────────────────────────────────┐
                       │       Recommendation Screen     │
                       │                                 │
                       │ ★ Winner Card (Match Score)     │
                       │ 📊 Candidate Scores (4 Layouts) │
                       │ 🎛 Preferences (Density/Pri/Str)│
                       └─────────────────────────────────┘
                                        │
                         (User Selects Layout / Customizes)
                                        │
                                        ▼
                       ┌─────────────────────────────────┐
                       │         [Generate Notes]        │
                       └─────────────────────────────────┘
                                        │
                                        ▼
                       ┌─────────────────────────────────┐
                       │   compileTemplateStudyNotesV1   │
                       │   (Explicit selected layout)    │
                       └─────────────────────────────────┘
                                        │
                                        ▼
                       ┌─────────────────────────────────┐
                       │          Zustand Store          │
                       │    (Render CanvasElements)      │
                       └─────────────────────────────────┘
```

---

## 📁 Files Created & Modified

### 1. New Recommendation Engine Extensions
- **[lib/engine/recommendation/preference-fit.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/recommendation/preference-fit.ts)**: Evaluates layout preference matches (`density`, `priority`, `structure`).
- **[docs/recommendation-ui.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/recommendation-ui.md)**: Architectural documentation covering UX workflow & preference model.

### 2. Modified Core Files
- **[lib/engine/recommendation/types.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/recommendation/types.ts)**: Added `LayoutPreferences` interface and optional `preferenceFit` breakdown field.
- **[lib/engine/recommendation/score-candidate.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/recommendation/score-candidate.ts)**: Integrated preference fit into weighted candidate scoring ($40\%$ content, $30\%$ geometry, $20\%$ readability, $10\%$ preference).
- **[lib/engine/recommendation/recommend-layout.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/recommendation/recommend-layout.ts)**: Accepted `{ preferences }` options parameter.
- **[components/editor/import-modal.tsx](file:///x:/projects/next.js/wallpaper-notes-editor/components/editor/import-modal.tsx)**: Refactored modal into 2 steps (`input` $\rightarrow$ `recommendation`), displaying recommendation confidence, candidate score cards, preference selectors, and explicit generation controls.

---

## 🎛 Preference Model & Re-Ranking

```typescript
export interface LayoutPreferences {
  density: "auto" | "compact" | "comfortable"
  priority: "auto" | "readability" | "fit-more" | "code"
  structure: "auto" | "balanced" | "grid"
}
```

- **Selection Persistence**: If a user manually clicks a layout candidate (e.g. `cheat-sheet`), their explicit manual selection remains active even if subsequent preference changes update the underlying recommendation rank.
- **Direct Custom Import**: Custom pre-positioned `elements[]` JSON bypasses the recommendation screen and imports directly to the canvas.

---

## 🧪 Verification & Build Status
- **Explicit Compiler Execution**: Confirmed that `compileTemplateStudyNotesV1(content, { layout: selectedLayout })` strictly renders the chosen strategy.
- **TypeScript Check (`npx tsc --noEmit`)**: 0 errors.
- **Next.js Production Build (`npm run build`)**: Compiled successfully in 3.6s.
