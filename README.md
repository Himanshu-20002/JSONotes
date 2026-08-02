# JSONotes — Turn structured content into beautiful visual notes

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat-square)](https://github.com/pmndrs/zustand)

**JSONotes** is an open-source visual note-taking web application designed to convert raw, structured JSON or Markdown study notes into crisp, beautifully formatted study wallpapers, cheat sheets, concept cards, and code references.

---

## ✨ Features

- 🎨 **Freeform Visual Canvas**: Interactive 2560×1440 resolution canvas with pan, zoom, grid snapping, and element layering.
- 🧠 **Multi-Phase Semantic & Layout Engine**:
  - **Phase 1: Semantic Content Layer**: Decouples content understanding from canvas rendering into an intermediate `SemanticDocument`.
  - **Phase 2: Dynamic Block Measurement Engine**: Computes exact card height requirements using text-wrapping, font metrics, line counts, and padding calculations.
  - **Phase 3: Intelligent Balanced Layout Strategy**: Dynamic 1–3 column grid with multi-column feature block spanning ($1482\text{px}$) and collision detection.
  - **Phase 4: Layout Strategy Architecture & Code Focus**: Reusable strategy contract (`LayoutStrategy`) featuring `Balanced` and `Code Focus` layouts (prioritizing $60\%$ code region / $40\%$ explanation columns).
  - **Phase 5: Cheat Sheet & Concept Grid Strategies**: Added `Cheat Sheet` (compact 3-column revision dashboard) and `Concept Grid` (structured 2-column card grid with local row alignment).
  - **Phase 6: Intelligent Layout Recommendation & Scoring Engine**: Offline, deterministic candidate evaluator scoring strategies by content fit ($45\%$), geometry fit ($35\%$), and readability ($20\%$).
  - **Phase 7: Recommendation UX & User Layout Preferences**: 2-stage Analyze-Before-Generate import workflow with preference-aware re-ranking (`density`, `priority`, `structure`) and explicit candidate selection.
- ⚡ **Structured Content Import**: Import hand-written JSON or Markdown payloads without needing explicit $x, y$ coordinates.
- 📤 **Multi-Format High-Res Exports**: Export wallpapers in **PNG**, **JPEG**, **WebP**, **SVG**, or save projects losslessly as `.json`.
- ⌨️ **UX & Keyboard Productivity**: Full Undo (`Ctrl+Z`), Redo (`Ctrl+Y`), duplicate (`Ctrl+D`), delete (`Del`), layer locking (`Ctrl+L`), and multi-axis transforms.

---

## 🏗 Architecture & Data Flow

```
                                 ┌─────────────────────────────────┐
                                 │       Input JSON / Markdown     │
                                 └─────────────────────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │        normalizeContent()       │
                                 │   (lib/engine/semantic/...)     │
                                 └─────────────────────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │         SemanticDocument        │
                                 │  (Types, Importance, Density)   │
                                 └─────────────────────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │        analyzeContent()         │
                                 │  (Metrics & Heuristics)         │
                                 └─────────────────────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │      recommendLayout(opts)      │
                                 │ (lib/engine/recommendation/...) │
                                 └─────────────────────────────────┘
                                      /    │       │    \
                                     /     │       │     \
                                    v      v       v      v
                              ┌────────┐┌──────┐┌─────┐┌────────┐
                              │Balanced││CodeFoc││Cheat││ConceptG│
                              └────────┘└──────┘└─────┘└────────┘
                                     \     │       │     /
                                      \    │       │    /
                                       v   v       v   v
                                 ┌─────────────────────────────────┐
                                 │          measureBlock()         │
                                 │  (Dynamic Width Height Sizing)  │
                                 └─────────────────────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │      RecommendationResult       │
                                 │ (Ranked Candidates & Confidence)│
                                 └─────────────────────────────────┘
                                                  │
                                     (User Customizes / Selects)
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │           compiler.ts           │
                                 │ (Orchestrator to CanvasElements)│
                                 └─────────────────────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │          Zustand Store          │
                                 │         (lib/store.ts)          │
                                 └─────────────────────────────────┘
                                                  │
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │        React Canvas View        │
                                 │ (components/editor/canvas.tsx)  │
                                 └─────────────────────────────────┘
```

---

## 📁 Engine Directory Structure

```text
lib/
├── engine/
│   ├── semantic/                 # Phase 1: Content Normalization & Analysis
│   │   ├── analyze.ts            # Content heuristics & density analyzer
│   │   ├── normalize.ts          # Normalizes raw JSON/MD to SemanticDocument
│   │   ├── types.ts              # Semantic types (SemanticBlock, SemanticDocument)
│   │   └── index.ts
│   ├── measurement/              # Phase 2: Dynamic Block Sizing Engine
│   │   ├── constants.ts          # Typography sizes, padding, min & soft-max bounds
│   │   ├── measure-block.ts      # Semantic block router & overflow warning estimator
│   │   ├── measure-code.ts       # Code line numbers & line wrapping estimator
│   │   ├── measure-list.ts       # List item height & gap estimator
   │   ├── measure-text.ts       # Character-width text wrapping model
│   │   ├── types.ts              # Sizing constraints & warning types
│   │   └── index.ts              # Barrel containing detectCanvasOverflow()
│   ├── layout/                   # Phase 3, 4, 5: 4-Layout Strategy Architecture
│   │   ├── strategies/
│   │   │   ├── balanced.ts       # Dynamic 1–3 column grid with multi-column spans
│   │   │   ├── code-focus.ts     # 60/40 dominant code region layout
│   │   │   ├── cheat-sheet.ts    # Compact 3-column revision dashboard
│   │   │   ├── concept-grid.ts   # Structured 2-column knowledge card grid
│   │   │   └── index.ts
│   │   ├── constants.ts          # Canvas geometry & margin constants
│   │   ├── metrics.ts            # Area ratio, used height, column imbalance
│   │   ├── registry.ts           # Strategy registry supporting 4 layout strategies
│   │   ├── types.ts              # LayoutStrategy, LayoutId, LayoutMetadata, LayoutContext
│   │   ├── validation.ts         # Pure collision & bounds validation
│   │   └── index.ts
│   ├── recommendation/           # Phase 6 & 7: Recommendation & Scoring Engine
│   │   ├── constants.ts          # Score weights & penalty constants
│   │   ├── content-fit.ts        # Semantic strategy appropriateness evaluator
│   │   ├── geometry-fit.ts       # Canvas utilization, imbalance, overflow & readability
│   │   ├── preference-fit.ts     # Evaluates user preferences (density, priority, structure)
│   │   ├── recommend-layout.ts   # Candidate evaluation, tie-breaking & confidence
│   │   ├── score-candidate.ts    # Scoring pipeline & penalty application
│   │   ├── types.ts              # ContentProfile, ScoreBreakdown, LayoutPreferences
│   │   └── index.ts
│   ├── compiler.ts               # Pipeline Orchestrator to CanvasElement[]
│   └── index.ts                  # Public engine barrel API
├── blocks.ts                     # Block default definitions & factory functions
├── colors.ts                     # Color theme palettes (slate, blue, purple, yellow, red, etc.)
├── export.ts                     # HTML-to-Image canvas export & JSON serialization
├── highlight.tsx                 # Syntax highlighter for code blocks
├── renderer-registry.ts          # Registry mapping block components
├── store.ts                      # Central Zustand state management & Undo/Redo history
├── types.ts                      # Core TypeScript definitions (CanvasElement, Project)
└── utils.ts                      # Tailwind merge utility helpers
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` or `pnpm`

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Himanshu-20002/JSONotes.git
   cd JSONotes
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the editor.

---

## 📄 Example Input JSON Format

```json
{
  "template": "study-notes-v1",
  "content": {
    "title": "React UseEffect Hook",
    "subtitle": "Synchronization side-effect primitive",
    "definition": "A React Hook that lets you synchronize a component with an external system.",
    "concepts": [
      "Runs after DOM paint",
      "Cleanup function runs before re-render or unmount"
    ],
    "code": {
      "language": "typescript",
      "code": "useEffect(() => {\n  const sub = api.subscribe();\n  return () => sub.unsubscribe();\n}, []);"
    },
    "summary": [
      "Always specify dependency array",
      "Return cleanup functions for subscriptions"
    ],
    "warning": "Do not update state unconditionally inside useEffect!"
  }
}
```

---

## 📚 Technical Documentation

Detailed specifications and step-by-step phase walkthroughs are located in the [`docs/`](file:///x:/projects/next.js/wallpaper-notes-editor/docs/) directory:
- [docs/architecture.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/architecture.md): Overall application architecture & dataflow documentation.
- [docs/json-conversion.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/json-conversion.md): Input schema field mappings & grid specs.
- [docs/recommendation-engine.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/recommendation-engine.md): Recommendation Engine architecture & scoring weights.
- [docs/recommendation-ui.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/recommendation-ui.md): Recommendation UX workflow & preference model.
- [docs/phases/phase-01-walkthrough.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/phases/phase-01-walkthrough.md): Phase 1 Semantic Layer implementation.
- [docs/phases/phase-02-walkthrough.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/phases/phase-02-walkthrough.md): Phase 2 Dynamic Block Measurement Engine.
- [docs/phases/phase-02.5-walkthrough.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/phases/phase-02.5-walkthrough.md): Phase 2.5 Engine Structure Cleanup.
- [docs/phases/phase-03-walkthrough.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/phases/phase-03-walkthrough.md): Phase 3 Intelligent Balanced Layout Engine.
- [docs/phases/phase-04-walkthrough.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/phases/phase-04-walkthrough.md): Phase 4 Layout Strategy Architecture & Code Focus.
- [docs/phases/phase-05-walkthrough.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/phases/phase-05-walkthrough.md): Phase 5 Cheat Sheet & Concept Grid Strategies.
- [docs/phases/phase-06-walkthrough.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/phases/phase-06-walkthrough.md): Phase 6 Intelligent Recommendation & Scoring Engine.
- [docs/phases/phase-07-walkthrough.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/phases/phase-07-walkthrough.md): Phase 7 Recommendation UX & User Layout Preferences.

---

## 🛡 License

This project is open-source and available under the [MIT License](LICENSE).
