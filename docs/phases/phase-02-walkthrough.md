# JSONotes — Phase 2: Dynamic Block Measurement Engine Walkthrough

## Overview
In **Phase 2**, we implemented a pure, deterministic **Dynamic Block Measurement Engine** in `lib/engine/measurement/`. 

Prior to Phase 2, visual blocks used hardcoded card heights (e.g. Code = 490px, Definition = 220px). Now, block heights are computed dynamically based on character counts, text wrapping estimates, code line numbers, list item counts, padding, and font metrics. Dynamic Y-stacking positions each element cleanly according to its actual measured height.

---

## 🏗 Modular Architecture

```
                                +-------------------------------------------+
                                |              SemanticBlock                |
                                +-------------------------------------------+
                                                      |
                                                      v
                                +-------------------------------------------+
                                |              measureBlock()               |
                                |     (lib/engine/measurement/index.ts)     |
                                +-------------------------------------------+
                                     /                |                \
                                    /                 |                 \
                                   v                  v                  v
                       +------------------+  +-----------------+  +------------------+
                       |   measureText()  |  |  measureList()  |  |   measureCode()  |
                       +------------------+  +-----------------+  +------------------+
                                   \                  |                  /
                                    \                 |                 /
                                     v                v                v
                                +-------------------------------------------+
                                |             BlockMeasurement              |
                                |  (height, contentHeight, lines, warnings) |
                                +-------------------------------------------+
                                                      |
                                                      v
                                +-------------------------------------------+
                                |       compileTemplateStudyNotesV1()       |
                                |  (Applies height & stacks Y dynamically)  |
                                +-------------------------------------------+
```

---

## 📁 Files Created & Modified

### 1. New Measurement Engine Files
- **[lib/engine/measurement/types.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/measurement/types.ts)**: Declares `MeasurementConstraints`, `BlockMeasurement`, `MeasurementWarning`, and `CanvasOverflowResult`.
- **[lib/engine/measurement/constants.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/measurement/constants.ts)**: Centralizes typography font sizes, line heights, character width factors, card padding, minimum heights, and soft max thresholds matching the React render components in [block-renderer.tsx](file:///x:/projects/next.js/wallpaper-notes-editor/components/editor/block-renderer.tsx).
- **[lib/engine/measurement/measure-text.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/measurement/measure-text.ts)**: Character-width wrapping model accounting for word boundaries, explicit `\n` line breaks, and long continuous words.
- **[lib/engine/measurement/measure-list.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/measurement/measure-list.ts)**: Dynamic list height estimator for concept cards, bullet lists, and checklists based on item wrapping and gap spacing.
- **[lib/engine/measurement/measure-code.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/measurement/measure-code.ts)**: Computes code block dimensions from explicit code line count, header bar, line numbers, and padding.
- **[lib/engine/measurement/measure-block.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/measurement/measure-block.ts)**: Router function sizing all semantic blocks with minimum height enforcement and soft-max overflow warnings.
- **[lib/engine/measurement/index.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/measurement/index.ts)**: Barrel file including `detectCanvasOverflow()` utility for canvas boundary checking.

### 2. Modified Repository Files
- **[lib/engine/index.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/engine/index.ts)**: Exported measurement module from the engine barrel.
- **[lib/template-engine.ts](file:///x:/projects/next.js/wallpaper-notes-editor/lib/template-engine.ts)**: Refactored `compileTemplateStudyNotesV1` to use `measureBlock()` height output and dynamic `Y += measuredHeight + GAP_Y` stacking.

---

## 📏 Measurement Formulas & Constraints

### 1. Character-Width Text Model
$$\text{usableWidth} = \max(50, \text{availableWidth} - \text{paddingX} - \text{borderWidth})$$
$$\text{charsPerLine} = \max(10, \lfloor \text{usableWidth} / (\text{fontSize} \times \text{charWidthFactor}) \rfloor)$$
$$\text{contentHeight} = \text{totalWrappedLines} \times (\text{fontSize} \times \text{lineHeight})$$

### 2. Minimum & Soft Maximum Bounds
| Block Type | Minimum Height | Soft Max Height |
| :--- | :--- | :--- |
| `definition` | 150px | 500px |
| `concept` | 160px | 550px |
| `related` | 140px | 550px |
| `code` | 160px | 750px |
| `summary` | 150px | 550px |
| `interview` / `warning` / `memory` | 140px | 500px |
| `note` (Sticky) | 140px | 500px |

---

## 📊 Before / After Measurement Benchmarks

| Fixture Test Case | Before Phase 2 (Fixed Size) | Phase 2 Dynamic Output | Impact |
| :--- | :--- | :--- | :--- |
| **Short Definition** (`"Closure"`) | 220px | **150px** (Enforced Min) | **-70px** empty space eliminated |
| **Short Code** (1-line arrow function) | 490px | **160px** | **-330px** giant empty code box shrunk |
| **Long Code** (25-line algorithm) | 490px (Overflowed) | **721px** | Code receives exact space required |
| **Extreme Content Overflow** | Silent clipping | Detected `maxBottom: 1767px` (Canvas 1440px) | `hasOverflow: true` warning generated |

---

## 🧪 Verification & Build Status
- **TypeScript Check (`npx tsc --noEmit`)**: 0 errors.
- **Next.js Production Build (`npm run build`)**: Compiled successfully in 2.1s.
- **User Editing Compatibility**: Dragging, resizing, text editing, and image exports function losslessly; manual edits remain user-controlled without forced re-measurement shifts.
