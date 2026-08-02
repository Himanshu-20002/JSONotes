"use client"

import React, { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Check,
  Copy,
  Info,
  Lightbulb,
  Quote as QuoteIcon,
} from "lucide-react"
import type { CanvasElement, ListItem } from "@/lib/types"
import { palette } from "@/lib/colors"
import { highlight } from "@/lib/highlight"
import { uid, normalizeBlockType } from "@/lib/blocks"
import {
  registerBlockComponent,
  getBlockComponent,
  type BlockComponentProps,
} from "@/lib/renderer-registry"

export type Props = BlockComponentProps

/* -------------------------------------------------------------------------- */
/*  Inline editable text                                                       */
/* -------------------------------------------------------------------------- */

export function Editable({
  value,
  editing,
  onCommit,
  className,
  style,
  placeholder,
}: {
  value: string
  editing: boolean
  onCommit: (v: string) => void
  className?: string
  style?: CSSProperties
  placeholder?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.textContent = value ?? ""
      ref.current.focus()
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editing, value])

  if (editing) {
    return (
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={className}
        style={{ ...style, whiteSpace: "pre-wrap", cursor: "text" }}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onBlur={(e) => onCommit(e.currentTarget.textContent ?? "")}
      />
    )
  }

  return (
    <div className={className} style={{ ...style, whiteSpace: "pre-wrap" }}>
      {value || <span style={{ opacity: 0.4 }}>{placeholder}</span>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Card wrapper                                                               */
/* -------------------------------------------------------------------------- */

export function Card({
  el,
  children,
  accentBar,
}: {
  el: CanvasElement
  children: React.ReactNode
  accentBar?: boolean
}) {
  const p = palette(el.color)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: p.fill,
        border: `2px solid ${p.border}`,
        borderRadius: 18,
        color: p.text,
        padding: 20,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
      }}
    >
      {accentBar && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 6,
            height: "100%",
            background: p.border,
          }}
        />
      )}
      {children}
    </div>
  )
}

export function CardHeader({ el, icon }: { el: CanvasElement; icon?: React.ReactNode }) {
  const p = palette(el.color)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {icon && <span style={{ display: "inline-flex", color: p.accent }}>{icon}</span>}
      <span
        style={{
          fontSize: 12,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontWeight: 700,
          color: p.accent,
        }}
      >
        {el.name}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Block Components Definitions & Registration                                */
/* -------------------------------------------------------------------------- */

const TitleBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  return (
    <Editable
      value={el.text ?? el.title ?? ""}
      editing={editing}
      onCommit={(v) => onChange({ text: v })}
      placeholder="Title"
      style={{
        fontSize: el.fontSize ?? 64,
        fontWeight: 800,
        color: p.accent,
        textAlign: el.align ?? "left",
        width: "100%",
        height: "100%",
        lineHeight: 1.1,
        letterSpacing: -1,
      }}
    />
  )
}

const SubtitleBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  return (
    <Editable
      value={el.text ?? el.title ?? ""}
      editing={editing}
      onCommit={(v) => onChange({ text: v })}
      placeholder="Subtitle"
      style={{
        fontSize: el.fontSize ?? 34,
        fontWeight: 600,
        color: p.text,
        textAlign: el.align ?? "left",
        width: "100%",
        height: "100%",
        lineHeight: 1.2,
      }}
    />
  )
}

const ParagraphBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  return (
    <Editable
      value={el.text ?? ""}
      editing={editing}
      onCommit={(v) => onChange({ text: v })}
      placeholder="Write something..."
      style={{
        fontSize: el.fontSize ?? 20,
        color: "#cbd5e1",
        textAlign: el.align ?? "left",
        width: "100%",
        height: "100%",
        lineHeight: 1.55,
      }}
    />
  )
}

const QuoteBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        gap: 14,
        padding: "18px 22px",
        background: p.softFill,
        borderLeft: `5px solid ${p.border}`,
        borderRadius: 12,
        color: p.text,
        alignItems: "flex-start",
      }}
    >
      <QuoteIcon size={28} color={p.accent} style={{ flexShrink: 0, marginTop: 4 }} />
      <Editable
        value={el.text ?? ""}
        editing={editing}
        onCommit={(v) => onChange({ text: v })}
        placeholder="Quote"
        style={{ fontSize: el.fontSize ?? 24, fontStyle: "italic", lineHeight: 1.4, flex: 1 }}
      />
    </div>
  )
}

const BadgeBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: p.chip,
        color: "#fff",
        borderRadius: 999,
        fontWeight: 700,
        letterSpacing: 1,
      }}
    >
      <Editable
        value={el.text ?? ""}
        editing={editing}
        onCommit={(v) => onChange({ text: v })}
        placeholder="BADGE"
        style={{ fontSize: el.fontSize ?? 18, textAlign: "center" }}
      />
    </div>
  )
}

const StickyBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: p.border,
        color: "#0b0b0b",
        padding: 20,
        borderRadius: 4,
        boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
      }}
    >
      <Editable
        value={el.text ?? el.title ?? ""}
        editing={editing}
        onCommit={(v) => onChange({ text: v })}
        placeholder="Sticky note..."
        style={{ fontSize: el.fontSize ?? 22, fontWeight: 500, width: "100%", height: "100%", lineHeight: 1.4, color: "#0b0b0b" }}
      />
    </div>
  )
}

const DefinitionBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  return (
    <Card el={el} accentBar>
      <Editable
        value={el.title ?? ""}
        editing={editing}
        onCommit={(v) => onChange({ title: v })}
        placeholder="Term"
        style={{ fontSize: (el.fontSize ?? 18) + 8, fontWeight: 800, color: p.accent }}
      />
      <Editable
        value={el.text ?? ""}
        editing={editing}
        onCommit={(v) => onChange({ text: v })}
        placeholder="Definition"
        style={{ fontSize: el.fontSize ?? 18, lineHeight: 1.5, color: p.text, flex: 1 }}
      />
    </Card>
  )
}

const CardWithIconBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  const norm = normalizeBlockType(el.type)
  const icon =
    norm === "interviewTip" ? (
      <Lightbulb size={16} />
    ) : norm === "warning" ? (
      <AlertTriangle size={16} />
    ) : norm === "memoryTrick" ? (
      <Brain size={16} />
    ) : (
      <ArrowRight size={16} />
    )
  return (
    <Card el={el} accentBar>
      <CardHeader el={el} icon={icon} />
      <Editable
        value={el.title ?? ""}
        editing={editing}
        onCommit={(v) => onChange({ title: v })}
        placeholder="Heading"
        style={{ fontSize: (el.fontSize ?? 18) + 4, fontWeight: 700, color: p.text }}
      />
      <Editable
        value={el.text ?? ""}
        editing={editing}
        onCommit={(v) => onChange({ text: v })}
        placeholder="Details"
        style={{ fontSize: el.fontSize ?? 18, lineHeight: 1.5, color: p.text, opacity: 0.92, flex: 1 }}
      />
    </Card>
  )
}

const CalloutBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "16px 20px",
        background: p.softFill,
        border: `1px solid ${p.border}`,
        borderRadius: 14,
        color: p.text,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 10,
          background: p.border,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <Info size={22} />
      </div>
      <Editable
        value={el.text ?? ""}
        editing={editing}
        onCommit={(v) => onChange({ text: v })}
        placeholder="Callout text"
        style={{ fontSize: el.fontSize ?? 20, lineHeight: 1.4, flex: 1 }}
      />
    </div>
  )
}

const MindMapNodeBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        background: p.fill,
        border: `2px solid ${p.border}`,
        borderRadius: 999,
        color: p.text,
        textAlign: "center",
      }}
    >
      <Editable
        value={el.text ?? ""}
        editing={editing}
        onCommit={(v) => onChange({ text: v })}
        placeholder="Node"
        style={{ fontSize: el.fontSize ?? 20, fontWeight: 600, textAlign: "center", width: "100%" }}
      />
    </div>
  )
}

