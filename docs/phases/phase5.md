# JSONotes — Phase 5: Cheat Sheet + Concept Grid Layout Strategies

Phases 1–4 are complete.

Current layout architecture:

```text
lib/engine/layout/
├── strategies/
│   ├── balanced.ts
│   ├── code-focus.ts
│   └── index.ts
├── registry.ts
├── types.ts
├── constants.ts
├── metrics.ts
├── validation.ts
└── index.ts
```

Current implemented layouts:

```text
balanced
code-focus
```

All strategies implement the shared:

```ts
LayoutStrategy
```

contract and return:

```ts
LayoutResult
```

Phase 5 adds two more genuinely different strategies:

```text
cheat-sheet
concept-grid
```

Do NOT implement recommendation/scoring/UI yet.

---

# PHASE 5 OBJECTIVES

Implement:

1. `Cheat Sheet`
2. `Concept Grid`
3. Extend `LayoutId`
4. Register both strategies
5. Add appropriate metadata
6. Preserve the shared strategy contract
7. Preserve Balanced and Code Focus
8. Verify all four strategies produce genuinely different compositions

After Phase 5:

```text
LayoutStrategy
      │
      ├── Balanced
      ├── Code Focus
      ├── Cheat Sheet
      └── Concept Grid
```

---

# 1. INSPECT CURRENT IMPLEMENTATION

Before modifying code inspect:

```text
lib/engine/layout/types.ts
lib/engine/layout/registry.ts
lib/engine/layout/strategies/balanced.ts
lib/engine/layout/strategies/code-focus.ts
lib/engine/layout/metrics.ts
lib/engine/layout/validation.ts
lib/engine/measurement/
lib/engine/compiler.ts
```

Preserve the working strategy architecture.

Do not redesign the common contract unless a real limitation is discovered.

---

# 2. EXTEND LayoutId

Change:

```ts
export type LayoutId =
  | "balanced"
  | "code-focus"
```

to:

```ts
export type LayoutId =
  | "balanced"
  | "code-focus"
  | "cheat-sheet"
  | "concept-grid"
```

Only these four should exist as implemented layouts.

---

# 3. CREATE STRATEGY FILES

Create:

```text
lib/engine/layout/strategies/
├── balanced.ts
├── code-focus.ts
├── cheat-sheet.ts
├── concept-grid.ts
└── index.ts
```

Do not create separate measurement engines.

All strategies must reuse:

```text
measureBlock()
```

---

# PART A — CHEAT SHEET

# 4. CHEAT SHEET PURPOSE

Cheat Sheet is optimized for:

```text
high information density
quick scanning
revision
interview preparation
many short facts
lists
warnings
memory tricks
small code examples
```

It should visually feel different from Balanced.

Conceptually:

```text
┌──────────────────────────────────────────────┐
│ TITLE                       compact subtitle │
├──────────────┬──────────────┬────────────────┤
│ Definition   │ Concepts     │ Summary        │
├──────────────┼──────────────┼────────────────┤
│ Related      │ Warning      │ Interview Tip  │
├──────────────┼──────────────┼────────────────┤
│ Code         │ Memory       │ Notes          │
└──────────────┴──────────────┴────────────────┘
```

This is conceptual, not a mandatory fixed grid.

The important characteristic is:

> compact, dense, scan-friendly composition.

---

# 5. CHEAT SHEET COLUMN COUNT

Cheat Sheet should generally prefer more columns than Balanced.

Use deterministic rules approximately like:

```text
1–3 blocks
→ 2 columns

4+ blocks
→ 3 columns
```

For extremely large/tall content, allow fallback to 2 columns.

Maximum remains 3 columns for now.

Do not implement 4+ columns.

---

# 6. CHEAT SHEET WIDTH BEHAVIOR

Cheat Sheet should generally prefer:

```text
span 1
```

blocks.

Avoid excessive wide cards.

Span 2 should be reserved for:

```text
very large code
very large summary
very long definition
```

and only when readability genuinely requires it.

The visual goal is more modular than Balanced.

---

# 7. CHEAT SHEET COMPACT DENSITY

Phase 2 introduced measurement constraints with optional density support.

Inspect whether:

```ts
density:
  "spacious"
  | "balanced"
  | "compact"
```

