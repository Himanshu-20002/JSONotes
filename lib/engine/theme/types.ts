import type { SemanticBlockType } from "../semantic/types"

export type ThemeId = "vibrant" | "minimal" | "midnight" | "paper"

export interface SemanticVisualToken {
  background: string
  foreground: string
  border: string
  accent?: string
  titleColor?: string
}

export interface ThemeTokens {
  id: ThemeId
  name: string
  description: string
  canvas: {
    background: string
    grid: string
  }
  text: {
    primary: string
    secondary: string
    muted: string
  }
  surface: {
    default: string
    elevated: string
    subtle: string
  }
  border: {
    default: string
    strong: string
  }
  semantic: Record<SemanticBlockType, SemanticVisualToken>
}

export interface ResolvedStyle {
  bg: string
  color: string
  border: string
  accent?: string
  titleColor?: string
}
