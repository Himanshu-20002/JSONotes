# JSONotes — Phase 7: Recommendation UX + User Layout Preferences

Phases 1–6 are complete.

The engine currently supports:

```text
Semantic normalization
Content analysis
Dynamic measurement
4 layout strategies
Candidate generation
Recommendation scoring
Confidence calculation
Human-readable recommendation reasons
```

Implemented layouts:

```text
balanced
code-focus
cheat-sheet
concept-grid
```

Phase 7 connects this intelligence to the actual product UI.

This phase introduces:

1. Analyze-before-generate flow
2. Recommended layout UI
3. Alternative layout choices
4. User layout preferences
5. Preference-aware re-ranking
6. Explicit generation with the selected layout

Do NOT add authentication, database persistence, AI APIs, billing, sharing, or themes.

---

# 1. INSPECT CURRENT APPLICATION FIRST

Before modifying code inspect:

```text
components/editor/import-modal.tsx
components/editor/editor-shell.tsx
components/editor/left-panel.tsx
lib/store.ts

lib/engine/compiler.ts

lib/engine/recommendation/
lib/engine/layout/
lib/engine/semantic/
```

Understand the existing import/generation flow.

Do not rewrite unrelated editor architecture.

Preserve:

```text
JSON import
Markdown import
custom elements[]
drag
resize
editing
undo/redo
exports
```

---

# 2. TARGET USER FLOW

Change automatic note generation into:

```text
INPUT
  ↓
Paste JSON / Markdown
  ↓
[Analyze Content]
  ↓
RECOMMENDATION
  ↓
Recommended Layout
Alternative Layouts
Optional Preferences
  ↓
[Generate Notes]
  ↓
Canvas
```

Do NOT immediately generate CanvasElements when the user clicks Analyze.

Analysis and generation become separate actions.

---

# 3. IMPORT MODAL STATES

Refactor the import modal into clear internal states.

Suggested:

```ts
type ImportStep =
  | "input"
  | "analyzing"
  | "recommendation"
  | "generating"
```

If analysis is synchronous and fast, `"analyzing"` may be transient.

Still keep responsibilities logically separated.

Do not introduce fake loading delays.

---

# 4. INPUT STEP

The first screen keeps existing:

```text
JSON input
Markdown input
file import if already supported
validation
```

Primary CTA changes conceptually from:

```text
Generate
```

to:

```text
Analyze Content
```

When clicked:

```text
parse input
    ↓
normalize
    ↓
analyze
    ↓
recommend
```

Do not update Zustand canvas elements yet.

---

# 5. CUSTOM elements[] SPECIAL CASE

Existing explicit:

```json
{
  "elements": [...]
}
```

must remain backward compatible.

These are already-positioned CanvasElements.

Do NOT run layout recommendations against them.

For custom elements, preserve the existing direct import behavior.

Recommendation flow is for semantic JSON/Markdown generation.

---

# 6. ANALYSIS RESULT STATE

Store recommendation state locally in the import workflow unless there is a strong reason for global Zustand state.

Conceptually:

```ts
interface ImportAnalysisState {
  document: SemanticDocument
  analysis: ContentAnalysis
  recommendation: RecommendationResult
}
```

Avoid placing temporary modal analysis state into the global editor store unnecessarily.

---

# 7. RECOMMENDATION SCREEN

Create a clear recommendation screen.

Conceptually:

```text
┌─────────────────────────────────────────────┐
│ Choose your layout                          │
│                                             │
│ Recommended for your content                │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ★ Concept Grid                    91%   │ │
│ │                                         │ │
│ │ Structured knowledge cards             │ │
│ │                                         │ │
│ │ ✓ Concept-heavy content                │ │
│ │ ✓ Strong readability                   │ │
│ │ ✓ Fits canvas without overflow         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Other layouts                               │
│                                             │
│ Balanced    Code Focus    Cheat Sheet       │
│   84%          61%            77%           │
│                                             │
│ Customize                                   │
│                                             │
│ [ Back ]                  [ Generate Notes ]│
└─────────────────────────────────────────────┘
```

