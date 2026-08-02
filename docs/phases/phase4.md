# JSONotes — Phase 4: Layout Strategy Architecture + Code Focus Layout

Phase 1–3 are complete and working.

Current engine:

```text
lib/engine/
├── semantic/
├── measurement/
├── layout/
│   ├── balanced.ts
│   ├── constants.ts
│   ├── metrics.ts
│   ├── validation.ts
│   ├── types.ts
│   └── index.ts
├── compiler.ts
└── index.ts
```

Current pipeline:

```text
JSON / Markdown
      ↓
SemanticDocument
      ↓
ContentAnalysis
      ↓
Measurement
      ↓
createBalancedLayout()
      ↓
PositionedBlock[]
      ↓
compiler.ts
      ↓
CanvasElement[]
```

Currently Balanced is the ONLY layout.

Phase 4 introduces a reusable strategy architecture and a second genuinely different layout:

# Code Focus

Do NOT implement recommendations yet.

---

# PHASE 4 OBJECTIVES

Implement:

1. Common `LayoutStrategy` contract
2. Layout IDs / metadata
3. Layout context
4. Strategy registry
5. Refactor Balanced to satisfy the common contract
6. Implement Code Focus
7. Allow compiler to select a layout strategy
8. Preserve Balanced as default
9. Preserve all existing behavior
10. Add tests comparing Balanced vs Code Focus

After Phase 4:

```text
SemanticDocument
      ↓
ContentAnalysis
      ↓
Layout Strategy
      ├── Balanced
      └── Code Focus
      ↓
LayoutResult
      ↓
Compiler
      ↓
CanvasElement[]
```

---

# 1. INSPECT EXISTING PHASE 3 CODE

Inspect actual:

```text
lib/engine/layout/types.ts
lib/engine/layout/balanced.ts
lib/engine/layout/constants.ts
lib/engine/layout/metrics.ts
lib/engine/layout/validation.ts
lib/engine/compiler.ts
lib/engine/semantic/
lib/engine/measurement/
```

Do not rewrite working Balanced behavior unnecessarily.

Refactor it only enough to conform to the common strategy contract.

---

# 2. TARGET LAYOUT DIRECTORY

Refactor toward:

```text
lib/engine/layout/
├── strategies/
│   ├── balanced.ts
│   ├── code-focus.ts
│   └── index.ts
│
├── registry.ts
├── types.ts
├── constants.ts
├── metrics.ts
├── validation.ts
└── index.ts
```

Move the current:

```text
layout/balanced.ts
```

to:

```text
layout/strategies/balanced.ts
```

if this can be done safely.

Update imports.

Do not duplicate Balanced implementations.

---

# 3. LAYOUT IDENTIFIERS

Define:

```ts
export type LayoutId =
  | "balanced"
  | "code-focus";
```

Future phases will extend this with:

```text
cheat-sheet
concept-grid
```

Do NOT add fake/unimplemented strategies to the active registry.

---

# 4. LAYOUT METADATA

Create approximately:

```ts
export interface LayoutMetadata {
  id: LayoutId;

  name: string;

  description: string;

  bestFor: string[];

  supportsCode: boolean;

  supportsDenseContent: boolean;
}
```

Example Balanced:

```ts
{
  id: "balanced",
  name: "Balanced",
  description:
    "Distributes mixed content across a balanced adaptive grid.",
  bestFor: [
    "mixed notes",
    "general study notes",
    "definitions and summaries"
  ],
  supportsCode: true,
  supportsDenseContent: true
}
```

Code Focus:

```ts
{
  id: "code-focus",
  name: "Code Focus",
  description:
    "Prioritizes code examples while keeping explanations and revision notes nearby.",
  bestFor: [
    "programming notes",
    "API references",
    "technical interview preparation"
  ],
  supportsCode: true,
  supportsDenseContent: true
}
```

This metadata will later be used by recommendations/UI.

---

# 5. LAYOUT CONTEXT

Create a common context passed to strategies.

Approximately:

```ts
export interface LayoutContext {
  canvas: {
    width: number;
    height: number;
  };

  contentRegion: LayoutRect;

  analysis: ContentAnalysis;

  blockGap: number;
  columnGap: number;
}
```

If other information is genuinely needed, add it carefully.

Do not put Zustand/UI state in this context.

---

# 6. LAYOUT STRATEGY CONTRACT

Define something approximately like:

```ts
export interface LayoutStrategy {
  id: LayoutId;

  metadata: LayoutMetadata;

  createLayout(
    document: SemanticDocument,
    context: LayoutContext
  ): LayoutResult;
}
```

Strategies must return the SAME:

```text
LayoutResult
```

contract.

The compiler should not care whether the result came from Balanced or Code Focus.

---

# 7. BALANCED STRATEGY REFACTOR

Convert existing Balanced into:

```ts
export const balancedLayoutStrategy: LayoutStrategy = {
  id: "balanced",

  metadata: {...},

  createLayout(document, context) {
    // existing working Phase 3 algorithm
  }
}
```

IMPORTANT:

Do NOT redesign Balanced.

Its current verified behavior should remain approximately identical.

Preserve:

* dynamic 1–3 columns
* dynamic widths
* measurement at actual width
* span behavior
* shortest-column placement
* reading hierarchy
* collision detection
* bounds validation
* metrics
* deterministic output

This step is architectural.

---

# 8. CREATE STRATEGY REGISTRY

Create:

```text
lib/engine/layout/registry.ts
```

Implement approximately:

```ts
const layoutStrategies = {
  balanced: balancedLayoutStrategy,
  "code-focus": codeFocusLayoutStrategy
};
```

Provide:

```ts
getLayoutStrategy(id)
```

and:

```ts
getAvailableLayouts()
```

Avoid large switch statements throughout the codebase.

The registry should become the single source of truth for implemented layouts.

---

# 9. DEFAULT STRATEGY

Balanced remains the default.

If no layout is specified:

```text
balanced
```

must be used.

If an invalid layout ID somehow reaches the compiler, safely fall back to Balanced.

Do not crash note generation.

---

# 10. CODE FOCUS PURPOSE

Code Focus should NOT simply be:

```text
Balanced + make code wider
```

It should have a visibly different composition.

The visual goal:

```text
┌──────────────────────────────────────────────┐
│ TITLE                                        │
│ Subtitle                                     │
├──────────────────────────────────────────────┤
│                                              │
│     EXPLANATION      │                       │
│                      │      CODE             │
│     CONCEPTS         │      CODE             │
│                      │      CODE             │
│                      │                       │
├──────────────────────┼───────────────────────┤
│ SUMMARY / WARNING    │ SUPPORTING NOTES      │
└──────────────────────────────────────────────┘
```

or an equivalent adaptive composition.

The exact geometry can vary depending on content.

But code must clearly become the visual anchor.

---

# 11. CODE FOCUS ACTIVATION

Code Focus should work best when:

```text
document contains >= 1 code block
```

However, it must not crash if selected for content without code.

If there is no code:

either:

```text
fall back internally to a sensible non-code composition
```

or:

```text
use Balanced placement behavior
```

Document whichever approach is chosen.

Do not throw an error.

---

# 12. IDENTIFY PRIMARY CODE BLOCK

If multiple code blocks become supported now or later, Code Focus should identify a primary code block.

Use deterministic signals:

```text
importance
codeLines
content length
original order
```

For current schema there may only be one code block.

Still structure the implementation so it is not permanently hardcoded around exactly one.

---

# 13. CODE FOCUS GRID

Use a layout composition where code receives approximately:

```text
55–65%
```

of usable horizontal space when appropriate.

Supporting content receives approximately:

```text
35–45%
```

Do not blindly hardcode 60/40 if actual padding/gaps require adjustment.

Centralize ratios/constants.

Conceptually:

```text
content width
      ↓

supporting column       code region
~40%                    ~60%
```

---

# 14. CODE BLOCK MEASUREMENT

Measure the primary code block at its ACTUAL Code Focus width.

Example:

```ts
measureBlock(codeBlock, {
  availableWidth: codeRegionWidth
})
```

Never reuse Balanced measurement.

Different layout width means different measurement.

---

# 15. CODE REGION HEIGHT

Use the measured code height.

Do NOT stretch short code to fill the whole canvas.

Example:

1-line code should remain compact.

Large code may become a tall anchor.

Preserve Phase 2 measurement principles.

---

# 16. SUPPORTING CONTENT

Supporting content may include:

```text
definition
concept
summary
warning
interview
memory
related
note
```

Prioritize content near the code based on:

```text
importance
semantic relevance
reading hierarchy
```

A reasonable initial ordering:

```text
definition
concept
summary
warning
interview
memory
related
note
```

But combine with importance and original order.

---

# 17. SUPPORTING COLUMN STACKING

Use dynamic measurement and vertical stacking.

