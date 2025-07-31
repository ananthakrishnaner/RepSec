import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Connection, Edge, Node, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportPreview } from './ReportPreview';
import { MarkdownEditor } from './MarkdownEditor';
import { ComponentToolbar } from './ComponentToolbar';
import { TextInputNode } from './nodes/TextInputNode';
import { TableNode } from './nodes/TableNode';
import { CodeSnippetNode } from './nodes/CodeSnippetNode';
import { FileUploadNode } from './nodes/FileUploadNode';
import { SectionHeaderNode } from './nodes/SectionHeaderNode';
import { initialNodes, initialEdges } from './initialElements';

const createNodeTypes = (updateNodeData: (nodeId: string, field: string, value: any) => void) => ({
  textInput: (props: any) => {
    console.log('Rendering TextInputNode with props:', props);
    return <TextInputNode {...props} updateNodeData={updateNodeData} />;
  },
  table: (props: any) => <TableNode {...props} updateNodeData={updateNodeData} />,
  codeSnippet: (props: any) => <CodeSnippetNode {...props} updateNodeData={updateNodeData} />,
  fileUpload: (props: any) => <FileUploadNode {...props} updateNodeData={updateNodeData} />,
  sectionHeader: (props: any) => <SectionHeaderNode {...props} updateNodeData={updateNodeData} />,
});

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

export const ReportBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reportData, setReportData] = useState<ReportData>({
    projectName: '',
    scope: '',
    baselines: '',
    testCases: [],
    changeDescription: '',
    linkedStories: '',
    codeSnippets: [],
    attachments: [],
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const updateReportData = useCallback((updates: Partial<ReportData>) => {
    console.log('Updating report data:', updates);
    setReportData((prev) => {
      const newData = { ...prev, ...updates };
      console.log('New report data:', newData);
      return newData;
    });
  }, []);

  const updateNodeData = useCallback((nodeId: string, field: string, value: any) => {
    console.log('🔄 updateNodeData called:', nodeId, field, value);
    
    // Immediately update report data for live preview
    if (field === 'value') {
      console.log('📝 Updating report data for node:', nodeId);
      if (nodeId === 'project-name' || nodeId.includes('project')) {
        console.log('🏷️ Setting project name:', value);
        updateReportData({ projectName: value });
      } else if (nodeId === 'scope-text' || nodeId.includes('scope')) {
        console.log('🎯 Setting scope:', value);
        updateReportData({ scope: value });
      } else if (nodeId.includes('baseline')) {
        console.log('📋 Setting baselines:', value);
        updateReportData({ baselines: value });
      } else if (nodeId.includes('change')) {
        console.log('🔄 Setting change description:', value);
        updateReportData({ changeDescription: value });
      } else if (nodeId.includes('stories')) {
        console.log('📖 Setting linked stories:', value);
        updateReportData({ linkedStories: value });
      }
    }

    // Also update the node data
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedData = { ...node.data, [field]: value };
          return { ...node, data: updatedData };
        }
        return node;
      })
    );
  }, [setNodes, updateReportData]);

  // Memoize nodeTypes to prevent React Flow warnings
  const nodeTypes = useMemo(() => createNodeTypes(updateNodeData), [updateNodeData]);

  const exportMarkdown = useCallback(() => {
    // Generate markdown content
    const markdown = generateMarkdownReport(reportData);
    
    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.projectName || 'security-report'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [reportData]);

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-card overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar with component toolbar */}
        <div className="w-80 border-r border-border/50 bg-gradient-to-b from-background via-card/30 to-primary/5 backdrop-blur-xl relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-bounce"></div>
          
          <div className="relative z-10 p-6 border-b border-border/30 bg-gradient-to-r from-background/80 to-primary/5 backdrop-blur-sm">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent-foreground bg-clip-text text-transparent mb-2 animate-fade-in">
              Security Report Builder
            </h2>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              Drag components to build your professional security report
            </p>
            <div className="mt-3 flex gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
          <ComponentToolbar />
          <div className="relative z-10 p-6 border-t border-border/30 bg-gradient-to-r from-background/50 to-transparent space-y-3">
            <Button 
              onClick={() => setActiveTab('preview')} 
              variant="outline"
              className="w-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/30 hover:border-primary/50 text-primary hover:text-primary/90 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Show Preview
            </Button>
            <Button 
              onClick={exportMarkdown} 
              className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Markdown
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-background via-background/95 to-card/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-border/30 bg-gradient-to-r from-background/90 via-card/30 to-background/90 backdrop-blur-sm">
              <TabsList className="h-14 px-6 bg-transparent gap-1">
                <TabsTrigger 
                  value="builder" 
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 font-medium px-6 py-3 rounded-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Report Builder
                </TabsTrigger>
                <TabsTrigger 
                  value="preview"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 font-medium px-6 py-3 rounded-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Preview
                </TabsTrigger>
                <TabsTrigger 
                  value="markdown"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all duration-300 font-medium px-6 py-3 rounded-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Markdown Code
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="builder" className="flex-1 m-0 p-0 animate-fade-in">
              <div className="h-full w-full relative" style={{ height: 'calc(100vh - 9rem)' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  nodeTypes={nodeTypes}
                  fitView
                  className="bg-gradient-to-br from-background/30 via-card/20 to-primary/5"
                  style={{ width: '100%', height: '100%' }}
                >
                  <Background 
                    gap={24} 
                    size={1.5} 
                    color="hsl(var(--border))" 
                    className="opacity-30" 
                  />
                  <Controls className="bg-card/90 backdrop-blur-md border border-border/50 shadow-lg rounded-lg" />
                  <MiniMap 
                    className="bg-card/90 backdrop-blur-md border border-border/50 shadow-lg rounded-lg" 
                    nodeColor="hsl(var(--primary))"
                    maskColor="hsl(var(--background) / 0.9)"
                    style={{ width: 200, height: 150 }}
                  />
                </ReactFlow>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 m-0 p-0 animate-fade-in">
              <ReportPreview reportData={reportData} />
            </TabsContent>

            <TabsContent value="markdown" className="flex-1 m-0 p-0 animate-fade-in">
              <MarkdownEditor reportData={reportData} onUpdateMarkdown={setReportData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const generateMarkdownReport = (data: ReportData): string => {
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