is actually supported by measurement.

If it already exists and works, use:

```text
compact
```

for Cheat Sheet.

If it exists only as a type but is not implemented, add the MINIMUM necessary support in the measurement constants/functions.

Compact mode may reduce:

```text
card vertical padding
item gaps
internal title gap
```

slightly.

DO NOT dramatically reduce:

```text
font size
line height
```

to force content into the canvas.

Readability remains mandatory.

Do not alter Balanced/Code Focus measurement behavior.

---

# 8. CHEAT SHEET ORDERING

Prioritize scan-friendly information.

Suggested semantic priority:

```text
definition
concept
summary
code
warning
interview
memory
related
note
```

But combine this with:

```text
importance
original order
content size
```

Do not make the ordering entirely rigid.

---

# 9. CHEAT SHEET PLACEMENT

Use a compact shortest-column/grid placement strategy.

Track column bottoms.

Place mostly span-1 cards into the shortest valid column.

The result should resemble a dense dashboard/cheat sheet rather than a document.

---

# 10. CHEAT SHEET FEATURE HANDLING

Do not let one block dominate the entire layout unless necessary.

Compared with Balanced:

```text
Balanced
→ allows prominent feature cards

Cheat Sheet
→ prefers modular compact cards
```

For example:

A 5-line code block should probably remain:

```text
span 1
```

A 35-line code block may need:

```text
span 2
```

---

# 11. CHEAT SHEET OVERFLOW

If content does not fit:

```text
hasOverflow = true
```

Do not:

```text
clip
hide
shrink to unreadable size
```

The future recommendation engine should learn that Cheat Sheet is a poor choice for certain extremely verbose documents.

---

# PART B — CONCEPT GRID

# 12. CONCEPT GRID PURPOSE

Concept Grid is optimized for:

```text
definitions
concepts
relationships
topic summaries
memory cards
learning/revision
low-to-medium code content
```

It should feel like a collection of structured knowledge cards.

Conceptually:

```text
┌──────────────────────────────────────────────┐
│ TITLE                                        │
│ subtitle                                     │
├─────────────────────┬────────────────────────┤
│ DEFINITION          │ KEY CONCEPTS           │
│                     │                        │
├─────────────────────┼────────────────────────┤
│ SUMMARY             │ MEMORY                 │
├─────────────────────┼────────────────────────┤
│ WARNING             │ RELATED                │
└─────────────────────┴────────────────────────┘
```

Again, this is conceptual.

Do not hardcode specific semantic types into permanent coordinates.

---

# 13. CONCEPT GRID COLUMN COUNT

Concept Grid should generally use:

```text
2 columns
```

for medium/large documents.

For very small content:

```text
1 column
```

may be appropriate.

For many small conceptual blocks:

```text
3 columns
```

may be allowed.

However, it should prefer larger readable cards compared with Cheat Sheet.

---

# 14. CONCEPT GRID CARD CONSISTENCY

Unlike masonry-heavy Balanced, Concept Grid should attempt stronger row/card alignment.

This does NOT mean forcing every card in the entire canvas to identical height.

Instead, create local rows.

Example:

```text
row 1
card A | card B

row 2
card C | card D
```

For each row:

```text
rowHeight =
max(measuredHeightA, measuredHeightB)
```

Cards may either:

A. keep natural height but advance next row by `rowHeight`

OR

B. visually use row height if the renderer supports safe card expansion.

Prefer A initially to avoid unnecessary empty card space.

The important part is that the NEXT row starts below the tallest card in the current row.

---

# 15. CONCEPT GRID PAIRING

Try to place semantically complementary content near each other.

Examples:

```text
definition ↔ concepts

summary ↔ memory

warning ↔ interview

related ↔ notes
```

These are preferences, not mandatory mappings.

Use semantic type + importance + original order.

Do not create fragile hardcoded assumptions requiring every pair to exist.

---

# 16. CONCEPT GRID CODE HANDLING

Concept Grid is not primarily code-oriented.

Short code:

```text
can occupy normal card
```

Medium code:

```text
may span 2 columns
```

Large code:

```text
may become full row
```

Always re-measure at actual width.

Do not make code unreadably narrow just to preserve grid structure.

---

# 17. CONCEPT GRID ROW PLANNER

