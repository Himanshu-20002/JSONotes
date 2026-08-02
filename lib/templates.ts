import type { CanvasElement } from "./types"
import { createElement } from "./blocks"

export interface TemplateDef {
  id: string
  name: string
  description: string
  build: () => CanvasElement[]
}

// Helper: place a block by top-left corner (createElement centers, so offset by half size)
function at(type: Parameters<typeof createElement>[0], x: number, y: number, overrides: Partial<CanvasElement> = {}) {
  const w = overrides.w
  const h = overrides.h
  const el = createElement(type, 0, 0, overrides)
  el.x = x
  el.y = y
  if (w) el.w = w
  if (h) el.h = h
  return el
}

function header(title: string, subtitle: string, color: CanvasElement["color"] = "blue") {
  return [
    at("title", 120, 90, { text: title, color, w: 900, h: 100 }),
    at("subtitle", 122, 200, { text: subtitle, color: "slate", w: 900, h: 60 }),
    at("divider", 122, 275, { w: 600, color }),
  ]
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "javascript",
    name: "JavaScript",
    description: "Core concepts, closures, event loop",
    build: () => [
      ...header("JavaScript Essentials", "The concepts you must know cold", "yellow"),
      at("definition", 120, 340, { title: "Closure", text: "A function bundled with references to its surrounding state.", color: "blue", w: 420, h: 200 }),
      at("definition", 570, 340, { title: "Hoisting", text: "Declarations are moved to the top of their scope.", color: "purple", w: 420, h: 200 }),
      at("code", 120, 580, { code: "function counter() {\n  let n = 0\n  return () => ++n\n}", color: "slate", w: 500, h: 240 }),
      at("interviewTip", 660, 580, { title: "Interview Tip", text: "Explain the event loop with a concrete microtask example.", color: "yellow", w: 420, h: 180 }),
      at("warning", 1120, 340, { title: "Common Mistake", text: "== does type coercion, === does not.", color: "red", w: 420, h: 180 }),
      at("memoryTrick", 1120, 560, { title: "Memory Trick", text: "TDZ = Temporal Dead Zone for let/const.", color: "pink", w: 420, h: 180 }),
      at("checklist", 1600, 340, { title: "To Master", color: "green", w: 380, h: 340 }),
    ],
  },
  {
    id: "react",
    name: "React",
    description: "Hooks, rendering, state",
    build: () => [
      ...header("React Cheat Sheet", "Hooks, rendering & performance", "cyan"),
      at("definition", 120, 340, { title: "useEffect", text: "Runs side effects after render. Cleanup on unmount / deps change.", color: "blue", w: 420, h: 200 }),
      at("definition", 570, 340, { title: "useMemo", text: "Memoize expensive computed values.", color: "purple", w: 420, h: 200 }),
      at("code", 120, 580, { code: "const value = useMemo(\n  () => heavy(a, b),\n  [a, b]\n)", color: "slate", w: 480, h: 220 }),
      at("callout", 640, 580, { text: "Keep components pure. Side effects belong in effects.", color: "cyan", w: 460, h: 120 }),
      at("checklist", 1150, 340, { title: "Hooks to know", color: "green", w: 400, h: 360 }),
      at("badge", 1600, 340, { text: "REACT 19", color: "cyan", w: 180, h: 50 }),
    ],
  },
  {
    id: "nextjs",
    name: "Next.js",
    description: "App Router, rendering, caching",
    build: () => [
      ...header("Next.js App Router", "Server components & caching", "slate"),
      at("definition", 120, 340, { title: "Server Component", text: "Renders on the server, zero JS shipped by default.", color: "blue", w: 440, h: 200 }),
      at("roadmap", 590, 340, { title: "Data Flow", text: "Fetch in RSC → pass to client components.", color: "purple", w: 340, h: 200 }),
      at("code", 120, 580, { code: "export default async function Page() {\n  const data = await getData()\n  return <List data={data} />\n}", color: "slate", w: 560, h: 230 }),
      at("warning", 720, 580, { title: "Gotcha", text: "Do not call cookies() / headers() in cached segments.", color: "red", w: 420, h: 180 }),
      at("checklist", 1200, 340, { title: "Rendering modes", color: "green", w: 400, h: 340 }),
    ],
  },
  {
    id: "nodejs",
    name: "Node.js",
    description: "Runtime, streams, async",
    build: () => [
      ...header("Node.js Core", "Runtime, event loop, streams", "green"),
      at("definition", 120, 340, { title: "Event Loop", text: "Handles async callbacks across phases: timers, poll, check.", color: "blue", w: 440, h: 210 }),
      at("bulletList", 600, 340, { title: "Built-in Modules", color: "slate", w: 380, h: 260 }),
      at("code", 120, 590, { code: "const s = fs.createReadStream('big.log')\ns.pipe(res)", color: "slate", w: 520, h: 180 }),
      at("interviewTip", 680, 590, { title: "Interview Tip", text: "Streams keep memory flat for large files.", color: "yellow", w: 420, h: 180 }),
    ],
  },
  {
    id: "html",
    name: "HTML",
    description: "Semantics & accessibility",
    build: () => [
      ...header("HTML Semantics", "Structure & accessibility", "orange"),
      at("bulletList", 120, 340, { title: "Semantic tags", color: "slate", w: 400, h: 320 }),
      at("callout", 560, 340, { text: "Use one <h1> per page and nest headings in order.", color: "cyan", w: 460, h: 120 }),
      at("warning", 560, 490, { title: "A11y", text: "Every image needs meaningful alt text.", color: "red", w: 460, h: 170 }),
    ],
  },
  {
    id: "css",
    name: "CSS",
    description: "Flexbox, grid, layers",
    build: () => [
      ...header("CSS Layout", "Flexbox, Grid & the cascade", "pink"),
      at("definition", 120, 340, { title: "Flexbox", text: "1D layout along a single axis.", color: "blue", w: 400, h: 190 }),
      at("definition", 550, 340, { title: "Grid", text: "2D layout with rows and columns.", color: "purple", w: 400, h: 190 }),
      at("code", 120, 560, { code: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}", color: "slate", w: 520, h: 220 }),
      at("memoryTrick", 700, 560, { title: "Specificity", text: "Inline > ID > class > element.", color: "pink", w: 380, h: 180 }),
    ],
  },
  {
    id: "system-design",
    name: "System Design",
    description: "Scalability building blocks",
    build: () => [
      ...header("System Design", "Scale, cache, partition", "cyan"),
      at("mindMapNode", 120, 360, { text: "Load Balancer", color: "blue", w: 240, h: 90 }),
      at("arrow", 380, 385, { w: 160, color: "slate" }),
      at("mindMapNode", 560, 360, { text: "App Servers", color: "purple", w: 240, h: 90 }),
      at("arrow", 820, 385, { w: 160, color: "slate" }),
      at("mindMapNode", 1000, 360, { text: "Database", color: "green", w: 240, h: 90 }),
      at("callout", 120, 520, { text: "Cache reads, queue writes, shard hot keys.", color: "cyan", w: 520, h: 120 }),
      at("checklist", 700, 520, { title: "Trade-offs", color: "green", w: 400, h: 300 }),
    ],
  },
  {
    id: "dsa",
    name: "DSA",
    description: "Data structures & complexity",
    build: () => [
      ...header("Data Structures & Algorithms", "Complexity & patterns", "purple"),
      at("definition", 120, 340, { title: "Big-O", text: "Describes how runtime grows with input size.", color: "blue", w: 420, h: 190 }),
      at("bulletList", 570, 340, { title: "Must-know structures", color: "slate", w: 400, h: 300 }),
      at("code", 120, 560, { code: "// Two pointers\nlet l = 0, r = arr.length - 1\nwhile (l < r) { /* ... */ }", color: "slate", w: 520, h: 200 }),
      at("interviewTip", 1010, 340, { title: "Interview Tip", text: "State time & space complexity before coding.", color: "yellow", w: 420, h: 190 }),
    ],
  },
  {
    id: "os",
    name: "Operating System",
    description: "Processes, memory, scheduling",
    build: () => [
      ...header("Operating Systems", "Processes, memory, concurrency", "orange"),
      at("definition", 120, 340, { title: "Process vs Thread", text: "Process = isolated memory. Thread = shared memory.", color: "blue", w: 440, h: 200 }),
      at("bulletList", 590, 340, { title: "Scheduling", color: "slate", w: 380, h: 260 }),
      at("warning", 120, 570, { title: "Deadlock", text: "Mutual exclusion + hold & wait + no preempt + circular wait.", color: "red", w: 460, h: 180 }),
    ],
  },
  {
    id: "database",
    name: "Database",
    description: "SQL, indexing, transactions",
    build: () => [
      ...header("Databases", "SQL, indexes & transactions", "green"),
      at("definition", 120, 340, { title: "ACID", text: "Atomicity, Consistency, Isolation, Durability.", color: "blue", w: 440, h: 190 }),
      at("definition", 590, 340, { title: "Index", text: "Speeds up reads at the cost of write overhead.", color: "purple", w: 400, h: 190 }),
      at("code", 120, 560, { code: "SELECT u.name, COUNT(o.id)\nFROM users u\nJOIN orders o ON o.user_id = u.id\nGROUP BY u.name;", color: "slate", w: 560, h: 220 }),
      at("interviewTip", 720, 560, { title: "Interview Tip", text: "Normalize for writes, denormalize for reads.", color: "yellow", w: 420, h: 180 }),
    ],
  },
]