This is conceptual.

Adapt styling to the existing JSONotes UI.

Do not redesign the entire app.

---

# 8. LAYOUT OPTION COMPONENT

Create a reusable UI component if appropriate:

```text
components/editor/layout-option-card.tsx
```

or an equivalent clean location.

It should display:

```text
layout name
description
score
recommended badge
selected state
1–2 useful reasons
```

Do NOT expose raw internal metrics such as:

```text
columnImbalance = 0.1827
```

to normal users.

---

# 9. RECOMMENDED CARD

The winning strategy should be visually emphasized.

Show:

```text
Recommended
```

badge.

Show its:

```text
score
confidence
top reasons
```

But distinguish score from confidence.

Do NOT display something misleading like:

```text
91% confidence
```

when `91` is actually the layout score.

Prefer UI such as:

```text
Concept Grid

Match: 91/100
Recommendation confidence: High
```

or another clear presentation.

---

# 10. CONFIDENCE LABEL

Convert numerical confidence into a user-friendly label.

Example:

```text
0–54
→ Low confidence

55–74
→ Good confidence

75–100
→ High confidence
```

Centralize this mapping.

Do not scatter thresholds in React components.

Do not hide alternatives when confidence is low.

Low confidence means choice matters MORE.

---

# 11. ALTERNATIVE LAYOUTS

Show all other implemented strategies.

Currently:

```text
Balanced
Code Focus
Cheat Sheet
Concept Grid
```

The recommended layout appears first/prominently.

Remaining candidates should be ordered by recommendation score.

Users must be able to manually select any candidate.

---

# 12. SELECTION STATE

Maintain:

```ts
selectedLayout: LayoutId
```

Initially:

```text
selectedLayout = recommendation.recommendedLayout
```

If user selects another card:

```text
selectedLayout = clicked layout
```

Do not mutate the recommendation winner.

Distinguish:

```text
recommendedLayout
```

from:

```text
selectedLayout
```

---

# 13. GENERATION

When user clicks:

```text
Generate Notes
```

compile using the EXPLICIT selected strategy.

Conceptually:

```ts
compileTemplateStudyNotesV1(content, {
  layout: selectedLayout
})
```

Do not rely on compiler default Balanced.

The selected strategy must be respected.

---

# 14. REUSE CANDIDATE RESULT WHERE SAFE

Phase 6 recommendation already generates:

```text
LayoutResult
```

for every candidate.

Inspect whether the compiler can safely reuse the selected candidate's LayoutResult without duplicating layout work.

If reuse would require awkward coupling, do NOT force it in this phase.

Correctness is more important than premature optimization.

Document the decision.

---

# 15. USER PREFERENCES

Introduce a small preference model.

Do NOT create dozens of controls.

Start with three high-value preferences:

```ts
interface LayoutPreferences {
  density: "auto" | "compact" | "comfortable"

  priority:
    | "auto"
    | "readability"
    | "fit-more"
    | "code"

  structure:
    | "auto"
    | "balanced"
    | "grid"
}
```

Names can be adjusted for clarity.

Keep preferences layout-agnostic.

Users should describe what they want, not internal engine algorithms.

---

# 16. DENSITY PREFERENCE

Expose:

```text
Auto
Compact
Comfortable
```

Meaning:

### Auto

Engine decides.

### Compact

Prefer layouts that show more information at once.

This should slightly favor:

```text
cheat-sheet
```

and layouts with strong canvas utilization.

### Comfortable

Prefer readability and breathing room.

This should favor:

```text
concept-grid
balanced
```

when appropriate.

Do NOT directly force a layout.

Preference modifies scoring.

---

# 17. PRIORITY PREFERENCE

Expose something conceptually like:

```text
Auto
Readability
Fit more content
Code
```

### Readability

Increase readability weight.

### Fit more content

Increase geometry/utilization importance and reduce tolerance for overflow.

### Code

Increase semantic preference for layouts that handle code effectively.

This may favor Code Focus when code exists.

If no code exists, the preference should not catastrophically distort scoring.

---

# 18. STRUCTURE PREFERENCE