const ListBlock: React.FC<Props & { kind: "checklist" | "bulletList" }> = ({ el, editing, onChange, kind }) => {
  const p = palette(el.color)
  const items = el.items ?? []

  const update = (id: string, patch: Partial<ListItem>) =>
    onChange({ items: items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  const addItem = () => onChange({ items: [...items, { id: uid("li"), text: "New item", checked: false }] })
  const removeItem = (id: string) => onChange({ items: items.filter((i) => i.id !== id) })

  return (
    <Card el={el}>
      <CardHeader el={el} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4, overflow: "hidden" }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            {kind === "checklist" ? (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => update(item.id, { checked: !item.checked })}
                style={{
                  marginTop: 4,
                  width: 22,
                  height: 22,
                  flexShrink: 0,
                  borderRadius: 6,
                  border: `2px solid ${p.border}`,
                  background: item.checked ? p.border : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {item.checked && <Check size={14} color="#fff" strokeWidth={3} />}
              </button>
            ) : (
              <span style={{ marginTop: 8, width: 8, height: 8, flexShrink: 0, borderRadius: 999, background: p.accent }} />
            )}
            <Editable
              value={item.text}
              editing={editing}
              onCommit={(v) => (v.trim() === "" ? removeItem(item.id) : update(item.id, { text: v }))}
              style={{
                fontSize: el.fontSize ?? 20,
                flex: 1,
                textDecoration: kind === "checklist" && item.checked ? "line-through" : "none",
                opacity: kind === "checklist" && item.checked ? 0.6 : 1,
                lineHeight: 1.4,
              }}
            />
          </div>
        ))}
        {editing && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={addItem}
            style={{ alignSelf: "flex-start", fontSize: 14, color: p.accent, background: "transparent", cursor: "pointer" }}
          >
            + Add item
          </button>
        )}
      </div>
    </Card>
  )
}

const ChecklistBlock: React.FC<Props> = (props) => <ListBlock {...props} kind="checklist" />
const BulletListBlock: React.FC<Props> = (props) => <ListBlock {...props} kind="bulletList" />

const CodeBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const [copied, setCopied] = useState(false)
  const code = el.code ?? ""
  const lines = code.split("\n")

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0d1117",
        border: "1px solid #1f2937",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "#161b22",
          borderBottom: "1px solid #1f2937",
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 12, height: 12, borderRadius: 999, background: "#ff5f56" }} />
          <span style={{ width: 12, height: 12, borderRadius: 999, background: "#ffbd2e" }} />
          <span style={{ width: 12, height: 12, borderRadius: 999, background: "#27c93f" }} />
          <span style={{ marginLeft: 10, fontSize: 12, color: "#8b949e", fontFamily: "var(--font-mono)" }}>
            {el.language ?? "javascript"}
          </span>
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={copy}
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#8b949e", cursor: "pointer", background: "transparent" }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {editing ? (
        <textarea
          defaultValue={code}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onBlur={(e) => onChange({ code: e.currentTarget.value })}
          spellCheck={false}
          style={{
            flex: 1,
            width: "100%",
            resize: "none",
            background: "transparent",
            color: "#e2e8f0",
            border: "none",
            outline: "none",
            padding: 14,
            fontFamily: "var(--font-mono)",
            fontSize: el.fontSize ?? 16,
            lineHeight: 1.6,
          }}
        />
      ) : (
        <div style={{ display: "flex", overflow: "hidden", flex: 1 }}>
          <div
            style={{
              padding: "14px 8px 14px 14px",
              textAlign: "right",
              color: "#3b4453",
              fontFamily: "var(--font-mono)",
              fontSize: el.fontSize ?? 16,
              lineHeight: 1.6,
              userSelect: "none",
            }}
          >
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre
            style={{
              margin: 0,
              padding: "14px 14px 14px 6px",
              fontFamily: "var(--font-mono)",
              fontSize: el.fontSize ?? 16,
              lineHeight: 1.6,
              overflow: "hidden",
              whiteSpace: "pre-wrap",
              flex: 1,
            }}
          >
            <code>{highlight(code)}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

const ArrowBlock: React.FC<Props> = ({ el }) => {
  const p = palette(el.color)
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${el.w} ${el.h}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <defs>
        <marker id={`ah-${el.id}`} markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" fill={p.accent} />
        </marker>
      </defs>
      <line
        x1={6}
        y1={el.h / 2}
        x2={el.w - 12}
        y2={el.h / 2}
        stroke={p.accent}
        strokeWidth={4}
        markerEnd={`url(#ah-${el.id})`}
        strokeLinecap="round"
      />
    </svg>
  )
}

