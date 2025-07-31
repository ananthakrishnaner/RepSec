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
    <div className="h-full bg-background">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Live Preview</h2>
        <p className="text-sm text-muted-foreground">
          GitHub-style markdown preview of your security report
        </p>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
        <div className="max-w-4xl mx-auto p-6">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                table: ({ children }) => (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2">
                    {children}
                  </td>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
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
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                    {children}
                  </pre>
                ),
              }}
            >
              {generateMarkdown()}
            </ReactMarkdown>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};