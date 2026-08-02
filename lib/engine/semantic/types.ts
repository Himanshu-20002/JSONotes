export type SemanticBlockType =
  | "definition"
  | "concept"
  | "related"
  | "code"
  | "summary"
  | "interview"
  | "warning"
  | "memory"
  | "note"
  | "generic"

export interface SemanticBlock {
  id: string
  type: SemanticBlockType
  title?: string
  content: unknown
  importance: 1 | 2 | 3 | 4 | 5
  density: "low" | "medium" | "high"
  preferredSize: "small" | "medium" | "large" | "wide" | "tall"
  metadata?: {
    sourceField?: string
    sourcePath?: string
    inferred?: boolean
    inferenceConfidence?: number
    inferenceReasons?: string[]
    language?: string
    itemCount?: number
    codeLines?: number
  }
}

export interface SemanticDocument {
  title?: string
  subtitle?: string
  blocks: SemanticBlock[]
}

export interface ContentAnalysis {
  blockCount: number
  totalCharacters: number
  codeBlocks: number
  codeLines: number
  conceptCount: number
  listItems: number
  warningCount: number
  dominantContent: "code" | "concept" | "list" | "mixed"
  density: "low" | "medium" | "high" | "extreme"
}