Expose:

```text
Auto
Balanced
Grid
```

Meaning:

### Balanced

Prefer flexible/masonry-like composition.

### Grid

Prefer structured card alignment.

This should influence:

```text
concept-grid
cheat-sheet
```

appropriately.

Again:

Preference ≠ forced layout.

Manual layout selection is the force mechanism.

---

# 19. RECOMMENDATION ENGINE EXTENSION

Extend recommendation cleanly.

Prefer:

```ts
recommendLayout(
  document,
  analysis,
  {
    preferences?
  }
)
```

or an equivalent options object.

Do NOT make React manipulate candidate scores.

Preference-aware scoring belongs in:

```text
lib/engine/recommendation/
```

---

# 20. PREFERENCE SCORING

Add a dedicated module such as:

```text
lib/engine/recommendation/preference-fit.ts
```

or integrate cleanly into existing scoring architecture.

Add:

```text
preferenceFit
```

to score breakdown if appropriate.

Do not hide preference adjustments inside arbitrary constants.

---

# 21. PREFERENCE WEIGHT

Preferences should influence recommendations without completely overriding actual geometry.

For example, evolve scoring from:

```text
Content Fit    45%
Geometry Fit   35%
Readability    20%
```

toward something approximately like:

```text
Content Fit       40%
Geometry Fit      30%
Readability       20%
Preference Fit    10%
```

when explicit preferences exist.

If preferences are all:

```text
auto
```

preserve Phase 6 behavior as closely as possible.

Centralize weights.

---

# 22. STRONG GEOMETRY STILL WINS

Preference must NOT allow a broken layout to win.

Example:

User selects:

```text
Compact
```

but Cheat Sheet overflows by 900px.

Balanced fits cleanly.

Balanced must still be capable of winning.

Collision and overflow penalties remain authoritative.

---

# 23. MANUAL SELECTION OVERRIDES RECOMMENDATION

This distinction is critical:

```text
preferences
→ influence recommendation

manual layout selection
→ overrides recommendation
```

If recommendation says:

```text
Concept Grid
```

but user clicks:

```text
Code Focus
```

Generate Code Focus.

Do not silently switch back.

---

# 24. RECOMMENDATION RE-RUN

When a preference changes:

```text
density
priority
structure
```

re-run recommendation locally.

Update:

```text
candidate scores
recommended layout
confidence
reasons
```

Do NOT automatically reset `selectedLayout` every time unless the user has not manually made a selection.

Track something conceptually like:

```ts
hasManualLayoutSelection: boolean
```

Behavior:

```text
No manual selection yet
→ recommendation changes
→ selected layout follows recommendation

User manually selected layout
→ preference changes
→ recommendation may change
→ user's selection remains
```

This prevents frustrating UI behavior.

---

# 25. PREFERENCE UI

Keep controls compact.

Conceptually:

```text
Customize recommendation

Density
[ Auto ] [ Compact ] [ Comfortable ]

Priority
[ Auto ] [ Readability ] [ Fit More ] [ Code ]

Structure
[ Auto ] [ Balanced ] [ Grid ]
```

Do not make this screen feel like a configuration form.

Use segmented controls/chips where consistent with current UI.

---

# 26. DEFAULT EXPERIENCE

A normal user should be able to:

```text
Paste
→ Analyze
→ Generate
```

without touching any preference.

Advanced customization is optional.

The recommendation engine should provide a good default.

---

# 27. EXPLANATION COPY

Reasons should be translated into user-friendly language.

Avoid:

```text
usedAreaRatio 0.71
columnImbalance 0.16
semantic codeRatio 0.42
```

Prefer:

```text
"Your note contains a substantial code example."

"This layout keeps the content readable without overflowing."

"Your content is mostly short revision points."
```

Reuse Phase 6 reason messages where already appropriate.

---

# 28. SCORE PRESENTATION

Do not create false precision.

Internally:

```text
87.4281
```

may exist.

UI should show:

```text
87
```

or:

```text
87/100
```

Do not show decimals.

---

# 29. LOW CONFIDENCE UX