Implement a deterministic row-based placement algorithm.

Conceptually:

```text
remaining blocks
      ↓
choose next 1–2 compatible blocks
      ↓
measure at card width
      ↓
place in row
      ↓
rowHeight = max(block heights)
      ↓
nextY += rowHeight + gap
```

For 3-column mode:

```text
choose up to 3 cards
```

Keep implementation understandable.

Do not create a complex bin-packing solver.

---

# 18. CONCEPT GRID WIDE BLOCKS

If a block requires span 2/full row:

```text
finish current row
      ↓
place wide block
      ↓
advance Y
      ↓
start new row
```

Never insert a wide block halfway through an occupied row in a way that risks overlap.

---

# 19. CONCEPT GRID VISUAL HIERARCHY

High-importance conceptual content should appear earlier.

Prefer:

```text
definition
concept
summary
```

near the top.

Supporting:

```text
memory
warning
interview
related
note
```

can follow.

Again, use importance and original order as additional signals.

---

# 20. SHARED VALIDATION

Both new strategies MUST reuse:

```text
detectCollisions()
validateBounds()
```

Do not create strategy-specific collision detection.

Normal fixtures should produce:

```text
collisionCount = 0
```

---

# 21. SHARED METRICS

Both strategies must return the standard:

```text
usedHeight
usedAreaRatio
columnImbalance
overflowCount
collisionCount
```

If `columnImbalance` is inappropriate for Concept Grid rows, document how it is calculated.

If needed, make metrics slightly more strategy-neutral, but preserve compatibility with existing layouts.

---

# 22. STRATEGY METADATA

Add metadata for Cheat Sheet.

Approximately:

```ts
{
  id: "cheat-sheet",

  name: "Cheat Sheet",

  description:
    "A compact information-dense layout optimized for quick scanning and revision.",

  bestFor: [
    "revision notes",
    "interview preparation",
    "quick reference",
    "many short facts"
  ],

  supportsCode: true,
  supportsDenseContent: true
}
```

Add Concept Grid:

```ts
{
  id: "concept-grid",

  name: "Concept Grid",

  description:
    "A structured card grid designed for concepts, definitions and related knowledge.",

  bestFor: [
    "concept learning",
    "definitions",
    "topic summaries",
    "visual study notes"
  ],

  supportsCode: true,
  supportsDenseContent: false
}
```

Adapt metadata schema if needed.

---

# 23. UPDATE REGISTRY

Registry must contain exactly:

```text
balanced
code-focus
cheat-sheet
concept-grid
```

`getAvailableLayouts()` should return all four.

No future fake layouts.

---

# 24. COMPILER COMPATIBILITY

Existing:

```ts
compileTemplateStudyNotesV1(content)
```

must still use:

```text
balanced
```

Existing:

```ts
compileTemplateStudyNotesV1(content, {
  layout: "code-focus"
})
```

must remain working.

Add support for:

```ts
compileTemplateStudyNotesV1(content, {
  layout: "cheat-sheet"
})
```

and:

```ts
compileTemplateStudyNotesV1(content, {
  layout: "concept-grid"
})
```

Do not add layout-specific conditions to compiler.

Compiler resolves strategy from registry and calls it.

---

# 25. TEST FIXTURE — CONCEPTUAL NOTES

Example:

```json
{
  "title": "JavaScript Closures",

  "definition":
    "A closure is a function bundled with references to its surrounding lexical environment.",

  "concepts": [
    "Lexical scope",
    "Outer variables remain accessible",
    "Functions retain scope after outer execution"
  ],

  "summary": [
    "Closures remember their environment",
    "Useful for private state",
    "Common in callbacks"
  ],

  "interview":
    "Explain how closures can be used to implement private variables.",

  "warning":
    "Closures can retain references and increase memory usage.",

  "memory":
    "Think: function + backpack of variables.",

  "related": [
    "Scope",
    "Callbacks",
    "Higher-order functions"
  ]
}
```

Expected:

Concept Grid should provide a particularly coherent composition.

Cheat Sheet should provide a denser alternative.

---

# 26. TEST FIXTURE — INTERVIEW CHEAT SHEET

Use many short:

```text
definition
concepts
summary
warning
interview
memory
related
notes
```

Expected:

Cheat Sheet should:

