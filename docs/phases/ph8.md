# JSONotes — Phase 8: Visual Style & Theme Engine

Phases 1–7 are complete.

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
Layout Strategies
      ↓
Recommendation + Preferences
      ↓
Selected Layout
      ↓
CanvasElement[]
      ↓
Renderer
```

JSONotes currently makes increasingly intelligent decisions about:

```text
what the content means
how large blocks should be
where blocks should go
which layout fits best
```

However, visual styling is still largely tied to static block colors/defaults.

Phase 8 introduces a dedicated **Visual Style / Theme Engine**.

The goal is:

> Separate WHAT the note contains, WHERE it is placed, and HOW it looks.

Target architecture:

```text
Semantic Content
      ↓
Layout Engine
      ↓
Positioned Blocks
      +
Theme
      ↓
Visual Styling
      ↓
CanvasElement[]
      ↓
Renderer
```

Do NOT add AI, authentication, persistence, database, billing, sharing, or collaboration.

---

# 1. INSPECT CURRENT VISUAL SYSTEM

Before modifying anything inspect:

```text
lib/colors.ts
lib/blocks.ts
lib/types.ts
lib/engine/compiler.ts

components/editor/block-renderer.tsx
components/editor/canvas.tsx
components/editor/inspector.tsx
components/editor/toolbar.tsx

app/globals.css
```

Identify:

* where colors are currently assigned
* where font sizes are assigned
* where border radius is assigned
* where shadows/borders are assigned
* whether styling lives in CanvasElement or React components
* whether manual user styling already exists

Do not blindly replace existing styling.

Preserve manual editing behavior.

---

# 2. RESPONSIBILITY BOUNDARIES

Maintain these boundaries:

```text
semantic/
→ what is this content?

measurement/
→ how much space does it need?

layout/
→ where should it go?

recommendation/
→ which layout works best?

theme/
→ how should it visually look?

compiler/
→ combine outputs into CanvasElement[]
```

Theme must NOT decide:

```text
x
y
width
height
column count
layout strategy
```

Layout must NOT decide visual colors.

---

# 3. CREATE THEME MODULE

Create:

```text
lib/engine/theme/
├── types.ts
├── tokens.ts
├── themes.ts
├── semantic-style.ts
├── apply-theme.ts
└── index.ts
```

Export through:

```text
lib/engine/index.ts
```

Keep the module pure and independent of React/Zustand.

---

# 4. THEME IDS

Start with exactly four themes:

```ts
export type ThemeId =
  | "vibrant"
  | "minimal"
  | "midnight"
  | "paper"
```

Do not create 15 themes.

Four strong, genuinely different themes are enough.

---

# 5. THEME PURPOSE

## Vibrant

Current JSONotes identity.

Characteristics:

```text
colorful cards
strong semantic differentiation
playful educational feel
high visual energy
```

Best for:

```text
study notes
revision
educational wallpapers
visual memory
```

---

## Minimal

Characteristics:

```text
mostly neutral surfaces
limited accent colors
subtle borders
low visual noise
strong typography
```

Best for:

```text
professional notes
technical documentation
clean cheat sheets
business topics
```

---

## Midnight

Characteristics:

```text
dark canvas
dark elevated cards
bright restrained accents
high contrast text
developer-friendly appearance
```

Best for:

```text
code
technical notes
desktop wallpapers
developer cheat sheets
```

---

## Paper

Characteristics:

```text
warm paper-like canvas
soft card surfaces
ink-like text
subtle educational highlights
note-taking feel
```

Best for:

```text
concept learning
humanities
study notes
summaries
memory cards
```

Do not use actual paper textures yet.

Keep backgrounds CSS/color based.

---

# 6. THEME TOKENS

Create a reusable token model.

Approximately:

```ts
interface ThemeTokens {
  canvas: {
    background: string
    grid?: string
  }

  text: {
    primary: string
    secondary: string
    muted: string
    inverse?: string
  }

  surface: {
    default: string
    elevated: string
    subtle: string
  }

  border: {
    default: string
    strong: string
  }

  accent: {
    primary: string
    secondary: string
  }

  semantic: {
    definition: SemanticVisualToken
    concept: SemanticVisualToken
    code: SemanticVisualToken
    summary: SemanticVisualToken
    warning: SemanticVisualToken
    interview: SemanticVisualToken
    memory: SemanticVisualToken
    related: SemanticVisualToken
    note: SemanticVisualToken
  }
}
```

Adapt to the actual renderer.

Do not introduce unnecessary abstraction if existing types already cover some tokens.

---

# 7. SEMANTIC VISUAL TOKENS

Create something approximately like:

```ts
interface SemanticVisualToken {
  background: string
  foreground: string
  border: string

