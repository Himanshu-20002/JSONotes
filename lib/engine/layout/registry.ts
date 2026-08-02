import type { LayoutId, LayoutMetadata, LayoutStrategy } from "./types"
import { balancedLayoutStrategy } from "./strategies/balanced"
import { codeFocusLayoutStrategy } from "./strategies/code-focus"

const layoutRegistry: Record<LayoutId, LayoutStrategy> = {
  balanced: balancedLayoutStrategy,
  "code-focus": codeFocusLayoutStrategy,
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