const DividerBlock: React.FC<Props> = ({ el }) => {
  const p = palette(el.color)
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
      <div style={{ width: "100%", height: 3, borderRadius: 999, background: p.border }} />
    </div>
  )
}

const ProgressBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  const pct = Math.max(0, Math.min(100, el.progress ?? 0))
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: el.fontSize ?? 16, color: p.text }}>
        <Editable value={el.title ?? ""} editing={editing} onCommit={(v) => onChange({ title: v })} placeholder="Label" style={{ fontWeight: 600 }} />
        <span style={{ color: p.accent, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ width: "100%", height: 14, borderRadius: 999, background: p.softFill, overflow: "hidden", border: `1px solid ${p.border}` }}>
        <div style={{ width: `${pct}%`, height: "100%", background: p.border, borderRadius: 999 }} />
      </div>
    </div>
  )
}

const ContainerBlock: React.FC<Props> = ({ el, editing, onChange }) => {
  const p = palette(el.color)
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: `2px dashed ${p.border}`,
        borderRadius: 18,
        background: "rgba(255,255,255,0.02)",
        padding: 14,
      }}
    >
      <Editable
        value={el.title ?? ""}
        editing={editing}
        onCommit={(v) => onChange({ title: v })}
        placeholder="Section"
        style={{ fontSize: el.fontSize ?? 18, fontWeight: 700, color: p.accent, textTransform: "uppercase", letterSpacing: 1 }}
      />
    </div>
  )
}

// Register camelCase & kebab-case block types in the Block Registry
const REGISTRATIONS: [string, React.FC<Props>][] = [
  ["title", TitleBlock],
  ["subtitle", SubtitleBlock],
  ["paragraph", ParagraphBlock],
  ["quote", QuoteBlock],
  ["badge", BadgeBlock],
  ["sticky", StickyBlock],
  ["sticky-note", StickyBlock],
  ["definition", DefinitionBlock],
  ["definition-card", DefinitionBlock],
  ["concept", DefinitionBlock],
  ["concept-card", DefinitionBlock],
  ["interviewTip", CardWithIconBlock],
  ["interview-tip", CardWithIconBlock],
  ["warning", CardWithIconBlock],
  ["warning-card", CardWithIconBlock],
  ["memoryTrick", CardWithIconBlock],
  ["memory-trick", CardWithIconBlock],
  ["roadmap", CardWithIconBlock],
  ["callout", CalloutBlock],
  ["mindMapNode", MindMapNodeBlock],
  ["checklist", ChecklistBlock],
  ["bulletList", BulletListBlock],
  ["code", CodeBlock],
  ["code-block", CodeBlock],
  ["arrow", ArrowBlock],
  ["divider", DividerBlock],
  ["progress", ProgressBlock],
  ["container", ContainerBlock],
]

for (const [type, component] of REGISTRATIONS) {
  registerBlockComponent(type, component)
}

/* -------------------------------------------------------------------------- */
/*  Main renderer using registry lookup                                       */
/* -------------------------------------------------------------------------- */

export function BlockRenderer(props: Props) {
  const Component = getBlockComponent(props.el.type) || getBlockComponent(normalizeBlockType(props.el.type))
  if (!Component) {
    return (
      <Card el={props.el}>
        <CardHeader el={props.el} />
        <Editable
          value={props.el.text || props.el.title || `[${props.el.type}]`}
          editing={props.editing}
          onCommit={(v) => props.onChange({ text: v })}
          placeholder={props.el.type}
          style={{ fontSize: props.el.fontSize ?? 18 }}
        />
      </Card>
    )
  }
  return <Component {...props} />
}
