import type { CodeDetectionResult } from "./types"

const JS_TS_KEYWORDS = [
  "const", "let", "var", "function", "=>", "import", "export", "class",
  "console.", "return", "if (", "else {", "async", "await", "interface", "type ",
]

const PYTHON_KEYWORDS = ["def ", "import ", "from ", "class ", "elif ", "self.", "print("]
const SQL_KEYWORDS = ["SELECT ", "FROM ", "WHERE ", "INSERT INTO", "UPDATE ", "DELETE FROM", "JOIN "]
const HTML_KEYWORDS = ["<div", "<span", "<section", "<html", "<p>", "<h1", "<button"]
const CSS_KEYWORDS = ["margin:", "padding:", "color:", "display:", "flex", "grid", "background:"]

export function detectCodeSyntax(text: string): CodeDetectionResult {
  if (!text || typeof text !== "string") {
    return { isCode: false, confidence: 0, reasons: ["Content is not a string."] }
  }

  const str = text.trim()

  // Protect against false positive plain prose sentences
  if (!str.includes(";") && !str.includes("{") && !str.includes("=>") && !str.includes("def ") && !str.includes("<") && !str.includes("SELECT")) {
    const wordCount = str.split(/\s+/).length
    if (wordCount > 5 && !str.includes("()") && !str.includes(" = ")) {
      return { isCode: false, confidence: 0.1, reasons: ["Looks like normal prose sentence."] }
    }
  }

  let matches = 0
  const reasons: string[] = []
  let detectedLanguage: string | undefined

  // JS/TS check
  const jsMatches = JS_TS_KEYWORDS.filter((k) => str.includes(k))
  if (jsMatches.length > 0) {
    matches += jsMatches.length * 2
    reasons.push(`Matched JS/TS syntax tokens: ${jsMatches.join(", ")}`)
    detectedLanguage = str.includes("interface") || str.includes("type ") ? "typescript" : "javascript"
  }

  // Python check
  const pyMatches = PYTHON_KEYWORDS.filter((k) => str.includes(k))
  if (pyMatches.length > 0) {
    matches += pyMatches.length * 2
    reasons.push(`Matched Python syntax tokens: ${pyMatches.join(", ")}`)
    detectedLanguage = "python"
  }

  // SQL check
  const sqlMatches = SQL_KEYWORDS.filter((k) => str.toUpperCase().includes(k))
  if (sqlMatches.length > 0) {
    matches += sqlMatches.length * 2
    reasons.push(`Matched SQL syntax tokens: ${sqlMatches.join(", ")}`)
    detectedLanguage = "sql"
  }

  // HTML check
  const htmlMatches = HTML_KEYWORDS.filter((k) => str.includes(k))
  if (htmlMatches.length > 0) {
    matches += htmlMatches.length * 2
    reasons.push(`Matched HTML tags: ${htmlMatches.join(", ")}`)
    detectedLanguage = "html"
  }

  // CSS check
  const cssMatches = CSS_KEYWORDS.filter((k) => str.includes(k))
  if (cssMatches.length > 0) {
    matches += cssMatches.length * 2
    reasons.push(`Matched CSS properties: ${cssMatches.join(", ")}`)
    detectedLanguage = "css"
  }

  // Structural code indicators: braces, parens, semicolons, arrows
  if (str.includes("{") && str.includes("}")) {
    matches += 2
    reasons.push("Contains matching block braces {}")
  }
  if (str.includes("()") || str.includes(");")) {
    matches += 1.5
    reasons.push("Contains function call syntax ()")
  }
  if (str.includes("=>")) {
    matches += 2
    reasons.push("Contains arrow function syntax =>")
  }

  const confidence = Math.min(1.0, matches / 5)
  const isCode = confidence >= 0.65

  return {
    isCode,
    confidence,
    language: isCode ? detectedLanguage || "text" : undefined,
    reasons,
  }
}
