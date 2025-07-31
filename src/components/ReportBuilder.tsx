import React, { useState, useCallback, useMemo } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Connection, Edge, Node, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportPreview } from './ReportPreview';
import { ComponentToolbar } from './ComponentToolbar';
import { TextInputNode } from './nodes/TextInputNode';
import { TableNode } from './nodes/TableNode';
import { CodeSnippetNode } from './nodes/CodeSnippetNode';
import { FileUploadNode } from './nodes/FileUploadNode';
import { SectionHeaderNode } from './nodes/SectionHeaderNode';
import { initialNodes, initialEdges } from './initialElements';

const createNodeTypes = (updateNodeData: (nodeId: string, field: string, value: any) => void) => ({
  textInput: (props: any) => <TextInputNode {...props} updateNodeData={updateNodeData} />,
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
    console.log('updateNodeData called:', nodeId, field, value);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedData = { ...node.data, [field]: value };
          
          // Update report data based on node type and field
          if (node.type === 'textInput') {
            if (nodeId === 'project-name') {
              updateReportData({ projectName: value });
            } else if (nodeId === 'scope-text') {
              updateReportData({ scope: value });
            } else if (nodeId.includes('baseline')) {
              updateReportData({ baselines: value });
            } else if (nodeId.includes('change')) {
              updateReportData({ changeDescription: value });
            } else if (nodeId.includes('stories')) {
              updateReportData({ linkedStories: value });
            }
          } else if (node.type === 'table' && field === 'testCases') {
            updateReportData({ testCases: value });
          } else if (node.type === 'codeSnippet' && field === 'codeSnippets') {
            updateReportData({ codeSnippets: value });
          } else if (node.type === 'fileUpload' && field === 'attachments') {
            updateReportData({ attachments: value });
          }

          return { ...node, data: updatedData };
        }
        return node;
      })
    );
  }, [updateReportData, setNodes]);

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
        <div className="w-80 border-r border-border bg-gradient-to-b from-card to-accent/50 backdrop-blur-sm">
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Security Report Builder
            </h2>
            <p className="text-sm text-muted-foreground">
              Drag components to build your report
            </p>
          </div>
          <ComponentToolbar />
          <div className="p-4 border-t border-border">
            <Button 
              onClick={exportMarkdown} 
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
            >
              Export Markdown
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="builder" className="h-full">
            <div className="border-b border-border bg-gradient-to-r from-card to-accent/30">
              <TabsList className="h-12 px-4 bg-transparent">
                <TabsTrigger 
                  value="builder" 
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-200"
                >
                  Report Builder
                </TabsTrigger>
                <TabsTrigger 
                  value="preview"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-200"
                >
                  Live Preview
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="builder" className="flex-1 m-0 p-0">
              <div className="h-full w-full" style={{ height: 'calc(100vh - 8rem)' }}>
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
                  className="bg-gradient-to-br from-background/50 to-card/50"
                  style={{ width: '100%', height: '100%' }}
                >
                  <Background gap={20} size={1} color="hsl(var(--border))" />
                  <Controls className="bg-card/80 backdrop-blur-sm border border-border" />
                  <MiniMap 
                    className="bg-card/80 backdrop-blur-sm border border-border" 
                    nodeColor="hsl(var(--primary))"
                    maskColor="hsl(var(--background) / 0.8)"
                  />
                </ReactFlow>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 m-0 p-0">
              <ReportPreview reportData={reportData} />
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