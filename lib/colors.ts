import type { ColorKey } from "./types"

export interface Palette {
  key: ColorKey
  label: string
  meaning: string
  fill: string
  softFill: string
  border: string
  text: string
  accent: string
  chip: string
}

export const PALETTES: Record<ColorKey, Palette> = {
  slate: {
    key: "slate",
    label: "Slate",
    meaning: "Neutral",
    fill: "#1e293b",
    softFill: "#0f172a",
    border: "#334155",
    text: "#e2e8f0",
    accent: "#94a3b8",
    chip: "#334155",
  },
  blue: {
    key: "blue",
    label: "Blue",
    meaning: "Concept",
    fill: "#0b2447",
    softFill: "#0a1c38",
    border: "#2563eb",
    text: "#dbeafe",
    accent: "#60a5fa",
    chip: "#1d4ed8",
  },
  purple: {
    key: "purple",
    label: "Purple",
    meaning: "Closures",
    fill: "#2a1a4a",
    softFill: "#1e1236",
    border: "#7c3aed",
    text: "#ede9fe",
    accent: "#a78bfa",
    chip: "#6d28d9",
  },
  yellow: {
    key: "yellow",
    label: "Yellow",
    meaning: "Interview",
    fill: "#3a2f0b",
    softFill: "#2a2208",
    border: "#eab308",
    text: "#fef9c3",
    accent: "#facc15",
    chip: "#ca8a04",
  },
  green: {
    key: "green",
    label: "Green",
    meaning: "Correct",
    fill: "#0c2f22",
    softFill: "#08251a",
    border: "#16a34a",
    text: "#dcfce7",
    accent: "#4ade80",
    chip: "#15803d",
  },
  red: {
    key: "red",
    label: "Red",
    meaning: "Mistake",
    fill: "#3a1216",
    softFill: "#2a0d10",
    border: "#dc2626",
    text: "#fee2e2",
    accent: "#f87171",
    chip: "#b91c1c",
  },
  orange: {
    key: "orange",
    label: "Orange",
    meaning: "Warning",
    fill: "#3a2210",
    softFill: "#2a190b",
    border: "#ea580c",
    text: "#ffedd5",
    accent: "#fb923c",
    chip: "#c2410c",
  },
  pink: {
    key: "pink",
    label: "Pink",
    meaning: "Memory Trick",
    fill: "#3a1230",
    softFill: "#2a0d23",
    border: "#db2777",
    text: "#fce7f3",
    accent: "#f472b6",
    chip: "#be185d",
  },
  cyan: {
    key: "cyan",
    label: "Cyan",
    meaning: "Reference",
    fill: "#0a2f33",
    softFill: "#072428",
    border: "#0891b2",
    text: "#cffafe",
    accent: "#22d3ee",
    chip: "#0e7490",
  },
}

export const COLOR_KEYS = Object.keys(PALETTES) as ColorKey[]

export function palette(key: ColorKey): Palette {
  return PALETTES[key] ?? PALETTES.slate
}
