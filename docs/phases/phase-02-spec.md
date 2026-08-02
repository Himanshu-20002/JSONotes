# JSONotes — Phase 2: Dynamic Block Measurement Engine

Phase 1 is complete.

The current architecture is now:

```text
JSON / Markdown
      ↓
normalizeContent()
      ↓
SemanticDocument
      ↓
analyzeContent()
      ↓
compileTemplateStudyNotesV1()
      ↓
CanvasElement[]
      ↓
Existing Canvas
```

Phase 1 introduced:

```text
lib/engine/types.ts
lib/engine/normalize-content.ts
lib/engine/analyze-content.ts
lib/engine/index.ts
```

`compileTemplateStudyNotesV1()` now consumes semantic content.

TypeScript and production build currently pass.

---

# PHASE 2 OBJECTIVE

Remove fixed block HEIGHT assumptions from the semantic → canvas compilation process.

Currently blocks use hardcoded sizes such as:

```text
definition → 680 × 220
concepts   → 680 × 250
related    → 680 × 200

code       → 820 × 490
summary    → 820 × 220

interview  → 680 × 220
warning    → 680 × 220
memory     → 680 × 220

notes      → 820 × 220
```

This creates poor visual results because:

* short content receives too much empty space
* long content may overflow
* 4 lines of code and 30 lines of code receive the same height
* 2 bullet points and 10 bullet points receive the same height
* downstream Y positions assume fixed heights

Phase 2 will introduce a **deterministic measurement engine**.

---

# IMPORTANT SCOPE

Phase 2 changes:

```text
block measurement
+
vertical stacking based on measured height
+
overflow metadata
```

Phase 2 DOES NOT implement:

* multiple layout strategies
* layout recommendations
* user layout preferences
* automatic column selection
* masonry
* candidate scoring
* themes
* AI
* recommendation UI
* multiple canvas formats

Keep the existing:

```text
2560 × 1440 canvas

LEFT COLUMN
x = 160
w = 680

CENTER COLUMN
x = 870
w = 820

RIGHT COLUMN
x = 1720
w = 680
```

The three-column layout remains intact.

Only block heights and subsequent Y positions become dynamic.

---

# STEP 1 — INSPECT PHASE 1 IMPLEMENTATION

Before modifying code, inspect the actual Phase 1 implementation.

Specifically inspect:

```text
lib/engine/types.ts
lib/engine/normalize-content.ts
lib/engine/analyze-content.ts
lib/template-engine.ts
```

Also inspect the actual React components used to render:

```text
definition
bulletList
code
checklist
interviewTip
warning
memoryTrick
sticky
```

Understand their:

* padding
* title height
* font sizes
* line heights
* internal spacing
* code header
* list row spacing

Measurement constants should approximately reflect the actual renderer.

Do not blindly use constants from this prompt if the renderer differs.

---

# STEP 2 — CREATE MEASUREMENT MODULE

Create:

```text
lib/engine/measurement/
  types.ts
  constants.ts
  measure-text.ts
  measure-list.ts
  measure-code.ts
  measure-block.ts
  index.ts
```

Keep measurement logic independent of React.

Do NOT use DOM APIs in the core measurement engine.

The first implementation should be deterministic and pure.

---

# STEP 3 — DEFINE MEASUREMENT TYPES

Create approximately:

```ts
export interface MeasurementConstraints {
  availableWidth: number

  density?: "spacious" | "balanced" | "compact"
}

export interface BlockMeasurement {
  width: number
  height: number

  contentHeight: number

  estimatedLines?: number

  overflowRisk: boolean

  warnings: MeasurementWarning[]
}

export type MeasurementWarning =
  | "TEXT_TOO_LONG"
  | "CODE_TOO_LONG"
  | "TOO_MANY_ITEMS"
  | "BLOCK_TOO_TALL"
```

Adapt to project conventions where appropriate.

Do not put canvas coordinates into measurement results.

Measurement answers:

> How much space does this block need?

Layout answers:

> Where should this block go?

Keep those responsibilities separate.

---

# STEP 4 — CENTRALIZE TYPOGRAPHY / SPACING CONSTANTS

Create measurement constants representing the current renderer.

For example conceptually:

```ts
export const MEASUREMENT = {
  card: {
    paddingX: ...,
    paddingY: ...,
    titleGap: ...
  },

  body: {
    fontSize: ...,
    lineHeight: ...
  },

  title: {
    fontSize: ...,
    lineHeight: ...
  },

  code: {
    fontSize: ...,
    lineHeight: ...,
    headerHeight: ...
  },

  list: {
    itemGap: ...,
    bulletWidth: ...
  }
}
```