If confidence is low, communicate it gracefully.

For example:

```text
Several layouts work well for this content.
```

Do not show alarming warning styling.

Then make alternatives easy to compare/select.

---

# 30. HIGH CONFIDENCE UX

If confidence is high:

```text
Strong recommendation
```

can be shown.

Still allow all alternatives.

Never lock users into the recommendation.

---

# 31. OPTIONAL SIMPLE LAYOUT DIAGRAM

If it can be implemented cheaply from existing candidate geometry, show a tiny schematic preview.

Example:

```text
┌──────┬──────┐
│      │      │
├──────┼──────┤
│      │      │
└──────┴──────┘
```

This should use candidate:

```text
PositionedBlock[]
```

geometry.

Do NOT render full block content or create screenshot generation.

If this introduces significant complexity, skip it.

Recommendation selection is more important.

---

# 32. ACCESSIBILITY

Layout cards must be keyboard selectable.

Use proper:

```text
button
radio semantics
aria-selected / aria-checked
```

as appropriate.

Preference controls must have accessible labels.

Do not rely only on color for selected/recommended state.

---

# 33. RESPONSIVE MODAL

Ensure recommendation UI remains usable at typical laptop widths.

Do not assume the modal has 2560px canvas width.

Layout selection UI is regular application UI.

Test approximately:

```text
1280px
1440px
1920px
```

viewport widths.

---

# 34. ERROR HANDLING

Invalid JSON:

Remain on input step.

Show useful parsing error.

Do not enter recommendation state.

If recommendation unexpectedly fails:

```text
fallback to Balanced
```

and allow generation.

Do not leave the modal stuck.

---

# 35. ANALYSIS PERFORMANCE

Recommendation currently evaluates four layouts.

Measure approximate runtime.

Do not add fake spinner delays.

If computation is effectively instant, transition immediately.

If noticeable, show a genuine analyzing state.

Do not introduce Web Workers unless profiling demonstrates a need.

---

# 36. STORE INTEGRATION

Only final generation should update the editor's canvas state.

Flow:

```text
input
→ analysis
→ recommendation
→ preferences
```

should remain temporary.

Then:

```text
Generate Notes
```

updates Zustand with final:

```text
CanvasElement[]
```

Preserve existing undo/history expectations.

---

# 37. MODAL BACK BEHAVIOR

From recommendation:

```text
Back
```

returns to input without losing the user's pasted content.

Do not clear their JSON.

---

# 38. MODAL RESET

When import modal closes completely, choose sensible reset behavior.

Recommended:

```text
clear temporary recommendation
clear selected layout
reset preferences to auto
```

but preserve existing product behavior around input text if currently expected.

Do not accidentally persist stale recommendations between unrelated imports.

---

# 39. TEST — CODE HEAVY

Input:

```text
definition
concepts
30-line code
summary
warning
```

Expected:

```text
Code Focus recommended
```

when Phase 6 scoring indicates it.

UI shows:

```text
Recommended
score
confidence
reasons
alternatives
```

Selecting Balanced manually and clicking Generate must generate Balanced.

---

# 40. TEST — CONCEPTUAL

Input:

```text
definition
concepts
summary
related
memory
```

Expected:

Concept Grid should generally be recommended.

User can select another layout.

---

# 41. TEST — DENSE REVISION

Input:

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

Cheat Sheet / Concept Grid ranking according to actual Phase 6 scoring.

Do NOT hardcode Cheat Sheet as expected winner.

Show confidence appropriately.

---

# 42. TEST — MINIMAL

Input:

```json
{
  "title": "REST",
  "definition": "An architectural style."
}
```

Expected:

Likely low recommendation confidence.

UI communicates:

```text
Several layouts work well
```

rather than pretending certainty.

---

# 43. TEST — COMPACT PREFERENCE

Use a fixture where:

```text
Concept Grid score = slightly higher than Cheat Sheet
```

Then select:

```text
Density → Compact
```

Expected:

Cheat Sheet may overtake Concept Grid IF geometry remains healthy.

Verify recommendation reruns.

---

# 44. TEST — READABILITY PREFERENCE

