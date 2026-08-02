# JSONotes — Phase 6: Intelligent Layout Recommendation & Scoring Engine

Phases 1–5 are complete.

JSONotes currently supports four working layout strategies:

```text
balanced
code-focus
cheat-sheet
concept-grid
```

All strategies implement the common `LayoutStrategy` contract and produce a standardized `LayoutResult`.

Current architecture:

```text
JSON / Markdown
      ↓
normalizeContent()
      ↓
SemanticDocument
      ↓
analyzeContent()
      ↓
LayoutStrategy
      ↓
LayoutResult
      ↓
compiler.ts
      ↓
CanvasElement[]
```

Phase 6 introduces an independent **Layout Recommendation Engine**.

The engine must analyze the user's semantic content AND evaluate actual candidate layout results before recommending a strategy.

Do NOT build recommendation UI in this phase.

---

# PRIMARY OBJECTIVE

Given one `SemanticDocument`, evaluate all implemented layout strategies:

```text
Balanced
Code Focus
Cheat Sheet
Concept Grid
```

and return a ranked recommendation.

Conceptually:

```text
SemanticDocument
       +
ContentAnalysis
       ↓
┌─────────────────────────────────────┐
│ Candidate Generation                │
│                                     │
│ Balanced      → LayoutResult        │
│ Code Focus    → LayoutResult        │
│ Cheat Sheet   → LayoutResult        │
│ Concept Grid  → LayoutResult        │
└─────────────────────────────────────┘
                 ↓
         Candidate Evaluation
                 ↓
        ┌─────────────────┐
        │ Content Fit     │
        │ Geometry Fit    │
        │ Readability     │
        │ Overflow        │
        │ Collision       │
        │ Density         │
        │ Balance         │
        └─────────────────┘
                 ↓
           Weighted Score
                 ↓
              Ranking
                 ↓
       RecommendationResult
```

The recommendation engine must remain deterministic.

---

# 1. INSPECT EXISTING ENGINE

Before modifying anything inspect:

```text
lib/engine/semantic/
lib/engine/measurement/
lib/engine/layout/
lib/engine/layout/strategies/
lib/engine/layout/registry.ts
lib/engine/layout/types.ts
lib/engine/compiler.ts
```

Understand the actual current contracts.

Reuse existing:

```text
ContentAnalysis
LayoutMetadata
LayoutResult
LayoutMetrics
LayoutId
getAvailableLayouts()
getLayoutStrategy()
```

Do not duplicate them unnecessarily.

---

# 2. CREATE RECOMMENDATION MODULE

Create:

```text
lib/engine/recommendation/
├── types.ts
├── constants.ts
├── content-fit.ts
├── geometry-fit.ts
├── score-candidate.ts
├── recommend-layout.ts
└── index.ts
```

Then export the recommendation module from:

```text
lib/engine/index.ts
```

Keep this module independent from React/Zustand.

---

# 3. RESPONSIBILITY BOUNDARY

Maintain:

```text
semantic/
What does the content contain?

measurement/
How much space does each block require?

layout/
How can the content be arranged?

recommendation/
Which layout is best for this document?

compiler/
Compile the chosen strategy into CanvasElement[]
```

Recommendation must NOT modify CanvasElements or editor state.

---

# 4. RECOMMENDATION TYPES

Create types approximately like:

```ts
export interface ScoreBreakdown {
  contentFit: number
  geometryFit: number
  readability: number

  overflowPenalty: number
  collisionPenalty: number

  total: number
}

export interface RecommendationReason {
  code: string
  message: string
  impact: "positive" | "negative" | "neutral"
}

export interface LayoutCandidateEvaluation {
  layoutId: LayoutId

  score: number

  breakdown: ScoreBreakdown

  reasons: RecommendationReason[]

  layoutResult: LayoutResult
}

export interface RecommendationResult {
  recommendedLayout: LayoutId

  confidence: number

  candidates: LayoutCandidateEvaluation[]

  reasons: RecommendationReason[]
}
```

Adapt names to existing conventions if necessary.

Keep candidate scores normalized.

Recommended public score range:

```text
0–100
```

---

# 5. DO NOT USE RANDOM CONFIDENCE

`confidence` must NOT simply equal:

