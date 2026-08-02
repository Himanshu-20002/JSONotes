import type { ThemeTokens } from "./types"

export const VIBRANT_THEME: ThemeTokens = {
  id: "vibrant",
  name: "Vibrant",
  description: "Colorful cards & rich educational contrast",
  canvas: {
    background: "#0f172a", // slate-900
    grid: "rgba(255, 255, 255, 0.05)",
  },
  text: {
    primary: "#f8fafc",
    secondary: "#94a3b8",
    muted: "#64748b",
  },
  surface: {
    default: "#1e293b",
    elevated: "#334155",
    subtle: "#0f172a",
  },
  border: {
    default: "rgba(255, 255, 255, 0.1)",
    strong: "rgba(255, 255, 255, 0.2)",
  },
  semantic: {
    definition: { background: "#1e3a8a", foreground: "#eff6ff", border: "#3b82f6", titleColor: "#93c5fd" }, // blue
    concept: { background: "#4c1d95", foreground: "#f5f3ff", border: "#8b5cf6", titleColor: "#c4b5fd" }, // purple
    code: { background: "#020617", foreground: "#f8fafc", border: "#334155", titleColor: "#38bdf8" }, // dark slate
    summary: { background: "#14532d", foreground: "#f0fdf4", border: "#22c55e", titleColor: "#86efac" }, // green
    warning: { background: "#7f1d1d", foreground: "#fef2f2", border: "#ef4444", titleColor: "#fca5a5" }, // red
    interview: { background: "#713f12", foreground: "#fefce8", border: "#eab308", titleColor: "#fde047" }, // yellow
    memory: { background: "#831843", foreground: "#fdf2f8", border: "#ec4899", titleColor: "#f9a8d4" }, // pink
    related: { background: "#164e63", foreground: "#ecfeff", border: "#06b6d4", titleColor: "#67e8f9" }, // cyan
    note: { background: "#334155", foreground: "#f8fafc", border: "#64748b", titleColor: "#cbd5e1" }, // slate
    generic: { background: "#1e293b", foreground: "#f8fafc", border: "#475569", titleColor: "#cbd5e1" },
  },
}

export const MINIMAL_THEME: ThemeTokens = {
  id: "minimal",
  name: "Minimal",
  description: "Clean neutral surfaces with subtle accents",
  canvas: {
    background: "#090d16",
    grid: "rgba(255, 255, 255, 0.03)",
  },
  text: {
    primary: "#f1f5f9",
    secondary: "#94a3b8",
    muted: "#64748b",
  },
  surface: {
    default: "#111827",
    elevated: "#1f2937",
    subtle: "#0b0f19",
  },
  border: {
    default: "rgba(255, 255, 255, 0.08)",
    strong: "rgba(255, 255, 255, 0.15)",
  },
  semantic: {
    definition: { background: "#111827", foreground: "#f8fafc", border: "#3b82f6", titleColor: "#60a5fa" },
    concept: { background: "#111827", foreground: "#f8fafc", border: "#8b5cf6", titleColor: "#a78bfa" },
    code: { background: "#050811", foreground: "#f8fafc", border: "#334155", titleColor: "#38bdf8" },
    summary: { background: "#111827", foreground: "#f8fafc", border: "#22c55e", titleColor: "#4ade80" },
    warning: { background: "#181014", foreground: "#f8fafc", border: "#ef4444", titleColor: "#f87171" },
    interview: { background: "#111827", foreground: "#f8fafc", border: "#eab308", titleColor: "#facc15" },
    memory: { background: "#111827", foreground: "#f8fafc", border: "#ec4899", titleColor: "#f472b6" },
    related: { background: "#111827", foreground: "#f8fafc", border: "#06b6d4", titleColor: "#22d3ee" },
    note: { background: "#111827", foreground: "#f8fafc", border: "#475569", titleColor: "#94a3b8" },
    generic: { background: "#111827", foreground: "#f8fafc", border: "#334155", titleColor: "#94a3b8" },
  },
}

