# JSONotes — Recommendation UX & User Layout Preferences Architecture

## Overview
**Phase 7** connects the **Layout Recommendation Engine** to the product UI by implementing a 2-stage **Analyze-Before-Generate** workflow in `components/editor/import-modal.tsx` and adding **Preference-Aware Re-Ranking** in `lib/engine/recommendation/`.

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

## 🎛 Layout Preferences Model

```typescript
export interface LayoutPreferences {
  density: "auto" | "compact" | "comfortable"
  priority: "auto" | "readability" | "fit-more" | "code"
  structure: "auto" | "balanced" | "grid"
}
```

- **Density**:
  - `compact`: Adds preference boost to `cheat-sheet`.
  - `comfortable`: Adds preference boost to `concept-grid` and `balanced`.
- **Priority**:
  - `code`: Prioritizes `code-focus` when code blocks exist.
  - `fit-more`: Boosts high-utilization dashboard layouts.
  - `readability`: Boosts optimal line-length card layouts.
- **Structure**:
  - `grid`: Boosts `concept-grid` and `cheat-sheet`.
  - `balanced`: Boosts `balanced`.

---

## 🛡 Key Guarantees
1. **Manual Selection Persistence**: If a user manually clicks a candidate layout card (e.g. `code-focus`), their manual selection remains active even if subsequent preference changes update the underlying recommendation rank.
2. **Compiler Isolation**: Canvas element state is only modified when the user clicks **Generate Notes**.
3. **Backward Compatibility**: Custom pre-positioned `elements[]` JSON bypasses the recommendation modal step and imports directly to the canvas.
