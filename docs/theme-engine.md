# JSONotes — Visual Style & Theme Engine Architecture

## Overview
**Phase 8** introduces an independent, modular **Visual Style & Theme Engine** in `lib/engine/theme/` that decouples content meaning (`semantic`) and layout positioning (`layout`) from visual aesthetics (`theme`).

---

## 🏗 Architecture & Separation of Responsibilities

```
                                  Semantic Content
                                         │
                                         ▼
                                   Layout Engine
                                (Positioned Blocks)
                                         │
                                         ▼
                                   Theme Engine
                              (Tokens & Semantic Style)
                                         │
                                         ▼
                                  Compiler Module
                                         │
                                         ▼
                                  CanvasElement[]
                                         │
                                         ▼
                                   React Renderer
```

---

## 🎨 Implemented Themes

| Theme ID | Name | Description | Key Aesthetics |
| :--- | :--- | :--- | :--- |
| **`vibrant`** | Vibrant | Colorful cards & rich educational contrast | High visual energy, distinct hues per semantic block |
| **`minimal`** | Minimal | Clean neutral surfaces with subtle accents | Quiet dark surfaces with accent borders |
| **`midnight`** | Midnight | Deep dark developer theme | Slate-950 canvas with high contrast neon text |
| **`paper`** | Paper | Warm off-white surface with ink typography | Warm off-white canvas with dark charcoal ink cards |

---

## 📐 Geometry Invariance Principle
Themes modify **only** visual properties (background, color, border, title accent).
Themes **never** alter element positions ($x, y$), dimensions ($w, h$), column counts, or layout strategy geometry.
All layout options remain 100% geometry-invariant across all 4 themes.

---

## 🎛 Post-Generation Theme Switching
Users can switch note themes dynamically via the top toolbar dropdown without re-running layout strategy algorithms or changing card positions.
If a block has a `_manualColorOverride`, manual user customization takes precedence over theme switching.
