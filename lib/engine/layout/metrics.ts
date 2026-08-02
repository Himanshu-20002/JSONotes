import type { PositionedBlock, LayoutMetrics, LayoutRect } from "./types"

export function calculateMetrics(
  blocks: PositionedBlock[],
  columnBottoms: number[],
  contentRegion: LayoutRect,
  collisionCount: number,
  overflowCount: number
): LayoutMetrics {
  // Used Height relative to content start
  const maxBottom = columnBottoms.length > 0 ? Math.max(...columnBottoms) : contentRegion.y
  const usedHeight = Math.max(0, maxBottom - contentRegion.y)

  // Used Area Ratio
  const totalBlockArea = blocks.reduce((acc, b) => acc + b.width * b.height, 0)
  const regionArea = contentRegion.width * contentRegion.height
  const usedAreaRatio = regionArea > 0 ? Number((totalBlockArea / regionArea).toFixed(3)) : 0

  // Column Imbalance (Standard Deviation of Column Bottoms)
  let columnImbalance = 0
  if (columnBottoms.length > 1) {
    const avg = columnBottoms.reduce((a, b) => a + b, 0) / columnBottoms.length
    const variance = columnBottoms.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / columnBottoms.length
    columnImbalance = Number(Math.sqrt(variance).toFixed(1))
  }

  return {
    usedHeight,
    usedAreaRatio,
    columnImbalance,
    overflowCount,
    collisionCount,
  }
}