```text
winningScore / 100
```

Confidence should represent how clearly the winner beats alternatives.

Use ranking separation.

For example:

```text
winner = 91
runner-up = 89
```

should have LOW/MODERATE confidence.

Whereas:

```text
winner = 92
runner-up = 67
```

should have HIGH confidence.

Implement a deterministic normalized confidence calculation based primarily on:

```text
winnerScore - runnerUpScore
```

Optionally combine with absolute winner quality.

Keep confidence:

```text
0–1
```

or:

```text
0–100
```

but document which convention is used.

---

# 6. CANDIDATE GENERATION

`recommendLayout()` should evaluate every registered strategy.

Conceptually:

```ts
const layouts = getAvailableLayouts()

for each layout:
    const strategy = getLayoutStrategy(layout.id)

    const result = strategy.createLayout(
        document,
        context
    )

    evaluate result
```

Do not hardcode a separate list of four layout IDs inside the recommendation engine if the registry can provide them.

Registry remains source of truth.

---

# 7. IMPORTANT — ACTUAL LAYOUT RESULTS

Do NOT recommend layouts using content heuristics alone.

Every candidate must actually run:

```text
strategy.createLayout()
```

and produce a real:

```text
LayoutResult
```

Then score that result.

This allows recommendation to consider:

```text
overflow
collisions
used height
used area
balance
actual geometry
```

---

# 8. CONTENT PROFILE

Build a lightweight content profile from:

```text
SemanticDocument
+
ContentAnalysis
```

It may contain:

```ts
interface ContentProfile {
  blockCount: number

  codeBlockCount: number
  totalCodeLines: number
  codeRatio: number

  listBlockCount: number
  totalListItems: number

  conceptualBlockCount: number

  highImportanceBlockCount: number

  averageDensity: number

  dominantContent: ...
}
```

Do not duplicate metrics already exposed by `ContentAnalysis`.

Extend/reuse where appropriate.

---

# 9. CONTENT FIT SCORE

Create:

```text
content-fit.ts
```

This answers:

> How semantically appropriate is this layout for this document?

Return normalized:

```text
0–100
```

Do NOT create one giant nested `if` statement.

Use explicit weighted signals.

---

# 10. BALANCED CONTENT FIT

Balanced should score well for:

```text
mixed content
no dominant semantic category
medium block counts
mixed text + lists + code
```

Balanced should generally be the safest baseline.

It should not receive huge bonuses or penalties.

Balanced acts as the general-purpose layout.

---

# 11. CODE FOCUS CONTENT FIT

Positive signals:

```text
code exists
high code ratio
many code lines
code block has high importance
technical content
```

Negative signals:

```text
no code
very little code
large number of non-code conceptual cards
```

Example conceptually:

```text
30-line code
+
short definition
+
short summary

→ strong Code Focus content fit
```

But content fit alone must NOT guarantee recommendation.

Geometry still matters.

---

# 12. CHEAT SHEET CONTENT FIT

Positive signals:

```text
many blocks
many short blocks
many list items
high information density
revision-oriented structures
warnings
memory tricks
interview tips
summary
```

Negative signals:

```text
few blocks
very verbose paragraphs
huge code blocks
```

Cheat Sheet should score well when many compact facts need to fit into a quick-reference layout.

---

# 13. CONCEPT GRID CONTENT FIT

Positive signals:

```text
definition
concepts
summary
related topics
memory
medium block count
low/medium code ratio
conceptual dominance
```

Negative signals:

```text
very large code
extremely dense content
few conceptual blocks
```

---

# 14. AVOID KEYWORD-BASED SUBJECT GUESSING

Do NOT score based on brittle text keyword checks such as:

```text
if title includes "JavaScript"
```

or:

```text
if text includes "interview"
```

Use semantic structure and metrics.

JSONotes should work for:

```text
programming
biology
history
finance
law
chemistry
languages
etc.
```

---

# 15. GEOMETRY FIT

Create:

```text
geometry-fit.ts
```

This answers:

> How successfully did this strategy arrange this specific document?

Use actual:

```text
LayoutResult
```

metrics.

Potential signals:

```text
overflow
collision count
used height
used area ratio
column imbalance
```