IMPORTANT:

Inspect actual component styles first.

Try to keep measurement assumptions close to actual rendering.

Avoid scattering magic numbers throughout measurement functions.

---

# STEP 5 — IMPLEMENT TEXT MEASUREMENT

Create:

```ts
measureText()
```

It should estimate wrapped text height from:

* text
* available width
* font size
* line height
* horizontal padding

Do not simply use:

```ts
text.length / 50
```

Use an approximate character-width model.

Conceptually:

```text
usableWidth =
availableWidth - horizontalPadding

averageCharacterWidth ≈
fontSize × characterWidthFactor

charactersPerLine =
usableWidth / averageCharacterWidth

estimatedLines =
wrapped character estimate
```

Improve the estimate by accounting for explicit:

```text
\n
```

line breaks.

Each explicit line should be measured independently.

Return:

```ts
{
  estimatedLines,
  height
}
```

Keep the implementation deterministic.

---

# STEP 6 — ACCOUNT FOR LONG WORDS

Text such as:

```text
veryLongJavaScriptIdentifierWithoutSpaces
```

or URLs should not completely break estimates.

Add reasonable handling for tokens longer than the estimated characters-per-line capacity.

Do not need browser-perfect typography.

We need reliable layout estimates.

---

# STEP 7 — IMPLEMENT LIST MEASUREMENT

Create:

```ts
measureList()
```

Input:

```text
items[]
availableWidth
typography
spacing
```

Each item may wrap across multiple lines.

Do NOT calculate:

```text
itemCount × fixedRowHeight
```

Instead:

```text
measure each item
+
item gaps
+
padding
+
title
```

Return:

```text
contentHeight
estimatedLines
height
overflowRisk
```

This will be used for:

```text
concept
related
summary
```

where appropriate.

---

# STEP 8 — IMPLEMENT CODE MEASUREMENT

Create:

```ts
measureCode()
```

Use:

* number of explicit code lines
* code line height
* code header height
* padding

Basic vertical measurement:

```text
header
+
code lines × codeLineHeight
+
vertical padding
```

But also consider very long code lines.

If the code component wraps long lines, estimate wrapping.

If the existing renderer horizontally scrolls instead of wrapping, do NOT add wrapped-line height.

Match existing renderer behavior.

This is why renderer inspection is required.

---

# STEP 9 — IMPLEMENT GENERIC measureBlock()

Create:

```ts
measureBlock(
  block: SemanticBlock,
  constraints: MeasurementConstraints
): BlockMeasurement
```

Route according to semantic type.

For example:

```text
definition
interview
warning
memory
note
    ↓
text measurement

concept
related
summary
    ↓
list measurement

code
    ↓
code measurement
```

Do not let the template compiler contain its own duplicate sizing logic.

`measureBlock()` should become the single source of truth for V2-ready block sizing.

---

# STEP 10 — INTRODUCE MINIMUM HEIGHTS

Dynamic sizing should NOT mean tiny unusable cards.

Every block type should have a sensible minimum height.

For example conceptually:

```text
definition:
minHeight = ~140–170

concept:
minHeight = ~150–180

code:
minHeight = ~180–220

summary:
minHeight = ~150

warning/tip:
minHeight = ~140

sticky:
minHeight = ~140
```

DO NOT blindly use these numbers.

Inspect the current component design and choose appropriate values.

Goal:

Short definition:

```text
Before:
220px

After:
maybe 150–180px
```

instead of:

```text
60px
```

---

# STEP 11 — INTRODUCE SOFT MAXIMUM HEIGHTS

Some content should not create a single 1500px card.

Define soft maximums.

Example concept:

```text
normal text block:
soft max ≈ 450–550

list:
soft max ≈ 500–600

code:
soft max ≈ 650–800
```

Again, tune to the actual 1440px canvas.

IMPORTANT:

A soft maximum must NOT silently truncate content.

If required height exceeds the recommended maximum:

```text
overflowRisk = true
```

and add a warning.

Keep the full content.

Later phases will solve this using:

* compact layouts
* different layouts
* larger formats
* multi-page output

---

# STEP 12 — TITLE AND SUBTITLE MEASUREMENT

The document title and subtitle currently use fixed heights.

Phase 2 may add basic measurement for them if necessary.

