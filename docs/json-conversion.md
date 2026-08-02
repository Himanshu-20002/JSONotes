# JSON to Visual Notes Conversion Engine Specifications

## Overview
**JSONotes** allows users to import structured JSON (or Markdown) content and automatically converts it into a visual study wallpaper or cheat sheet layout. 

This document explains the step-by-step conversion architecture, schema field mappings, spatial coordinate calculations, type coercions, and layout rules enforced by the system.

---

## 🔄 Pipeline Overview

```
 +------------------------+
 |   Input JSON / MD      |  (User inputs raw text or imports file)
 +------------------------+
             |
             v
 +------------------------+
 |  Import Modal Parser   |  (components/editor/import-modal.tsx)
 |  - Clean trailing commas|  - Convert Markdown headings/lists to schema if MD
 +------------------------+
             |
             v
 +------------------------+
 |    Template Engine     |  (lib/template-engine.ts -> compileTemplateStudyNotesV1)
 |  - Type normalization   |  - Map fields to visual block types & color themes
 |  - Column calculation   |  - Enforce spatial offset rules (x, y, w, h)
 +------------------------+
             |
             v
 +------------------------+
 |    Zustand Store       |  (lib/store.ts)
 |  - State update        |  - Render CanvasElement[] inside viewport
 +------------------------+
```

---

## 🔑 Key Schema Field Mappings & Rule Set

The template compiler (`compileTemplateStudyNotesV1`) inspects the input schema object (`StudyNotesContent`) and transforms individual key-value fields into specific `CanvasElement` visual blocks:

| Input JSON Field | Visual Block Type (`element.type`) | Color Theme | Default Position (X, Y) | Dimensions (W × H) | Rules & Coercions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `title` | `title` | `blue` | (160, 100) | 1200 × 90 | Main H1 header. Font size default: 64px. |
| `subtitle` | `subtitle` | `slate` | (160, 200) | 1200 × 50 | H2 subheader. Font size default: 28px. |
| `definition` | `definition` | `blue` | Left Col (160, `leftY`) | 680 × 220 | Accepts string or object `{ title, text }`. Default title: `"Definition"`. |
| `concepts` | `definition` | `purple` | Left Col (160, `leftY`) | 680 × 250 | Accepts `string[]` or object array. Joined into bullet points (`• `). |
| `related` | `bulletList` | `cyan` | Left Col (160, `leftY`) | 680 × 200 | Array of strings converted to bullet list items. |
| `code` | `code` | `slate` | Center Col (870, `centerY`) | 820 × 490 | Accepts string or object `{ language, code }`. Language tags default to `"javascript"`. |
| `summary` | `checklist` | `green` | Center Col (870, `centerY`) | 820 × 220 | Array of strings converted into interactive checklist items (`checked: false`). |
| `interview` | `interviewTip` | `yellow` | Right Col (1720, `rightY`) | 680 × 220 | Accepts string or object `{ title, text }`. Default title: `"Interview Tip"`. |
| `warning` | `warning` | `red` | Right Col (1720, `rightY`) | 680 × 220 | Accepts string or object `{ title, text }`. Default title: `"Common Pitfall"`. |
| `memory` | `memoryTrick` | `pink` | Right Col (1720, `rightY`) | 680 × 220 | Accepts string or object `{ title, text }`. Default title: `"Memory Trick"`. |
| `notes` | `sticky` | `yellow` | Center Bottom (870, `bottomY`) | 820 × 220 | Placed dynamically below the lowest column element. |

---

## 📐 Layout Engine Rules & Coordinate Calculations

Canvas coordinates operate on a **2560 × 1440 resolution base grid**. The layout engine divides the canvas into 3 main vertical columns with dynamic Y-trackers (`leftY`, `centerY`, `rightY`):

### 1. Left Column Track
- **Origin X**: `160px` | **Width**: `680px`
- **Starting Y (`leftY`)**: `280px`
- **Stacking Logic**:
  1. `definition` block added -> `leftY += 245px` (220px height + 25px gap)
  2. `concepts` block added -> `leftY += 275px` (250px height + 25px gap)
  3. `related` block added -> `leftY += 225px` (200px height + 25px gap)

### 2. Center Column Track
- **Origin X**: `870px` | **Width**: `820px`
- **Starting Y (`centerY`)**: `280px`
- **Stacking Logic**:
  1. `code` block added -> `centerY += 515px` (490px height + 25px gap)
  2. `summary` block added -> `centerY += 245px` (220px height + 25px gap)

### 3. Right Column Track
- **Origin X**: `1720px` | **Width**: `680px`
- **Starting Y (`rightY`)**: `280px`
- **Stacking Logic**:
  1. `interview` tip added -> `rightY += 245px` (220px height + 25px gap)
  2. `warning` block added -> `rightY += 245px` (220px height + 25px gap)
  3. `memory` trick added -> `rightY += 245px` (220px height + 25px gap)

### 4. Dynamic Footer Calculation
- If `notes` field exists, `bottomY` is calculated as `Math.max(leftY, centerY, rightY, 1000)`. The sticky note is placed at `(870, bottomY)` to prevent overlapping with any existing column blocks.

---

## 🛠 Type Coercion & Normalization Rules

To ensure maximum tolerance when users import hand-written JSON or Markdown:

1. **Flexible Polymorphism**:
   - Fields such as `definition`, `interview`, `warning`, `memory` accept both **plain strings** (`"Text value"`) and **structured objects** (`{ title: "Custom Title", text: "Text value" }`).
2. **List Parsing**:
   - Array elements can be plain strings or objects containing `.text`.
   - Items are automatically mapped into list elements with unique IDs generated via `uid()`.
3. **Fallback Defaults**:
   - If an optional field is missing from the JSON payload, that slot is omitted from the canvas without breaking the layout.
   - If `elements` array is explicitly supplied in custom JSON, the custom element array overrides standard template compilation.

---

## 📄 Example Input JSON vs Output Canvas Elements

### Input JSON
```json
{
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
  ]
}
```

### Generated Canvas Element Output (Simplified)
```json
[
  { "id": "title_1", "type": "title", "x": 160, "y": 100, "w": 1200, "h": 90, "text": "React UseEffect Hook", "color": "blue" },
  { "id": "subtitle_2", "type": "subtitle", "x": 160, "y": 200, "w": 1200, "h": 50, "text": "Synchronization side-effect primitive", "color": "slate" },
  { "id": "def_3", "type": "definition", "x": 160, "y": 280, "w": 680, "h": 220, "title": "Definition", "text": "A React Hook...", "color": "blue" },
  { "id": "concepts_4", "type": "definition", "x": 160, "y": 525, "w": 680, "h": 250, "title": "Key Concepts", "text": "• Runs after DOM paint...", "color": "purple" },
  { "id": "code_5", "type": "code", "x": 870, "y": 280, "w": 820, "h": 490, "language": "typescript", "code": "useEffect(...)", "color": "slate" },
  { "id": "summary_6", "type": "checklist", "x": 870, "y": 795, "w": 820, "h": 220, "title": "Quick Revision Summary", "color": "green" }
]
```