  accent?: string

  titleColor?: string

  radius?: number

  shadow?: string
}
```

Do not include geometry.

No:

```text
width
height
x
y
```

inside theme tokens.

---

# 8. SEMANTIC COLOR LOGIC

Themes should preserve semantic distinction.

For example in Vibrant:

```text
definition → blue
concept → purple
summary → green
warning → red
interview → yellow
memory → pink
related → cyan
code → dark/slate
```

But these should come from the theme.

Do not leave semantic color selection hardcoded in compiler.

---

# 9. MINIMAL THEME

Minimal should NOT simply convert everything to white.

Use subtle differentiation.

Example conceptually:

```text
definition
→ neutral card + blue accent border

concept
→ neutral card + violet accent

warning
→ very light red surface + red accent

summary
→ neutral card + green accent

code
→ dark or soft-gray code surface
```

Visual hierarchy should remain recognizable.

---

# 10. MIDNIGHT THEME

Midnight requires canvas-level styling.

Example:

```text
canvas
→ near-black/slate

cards
→ dark elevated surfaces

primary text
→ near-white

secondary
→ muted gray

semantic accents
→ brighter but controlled colors
```

Ensure sufficient contrast.

Do not merely invert colors.

---

# 11. PAPER THEME

Paper should feel warm and calm.

Example:

```text
canvas
→ warm off-white

cards
→ slightly lighter/darker warm surfaces

text
→ dark charcoal/brown-black

warning
→ muted red

memory
→ muted rose

concept
→ muted lavender

definition
→ muted blue
```

Avoid overly saturated colors.

---

# 12. TYPOGRAPHY TOKENS

Introduce theme typography only where useful.

Potential model:

```ts
interface TypographyTokens {
  titleWeight: number
  headingWeight: number
  bodyWeight: number

  codeFontFamily?: string

  letterSpacing?: {
    title?: number
    heading?: number
  }
}
```

Do NOT radically change font sizes per theme.

Font size affects measurement.

Phase 8 should avoid invalidating Phase 2 measurements.

If font size differences are introduced, measurement MUST receive matching typography context.

Prefer keeping font sizes unchanged in Phase 8.

---

# 13. IMPORTANT — MEASUREMENT COMPATIBILITY

Theme changes must not silently break measurement.

Safe Phase 8 properties:

```text
color
background
border color
border thickness if accounted for
radius
shadow
font weight
```

Potentially dangerous:

```text
font size
line height
padding
font family with significantly different metrics
```

Do not change dangerous properties unless measurement is updated accordingly.

Prefer visual-only themes first.

---

# 14. THEME REGISTRY

Create:

```ts
getTheme(id: ThemeId)
getAvailableThemes()
```

similar to layout registry architecture.

Do not scatter theme imports through React components.

---

# 15. APPLY THEME

Create:

```text
apply-theme.ts
```

Responsibility:

```text
SemanticBlock
+
ThemeTokens
      ↓
VisualStyle
```

or equivalent.

It should resolve styling based on:

```text
semantic type
theme
importance where useful
```

Keep deterministic.

---

# 16. IMPORTANCE-BASED EMPHASIS

Use `SemanticBlock.importance` carefully.

Example:

```text
importance 5
→ stronger accent/border/shadow

importance 1–2
→ quieter styling
```

Do NOT dramatically resize cards.

Do NOT make every importance-5 block visually loud.

Use subtle visual emphasis.

---

# 17. COMPILER OPTIONS

Extend compiler options cleanly.

Current concept:

```ts
compileTemplateStudyNotesV1(content, {
  layout: selectedLayout
})
```

Evolve toward:

```ts
compileTemplateStudyNotesV1(content, {
  layout: selectedLayout,
  theme: selectedTheme
})
```

Default:

```text
layout → balanced
theme → vibrant
```

Existing calls without theme MUST remain visually compatible as closely as possible.

---

# 18. REMOVE HARDCODED COMPILER COLORS

Inspect compiler for logic like:

```ts
color: "blue"
color: "purple"
color: "green"
```

Move semantic styling responsibility into theme resolution.

Compiler should not know that:

```text
definition = blue
warning = red
```

Compiler should know:

```text
this semantic block uses resolved visual style X
```

Preserve existing CanvasElement compatibility.

---

# 19. CANVAS THEME

Theme must also style the canvas.

Support:

```text
canvas background
grid color
```

If current canvas styling comes directly from CSS classes, refactor minimally so active theme can provide tokens.

Do not break:

```text
zoom
pan
grid toggle
exports
```

---

# 20. EXPORT COMPATIBILITY

PNG/JPEG/WebP/SVG export must reflect selected theme.

Especially verify:

```text
Midnight background exports correctly
Paper background exports correctly
```

Transparent export behavior, if supported, should remain intentional.

Do not accidentally export a dark theme with a white background.

---

# 21. MANUAL STYLE OVERRIDES

Existing manual color/style editing must remain authoritative.

Define precedence:

```text
Theme defaults
      ↓