Add only metrics that can be calculated reliably.

---

# 16. COLLISION PENALTY

Collision should be extremely expensive.

Example:

```text
0 collisions
→ no penalty

1 collision
→ major penalty

multiple collisions
→ candidate effectively disqualified
```

A layout with overlapping cards should almost never win.

Prefer a strong penalty rather than silently clamping its score.

---

# 17. OVERFLOW PENALTY

Overflow should be penalized strongly but less catastrophically than collision.

Consider not only:

```text
hasOverflow
```

but overflow severity if available.

Example:

```text
20px overflow
```

should be less severe than:

```text
800px overflow
```

If current metrics do not expose overflow amount, add a strategy-neutral metric such as:

```text
overflowPixels
```

or:

```text
overflowRatio
```

to layout metrics/validation.

Preserve existing strategy compatibility.

---

# 18. USED HEIGHT SIGNAL

For wallpaper-style notes, lower used height can be useful when all content remains readable.

However:

DO NOT blindly reward the shortest layout.

A layout should not win simply because it compresses everything aggressively.

Use this as a modest geometry signal.

---

# 19. USED AREA RATIO

Use:

```text
usedAreaRatio
```

carefully.

Extremely low:

```text
0.15
```

may indicate wasted canvas.

Extremely high:

```text
0.98+
```

may indicate cramped content.

Prefer a reasonable middle/high utilization band rather than simply maximizing area.

Example target band could initially be:

```text
0.45 – 0.82
```

Tune based on actual fixtures.

Do not hardcode this blindly without documenting it.

---

# 20. COLUMN IMBALANCE

Use:

```text
columnImbalance
```

as a small/moderate signal for layouts where it is meaningful.

Do NOT let this dominate scoring.

Concept Grid and Code Focus have intentionally asymmetric geometry.

If the current metric is not comparable across strategies, normalize it or reduce its weight.

---

# 21. READABILITY SCORE

Introduce a simple deterministic readability score.

Possible signals:

```text
very narrow cards
excessively wide text cards
extreme card heights
dense layout utilization
large code readability
```

Do NOT use DOM rendering or browser screenshots.

Use geometry + semantic metadata.

Example:

A definition paragraph rendered at:

```text
2200px wide
```

may be less readable than at a moderate width.

Likewise:

```text
300px wide
```

may wrap excessively.

Create strategy-neutral width/readability heuristics.

---

# 22. SEMANTIC WIDTH PREFERENCES

Different semantic types can have different comfortable widths.

Examples:

```text
code
→ benefits from wider cards

definition
→ moderate width

concept/list
→ moderate width

memory/warning
→ can tolerate smaller cards
```

Use broad ranges.

Do not create pixel-perfect hardcoded rules for every semantic type.

The purpose is to detect obviously poor geometry.

---

# 23. SCORE WEIGHTS

Start with explicit centralized weights.

For example:

```ts
export const RECOMMENDATION_WEIGHTS = {
  contentFit: 0.45,
  geometryFit: 0.35,
  readability: 0.20
}
```

Then apply penalties separately:

```text
overflow penalty
collision penalty
```

This is an initial calibration, not permanent truth.

Put weights in:

```text
recommendation/constants.ts
```

Do not scatter numbers across files.

---

# 24. SCORE FORMULA

Use a transparent formula approximately like:

```text
baseScore =
    contentFit * 0.45
  + geometryFit * 0.35
  + readability * 0.20

finalScore =
    baseScore
  - overflowPenalty
  - collisionPenalty
```

Clamp:

```text
0–100
```

Keep breakdown values accessible.

This transparency will be valuable later for debugging and product explanations.

---

# 25. TIE BREAKING

Recommendation must be deterministic.

If two candidates have identical or near-identical scores, define stable tie-breaking.

Recommended priority:

```text
higher final score
↓
fewer collisions
↓
less overflow
↓
higher readability
↓
higher content fit
↓
stable registry order
```

Do NOT randomize.

---

# 26. REASONS

Every candidate should produce human-readable reasons.

Examples:

```text
"Large code block benefits from a wider code region."

"Many short revision blocks fit the compact Cheat Sheet structure."

"Concept-heavy content maps well to paired knowledge cards."

"Layout exceeds the canvas height by 312px."

"Very low canvas utilization leaves significant unused space."
```