```text
use compact cards
use available columns efficiently
show many facts above the fold
```

---

# 27. TEST FIXTURE — CODE HEAVY

Use approximately:

```text
20–30 lines code
definition
concepts
summary
warning
```

Expected:

```text
Code Focus
```

should still be clearly more appropriate visually than Cheat Sheet/Concept Grid.

But all four layouts must:

```text
render
preserve content
avoid collision
```

---

# 28. TEST FIXTURE — MINIMAL

Use:

```json
{
  "title": "REST",
  "definition": "An architectural style for networked applications."
}
```

All four strategies must produce sensible output.

No unnecessary 3-column empty grids.

---

# 29. TEST FIXTURE — EXTREME CONTENT

Use excessive content.

All strategies must:

```text
preserve content
not crash
not produce NaN
not produce negative dimensions
detect overflow
```

Overflow is acceptable.

Collision is not.

---

# 30. STRATEGY DIFFERENCE TEST

For a medium conceptual fixture, compare geometry across:

```text
balanced
code-focus
cheat-sheet
concept-grid
```

The strategies must NOT all converge to essentially the same layout.

Verify differences in:

```text
column count
block width
block X/Y
span behavior
ordering
used height
used area
```

The entire purpose of multiple strategies is meaningful visual alternatives.

---

# 31. REGRESSION TEST BALANCED

Balanced must retain its Phase 4 behavior.

Do not accidentally make Balanced compact because Cheat Sheet introduces compact measurement.

---

# 32. REGRESSION TEST CODE FOCUS

Code Focus must retain its Phase 4 behavior:

```text
code-dominant composition
40/60 region behavior
no-code fallback
lower supporting region
```

Do not alter it unnecessarily.

---

# 33. DETERMINISM

Every strategy must remain deterministic.

Same:

```text
document
+
layout ID
```

must produce identical geometry.

---

# 34. DEVELOPMENT DIAGNOSTICS

For each strategy report in development:

```text
layout ID
block count
column count / row count
block geometry
span
used height
used area ratio
overflow
collisions
```

Do not spam production console.

---

# 35. DO NOT ADD UI

Do NOT add:

```text
layout picker
recommendation cards
preview thumbnails
user preferences
```

yet.

Programmatic selection is sufficient for Phase 5.

---

# 36. VERIFY

Run:

```text
npx tsc --noEmit
npm run build
```

and configured lint/tests if available.

Verify all four layout IDs programmatically.

---

# PHASE 5 DEFINITION OF DONE

Phase 5 is complete when:

1. `cheat-sheet` exists.
2. `concept-grid` exists.
3. Both implement `LayoutStrategy`.
4. LayoutId includes all four implemented layouts.
5. Registry contains exactly four strategies.
6. Cheat Sheet is visually denser than Balanced.
7. Cheat Sheet favors compact modular cards.
8. Cheat Sheet uses span 2 sparingly.
9. Concept Grid uses row-oriented placement.
10. Concept Grid preserves local row safety.
11. Concept Grid favors conceptual hierarchy.
12. Concept Grid handles code safely.
13. Wide blocks finish/start rows safely.
14. All blocks are measured at actual widths.
15. Shared collision detection is used.
16. Shared bounds validation is used.
17. All layouts return compatible metrics.
18. Balanced regression passes.
19. Code Focus regression passes.
20. Minimal content works.
21. Extreme content reports overflow safely.
22. No normal fixture produces collisions.
23. All layouts are deterministic.
24. Compiler requires no strategy-specific branching.
25. Existing imports/exports/editor remain compatible.
26. TypeScript passes.
27. Production build passes.

---

# DO NOT START PHASE 6

Do NOT implement:

```text
layout recommendations
recommendation scores
user preferences
layout selection UI
preview UI
themes
AI
```

After completion provide:

1. Final layout directory tree
2. Files created
3. Files modified
4. Cheat Sheet algorithm
5. Concept Grid algorithm
6. Compact measurement changes, if any
7. Row planning rules
8. Wide-block handling
9. Registry result
10. Geometry comparison of all four layouts
11. Metrics comparison
12. Collision results
13. Overflow results
14. Balanced regression result
15. Code Focus regression result
16. Determinism result
17. TypeScript result
18. Production build result
19. Known limitations

Then STOP.
