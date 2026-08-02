# JSONotes — Phase 2.5: Engine Structure Cleanup

Before implementing Phase 3, reorganize ONLY the JSONotes engine files so future layout/recommendation/theme modules have a clean architecture.

This is a structural refactor only.

DO NOT change application behavior, algorithms, measurements, generated CanvasElements, UI, or layout.

Current Phase 1 + Phase 2 functionality must remain identical.

## Target engine structure

Refactor toward:

```text id="rtky9a"
lib/
  engine/

    semantic/
      types.ts
      normalize.ts
      analyze.ts
      index.ts

    measurement/
      constants.ts
      types.ts
      measure-text.ts
      measure-list.ts
      measure-code.ts
      measure-block.ts
      index.ts

    compiler.ts

    index.ts
```

Future modules will later be added as:

```text id="hrfqud"
engine/
  layout/
  recommendation/
  themes/
```

Do NOT create those yet.

## Move semantic files

Move:

```text id="ol7rcf"
lib/engine/types.ts
```

to:

```text id="f9lk6r"
lib/engine/semantic/types.ts
```

Move:

```text id="22af7d"
lib/engine/normalize-content.ts
```

to:

```text id="97ch37"
lib/engine/semantic/normalize.ts
```

Move:

```text id="qln3de"
lib/engine/analyze-content.ts
```

to:

```text id="7wrsf3"
lib/engine/semantic/analyze.ts
```

Create:

```text id="p5v73m"
lib/engine/semantic/index.ts
```

that exports the semantic API.

Update imports throughout the project.

Do not duplicate files after migration unless required temporarily during the refactor.

## Move template compiler

Move:

```text id="u7fjqs"
lib/template-engine.ts
```

to:

```text id="6f10q7"
lib/engine/compiler.ts
```

This compiler belongs to the generation engine because it converts:

```text id="06xd2x"
SemanticDocument
+
measurement
↓
CanvasElement[]
```

Update all project imports referencing `template-engine.ts`.

Do NOT change the compiler algorithm.

Do NOT rename `compileTemplateStudyNotesV1()` yet unless there is a strong technical reason.

We are only moving its location.

## Keep measurement module

Keep:

```text id="e5zjnd"
lib/engine/measurement/
```

with its current implementation.

Do not modify measurement formulas.

Do not change min heights.

Do not change soft max heights.

Do not change overflow behavior.

## Engine barrel

Update:

```text id="2xmk8x"
lib/engine/index.ts
```

so consumers can import public engine APIs cleanly.

For example:

```ts id="i6rgt6"
export * from "./semantic"
export * from "./measurement"
export * from "./compiler"
```

Avoid circular imports.

Internal engine files should prefer direct relative imports when doing so prevents dependency cycles.

## Do NOT reorganize the rest of lib/

Do NOT move these files during this task:

```text id="t9x4cl"
lib/blocks.ts
lib/colors.ts
lib/export.ts
lib/highlight.tsx
lib/renderer-registry.ts
lib/store.ts
lib/templates.ts
lib/types.ts
lib/use-shortcuts.ts
lib/utils.ts
```

They can be reorganized separately later if needed.

This task is ONLY about establishing a clean engine boundary.

## Clean project documentation

Rename:

```text id="zdj1ql"
Documents/
```

to:

```text id="ym4pqh"
docs/
```

if this can be done safely without affecting application/runtime behavior.

Organize phase documents as:

```text id="0g6e4m"
docs/

  architecture.md

  json-conversion.md

  phases/
    phase-01-spec.md
    phase-01-walkthrough.md
    phase-02-spec.md
    phase-02-walkthrough.md
```

There currently appears to be both:

```text id="3k8hrx"
ARCHITECTURE.md
```

at root and another architecture document under Documents.

Inspect both.

If they are duplicates, keep ONE canonical:

```text id="wrdnvi"
docs/architecture.md
```

If they contain different useful information, merge them carefully before deleting the duplicate.

Documentation cleanup must not affect runtime code.

## Final expected relevant structure

```text id="o7n7m4"
lib/
  engine/

    semantic/
      types.ts
      normalize.ts
      analyze.ts
      index.ts

    measurement/
      constants.ts
      types.ts
      measure-text.ts
      measure-list.ts
      measure-code.ts
      measure-block.ts
      index.ts

    compiler.ts
    index.ts

  blocks.ts
  colors.ts
  export.ts
  highlight.tsx
  renderer-registry.ts
  store.ts
  templates.ts
  types.ts
  use-shortcuts.ts
  utils.ts
```

## Architecture boundary

After this refactor:

```text id="qsl8ms"
lib/engine/
```

owns:

```text id="50fl7r"
Content understanding
        ↓
Measurement
        ↓
Compilation
```

Future:

```text id="czgndv"
Content understanding
        ↓
Measurement
        ↓
Layout
        ↓
Recommendation
        ↓
Theme application
        ↓
Compilation
```

Do not put:

```text id="lfq2a4"
React components
Zustand state
dialogs
editor interactions
export UI
```

inside `lib/engine`.

## Compatibility requirements

After moving files, verify all existing functionality remains compatible:

* JSON import
* Markdown import
* normalizeContent()
* analyzeContent()
* measureBlock()
* dynamic block heights
* dynamic Y stacking
* custom `elements[]`
* CanvasElement generation
* Zustand
* canvas renderer
* drag
* resize
* editing
* exports

Do not change output intentionally.

## Verification

Run:

```text id="7otqrh"
npx tsc --noEmit
npm run build
```

Run tests/lint if configured.

Search the repository for stale imports referencing:

```text id="abnggx"
lib/template-engine
engine/types
engine/normalize-content
engine/analyze-content
```

Make sure imports point to the new locations.

Check for circular dependency problems.

## STOP CONDITION

This task is complete when:

1. Semantic logic lives under `engine/semantic/`.
2. Measurement logic remains under `engine/measurement/`.
3. Compiler lives under `engine/compiler.ts`.
4. Engine barrel exports work.
5. No duplicate old engine files remain unnecessarily.
6. Documentation has a consistent location.
7. No behavior has changed.
8. TypeScript passes.
9. Production build passes.

DO NOT start Phase 3.

At completion report:

* files moved
* files deleted
* imports updated
* documentation changes
* final directory tree
* TypeScript status
* build status
* any circular dependency/import issues found
