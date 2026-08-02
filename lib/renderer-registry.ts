"use client"

import React from "react"
import type { CanvasElement } from "@/lib/types"

export interface BlockComponentProps {
  el: CanvasElement
  editing: boolean
  onChange: (patch: Partial<CanvasElement>) => void
  onStopEditing: () => void
}

export type BlockComponent = React.ComponentType<BlockComponentProps>

// Registry map: block type -> React component
const blockRegistry: Map<string, BlockComponent> = new Map()

export function registerBlockComponent(type: string, component: BlockComponent) {
  blockRegistry.set(type, component)
}

export function getBlockComponent(type: string): BlockComponent | undefined {
  return blockRegistry.get(type)
}

export function getAllRegisteredBlockTypes(): string[] {
  return Array.from(blockRegistry.keys())
}
