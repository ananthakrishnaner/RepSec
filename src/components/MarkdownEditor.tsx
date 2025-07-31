import React, { useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface MarkdownEditorProps {
  reportData: ReportData;
  onUpdateMarkdown: (data: ReportData) => void;
}

const generateMarkdownFromData = (data: ReportData): string => {
  return `# ${data.projectName || 'Security Testing Report'}

## Scope of Work
${data.scope || 'No scope defined'}

## Baselines for Review
${data.baselines || 'No baselines defined'}

## Test Cases

| ID | Test Case | Category | Exploited | URL Reference | Evidence Path | Remediation Status | Tester Name |
|----|-----------|----------|-----------|---------------|---------------|-------------------|-------------|
${data.testCases.map(tc => 
  `| ${tc.id} | ${tc.testCase} | ${tc.category} | ${tc.exploited} | ${tc.url} | ${tc.evidence} | ${tc.remediation} | ${tc.tester} |`
).join('\n')}

## Change Description & Linked Stories
${data.changeDescription || 'No changes described'}

**Linked Stories:** ${data.linkedStories || 'None'}

## Code Snippets

${data.codeSnippets.map(snippet => `
### ${snippet.title}

\`\`\`${snippet.language}
${snippet.content}
\`\`\`
`).join('\n')}

## Attachments

${data.attachments.map(att => `- [${att.name}](${att.url}) (${att.type})`).join('\n')}

---
*Report generated on ${new Date().toLocaleDateString()}*
`;
};

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ reportData, onUpdateMarkdown }) => {
  const [markdownContent, setMarkdownContent] = useState(() => generateMarkdownFromData(reportData));
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleCopyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(markdownContent);
    toast({
      title: "Copied to clipboard",
      description: "Markdown content has been copied to your clipboard.",
    });
  }, [markdownContent, toast]);

  const handleDownloadMarkdown = useCallback(() => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.projectName || 'security-report'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your markdown file is being downloaded.",
    });
  }, [markdownContent, reportData.projectName, toast]);

  const handleRefreshFromData = useCallback(() => {
    const newMarkdown = generateMarkdownFromData(reportData);
    setMarkdownContent(newMarkdown);
    toast({
      title: "Refreshed from data",
      description: "Markdown content has been updated from the current report data.",
    });
  }, [reportData, toast]);

  // Update markdown when reportData changes (but only when not editing)
  React.useEffect(() => {
    if (!isEditing) {
      setMarkdownContent(generateMarkdownFromData(reportData));
    }
  }, [reportData, isEditing]);

  return (
    <div className="h-full bg-gradient-to-br from-background to-card/30">
      <div className="border-b border-border/30 p-6 bg-gradient-to-r from-card/50 to-accent/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Markdown Editor
            </h2>
            <p className="text-sm text-muted-foreground/80 mt-1">
              Edit your security report in raw markdown or preview the formatted output
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefreshFromData}
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 border-primary/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleCopyMarkdown}
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 border-primary/20"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={handleDownloadMarkdown}
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <Tabs defaultValue="editor" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger 
              value="editor" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-200"
              onClick={() => setIsEditing(true)}
            >
              Raw Markdown
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-200"
              onClick={() => setIsEditing(false)}
            >
              Formatted Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="flex-1 mt-0">
            <Card className="h-full p-0 bg-gradient-to-br from-card/50 to-accent/10 border-border/50">
              <Textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                className="w-full h-full min-h-[600px] p-6 border-0 resize-none bg-transparent font-mono text-sm leading-relaxed focus:ring-0 focus:border-transparent"
                placeholder="Enter your markdown content here..."
                style={{ height: 'calc(100vh - 16rem)' }}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="preview" className="flex-1 mt-0">
            <Card className="h-full bg-gradient-to-br from-card/50 to-accent/10 border-border/50">
              <ScrollArea className="h-full">
                <div className="p-8">
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
                          return <code className={className}>{children}</code>;
                        },
                        pre: ({ children }) => (
                          <pre className="bg-gradient-to-br from-muted/50 to-accent/30 p-6 rounded-lg overflow-x-auto border border-border shadow-inner my-4">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};