export const MIDNIGHT_THEME: ThemeTokens = {
  id: "midnight",
  name: "Midnight",
  description: "Deep dark developer theme with neon highlights",
  canvas: {
    background: "#030712", // gray-950
    grid: "rgba(56, 189, 248, 0.05)",
  },
  text: {
    primary: "#f9fafb",
    secondary: "#9ca3af",
    muted: "#4b5563",
  },
  surface: {
    default: "#111827",
    elevated: "#1f2937",
    subtle: "#030712",
  },
  border: {
    default: "rgba(56, 189, 248, 0.15)",
    strong: "rgba(56, 189, 248, 0.3)",
  },
  semantic: {
    definition: { background: "#0b132b", foreground: "#f0f6ff", border: "#2563eb", titleColor: "#60a5fa" },
    concept: { background: "#1c1035", foreground: "#f5f3ff", border: "#7c3aed", titleColor: "#a78bfa" },
    code: { background: "#02040a", foreground: "#f9fafb", border: "#1e293b", titleColor: "#38bdf8" },
    summary: { background: "#062319", foreground: "#ecfdf5", border: "#16a34a", titleColor: "#4ade80" },
    warning: { background: "#2a0a0a", foreground: "#fef2f2", border: "#dc2626", titleColor: "#f87171" },
    interview: { background: "#261a06", foreground: "#fffbeb", border: "#ca8a04", titleColor: "#facc15" },
    memory: { background: "#280b1b", foreground: "#fff1f2", border: "#db2777", titleColor: "#f472b6" },
    related: { background: "#08252c", foreground: "#ecfeff", border: "#0891b2", titleColor: "#22d3ee" },
    note: { background: "#0f172a", foreground: "#f8fafc", border: "#334155", titleColor: "#94a3b8" },
    generic: { background: "#0f172a", foreground: "#f8fafc", border: "#1e293b", titleColor: "#94a3b8" },
  },
}

export const PAPER_THEME: ThemeTokens = {
  id: "paper",
  name: "Paper",
  description: "Warm off-white surface with ink typography",
  canvas: {
    background: "#fbf9f5", // warm paper
    grid: "rgba(0, 0, 0, 0.04)",
  },
  text: {
    primary: "#1c1917", // warm charcoal
    secondary: "#57534e",
    muted: "#78716c",
  },
  surface: {
    default: "#f5f2eb",
    elevated: "#eae5d9",
    subtle: "#fbf9f5",
  },
  border: {
    default: "#e7e5e4",
    strong: "#d6d3d1",
  },
  semantic: {
    definition: { background: "#eff6ff", foreground: "#1e3a8a", border: "#bfdbfe", titleColor: "#1d4ed8" },
    concept: { background: "#f5f3ff", foreground: "#4c1d95", border: "#ddd6fe", titleColor: "#6d28d9" },
    code: { background: "#27272a", foreground: "#fafafa", border: "#3f3f46", titleColor: "#38bdf8" },
    summary: { background: "#f0fdf4", foreground: "#14532d", border: "#bbf7d0", titleColor: "#15803d" },
    warning: { background: "#fef2f2", foreground: "#7f1d1d", border: "#fecaca", titleColor: "#b91c1c" },
    interview: { background: "#fefce8", foreground: "#713f12", border: "#fef08a", titleColor: "#a16207" },
    memory: { background: "#fdf2f8", foreground: "#831843", border: "#fbcfe8", titleColor: "#be185d" },
    related: { background: "#ecfeff", foreground: "#164e63", border: "#cffaff", titleColor: "#0e7490" },
    note: { background: "#f5f5f4", foreground: "#292524", border: "#e7e5e4", titleColor: "#44403c" },
    generic: { background: "#f5f5f4", foreground: "#292524", border: "#e7e5e4", titleColor: "#44403c" },
  },
}