Semantic style
      ↓
Manual user overrides
```

Therefore:

```text
manual override > theme
```

Changing theme should not unexpectedly destroy deliberate user customization unless current product explicitly treats themes as full reset.

For Phase 8 prefer preserving overrides.

---

# 22. STYLE SOURCE

If necessary, introduce metadata distinguishing:

```text
theme-generated style
manual override
```

Do this minimally.

Do not create a giant CSS state system.

---

# 23. THEME UI

Add theme selection AFTER layout recommendation.

Keep it simple.

Conceptually:

```text
Style

[ Vibrant ] [ Minimal ] [ Midnight ] [ Paper ]
```

Default:

```text
Vibrant
```

Do not make users configure individual semantic colors during import.

---

# 24. THEME PREVIEW

Each theme selector should provide a tiny visual swatch.

Example:

```text
● ● ●
Vibrant

□ ┃ □
Minimal

● ● ●
Midnight

▧ ▧ ▧
Paper
```

Use actual theme tokens.

Do not use screenshots.

---

# 25. RECOMMENDATION VS THEME

Do NOT integrate theme into layout recommendation yet.

Layout recommendation answers:

```text
Where should content go?
```

Theme selection answers:

```text
How should it look?
```

Keep these independent in Phase 8.

---

# 26. GENERATION FLOW

Phase 7:

```text
Analyze
↓
Choose layout
↓
Generate
```

Phase 8:

```text
Analyze
↓
Choose/review layout
↓
Choose style
↓
Generate
```

Theme selection should not trigger semantic re-analysis.

---

# 27. STORE PROJECT THEME

The generated project should know its current:

```ts
themeId: ThemeId
```

Add this to the appropriate project/editor state.

Existing saved/imported projects without `themeId` must default to:

```text
vibrant
```

Backward compatibility is mandatory.

---

# 28. POST-GENERATION THEME SWITCHING

Users should be able to change theme after generation.

Add an appropriate control to:

```text
toolbar
or inspector
```

Do not redesign both.

Pick the cleanest existing location.

Changing theme should:

```text
update theme defaults
preserve geometry
preserve text
preserve manual layout edits
```

No re-layout.

This is important.

Theme switching must NOT move cards.

---

# 29. THEME SWITCHING AND MANUAL COLORS

If a card has no manual style override:

```text
theme switch
→ update its visual styling
```

If card has manual color override:

```text
theme switch
→ preserve manual override
```

Document this precedence.

---

# 30. BLOCK RENDERER

Refactor renderer only as necessary.

Renderer should consume resolved style.

Avoid giant logic like:

```ts
if theme === "midnight" && type === ...
```

inside JSX.

Theme logic belongs in the theme engine.

---

# 31. CSS VARIABLES OPTION

If appropriate, canvas-level tokens may use CSS variables:

```text
--canvas-background
--canvas-grid
--text-primary
```

But semantic block styles should still come from structured theme resolution.

Do not convert the entire application UI into theme variables.

These themes apply to the NOTE/CANVAS, not necessarily the JSONotes application shell.

---

# 32. APP UI VS NOTE THEME

Important distinction:

```text
JSONotes application UI
≠
generated note theme
```

Selecting Midnight should make the NOTE dark.

It should NOT automatically switch the entire JSONotes editor application into dark mode.

Keep those systems independent.

---

# 33. TEST — VIBRANT

Use the existing JavaScript Closures fixture.

Expected:

* visual appearance close to current JSONotes
* semantic colors preserved
* geometry unchanged
* no measurement changes
* export works

---

# 34. TEST — MINIMAL

Same content.

Expected:

* same geometry
* quieter visual styling
* semantic distinction still visible
* code remains readable
* export works

---

# 35. TEST — MIDNIGHT

Same content.

Expected:

* dark canvas
* readable dark cards
* sufficient text contrast
* code syntax remains visible
* grid remains subtle
* export includes correct background

---

# 36. TEST — PAPER

Same content.

Expected:

* warm canvas
* softer cards
* readable text
* semantic distinction without excessive saturation
* export works

---

# 37. GEOMETRY INVARIANCE TEST

For the same:

```text
document
+
layout
```

generate all four themes.

Expected:

```text
x identical
y identical
w identical
h identical
```

for every CanvasElement.

This is a critical Phase 8 test.

Theme must not modify layout geometry.

---

# 38. THEME SWITCH TEST

Generate:

```text
Concept Grid + Vibrant
```

Manually drag several cards.

Switch:

```text
Vibrant → Midnight
```

Expected:

```text
positions unchanged
sizes unchanged
rotations unchanged
content unchanged
theme colors change
```

---

# 39. MANUAL OVERRIDE TEST

Generate Vibrant.

Manually change one Definition card color.

Switch to Paper.

Expected:

```text
manually customized Definition card
→ keeps custom color

