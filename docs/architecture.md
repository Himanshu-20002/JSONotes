# JSONotes Architecture & Documentation

## Overview
**JSONotes** ("Turn structured content into beautiful visual notes") is a Next.js (React 19 / Tailwind CSS) web application designed for creating, editing, customizing, and exporting visual note wallpapers (cheat sheets, study notes, mind maps, concept cards, code snippets). It features a freeform canvas layout engine, state management with Zustand, a dynamic JSON/Markdown template processor, and multi-format export capabilities (PNG, JPEG, WebP, SVG, JSON).

---

## 🏗 Implementation Architecture

```
                                 +------------------------------------------------+
                                 |                  Root Layout                   |
                                 |            (app/layout.tsx + page.tsx)         |
                                 +------------------------------------------------+
                                                         |
                                 +------------------------------------------------+
                                 |                  Editor Shell                  |
                                 |          (components/editor/editor-shell.tsx)  |
                                 +------------------------------------------------+
                                      |                 |                 |
     +--------------------------------+                 |                 +--------------------------------+
     |                                                  |                                                  |
+-----------------------------------+   +------------------------------------+   +-----------------------------------+
|            Left Panel             |   |            Canvas System           |   |          Inspector Panel          |
|  - Blocks & Templates library     |   |  - Viewport (Zoom/Pan/Grid)        |   |  - Element property controls      |
|  - Layers management (reorder/lock|   |  - Element Frame wrapper (Drag/    |   |  - Color, Font, Size, Alignment   |
|  - JSON/MD Import Modal triggering|   |    Resize, Rotation, Snapping)     |   |  - Canvas background & dimensions |
+-----------------------------------+   |  - Block Renderer (Visual blocks)  |   +-----------------------------------+
                                        +------------------------------------+
                                                          |
                                        +------------------------------------+
                                        |          Zustand Store             |
                                        |        (lib/store.ts)              |
                                        |  - Canvas state & Elements         |
                                        |  - History (Undo / Redo stack)     |
                                        |  - Active selection & Drag states  |
                                        +------------------------------------+
                                                          |
                               +--------------------------+--------------------------+
                               |                                                     |
             +------------------------------------+                +------------------------------------+
             |          Template Engine           |                |            Export Engine           |
             |       (lib/template-engine.ts)     |                |           (lib/export.ts)          |
             |  - Parse JSON / Markdown           |                |  - Render Canvas to DOM            |
             |  - Map schema to visual blocks     |                |  - html-to-image / html2canvas     |
             |  - Auto-layout & grid calculation  |                |  - PNG, JPEG, WebP, SVG, JSON      |
             +------------------------------------+                +------------------------------------+
```

---

## 🔄 Data Flow Architecture

### 1. State Flow (Zustand Store)
- **Centralized Store (`lib/store.ts`)**: Manages project metadata (width, height, background color/gradient), element list (`CanvasElement[]`), selection state (`selectedIds`), zoom/pan offsets, history stacks (`past`, `future`), and UI panel toggles.
- **Unidirectional Data Updates**: Components invoke store actions (`updateElement`, `addElement`, `deleteSelected`, `setSelection`, `undo`, `redo`).
- **History Tracking**: Structural edits trigger snapshots pushed onto `past` stack for instant Undo/Redo operations.

### 2. Rendering Flow
1. **`Canvas` Component (`components/editor/canvas.tsx`)**: Renders the background grid, canvas board, selection overlay, and element list.
2. **`ElementFrame` (`components/editor/element-frame.tsx`)**: Wraps each element with interactive handlers for selection, dragging, multi-axis resizing, and rotational transforms.
3. **`BlockRenderer` (`components/editor/block-renderer.tsx`)**: Renders specific block UI based on `element.type` (e.g. Sticky Note, Concept Card, Code Block with syntax highlighting, Callout, Definition, Mind Map Node, Badge, Divider, Arrow).

