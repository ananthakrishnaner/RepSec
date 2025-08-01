# RepSec: Visual Security Report Builder

![RepSec Application Screenshot](https://raw.githubusercontent.com/ananthakrishnaner/RepSec/main/.github/screenshot.png) <!-- Optional: Add a screenshot to your repo in a .github folder for a great visual -->

RepSec is a modern, web-based tool designed to streamline the creation of professional security reports. It provides a visual, component-driven canvas where security professionals can drag, drop, and arrange elements to build comprehensive and well-structured reports. The final output is a portable Markdown file packaged with all associated evidence.

## ✨ Features

- **Visual Report Construction**: Drag and drop components like text blocks, tables, and code snippets onto a dynamic canvas.
- **Component-Driven Architecture**: Build reports using specialized modules:
  - **Test Case Table**: A detailed, interactive table for tracking vulnerabilities, status, and testers.
  - **Steps to Reproduce**: An ordered list component with support for text and screenshot attachments for each step.
  - **Code Snippets**: Display HTTP requests, responses, or other code blocks with syntax highlighting.
  - **File Attachments**: Upload and manage evidence files (images, documents, etc.).
  - **Linked Stories**: Connect findings to external issue trackers like Jira.
- **Live Preview**: Instantly see a rendered, GitHub-style preview of your report as you build it.
- **Auto-Layout**: A "Tidy Up" button to automatically arrange your components into a clean, logical layout.
- **Persistent Design**: Save your report layout and progress by exporting the design to a JSON file and importing it later.
- **Markdown & ZIP Export**: Generate a complete report package, including a `report.md` file and an `evidence` folder containing all uploaded files, neatly packaged in a `.zip` archive.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js) or [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)

### Local Installation & Setup

1.  **Clone the repository:**
    Open your terminal and clone the `RepSec` repository to your local machine.

    ```bash
    git clone https://github.com/ananthakrishnaner/RepSec.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd RepSec
    ```

3.  **Install dependencies:**
    This will download and install all the necessary packages for the project.

    ```bash
    npm install
    ```
    *Note: If you encounter a permission error on macOS or Linux, you may need to fix your npm permissions. **Do not use `sudo`**. Instead, run `sudo chown -R $(whoami) ~/.npm` once to fix it permanently.*

4.  **Run the development server:**
    This command starts the Vite development server, usually on `http://localhost:8080`.

    ```bash
    npm run dev
    ```

You can now open your web browser and navigate to the local URL to start using the application!

## 🔧 How to Use RepSec

The workflow is designed to be intuitive and component-based.

1.  **Select a Component**: On the left-hand sidebar, you'll find a list of available "Report Components."
2.  **Drag and Drop**: Click and drag any component from the sidebar onto the main canvas area.
3.  **Fill in the Details**: Click on a component on the canvas to edit its content.
    -   For the **Test Case Table**, you must provide an "ID" before the "Upload" button for evidence becomes active.
    -   For the **Steps to Reproduce** component, you can add, remove, and reorder steps, each with its own text and optional screenshot.
4.  **Arrange and Connect (Optional)**:
    -   Move components around freely on the canvas.
    -   Click the **"Tidy Up Layout"** button to automatically organize all components into a clean, vertical flow.
5.  **Preview Your Work**:
    -   Click the **"Show Preview"** tab at any time to see a live, rendered version of your report. Images uploaded via the `FileUpload` and `Steps` components will be visible here.
6.  **Save and Load Your Progress**:
    -   Use the **"Export Design"** button to save the entire layout and content of your canvas to a `.json` file.
    -   Use the **"Import Design"** button to load a previously saved `.json` file and continue your work.
7.  **Generate the Final Report**:
    -   When your report is complete, click the **"Generate Report Package (.zip)"** button.
    -   This will download a `.zip` file containing:
        -   `report.md`: A fully formatted Markdown file.
        -   `evidence/`: A folder containing all the files you uploaded, correctly named and referenced in the Markdown file.

## 📦 Deployment to a Hosting Server

To deploy RepSec to a hosting service like Vercel, Netlify, or your own server, you need to create a production build.

1.  **Build the project:**
    In your project's root directory, run the build command.

    ```bash
    npm run build
    ```
    This command compiles the application and creates a highly optimized, static version in a new `dist/` folder.

2.  **Deploy the `dist` folder:**
    The `dist` folder is all you need to deploy. You can:
    -   **Drag and drop** the `dist` folder into the Netlify or Vercel dashboard.
    -   **Use a CLI:** Point the `vercel` or `netlify` command-line tool to this directory.
    -   **FTP/SSH:** If using a traditional server (like Nginx or Apache), upload the *contents* of the `dist` folder to your web root (e.g., `/var/www/html`).

    **Example Nginx Configuration:**
    For a static site, you need to ensure all routes redirect to `index.html` to support client-side routing.
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

## 🛠️ Built With

-   **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Canvas/Flow**: [@xyflow/react](https://reactflow.dev/)
-   **Layout Engine**: [Dagre](https://github.com/dagrejs/dagre)
-   **ZIP Generation**: [JSZip](https://stuk.github.io/jszip/)

---