Reasons must come from actual scoring signals.

Do NOT use AI-generated explanations.

---

# 27. WINNER REASONS

`RecommendationResult.reasons` should contain approximately the top 2–4 reasons explaining the winner.

Do not dump every internal score signal.

Later UI should be able to show:

```text
Recommended: Concept Grid

Why:
• Your note is concept-heavy.
• Definitions and summaries fit well into paired cards.
• This layout uses the canvas efficiently without overflow.
```

---

# 28. CANDIDATE BREAKDOWN

For debugging/product UI later, preserve detailed breakdown:

```text
Balanced
score: 78

contentFit: 82
geometryFit: 76
readability: 74
overflowPenalty: 0
collisionPenalty: 0
```

etc.

Do not only return the winner.

---

# 29. COMPILER MUST REMAIN SEPARATE

Do NOT automatically make:

```text
compileTemplateStudyNotesV1()
```

run recommendations by default.

Current behavior:

```text
compile(...)
→ Balanced
```

must remain compatible.

Recommendation should be an explicit engine capability.

For example:

```ts
recommendLayout(content)
```

or preferably:

```ts
recommendLayout(document, analysis)
```

depending on architecture.

Do not introduce hidden expensive evaluation into every compile operation.

---

# 30. OPTIONAL HIGH-LEVEL API

If useful, expose a high-level helper:

```ts
analyzeAndRecommend(content)
```

which performs:

```text
normalize
analyze
recommend
```

But keep lower-level functions available.

Avoid duplicated normalization.

---

# 31. CANDIDATE LAYOUT REUSE

Recommendation already generates four:

```text
LayoutResult
```

objects.

Do not throw them away unnecessarily.

Return them inside candidate evaluations.

Later the UI can use them for instant previews/switching.

This will also avoid regenerating the winner immediately.

---

# 32. PERFORMANCE

There are only four layouts, so evaluating all four is acceptable.

However:

* avoid repeated normalization
* avoid repeated content analysis
* avoid unnecessary deep cloning
* avoid repeated work inside the same recommendation run where practical

Do not introduce workers/caching yet unless actually necessary.

---

# 33. NO AI / NETWORK

Phase 6 must be:

```text
100% local
deterministic
synchronous unless architecture requires otherwise
```

Do NOT call:

```text
OpenAI
Gemini
Claude
external APIs
```

The recommendation engine should work offline.

---

# 34. TEST — CODE HEAVY

Fixture:

```text
definition
concepts
30-line code
short summary
warning
```

Expected:

```text
Code Focus
```

should generally rank first IF its geometry is healthy.

Required reasons should mention code dominance/size and successful layout geometry.

---

# 35. TEST — INTERVIEW CHEAT SHEET

Fixture:

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

with mostly short content.

Expected:

```text
Cheat Sheet
```

should generally rank highly/first.

---

# 36. TEST — CONCEPTUAL

Fixture:

```text
definition
concepts
summary
related
memory
```

with little/no code.

Expected:

```text
Concept Grid
```

should generally rank highly/first.

---

# 37. TEST — MIXED GENERAL NOTES

Fixture:

```text
definition
concepts
moderate code
summary
warning
related
```

Expected:

```text
Balanced
```

should remain competitive and may win when there is no strong specialized signal.

---

# 38. TEST — MINIMAL

Fixture:

```json
{
  "title": "REST",
  "definition": "An architectural style."
}
```

Expected:

* no crash
* sensible recommendation
* specialized strategies should not receive unjustified huge bonuses
* confidence may be low because multiple layouts work similarly

Low confidence is GOOD here.

Do not artificially force confidence.

---

# 39. TEST — EXTREME CONTENT

Create content that causes some/all strategies to overflow.

Expected:

* overflow penalties applied
* least-bad candidate can still win
* no NaN
* no crashes
* content preserved

If every layout overflows, recommendation should still return a winner but reasons should acknowledge overflow.

---

# 40. TEST — GEOMETRY OVERRIDES SEMANTIC FIT

Create a fixture where semantic signals favor Cheat Sheet but Cheat Sheet produces severe overflow while Balanced fits cleanly.