other cards
→ receive Paper theme
```

---

# 40. OLD PROJECT COMPATIBILITY

Load project JSON created before Phase 8.

Expected:

```text
missing themeId
→ vibrant
```

No crash.

No lost styling.

---

# 41. CUSTOM ELEMENT IMPORT

Explicit:

```json
{
  "elements": [...]
}
```

must remain compatible.

Do not forcibly recolor existing custom elements unless theme metadata explicitly indicates theme-driven styles.

Preserve imported styling.

---

# 42. THEME REGISTRY TEST

Verify exactly:

```text
vibrant
minimal
midnight
paper
```

are returned.

Registry order should be deterministic.

---

# 43. ACCESSIBILITY

Check text/background contrast for every semantic block across all themes.

Pay particular attention to:

```text
yellow interview cards
pink memory cards
dark code cards
Midnight muted text
```

Do not rely solely on hue to distinguish warning/definition/etc.

Block titles/icons/borders should provide additional semantics.

---

# 44. PERFORMANCE

Theme switching should be cheap.

It should NOT:

```text
normalize again
analyze again
recommend again
re-layout
re-measure
```

It should only resolve/update visual styling.

---

# 45. DOCUMENTATION

Create:

```text
docs/theme-engine.md
```

Document:

```text
theme architecture
ThemeId
theme tokens
semantic style resolution
compiler integration
manual override precedence
canvas styling
theme switching
export behavior
geometry invariance
```

---

# 46. VERIFY

Run:

```text
npx tsc --noEmit
npm run build
```

Run lint/tests if configured.

Manually verify all four themes.

---

# PHASE 8 DEFINITION OF DONE

Phase 8 is complete when:

1. `lib/engine/theme/` exists.
2. Theme responsibilities are isolated.
3. Exactly four themes exist.
4. Vibrant exists.
5. Minimal exists.
6. Midnight exists.
7. Paper exists.
8. Theme registry exists.
9. Semantic visual tokens exist.
10. Canvas tokens exist.
11. Compiler accepts explicit theme.
12. Default theme is Vibrant.
13. Existing compiler calls remain compatible.
14. Hardcoded semantic colors are removed from compiler.
15. Layout strategy remains independent of theme.
16. Recommendation remains independent of theme.
17. Theme does not change block geometry.
18. Theme does not trigger measurement.
19. Theme does not trigger layout.
20. Theme selector exists in generation flow.
21. Selected theme is used during generation.
22. Project/editor state stores themeId.
23. Old projects default safely.
24. Theme can be changed after generation.
25. Theme switching preserves manual positioning.
26. Theme switching preserves resizing.
27. Theme switching preserves rotation.
28. Theme switching preserves content.
29. Manual visual overrides take precedence.
30. Custom elements remain compatible.
31. Canvas background follows note theme.
32. Grid remains functional.
33. Exports reflect theme.
34. Midnight export has correct background.
35. Paper export has correct background.
36. Theme registry is deterministic.
37. Accessibility is checked.
38. Theme switching is inexpensive.
39. TypeScript passes.
40. Production build passes.

---

# DO NOT START PHASE 9

Do NOT implement:

```text
AI style generation
theme recommendation
custom theme builder
cloud persistence
authentication
sharing
billing
collaboration
```

When complete provide:

1. Theme directory tree
2. Files created
3. Files modified
4. Theme token model
5. Theme registry
6. Semantic style mapping
7. Compiler changes
8. Renderer changes
9. Canvas changes
10. Theme selector flow
11. Post-generation switching behavior
12. Manual override precedence
13. Geometry invariance result
14. Vibrant test
15. Minimal test
16. Midnight test
17. Paper test
18. Export test
19. Old-project compatibility test
20. Custom-elements compatibility test
21. Accessibility observations
22. Performance observations
23. TypeScript result
24. Production build result
25. Known limitations

Then STOP.