Conceptually:

```text
supportY = contentStartY

for block:
    measure at supportWidth
    place
    supportY += height + gap
```

Do not use fixed heights.

---

# 18. SECONDARY REGION

If supporting content exceeds the height beside the code block, allow remaining blocks to continue into a secondary lower region.

Conceptually:

```text
┌──────────────────────────────┐
│ SUPPORT       │ CODE         │
│ SUPPORT       │ CODE         │
│               │ CODE         │
├──────────────────────────────┤
│ SUMMARY   │ WARNING │ MEMORY │
└──────────────────────────────┘
```

The implementation does not have to exactly match this drawing.

But supporting content should not simply overflow because the side column is full.

---

# 19. POST-CODE / LOWER REGION

Calculate:

```text
lowerRegionY =
max(
  supportColumnBottom,
  codeRegionBottom
)
+ blockGap
```

Remaining content can then use a balanced mini-grid or shortest-column arrangement below.

Reuse existing helpers where possible.

Do not copy/paste the entire Balanced algorithm.

Extract shared helpers if genuinely reusable.

---

# 20. AVOID OVER-ABSTRACTION

It is acceptable for:

```text
Balanced
```

and:

```text
Code Focus
```

to have different algorithms.

Do NOT create an enormous generic layout engine full of flags just to make both share every line of code.

Share:

* measurement
* validation
* metrics
* geometry helpers

Keep strategy-specific placement inside each strategy.

---

# 21. SHARED HELPERS

If Phase 3 contains useful logic inside Balanced that both layouts need, extract small helpers.

Possible examples:

```text
calculateColumnWidth()
calculateSpanWidth()
findShortestColumn()
calculateContentRegion()
sortBlocksForReading()
```

Only extract helpers actually reused.

Potential location:

```text
layout/utils.ts
```

Do not create dozens of tiny files.

---

# 22. LAYOUT METRICS

Code Focus must return the same metrics contract:

```text
usedHeight
usedAreaRatio
columnImbalance
overflowCount
collisionCount
```

If `columnImbalance` is not meaningful for the Code Focus geometry, either:

* calculate it over logical regions, or
* document a strategy-neutral interpretation

Do not silently return fake values.

If necessary, improve the metric contract so future layouts can use it meaningfully.

Keep compatibility with Balanced.

---

# 23. COLLISION VALIDATION

Both strategies must pass through shared:

```text
detectCollisions()
```

No strategy should implement its own incompatible collision algorithm.

Expected:

```text
collisionCount = 0
```

for normal fixtures.

---

# 24. BOUNDS VALIDATION

Both strategies should use shared bounds validation.

Overflow is allowed for excessive content.

Collision is not.

Never clip content silently.

---

# 25. COMPILER API

Update compiler so layout can be selected.

Prefer something approximately like:

```ts
compileTemplateStudyNotesV1(
  content,
  options?
)
```

where:

```ts
interface CompileOptions {
  layout?: LayoutId;
}
```

Default:

```text
balanced
```

Existing calls that do not pass options must continue working.

Do NOT break current import/store/export flows.

---

# 26. COMPILER FLOW

Compiler becomes:

```text
content
   ↓
normalizeContent()
   ↓
SemanticDocument
   ↓
analyzeContent()
   ↓
resolve LayoutStrategy
   ↓
strategy.createLayout()
   ↓
LayoutResult
   ↓
semanticBlockToCanvasElement()
   ↓
CanvasElement[]
```

The compiler should NOT contain:

```text
if code-focus:
   calculate 60/40 grid...
```

That belongs inside:

```text
strategies/code-focus.ts
```

---

# 27. DO NOT ADD UI YET

Do NOT add:

```text
layout dropdown
layout cards
recommendations
previews
```

in Phase 4.

We are proving engine architecture first.

For testing, select the layout programmatically.

UI comes later.

---

# 28. TEST — PROGRAMMATIC STRATEGY SELECTION

Verify:

```ts
compile(..., {
  layout: "balanced"
})
```

and:

```ts
compile(..., {
  layout: "code-focus"
})
```

produce valid CanvasElement arrays.

Existing:

```ts
compile(...)
```

must behave as Balanced.

---

# 29. TEST — CODE HEAVY CONTENT

Example:

```json
{
  "title": "JavaScript Closures",
  "definition": "A closure retains access to its lexical environment.",
  "concepts": [
    "Lexical scope",
    "Persistent outer variables",
    "Common in callbacks"
  ],
  "code": {
    "language": "javascript",
    "code": "function outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  };\n}"
  },
  "summary": [
    "Inner function remembers outer scope",
    "Variables survive after outer returns"
  ],
  "warning": "Closures can retain memory longer than expected."
}
```

Compare:

```text
Balanced
vs
Code Focus
```

Expected:

Code Focus must visually prioritize the code significantly more than Balanced.

---

# 30. TEST — SHORT CODE

Use one-line code.

Expected:

Code Focus still prioritizes code spatially but does NOT stretch it into a giant empty card.

---

# 31. TEST — LARGE CODE

Use approximately 30 lines.

Expected:

* large code region
* correct re-measurement
* supporting content arranged around/below it
* no collision

Overflow warning is acceptable if content genuinely cannot fit.

---

# 32. TEST — NO CODE

Select:

```text
code-focus
```

for:

```json
{
  "title": "HTTP Methods",
  "definition": "...",
  "concepts": [...],
  "summary": [...]
}
```

Expected:

* no crash
* no missing content
* deterministic fallback behavior

Document fallback.

---

# 33. TEST — EXTREME CONTENT

Use code + many large supporting blocks.

Expected:

```text
no collision
content preserved
overflow warnings when necessary
no NaN
no negative geometry
```

---

# 34. TEST — DETERMINISM

Same:

```text
document
+
layout ID
```

must produce identical geometry across repeated runs.

No randomization.

---

# 35. TEST — STRATEGY DIFFERENCE

This test is important.

For code-heavy fixture:

```text
Balanced geometry
```

and:

```text
Code Focus geometry
```

must NOT be effectively identical.

Compare:

```text
primary code x
primary code y
primary code width
primary code height
supporting block geometry
```

The second strategy must provide genuinely different composition.

---

# 36. STRATEGY METADATA TEST

Verify:

```ts
getAvailableLayouts()
```

returns exactly the implemented layouts:

```text
Balanced
Code Focus
```

with metadata.

Do not return future/unimplemented layouts.

---

# 37. COMPATIBILITY

Preserve:

```text
JSON import
Markdown import
SemanticDocument
ContentAnalysis
Measurement
Balanced layout
custom elements[]
CanvasElement[]
Zustand
drag
resize
rotate
editing
project JSON
PNG/JPEG/WebP/SVG exports
```

Balanced remains default, so existing users should not experience unexpected behavior from simply upgrading to Phase 4.

---

# 38. VERIFY

Run:

```text
npx tsc --noEmit
npm run build
```

Run configured tests/lint if available.

Verify both strategies manually/programmatically.

---

# DEFINITION OF DONE

Phase 4 is complete when:

1. `LayoutStrategy` contract exists.
2. `LayoutId` exists.
3. Layout metadata exists.
4. Layout context exists.
5. Strategy registry exists.
6. Balanced implements the common strategy contract.
7. Balanced behavior remains compatible with Phase 3.
8. Code Focus implements the same contract.
9. Code Focus is genuinely visually different from Balanced.
10. Code Focus prioritizes code.
11. Code is measured at actual Code Focus width.
12. Supporting content is dynamically measured.
13. Supporting content can continue below the primary region.
14. Code Focus handles short code.
15. Code Focus handles large code.
16. Code Focus safely handles no-code documents.
17. Shared validation works for both.
18. Shared metrics work for both.
19. Compiler can select strategy programmatically.
20. Compiler defaults to Balanced.
21. Invalid layout IDs safely fall back to Balanced.
22. Existing compiler calls remain compatible.
23. Custom `elements[]` remains compatible.
24. No normal fixture has collisions.
25. Excessive content reports overflow instead of clipping.
26. Layout output remains deterministic.
27. TypeScript passes.
28. Production build passes.

---

# DO NOT START PHASE 5

Do NOT implement:

```text
Cheat Sheet
Concept Grid
recommendation scoring
layout recommendation
user preferences
layout UI
themes
AI
```

When complete provide:

1. Final layout directory tree
2. Files created
3. Files modified
4. `LayoutStrategy` contract
5. Registry implementation
6. Balanced refactor explanation
7. Code Focus algorithm
8. Code/support region ratios
9. No-code fallback behavior
10. Balanced vs Code Focus geometry comparison
11. Metrics for test fixtures
12. Collision results
13. Overflow results
14. Determinism results
15. Compatibility results
16. TypeScript result
17. Production build result
18. Known limitations

Then STOP.
