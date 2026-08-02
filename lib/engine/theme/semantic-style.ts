import type { SemanticBlock } from "../semantic/types"
import type { ResolvedStyle, ThemeId } from "./types"
import { getTheme } from "./themes"

export function resolveSemanticStyle(block: SemanticBlock, themeId: ThemeId = "vibrant"): ResolvedStyle {
  const theme = getTheme(themeId)
  const token = theme.semantic[block.type] || theme.semantic.note

  return {
    bg: token.background,
    color: token.foreground,
    border: token.border,
    accent: token.accent,
    titleColor: token.titleColor,
  }
}
