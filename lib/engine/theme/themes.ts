import type { ThemeId, ThemeTokens } from "./types"
import { VIBRANT_THEME, MINIMAL_THEME, MIDNIGHT_THEME, PAPER_THEME } from "./tokens"

const THEME_REGISTRY: Record<ThemeId, ThemeTokens> = {
  vibrant: VIBRANT_THEME,
  minimal: MINIMAL_THEME,
  midnight: MIDNIGHT_THEME,
  paper: PAPER_THEME,
}

export function getTheme(id: ThemeId = "vibrant"): ThemeTokens {
  return THEME_REGISTRY[id] || VIBRANT_THEME
}

export function getAvailableThemes(): ThemeTokens[] {
  return [VIBRANT_THEME, MINIMAL_THEME, MIDNIGHT_THEME, PAPER_THEME]
}
