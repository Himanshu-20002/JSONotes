# JSONotes — Phase 9: Schema-Agnostic Content Discovery Engine Walkthrough

## Overview
In **Phase 9**, we built an offline, 100% deterministic **Schema-Agnostic Content Discovery Engine** in `lib/engine/semantic/discovery/`.

The Discovery Engine enables JSONotes to understand and format arbitrary JSON payloads without forcing users to follow specific field names or install external AI dependencies.

---

## 🏗 Discovery Directory Structure

```text
lib/engine/semantic/discovery/
├── aliases.ts          (Central semantic alias dictionary per block type)
├── classify-field.ts   (Deterministic scoring & confidence threshold evaluator)
├── code-detection.ts   (Multi-signal syntax detection JS/TS, Python, SQL, HTML, CSS)
├── constants.ts        (Bounded safety limits MAX_DEPTH=6, MAX_FIELDS=100)
├── discover-blocks.ts  (Orchestrator mapping discovered fields to SemanticBlock[])
├── field-signals.ts    (FieldSignals extraction from token, shape, and length)
├── flatten.ts          (Bounded recursive tree flattening & DiscoveredField model)
├── index.ts            (Discovery barrel export)
├── key-normalizer.ts   (camelCase, PascalCase, snake_case normalizer & humanizer)
└── types.ts            (DiscoveredField, FieldSignals, FieldClassification, CodeDetectionResult)
```

---

## 📁 Files Created & Modified

### 1. New Discovery Engine Files
- **[lib/engine/semantic/discovery/types.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/discovery/types.ts)**
- **[lib/engine/semantic/discovery/constants.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/discovery/constants.ts)**
- **[lib/engine/semantic/discovery/key-normalizer.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/discovery/key-normalizer.ts)**
- **[lib/engine/semantic/discovery/aliases.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/discovery/aliases.ts)**
- **[lib/engine/semantic/discovery/code-detection.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/discovery/code-detection.ts)**
- **[lib/engine/semantic/discovery/field-signals.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/discovery/field-signals.ts)**
- **[lib/engine/semantic/discovery/flatten.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/discovery/flatten.ts)**
- **[lib/engine/semantic/discovery/classify-field.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/discovery/classify-field.ts)**
- **[lib/engine/semantic/discovery/discover-blocks.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/discovery/discover-blocks.ts)**
- **[lib/engine/semantic/discovery/index.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/discovery/index.ts)**
- **[docs/content-discovery.md](file:///x:/projects/next.js/wallpaper-notes-editor/docs/content-discovery.md)**

### 2. Modified Core Files
- **[lib/engine/semantic/types.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/types.ts)**: Added `'generic'` to `SemanticBlockType` and extended block metadata.
- **[lib/engine/semantic/normalize.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/semantic/normalize.ts)**: Integrated `discoverSemanticBlocks` for remaining unknown fields.
- **[lib/engine/theme/tokens.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/theme/tokens.ts)**: Added `generic` semantic visual tokens across all 4 themes.
- **[lib/engine/compiler.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/compiler.ts)**: Mapped `generic` blocks to card renderers.
- **[lib/types.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/types.ts)**: Added `content?: any` to `CanvasElement`.

---

## 📊 Benchmark Test & Verification Results

1. **Existing Schema Fast-Path**: Known fields (`definition`, `concepts`, `warning`) process directly without duplication.
2. **Arbitrary Schema Discovery**: Un-annotated JSON (`explanation` $\rightarrow$ `definition`, `importantPoints` $\rightarrow$ `concept`, `exampleCode` $\rightarrow$ `code`, `thingsToAvoid` $\rightarrow$ `warning`) successfully classified with 100% confidence.
3. **Nested JSON**: Paths like `basics.description` and `examples.snippet` correctly discovered and flattened.
4. **Object Array Protection**: Object arrays rendered cleanly without `[object Object]` stringification artifacts.
5. **Code Syntax Detection**: Code without key names (`"example": "const add = (a, b) => a + b;"`) detected with $100\%$ confidence. Prose with braces (`"description": "Use {brackets}..."`) correctly protected from false positive code classification.
6. **TypeScript Check (`npx tsc --noEmit`)**: 0 errors.
7. **Next.js Production Build (`npm run build`)**: Compiled successfully.
