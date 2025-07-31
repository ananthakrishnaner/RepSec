import React from 'react';
import { appLogger } from './LogViewer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ScrollArea } from '@/components/ui/scroll-area';
import 'highlight.js/styles/github.css';

interface ReportData {
  projectName: string;
  scope: string;
  baselines: string;
  testCases: Array<{
    id: string;
    testCase: string;
    category: string;
    exploited: string;
    url: string;
    evidence: string;
    remediation: string;
    tester: string;
  }>;
  changeDescription: string;
  linkedStories: string;
  codeSnippets: Array<{
    title: string;
    content: string;
    language: string;
  }>;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

interface ReportPreviewProps {
  reportData: ReportData;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ reportData }) => {
  appLogger.info('🖼️ ReportPreview render - received data', reportData);
  appLogger.debug('🖼️ Data object keys', Object.keys(reportData));
  
  // Debug: Show what data we actually have
  React.useEffect(() => {
    appLogger.info('🖼️ ReportPreview data changed', {
      projectName: reportData.projectName || '(empty)',
      scope: reportData.scope || '(empty)',
      hasTestCases: reportData.testCases.length > 0,
      hasCodeSnippets: reportData.codeSnippets.length > 0,
      timestamp: new Date().toISOString()
    });
  }, [reportData]);
  const generateMarkdown = (): string => {
    // Check if we have any meaningful data
    const hasData = reportData.projectName || 
                   reportData.scope || 
                   reportData.baselines || 
                   reportData.testCases.length > 0 || 
                   reportData.changeDescription || 
                   reportData.linkedStories || 
                   reportData.codeSnippets.length > 0 || 
                   reportData.attachments.length > 0;

    if (!hasData) {
      return `# Report Preview

*Start building your security report by dragging components from the sidebar.*

**Available Components:**
- Section Header: Add titles and headings
- Text Field: Add descriptions and content
- Test Cases Table: Add structured test data
- Code Snippet: Add HTTP requests/responses
- File Upload: Add attachments and evidence

Your report content will appear here as you add and fill in components.`;
    }

    let markdown = '';

    // Only add title if project name exists
    if (reportData.projectName) {
      markdown += `# ${reportData.projectName}\n\n`;
    }

    // Only add scope section if scope exists
    if (reportData.scope) {
      markdown += `## Scope of Work\n${reportData.scope}\n\n`;
    }

    // Only add baselines section if baselines exist
    if (reportData.baselines) {
      markdown += `## Baselines for Review\n${reportData.baselines}\n\n`;
    }

    // Only add test cases section if test cases exist
    if (reportData.testCases.length > 0) {
      markdown += `## Test Cases\n\n| ID | Test Case | Category | Exploited | URL Reference | Evidence Path | Remediation Status | Tester Name |\n|----|-----------|----------|-----------|---------------|---------------|-------------------|-------------|\n`;
      markdown += reportData.testCases.map(tc => 
        `| ${tc.id} | ${tc.testCase} | ${tc.category} | ${tc.exploited} | ${tc.url} | ${tc.evidence} | ${tc.remediation} | ${tc.tester} |`
      ).join('\n') + '\n\n';
    }

    // Only add change description if it exists
    if (reportData.changeDescription || reportData.linkedStories) {
      markdown += `## Change Description & Linked Stories\n`;
      if (reportData.changeDescription) {
        markdown += `${reportData.changeDescription}\n\n`;
      }
      if (reportData.linkedStories) {
        markdown += `**Linked Stories:** ${reportData.linkedStories}\n\n`;
      }
    }

    // Only add code snippets section if snippets exist
    if (reportData.codeSnippets.length > 0) {
      markdown += `## Code Snippets\n\n`;
      markdown += reportData.codeSnippets.map(snippet => `### ${snippet.title}\n\n\`\`\`${snippet.language}\n${snippet.content}\n\`\`\`\n`).join('\n') + '\n';
    }

    // Only add attachments section if attachments exist
    if (reportData.attachments.length > 0) {
      markdown += `## Attachments\n\n`;
      markdown += reportData.attachments.map(att => `- [${att.name}](${att.url}) (${att.type})`).join('\n') + '\n\n';
    }

    // Add timestamp only if we have actual content
    if (markdown && markdown !== '') {
      markdown += `---\n*Report generated on ${new Date().toLocaleDateString()}*\n`;
    }

    return markdown;
  };

  return (
    <div className="h-full bg-gradient-to-br from-background to-card/30">
      <div className="border-b border-border p-4 bg-gradient-to-r from-card/50 to-accent/20 backdrop-blur-sm">
        <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Live Preview
        </h2>
        <p className="text-sm text-muted-foreground">
          GitHub-style markdown preview of your security report
        </p>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-8 shadow-lg">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {/* Debug info to show current data state */}
              <div className="mb-4 p-3 bg-primary/5 rounded border-l-4 border-primary/30">
                <p className="text-xs text-muted-foreground">
                  <strong>Preview Status:</strong> {reportData.projectName || reportData.scope || reportData.testCases.length > 0 ? 'Showing your report content' : 'Waiting for content - drag components from sidebar and fill them out'}
                </p>
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-6">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-medium text-foreground mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-left font-semibold text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-4 py-3 text-muted-foreground hover:bg-accent/20 transition-colors duration-200">
                      {children}
                    </td>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-mono border border-primary/20">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className={className}>
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-gradient-to-br from-muted/50 to-accent/30 p-6 rounded-lg overflow-x-auto border border-border shadow-inner my-4">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-muted-foreground bg-primary/5 py-4 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 my-4 text-muted-foreground">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="hover:text-foreground transition-colors duration-200">
                      {children}
                    </li>
                  ),
                }}
              >
                {generateMarkdown()}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};