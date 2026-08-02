export type ColorKey =
  | "slate"
  | "blue"
  | "purple"
  | "yellow"
  | "green"
  | "red"
  | "orange"
  | "pink"
  | "cyan"

export type BlockType =
  | "title"
  | "subtitle"
  | "paragraph"
  | "checklist"
  | "bulletList"
  | "sticky"
  | "sticky-note"
  | "definition"
  | "definition-card"
  | "concept"
  | "concept-card"
  | "interviewTip"
  | "interview-tip"
  | "warning"
  | "warning-card"
  | "memoryTrick"
  | "memory-trick"
  | "code"
  | "code-block"
  | "arrow"
  | "divider"
  | "badge"
  | "progress"
  | "roadmap"
  | "quote"
  | "callout"
  | "container"
  | "mindMapNode"

export interface ListItem {
  id: string
  text: string
  checked?: boolean
}

export interface CanvasElement {
  id: string
  type: BlockType | string
  name: string
  x: number
  y: number
  w: number
  h: number
  rotation: number
  opacity: number
  color: ColorKey
  locked: boolean
  hidden: boolean
  fontSize?: number
  align?: "left" | "center" | "right"
  // content
  text?: string
  title?: string
  items?: ListItem[]
  code?: string
  language?: string
  progress?: number
  icon?: string
}

export type TemplateId =
  | "study-notes-v1"
  | "study-notes-v2"
  | "cheatsheet"
  | "mindmap"
  | "flashcards"
  | "custom"

export interface CodeContent {
  language?: string
  code: string
}

export interface StudyNotesContent {
  title?: string
  subtitle?: string
  definition?: string | { title?: string; text: string }
  concepts?: string[] | { title?: string; text: string }[]
  code?: string | CodeContent
  interview?: string | { title?: string; text: string }
  warning?: string | { title?: string; text: string }
  memory?: string | { title?: string; text: string }
  summary?: string[] | ListItem[]
  notes?: string
  related?: string[]
  blocks?: Partial<CanvasElement>[]
  [key: string]: any
}

export interface ThemeConfig {
  mode?: string
  background?: string
  [key: string]: any
}

export interface LayoutConfig {
  preset?: string
  width?: number
  height?: number
  [key: string]: any
}

export interface ProjectJSON {
  theme?: ThemeConfig | string
  layout?: LayoutConfig | string
  template?: TemplateId | string
  content: StudyNotesContent | Partial<CanvasElement>[]
}

export interface Project {
  id: string
  name: string
  width: number
  height: number
  background: string
  theme: ThemeConfig | string
  layout: LayoutConfig | string
  template: TemplateId | string
  rawContent?: StudyNotesContent
  elements: CanvasElement[]
}
