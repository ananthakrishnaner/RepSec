import React from 'react';
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
  const generateMarkdown = (): string => {
    return `# ${reportData.projectName || 'Security Testing Report'}

## Scope of Work
${reportData.scope || 'No scope defined'}

## Baselines for Review
${reportData.baselines || 'No baselines defined'}

## Test Cases

| ID | Test Case | Category | Exploited | URL Reference | Evidence Path | Remediation Status | Tester Name |
|----|-----------|----------|-----------|---------------|---------------|-------------------|-------------|
${reportData.testCases.map(tc => 
  `| ${tc.id} | ${tc.testCase} | ${tc.category} | ${tc.exploited} | ${tc.url} | ${tc.evidence} | ${tc.remediation} | ${tc.tester} |`
).join('\n')}

## Change Description & Linked Stories
${reportData.changeDescription || 'No changes described'}

**Linked Stories:** ${reportData.linkedStories || 'None'}

## Code Snippets

${reportData.codeSnippets.map(snippet => `
### ${snippet.title}

\`\`\`${snippet.language}
${snippet.content}
\`\`\`
`).join('\n')}

## Attachments

${reportData.attachments.map(att => `- [${att.name}](${att.url}) (${att.type})`).join('\n')}

---
*Report generated on ${new Date().toLocaleDateString()}*
`;
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