Expected:

Balanced should be capable of winning.

This proves recommendation is not simply semantic classification.

---

# 41. TEST — COLLISION DISQUALIFICATION

If practical, inject/mock a candidate `LayoutResult` with collision(s).

Verify collision penalty makes it rank below healthy candidates.

Do not intentionally break a real layout strategy just to create the fixture.

---

# 42. TEST — CONFIDENCE

Test:

```text
Winner 90
Runner-up 89
```

Expected:

low confidence.

Test:

```text
Winner 92
Runner-up 60
```

Expected:

high confidence.

Do not tie confidence directly to winner score.

---

# 43. TEST — DETERMINISM

Run the same recommendation multiple times.

Expected:

```text
same ranking
same scores
same reasons
same confidence
```

No random values.

---

# 44. TEST — ALL CANDIDATES RETURNED

Verify result includes evaluations for exactly the four registered layouts:

```text
balanced
code-focus
cheat-sheet
concept-grid
```

Do not hardcode this assertion if registry-driven testing is possible.

---

# 45. DEVELOPMENT DIAGNOSTICS

In development, make it easy to inspect:

```text
Content Profile

Balanced
  content fit
  geometry
  readability
  penalties
  final

Code Focus
  ...

Cheat Sheet
  ...

Concept Grid
  ...

Winner
Confidence
Reasons
```

Do not spam production console.

A pure formatting/debug helper is acceptable.

---

# 46. DOCUMENT SCORING

Create documentation:

```text
docs/recommendation-engine.md
```

Document:

```text
inputs
candidate generation
content-fit signals
geometry signals
readability
weights
penalties
confidence
tie breaking
known limitations
```

This will be important when tuning recommendations later.

---

# 47. VERIFY

Run:

```text
npx tsc --noEmit
npm run build
```

Run configured tests/lint if available.

---

# PHASE 6 DEFINITION OF DONE

Phase 6 is complete when:

1. `lib/engine/recommendation/` exists.
2. Recommendation engine evaluates registered strategies.
3. Every candidate generates a real LayoutResult.
4. Content profile exists.
5. Content-fit scoring exists.
6. Geometry-fit scoring exists.
7. Readability scoring exists.
8. Overflow is penalized.
9. Overflow severity is considered where possible.
10. Collisions receive a major penalty.
11. Scores normalize to 0–100.
12. Score weights are centralized.
13. Candidate score breakdown is exposed.
14. Human-readable reasons are exposed.
15. Winner reasons are exposed.
16. Confidence reflects winner-vs-runner-up separation.
17. All candidates are returned.
18. Candidate LayoutResults are retained.
19. Tie-breaking is deterministic.
20. Recommendation does not depend on text keywords.
21. Recommendation does not use AI/network calls.
22. Compiler default behavior remains unchanged.
23. Balanced remains compiler default.
24. Code-heavy fixture favors Code Focus when geometry is healthy.
25. Dense short-fact fixture favors Cheat Sheet when geometry is healthy.
26. Conceptual fixture favors Concept Grid when geometry is healthy.
27. Mixed fixture keeps Balanced competitive.
28. Geometry can override semantic preference.
29. Minimal fixture can produce low confidence.
30. Extreme content is handled safely.
31. Recommendation is deterministic.
32. Existing four layout strategies remain unchanged unless a genuine shared metric issue requires a compatible fix.
33. TypeScript passes.
34. Production build passes.
35. Recommendation architecture is documented.

---

# DO NOT START PHASE 7

Do NOT implement:

```text
layout recommendation UI
layout picker
preview thumbnails
user preference controls
themes
AI
accounts
database
sharing
```

When complete provide:

1. Recommendation directory tree
2. Files created
3. Files modified
4. ContentProfile definition
5. Scoring formula
6. Content-fit rules
7. Geometry-fit rules
8. Readability rules
9. Overflow penalty formula
10. Collision penalty formula
11. Confidence formula
12. Tie-breaking rules
13. Example ranking for each major fixture
14. Geometry-overrides-content test result
15. Minimal-content confidence result
16. Extreme-content result
17. Determinism result
18. Performance observations
19. TypeScript result
20. Production build result
21. Known limitations

Then STOP.