Select:

```text
Priority → Readability
```

Expected:

Candidates with healthier semantic card widths/readability gain score.

Do not simply force Concept Grid.

---

# 45. TEST — CODE PREFERENCE

With code content:

```text
Priority → Code
```

Expected:

Code Focus receives a meaningful preference bonus.

Without code:

Code Focus should not receive an unreasonable recommendation.

---

# 46. TEST — MANUAL SELECTION PERSISTENCE

Sequence:

```text
Analyze
↓
Concept Grid recommended
↓
User selects Balanced
↓
User changes Density to Compact
↓
Recommendation changes to Cheat Sheet
```

Expected:

```text
Recommended = Cheat Sheet
Selected = Balanced
```

Generate must use Balanced.

This behavior is mandatory.

---

# 47. TEST — CUSTOM ELEMENTS

Import explicit:

```json
{
  "elements": [...]
}
```

Expected:

Existing direct-import behavior.

No recommendation screen required.

No geometry modifications.

---

# 48. TEST — INVALID JSON

Expected:

Parsing error displayed.

No recommendation generated.

No editor state changed.

---

# 49. TEST — MARKDOWN

Existing Markdown import must flow through:

```text
Markdown
→ semantic conversion
→ recommendation
→ selected layout
→ generation
```

unless current architecture has a justified different normalization path.

Preserve compatibility.

---

# 50. TEST — EXISTING EDITOR

After generation verify:

```text
drag
resize
rotate
inline edit
undo
redo
export
```

still work.

Recommendation affects initial layout only.

---

# 51. DO NOT ADD PERSISTENCE YET

Preferences are session/import-flow state for now.

Do NOT add:

```text
localStorage
database
user profile
cookies
```

in Phase 7.

Persistent preferences can come later.

---

# 52. DOCUMENTATION

Create/update:

```text
docs/recommendation-ui.md
```

Document:

```text
user flow
state flow
preference model
preference scoring
manual selection behavior
fallback behavior
```

---

# 53. VERIFY

Run:

```text
npx tsc --noEmit
npm run build
```

Run lint/tests if configured.

Manually test the import flow.

---

# PHASE 7 DEFINITION OF DONE

Phase 7 is complete when:

1. Import has separate Analyze and Generate stages.
2. Recommendation screen exists.
3. Winning layout is visually emphasized.
4. All four alternatives are selectable.
5. Layout score is shown clearly.
6. Confidence is presented separately from score.
7. Human-readable reasons are shown.
8. Low-confidence UX exists.
9. High-confidence UX exists.
10. `selectedLayout` exists independently of recommendation.
11. Recommended layout is initially selected.
12. Manual layout selection works.
13. Generate uses explicitly selected layout.
14. Density preference exists.
15. Priority preference exists.
16. Structure preference exists.
17. Preferences modify recommendation scoring in engine code.
18. Auto preferences preserve Phase 6 scoring as closely as possible.
19. Preference changes re-run recommendation.
20. Manual selection survives recommendation changes.
21. Broken/overflowing layouts cannot win merely because of preference.
22. Custom elements bypass recommendation.
23. Invalid JSON does not modify canvas.
24. Markdown remains compatible.
25. Back preserves input.
26. Temporary analysis state is cleaned appropriately.
27. Existing editor interactions work.
28. Existing export works.
29. Recommendation remains deterministic.
30. No AI/network API is introduced.
31. TypeScript passes.
32. Production build passes.

---

# DO NOT START PHASE 8

Do NOT implement:

```text
themes
visual style recommendation
authentication
database
cloud saves
sharing
billing
AI
collaboration
```

When complete provide:

1. Files created
2. Files modified
3. Import flow architecture
4. Recommendation UI structure
5. Preference types
6. Updated scoring formula
7. Preference scoring rules
8. Selection-state behavior
9. Manual override test
10. Compact preference test
11. Readability preference test
12. Code preference test
13. Custom elements test
14. Markdown test
15. Performance observation
16. Accessibility checks
17. TypeScript result
18. Production build result
19. Known limitations

Then STOP.
