# JSONotes — Phase 1: Semantic Content Layer

We are improving the EXISTING JSONotes codebase incrementally. Do not create a separate V2 engine and do not rewrite the application.

## Current architecture

```text id="7p8mbp"
JSON / Markdown
      ↓
components/editor/import-modal.tsx
      ↓
lib/template-engine.ts
compileTemplateStudyNotesV1()
      ↓
CanvasElement[]
      ↓
lib/store.ts
      ↓
Existing Canvas
```

Currently `compileTemplateStudyNotesV1()` handles content normalization AND layout together.

Our goal in Phase 1 is to separate content understanding from visual layout.

## Target after Phase 1

```text id="juy12i"
JSON / Markdown
      ↓
Existing parser
      ↓
normalizeContent()
      ↓
SemanticDocument
      ↓
Existing template/layout logic
      ↓
CanvasElement[]
      ↓
Existing Zustand Store
      ↓
Existing Canvas
```

The application must remain working after this phase.

## 1. Inspect before modifying

Inspect the actual repository and locate:

* `components/editor/import-modal.tsx`
* `lib/template-engine.ts`
* `lib/store.ts`
* `StudyNotesContent`
* `CanvasElement`
* `compileTemplateStudyNotesV1`
* `uid()`
* Markdown parser
* Canvas renderer
* custom `elements[]` handling

Use the actual repository as source of truth.

Do not assume this prompt perfectly matches every implementation detail.

## 2. Create semantic engine files

Create:

```text id="5bk7h7"
lib/engine/
  types.ts
  normalize-content.ts
  analyze-content.ts
  index.ts
```

Do not reorganize unrelated files.

## 3. Create semantic types

Implement approximately:

```ts id="hp1vd4"
type SemanticBlockType =
  | "definition"
  | "concept"
  | "related"
  | "code"
  | "summary"
  | "interview"
  | "warning"
  | "memory"
  | "note";

interface SemanticBlock {
  id: string;

  type: SemanticBlockType;

  title?: string;

  content: unknown;

  importance: 1 | 2 | 3 | 4 | 5;

  density: "low" | "medium" | "high";

  preferredSize:
    | "small"
    | "medium"
    | "large"
    | "wide"
    | "tall";

  metadata?: {
    sourceField?: string;
    language?: string;
    itemCount?: number;
    codeLines?: number;
  };
}

interface SemanticDocument {
  title?: string;
  subtitle?: string;
  blocks: SemanticBlock[];
}
```

Adapt these types to the actual codebase where necessary.

IMPORTANT:

Semantic blocks must NOT contain:

```text id="xhhbr8"
x
y
w
h
column
color
fontSize
```

Those are layout/style concerns.

## 4. Implement normalizeContent()

Create:

```ts id="61fyh5"
normalizeContent(input): SemanticDocument
```

It must support the CURRENT JSON structure.

Map:

```text id="im0dkr"
definition → definition
concepts   → concept
related    → related
code       → code
summary    → summary
interview  → interview
warning    → warning
memory     → memory
notes      → note
```

Keep `title` and `subtitle` at document level.

Preserve existing flexible input behavior.

For example, continue supporting:

```json id="idcrmv"
"definition": "..."
```

and:

```json id="htxyf9"
"definition": {
  "title": "Custom title",
  "text": "..."
}
```

Continue supporting arrays containing strings or objects where currently supported.

For code, preserve:

```json id="abvv3v"
"code": "..."
```

and:

```json id="jyjrf2"
"code": {
  "language": "typescript",
  "code": "..."
}
```

Calculate simple metadata such as:

* item count
* code line count
* source field

Add simple block density classification using content length/item count.

Do not implement layout logic inside normalization.

## 5. Implement basic analyzeContent()

Implement:

```ts id="yq0g4d"
analyzeContent(document)
```

Return information approximately like:

```ts id="uf3bnj"
{
  blockCount,
  totalCharacters,
  codeBlocks,
  codeLines,
  conceptCount,
  listItems,
  warningCount,

  dominantContent:
    "code" | "concept" | "list" | "mixed",

  density:
    "low" | "medium" | "high" | "extreme"
}
```

Use deterministic heuristics.

Do NOT use AI.

IMPORTANT:

Analysis does NOT affect layout yet.

We are only preparing information for future phases.

## 6. Integrate SemanticDocument into existing compiler

Refactor the existing template compiler so the conceptual flow becomes:

```text id="o0d3yq"
raw content
    ↓
normalizeContent()
    ↓
SemanticDocument
    ↓
existing layout mapping
    ↓
CanvasElement[]
```

The existing visual layout should remain approximately unchanged.

Continue using the CURRENT:

* 2560×1440 canvas
* title/subtitle positions
* left/center/right columns
* existing fixed heights
* existing gaps
* existing colors
* existing CanvasElement types

DO NOT implement dynamic heights.

DO NOT implement dynamic columns.

DO NOT implement layout recommendations.

Those belong to later phases.

## 7. Preserve compatibility

Existing behavior must continue working.

Especially preserve:

* JSON import
* Markdown import
* string/object polymorphism
* arrays
* missing optional fields
* custom `elements[]` override
* Zustand CanvasElement state
* existing canvas renderer
* drag/edit behavior
* existing export behavior

If explicit `elements[]` currently bypass template generation, keep that path unchanged.

Do not force custom CanvasElements through SemanticDocument.

## 8. Keep the renderer contract

The final output of the compiler must still be:

```ts id="3zzl87"
CanvasElement[]
```

Do not rewrite the canvas renderer or Zustand architecture unnecessarily.

The semantic layer sits BEFORE CanvasElement generation.

## 9. Test

Test at least:

* definition-only JSON
* full current schema
* code-heavy JSON
* arrays/lists
* object-style definition/warning/etc.
* missing fields
* Markdown import
* custom `elements[]`

Use this existing-style input as one test:

```json id="3l7q04"
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
    "code": "useEffect(() => {\n const sub = api.subscribe();\n return () => sub.unsubscribe();\n}, []);"
  },
  "summary": [
    "Always specify dependency array",
    "Return cleanup functions for subscriptions"
  ]
}
```

Verify that its canvas output remains visually equivalent to the current implementation.

## 10. Verify build

Run the repository's available:

* TypeScript check
* lint
* tests
* production build

Fix errors caused by this implementation.

Do not perform unrelated refactors.

## STOP CONDITION

Phase 1 is complete when:

```text id="v3ojpp"
JSON
 ↓
normalizeContent()
 ↓
SemanticDocument
 ↓
existing layout compiler
 ↓
CanvasElement[]
 ↓
existing canvas
```

works correctly.

Do NOT proceed to:

* dynamic block heights
* smart positioning
* multiple layouts
* layout recommendations
* user preferences
* themes
* recommendation UI

Those are future phases.

At completion, STOP and provide:

1. Files created
2. Files modified
3. Architecture changes
4. Example `SemanticDocument`
5. Example `ContentAnalysis`
6. Compatibility checks performed
7. Build/test results
8. Any issues discovered
