import type { LayoutId, LayoutMetadata, LayoutStrategy } from "./types"
import { balancedLayoutStrategy } from "./strategies/balanced"
import { codeFocusLayoutStrategy } from "./strategies/code-focus"
import { cheatSheetLayoutStrategy } from "./strategies/cheat-sheet"
import { conceptGridLayoutStrategy } from "./strategies/concept-grid"

const layoutRegistry: Record<LayoutId, LayoutStrategy> = {
  balanced: balancedLayoutStrategy,
  "code-focus": codeFocusLayoutStrategy,
  "cheat-sheet": cheatSheetLayoutStrategy,
  "concept-grid": conceptGridLayoutStrategy,
}

export function getLayoutStrategy(id?: string): LayoutStrategy {
  if (id && id in layoutRegistry) {
    return layoutRegistry[id as LayoutId]
  }
  // Safe fallback to default Balanced Strategy
  return layoutRegistry.balanced
}

export function getAvailableLayouts(): LayoutMetadata[] {
  return Object.values(layoutRegistry).map((strategy) => strategy.metadata)
}