### 3. Template & JSON Import Flow
1. User provides structured JSON or Markdown via `ImportModal` (`components/editor/import-modal.tsx`).
2. `TemplateEngine` (`lib/template-engine.ts`) parses the input, maps schema structures into individual `CanvasElement` nodes, calculates spatial layout offsets (column spacing, block heights), and populates the store.

### 4. Export Flow
1. User opens `ExportDialog` (`components/editor/export-dialog.tsx`) and selects format (PNG, JPEG, WebP, SVG, JSON) & scaling factor.
2. `exportCanvas` (`lib/export.ts`) locates `#wallpaper-canvas`, clones/prepares DOM elements, renders syntax styles, and converts the canvas into image blobs or JSON data files for browser download.

---

## 🛠 Implemented Functionality & Features

| Category | Feature | Description |
| :--- | :--- | :--- |
| **Canvas & Workspace** | Freeform Drag & Resize | Move and resize elements smoothly with snap alignment helpers |
| | Zoom & Pan | Pan workspace and zoom in/out (preset levels & custom fit) |
| | Canvas Customization | Adjust canvas size (Desktop, Mobile, Custom) and backgrounds (solid/gradients) |
| | Multi-Selection & Layering | Select single/multiple elements, lock/hide layers, change z-index order |
| **Block Types** | Text & Heading Blocks | Title, Subtitle, Paragraph text with customizable alignment and font size |
| | Study & Concept Cards | Sticky notes, Concept cards, Definition cards, Memory tricks, Warning callouts |
| | Interactive Code Blocks | Code snippets with syntax highlighting support and language tags |
| | Structured Lists | Checklist items, Bullet lists, Progress bars, Roadmaps, Quotes |
| | Diagrams & Connectors | Mind map nodes, Arrows, Badges, Dividers, Container boxes |
| **Templates & Import** | JSON / MD Import | Import structured study notes (JSON or Markdown format) into structured visual wallpaper blocks |
| | Built-in Templates | Preset layouts for Study Notes, Cheat Sheets, Mind Maps, and Flashcards |
| **Export & Persistence** | Image & Vector Export | Export high-resolution wallpapers in PNG, JPEG, WebP, SVG formats |
| | Project Import / Export | Save canvas data as `.json` and reload projects losslessly |
| **UX & Productivity** | History Management | Full Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`) stack support |
| | Keyboard Shortcuts | Quick actions for delete (`Del`), duplicate (`Ctrl+D`), movement (`Arrow keys`), locking (`Ctrl+L`) |

---

## 📁 Key File Directory Structure

- **`app/`**
  - `layout.tsx`: Root HTML layout with theme providers & metadata.
  - `page.tsx`: Main route loading the wallpaper editor shell.
  - `globals.css`: Tailwind directives and custom canvas background grid styles.
- **`components/editor/`**
  - `editor-shell.tsx`: Main editor shell container layout.
  - `canvas.tsx`: Interactive canvas surface with viewport pan/zoom.
  - `element-frame.tsx`: Selection bounding box, transform handles (resize/rotate/move).
  - `block-renderer.tsx`: Renderer for all visual block types.
  - `toolbar.tsx`: Quick action bar (Undo/Redo, Zoom, Grid toggle, Export button).
  - `left-panel.tsx`: Add blocks, select preset templates, manage layer ordering.
  - `inspector.tsx`: Property inspector for editing text, colors, dimensions, alignment.
  - `import-modal.tsx`: JSON and Markdown code import interface.
  - `export-dialog.tsx`: Download options modal.
- **`lib/`**
  - `types.ts`: TypeScript interfaces for elements, block types, project configurations.
  - `store.ts`: Zustand store managing canvas state, element trees, selection, and history stack.
  - `template-engine.ts`: Parser & layout engine for JSON/MD schemas.
  - `blocks.ts`: Block factory definitions and default properties.
  - `export.ts`: HTML-to-image rendering utilities and file save handlers.
