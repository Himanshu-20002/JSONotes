# JSONotes — Layout Recommendation Engine Architecture

## Overview
The **JSONotes Layout Recommendation Engine** (`lib/engine/recommendation/`) provides intelligent, 100% deterministic strategy scoring and ranking.

Rather than relying purely on text keyword heuristics or static rules, the recommendation engine:
1. Builds a **`ContentProfile`** summarizing semantic characteristics.
2. Generates actual **`LayoutResult` candidates** across all four registered strategies (`balanced`, `code-focus`, `cheat-sheet`, `concept-grid`).
3. Evaluates candidates using **`ContentFit`**, **`GeometryFit`**, and **`Readability`** scoring signals.
4. Applies explicit penalties for **collisions** and **canvas vertical overflow**.
5. Computes a **confidence score** based on winner-to-runner-up separation.

---

## 🏗 Dataflow Architecture

```
                                  +-----------------------+
                                  |   SemanticDocument    |
                                  +-----------------------+
                                              |
                                              v
                                  +-----------------------+
                                  |  buildContentProfile  |
                                  +-----------------------+
                                              |
                                              v
                                  +-----------------------+
                                  | getAvailableLayouts() |
                                  +-----------------------+
                                     /    |       |    \
                                    v     v       v     v
                            ┌────────┐┌──────┐┌─────┐┌────────┐
                            │Balanced││CodeFoc││Cheat││ConceptG│
                            └────────┘└──────┘└─────┘└────────┘
                                     \    |       |    /
                                      v   v       v   v
                                  +-----------------------+
                                  |    scoreCandidate()   |
                                  | (Fit, Geometry, Read) |
                                  +-----------------------+
                                              |
                                              v
                                  +-----------------------+
                                  |  Tie-Break & Ranking  |
                                  +-----------------------+
                                              |
                                              v
                                  +-----------------------+
                                  | RecommendationResult  |
                                  +-----------------------+
```

---

## 🧮 Scoring Formulas & Weights

### 1. Weighted Base Score
$$\text{BaseScore} = (\text{ContentFit} \times 0.45) + (\text{GeometryFit} \times 0.35) + (\text{Readability} \times 0.20)$$

### 2. Penalties
- **Collision Penalty**: $-50$ points per overlapping card pair.
- **Overflow Penalty**: $-25$ base penalty $+ 0.1 \times (\text{overflowPixels})$.

### 3. Final Clamped Score
$$\text{FinalScore} = \max(0, \min(100, \text{BaseScore} - \text{OverflowPenalty} - \text{CollisionPenalty}))$$

---

## 📊 Confidence Calculation
Confidence reflects how clearly the winning strategy outperforms runner-up alternatives:
$$\text{Confidence} = \min\left(100, \max\left(10, 50 + 2.5 \times (\text{WinnerScore} - \text{RunnerUpScore})\right)\right)$$

- **High Confidence ($>80\%$)**: Clear dominant winner (e.g. 30-line code snippet $\rightarrow$ Code Focus).
- **Low/Moderate Confidence ($50-60\%$)**: Multiple layouts fit similarly (e.g. short 2-block minimal note).

---

## 📚 API Usage

```typescript
import { recommendLayout, normalizeContent, analyzeContent } from "@/lib/engine"

const semDoc = normalizeContent(rawJsonPayload)
const analysis = analyzeContent(semDoc)

const result = recommendLayout(semDoc, analysis)

console.log(`Recommended Strategy: ${result.recommendedLayout}`)
console.log(`Confidence: ${result.confidence}%`)
console.log(`Top Reason: ${result.reasons[0].message}`)
```
