import React from 'react';
import { debugLogger } from './DebugLogger';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  debugLogger.info('PREVIEW_COMPONENT', 'ReportPreview component rendered', reportData);
  
  // Check if we have any meaningful data
  const hasData = reportData.projectName || 
                 reportData.scope || 
                 reportData.baselines || 
                 reportData.testCases.length > 0 || 
                 reportData.changeDescription || 
                 reportData.linkedStories || 
                 reportData.codeSnippets.length > 0 || 
                 reportData.attachments.length > 0;

  debugLogger.info('PREVIEW_COMPONENT', `Has meaningful data: ${hasData}`, {
    projectName: reportData.projectName || '(empty)',
    scope: reportData.scope || '(empty)',
    baselines: reportData.baselines || '(empty)',
    changeDescription: reportData.changeDescription || '(empty)',
    linkedStories: reportData.linkedStories || '(empty)',
    hasData
  });
  
  // Debug: Show what data we actually have
  React.useEffect(() => {
    debugLogger.debug('PREVIEW_COMPONENT', 'Data effect triggered', {
      projectName: reportData.projectName || '(empty)',
      scope: reportData.scope || '(empty)',
      hasTestCases: reportData.testCases.length > 0,
      hasCodeSnippets: reportData.codeSnippets.length > 0,
      hasData: hasData,
      timestamp: new Date().toISOString()
    });
  }, [reportData, hasData]);
  const renderContent = () => {
    debugLogger.debug('CONTENT_RENDER', 'Rendering content from data', reportData);
    
    const sections = [];

    // Only add content if it actually exists - no placeholders
    if (reportData.projectName) {
      sections.push(
        <h1 key="title" className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-6">
          {reportData.projectName}
        </h1>
      );
      debugLogger.debug('CONTENT_RENDER', 'Added project name to content');
    }

    if (reportData.scope) {
      sections.push(
        <div key="scope" className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">
            Scope of Work
          </h2>
          <p className="text-muted-foreground">{reportData.scope}</p>
        </div>
      );
      debugLogger.debug('CONTENT_RENDER', 'Added scope to content');
    }

    if (reportData.baselines) {
      sections.push(
        <div key="baselines" className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">
            Baselines for Review
          </h2>
          <p className="text-muted-foreground">{reportData.baselines}</p>
        </div>
      );
      debugLogger.debug('CONTENT_RENDER', 'Added baselines to content');
    }

    if (reportData.testCases.length > 0) {
      sections.push(
        <div key="testcases" className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">
            Test Cases
          </h2>
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr>
                  <th className="border border-border bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-left font-semibold text-foreground">ID</th>
                  <th className="border border-border bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-left font-semibold text-foreground">Test Case</th>
                  <th className="border border-border bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-left font-semibold text-foreground">Category</th>
                  <th className="border border-border bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-left font-semibold text-foreground">Exploited</th>
                  <th className="border border-border bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-left font-semibold text-foreground">URL Reference</th>
                  <th className="border border-border bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-left font-semibold text-foreground">Evidence Path</th>
                  <th className="border border-border bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-left font-semibold text-foreground">Remediation Status</th>
                  <th className="border border-border bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-left font-semibold text-foreground">Tester Name</th>
                </tr>
              </thead>
              <tbody>
                {reportData.testCases.map((tc, index) => (
                  <tr key={index}>
                    <td className="border border-border px-4 py-3 text-muted-foreground hover:bg-accent/20 transition-colors duration-200">{tc.id}</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground hover:bg-accent/20 transition-colors duration-200">{tc.testCase}</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground hover:bg-accent/20 transition-colors duration-200">{tc.category}</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground hover:bg-accent/20 transition-colors duration-200">{tc.exploited}</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground hover:bg-accent/20 transition-colors duration-200">{tc.url}</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground hover:bg-accent/20 transition-colors duration-200">{tc.evidence}</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground hover:bg-accent/20 transition-colors duration-200">{tc.remediation}</td>
                    <td className="border border-border px-4 py-3 text-muted-foreground hover:bg-accent/20 transition-colors duration-200">{tc.tester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (reportData.changeDescription || reportData.linkedStories) {
      sections.push(
        <div key="changes" className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">
            Change Description & Linked Stories
          </h2>
          {reportData.changeDescription && (
            <p className="text-muted-foreground mb-4">{reportData.changeDescription}</p>
          )}
          {reportData.linkedStories && (
            <p className="text-muted-foreground"><strong>Linked Stories:</strong> {reportData.linkedStories}</p>
          )}
        </div>
      );
    }

    if (reportData.codeSnippets.length > 0) {
      sections.push(
        <div key="codesnippets" className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">
            Code Snippets
          </h2>
          {reportData.codeSnippets.map((snippet, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">{snippet.title}</h3>
              <pre className="bg-gradient-to-br from-muted/50 to-accent/30 p-6 rounded-lg overflow-x-auto border border-border shadow-inner my-4">
                <code className="text-sm">{snippet.content}</code>
              </pre>
            </div>
          ))}
        </div>
      );
    }

    if (reportData.attachments.length > 0) {
      sections.push(
        <div key="attachments" className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border">
            Attachments
          </h2>
          <ul className="list-disc list-inside space-y-2 my-4 text-muted-foreground">
            {reportData.attachments.map((att, index) => (
              <li key={index} className="hover:text-foreground transition-colors duration-200">
                <a href={att.url} className="text-primary hover:underline">{att.name}</a> ({att.type})
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // If there's no content, show empty state
    if (sections.length === 0) {
      debugLogger.warn('CONTENT_RENDER', 'No content generated - showing empty state');
      return (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg font-medium mb-2">Your report preview will appear here</p>
          <p className="text-sm">Drag components from the sidebar and fill them out to see your content</p>
        </div>
      );
    }

    debugLogger.success('CONTENT_RENDER', 'Content rendered successfully', { 
      sectionCount: sections.length 
    });
    
    return sections;
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
          <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-8 shadow-lg min-h-[200px]">
            <div className="max-w-none">
              {renderContent()}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};