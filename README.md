# RepSec: Visual Security Report Builder

![RepSec Application Screenshot](https://raw.githubusercontent.com/ananthakrishnaner/RepSec/main/.github/screenshot.png)

RepSec is a modern, web-based tool designed to streamline the creation of professional security reports. It provides a visual, component-driven canvas where security professionals can drag, drop, and arrange elements to build comprehensive and well-structured reports. The final output is a portable Markdown file packaged with all associated evidence.

## Features

- **Visual Report Construction**: Drag and drop components like text blocks, tables, and code snippets onto a dynamic canvas.
- **Component-Driven Architecture**: Build reports using specialized modules:
  - **Section Header**: Create organized report sections with H1-H4 headings
  - **Test Case Table**: A detailed, interactive table for tracking vulnerabilities, status, and testers
  - **Vulnerability Table**: Document vulnerabilities with description, impact, mitigation, and steps to reproduce
  - **Custom Table**: Build your own tables with custom headers, rows, and per-cell file attachments
  - **Steps to Reproduce**: An ordered list component with support for text and screenshot attachments for each step
  - **Code Snippets**: Display HTTP requests, responses, or other code blocks with syntax highlighting
  - **File Attachments**: Upload and manage evidence files (images, documents, etc.)
  - **Linked Stories**: Connect findings to external issue trackers like Jira
  - **AI Test Generator**: Generate security-focused test cases automatically using Google Gemini AI
- **Live Preview**: Instantly see a rendered, GitHub-style preview of your report as you build it
- **Auto-Layout**: A "Tidy Up" button to automatically arrange your components into a clean, logical layout
- **Undo/Redo**: Full history support with Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts
- **Markdown & ZIP Export**: Generate a complete report package, including a `report.md` file and an `evidence` folder
- **PDF Export**: Export your report as a formatted PDF document
- **Persistent Design**: Save your report layout and progress by exporting the design to a JSON file and importing it later

## Tech Stack

- **Framework**: React 18.3 with Vite 5.4
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS 3.4 with shadcn/ui components
- **Canvas/Flow**: @xyflow/react (React Flow)
- **Layout Engine**: Dagre for automatic graph layout
- **AI Integration**: Google Gemini AI (Generative AI)
- **Export**: JSZip (ZIP), html2pdf.js (PDF)
- **Package Manager**: npm / Bun

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              RepSec Architecture                          │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────┐
  │                          App Entry                                   │
  │  index.html → main.tsx → App.tsx (Router) → pages/Index.tsx         │
  └─────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                    ReportBuilderContainer                             │
  │  ┌───────────────────────────────────────────────────────────────┐   │
  │  │                   ReactFlowProvider                             │   │
  │  │  ┌───────────────────────────────────────────────────────────┐ │   │
  │  │  │              ReportBuilderInner                            │ │   │
  │  │  │                                                             │ │   │
  │  │  │  ┌──────────────────┐  ┌────────────────────────────────┐ │ │   │
  │  │  │  │  ComponentToolbar │  │         ReactFlow Canvas         │ │ │   │
  │  │  │  │  (Left Sidebar)   │  │  ┌──────────────────────────────┐│ │ │   │
  │  │  │  │                   │  │  │   Custom Node Types         ││ │ │   │
  │  │  │  │  • Section Header │  │  │  ┌────────────────────────┐ ││ │ │   │
  │  │  │  │  • Text Input     │  │  │  │ TextInputNode          │ ││ │ │   │
  │  │  │  │  • Test Cases     │  │  │  │ TableNode              │ ││ │ │   │
  │  │  │  │  • Vulnerability  │  │  │  │ VulnerabilityTableNode│ ││ │ │   │
  │  │  │  │  • Custom Table   │  │  │  │ CustomTableNode        │ ││ │ │   │
  │  │  │  │  • Code Snippet   │  │  │  │ CodeSnippetNode        │ ││ │ │   │
  │  │  │  │  • File Upload    │  │  │  │ FileUploadNode         │ ││ │ │   │
  │  │  │  │  • Steps          │  │  │  │ StepsNode              │ ││ │ │   │
  │  │  │  │  • Linked Stories │  │  │  │ LinkedStoriesNode      │ ││ │ │   │
  │  │  │  │  • AI Generator   │  │  │  │ SectionHeaderNode      │ ││ │ │   │
  │  │  │  │                   │  │  │  │ AIGeneratorNode        │ ││ │ │   │
  │  │  │  └──────────────────┘  │  │  └────────────────────────┘ ││ │ │   │
  │  │  │                        │  │  └──────────────────────────────┘│ │ │   │
  │  │  │  ┌──────────────────┐  │  │                                 │ │ │   │
  │  │  │  │  Action Buttons  │  │  │  ┌──────────────────────────────┐│ │ │   │
  │  │  │  │                  │  │  │  │   Edges (Connections)         ││ │ │   │
  │  │  │  │  Undo / Redo     │  │  │  │   • AI Generator → Table      ││ │ │   │
  │  │  │  │  Export Design   │  │  │  │   • Data flow between nodes  ││ │ │   │
  │  │  │  │  Import Design   │  │  │  └──────────────────────────────┘│ │ │   │
  │  │  │  │  Tidy Up Layout  │  │  └────────────────────────────────┘ │ │   │
  │  │  │  │  Clear Canvas    │  │                                    │ │ │   │
  │  │  │  │  Show Preview    │  │  ┌────────────────────────────────┐│ │ │   │
  │  │  │  │  Generate ZIP    │  │  │         ReportPreview            ││ │ │   │
  │  │  │  │  Export PDF      │  │  │  (Rendered Markdown Preview)    ││ │ │   │
  │  │  │  └──────────────────┘  │  └────────────────────────────────┘│ │ │   │
  │  │  └───────────────────────────────────────────────────────────┘ │   │
  │  └───────────────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
  │    Export: ZIP        │  │    Export: PDF        │  │   Export: JSON       │
  │                      │  │                       │  │                      │
  │  • report.md         │  │  • PdfTemplate.tsx     │  │  • Full canvas state  │
  │  • evidence/         │  │  • html2pdf.js         │  │  • Node positions    │
  │    - screenshots    │  │  • Formatted PDF       │  │  • All node data     │
  │    - documents       │  │                       │  │  • Edge connections  │
  │    - attachments     │  │                       │  │                      │
  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         State Management                                  │
│                                                                          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     │
│  │  useNodesState  │────▶│  updateNodeData │────▶│  Node Data      │     │
│  │  (React Flow)   │     │  (Callback)     │     │  (Local per     │     │
│  │                 │     │                  │     │   node)        │     │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘     │
│           │                                                          │
│           ▼                                                          │
│  ┌─────────────────┐     ┌─────────────────┐                        │
│  │  useEdgesState  │     │  useHistory     │                        │
│  │  (React Flow)   │     │  (Undo/Redo)    │                        │
│  └─────────────────┘     └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
RepSec/
├── index.html                    # Entry HTML file
├── vite.config.ts               # Vite configuration (port 8080, @ alias)
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.*.json             # TypeScript configurations
├── eslint.config.js            # ESLint configuration
├── postcss.config.js           # PostCSS for Tailwind
├── components.json              # shadcn/ui component registry
├── package.json                # Dependencies and scripts
│
├── public/                      # Static assets
│   └── favicon.ico
│
└── src/
    ├── main.tsx                 # React entry point (createRoot)
    ├── App.tsx                  # Router setup with providers
    ├── App.css
    ├── index.css                # Global CSS with theme variables
    ├── vite-env.d.ts
    │
    ├── pages/
    │   ├── Index.tsx            # Renders ReportBuilderContainer
    │   └── NotFound.tsx         # 404 page
    │
    ├── components/
    │   ├── ReportBuilder.tsx   # Main orchestrator (canvas + toolbar + export)
    │   ├── ComponentToolbar.tsx # Left sidebar with draggable components
    │   ├── ReportPreview.tsx    # Live rendered Markdown preview
    │   ├── PdfTemplate.tsx      # React component for PDF generation
    │   ├── RecoveryDialog.tsx   # Auto-save recovery dialog
    │   ├── initialElements.ts   # Default canvas scaffold
    │   │
    │   ├── nodes/               # 10 custom React Flow node types
    │   │   ├── types.ts         # Shared TypeScript interfaces
    │   │   ├── TextInputNode.tsx
    │   │   ├── TableNode.tsx
    │   │   ├── VulnerabilityTableNode.tsx
    │   │   ├── CustomTableNode.tsx
    │   │   ├── CodeSnippetNode.tsx
    │   │   ├── FileUploadNode.tsx
    │   │   ├── SectionHeaderNode.tsx
    │   │   ├── LinkedStoriesNode.tsx
    │   │   ├── StepsNode.tsx
    │   │   └── AIGeneratorNode.tsx
    │   │
    │   └── ui/                 # 40+ shadcn/ui component primitives
    │       ├── button.tsx
    │       ├── input.tsx
    │       ├── textarea.tsx
    │       ├── card.tsx
    │       ├── dialog.tsx
    │       ├── tabs.tsx
    │       ├── accordion.tsx
    │       ├── table.tsx
    │       ├── form.tsx
    │       ├── label.tsx
    │       ├── sonner.tsx
    │       ├── toast.tsx
    │       ├── tooltip.tsx
    │       ├── dropdown-menu.tsx
    │       ├── radio-group.tsx
    │       ├── checkbox.tsx
    │       ├── scroll-area.tsx
    │       ├── slider.tsx
    │       ├── resizable.tsx
    │       ├── sidebar.tsx
    │       ├── chart.tsx
    │       ├── calendar.tsx
    │       └── ... (more)
    │
    ├── hooks/
    │   ├── use-mobile.tsx
    │   ├── use-toast.ts
    │   ├── useHistory.ts        # Undo/Redo history management
    │   └── useAutoSave.ts       # Auto-save persistence (future)
    │
    └── lib/
        ├── utils.ts              # cn() utility (clsx + tailwind-merge)
        ├── layout.ts            # Dagre auto-layout algorithm
        └── gemini.ts            # Gemini AI integration
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js) or [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ananthakrishnaner/RepSec.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd RepSec
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 8080 |
| `npm run build` | Production build to `dist/` folder |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## How to Use RepSec

### Basic Workflow

1. **Add Components**: Drag components from the left sidebar onto the canvas
2. **Configure Components**: Click on any component to edit its content
3. **Arrange Components**: Move components around or use "Tidy Up Layout"
4. **Preview**: Switch to the "Preview" tab to see the rendered report
5. **Export**: Generate your final report as ZIP, PDF, or JSON

### Component Details

#### Section Header
- Creates H1-H4 heading sections for report organization
- Shows live Markdown preview

#### Text Input
- **Project Name**: Top-level report title
- **Scope**: Scope of work section
- **Baselines**: Reference baselines with optional URL

#### Test Cases Table
- 8-column table: ID, Test Case, Category, Exploited, URL, Evidence, Status, Tester
- Evidence upload requires a test case ID first
- Supports drag-and-drop file paste

#### Vulnerability Table
- Document detailed vulnerabilities with:
  - Header, Description, Impact, Mitigation
  - Steps to Reproduce with screenshots and labels

#### Custom Table
- Build tables with custom headers and rows
- Per-cell file attachments

#### Code Snippet
- Syntax highlighting for multiple languages (HTTP, JSON, Python, JavaScript, etc.)
- HTTP request/response templates
- Copy to clipboard functionality

#### File Upload
- General file attachments for evidence
- Image preview support

#### Steps to Reproduce
- Numbered steps with text and image attachments
- Drag to reorder steps
- Supports paste for screenshots

#### Linked Stories
- Jira-style story linking (ID, title, URL, description)
- External link button for linked stories

#### AI Test Generator
- Connect to a Test Cases Table via an edge
- Generate security-focused test cases using Google Gemini AI
- Two modes: Focused (quick) and Comprehensive (thorough)
- **Requires API Key**: Configure in Settings (gear icon)

### Keyboard Shortcuts

| Shortcut | Action |
|---------|--------|
| `Ctrl+Z` | Undo last action |
| `Ctrl+Shift+Z` or `Ctrl+Y` | Redo |

### Export Formats

1. **Markdown ZIP** (`Generate Report Package`)
   - `report.md` — Full Markdown content
   - `evidence/` — All uploaded files

2. **PDF** (`Export PDF`)
   - Formatted PDF document
   - Auto-named based on project title

3. **JSON Design** (`Export Design`)
   - Complete canvas state for backup/resume
   - Import with `Import Design` button

## Deployment

To deploy RepSec to a hosting service:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder:**
   - **Vercel/Netlify**: Drag and drop or use CLI
   - **Traditional Server**: Upload contents to web root

3. **Server Configuration** (for SPA routing):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## License

This project is open source and available under the MIT License.
