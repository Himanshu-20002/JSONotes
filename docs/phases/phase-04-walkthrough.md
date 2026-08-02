# JSONotes — Phase 4: Layout Strategy Architecture + Code Focus Layout Walkthrough

## Overview
In **Phase 4**, we established a reusable **Layout Strategy Architecture** in `lib/engine/layout/` and introduced **JSONotes' second layout strategy**: **Code Focus**.

Prior to Phase 4, `Balanced` was the sole layout. Now, all layout strategies implement a common contract (`LayoutStrategy`), register metadata with a central registry (`layoutRegistry`), and produce a standardized `LayoutResult` contract while preserving `Balanced` as the default strategy.

---

## 🏗 Modular Strategy Architecture

```
                                  +-----------------------+
                                  |   SemanticDocument    |
                                  +-----------------------+
                                              |
                                              v
                                  +-----------------------+
                                  |   getLayoutStrategy() |
                                  +-----------------------+
                                     /                 \
                                    /                   \
                                   v                     v
                        +--------------------+  +--------------------+
                        |  BalancedStrategy  |  | CodeFocusStrategy  |
                        +--------------------+  +--------------------+
                                   \                     /
                                    \                   /
                                     v                 v
                                  +-----------------------+
                                  |     LayoutResult      |
                                  +-----------------------+
                                              |
                                              v
                                  +-----------------------+
                                  |      compiler.ts      |
                                  +-----------------------+
                                              |
                                              v
                                  +-----------------------+
                                  |    CanvasElement[]    |
                                  +-----------------------+
```

---

## 📁 Files Created & Modified

### 1. New Layout Strategy Files
- **[lib/engine/layout/types.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/layout/types.ts)**: Declares `LayoutId`, `LayoutMetadata`, `LayoutContext`, and `LayoutStrategy` contract.
- **[lib/engine/layout/strategies/balanced.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/layout/strategies/balanced.ts)**: Refactored `balancedLayoutStrategy` satisfying the strategy contract.
- **[lib/engine/layout/strategies/code-focus.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/layout/strategies/code-focus.ts)**: Implemented `codeFocusLayoutStrategy` prioritising code blocks.
- **[lib/engine/layout/strategies/index.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/layout/strategies/index.ts)**: Barrel file exporting strategies.
- **[lib/engine/layout/registry.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/layout/registry.ts)**: Implements `getLayoutStrategy(id)` with fallback to `balanced` and `getAvailableLayouts()`.

### 2. Modified Core Files
- **[lib/engine/compiler.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/compiler.ts)**: Updated `compileTemplateStudyNotesV1(content, options)` to accept `{ layout?: LayoutId }` and delegate to the resolved strategy.

---

## 📐 Layout Strategy Contracts & Algorithms

### 1. `LayoutStrategy` Contract
```typescript
export type LayoutId = "balanced" | "code-focus"

export interface LayoutStrategy {
  id: LayoutId
  metadata: LayoutMetadata
  createLayout(document: SemanticDocument, context?: Partial<LayoutContext>): LayoutResult
}
```

### 2. Code Focus Algorithm Breakdown
- **Split Ratio**: $40\%$ Supporting Column (left, $x = 160\text{px}$) / $60\%$ Primary Code Region (right, $x = 1074\text{px}$).
- **Primary Code Identification**: Chooses code block with highest importance / max lines.
- **Side Column Stacking**: Places key definitions and concepts beside the code block.
- **Lower Region Grid**: Remaining supporting blocks continue fluidly in a lower multi-column grid below $\max(\text{codeRegionBottom}, \text{supportBottom})$.
- **No-Code Fallback**: If selected for content without code blocks, safely falls back to `createBalancedLayout()` without errors.

---

## 📊 Geometric Comparison: Balanced vs Code Focus

For a JavaScript Closures note (1 code block, 5 text/list blocks):

| Geometry Property | Balanced Strategy | Code Focus Strategy | Visual Impact |
| :--- | :--- | :--- | :--- |
| **Primary Code $X$** | $160\text{px}$ | **$1074\text{px}$** | Code placed prominently in dominant 60% region |
| **Primary Code Width** | $2240\text{px}$ (Span 2) | **$1326\text{px}$** | Width tailored specifically for code readability |
| **Supporting Blocks Position** | Stacked across 3 equal tracks | Stacked beside code in $40\%$ support column | Explanations placed directly next to code |
| **Collisions** | 0 | **0** | Verified clean non-overlapping bounding boxes |

---

## 🧪 Verification & Build Status
- **TypeScript Check (`npx tsc --noEmit`)**: 0 errors.
- **Next.js Production Build (`npm run build`)**: Compiled successfully in 4.2s.
- **Backward Compatibility**: Calling `compileTemplateStudyNotesV1(content)` without options preserves `balanced` as the default strategy.