However, do NOT overcomplicate this.

At minimum:

* normal title should preserve current appearance
* long title should be allowed to require additional height
* subtitle should move downward accordingly
* body start Y should account for the actual header region

Conceptually:

```text
titleY
+
measuredTitleHeight
+
titleSubtitleGap
+
measuredSubtitleHeight
+
headerBodyGap
=
contentStartY
```

If implementing this would cause excessive renderer changes, keep title/subtitle fixed for Phase 2 and clearly document it as a Phase 3 follow-up.

Block measurement is higher priority.

---

# STEP 13 — MODIFY EXISTING TEMPLATE COMPILER

Update:

```text
lib/template-engine.ts
```

Current behavior approximately:

```ts
create block height = 220

leftY += 245
```

Change it conceptually to:

```ts
const measurement =
  measureBlock(block, {
    availableWidth: LEFT_WIDTH
  })

const height =
  measurement.height

create element with:
h = height

leftY +=
  height + GAP
```

Do this for every semantic block.

---

# STEP 14 — LEFT COLUMN DYNAMIC STACKING

Keep:

```text
x = 160
w = 680
```

But change:

```text
definition
concept
related
```

to use measured heights.

Example:

```text
leftY = 280

definition height = 158

definition y = 280

leftY =
280 + 158 + 25
= 463

concept height = 214

concept y = 463

leftY =
463 + 214 + 25
= 702
```

No hardcoded:

```text
+245
+275
+225
```

should remain for these blocks.

---

# STEP 15 — CENTER COLUMN DYNAMIC STACKING

Keep:

```text
x = 870
w = 820
```

Use measured heights for:

```text
code
summary
```

Example:

A four-line code block should NOT automatically require 490px.

If the renderer can comfortably display it at ~220–280px, use the measured value.

A 25-line code sample should receive more space.

Then:

```text
centerY += measuredHeight + GAP
```

---

# STEP 16 — RIGHT COLUMN DYNAMIC STACKING

Keep:

```text
x = 1720
w = 680
```

Use dynamic heights for:

```text
interview
warning
memory
```

Short tips should be compact.

Long warnings should receive additional height.

---

# STEP 17 — DYNAMIC NOTES POSITION

Current:

```ts
bottomY =
Math.max(
  leftY,
  centerY,
  rightY,
  1000
)
```

Revisit this logic.

The note/sticky should be positioned based on actual column bottoms.

Do not automatically force it to Y=1000 unless the existing design requires that spacing.

Prefer something conceptually like:

```text
bottomY =
max(leftColumnBottom,
    centerColumnBottom,
    rightColumnBottom)
+ appropriateGap
```

BUT:

Because this is still the fixed 3-column layout, avoid placing the note outside the canvas unnecessarily.

If the existing center-bottom design should be preserved, keep its X/width but calculate Y from actual content.

---

# STEP 18 — CANVAS OVERFLOW DETECTION

After generating elements, detect whether:

```text
element.y + element.h >
canvasHeight - bottomPadding
```

For current canvas:

```text
canvasHeight = 1440
```

Do NOT automatically shrink everything.

Record warnings.

Create something reusable such as:

```ts
detectCanvasOverflow(elements, canvas)
```

Return which elements exceed bounds.

This utility will be reused heavily in Phase 3 and Phase 7.

---

# STEP 19 — TEXT OVERFLOW RISK

Measurement estimates are not browser-perfect.

Add safety padding.

For example, after estimated text height:

```text
estimatedHeight
+
small safety margin
```

Do not add huge arbitrary margins.

Goal:

Slightly overestimate rather than clip text.

---

# STEP 20 — PRESERVE CURRENT COLORS AND TYPES

Phase 2 must NOT change:

```text
definition → blue
concept → purple
related → cyan
code → slate
summary → green
interview → yellow
warning → red
memory → pink
note → yellow
```

And do not change CanvasElement types.

Theme separation comes later.

---

# STEP 21 — PRESERVE USER EDITING

After generation, users must still be able to:

* drag elements
* resize elements
* edit content
* export

Dynamic measurement only controls INITIAL generation dimensions.

Do NOT continuously force elements back to measured dimensions after the user manually edits/resizes them.

This is critical.

Measurement happens during generation/regeneration.

Manual editor state remains user-controlled afterward.

---

# STEP 22 — DO NOT ADD AUTO-RESIZE ON EVERY KEYSTROKE

Do NOT implement:

```text
user types
↓
measure
↓
resize
↓
layout shifts
```

yet.

That could create terrible editing UX.

Phase 2 measurement applies to generated notes.

Interactive auto-resizing can be considered separately later.

---

# STEP 23 — TEST FIXTURES

Reuse Phase 1 fixtures and add measurement-specific cases.

Test at least:

### A. Very short definition

```json
{
  "title": "Closure",
  "definition": "A function that remembers its scope."
}
```

Expected:

Definition should be substantially smaller than the old fixed 220px if renderer constraints permit.

---

### B. Long definition

Use a multi-paragraph definition.

Expected:

Block height increases.

No silent clipping.

---

### C. Short code

```json
{
  "title": "Arrow Function",
  "code": {
    "language": "javascript",
    "code": "const add = (a, b) => a + b;"
  }
}
```

Expected:

Code block should be significantly shorter than old 490px.

---

### D. Long code

20–30 lines.

Expected:

Code block height increases.

If too large:

```text
overflowRisk = true
```

---

### E. Two summary items

Expected:

Compact summary card.

---

### F. Ten summary items

Expected:

Larger summary card.

---

### G. Mixed content

Use:

```text
definition
concepts
code
summary
warning
memory
```

Verify dynamic Y stacking.

---

### H. Extreme content

Create content intentionally too large for 2560×1440.

Expected:

No crash.

No NaN.

No negative dimensions.

Warnings returned.

Canvas overflow detected.

---

# STEP 24 — MEASUREMENT DEBUG INFORMATION

In development only, provide an easy way to inspect:

```text
block type
available width
measured height
content height
estimated lines
overflow risk
warnings
```

Example:

```text
definition
width: 680
height: 168
lines: 3
overflow: false
```

Code:

```text
code
width: 820
height: 286
codeLines: 8
overflow: false
```

Do not display this in production UI.

---

# STEP 25 — COMPATIBILITY REQUIREMENTS

Phase 2 must remain compatible with Phase 1.

The pipeline should become:

```text
JSON / Markdown
      ↓
normalizeContent()
      ↓
SemanticDocument
      ↓
analyzeContent()
      ↓
measureBlock()
      ↓
Existing 3-column layout
using dynamic heights
      ↓
CanvasElement[]
      ↓
Existing Zustand
      ↓
Existing Canvas
```

The following must continue working:

* JSON import
* Markdown import
* SemanticDocument normalization
* analyzeContent()
* custom `elements[]`
* Zustand
* existing CanvasElement renderer
* dragging
* resizing
* editing
* SVG/PNG export

---

# STEP 26 — PERFORMANCE

Measurement functions should be pure and inexpensive.

Avoid:

* hidden React rendering
* creating DOM elements
* canvas DOM measurement
* repeated measurement loops
* layout calculations during every React render

This version uses deterministic estimation.

Browser-accurate measurement can be evaluated later only if necessary.

---

# STEP 27 — VERIFY

Run existing:

```text
TypeScript
lint
tests
production build
```

Also verify measurement fixtures.

Do not claim success unless verified.

---

# DEFINITION OF DONE

Phase 2 is complete when:

1. SemanticDocument from Phase 1 remains unchanged/compatible.
2. `measureBlock()` exists.
3. Text blocks dynamically calculate height.
4. Lists dynamically calculate height.
5. Code dynamically calculates height.
6. Short content creates shorter cards.
7. Long content creates taller cards.
8. Y stacking uses measured heights.
9. Hardcoded block-height increments are removed from the Phase 2 generation path.
10. Canvas overflow can be detected.
11. Oversized blocks produce warnings instead of silently losing content.
12. Existing editor still receives valid CanvasElement[].
13. Manual drag/resize remains functional.
14. Existing imports remain functional.
15. Existing exports remain functional.
16. TypeScript passes.
17. Production build passes.

---

# DO NOT START PHASE 3

Do NOT implement:

* dynamic column assignment
* masonry
* layout recommendation
* layout scoring
* user preferences
* multiple layouts
* themes

Phase 3 will replace the fixed field-to-column assignment with the first genuinely dynamic layout algorithm.

When Phase 2 is complete, STOP.

Provide:

1. Files created
2. Files modified
3. Measurement formulas used
4. Minimum/maximum heights chosen
5. Before/after measurements for test fixtures
6. Overflow detection behavior
7. Compatibility status
8. TypeScript result
9. Production build result
10. Any limitations discovered
