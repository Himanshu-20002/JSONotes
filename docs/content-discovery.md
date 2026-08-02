# JSONotes — Schema-Agnostic Content Discovery Engine Architecture

## Overview
**Phase 9** implements an offline, 100% deterministic **Schema-Agnostic Content Discovery Engine** in `lib/engine/semantic/discovery/`.

The Discovery Engine allows JSONotes to process arbitrary, un-annotated JSON payloads (e.g. `"topic"`, `"explanation"`, `"exampleCode"`, `"thingsToAvoid"`) without requiring users to manually rename keys to JSONotes-specific field names.

---

## 🏗 Discovery Pipeline & Architecture

```
                                  Raw Input JSON
                                         │
                                         ▼
                           Known JSONotes Schema Detection
                                         │
                                 ┌───────┴───────┐
                                 │               │
                           Known Fields    Unknown Fields
                           (Fast Path)           │
                                 │               ▼
                                 │      discoverFields()
                                 │    (Flatten & Bounded Depth)
                                 │               │
                                 │               ▼
                                 │    extractFieldSignals()
                                 │  (Token, ValueShape, Code)
                                 │               │
                                 │               ▼
                                 │      classifyField()
                                 │   (Alias Dict & Scoring)
                                 │               │
                                 └───────┬───────┘
                                         │
                                         ▼
                                  SemanticDocument
                                         │
                                         ▼
                             Phase 2–8 Engine Pipeline
```

---

## 🧮 Classification Scoring & Confidence Thresholds
- **Explicit Known Fields**: Handled via high-confidence fast-path (`definition`, `concepts`, `code`, `summary`, `interview`, `warning`, `memory`, `notes`).
- **Discovered Fields**: Evaluated against central alias dictionary (`aliases.ts`), value shapes, line counts, and code syntax signals.
  - $\text{Confidence} \ge 0.60$: Mapped to appropriate `SemanticBlockType` (`definition`, `concept`, `code`, `warning`, etc.).
  - $\text{Confidence} < 0.60$: Mapped safely to `generic` semantic block (no false positive forcing or data loss).

---

## 🛡 Key Safety & Format Guarantees
1. **Safety Limits**: Bounded depth (`MAX_DISCOVERY_DEPTH = 6`), max fields (`100`), and array limits (`50`) prevent browser freezing or stack overflow.
2. **Format Protection**: Objects and Object-Arrays are cleanly formatted (`formatObjectContent`), eliminating `[object Object]` stringification artifacts.
3. **Determinism**: 100% deterministic local classification (zero AI dependencies, zero network requests).
