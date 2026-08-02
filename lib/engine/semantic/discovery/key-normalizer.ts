export function normalizeKey(key: string): string[] {
  if (!key) return []
  // Split camelCase, PascalCase, snake_case, kebab-case, and spaces
  const normalized = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .toLowerCase()
    .trim()

  return normalized.split(/\s+/).filter(Boolean)
}

export function humanizeKey(key: string): string {
  const tokens = normalizeKey(key)
  if (tokens.length === 0) return key
  return tokens
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(" ")
}
