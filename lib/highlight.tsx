import type { ReactNode } from "react"

const KEYWORDS = new Set([
  "const","let","var","function","return","if","else","for","while","do","switch","case","break",
  "continue","new","class","extends","super","this","import","from","export","default","async","await",
  "try","catch","finally","throw","typeof","instanceof","in","of","void","yield","static","get","set",
  "public","private","protected","interface","type","enum","implements","null","undefined","true","false",
])

const COLORS = {
  keyword: "#c084fc",
  string: "#86efac",
  number: "#fbbf24",
  comment: "#64748b",
  fn: "#60a5fa",
  punct: "#94a3b8",
  plain: "#e2e8f0",
}

// Very small tokenizer good enough for note-style code snippets.
export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = []
  const tokenRe =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\w\s])/g
  let m: RegExpExecArray | null
  let key = 0
  while ((m = tokenRe.exec(code)) !== null) {
    const [full, comment, str, num, word, ws, punct] = m
    if (comment) out.push(<span key={key++} style={{ color: COLORS.comment, fontStyle: "italic" }}>{comment}</span>)
    else if (str) out.push(<span key={key++} style={{ color: COLORS.string }}>{str}</span>)
    else if (num) out.push(<span key={key++} style={{ color: COLORS.number }}>{num}</span>)
    else if (word) {
      const after = code.slice(tokenRe.lastIndex, tokenRe.lastIndex + 1)
      if (KEYWORDS.has(word)) out.push(<span key={key++} style={{ color: COLORS.keyword }}>{word}</span>)
      else if (after === "(") out.push(<span key={key++} style={{ color: COLORS.fn }}>{word}</span>)
      else out.push(<span key={key++} style={{ color: COLORS.plain }}>{word}</span>)
    } else if (ws) out.push(<span key={key++}>{ws}</span>)
    else if (punct) out.push(<span key={key++} style={{ color: COLORS.punct }}>{punct}</span>)
    else out.push(<span key={key++}>{full}</span>)
  }
  return out
}
